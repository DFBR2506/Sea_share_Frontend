import { useState } from 'react'
import { Avatar, Button, Dropdown, Input, Modal, SearchBar, StatusBadge, Textarea, Toggle } from '@/components/ui'
import { BoatCard, FinancialSummary, ReservationItem } from '@/components/cards'
import { FilterBar } from '@/components/filters'
import { OWNER_FINANCE_SUBNAV, TopBar } from '@/components/layout'
import { ConfirmReservationModal, DisputeResolutionModal, WithdrawFundsModal } from '@/components/modals'
import { MemoryRouter } from 'react-router-dom'
import styles from './ComponentCatalog.module.css'

const TOP_BARS = [
  { role: 'ADMIN', path: '/admin' },
  { role: 'OWNER', path: '/owner/embarcaciones' },
  { role: 'OWNER', path: '/owner/finanzas/balance', subItems: OWNER_FINANCE_SUBNAV },
  { role: 'RENTER', path: '/explorar' },
  { role: 'FINADMIN', path: '/finadmin/parametros' },
]

function Section({ title, children }) {
  return (
    <section className={styles.section}>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

export default function ComponentCatalog() {
  const [on, setOn] = useState(false)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [modal, setModal] = useState(null)
  const [types, setTypes] = useState(['velero'])
  const [note, setNote] = useState('')
  const [amount, setAmount] = useState('')
  const [account, setAccount] = useState('2840')
  const close = () => setModal(null)

  return (
    <main className={styles.page}>
      <h1>SeaShare · Catálogo de componentes</h1>

      <Section title="Button">
        <div className={styles.row}>
          <Button>Continuar</Button>
          <Button variant="secondary">Reservar</Button>
          <Button variant="danger">Confirmar</Button>
          <Button disabled>Deshabilitado</Button>
        </div>
      </Section>

      <Section title="Controles">
        <div className={styles.col}>
          <Toggle checked={on} onChange={setOn} label="Activar" />
          <Dropdown
            label="Tipo de embarcación"
            placeholder="Tipo de embarcación"
            options={[{ value: 'velero', label: 'Velero' }, { value: 'yate', label: 'Yate' }, { value: 'catamaran', label: 'Catamarán' }]}
          />
          <SearchBar value={query} onChange={setQuery} />
          <Input label="Monto a retirar" placeholder="$ 0" />
          <Input label="Con error" error="Campo requerido" />
          <Textarea label="Motivo de la resolución" placeholder="Escribe una nota opcional…" />
        </div>
      </Section>

      <Section title="StatusBadge / Avatar">
        <div className={styles.row}>
          <StatusBadge>Confirmada</StatusBadge>
          <StatusBadge tone="neutral">Borrador</StatusBadge>
          <StatusBadge tone="warning">Mantenimiento</StatusBadge>
          <StatusBadge tone="danger">Cancelada</StatusBadge>
          <Avatar initial="O" />
        </div>
      </Section>

      <Section title="Modal">
        <Button onClick={() => setOpen(true)}>Abrir modal</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Confirmar reserva"
          subtitle="Revisa los detalles antes de continuar."
          icon="🔍"
          footer={<><Button onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={() => setOpen(false)}>Confirmar</Button></>}
        >
          <strong>Sunset Sailing Catamarán</strong>
          <span>25–27 sep · 3 noches · 3 pasajeros</span>
        </Modal>
      </Section>
      <Section title="TopBar (por rol · redimensiona para ver el menú móvil)">
        <div className={styles.stack}>
          {TOP_BARS.map(({ role, path, subItems }) => (
            <MemoryRouter key={role + path} initialEntries={[path]}>
              <TopBar role={role} subItems={subItems} sticky={false} />
            </MemoryRouter>
          ))}
        </div>
      </Section>

      <Section title="Cards & Data Display">
        <div className={styles.grid}>
          <BoatCard name="Sunset Sailing Catamarán" meta="Marina de Miami · 8 pasajeros · Capitán incluido" price="$250 / día" onAction={() => {}} />
          <div className={styles.col}>
            <ReservationItem title="Sunset Sailing Catamarán" dates="25–27 sep · 3 noches" status={{ label: 'Confirmada', tone: 'success' }} />
            <FinancialSummary label="Cobros confirmados" value="$ 18.42 M" delta="+12.4% vs. período anterior" />
          </div>
        </div>
      </Section>

      <Section title="FilterBar">
        <FilterBar
          dates="19 sep – 25 sep"
          passengers="2"
          types={[{ value: 'velero', label: 'Velero' }, { value: 'yate', label: 'Yate' }, { value: 'catamaran', label: 'Catamarán' }]}
          selectedTypes={types}
          onToggleType={(v) => setTypes((t) => (t.includes(v) ? t.filter((x) => x !== v) : [...t, v]))}
        />
      </Section>

      <Section title="Modales de negocio">
        <div className={styles.row}>
          <Button onClick={() => setModal('reserva')}>Confirmar reserva</Button>
          <Button onClick={() => setModal('disputa')}>Resolver disputa</Button>
          <Button onClick={() => setModal('retiro')}>Retirar fondos</Button>
        </div>
        <ConfirmReservationModal open={modal === 'reserva'} onClose={close} onConfirm={close} boatName="Sunset Sailing Catamarán" summary="25–27 sep · 3 noches · 3 pasajeros" total="$1,640.00" />
        <DisputeResolutionModal open={modal === 'disputa'} onClose={close} onConfirm={close} disputeCode="D-2014" claim="Reclamo del propietario: el timón llegó dañado y hubo retraso en la entrega." note={note} onNoteChange={setNote} />
        <WithdrawFundsModal open={modal === 'retiro'} onClose={close} onConfirm={close} accounts={[{ value: '2840', label: 'Cuenta principal · **** 2840' }]} account={account} onAccountChange={setAccount} amount={amount} onAmountChange={setAmount} />
      </Section>
    </main>
  )
}
