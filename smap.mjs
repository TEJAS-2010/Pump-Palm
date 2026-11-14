import Blosc from 'numcodecs/blosc';

const archive = 'https://nasa-power-smap.s3.amazonaws.com/smap/temporal/power_smap_daily_temporal_utc.zarr/';
const epoch = Date.UTC(2015, 2, 31);
const day = 86400000;
const keys = ['SFMC', 'RZMC'];
let grid;

async function get(path) {
  const response = await fetch(archive + path, { signal: AbortSignal.timeout(9000) });
  if (!response.ok) throw Error('SMAP archive HTTP ' + response.status);
  return response;
}

async function chunk(path, spec) {
  const bytes = new Uint8Array(await (await get(path)).arrayBuffer());
  const decoded = await Blosc.fromConfig(spec.compressor).decode(bytes);
  return new DataView(decoded.buffer, decoded.byteOffset, decoded.byteLength);
}

async function readGrid() {
  const { metadata } = await (await get('.zmetadata')).json();
  const [lat, lon, time] = await Promise.all(['lat', 'lon', 'time'].map(key => chunk(key + '/0', metadata[key + '/.zarray'])));
  if (metadata['time/.zattrs']?.units !== 'days since 2015-03-31 00:00:00') throw Error('Unexpected SMAP time reference');
  return { metadata, lat, lon, time };
}

function nearest(axis, point) {
  let pick = 0;
  for (let i = 1; i < axis.byteLength / 8; i++) {
    if (Math.abs(axis.getFloat64(i * 8, true) - point) < Math.abs(axis.getFloat64(pick * 8, true) - point)) pick = i;
  }
  return pick;
}

async function readBand(metadata, key, y, x, first, last) {
  const spec = metadata[key + '/.zarray'];
  if (spec.dtype !== '<f4' || spec.order !== 'C' || spec.filters?.length !== 1 ||
      spec.filters[0].id !== 'fixedscaleoffset') throw Error('Unexpected SMAP encoding');
  const { scale, offset } = spec.filters[0];
  const [days, height, width] = spec.chunks;
  const values = new Map();
  for (let i = Math.floor(last / days); i >= Math.floor(first / days); i--) {
    const buffer = await chunk([key, [i, Math.floor(y / height), Math.floor(x / width)].join('.')].join('/'), spec);
    for (let j = Math.max(first, i * days); j <= Math.min(last, (i + 1) * days - 1); j++) {
      const index = ((j % days) * height + y % height) * width + x % width;
      const raw = buffer.getFloat32(index * 4, true);
      const value = raw / scale + offset;
      if (Number.isFinite(value) && value >= 0 && value <= .9) values.set(j, Math.round(value * 1000) / 1000);
    }
  }
  return values;
}

export async function archivedSmap(field, end = Date.now()) {
  if (Math.abs(field.lat) > 84.66) throw Error('Outside SMAP coverage');
  if (!grid) grid = readGrid().catch(error => { grid = undefined; throw error; });
  const { metadata, lat, lon, time } = await grid;
  const y = nearest(lat, field.lat), x = nearest(lon, field.lon);
  let last = time.byteLength / 8 - 1;
  const stamp = index => epoch + Number(time.getBigInt64(index * 8, true)) * day;
  while (last >= 0 && stamp(last) > end) last--;
  if (last < 0) throw Error('Outside SMAP date coverage');
  const first = Math.max(0, last - 119);
  const bands = await Promise.all(keys.map(key => readBand(metadata, key, y, x, first, last)));
  const rows = [];
  for (let i = first; i <= last; i++) {
    const values = bands.map(band => band.get(i) ?? null);
    if (values.some(value => value !== null)) rows.push({ date: new Date(stamp(i)).toISOString().slice(0, 10), values });
  }
  if (!rows.length) throw Error('No valid SMAP grid-cell observations');
  return { keys, rows: rows.slice(-60), observation: rows.at(-1).date, archived: end - Date.parse(rows.at(-1).date) > 7 * day };
}
