import Container from 'typedi'

export interface Env {
  DB: D1Database
}

export const getEnv = () => Container.get<Env>('env')
export const getDB = () => Container.get<Env>('db')
