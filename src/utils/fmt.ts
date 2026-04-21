/** Formata número como moeda BRL sem centavos */
export function fmt(n: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n ?? 0)
}

export const AMB_COLORS: Record<string, string> = {
  'Sala':                '#3B82F6',
  'Cozinha':             '#F59E0B',
  'Quarto Casal':        '#EC4899',
  'Escritório':          '#8B5CF6',
  'Área de Serviço':     '#10B981',
  'Banheiro / Lavabo':   '#06B6D4',
  'Geral / Tecnologia':  '#6B7280',
}
