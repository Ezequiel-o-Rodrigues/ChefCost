/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Material, Recipe, RecipeItem } from '../types';

/**
 * Converts any unit to its minimum metric equivalent (g or ml or un)
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

/**
 * Calculates the cost of a specific recipe item
 */
export const calculateItemCost = (item: RecipeItem, material: Material): number => {
  const qtyInMinUnit = convertToMinUnit(item.qty, item.unit);
  return qtyInMinUnit * material.pricePerMinUnit;
};

/**
 * Calculates the total cost of a recipe, including waste, labor, and energy
 */
export const calculateRecipeTotalCost = (
  recipe: Recipe,
  materials: Record<string, Material>,
  prepTimeHours: number = 0
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

  // Apply waste factor
  const costWithWaste = ingredientsCost * (1 + recipe.wasteFactor);
  
  // Add labor and energy
  const laborTotal = prepTimeHours * recipe.laborCost;
  const energyTotal = prepTimeHours * recipe.energyCost;
  
  const totalCost = costWithWaste + laborTotal + energyTotal + recipe.packagingCost;
  const costPerUnit = totalCost / recipe.yield;
  
  // Markup calculation: TotalCost * (1 + ProfitMargin)
  // Note: Markup can be complex, but here we use a simple Profit Margin multiplier
  const suggestedPrice = costPerUnit * (1 + recipe.profitMargin / 100);

  return {
    ingredientsCost,
    totalCost,
    costPerUnit,
    suggestedPrice
  };
};
