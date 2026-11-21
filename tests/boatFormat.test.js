import assert from 'node:assert/strict'
import test from 'node:test'
import {
  EMPTY_VALUE,
  formatCapacity,
  formatCoordinate,
  formatPhone,
  ownerInitials,
  typeName,
} from '../src/features/boats/format.js'

test('tipo de embarcación: nombre en español y código desconocido tal cual', () => {
  assert.equal(typeName('MOTORBOAT'), 'Lancha')
  assert.equal(typeName('CATAMARAN'), 'Catamarán')
  assert.equal(typeName('HOVERCRAFT'), 'HOVERCRAFT')
  assert.equal(typeName(undefined), EMPTY_VALUE)
})

test('coordenada: siempre 4 decimales, con signo, y guion si no hay valor', () => {
  assert.equal(formatCoordinate('10.745'), '10.7450')
  assert.equal(formatCoordinate(-74.1995), '-74.1995')
  assert.equal(formatCoordinate(''), EMPTY_VALUE)
  assert.equal(formatCoordinate('norte'), EMPTY_VALUE)
})

test('capacidad en singular y en plural', () => {
  assert.equal(formatCapacity(1), '1 pasajero')
  assert.equal(formatCapacity(12), '12 pasajeros')
  assert.equal(formatCapacity(null), EMPTY_VALUE)
})

test('teléfono colombiano de 10 dígitos; otro formato se deja como llegó', () => {
  assert.equal(formatPhone('3104567890'), '+57 310 456 7890')
  assert.equal(formatPhone('+57 310 456 7890'), '+57 310 456 7890')
  assert.equal(formatPhone('123'), '123')
  assert.equal(formatPhone(''), EMPTY_VALUE)
})

test('iniciales del avatar: primera y última palabra', () => {
  assert.equal(ownerInitials('Ana María Rodríguez Peña'), 'AP')
  assert.equal(ownerInitials('Carlos'), 'C')
  assert.equal(ownerInitials('   '), '?')
})
