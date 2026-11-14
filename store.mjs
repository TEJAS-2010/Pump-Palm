import pg from 'pg';
import { DatabaseSync } from 'node:sqlite';

import { schema } from './schema.mjs';

export async function openStore() {
  const pgUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (process.env.NODE_ENV === 'production' && !pgUrl) {
    throw new Error('DATABASE_URL is required in production');
  }

  let query;
  let close;
  let poolForInitialization;
  if (pgUrl) {
    const pool = poolForInitialization = new pg.Pool({ connectionString: pgUrl, max: 5, connectionTimeoutMillis: 8000 });
    query = (sql, args = []) => {
      let index = 0;
      return pool.query(sql.replace(/\?/g, () => '$' + ++index), args).then(result => result.rows);
    };
    close = () => pool.end();
  } else {
    const db = new DatabaseSync(process.env.SQLITE_PATH || 'pump-pulse.db');
    db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000');
    query = async (sql, args = []) => {
      const statement = db.prepare(sql);
      if (/^SELECT\b/i.test(sql)) return statement.all(...args);
      statement.run(...args);
      return [];
    };
    close = () => db.close();
  }
  try {
    if (pgUrl) {
      const client = await poolForInitialization.connect();
      try {
        await client.query('BEGIN');
        await client.query('SELECT pg_advisory_xact_lock(631358291)');
        for (const sql of schema) await client.query(sql);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } else {
      for (const sql of schema) await query(sql);
    }
    return { query, close };
  } catch (error) {
    await close();
    throw error;
  }
}
