import express from 'express';
import { fileURLToPath } from 'node:url';
import { openStore } from './store.mjs';
import { makeApp } from './app.mjs';

const path = name => fileURLToPath(new URL(name, import.meta.url));
const { query, close } = await openStore();
const staticAssets = express.Router();
staticAssets.use('/vendor/leaflet', express.static(path('./node_modules/leaflet/dist')));
staticAssets.use(express.static(path('./public')));
const app = makeApp({ query, prod:process.env.NODE_ENV === 'production', assetMiddleware:staticAssets, config:process.env });
const server=app.listen(Number(process.env.PORT||3000),process.env.HOST,()=>console.log('Falaj Fields listening on '+server.address().port));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(async()=>{await close();process.exit(0);}));
