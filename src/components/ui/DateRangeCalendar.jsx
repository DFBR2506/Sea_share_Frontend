import { useState } from 'react'
import { isSameDay, monthName, startOfDay } from '@/lib/dates'
import { cx } from '@/lib/cx'
import styles from './DateRangeCalendar.module.css'

// "Hoy" se fija al cargar el módulo (suficiente para una sesión de navegación)
const TODAY = startOfDay(new Date())
const DOW = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

/**
 * Calendario de rango (inicio → fin). value: { start: Date|null, end: Date|null }.
 * Primer clic = inicio; segundo clic (≥ inicio) = fin; un tercer clic reinicia la selección.
 */
export function DateRangeCalendar({ value, onChange, minDate = TODAY }) {
  const [view, setView] = useState(() => new Date((value.start ?? minDate).getFullYear(), (value.start ?? minDate).getMonth(), 1))
  const { start, end } = value
  const year = view.getFullYear()
  const month = view.getMonth()
  const offset = (new Date(year, month, 1).getDay() + 6) % 7 // lunes = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: Math.ceil((offset + daysInMonth) / 7) * 7 }, (_, i) => {
    const day = i - offset + 1
    return day < 1 || day > daysInMonth ? null : new Date(year, month, day)
  })
  const canGoBack = new Date(year, month, 1) > new Date(minDate.getFullYear(), minDate.getMonth(), 1)

  const pick = (date) => {
    if (!start || end || date < start) onChange({ start: date, end: null })
    else onChange({ start, end: date })
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.head}>
        <div>{monthName(month).replace(/^./, (c) => c.toUpperCase())} <span>{year}</span></div>
        <div className={styles.nav}>
          <button type="button" className={styles.navBtn} aria-label="Mes anterior" disabled={!canGoBack} onClick={() => setView(new Date(year, month - 1, 1))}>‹</button>
          <button type="button" className={styles.navBtn} aria-label="Mes siguiente" onClick={() => setView(new Date(year, month + 1, 1))}>›</button>
        </div>
      </div>
      <div className={styles.grid} role="grid">
        {DOW.map((d) => <div key={d} className={styles.dow}>{d}</div>)}
        {cells.map((date, i) => {
          if (!date) return <div key={i} className={cx(styles.cell, styles.outside)} />
          const disabled = date < minDate
          const isStart = isSameDay(date, start)
          const isEnd = isSameDay(date, end)
          const inRange = start && end && date >= start && date <= end
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              aria-pressed={isStart || isEnd}
              aria-label={date.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
              className={cx(
                styles.cell,
                disabled && styles.disabled,
                inRange && styles.inRange,
                inRange && (isStart || date.getDay() === 1 || date.getDate() === 1) && styles.first,
                inRange && (isEnd || date.getDay() === 0 || date.getDate() === daysInMonth) && styles.last,
                (isStart || isEnd) && styles.edge,
                isSameDay(date, TODAY) && styles.today,
              )}
              onClick={() => pick(date)}
            >
              <span>{date.getDate()}</span>
            </button>
          )
        })}
      </div>
      <div className={styles.legend}>
        <span><i style={{ background: '#d9d9d9' }} />Inicio y fin</span>
        <span><i style={{ background: 'var(--seashare-color-brand-soft)' }} />Tu viaje</span>
        <span><i style={{ border: '2px solid #f0a030' }} />Hoy</span>
      </div>
    </div>
  )
}
