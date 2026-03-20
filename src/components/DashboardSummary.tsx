import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Material, Recipe } from '../types';
import { calculateRecipeTotalCost } from '../utils/calculations';
import { toMaterialsMap } from '../utils/materialUtils';

interface DashboardSummaryProps {
  materials: Material[];
  recipes: Recipe[];
  onOpenSimulator: () => void;
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({ materials, recipes, onOpenSimulator }) => {
  const materialsMap = toMaterialsMap(materials);

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
          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Ingredientes</p>
          <p className="text-2xl font-display font-bold text-burgundy">{materials.length}</p>
        </div>
      </div>

      {/* Card clicável — abre o simulador */}
      <button
        onClick={onOpenSimulator}
        className="w-full card bg-burgundy text-white text-left active:scale-[0.98] transition-transform"
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm opacity-80">Lucro Potencial Total</p>
            <p className="text-3xl font-display font-bold mt-1">R$ {fmt(totalProfit)}</p>
            <p className="mt-2 text-xs opacity-60">Baseado no rendimento total de todas as receitas.</p>
          </div>
          <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 mt-1">
            <span className="text-[10px] font-bold uppercase">Simular</span>
            <ChevronRight size={12} />
          </div>
        </div>
      </button>

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
                  <p className="text-burgundy font-bold">R$ {fmt(costPerUnit)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
