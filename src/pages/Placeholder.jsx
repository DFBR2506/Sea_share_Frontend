/** Pantalla provisional hasta implementarla en su fase. */
export default function Placeholder({ title, figma }) {
  return (
    <section>
      <h1 style={{ margin: 0, font: 'var(--text-title)' }}>{title}</h1>
      <p style={{ color: 'var(--seashare-color-text-secondary)' }}>
        Pantalla pendiente{figma ? ` · Figma ${figma}` : ''}.
      </p>
    </section>
  )
}
