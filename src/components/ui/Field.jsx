import { useId } from 'react'
import { cx } from '@/lib/cx'
import styles from './Field.module.css'

function Field({ id, label, error, caps, render, ...props }) {
  const auto = useId()
  const fieldId = id ?? auto
  return (
    <div className={cx(styles.field, caps && styles.caps)}>
      {label && <label htmlFor={fieldId} className={styles.label}>{label}</label>}
      {render({ id: fieldId, className: cx(styles.control, error && styles.invalid), 'aria-invalid': !!error, ...props })}
      {error && <span className={styles.error} role="alert">{error}</span>}
    </div>
  )
}

export function Input(props) {
  return <Field {...props} render={(p) => <input {...p} />} />
}

export function Textarea(props) {
  return <Field {...props} render={(p) => <textarea {...p} />} />
}

/** Dropdown basado en <select> nativo: accesible y con picker móvil. options: [{value,label}] */
export function Dropdown({ options, placeholder, ...props }) {
  return (
    <Field
      {...props}
      render={(p) => (
        <select {...p}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}
    />
  )
}
