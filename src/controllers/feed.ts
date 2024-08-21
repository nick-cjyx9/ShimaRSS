import Elysia, { t } from 'elysia'
import { eq } from 'drizzle-orm'
import { getDB } from '../utils/typedi'
import { feeds, subscriptions } from '../db/schema'
import { parseInfoFromRSS } from '../utils/parseInfoFromRSS'

export default function handleFeed() {
  return new Elysia({ aot: false })
    .group('/feed', app => app.derive(async ({ headers: { authorization }, error }) => {
      if (!authorization)
        throw error(401, 'Invalid credentials')
      const basic = authorization.split(' ')[1]
      if (!basic)
        throw error(401, 'Invalid credentials')
      const [username, password] = atob(basic).split(':')
      const db = getDB()
      const user = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.username, username!) && eq(u.password, password!),
      })
      if (!user)
        throw error(401, 'Invalid credentials')
      return { user }
    })
      // ! ROUTE START ! //
      .get('/', async ({ user }) => {
        const db = getDB()
        const feeds = await db.query.feeds.findMany({
          where: (f, { eq }) => eq(f.creator_uid, user.id),
        })
        return feeds
      })
      .get('/:id', async ({ user, params: { id } }) => {
        const db = getDB()
        const feed = await db.query.feeds.findFirst({
          where: (f, { eq }) => eq(f.id, id) && (eq(f.creator_uid, user.id) || eq(f.private, false)),
        })
        if (!feed)
          throw new Error('Feed not found')
        const subscriptions = await db.query.subscriptions.findMany({
          where: (s, { eq }) => eq(s.feed_id, feed.id),
        })
        return {
          ...feed,
          subscriptions,
        }
      }, {
        params: t.Object({
          id: t.Number(),
        }),
      })
      .post('/', async ({ user }) => {
        const db = getDB()
        const feed = await db.insert(feeds).values({
          creator_uid: user.id,
          nextCheckTime: new Date(Date.now() * 1000 + 1800),
        }).returning()
        return feed[0]
      })
      .delete('/:id', async ({ user, params: { id }, error }) => {
        const db = getDB()
        const feed = await db.query.feeds.findFirst({
          where: (f, { eq }) => eq(f.id, id) && eq(f.creator_uid, user.id),
        })
        if (!feed)
          throw error(404, 'Feed not found or it is not your feed')
        await db.delete(feeds).where(eq(feeds.id, feed.id))
        return {
          message: 'Feed deleted',
        }
      }, {
        params: t.Object({
          id: t.Number(),
        }),
      })
      .post('/:id/sub', async ({ user, params: { id }, body: { link }, error }) => {
        const db = getDB()
        const feed = await db.query.feeds.findFirst({
          where: (f, { eq }) => eq(f.id, id) && eq(f.creator_uid, user.id),
        })
        if (!feed)
          throw error(404, 'Feed not found')
        const sub = await parseInfoFromRSS(link)
        // TODO: check type
        const db_sub = await db.insert(subscriptions).values({
          feed_id: feed.id,
          link,
          title: sub.title!.trim(),
          lang: sub.language as string ?? 'zh-CN',
          bookmark: sub.items[0]!.guid!,
        }).returning()
        return {
          message: 'Subscribed',
          ...db_sub[0],
        }
      }, {
        params: t.Object({
          id: t.Number(),
        }),
        body: t.Object({
          link: t.String({ format: 'uri' }),
        }),
      })
      .delete('/:id/sub/:sub_id', async ({ user, params: { id, sub_id }, error }) => {
        const db = getDB()
        const feed = await db.query.feeds.findFirst({
          where: (f, { eq }) => eq(f.id, id) && eq(f.creator_uid, user.id),
        })
        if (!feed)
          throw error(404, 'Feed not found')
        const sub = await db.delete(subscriptions).where(eq(subscriptions.id, sub_id)).returning()
        if (!sub)
          throw error(404, 'Subscription not found')
        return {
          message: 'Unsubscribed',
        }
      }, {
        params: t.Object({
          id: t.Number(),
          sub_id: t.Number(),
        }),
      })
      .put('/:id/sub/:sub_id', async ({ user, params: { id, sub_id }, body: { link }, error }) => {
        const db = getDB()
        const feed = await db.query.feeds.findFirst({
          where: (f, { eq }) => eq(f.id, id) && eq(f.creator_uid, user.id),
        })
        if (!feed)
          throw error(404, 'Feed not found')
        const sub = await db.update(subscriptions).set({
          link,
        }).where(eq(subscriptions.id, sub_id)).returning()
        if (!sub)
          throw error(404, 'Subscription not found')
        return {
          message: 'Updated',
          ...sub[0],
        }
      }, {
        params: t.Object({
          id: t.Number(),
          sub_id: t.Number(),
        }),
        body: t.Object({
          link: t.String({ format: 'uri' }),
        }),
      }))
}
