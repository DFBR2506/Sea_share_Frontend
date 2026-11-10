import { useEffect, useRef, useState } from 'react'
import { cx } from '@/lib/cx'
import styles from './AnimatedStepper.module.css'

/** Dirección del último cambio de paso (1 avanza, -1 retrocede), para el slide del contenido. */
export function useStepDirection(step) {
  const [prev, setPrev] = useState(step)
  const [direction, setDirection] = useState(1)
  if (step !== prev) {
    setDirection(step > prev ? 1 : -1)
    setPrev(step)
  }
  return direction
}

/**
 * Indicador de pasos animado (horizontal | vertical): línea de progreso animada,
 * navegación por clic y teclado (flechas). `currentStep` es 0-based; el padre decide si
 * `onStepChange` se acepta (p. ej. validar antes de avanzar).
 */
export function AnimatedStepper({ steps, currentStep, onStepChange, orientation = 'horizontal', clickable = true, className }) {
  const groupRef = useRef(null)
  const count = steps.length
  const progress = count > 1 ? currentStep / (count - 1) : 0

  // Si el foco estaba en el indicador, lo sigue al paso activo.
  useEffect(() => {
    const group = groupRef.current
    if (group?.contains(document.activeElement)) group.querySelectorAll('[role="tab"]')[currentStep]?.focus()
  }, [currentStep])

  const onKeyDown = (e) => {
    if (!clickable) return
    const forward = e.key === 'ArrowRight' || e.key === 'ArrowDown'
    const back = e.key === 'ArrowLeft' || e.key === 'ArrowUp'
    if (!forward && !back) return
    e.preventDefault()
    const target = currentStep + (forward ? 1 : -1)
    if (target >= 0 && target < count) onStepChange?.(target)
  }

  return (
    <div
      ref={groupRef}
      role="group"
      aria-label="Progress steps"
      data-orientation={orientation}
      className={cx(styles.stepper, orientation === 'vertical' && styles.vertical, className)}
      style={{ '--progress': progress, '--count': count }}
      onKeyDown={onKeyDown}
    >
      <div className={styles.track} aria-hidden="true"><div className={styles.fill} /></div>
      {steps.map((s, i) => {
        const done = i < currentStep
        const active = i === currentStep
        return (
          <button
            key={s.label}
            type="button"
            role="tab"
            id={`stepper-tab-${i}`}
            aria-selected={active}
            aria-current={active ? 'step' : undefined}
            tabIndex={active ? 0 : -1}
            disabled={!clickable}
            className={cx(styles.item, active && styles.active, done && styles.done)}
            onClick={() => i !== currentStep && onStepChange?.(i)}
          >
            <span className={styles.dot}>{done ? '✓' : i + 1}</span>
            <span className={styles.label}>{s.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/** Contenido del paso con transición de slide direccional. Úsalo con `key` = paso. */
export function StepContent({ step, direction = 1, children }) {
  return (
    <div key={step} role="tabpanel" aria-labelledby={`stepper-tab-${step}`} className={cx(styles.content, direction < 0 && styles.fromLeft)}>
      {children}
    </div>
  )
}
