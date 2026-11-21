import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Chip, Modal, StatusPill } from '@/components/ui'
import { cx } from '@/lib/cx'
import { formatDate, infoFor, parseVessel, splitReason, SUMMARIES, timeAgo } from './format'
import { useMarkAllRead, useMarkRead, useNotifications } from './hooks'
import styles from './NotificationBell.module.css'

const PATHS = {
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5',
  wrench: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
  check: 'M8 12l3 3 5-6',
}

function Icon({ name, size = 20 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === 'check' && <circle cx="12" cy="12" r="9" />}
      <path d={PATHS[name] ?? PATHS.bell} />
    </svg>
  )
}

/** Ventana «Detalle de Notificación» del aviso de mantenimiento del administrador. */
function NoticeDetailModal({ item, onClose }) {
  const { name } = parseVessel(item?.message)
  const { reason } = splitReason(item?.message)
  return (
    <Modal
      open={Boolean(item)}
      onClose={onClose}
      tone="default"
      title="Detalle de Notificación"
      subtitle="Aviso enviado por el Administrador General"
      icon={<span className={styles.modalIcon}><Icon name="wrench" size={18} /></span>}
      footer={<Button square onClick={onClose}>Entendido y cerrar</Button>}
    >
      <div className={styles.detail}>
        <div className={styles.detailHead}>
          <div>
            <span className={styles.detailLabel}>Embarcación afectada</span>
            <strong className={styles.detailName}>{name ?? 'Tu embarcación'}</strong>
          </div>
          <StatusPill tone="warn">En Mantenimiento</StatusPill>
        </div>
        <span className={styles.detailLabel}>Motivo registrado por administración</span>
        <blockquote className={styles.quote}>“{reason ?? item?.message}”</blockquote>
        <span className={styles.detailDate}>{formatDate(item?.createdAt)}</span>
      </div>
    </Modal>
  )
}

function NotificationRow({ item, onRead, onDetail, onGoToVessel }) {
  const info = infoFor(item.type)
  const notice = item.type === 'MAINTENANCE_NOTICE'
  const request = item.type === 'REVIEW_REQUEST'
  const card = notice || request
  const { text, reason } = splitReason(item.message)
  const title = card ? (parseVessel(item.message).name ?? info.title) : info.title

  const body = (
    <>
      <span className={cx(styles.itemIcon, styles[info.tone])}><Icon name={info.icon} /></span>
      <span className={styles.itemBody}>
        <span className={styles.itemTitleRow}>
          <strong className={styles.itemTitle}>{title}</strong>
          {!item.read && <span className={styles.unreadDot} aria-label="Sin leer" />}
        </span>
        <span className={styles.itemMessage}>{card ? SUMMARIES[item.type] : text}</span>
        {!card && reason && (
          <span className={styles.itemReason}>
            <span className={styles.itemReasonLabel}>Motivo</span>
            <span>{reason}</span>
          </span>
        )}
        {notice && <button type="button" className={styles.itemAction} onClick={(e) => { e.stopPropagation(); onDetail(item) }}>Revisar completamente</button>}
        {request && item.vesselId && <button type="button" className={styles.itemAction} onClick={(e) => { e.stopPropagation(); onGoToVessel(item) }}>Ver detalles</button>}
        <span className={styles.itemDate} title={formatDate(item.createdAt)}>{timeAgo(item.createdAt)}</span>
      </span>
    </>
  )

  const className = cx(styles.item, !item.read && styles.itemUnread)
  return (
    <li>
      {card
        ? <div className={className}>{body}</div>
        : <button type="button" className={className} onClick={() => onRead(item)}>{body}</button>}
    </li>
  )
}

/**
 * Campana del propietario y del administrador: contador de avisos sin leer y panel con el detalle
 * completo. Se cierra con Esc o al hacer clic fuera; al tocar un aviso sin leer se marca leído.
 */
export function NotificationBell({ role }) {
  const navigate = useNavigate()
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const { data, isPending, error, refetch } = useNotifications(role === 'OWNER' || role === 'ADMIN')
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()
  const items = data?.items ?? []
  const unread = data?.unread ?? 0

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); buttonRef.current?.focus() } }
    const onClick = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick) }
  }, [open])

  const read = (item) => { if (!item.read) markRead.mutate(item.id) }
  const openDetail = (item) => { read(item); setOpen(false); setDetail(item) }
  const goToVessel = (item) => { read(item); setOpen(false); navigate(`/admin/embarcaciones/${item.vesselId}`) }

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.bell}
        aria-label={unread > 0 ? `Notificaciones, ${unread} sin leer` : 'Notificaciones'}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => { setOpen((v) => !v); if (!open) refetch() }}
      >
        <Icon name="bell" size={22} />
        {unread > 0 && <span className={styles.badge}>{unread > 99 ? '99+' : unread}</span>}
      </button>

      {open && (
        <div className={styles.panel} role="region" aria-label="Notificaciones">
          <div className={styles.panelHead}>
            <div className={styles.panelTitleRow}>
              <strong className={styles.panelTitle}>Notificaciones</strong>
              {unread > 0 && <Chip>{unread} nueva{unread > 1 ? 's' : ''}</Chip>}
            </div>
            {unread > 0 && (
              <button type="button" className={styles.markAll} onClick={() => markAllRead.mutate()}>Marcar todas como leídas</button>
            )}
          </div>
          {error ? (
            <div className={styles.empty}>
              <span className={styles.emptyArt}><Icon name="bell" size={30} /></span>
              <p>No se pudieron cargar las notificaciones.</p>
              <Button variant="soft" square onClick={() => refetch()}>Reintentar</Button>
            </div>
          ) : isPending ? (
            <p className={styles.loading}>Cargando…</p>
          ) : items.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyArt}><Icon name="bell" size={30} /></span>
              <p>No tienes notificaciones.</p>
            </div>
          ) : (
            <ul className={styles.list}>
              {items.map((item) => (
                <NotificationRow key={item.id} item={item} onRead={read} onDetail={openDetail} onGoToVessel={goToVessel} />
              ))}
            </ul>
          )}
        </div>
      )}

      <NoticeDetailModal item={detail} onClose={() => setDetail(null)} />
    </div>
  )
}
