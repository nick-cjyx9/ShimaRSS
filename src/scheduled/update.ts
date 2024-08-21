import { eq } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import * as schema from '../db/schema'
import { parseInfoFromRSS } from '../utils/parseInfoFromRSS'
import sendNewsLetter from '../utils/sendNewsLetter'
import type { Env } from '../utils/typedi'

export default async function onUpdate(db: DrizzleD1Database<typeof import('../db/schema')>, env: Env) {
  const feeds = await db.query.feeds.findMany()
  const notifyList: any = []
  for (const feed of feeds) {
    const subs = await db.query.subscriptions.findMany({
      where: (s, { eq }) => eq(s.feed_id, feed.id),
    })
    for (const sub of subs) {
      if (sub.error <= 3) {
        try {
          const info = await parseInfoFromRSS(sub.link)
          const new_bookmark = info.items[0]!.guid
          if (new_bookmark === sub.bookmark) {
            return
          }
          info.items.forEach((item) => {
            if (item.guid === sub.bookmark) {
              return
            }
            notifyList.push({
              title: item.title,
              content: item?.content ?? item?.contentSnippet,
              link: item?.link,
              date: item?.isoDate,
            })
          })
          await db.update(schema.subscriptions).set({ bookmark: new_bookmark }).where(eq(schema.subscriptions.id, sub.id))
        }
        catch {
          await db.update(schema.subscriptions).set({ error: sub.error + 1 }).where(eq(schema.subscriptions.id, sub.id))
        }
        finally {
          await db.update(schema.subscriptions).set({ error: 0 }).where(eq(schema.subscriptions.id, sub.id))
        }
      }
    }
  }
  await notifyAll(notifyList, env)
  return notifyList
}

async function notifyAll(notifyList: any, env: Env) {
  for (const item of notifyList) {
    const content = `
    <h1>${item.title}</h1>
    <p>${item.content}</p>
    <p>Published at ${item.date}</p>
    <p>Link: <a href="${item.link}">Go to source</a></p>
    `
    setTimeout(async () => {
      await sendNewsLetter(item.title, content, env.RESEND_SECRET)
    }, 2000)
  }
}
