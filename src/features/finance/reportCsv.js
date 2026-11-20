// Reformatea el CSV del informe (UC13) que entrega M3 para leerlo cómodo en Excel, sin perder datos.
// M3 produce una fila de encabezados y UNA fila de datos (contrato UC13 export). Aquí se transpone a
// dos columnas "Concepto,Valor" con etiquetas y valores legibles. Se mantiene el delimitador coma
// (SPEC RF-012); la línea `sep=,` indica a Excel el separador aunque su configuración regional use `;`.
// Solo ASCII: con `sep=,` Excel ignora el BOM y leería mal las tildes.

const LABELS = {
  'Fecha de Generacion': 'Fecha de generacion',
  Alcance: 'Alcance',
  Periodicidad: 'Periodicidad',
  Periodo: 'Periodo',
  'Neto Generado': 'Neto generado',
  'Total Cobros': 'Total cobros',
  'Total Reembolsos': 'Total reembolsos',
  'Total Dispersiones': 'Total dispersiones',
  'Total Comisiones': 'Total comisiones',
  'Count Charge': 'Registros de cobro',
  'Count Refund': 'Registros de reembolso',
  'Count Settlement': 'Registros de dispersion',
  'Count Commission': 'Registros de comision',
  'Periodo Anterior': 'Periodo anterior',
  'Variacion Absoluta': 'Variacion absoluta',
  'Variacion Porcentual': 'Variacion porcentual',
}
const SCOPE = { OWNER: 'Propietario', PLATFORM: 'Plataforma' }
const PERIODICITY = { SEMI_MONTHLY: 'Quincenal', MONTHLY: 'Mensual', QUARTERLY: 'Trimestral' }

const pad = (n) => String(n).padStart(2, '0')

/** ISO-8601 (hasta nanosegundos) → "dd/mm/aaaa hh:mm" en hora local; si no se puede leer, se deja igual. */
function formatInstant(iso) {
  const date = new Date(String(iso).replace(/(\.\d{3})\d+/, '$1'))
  if (Number.isNaN(date.getTime())) return iso
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const FORMATTERS = {
  'Fecha de Generacion': formatInstant,
  Alcance: (v) => SCOPE[v] ?? v,
  Periodicidad: (v) => PERIODICITY[v] ?? v,
  'Variacion Porcentual': (v) => (v === '' ? 'No calculable' : `${v}%`),
}

/** Parser CSV (RFC 4180): comillas, comas y saltos de línea dentro de campos entrecomillados. */
export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  const source = String(text).replace(/^﻿/, '')
  for (let i = 0; i < source.length; i++) {
    const ch = source[i]
    if (quoted) {
      if (ch === '"' && source[i + 1] === '"') { field += '"'; i++ } else if (ch === '"') quoted = false
      else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') { row.push(field); field = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && source[i + 1] === '\n') i++
      row.push(field); rows.push(row); row = []; field = ''
    } else field += ch
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  return rows.filter((r) => r.some((cell) => cell !== ''))
}

const escapeField = (value) => (/[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value)

/**
 * CSV de M3 → CSV vertical legible. Si la forma no es la esperada (no hay exactamente una fila de
 * datos), devuelve el texto original sin tocarlo: nunca se descartan ni se inventan datos.
 */
export function toReadableReportCsv(csvText) {
  const rows = parseCsv(csvText)
  if (rows.length !== 2 || rows[0].length !== rows[1].length) return csvText
  const [header, values] = rows
  const lines = header.map((name, i) => {
    const value = (FORMATTERS[name] ?? ((v) => v))(values[i])
    return `${escapeField(LABELS[name] ?? name)},${escapeField(value)}`
  })
  return ['sep=,', 'Concepto,Valor', ...lines].join('\r\n') + '\r\n'
}
