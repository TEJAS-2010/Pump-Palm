import { makeEarth } from './earth.mjs';
import { openStore } from './store.mjs';
const db = await openStore();
try { await makeEarth(db.query,process.env).refreshSmap(); } finally { await db.close(); }
