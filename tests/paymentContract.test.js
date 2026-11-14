import assert from 'node:assert/strict'
import test from 'node:test'
import { contactErrors, normalizePayment, sanitizePhone, toM3PaymentFields } from '../src/features/reservations/checkout/paymentContract.js'

const now = 1800000000000
const input = () => ({
  checkoutId: 'local-checkout', amount: 10000, expiresAt: now + 60000,
  contact: { name: '  Contacto Reserva  ', phone: ' 3001234567 ' },
  result: {
    selectedPaymentMethod: 'credit_card',
    formData: {
      token: 'token-test', payment_method_id: 'visa', issuer_id: '123',
      installments: 1, transaction_amount: 10000,
      payment_method_option_id: null, processing_mode: 'aggregator',
      payer: { email: 'payer@example.com', identification: { type: 'CC', number: '0012345678' } },
    },
  },
  additionalData: { lastFourDigits: '4242', cardholderName: 'Titular Tarjeta' },
})

test('nombre y teléfono son obligatorios; el contacto no duplica el correo del Brick', () => {
  assert.ok(contactErrors({ name: ' ', phone: '' }).name)
  assert.ok(contactErrors(null).phone)
  assert.deepEqual(contactErrors(input().contact), { name: '', phone: '' })
  const payment = normalizePayment(input(), now)
  assert.deepEqual(payment.contact, { name: 'Contacto Reserva', phone: '3001234567' })
  assert.equal(payment.formData.payer.email, 'payer@example.com')
  assert.equal('email' in payment.contact, false)
  assert.notEqual(payment.contact.name, payment.additionalData.cardholderName)
})

test('normaliza sin inventar la reserva y conserva los campos documentados', () => {
  const payment = normalizePayment(input(), now)
  assert.equal(payment.reservationId, null)
  assert.equal(payment.checkoutId, 'local-checkout')
  assert.equal(payment.formData.token, 'token-test')
  assert.equal(payment.formData.issuer_id, '123')
  assert.equal(payment.formData.payer.identification.number, '0012345678')
  assert.equal(payment.formData.processing_mode, 'aggregator')
  assert.equal(payment.formData.payment_method_option_id, null)
  assert.deepEqual(payment.additionalData, { lastFourDigits: '4242', cardholderName: 'Titular Tarjeta' })
})

test('excluye campos ajenos: PAN, CVV, vencimiento, BIN y datos de contacto extra', () => {
  const args = input()
  args.contact.email = 'other@example.com'
  Object.assign(args.result.formData, { card_number: 'PAN', security_code: 'CVV', expiration_date: 'EXP' })
  args.result.formData.payer.address = { secret: 'address' }
  args.additionalData.bin = 'BIN'
  const payment = normalizePayment(args, now)
  assert.deepEqual(Object.keys(payment.formData).sort(), [
    'token', 'payment_method_id', 'issuer_id', 'transaction_amount', 'installments',
    'payer', 'payment_method_option_id', 'processing_mode',
  ].sort())
  assert.deepEqual(Object.keys(payment.formData.payer).sort(), ['email', 'identification'])
  assert.deepEqual(Object.keys(payment.additionalData).sort(), ['cardholderName', 'lastFourDigits'])
  assert.deepEqual(Object.keys(payment.contact).sort(), ['name', 'phone'])
})

test('la captura no comparte referencias mutables con el SDK o el formulario', () => {
  const args = input()
  const payment = normalizePayment(args, now)
  args.result.formData.payer.identification.number = 'changed'
  args.result.formData.token = 'changed'
  args.additionalData.lastFourDigits = '0000'
  args.contact.name = 'changed'
  assert.equal(payment.formData.payer.identification.number, '0012345678')
  assert.equal(payment.formData.token, 'token-test')
  assert.equal(payment.additionalData.lastFourDigits, '4242')
  assert.equal(payment.contact.name, 'Contacto Reserva')
})

test('no fabrica datos opcionales cuando el Brick no los devuelve', () => {
  const args = input()
  delete args.additionalData
  delete args.result.formData.issuer_id
  delete args.result.formData.payer.identification
  delete args.result.formData.processing_mode
  const payment = normalizePayment(args, now)
  assert.deepEqual(payment.additionalData, {})
  assert.equal('issuer_id' in payment.formData, false)
  assert.equal('identification' in payment.formData.payer, false)
  assert.equal('processing_mode' in payment.formData, false)
  assert.equal('last_four' in toM3PaymentFields(payment).payment_metadata, false)
})

test('proyecta las claves exactas soportadas por M3, sin simular un endpoint ni evento completo', () => {
  assert.deepEqual(toM3PaymentFields(normalizePayment(input(), now)), {
    payment_token_ref: 'token-test', payment_method_type: 'visa',
    payment_metadata: { payer_email: 'payer@example.com', last_four: '4242' },
  })
})

test('rechaza contexto vencido, ausente o contacto incompleto sin revelar su contenido', () => {
  for (const patch of [
    { checkoutId: '' }, { expiresAt: now }, { expiresAt: undefined },
    { contact: { name: '', phone: 'private-value' } },
  ]) {
    assert.throws(() => normalizePayment({ ...input(), ...patch }, now), (error) => !error.message.includes('private-value'))
  }
})

test('teléfono: solo dígitos, máximo 10 y sin indicativo +57 al pegar', () => {
  assert.equal(sanitizePhone('300 123 4567'), '3001234567')
  assert.equal(sanitizePhone('30012345678999'), '3001234567')
  assert.equal(sanitizePhone('+57 300 123 4567'), '3001234567')
  assert.equal(sanitizePhone('abc-300'), '300')
  assert.equal(sanitizePhone(undefined), '')
})

test('teléfono: exige exactamente 10 dígitos', () => {
  assert.equal(contactErrors({ name: 'A', phone: '3001234567' }).phone, '')
  assert.match(contactErrors({ name: 'A', phone: '300123456' }).phone, /10 dígitos/)
  assert.match(contactErrors({ name: 'A', phone: '30012345678' }).phone, /10 dígitos/)
  assert.match(contactErrors({ name: 'A', phone: '+57 300 123 4567' }).phone, /10 dígitos/)
  assert.equal(contactErrors({ name: 'A', phone: '' }).phone, 'Ingresa el teléfono de contacto.')
})
