import assert from 'node:assert/strict'
import test from 'node:test'
import { parseCsv, toReadableReportCsv } from '../src/features/finance/reportCsv.js'

// Salida real del backend M3 (CsvReportExporter, Apache Commons CSV: CRLF y sin comillas innecesarias).
const BACKEND_CSV = [
  'Fecha de Generacion,Alcance,Periodicidad,Periodo,Neto Generado,Total Cobros,Total Reembolsos,Total Dispersiones,Total Comisiones,Count Charge,Count Refund,Count Settlement,Count Commission,Periodo Anterior,Variacion Absoluta,Variacion Porcentual',
  '2026-11-14T06:04:12.955153290Z,OWNER,MONTHLY,2026-11,0.00,585000.00,0.00,0.00,0.00,1,0,0,0,2026-10,0.00,',
].join('\r\n') + '\r\n'

test('CSV del informe: vertical, separado por comas y con sep=, para Excel', () => {
  const out = toReadableReportCsv(BACKEND_CSV)
  const lines = out.split('\r\n').filter(Boolean)

  assert.equal(lines[0], 'sep=,')
  assert.equal(lines[1], 'Concepto,Valor')
  assert.equal(lines.length, 2 + 16, 'una fila por cada columna del backend, ninguna se pierde')
  assert.match(lines[2], /^Fecha de generacion,\d{2}\/\d{2}\/2026 \d{2}:\d{2}$/)
  assert.ok(lines.includes('Alcance,Propietario'))
  assert.ok(lines.includes('Periodicidad,Mensual'))
  assert.ok(lines.includes('Periodo,2026-11'))
  assert.ok(lines.includes('Total cobros,585000.00'))
  assert.ok(lines.includes('Registros de cobro,1'))
  assert.ok(lines.includes('Periodo anterior,2026-10'))
  assert.ok(lines.includes('Variacion porcentual,No calculable'))
  assert.match(out, /^[\x00-\x7F]*$/, 'solo ASCII: con sep=, Excel no respeta el BOM')
})

test('CSV del informe: plataforma, otras periodicidades y variación porcentual con valor', () => {
  const csv = BACKEND_CSV
    .replace(',OWNER,MONTHLY,2026-11,', ',PLATFORM,QUARTERLY,2026-Q4,')
    .replace(/,\r\n$/, ',12.50\r\n')
  const out = toReadableReportCsv(csv)
  assert.ok(out.includes('Alcance,Plataforma'))
  assert.ok(out.includes('Periodicidad,Trimestral'))
  assert.ok(out.includes('Variacion porcentual,12.50%'))
})

test('CSV del informe: forma inesperada se devuelve intacta (no se descartan datos)', () => {
  const twoRows = BACKEND_CSV + '2026-11-14T06:05:00Z,OWNER,MONTHLY,2026-11,1,1,1,1,1,1,1,1,1,2026-10,1,1\r\n'
  assert.equal(toReadableReportCsv(twoRows), twoRows)
  assert.equal(toReadableReportCsv(''), '')
})

test('parser CSV: comillas, comas y saltos de línea dentro de un campo', () => {
  assert.deepEqual(parseCsv('a,"b,c","d ""x""","e\r\nf"\r\n1,2,3,4\r\n'), [['a', 'b,c', 'd "x"', 'e\r\nf'], ['1', '2', '3', '4']])
  assert.equal(toReadableReportCsv('Alcance,Periodo\r\n"OWNER","2026,11"\r\n').split('\r\n')[3], 'Periodo,"2026,11"')
})
