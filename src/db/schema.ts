import { relations, sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull(),
  password: text('password').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  email: text('email').notNull(),
  enableEmailNotify: integer('enable_email_notify', { mode: 'boolean' }).default(true),
})

export const feeds = sqliteTable('feed', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  active: integer('active', { mode: 'boolean' }).default(true),
  creator_uid: integer('creator_uid').notNull(),
  private: integer('private', { mode: 'boolean' }).default(true),
  lastUpdated: integer('last_updated', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  nextCheckTime: integer('next_check_time', { mode: 'timestamp' }).notNull(),
  // updating interval (unit:s) default: 30min
  interval: integer('interval').default(1800),
  // ETag of feed, used for chaching
  ETag: text('ETag'),
})

export const subscriptions = sqliteTable('subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  feed_id: integer('feed_id').notNull(), //needed
  tags: text('tags', { mode: 'json' }),
  title: text('title').notNull(),
  link: text('feed_link').notNull(), //needed
  lang: text('lang').notNull(),
  // bookmark: the guid of the latest post, the new posts after this will be sent.
  bookmark: text('bookmark').notNull(),
  // if this sub fails to get too many times, disable it.
  error: integer('error').default(0),
})

export const usersRelations = relations(users, ({ many }) => ({
  feeds: many(feeds),
}))

export const feedsRelations = relations(feeds, ({ one, many }) => ({
  creator: one(users, {
    fields: [feeds.creator_uid],
    references: [users.id],
  }),
  subscriptions: many(subscriptions),
}))

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  feed: one(feeds, {
    fields: [subscriptions.feed_id],
    references: [feeds.id],
  }),
}))
