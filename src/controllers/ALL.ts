import { Elysia } from 'elysia'
import handlePing from './ping'
import handlefeed from './feed'
import handleUser from './user'

const app = new Elysia({ aot: false })
  .use(handlePing)
  .use(handlefeed)
  .use(handleUser)

export default app

export type App = typeof app
