import assert from 'node:assert/strict'
import test from 'node:test'
import { sessionIdentity } from '../src/lib/sessionIdentity.js'

test('reutiliza la identidad de un JWT vigente, sin conceder otro rol', (t) => {
  const token = (role, exp) => `test.${Buffer.from(JSON.stringify({ sub: 'existing-admin', role, exp })).toString('base64url')}.test`
  const values = new Map([['seashare.role', 'ADMIN'], ['seashare.token', token('ADMIN', Date.now() / 1000 + 60)]])
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key) => values.get(key) ?? null } })
  t.after(() => { if (original) Object.defineProperty(globalThis, 'localStorage', original); else delete globalThis.localStorage })
  assert.equal(sessionIdentity().userId, 'existing-admin')
  values.set('seashare.token', token('OWNER', Date.now() / 1000 + 60))
  assert.equal(sessionIdentity().userId, null)
  values.set('seashare.token', token('ADMIN', 0))
  assert.equal(sessionIdentity().userId, null)
})
