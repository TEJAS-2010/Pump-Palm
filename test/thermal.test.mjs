import assert from 'node:assert/strict';
import test from 'node:test';
import { sampleThermal, clearLandTemperature } from '../thermal.mjs';

test('reports Earthdata authorization failures separately from empty scenes', async t => {
  const links = ['LST', 'cloud', 'QC', 'water'].map(band => ({
    href: 'https://data.lpdaac.earthdatacloud.nasa.gov/sample_' + band + '.tif'
  }));
  const field = { lat: 25.54, lon: 55.59 };
  const rangeRequests = t.mock.method(globalThis, 'fetch', async (url, { headers }) => {
    assert.match(headers.Range, /^bytes=0-/);
    assert.equal(headers.Authorization, 'Bearer test-token');
    return new Response(null, { status: 403 });
  });
  assert.deepEqual(await sampleThermal([{ links }], field, 'test-token'), {
    unavailable: true, reason: 'earthdataAuthorization'
  });
  assert.ok(rangeRequests.mock.callCount() >= 4);
  assert.deepEqual(await sampleThermal([], field, 'test-token'), {
    unavailable: true, reason: 'noUsablePixels'
  });
});


test('uses the ECOSTRESS retrieval and input quality bits while excluding cloud, water, and fill', () => {
  assert.equal(clearLandTemperature(15000, 0, 0, 0b1110000001000000, 0), 26.9);
  assert.equal(clearLandTemperature(15000, 0, 0, 0b1110000001000010, 0), null);
  assert.equal(clearLandTemperature(15000, 0, 0, 0b1110000001000100, 0), null);
  assert.equal(clearLandTemperature(15000, 1, 0, 0, 0), null);
  assert.equal(clearLandTemperature(15000, 0, 1, 0, 0), null);
  assert.equal(clearLandTemperature(0, 0, 0, 0, 0), null);
});
