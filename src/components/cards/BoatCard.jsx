import { Button } from '@/components/ui'
import styles from './BoatCard.module.css'

/** meta: texto ya compuesto, p. ej. "Marina de Miami · 8 pasajeros · Capitán incluido" */
export function BoatCard({ name, meta, price, imageUrl, actionLabel = 'Reservar', actionVariant = 'primary', onAction, onClick }) {
  return (
    <article className={styles.card} onClick={onClick}>
      {imageUrl ? <img src={imageUrl} alt={name} className={styles.image} /> : <div className={styles.image} role="img" aria-label="Foto del barco" />}
      <h3 className={styles.name}>{name}</h3>
      <p className={styles.meta}>{meta}</p>
      <div className={styles.footer}>
        <span className={styles.price}>{price}</span>
        {onAction && (
          <Button
            variant={actionVariant}
            onClick={(e) => { e.stopPropagation(); onAction() }}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </article>
  )
}
