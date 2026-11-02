import { useState } from 'react'
import { FinancialSummary } from '@/components/cards'
import { WithdrawFundsModal } from '@/components/modals'
import { Button } from '@/components/ui'
import { copPlain } from '@/lib/dates'
import { useAccounts, useWithdraw } from '../hooks'
import styles from '../components/FinanceUI.module.css'
import local from './params.module.css'

/** Cuentas de retiro del propietario + retiro de fondos (modal del sistema de diseño). */
export default function OwnerAccountsPage() {
  const { data, isPending } = useAccounts()
  const withdraw = useWithdraw()
  const [open, setOpen] = useState(false)
  const [account, setAccount] = useState('2840')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  if (isPending) return <p className={styles.empty}>Cargando…</p>

  const close = () => { setOpen(false); setAmount(''); setError('') }
  const confirm = () => {
    const value = Number(amount.replace(/[^\d]/g, ''))
    if (!value) return setError('Ingresa un monto mayor a 0')
    if (value > data.balance) return setError('El monto supera tu saldo disponible')
    withdraw.mutate({ account, amount: value }, { onSuccess: close, onError: (err) => setError(err.message) })
  }

  return (
    <>
      <p className={styles.eyebrow}>Cuentas de retiro</p>
      <h1 className={styles.title}>Cuentas de retiro</h1>
      <p className={styles.lead}>Transfiere tus ganancias disponibles a una de tus cuentas registradas.</p>

      <div className={styles.kpis}>
        <FinancialSummary label="Saldo disponible para retiro" value={copPlain(data.balance)} delta="Dispersiones confirmadas" />
      </div>

      <section className={`${styles.panel} ${local.card}`}>
        <h2 className={local.h2}>Cuentas registradas</h2>
        <ul style={{ margin: '12px 0 20px', padding: 0, listStyle: 'none', display: 'grid', gap: 12 }}>
          {data.accounts.map((a) => (
            <li key={a.value} style={{ padding: '12px 16px', border: '1px solid var(--seashare-color-border-default)', borderRadius: 10, fontSize: 13, color: 'var(--seashare-color-brand-primary)' }}>{a.label}</li>
          ))}
        </ul>
        <Button onClick={() => setOpen(true)}>Retirar fondos</Button>
      </section>

      {data.withdrawals.length > 0 && (
        <section className={`${styles.panel} ${local.card}`}>
          <h2 className={local.h2}>Retiros recientes</h2>
          <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 8, fontSize: 13, color: 'var(--seashare-color-brand-primary)' }}>
            {data.withdrawals.map((w) => <li key={w.id}>{w.at} · {w.account} · <strong>{copPlain(w.amount)}</strong></li>)}
          </ul>
        </section>
      )}

      <WithdrawFundsModal
        open={open}
        onClose={close}
        onConfirm={confirm}
        accounts={data.accounts}
        account={account}
        onAccountChange={setAccount}
        amount={amount}
        onAmountChange={(v) => { setAmount(v); setError('') }}
        error={error}
        loading={withdraw.isPending}
      />
    </>
  )
}
