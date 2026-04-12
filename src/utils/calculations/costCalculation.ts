/**
 * Funções de cálculo de custo de materiais e receitas
 */

import { Material, Recipe, RecipeItem } from '../../types';
import { convertToMinUnit } from './unitConversion';

/**
 * Calcula o preço por unidade mínima (g, ml ou un)
 * Ex: 1kg por R$10 → R$0.01/g
 */
export const calcPricePerMinUnit = (pricePaid: number, packageQty: number, unit: string): number => {
  const totalMinUnits = unit === 'kg' || unit === 'L' ? packageQty * 1000 : packageQty;
  return pricePaid / totalMinUnits;
};

/**
 * Calcula o custo de um item específico da receita
 * Converte a quantidade para unidade mínima e multiplica pelo preço/unidade mínima
 */
export const calculateItemCost = (item: RecipeItem, material: Material): number => {
  const qtyInMinUnit = convertToMinUnit(item.qty, item.unit);
  return qtyInMinUnit * material.pricePerMinUnit;
};

/**
 * Calcula o custo total de uma receita incluindo:
 * - Custo dos ingredientes
 * - Fator de desperdício
 * - Mão de obra (baseado no tempo de preparo)
 * - Energia (baseado no tempo de preparo)
 * - Embalagem
 *
 * Retorna: custo dos ingredientes, custo total, custo por unidade e preço sugerido
 */
export const calculateRecipeTotalCost = (
  recipe: Recipe,
  materials: Record<string, Material>
): {
  ingredientsCost: number;
  totalCost: number;
  costPerUnit: number;
  suggestedPrice: number;
} => {
  let ingredientsCost = 0;

  recipe.items.forEach(item => {
    const material = materials[item.materialId];
    if (material) {
      ingredientsCost += calculateItemCost(item, material);
    }
  });

  const wasteFactor = recipe.wasteFactor ?? 0;
  const packagingCost = recipe.packagingCost ?? 0;
  const laborCost = recipe.laborCost ?? 0;
  const energyCost = recipe.energyCost ?? 0;
  const yieldQty = recipe.yield || 1;

  const costWithWaste = ingredientsCost * (1 + wasteFactor);
  const prepTimeHours = (recipe.prepTimeMinutes || 0) / 60;
  const laborTotal = prepTimeHours * laborCost;
  const energyTotal = prepTimeHours * energyCost;

  const totalCost = costWithWaste + laborTotal + energyTotal + packagingCost;
  const costPerUnit = totalCost / yieldQty;

  const suggestedPrice = costPerUnit * (1 + (recipe.profitMargin ?? 0) / 100);

  return {
    ingredientsCost,
    totalCost,
    costPerUnit,
    suggestedPrice
  };
};
