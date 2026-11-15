import assert from 'node:assert/strict';
import test from 'node:test';
import { sampleThermal } from '../thermal.mjs';

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
