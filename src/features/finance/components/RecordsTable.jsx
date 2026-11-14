import { copDecimal } from '@/lib/dates'
import { TYPE_LABEL } from '../api'
import styles from './FinanceUI.module.css'

export function RecordsTable({ rows }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>{['Tipo', 'Reserva', 'Propietario', 'Embarcación', 'Monto', 'Creado', 'Referencia externa'].map((h) => <th key={h} scope="col">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{TYPE_LABEL[r.type]}</td>
              <td>{r.reservation}</td>
              <td>{r.ownerId}</td>
              <td>{r.boat}</td>
              <td className={styles.amount}>{copDecimal(r.amount)}</td>
              <td>{r.createdAt}</td>
              <td>{r.externalRef}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className={styles.empty}>No hay registros para este filtro.</p>}
    </div>
  )
}
