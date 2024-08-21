import Container from 'typedi'
import type { DrizzleD1Database } from 'drizzle-orm/d1'

export interface Env {
  DB: D1Database
}

export const getEnv = () => Container.get<Env>('env')
export const getDB = () => Container.get<DrizzleD1Database<typeof import('../db/schema')>>('DB')
