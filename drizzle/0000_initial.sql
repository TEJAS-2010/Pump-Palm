CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, pass TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, owner TEXT NOT NULL, expires BIGINT NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS fields (id TEXT PRIMARY KEY, owner TEXT NOT NULL, name TEXT NOT NULL, payload TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS devices (id TEXT PRIMARY KEY, field TEXT NOT NULL, label TEXT NOT NULL, token TEXT NOT NULL UNIQUE);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS readings (device TEXT NOT NULL, stamp TEXT NOT NULL, received BIGINT NOT NULL, payload TEXT NOT NULL, PRIMARY KEY(device,stamp));
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS earth (key TEXT PRIMARY KEY, stamp BIGINT NOT NULL, payload TEXT NOT NULL);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS fields_owner ON fields(owner);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS devices_field ON devices(field);
