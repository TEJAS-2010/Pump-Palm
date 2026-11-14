import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../public/field-estimates.js', import.meta.url), 'utf8');
const { areaM2, weatherReference } = runInNewContext(source + '\nfieldEstimates');

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
