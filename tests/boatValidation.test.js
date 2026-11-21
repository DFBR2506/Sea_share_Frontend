import assert from 'node:assert/strict'
import test from 'node:test'
import {
  capacityError,
  legalRegistrationError,
  MESSAGES,
  nameError,
  normalizeName,
  photoError,
  portNameError,
  rateError,
  roundCoordinate,
} from '../src/features/boats/validation.js'

test('nombre: obligatorio, entre 3 y 50 caracteres y con al menos una letra', () => {
  assert.equal(nameError('Río Magdalena II'), null)
  assert.equal(nameError('Lancha-2'), null)
  assert.equal(nameError('   '), MESSAGES.required)
  assert.equal(nameError('ab'), MESSAGES.nameInvalid)
  assert.equal(nameError('123'), MESSAGES.nameInvalid, 'sin letras no vale')
  assert.equal(nameError('Río@Mar'), MESSAGES.nameInvalid, 'caracteres fuera del juego permitido')
  assert.equal(nameError('x'.repeat(51)), MESSAGES.nameInvalid)
  assert.equal(portNameError('ab'), MESSAGES.portNameInvalid, 'el puerto tiene su propio mensaje')
  assert.equal(nameError('', { requiredMessage: MESSAGES.editRequired }), MESSAGES.editRequired)
})

test('normalizeName colapsa espacios repetidos y recorta los extremos', () => {
  assert.equal(normalizeName('  Marina   Fluvial \t Magdalena '), 'Marina Fluvial Magdalena')
})

test('matrícula legal: formato CP-NN-NNNN-L', () => {
  assert.equal(legalRegistrationError('CP-05-1042-A'), null)
  assert.equal(legalRegistrationError('cp-05-1042-a'), null, 'se acepta en minúsculas y se normaliza al enviar')
  assert.equal(legalRegistrationError(''), MESSAGES.required)
  assert.equal(legalRegistrationError('CP-5-1042-A'), MESSAGES.legalFormat)
  assert.equal(legalRegistrationError('AB-05-1042-A'), MESSAGES.legalFormat)
})

test('capacidad: entero positivo que no supera el máximo del tipo', () => {
  assert.equal(capacityError('10'), null)
  assert.equal(capacityError(''), MESSAGES.required)
  assert.equal(capacityError('1,5'), MESSAGES.noDecimals)
  assert.equal(capacityError('10.5'), MESSAGES.noDecimals)
  assert.equal(capacityError('diez'), MESSAGES.notNumeric)
  assert.equal(capacityError('0'), MESSAGES.capacityPositive)
  assert.equal(capacityError('000'), MESSAGES.capacityPositive)
  assert.equal(capacityError('13', { maxCapacity: 12 }), MESSAGES.capacityExceeded)
  assert.equal(capacityError('12', { maxCapacity: 12 }), null)
})

test('tarifa base: entero positivo hasta 9.999.999.999', () => {
  assert.equal(rateError('180000'), null)
  assert.equal(rateError(''), MESSAGES.required)
  assert.equal(rateError('0'), MESSAGES.ratePositive)
  assert.equal(rateError('180.000'), MESSAGES.noDecimals)
  assert.equal(rateError('9999999999'), null)
  assert.equal(rateError('10000000000'), MESSAGES.rateTooHigh)
})

test('roundCoordinate deja 4 decimales y aleja del cero la mitad exacta', () => {
  assert.equal(roundCoordinate(11.240812), 11.2408)
  assert.equal(roundCoordinate(-74.19949), -74.1995)
  assert.equal(roundCoordinate(0.00005), 0.0001)
  assert.equal(roundCoordinate(-0.00005), -0.0001)
})

// Archivo mínimo con los bytes de cabecera que mira la validación (no mira la extensión).
const fileWith = (bytes, size = bytes.length) => ({
  size,
  slice: () => ({ arrayBuffer: async () => new Uint8Array(bytes).buffer }),
})

test('fotografía: se valida por contenido y por peso', async () => {
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  const jpeg = [0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]
  assert.equal(await photoError(fileWith(png)), null)
  assert.equal(await photoError(fileWith(jpeg)), null)
  assert.equal(await photoError(null), null, 'sin archivo no hay error de formato')
  assert.equal(await photoError(fileWith([0x25, 0x50, 0x44, 0x46, 0, 0, 0, 0])), MESSAGES.imageFormat, 'un PDF renombrado no pasa')
  assert.equal(await photoError(fileWith(png, 10 * 1024 * 1024 + 1)), MESSAGES.imageTooLarge)
})
