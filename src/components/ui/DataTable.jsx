import styles from './DataTable.module.css'

/** columns: [{ key, header, render?(row) }]; scroll horizontal en pantallas estrechas. */
export function DataTable({ columns, rows, rowKey = 'id', emptyMessage = 'Sin resultados.' }) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>{columns.map((c) => <th key={c.key} scope="col">{c.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]}>
              {columns.map((c) => <td key={c.key} data-label={c.header}>{c.render ? c.render(row) : row[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className={styles.empty}>{emptyMessage}</p>}
    </div>
  )
}
