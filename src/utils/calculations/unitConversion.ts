/**
 * Funções de conversão de unidades de medida
 *
 * Base units: g (gramas), ml (mililitros), un (unidades)
 * Conversões: kg → g (×1000), L → ml (×1000)
 */

/**
 * Converte qualquer unidade para sua unidade mínima (g, ml ou un)
 * - kg → g (×1000)
 * - L → ml (×1000)
 * - g, ml, un → sem conversão
 */
export const convertToMinUnit = (qty: number, unit: string): number => {
  switch (unit) {
    case 'kg':
    case 'L':
      return qty * 1000;
    case 'g':
    case 'ml':
    case 'un':
    default:
      return qty;
  }
};
