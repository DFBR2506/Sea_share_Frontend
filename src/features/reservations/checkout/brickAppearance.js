// Solo opciones visuales públicas del SDK; no se inspecciona ni modifica su DOM.
export function brickVariables() {
  const probe = document.createElement('span')
  probe.hidden = true
  document.body.appendChild(probe)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const context = canvas.getContext('2d', { willReadFrequently: true })
  const color = (token) => {
    probe.style.color = `var(${token})`
    const computed = getComputedStyle(probe).color
    if (!context) return computed
    // Resolver también color-mix a un color sRGB literal para los campos seguros.
    context.clearRect(0, 0, 1, 1)
    context.fillStyle = computed
    context.fillRect(0, 0, 1, 1)
    return '#' + [...context.getImageData(0, 0, 1, 1).data].slice(0, 3)
      .map((channel) => channel.toString(16).padStart(2, '0')).join('')
  }
  const fontSize = (token) => {
    probe.style.font = `var(${token})`
    return getComputedStyle(probe).fontSize
  }
  try {
    const tokens = getComputedStyle(document.documentElement)
    const size = (token) => tokens.getPropertyValue(token).trim()
    return {
      baseColor: color('--seashare-color-brand-primary'),
      baseColorFirstVariant: color('--seashare-color-brand-primary-hover'),
      baseColorSecondVariant: color('--seashare-color-brand-primary-active'),
      textPrimaryColor: color('--seashare-color-text-primary'),
      textSecondaryColor: color('--seashare-color-text-secondary'),
      formBackgroundColor: color('--seashare-color-surface'),
      inputBackgroundColor: color('--seashare-color-surface'),
      outlinePrimaryColor: color('--seashare-color-border-default'),
      outlineSecondaryColor: color('--seashare-color-brand-support'),
      errorColor: color('--seashare-color-brand-accent'),
      successColor: color('--seashare-color-success-text'),
      borderRadiusSmall: size('--radius-sm'),
      borderRadiusMedium: size('--radius-md'),
      borderRadiusLarge: size('--radius-md'),
      fontSizeSmall: fontSize('--text-label'),
      fontSizeMedium: fontSize('--text-body'),
      inputHorizontalPadding: size('--space-4'),
      inputVerticalPadding: size('--space-3'),
      formPadding: size('--space-1'),
    }
  } finally {
    probe.remove()
  }
}
