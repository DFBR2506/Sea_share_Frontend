import { cloneElement, isValidElement } from 'react'
import { cx } from '@/lib/cx'
import styles from './SmoothButton.module.css'

const Spinner = () => (
  <svg className={styles.spinnerIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity=".25" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".9" />
  </svg>
)

/**
 * Port a CSS Modules del SmoothButton de SmoothUI (smoothui.dev).
 *  variant: solid | soft | outline | ghost | link | candy   (apariencia)
 *  color:   accent | neutral | destructive | blue | amber | green   (tono)
 *  size:    xs | sm | default | lg | icon | icon-sm | icon-lg
 *  shape:   default | pill | square
 * `color` solo fija --btn / --btn-hover / --btn-fg; cada variant los consume.
 * Se puede afinar por instancia sobrescribiendo esas variables en `className`.
 */
export function SmoothButton({
  variant = 'solid',
  color,
  size = 'default',
  shape = 'default',
  asChild = false,
  loading = false,
  prefix,
  suffix,
  className,
  disabled,
  children,
  type,
  ...props
}) {
  const classes = cx(
    styles.btn,
    styles[variant],
    color && styles[`color-${color}`],
    styles[`size-${size}`],
    shape !== 'default' && styles[`shape-${shape}`],
    className,
  )

  // asChild delega el render al hijo (p. ej. <Link>): sin spinner ni slots.
  if (asChild) {
    if (!isValidElement(children)) return null
    return cloneElement(children, { ...props, className: cx(classes, children.props.className), 'data-variant': variant })
  }

  return (
    <button
      type={type ?? 'button'}
      className={classes}
      data-variant={variant}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      {...props}
    >
      <span className={cx(styles.spinner, loading && styles.spinning)} aria-hidden="true"><Spinner /></span>
      {prefix}
      {children}
      {suffix}
    </button>
  )
}
