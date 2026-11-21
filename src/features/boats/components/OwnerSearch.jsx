import { useDeferredValue, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, SearchBar } from '@/components/ui'
import { cx } from '@/lib/cx'
import { OWNER_SEARCH_MIN_CHARS, useOwnerSearch } from '../hooks'
import { ownerInitials } from '../format'
import styles from './OwnerSearch.module.css'

const TEXTS = {
  heading: 'Resultados de búsqueda (propietario)',
  empty: 'No se encontraron propietarios con esa búsqueda.',
  more: 'Hay más resultados. Escribe más caracteres para precisar la búsqueda.',
  error: 'No se pudo realizar la búsqueda.',
}

/**
 * Barra «Buscar propietario por nombre o cédula» con su panel de resultados. Busca desde 3
 * caracteres; las flechas recorren la lista y Enter abre el propietario resaltado. Se cierra con
 * Esc, al hacer clic fuera o al borrar el texto.
 */
export function OwnerSearch({ value, onChange, placeholder = 'Buscar propietario por nombre o cédula…' }) {
  const navigate = useNavigate()
  const rootRef = useRef(null)
  // Se guarda la búsqueda con la que se cerró el panel (Esc o clic fuera): al escribir otra vuelve
  // a abrirse sin necesidad de sincronizar banderas en un efecto.
  const [closedFor, setClosedFor] = useState(null)
  const [highlight, setHighlight] = useState({ query: '', index: -1 })
  const query = value.trim()
  // El valor diferido evita una consulta por pulsación mientras se escribe.
  const deferred = useDeferredValue(query)
  const long = query.length >= OWNER_SEARCH_MIN_CHARS
  const { data, isPending, error, refetch } = useOwnerSearch(deferred)
  const owners = data?.owners ?? []
  const open = long && closedFor !== query
  const stale = deferred !== query
  const active = highlight.query === deferred ? highlight.index : -1
  const setActive = (index) => setHighlight({ query: deferred, index })
  const close = () => setClosedFor(query)

  useEffect(() => {
    if (!open) return
    const onClick = (e) => { if (!rootRef.current?.contains(e.target)) setClosedFor(query) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open, query])

  const openOwner = (id) => navigate(`/admin/propietarios/${id}`)

  const onKeyDown = (event) => {
    if (event.key === 'Escape') return close()
    if (!owners.length) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((active + 1) % owners.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive(active <= 0 ? owners.length - 1 : active - 1)
    } else if (event.key === 'Enter' && active >= 0) {
      event.preventDefault()
      openOwner(owners[active].id)
    }
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <SearchBar
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={100}
        role="combobox"
        aria-expanded={open}
        aria-controls="owner-search-panel"
        aria-activedescendant={active >= 0 ? `owner-option-${active}` : undefined}
        autoComplete="off"
        onKeyDown={onKeyDown}
      />
      {open && (
        <div className={styles.panel} id="owner-search-panel" role="listbox" aria-live="polite">
          {error ? (
            <div className={styles.message}>
              <p>{TEXTS.error}</p>
              <Button variant="soft" square onClick={() => refetch()}>Reintentar</Button>
            </div>
          ) : isPending || stale ? (
            <div className={styles.message} role="status" aria-label="Buscando propietarios">
              <p>Buscando…</p>
            </div>
          ) : owners.length === 0 ? (
            <p className={styles.message}>{TEXTS.empty}</p>
          ) : (
            <>
              <p className={styles.heading}>{TEXTS.heading}</p>
              {owners.map((owner, index) => (
                <div
                  key={owner.id}
                  id={`owner-option-${index}`}
                  role="option"
                  aria-selected={index === active}
                  className={cx(styles.row, index === active && styles.rowActive)}
                  onMouseEnter={() => setActive(index)}
                >
                  <span className={styles.avatar} aria-hidden="true">{ownerInitials(owner.name)}</span>
                  <span className={styles.person}>
                    <span className={styles.name}>{owner.name}</span>
                    <span className={styles.doc}>{owner.document}</span>
                  </span>
                  <Button variant="outline" square onClick={() => openOwner(owner.id)}>Ver Detalles</Button>
                </div>
              ))}
              {data?.hasMore && <p className={styles.more}>{TEXTS.more}</p>}
            </>
          )}
        </div>
      )}
    </div>
  )
}
