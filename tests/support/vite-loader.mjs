// Loader de Node solo para tests: reproduce lo mínimo de Vite que necesitan los módulos de `src/`.
//  - Resuelve el alias `@/` → `src/` y las importaciones sin extensión (`./config` → `./config.js`).
//  - Define `import.meta.env` con `globalThis.__VITE_ENV__` (cada test lo fija antes de importar).
import { statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const SRC = new URL('../../src/', import.meta.url)
const CANDIDATES = ['', '.js', '.jsx', '/index.js']

const isFile = (url) => {
  try { return statSync(fileURLToPath(url)).isFile() } catch { return false }
}

function findModule(base) {
  for (const suffix of CANDIDATES) {
    const url = new URL(base.href + suffix)
    if (isFile(url)) return url
  }
  return null
}

export async function resolve(specifier, context, nextResolve) {
  let base = null
  if (specifier.startsWith('@/')) base = new URL(specifier.slice(2), SRC)
  else if (/^\.\.?\//.test(specifier) && context.parentURL?.startsWith(SRC.href)) base = new URL(specifier, context.parentURL)
  const found = base && findModule(base)
  if (found) return { url: found.href, shortCircuit: true }
  return nextResolve(specifier, context)
}

export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context)
  if (!url.startsWith(SRC.href) || result.format !== 'module') return result
  // Las declaraciones `import` se elevan: esta asignación corre antes del cuerpo del módulo.
  const prelude = 'import.meta.env ??= globalThis.__VITE_ENV__ ?? {};\n'
  return { ...result, source: prelude + String(result.source) }
}
