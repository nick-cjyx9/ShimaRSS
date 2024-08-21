import Container from 'typedi'
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { drizzle } from 'drizzle-orm/d1'
import type { Env } from './utils/typedi'
import app from './controllers/ALL'
import * as schema from './db/schema'

export default {
  async fetch(request: Request, env: Env) {
    // inject db and env as deps
    Container.set('env', env)
    Container.set('DB', drizzle(env.DB, { schema }))
    const resp = await new Elysia({ aot: false })
      .use(cors())
      .use(app)
      .handle(request)
    return resp
  },
}
