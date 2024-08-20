import Elysia from 'elysia'

export default function handlePing() {
  return new Elysia({ aot: false })
    .all('/ping', () => 'pong')
}
