import { sampleThermal } from './thermal.mjs';

const day = 86400000;
const hour = 3600000;
const now = () => Date.now();
const ymd = ms => new Date(ms).toISOString().slice(0, 10);
const compact = ms => ymd(ms).replaceAll('-', '');
const valid = value => Number.isFinite(value) && value !== -999;
const CMR = 'https://cmr.earthdata.nasa.gov/search/granules.json';
const POWER = 'https://power.larc.nasa.gov/api/temporal/daily/point';

export const catalog = {
  ecostress: { product: 'ECO_L2T_LSTE', version: '003', days: 30, title: 'ECOSTRESS LST · 70 m' },
  et: { product: 'ECO_L3T_JET', version: '002', days: 30, title: 'ECOSTRESS ET · 70 m' },
  smapCatalog: { product: 'SPL3SMP_E', version: '006', days: 15, title: 'SMAP L3 surface moisture' },
  landsat: { product: 'HLSL30', version: '2.0', days: 40, title: 'Harmonized Landsat L30' },
  sentinel: { product: 'HLSS30', version: '2.0', days: 30, title: 'Harmonized Sentinel-2 S30' },
  modis: { product: 'MOD13Q1', version: '061', days: 45, title: 'MODIS vegetation indices' },
  viirs: { product: 'VNP13A1', version: '002', days: 45, title: 'VIIRS vegetation indices' },
  gpm: { product: 'GPM_3IMERGDL', version: '07', days: 10, title: 'GPM IMERG Late precipitation' },
  srtm: { product: 'SRTMGL1', version: '003', title: 'SRTM elevation' },
  gldas: { product: 'GLDAS_NOAH025_3H', version: '2.1', days: 60, title: 'GLDAS land surface model' },
  gedi: { product: 'GEDI02_A', version: '002', days: 120, title: 'GEDI canopy height' },
  grace: { product: 'TELLUS_GRAC-GRFO_MASCON_CRI_GRID_RL06.3_V4', title: 'GRACE/GRACE-FO water storage' }
};

export const external = [
  ['FAO GAEZ','https://gaez.fao.org/','global'],
  ['ERA5','https://cds.climate.copernicus.eu/','global'],
  ['USDA Ag Data Commons','https://agdatacommons.nal.usda.gov/','us'],
  ['Web Soil Survey / SSURGO','https://websoilsurvey.nrcs.usda.gov/','us'],
  ['CropScape CDL','https://nassgeodata.gmu.edu/CropScape/','us'],
  ['PRISM','https://prism.oregonstate.edu/','us'],
  ['NAIP','https://www.usgs.gov/centers/eros/science/usgs-eros-archive-aerial-photography-national-agriculture-imagery-program-naip','us'],
  ['NLCD','https://www.usgs.gov/centers/eros/science/national-land-cover-database','us'],
  ['NLDAS','https://ldas.gsfc.nasa.gov/nldas','us'],
  ['CoCoRaHS','https://www.cocorahs.org/','na'],
  ['USGS water data','https://waterdata.usgs.gov/','us'],
  ['USDA Market News','https://www.ams.usda.gov/market-news','us'],
  ['USDA NASS Quick Stats','https://quickstats.nass.usda.gov/','us'],
  ['OpenET','https://openetdata.org/','us'],
  ['LANDFIRE','https://www.landfire.gov/','us']
];

async function request(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(10000), headers: { Accept: 'application/json' } });
  if (!response.ok) throw Error('Upstream status ' + response.status);
  return response.json();
}

export function makeEarth(query, config = {}) {
  const pending = new Map();
  async function cache(key, ttl, load) {
    const [row] = await query('SELECT stamp,payload FROM earth WHERE key=?', [key]);
    if (row && now() - Number(row.stamp) < ttl) return { ...JSON.parse(row.payload), checkedAt: Number(row.stamp) };
    if (pending.has(key)) return pending.get(key);
    const work = (async () => {
      try {
        const payload = await load();
        const stamp = now();
        await query('INSERT INTO earth(key,stamp,payload) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET stamp=excluded.stamp,payload=excluded.payload', [key, stamp, JSON.stringify(payload)]);
        return { ...payload, checkedAt: stamp };
      } catch (error) {
        console.warn('Earth feed:', key.split(':')[0], error.message);
        return row ? { ...JSON.parse(row.payload), checkedAt: Number(row.stamp), stale: true } : { unavailable: true };
      }
    })();
    pending.set(key, work);
    try { return await work; } finally { pending.delete(key); }
  }

  function series(kind, field) {
    return cache(kind+':'+field.lat.toFixed(3)+':'+field.lon.toFixed(3), (kind==='smap'?48:12)*hour, async () => {
      const params = kind === 'smap' ? (config.SMAP_POWER_PARAMETERS||'SFMC_SMAP,RZMC_SMAP').split(',') : ['T2M_MAX','RH2M','PRECTOTCORR','ALLSKY_SFC_SW_DWN'];
      const url = new URL(POWER);
      const options = { parameters: params.join(','), community:'AG', latitude:field.lat, longitude:field.lon,
        start:compact(now()-60*day),end:compact(now()-3*day),format:'JSON','time-standard':'UTC' };
      url.search = new URLSearchParams(options);
      const data = (await request(url)).properties?.parameter;
      if (!data) throw Error('No daily parameters');
      const keys = params.filter(key=>Object.hasOwn(data,key));
      if (!keys.length) throw Error('No product values');
      const dates = Object.keys(data[keys[0]]??{}).filter(d=>/^\d{8}$/.test(d)).sort();
      const rows = dates.map(d=>({ date:d.replace(/^(....)(..)(..)$/, '$1-$2-$3'), values: keys.map(key=>valid(data[key]?.[d])?data[key][d]:null) })).filter(r=>r.values.some(v=>v!==null));
      if (!rows.length) throw Error('No valid data');
      return { keys, rows, observation: rows.at(-1).date };
    });
  }

  function forecast(field) {
    return cache('forecast:'+field.lat.toFixed(3)+':'+field.lon.toFixed(3),hour,async()=>{
      const url=new URL('https://api.open-meteo.com/v1/forecast');
      const keys=['temperature_2m_max','precipitation_sum','et0_fao_evapotranspiration'];
      url.search=new URLSearchParams({latitude:field.lat,longitude:field.lon,daily:keys.join(','),timezone:'auto',forecast_days:5});
      const data=(await request(url)).daily;
      if(!Array.isArray(data?.time))throw Error('No forecast returned');
      const rows=data.time.map((date,i)=>({date,values:keys.map(key=>valid(data[key]?.[i])?data[key][i]:null)}));
      if(!rows.some(row=>row.values.some(value=>value!==null)))throw Error('No forecast values');
      return {rows,keys};
    });
  }

  async function granules(kind, field) {
    const item = catalog[kind];
    const url = new URL(CMR);
    url.search = new URLSearchParams({ short_name:item.product, point:field.lon+','+field.lat, page_size:'5', sort_key:'-start_date' });
    if (item.version) url.searchParams.set('version',item.version);
    if (item.days) url.searchParams.set('temporal',ymd(now()-item.days*day)+'T00:00:00Z,');
    const entries = (await request(url)).feed?.entry;
    if (!Array.isArray(entries)) throw Error('No granule response');
    return entries;
  }

  function scenes(kind, field) {
    return cache(kind+':'+field.lat.toFixed(4)+':'+field.lon.toFixed(4), 12*hour, async () => {
      const entries = await granules(kind,field);
      return { rows:entries.map(entry=>({ id:entry.id, title:entry.producer_granule_id??entry.title, time:entry.time_start,
        url:'https://search.earthdata.nasa.gov/search/granules?p='+encodeURIComponent(entry.collection_concept_id??'') })) };
    });
  }

  function thermal(field) {
    if(!config.EARTHDATA_TOKEN)return Promise.resolve({configurationRequired:true});
    return cache('thermal:'+field.lat.toFixed(4)+':'+field.lon.toFixed(4),12*hour,async()=>{
      const result=await sampleThermal(await granules('ecostress',field),field,config.EARTHDATA_TOKEN);
      if(result.unavailable)throw Error('No usable clear-sky raster sample');
      return result;
    });
  }

  async function refreshSmap({timeBudgetMs=Infinity}={}) {
    const deadline=now()+timeBudgetMs;
    const rows = await query('SELECT payload FROM fields');
    const distinct = new Map(rows.map(({payload})=>{const field=JSON.parse(payload);return [field.lat.toFixed(3)+':'+field.lon.toFixed(3),field];}));
    const points=[...distinct.values()];
    for(let i=0;i<points.length&&now()<deadline;i+=4)await Promise.all(points.slice(i,i+4).map(async field=>{
      await Promise.all([series('smap',field),scenes('smapCatalog',field)]);
    }));
  }
  return { series, scenes, thermal, forecast, refreshSmap };
}

