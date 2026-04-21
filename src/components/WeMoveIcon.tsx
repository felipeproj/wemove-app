/**
 * Ícone da marca WeMove — caixa aberta com seta para cima.
 * Representa mudança residencial: desempacotar e se instalar.
 */

interface Props {
  size?: number
  color?: string
}

export function WeMoveIcon({ size = 24, color = 'white' }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      {/* Corpo da caixa */}
      <rect x="2" y="8" width="14" height="8" rx="1.5"
        stroke={color} strokeWidth="1.7" fill="none" />
      {/* Aba esquerda aberta */}
      <path d="M2 8L5 4H9"
        stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      {/* Aba direita aberta */}
      <path d="M16 8L13 4H9"
        stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      {/* Seta para cima — item sendo movido */}
      <path d="M9 4V1.5"
        stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M7.5 3L9 1.5L10.5 3"
        stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
