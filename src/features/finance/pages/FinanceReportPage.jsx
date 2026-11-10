import { useState } from 'react'
import { FinancialSummary } from '@/components/cards'
import downloadIcon from '@/assets/icons/download.svg'
import { Dropdown, SlideButton, SlidingTabs } from '@/components/ui'
import { millions } from '@/lib/dates'
import { listPeriods } from '../api'
import { TYPE_LABEL } from '../api/mocks'
import { useReport } from '../hooks'
import styles from '../components/FinanceUI.module.css'

const PERIODICITY = [{ value: 'QUINCENAL', label: 'Quincenal' }, { value: 'MENSUAL', label: 'Mensual' }, { value: 'TRIMESTRAL', label: 'Trimestral' }]

function downloadCsv(report, scope) {
  const rows = [
    ['Concepto', 'Valor (millones COP)'],
    ['Cobros confirmados', report.cobros], ['Reembolsos confirmados', report.reembolsos],
    ['Dispersiones confirmadas', report.dispersiones], ['Comisiones confirmadas', report.comisiones],
    [scope === 'owner' ? 'Ganancias del propietario' : 'Neto generado', (scope === 'owner' ? report.ownerGain : report.net)[0]],
  ]
  const url = URL.createObjectURL(new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: `informe-${report.periodicity.toLowerCase()}.csv` })
  a.click()
  URL.revokeObjectURL(url)
}

/** Informe financiero (feature 013). scope: 'owner' | 'admin'. */
export default function FinanceReportPage({ scope }) {
  const [periodicity, setPeriodicity] = useState('MENSUAL')
  const [period, setPeriod] = useState('')
  const periods = listPeriods(periodicity)
  const { data: r, isPending } = useReport({ periodicity, period: period || periods[0] })

  const changePeriodicity = (v) => { setPeriodicity(v); setPeriod('') }
  const big = scope === 'owner'
    ? { label: 'Ganancias del propietario', sub: 'Total de dispersiones confirmadas a favor', data: r?.ownerGain }
    : { label: 'Neto generado', sub: 'Cobros − reembolsos − dispersiones', data: r?.net }

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
          <div style={{ width: 220 }}>
            <Dropdown label="Período" options={periods.map((p) => ({ value: p, label: p }))} value={period || periods[0]} onChange={(e) => setPeriod(e.target.value)} />
          </div>
        </div>
        <SlideButton icon={downloadIcon} disabled={!r} onClick={() => downloadCsv(r, scope)}>Exportar CSV</SlideButton>
      </div>

      {isPending ? <p className={styles.empty}>Cargando…</p> : (
        <>
          <div className={styles.kpis}>
            <FinancialSummary label="Cobros confirmados" value={millions(r.cobros)} delta={`${r.deltas[0]} vs. período anterior`} />
            <FinancialSummary label="Reembolsos confirmados" value={millions(r.reembolsos)} delta={`${r.deltas[1]} vs. período anterior`} />
            <FinancialSummary label="Dispersiones confirmadas" value={millions(r.dispersiones)} delta={`${r.deltas[2]} vs. período anterior`} />
            <FinancialSummary label="Comisiones confirmadas" value={millions(r.comisiones)} delta="Métrica informativa" />
          </div>
          <div className={styles.split}>
            <section className={`${styles.panel} ${styles.big}`}>
              <p className={styles.bigLabel}>{big.label}</p>
              <p className={styles.bigSub}>{big.sub}</p>
              <p className={styles.bigValue}>+ {millions(big.data[0])} · {big.data[1]} frente al período anterior</p>
            </section>
            <section className={`${styles.panel} ${styles.byType}`}>
              <h3>Registros por tipo</h3>
              <dl>
                {['COBRO', 'REEMBOLSO', 'DISPERSION', 'COMISION'].map((t, i) => (
                  <div key={t} style={{ display: 'contents' }}><dt>{TYPE_LABEL[t]}</dt><dd>{r.counts[i]}</dd></div>
                ))}
              </dl>
            </section>
          </div>
          <p className={styles.footnote}>
            {scope === 'owner' ? `Período cerrado · alcance propietario · garantías pendientes excluidas` : `Período cerrado · ${r.closing} · garantías pendientes excluidas`}
          </p>
        </>
      )}
    </>
  )
}
