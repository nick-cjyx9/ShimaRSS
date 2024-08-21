/* eslint-disable no-template-curly-in-string */
import Elysia, { t } from 'elysia'
import { md5 } from 'cf-workers-hash'
import { getDB } from '../utils/typedi'
import { users } from '../db/schema'

export default function handleUser() {
  return new Elysia({ aot: false })
    .group('/user', (app) => {
      return app
        .post('/', async ({ body: { username, password, email }, error }) => {
          const db = getDB()
          const user = await db.query.users.findFirst({
            where: (u, { eq }) => eq(u.username, username) || eq(u.email, email),
          })
          if (user)
            throw error(409, 'Username or email already exists').error
          return await db.insert(users).values({
            username,
            password: await md5(password),
            email,
          }).returning()
        }, {
          body: t.Object({
            username: t.String(),
            password: t.String(),
            email: t.String({ format: 'email' }),
          }),
        })
        .get('/', async ({ headers: { authorization }, error }) => {
          const db = getDB()
          const basic = authorization.split(' ')[1]
          if (!basic)
            throw error(401, 'Unauthorized')
          const [uid, password] = atob(basic).split(':')
          const user = await db.query.users.findFirst({
            where: (u, { eq }) => eq(u.id, Number.parseInt(uid!)) && eq(u.password, password!),
          })
          if (!user)
            throw error(401, 'Username or password is incorrect')
          return {
            id: user.id,
            username: user.username,
            email: user.email,
            enableEmailNotify: user.enableEmailNotify,
            createdAt: user.createdAt,
          }
        }, {
          headers: t.Object({
            authorization: t.TemplateLiteral('Basic ${string}'),
          }),
        })
        .post('/login', async ({ body: { username, email, password }, error }) => {
          const db = getDB()
          if (!email && !username)
            throw error(400, 'Username or email is required')
          const hashed = await md5(password)
          let user
          if (username) {
            user = await db.query.users.findFirst({
              where: (u, { eq }) => eq(u.username, username) && eq(u.password, hashed),
            })
          }
          else {
            user = await db.query.users.findFirst({
              where: (u, { eq }) => eq(u.email, email!) && eq(u.password, hashed),
            })
          }
          if (!user)
            throw error(401, 'Username or password is incorrect')
          return {
            id: user.id,
            username: user.username,
            email: user.email,
            enableEmailNotify: user.enableEmailNotify,
            createdAt: user.createdAt,
          }
        }, {
          body: t.Object({
            username: t.Optional(t.String()),
            email: t.Optional(t.String({ format: 'email' })),
            password: t.String(),
          }),
        })
    })
}
