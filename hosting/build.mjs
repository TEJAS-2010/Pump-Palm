import { build } from 'esbuild';
import { readdir, readFile, mkdir, writeFile, copyFile, rm } from 'node:fs/promises';

const assets = {};
const mime = { html:'text/html; charset=utf-8', css:'text/css; charset=utf-8', js:'text/javascript; charset=utf-8', json:'application/json', svg:'image/svg+xml', png:'image/png', webp:'image/webp', jpeg:'image/jpeg', mp4:'video/mp4' };
async function collect(directory, prefix) {
  for (const entry of await readdir(directory,{withFileTypes:true})) {
    const file=directory+'/'+entry.name, route=prefix+'/'+entry.name;
    if (entry.isDirectory()) await collect(file,route);
    else if (mime[entry.name.split('.').at(-1)]) await add(file,route);
  }
}
async function add(file, route) {
  assets[route] = { mime:mime[file.split('.').at(-1)], base64:(await readFile(file)).toString('base64') };
}
await collect('public','');
await add('node_modules/leaflet/dist/leaflet.js','/vendor/leaflet/leaflet.js');
await add('node_modules/leaflet/dist/leaflet.css','/vendor/leaflet/leaflet.css');
await collect('node_modules/leaflet/dist/images','/vendor/leaflet/images');
await writeFile('hosting/assets.generated.mjs','export const assets = '+JSON.stringify(assets)+';\n');
try {
  await rm('dist',{recursive:true,force:true});
  await mkdir('dist/.openai',{recursive:true});
  await copyFile('.openai/hosting.json','dist/.openai/hosting.json');
  await build({
    entryPoints:['hosting/worker.mjs'], outfile:'dist/server/index.js', bundle:true, minify:true,
    platform:'node', format:'esm', target:'es2022', external:['cloudflare:*'],
    banner:{js:"import { createRequire as __makeRequire } from 'node:module'; const require = __makeRequire('/dist/server/index.js');"},
    loader:{'.wasm':'binary'}
  });
} finally { await rm('hosting/assets.generated.mjs',{force:true}); }
