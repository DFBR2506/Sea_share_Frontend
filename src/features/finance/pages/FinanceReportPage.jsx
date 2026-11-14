import { useState } from 'react'
import { FinancialSummary } from '@/components/cards'
import downloadIcon from '@/assets/icons/download.svg'
import { Dropdown, SlideButton, SlidingTabs } from '@/components/ui'
import { copDecimal } from '@/lib/dates'
import { saveBlob } from '@/lib/download'
import { PERIODICITY, listPeriods } from '../periods'
import { TYPE_LABEL } from '../api'
import { m3ErrorMessage } from '../errors'
import { useExportReport, useReport } from '../hooks'
import styles from '../components/FinanceUI.module.css'

const TYPES = Object.keys(TYPE_LABEL)
// Importes del contrato como strings decimales: el signo se decide con Number solo al comparar.
const signed = (s) => {
  const n = Number(s)
  return `${n > 0 ? '+' : n < 0 ? '−' : ''}${copDecimal(Math.abs(n))}`
}

/** Informe financiero (feature 013). scope: 'owner' | 'admin'. */
export default function FinanceReportPage({ scope }) {
  const [periodicity, setPeriodicity] = useState('MONTHLY')
  const [period, setPeriod] = useState('')
  const periods = listPeriods(periodicity)
  const { data: r, isPending, isError, error } = useReport({ scope, periodicity, period })
  const exporter = useExportReport()
  // El export exige un período explícito: se usa el que el informe ya resolvió (incluso si se pidió el último cerrado).
  // `r?.` es obligatorio: el React Compiler usa estas lecturas como dependencias de memo en
  // cada render, también mientras el informe carga y `r` aún es undefined.
  const resolvedPeriodicity = r?.periodicity
  const resolvedPeriod = r?.period
  const exportCsv = () => {
    if (!resolvedPeriod) return
    exporter.mutate(
      { scope, periodicity: resolvedPeriodicity, period: resolvedPeriod },
      { onSuccess: ({ blob, filename }) => saveBlob(blob, filename ?? `informe_financiero_${resolvedPeriod}.csv`) },
    )
  }

  const changePeriodicity = (v) => { setPeriodicity(v); setPeriod('') }
  const bigLabel = scope === 'owner' ? 'Ganancias del propietario' : 'Neto generado'
  const bigSub = scope === 'owner' ? 'Total de dispersiones confirmadas a favor' : 'Cobros − reembolsos − dispersiones'
  const cmp = r?.comparison
  const cmpText = cmp && `${signed(cmp.absolute)} · ${cmp.percentage == null ? 'variación no calculable' : `${Number(cmp.percentage) > 0 ? '+' : ''}${cmp.percentage}%`} frente a ${cmp.previousPeriod}`
  const counts = r?.counts ?? {}
  const count = (t) => `${counts[t] ?? 0} registros`

  return (
    <>
      <p className={styles.eyebrow}>Feature 013</p>
      <h1 className={styles.title}>Informe financiero</h1>
      <p className={styles.lead}>Resumen agregado del período seleccionado y comparación equivalente.</p>

      <div className={`${styles.panel} ${styles.panelRow}`} style={{ justifyContent: 'space-between' }}>
        <div className={styles.panelRow}>
          <div>
            <span className={styles.fieldLabel}>Periodicidad</span>
            <SlidingTabs ariaLabel="Periodicidad" items={PERIODICITY} value={periodicity} onChange={changePeriodicity} />
          </div>
          <div style={{ width: 260 }}>
            <Dropdown label="Período" options={periods} value={period} onChange={(e) => setPeriod(e.target.value)} />
          </div>
        </div>
        <SlideButton icon={downloadIcon} disabled={!r || exporter.isPending} onClick={exportCsv}>Exportar CSV</SlideButton>
      </div>

      {exporter.isError && <p className={styles.empty} role="alert">No se pudo exportar el informe: {m3ErrorMessage(exporter.error)}</p>}
      {isPending && <p className={styles.empty}>Cargando…</p>}
      {isError && <p className={styles.empty} role="alert">{m3ErrorMessage(error)}</p>}
      {r && (
        <>
          <div className={styles.kpis}>
            <FinancialSummary label="Cobros confirmados" value={copDecimal(r.collections)} delta={count('CHARGE')} />
            <FinancialSummary label="Reembolsos confirmados" value={copDecimal(r.refunds)} delta={count('REFUND')} />
            <FinancialSummary label="Dispersiones confirmadas" value={copDecimal(r.settlements)} delta={count('SETTLEMENT')} />
            <FinancialSummary label="Comisiones confirmadas" value={copDecimal(r.commissions)} delta={`${count('COMMISSION')} · métrica informativa`} />
          </div>
          <div className={styles.split}>
            <section className={`${styles.panel} ${styles.big}`}>
              <p className={styles.bigLabel}>{bigLabel}</p>
              <p className={styles.bigSub}>{bigSub}</p>
              <p className={styles.bigValue}>{copDecimal(r.net)}</p>
              <p className={styles.bigSub}>{cmpText}</p>
            </section>
            <section className={`${styles.panel} ${styles.byType}`}>
              <h3>Registros por tipo</h3>
              <dl>
                {TYPES.map((t) => (
                  <div key={t} style={{ display: 'contents' }}><dt>{TYPE_LABEL[t]}</dt><dd>{counts[t] ?? 0}</dd></div>
                ))}
              </dl>
            </section>
          </div>
          <p className={styles.footnote}>
            {r.closed ? 'Período cerrado' : 'Período en curso (abierto)'} · {r.period} · garantías pendientes excluidas
          </p>
        </>
      )}
    </>
  )
}
