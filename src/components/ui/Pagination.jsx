import { cx } from '@/lib/cx'
import styles from './Pagination.module.css'

/** Rango de páginas con puntos suspensivos: [1, '…', 4, 5, 6, '…', 10]. */
function pageRange(page, total, siblings) {
  const count = siblings * 2 + 5
  if (total <= count) return Array.from({ length: total }, (_, i) => i + 1)
  const left = Math.max(page - siblings, 2)
  const right = Math.min(page + siblings, total - 1)
  const range = [1]
  if (left > 2) range.push('…')
  for (let p = left; p <= right; p++) range.push(p)
  if (right < total - 1) range.push('…')
  range.push(total)
  return range
}

/**
 * Paginación controlada: anterior / números / siguiente.
 * Con `total` y `pageSize` muestra además el resumen "1–10 de N {noun} · Página X de Y".
 */
export function Pagination({ page, totalPages, onPageChange, siblingCount = 1, total, pageSize, noun = 'registros' }) {
  const showSummary = total != null && pageSize != null
  if (totalPages <= 1 && !showSummary) return null
  const go = (p) => onPageChange(Math.min(Math.max(p, 1), totalPages))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className={cx(styles.wrap, showSummary && styles.withSummary)}>
      {showSummary && <span className={styles.summary}>{total === 0 ? `0 ${noun}` : `${from}–${to} de ${total} ${noun}`} · Página {page} de {Math.max(totalPages, 1)}</span>}
      {totalPages > 1 && <nav className={styles.pagination} aria-label="Paginación">
      <button type="button" className={styles.btn} aria-label="Ir a la página anterior" disabled={page <= 1} onClick={() => go(page - 1)}>‹</button>
      {pageRange(page, totalPages, siblingCount).map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className={styles.gap} aria-hidden="true">…</span>
        ) : (
          <button
            key={p}
            type="button"
            className={cx(styles.btn, p === page && styles.active)}
            aria-label={`Ir a la página ${p}`}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => go(p)}
          >
            {p}
          </button>
        ),
      )}
      <button type="button" className={styles.btn} aria-label="Ir a la página siguiente" disabled={page >= totalPages} onClick={() => go(page + 1)}>›</button>
    </nav>}
    </div>
  )
}
