import styles from './LoginBackground.module.css'

const delay = (s) => ({ animationDelay: `${s}s` })
const sparkles = [
  { x: 400, y: 468, w: 46, h: 4, d: 0 },
  { x: 520, y: 476, w: 34, h: 4, d: -1.2 },
  { x: 430, y: 525, w: 70, h: 5, d: -0.6 },
  { x: 350, y: 580, w: 90, h: 5, d: -2 },
  { x: 520, y: 590, w: 60, h: 5, d: -1.7 },
]

/** Fondo animado de la pantalla de login (SVG puro, sin interacción). */
export function LoginBackground() {
  return (
    <div className={styles.bg}>
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <linearGradient id="lb-sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="470">
            <stop offset="0" stopColor="#1f3f9a" />
            <stop offset="1" stopColor="#bfe6f5" />
          </linearGradient>
          <path id="lb-wa" d="M0 0 Q120 -26 240 0 T480 0 T720 0 T960 0 T1200 0 T1440 0 T1680 0 T1920 0 V120 H0Z" />
          <path id="lb-wb" d="M0 0 Q90 -20 180 0 T360 0 T540 0 T720 0 T900 0 T1080 0 T1260 0 T1440 0 T1620 0 T1800 0 V120 H0Z" />
          <path id="lb-wc" d="M0 0 Q120 -26 240 0 T480 0 T720 0 T960 0 T1200 0 T1440 0 T1680 0 T1920 0 V260 H0Z" />
        </defs>

        <rect x="0" y="0" width="1440" height="900" fill="url(#lb-sky)" />

        <g className={styles.cloud}>
          <rect x="150" y="150" width="300" height="46" rx="23" fill="#cfe6f8" />
          <rect x="220" y="124" width="170" height="46" rx="23" fill="#cfe6f8" />
        </g>
        <g className={styles.cloud2}>
          <rect x="860" y="230" width="260" height="40" rx="20" fill="#b8d6f2" />
          <rect x="930" y="208" width="130" height="40" rx="20" fill="#b8d6f2" />
          <rect x="40" y="300" width="200" height="32" rx="16" fill="#c3def5" />
        </g>

        <g className={styles.sun}>
          <circle className={styles.halo} cx="470" cy="380" r="210" fill="#e6f6ff" opacity=".14" />
          <circle className={styles.halo} cx="470" cy="380" r="150" fill="#e6f6ff" opacity=".2" style={delay(-2)} />
          <circle className={styles.halo} cx="470" cy="380" r="108" fill="#e6f6ff" opacity=".3" style={delay(-4)} />
          <circle cx="470" cy="380" r="78" fill="#f4fbff" />
        </g>

        <g>
          <g transform="translate(0,430)"><g className={styles.bob}><g className={styles.sa}><use href="#lb-wa" fill="#5fa8d8" /></g></g></g>
          <g transform="translate(0,482)"><g className={styles.bob} style={delay(-1.5)}><g className={`${styles.sb} ${styles.rev}`}><use href="#lb-wb" fill="#3f86c6" /></g></g></g>
          <g transform="translate(0,538)"><g className={styles.bob} style={delay(-3)}><g className={styles.sa} style={{ animationDelay: '-7s', animationDuration: '20s' }}><use href="#lb-wa" fill="#2f65b0" /></g></g></g>
          <g transform="translate(0,598)"><g className={styles.bob} style={delay(-2)}><g className={`${styles.sb} ${styles.rev}`} style={{ animationDuration: '18s' }}><use href="#lb-wb" fill="#244a96" /></g></g></g>
          <g transform="translate(0,662)"><g className={styles.bob} style={delay(-4)}><g className={styles.sa} style={{ animationDelay: '-3s', animationDuration: '16s' }}><use href="#lb-wc" fill="#1b3478" /></g></g></g>
        </g>

        <g fill="#eaf8ff">
          {sparkles.map(({ x, y, w, h, d }) => (
            <rect key={`${x}-${y}`} className={styles.sp} x={x} y={y} width={w} height={h} rx={h / 2} style={delay(d)} />
          ))}
        </g>

        <path d="M0 790 Q360 745 720 775 T1440 760 V900 H0Z" fill="#14285f" opacity=".18" transform="translate(0,-5)" />
        <path d="M0 790 Q360 745 720 775 T1440 760 V900 H0Z" fill="#a9b8c4" />
        <path d="M0 850 Q400 805 800 832 T1440 815 V900 H0Z" fill="#14285f" opacity=".14" transform="translate(0,-5)" />
        <path d="M0 850 Q400 805 800 832 T1440 815 V900 H0Z" fill="#d3dde4" />

        <g className={styles.walk}>
          <g transform="translate(0,872) scale(1.25)">
            <g className={styles.crab}>
              <g className={styles.legs} stroke="#d9503f" strokeWidth="4" strokeLinecap="round" fill="none">
                <path d="M-24 4 L-40 12 M-26 -2 L-44 2 M-22 10 L-34 20" />
                <path d="M24 4 L40 12 M26 -2 L44 2 M22 10 L34 20" />
              </g>
              <g stroke="#d9503f" strokeWidth="4" strokeLinecap="round" fill="none"><path d="M-22 -10 L-34 -22 M22 -10 L34 -22" /></g>
              <ellipse cx="0" cy="0" rx="30" ry="20" fill="#f26b5b" />
              <circle cx="-36" cy="-26" r="10" fill="#f26b5b" />
              <circle cx="36" cy="-26" r="10" fill="#f26b5b" />
              <path d="M-8 -16 V-26 M8 -16 V-26" stroke="#d9503f" strokeWidth="3" strokeLinecap="round" />
              <circle cx="-8" cy="-28" r="4.5" fill="#ffffff" /><circle cx="8" cy="-28" r="4.5" fill="#ffffff" />
              <circle cx="-8" cy="-28" r="2" fill="#14285f" /><circle cx="8" cy="-28" r="2" fill="#14285f" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  )
}
