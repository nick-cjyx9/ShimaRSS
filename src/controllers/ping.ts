import Elysia from 'elysia'

export default function handlePing() {
  return new Elysia({ aot: false })
    .all('/ping', () => 'pong')
    .get('/0721', ({ error }) => error(418, 'polish the table'))
}
