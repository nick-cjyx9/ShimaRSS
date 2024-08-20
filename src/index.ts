import Container from 'typedi'
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import type { Env } from './utils/typedi'
import app from './controllers/ALL'

export default {
  async fetch(request: Request, env: Env) {
    // inject db and env as deps
    Container.set('env', env)
    Container.set('db', env.DB)
    const resp = await new Elysia({ aot: false })
      .use(cors())
      .use(app)
      .handle(request)
    return resp
  },
}
