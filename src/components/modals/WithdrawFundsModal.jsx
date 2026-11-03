import filterIcon from '@/assets/icons/filter.svg'
import { Button, Dropdown, Input, Modal } from '@/components/ui'
import styles from './Modals.module.css'

/** accounts: [{value,label}] — p. ej. "Cuenta principal · **** 2840" */
export function WithdrawFundsModal({ open, onClose, onConfirm, accounts, account, onAccountChange, amount, onAmountChange, error, loading = false }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Retirar fondos"
      subtitle="Selecciona la cuenta y el monto a transferir."
      icon={<img src={filterIcon} alt="" className={styles.icon} />}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button onClick={onConfirm} disabled={loading}>Confirmar</Button>
        </>
      }
    >
      <Dropdown label="Cuenta" options={accounts} value={account} onChange={(e) => onAccountChange?.(e.target.value)} />
      <Input
        label="Monto a retirar"
        inputMode="decimal"
        placeholder="$ 0"
        value={amount}
        onChange={(e) => onAmountChange?.(e.target.value)}
        error={error}
      />
    </Modal>
  )
}
