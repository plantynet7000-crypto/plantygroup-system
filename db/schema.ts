import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const accessSettings = sqliteTable('access_settings', {
  id: text('id').primaryKey(),
  salt: text('salt').notNull(),
  passwordHash: text('password_hash').notNull(),
  sessionKey: text('session_key').notNull(),
  revision: text('revision').notNull(),
  updatedAt: integer('updated_at').notNull(),
});
export const accessAttempts = sqliteTable('access_attempts', {
  clientKey: text('client_key').primaryKey(),
  failures: integer('failures').notNull(),
  startedAt: integer('started_at').notNull(),
});
