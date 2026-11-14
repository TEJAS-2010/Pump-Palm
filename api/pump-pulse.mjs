import { makeApp } from '../app.mjs';
import { openStore } from '../store.mjs';

let appPromise;

function getApp() {
  if (!appPromise) {
    appPromise = openStore()
      .then(({ query }) => makeApp({ query, prod: process.env.NODE_ENV === 'production', config: process.env }))
      .catch(error => {
        appPromise = undefined;
        throw error;
      });
  }
  return appPromise;
}

export default async function handleRequest(req, res) {
  const url = new URL(req.url, 'https://pump-pulse.invalid');
  if (url.pathname === '/api/pump-pulse') {
    const path = url.searchParams.get('path');
    if (!path || !/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(path) || path === 'pump-pulse') {
      res.writeHead(404, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      return res.end(JSON.stringify({ error: 'missing' }));
    }
    req.url = '/api/' + path;
  }
  try {
    return (await getApp())(req, res);
  } catch (error) {
    console.error('Pump Pulse database initialization failed:', error.code ?? error.name);
    res.writeHead(503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    return res.end(JSON.stringify({ error: 'serverError' }));
  }
}
