import {parseArgs} from 'node:util';
const {values}=parseArgs({options:{port:{type:'string'},host:{type:'string'},strictPort:{type:'boolean'}}});
process.env.PORT=values.port??process.env.PORT??'3000';
process.env.HOST=values.host??'127.0.0.1';
await import('./server.mjs');
