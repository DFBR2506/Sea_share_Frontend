import { useState } from 'react'
import { Avatar, Button, Dropdown, Input, Modal, SearchBar, StatusBadge, Textarea, Toggle } from '@/components/ui'
import styles from './ComponentCatalog.module.css'

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
    </main>
  )
}
