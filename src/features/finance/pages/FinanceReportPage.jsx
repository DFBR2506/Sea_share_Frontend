import { useState } from 'react'
import { FinancialSummary } from '@/components/cards'
import downloadIcon from '@/assets/icons/download.svg'
import { Dropdown, SlideButton, SlidingTabs } from '@/components/ui'
import { copMoney } from '@/lib/dates'
import { ApiError } from '@/lib/http'
import { saveBlob } from '@/lib/download'
import { PERIODICITY, listPeriods } from '../periods'
import { TYPE_LABEL } from '../api/mocks'
import { useExportReport, useReport } from '../hooks'
import styles from '../components/FinanceUI.module.css'

const TYPES = ['CHARGE', 'REFUND', 'SETTLEMENT', 'COMMISSION']
const signed = (n) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${copMoney(Math.abs(n))}`

/** Informe financiero (feature 013). scope: 'owner' | 'admin'. */
export default function FinanceReportPage({ scope }) {
  const [periodicity, setPeriodicity] = useState('MONTHLY')
  const [period, setPeriod] = useState('')
  const periods = listPeriods(periodicity)
  const { data: r, isPending, isError, error } = useReport({ scope, periodicity, period })
  const exporter = useExportReport()
  // El export exige un período explícito: se usa el que el informe ya resolvió (incluso si se pidió el último cerrado).
  const exportCsv = () => exporter.mutate(
    { scope, periodicity: r.periodicity, period: r.period },
    { onSuccess: ({ blob, filename }) => saveBlob(blob, filename ?? `informe_financiero_${r.period}.csv`) },
  )

  const changePeriodicity = (v) => { setPeriodicity(v); setPeriod('') }
  const bigLabel = scope === 'owner' ? 'Ganancias del propietario' : 'Neto generado'
  const bigSub = scope === 'owner' ? 'Total de dispersiones confirmadas a favor' : 'Cobros − reembolsos − dispersiones'
  const cmp = r?.comparison
  const cmpText = cmp && `${signed(cmp.absolute)} · ${cmp.percentage == null ? 'variación no calculable' : `${cmp.percentage > 0 ? '+' : ''}${cmp.percentage}%`} frente a ${cmp.previousPeriod}`
  const count = (t) => `${r.counts[t] ?? 0} registros`

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

      {exporter.isError && <p className={styles.empty} role="alert">No se pudo exportar el informe: {exporter.error.message}</p>}
      {isPending && <p className={styles.empty}>Cargando…</p>}
      {isError && <p className={styles.empty} role="alert">{error instanceof ApiError && error.code === 'INVALID_PERIOD' ? 'El período seleccionado no es válido.' : error.message}</p>}
      {r && (
        <>
          <div className={styles.kpis}>
            <FinancialSummary label="Cobros confirmados" value={copMoney(r.collections)} delta={count('CHARGE')} />
            <FinancialSummary label="Reembolsos confirmados" value={copMoney(r.refunds)} delta={count('REFUND')} />
            <FinancialSummary label="Dispersiones confirmadas" value={copMoney(r.settlements)} delta={count('SETTLEMENT')} />
            <FinancialSummary label="Comisiones confirmadas" value={copMoney(r.commissions)} delta={`${count('COMMISSION')} · métrica informativa`} />
          </div>
          <div className={styles.split}>
            <section className={`${styles.panel} ${styles.big}`}>
              <p className={styles.bigLabel}>{bigLabel}</p>
              <p className={styles.bigSub}>{bigSub}</p>
              <p className={styles.bigValue}>{copMoney(r.net)}</p>
              <p className={styles.bigSub}>{cmpText}</p>
            </section>
            <section className={`${styles.panel} ${styles.byType}`}>
              <h3>Registros por tipo</h3>
              <dl>
                {TYPES.map((t) => (
                  <div key={t} style={{ display: 'contents' }}><dt>{TYPE_LABEL[t]}</dt><dd>{r.counts[t] ?? 0}</dd></div>
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
