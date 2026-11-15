import { fromCustomClient } from 'geotiff';
import proj4 from 'proj4';

const approvedHosts = new Set(['data.lpdaac.earthdatacloud.nasa.gov','data.earthdata.nasa.gov']);
function asset(entry, band) {
  return entry.links?.map(link => {
    try { return new URL(link.href); } catch { return null; }
  }).find(url => url && url.protocol === 'https:' && approvedHosts.has(url.hostname) &&
    !url.username && !url.password && !url.port && new RegExp('_'+band+'\\.tif$','i').test(url.pathname));
}
async function openRaster(url, token, signal, outcome) {
  return fromCustomClient({
    async request({ headers }) {
      const response = await fetch(url, { headers, signal });
      // The protected data gate can redirect to Earthdata Login or return an
      // access error when this account has not approved the data application.
      if (response.status === 401 || response.status === 403 ||
          new URL(response.url).hostname === 'urs.earthdata.nasa.gov') {
        outcome.accessDenied=true;
        await response.body?.cancel();
        throw new Error('Earthdata download access denied');
      }
      if (response.status !== 206) {
        await response.body?.cancel();
        throw new Error('Unexpected raster range response: ' + response.status);
      }
      return {
        ok: response.ok, status: response.status,
        getHeader: key => response.headers.get(key) ?? undefined,
        getData: () => response.arrayBuffer()
      };
    }
  }, {
    headers: { Authorization: 'Bearer ' + token },
    blockSize: 65536, cacheSize: 24, allowFullFile: false
  }, signal);
}

function projection(image) {
  const keys=image.getGeoKeys(), epsg=keys.ProjectedCSTypeGeoKey;
  if(keys.GeographicTypeGeoKey===4326&&!epsg)return 'EPSG:4326';
  if(epsg>=32601&&epsg<=32660)return '+proj=utm +zone='+(epsg-32600)+' +datum=WGS84 +units=m';
  if(epsg>=32701&&epsg<=32760)return '+proj=utm +south +zone='+(epsg-32700)+' +datum=WGS84 +units=m';
  throw Error('Unsupported raster coordinate system');
}

export function clearLandTemperature(raw, cloud, water, qc, nodata) {
  if (cloud !== 0 || water !== 0 || !Number.isInteger(qc) || qc < 0 || qc > 65535 ||
      !Number.isFinite(raw) || raw === nodata) return null;
  // NASA's Level 2 ATBD, table 8: bits 0–1 describe the retrieval and bits
  // 2–3 describe input quality. The other bits need not be zero.
  if ((qc & 0b1111) !== 0) return null;
  const kelvin = raw >= 7500 ? raw * 0.02 : raw;
  return kelvin >= 200 && kelvin <= 385 ? Math.round((kelvin - 273.15) * 10) / 10 : null;
}

export async function sampleThermal(entries, field, token) {
  if(!token)return { configurationRequired:true };
  let reason='noUsablePixels';
  for(const entry of entries.slice(0,3)){
    const lst=asset(entry,'LST'), cloud=asset(entry,'cloud(?:_mask)?'), qc=asset(entry,'QC'), water=asset(entry,'water(?:_mask)?');
    if(!lst||!cloud||!qc||!water)continue;
    const controller=AbortSignal.timeout(12000);
    const outcome={accessDenied:false};
    try {
      const opened=await Promise.allSettled([lst,cloud,qc,water].map(async url=>{
        const file=await openRaster(url.href,token,controller,outcome);
        return file.getImage();
      }));
      const failed=opened.find(result=>result.status==='rejected');
      if(failed)throw failed.reason;
      const images=opened.map(result=>result.value);
      const primary=images[0], reference=projection(primary), [left,top]=primary.getOrigin(), [dx,dy]=primary.getResolution();
      if(!dx||!dy||images.some(image=>image.getWidth()!==primary.getWidth()||image.getHeight()!==primary.getHeight()||image.getOrigin().slice(0,2).some((value,i)=>Math.abs(value-[left,top][i])>1e-6)||image.getResolution().slice(0,2).some((value,i)=>Math.abs(value-[dx,dy][i])>1e-6)))continue;
      const [x,y]=proj4('EPSG:4326',reference,[field.lon,field.lat]);
      const col=Math.floor((x-left)/dx),row=Math.floor((y-top)/dy);
      if(col<0||row<0||col>=primary.getWidth()||row>=primary.getHeight())continue;
      const window=[Math.max(0,col-5),Math.max(0,row-5),Math.min(primary.getWidth(),col+6),Math.min(primary.getHeight(),row+6)];
      const [temps,masks,quality,waters]=await Promise.all(images.map(image=>image.readRasters({window,samples:[0],interleave:true,signal:controller})));
      const points=[],width=window[2]-window[0],nodata=primary.getGDALNoData();
      for(let i=0;i<temps.length;i++){
        const celsius=clearLandTemperature(temps[i],masks[i],waters[i],quality[i],nodata);
        if(celsius===null)continue;
        const px=left+(window[0]+(i%width)+.5)*dx,py=top+(window[1]+Math.floor(i/width)+.5)*dy;
        const [lon,lat]=proj4(reference,'EPSG:4326',[px,py]);
        points.push({lat,lon,celsius});
      }
      if(points.length)return {observation:entry.time_start,granule:entry.producer_granule_id??entry.title,points,sampled:temps.length};
    }catch{
      if(outcome.accessDenied)return {unavailable:true,reason:'earthdataAuthorization'};
      reason=controller.aborted?'downloadTimeout':'rasterDownloadFailed';
      console.warn('Thermal raster:',reason);
    }
  }
  return { unavailable:true,reason };
}
