import { cp, mkdir } from 'node:fs/promises';

const leaflet = new URL('../node_modules/leaflet/dist/', import.meta.url);
const destination = new URL('../public/vendor/leaflet/', import.meta.url);
await mkdir(destination, { recursive: true });
for (const entry of ['leaflet.js', 'leaflet.css', 'images']) {
  await cp(new URL(entry, leaflet), new URL(entry, destination), { recursive: true });
}
