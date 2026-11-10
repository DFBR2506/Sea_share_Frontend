import { useEffect, useId, useRef, useState } from 'react'
import { cx } from '@/lib/cx'
import styles from './Select.module.css'

/** Aplana opciones planas o agrupadas ({ label, options }) en [{ group?, value, label }]. */
function flatten(options) {
  return options.flatMap((o) => (o.options ? o.options.map((c) => ({ ...c, group: o.label })) : [o]))
}

/**
 * Select personalizado (listbox accesible): flechas, Home/End, Enter/Espacio, Escape y typeahead.
 * options: [{ value, label }] o agrupadas [{ label, options: [...] }].
 * onChange recibe un objeto con forma de evento ({ target: { value } }) para ser intercambiable con <select>.
 */
export function Select({ options, value, onChange, placeholder, disabled, id, className, 'aria-invalid': invalid, ...rest }) {
  const items = flatten(placeholder ? [{ value: '', label: placeholder }, ...options] : options)
  const listId = useId()
  const rootRef = useRef(null)
  const listRef = useRef(null)
  const typed = useRef({ text: '', timer: 0 })
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  const selectedIndex = items.findIndex((o) => String(o.value) === String(value ?? ''))
  const selected = selectedIndex >= 0 ? items[selectedIndex] : null
  const showsPlaceholder = !selected || (placeholder && selected.value === '')

  const openList = () => { setActive(Math.max(selectedIndex, 0)); setOpen(true) }
  const choose = (i) => {
    onChange?.({ target: { value: items[i].value } })
    setOpen(false)
    rootRef.current?.querySelector('button').focus()
  }

  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])

  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView?.({ block: 'nearest' })
  }, [open, active])

  const onKeyDown = (e) => {
    if (disabled) return
    const last = items.length - 1
    const move = (i) => { e.preventDefault(); if (open) setActive(i); else { setActive(i); setOpen(true) } }
    switch (e.key) {
      case 'ArrowDown': return move(open ? Math.min(active + 1, last) : Math.max(selectedIndex, 0))
      case 'ArrowUp': return move(open ? Math.max(active - 1, 0) : Math.max(selectedIndex, 0))
      case 'Home': return move(0)
      case 'End': return move(last)
      case 'Enter':
      case ' ':
        e.preventDefault()
        return open ? choose(active) : openList()
      case 'Escape':
        if (open) { e.preventDefault(); setOpen(false) }
        return
      case 'Tab':
        return setOpen(false)
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const t = typed.current
          clearTimeout(t.timer)
          t.text += e.key.toLowerCase()
          t.timer = setTimeout(() => { t.text = '' }, 600)
          const from = open ? active + 1 : 0
          const order = [...items.keys()].map((_, k) => (from + k) % items.length)
          const hit = order.find((i) => items[i].label.toLowerCase().startsWith(t.text))
          if (hit != null) { setActive(hit); if (!open) setOpen(true) }
        }
    }
  }

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-invalid={invalid}
        disabled={disabled}
        className={cx(className, styles.trigger, open && styles.opened)}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        {...rest}
      >
        <span className={cx(styles.value, showsPlaceholder && styles.placeholder)}>{showsPlaceholder ? (placeholder ?? '') : selected.label}</span>
        <svg className={styles.chevron} width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m1 1.5 5 5 5-5" /></svg>
      </button>
      {open && (
        <ul ref={listRef} id={listId} role="listbox" className={styles.list}>
          {items.map((o, i) => (
            <li key={`${o.value}-${i}`} role="presentation" className={styles.entry}>
              {o.group && o.group !== items[i - 1]?.group && <span className={styles.group}>{o.group}</span>}
              <span
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === selectedIndex}
                className={cx(styles.option, i === active && styles.active, i === selectedIndex && styles.chosen)}
                onPointerEnter={() => setActive(i)}
                onClick={() => choose(i)}
              >
                {o.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
