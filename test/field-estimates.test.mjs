import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../public/field-estimates.js', import.meta.url), 'utf8');
const { areaM2, weatherReference, rotationFit, measurementStatus, thermalSignal } = runInNewContext(source + '\nfieldEstimates');

test('field boundary area and complete weather-derived reference demand', () => {
  assert.equal(areaM2([]), null);
  const area = areaM2([[0, 179.999], [0, -180], [0.001, -180], [0.001, 179.999]]);
  assert.ok(Math.abs(area - 12364) < 2);
  const forecast = Array.from({ length: 5 }, () => ({ values: [32, 0, 4] }));
  assert.equal(weatherReference(forecast, null).mm, 20);
  assert.equal(weatherReference(forecast, null).litres, null);
  assert.equal(weatherReference(forecast, 1000).litres, 20000);
  assert.equal(weatherReference(forecast.slice(1), area), null);
  forecast[0].values[2] = null;
  assert.equal(weatherReference(forecast, area), null);
});

test('rotation comparison respects the budget, selected priority, and local crop coverage', () => {
  const example = { budget: 500, base: 480, legume: 430, mixed: 360 };
  assert.equal(rotationFit({ ...example, priority: 'water' }, true).first, 'mixed');
  assert.equal(rotationFit({ ...example, priority: 'cover' }, true).first, 'legume');
  assert.equal(rotationFit({ ...example, priority: 'harvest' }, true).first, 'base');
  assert.equal(rotationFit({ ...example, budget: 400, priority: 'cover' }, true).first, 'mixed');
  assert.equal(rotationFit({ ...example, budget: 359, priority: 'water' }, true).fit.length, 0);
  assert.equal(rotationFit({ ...example, priority: 'water' }, false).first, 'base');
  assert.equal(rotationFit({ ...example, budget: null, priority: 'water' }, true).fit.length, 0);
});

test('warnings use only the latest recent measurement of the same kind', () => {
  const now = Date.parse('2026-11-15T13:00:00Z');
  const rows = [
    { timestamp: '2026-11-15T12:55:00Z', wetness_index: 17, ecw_dsm: 12 },
    { timestamp: '2026-11-15T12:54:00Z', moisture_pct: 15, soil_ec_dsm: 6 }
  ];
  assert.equal(measurementStatus(rows, 'moisture_pct', 17, 30, now).state, 'low');
  assert.equal(measurementStatus(rows, 'moisture_pct', 10, 13, now).state, 'high');
  assert.equal(measurementStatus(rows, 'moisture_pct', 15, 30, now).state, 'within');
  assert.equal(measurementStatus(rows, 'soil_ec_dsm', null, 5, now).state, 'high');
  assert.equal(measurementStatus(rows.slice(0, 1), 'soil_ec_dsm', null, 5, now).state, 'missing');
  assert.equal(measurementStatus(rows.slice(0, 1), 'moisture_pct', 17, 30, now).state, 'missing');
  assert.equal(measurementStatus(rows, 'soil_ec_dsm', null, null, now).state, 'limits');
  assert.equal(measurementStatus(rows, 'soil_ec_dsm', null, 5, now + 3600000).state, 'old');
});

test('only recent, usable thermal observations can support a current surface heat alert', () => {
  const observation = '2026-11-12T13:00:00Z';
  const now = Date.parse('2026-11-15T13:00:00Z');
  const result = { observation, points: [{ celsius: 42 }, { celsius: 55 }, { celsius: null }] };
  const signal = thermalSignal(result, 50, now);
  assert.equal(signal.fresh, true);
  assert.equal(signal.hot, 1);
  assert.equal(signal.count, 2);
  assert.equal(thermalSignal(result, null, now).hot, null);
  assert.equal(thermalSignal(result, 50, now + 1).fresh, false);
  assert.equal(thermalSignal({ ...result, stale: true }, 50, now).fresh, false);
  assert.equal(thermalSignal({ points: [{ celsius: null }] }, 50, now), null);
});
