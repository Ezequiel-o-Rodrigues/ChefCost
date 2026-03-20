/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Unit = 'kg' | 'g' | 'L' | 'ml' | 'un';

export interface Material {
  id?: string;
  name: string;
  unit: Unit;
  packageQty: number; // e.g., 5 for 5kg
  pricePaid: number; // e.g., 25.99
  pricePerMinUnit: number; // calculated: price / (qty * factor)
  userId: string;
}

export interface RecipeItem {
  materialId: string;
  qty: number;
  unit: Unit;
}

export interface Recipe {
  id?: string;
  name: string;
  yield: number; // how many units it makes
  profitMargin: number; // e.g., 100%
  packagingCost: number;
  laborCost: number;
  energyCost: number;
  wasteFactor: number; // e.g., 0.1 for 10%
  prepTimeMinutes?: number;
  items: RecipeItem[];
  userId: string;
  createdAt: number;
}

export interface Conversion {
  id?: string;
  name: string; // e.g., "Xícara de chá"
  grams: number; // e.g., 120
  userId: string;
}

export interface AppSettings {
  hourlyRate: number;
  energyRate: number;
}
