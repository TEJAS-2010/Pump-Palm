import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

test('Vercel handler preserves methods, accounts, and scheduled job authorization', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'pump-vercel-test-'));
  process.env.SQLITE_PATH = join(directory, 'test.db');
  process.env.NODE_ENV = 'test';
  delete process.env.DATABASE_URL;
  delete process.env.POSTGRES_URL;
  process.env.CRON_SECRET = 'test-scheduler-secret';
  const { default: handle } = await import('../api/pump-pulse.mjs');
  const server = createServer(handle).listen(0);
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    await rm(directory, { recursive: true, force: true });
  });
  await once(server, 'listening');
  const base = 'http://127.0.0.1:' + server.address().port;
  const api = (path, options) => fetch(base + '/api/pump-pulse?path=' + path, options);
  assert.equal((await api('fields')).status, 401);
  assert.equal((await api('tasks/smap-refresh')).status, 401);
  assert.equal((await api('tasks/smap-refresh', {
    headers: { Authorization: 'Bearer ' + process.env.CRON_SECRET }
  })).status, 200);
  const registration = await api('auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'vercel-test@example.test', password: 'vercel-local-test-7393' })
  });
  assert.equal(registration.status, 201);
  const cookie = registration.headers.get('set-cookie').split(';')[0];
  const saved = await api('fields', {
    method: 'POST',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ country: 'AE', lat: 25.54, lon: 55.59 })
  });
  assert.equal(saved.status, 201);
  const direct = await fetch(base + '/api/fields', { headers: { Cookie: cookie } });
  assert.deepEqual((await direct.json()).map(field => field.id), [(await saved.json()).id]);
});
