import { env } from 'cloudflare:workers';
import { httpServerHandler } from 'cloudflare:node';
import { makeApp } from '../app.mjs';
import { makeEarth } from '../earth.mjs';
import { assets } from './assets.generated.mjs';

const query = async (sql, args = []) => {
  const statement = env.DB.prepare(sql).bind(...args);
  if (/^SELECT\b/i.test(sql)) return (await statement.all()).results;
  await statement.run();
  return [];
};

const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; connect-src 'self' https://api.open-meteo.com; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://server.arcgisonline.com https://*.tile.openstreetmap.org https://tile.openstreetmap.org https://gibs.earthdata.nasa.gov; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer'
};

const app = makeApp({ query, prod:true, config:env });
app.listen(3000);
const api = httpServerHandler({ port:3000 });

export function staticResponse(request, asset) {
  const data = Buffer.from(asset.base64, 'base64');
  const headers = new Headers({ ...securityHeaders, 'Content-Type':asset.mime, 'Accept-Ranges':'bytes', 'Cache-Control':'no-cache' });
  const range = request.headers.get('Range');
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    const start = match?.[1] ? Number(match[1]) : Math.max(0, data.length - Number(match?.[2]));
    const end = match?.[1] && match?.[2] ? Math.min(data.length - 1, Number(match[2])) : data.length - 1;
    if (!match || (!match[1] && !match[2]) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= data.length || end < start) {
      headers.set('Content-Range','bytes */'+data.length);
      return new Response(null,{status:416,headers});
    }
    headers.set('Content-Range','bytes '+start+'-'+end+'/'+data.length);
    headers.set('Content-Length',String(end-start+1));
    return new Response(request.method==='HEAD'?null:data.slice(start,end+1),{status:206,headers});
  }
  headers.set('Content-Length',String(data.length));
  return new Response(request.method==='HEAD'?null:data,{headers});
}

export default {
  fetch(request, bindings, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) return api.fetch(request,bindings,ctx);
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response(null,{status:405});
    const route = url.pathname === '/' ? '/index.html' : url.pathname;
    if (!Object.hasOwn(assets,route)) return new Response('Page not found',{status:404});
    return staticResponse(request,assets[route]);
  },
  scheduled(_event,_bindings,ctx) {
    ctx.waitUntil(makeEarth(query,env).refreshSmap());
  }
};
