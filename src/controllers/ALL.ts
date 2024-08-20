import { Elysia } from 'elysia'
import handlePing from './ping'

const app = new Elysia({ aot: false })
  .use(handlePing)

export default app

export type App = typeof app
