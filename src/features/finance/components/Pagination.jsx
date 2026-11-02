import styles from './FinanceUI.module.css'

export function Pagination({ page, pageSize, total, onPage, noun = 'registros' }) {
  const pages = Math.max(Math.ceil(total / pageSize), 1)
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  return (
    <div className={styles.pager}>
      <span>{from}–{to} de {total} {noun} · Página {page} de {pages}</span>
      <div className={styles.pagerBtns}>
        <button type="button" className={styles.pagerBtn} aria-label="Página anterior" disabled={page <= 1} onClick={() => onPage(page - 1)}>‹</button>
        <button type="button" className={styles.pagerBtn} aria-label="Página siguiente" disabled={page >= pages} onClick={() => onPage(page + 1)}>›</button>
      </div>
    </div>
  )
}
