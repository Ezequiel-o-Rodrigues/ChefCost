/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Material, Recipe } from '../types';
import { calculateRecipeTotalCost } from '../utils/calculations';

interface DashboardSummaryProps {
  materials: Material[];
  recipes: Recipe[];
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({ materials, recipes }) => {
  const materialsMap = materials.reduce((acc, m) => ({ ...acc, [m.id!]: m }), {} as Record<string, Material>);
  
  const totalProfit = recipes.reduce((acc, recipe) => {
    const { suggestedPrice, costPerUnit } = calculateRecipeTotalCost(recipe, materialsMap);
    return acc + (suggestedPrice - costPerUnit) * recipe.yield;
  }, 0);

  return (
    <div className="p-6 pt-20 space-y-6">
      <header>
        <h1 className="text-3xl font-display font-bold text-burgundy">ChefCost</h1>
        <p className="text-gray-500">Gestão inteligente para sua cozinha.</p>
      </header>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="card bg-white">
          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Receitas</p>
          <p className="text-2xl font-display font-bold text-burgundy">{recipes.length}</p>
        </div>
        <div className="card bg-white">
          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Insumos</p>
          <p className="text-2xl font-display font-bold text-burgundy">{materials.length}</p>
        </div>
      </div>

      <div className="card bg-burgundy text-white">
        <p className="text-sm opacity-80">Lucro Potencial Total</p>
        <p className="text-3xl font-display font-bold">R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        <div className="mt-2 text-xs opacity-60">Baseado no rendimento total de todas as receitas.</div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-400 uppercase">Resumo de Custos</h3>
        <div className="space-y-2">
          {recipes.slice(0, 3).map(recipe => {
            const { costPerUnit, suggestedPrice } = calculateRecipeTotalCost(recipe, materialsMap);
            return (
              <div key={recipe.id} className="card bg-white flex justify-between items-center py-3">
                <span className="text-sm font-medium">{recipe.name}</span>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Custo/Un</p>
                  <p className="text-burgundy font-bold">R$ {costPerUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
