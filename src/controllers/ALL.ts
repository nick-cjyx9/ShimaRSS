import { Elysia } from 'elysia'
import onUpdate from '../scheduled/update'
import { getDB, getEnv } from '../utils/typedi'
import handlePing from './ping'
import handlefeed from './feed'
import handleUser from './user'

function app() {
  return new Elysia({ aot: false })
    .use(handlePing())
    .use(handlefeed())
    .use(handleUser())
    .get('/test_update', async () => {
      return await onUpdate(getDB(), getEnv())
    })
}

export default app

export type App = typeof app
