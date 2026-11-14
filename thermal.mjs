import { fromUrl } from 'geotiff';
import proj4 from 'proj4';

const approvedHosts = new Set(['data.lpdaac.earthdatacloud.nasa.gov','data.earthdata.nasa.gov']);
function asset(entry, band) {
  return entry.links?.map(link => {
    try { return new URL(link.href); } catch { return null; }
  }).find(url => url && url.protocol === 'https:' && approvedHosts.has(url.hostname) &&
    !url.username && !url.password && !url.port && new RegExp('_'+band+'\\.tif$','i').test(url.pathname));
}
function projection(image) {
  const keys=image.getGeoKeys(), epsg=keys.ProjectedCSTypeGeoKey;
  if(keys.GeographicTypeGeoKey===4326&&!epsg)return 'EPSG:4326';
  if(epsg>=32601&&epsg<=32660)return '+proj=utm +zone='+(epsg-32600)+' +datum=WGS84 +units=m';
  if(epsg>=32701&&epsg<=32760)return '+proj=utm +south +zone='+(epsg-32700)+' +datum=WGS84 +units=m';
  throw Error('Unsupported raster coordinate system');
}

export async function sampleThermal(entries, field, token) {
  if(!token)return { configurationRequired:true };
  for(const entry of entries.slice(0,3)){
    const lst=asset(entry,'LST'), cloud=asset(entry,'cloud(?:_mask)?'), qc=asset(entry,'QC'), water=asset(entry,'water(?:_mask)?');
    if(!lst||!cloud||!qc||!water)continue;
    try {
      const controller=AbortSignal.timeout(7000);
      const options={headers:{Authorization:'Bearer '+token},allowFullFile:false,maxRanges:0};
      const files=await Promise.all([lst,cloud,qc,water].map(url=>fromUrl(url.href,options,controller)));
      const images=await Promise.all(files.map(f=>f.getImage()));
      const primary=images[0], reference=projection(primary), [left,top]=primary.getOrigin(), [dx,dy]=primary.getResolution();
      if(!dx||!dy||images.some(image=>image.getWidth()!==primary.getWidth()||image.getHeight()!==primary.getHeight()||image.getOrigin().slice(0,2).some((value,i)=>Math.abs(value-[left,top][i])>1e-6)||image.getResolution().slice(0,2).some((value,i)=>Math.abs(value-[dx,dy][i])>1e-6)))continue;
      const [x,y]=proj4('EPSG:4326',reference,[field.lon,field.lat]);
      const col=Math.floor((x-left)/dx),row=Math.floor((y-top)/dy);
      if(col<0||row<0||col>=primary.getWidth()||row>=primary.getHeight())continue;
      const window=[Math.max(0,col-5),Math.max(0,row-5),Math.min(primary.getWidth(),col+6),Math.min(primary.getHeight(),row+6)];
      const [temps,masks,quality,waters]=await Promise.all(images.map(image=>image.readRasters({window,samples:[0],interleave:true,signal:controller})));
      const points=[],width=window[2]-window[0],nodata=primary.getGDALNoData();
      for(let i=0;i<temps.length;i++){
        if(masks[i]!==0||waters[i]!==0||quality[i]!==0||!Number.isFinite(temps[i])||temps[i]===nodata)continue;
        // The V003 catalogue documents 0.02 K per encoded unit.
        // Accept physical Kelvin when the provider has already applied the scale.
        const kelvin=temps[i]>=7500?temps[i]*.02:temps[i];
        if(kelvin<200||kelvin>385)continue;
        const px=left+(window[0]+(i%width)+.5)*dx,py=top+(window[1]+Math.floor(i/width)+.5)*dy;
        const [lon,lat]=proj4(reference,'EPSG:4326',[px,py]);
        points.push({lat,lon,celsius:Math.round((kelvin-273.15)*10)/10});
      }
      if(points.length)return {observation:entry.time_start,granule:entry.producer_granule_id??entry.title,points,sampled:temps.length};
    }catch(error){console.warn('Thermal raster:',error.message);}
  }
  return { unavailable:true };
}
