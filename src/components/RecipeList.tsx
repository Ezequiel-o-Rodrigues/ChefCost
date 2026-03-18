/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus, Trash2, FileText } from 'lucide-react';
import { Recipe, Material } from '../types';
import { calculateRecipeTotalCost } from '../utils/calculations';

interface RecipeListProps {
  recipes: Recipe[];
  materials: Material[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export const RecipeList: React.FC<RecipeListProps> = ({ recipes, materials, onAdd, onDelete }) => {
  const materialsMap = materials.reduce((acc, m) => ({ ...acc, [m.id!]: m }), {} as Record<string, Material>);

  return (
    <div className="p-6 pt-20 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-display font-bold text-burgundy">Receitas</h1>
        <button 
          onClick={onAdd}
          className="bg-pastel-pink p-2 rounded-full text-burgundy active:scale-90 transition-transform"
        >
          <Plus size={24} />
        </button>
      </header>
      
      <div className="space-y-4">
        {recipes.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-gray-400">Nenhuma receita cadastrada.</p>
            <button onClick={onAdd} className="btn-secondary text-sm">Criar minha primeira receita!</button>
          </div>
        ) : (
          recipes.map((recipe) => {
            const { costPerUnit, suggestedPrice } = calculateRecipeTotalCost(recipe, materialsMap);
            return (
              <div key={recipe.id} className="card bg-white space-y-4 group relative">
                <button 
                  onClick={() => onDelete(recipe.id!)}
                  className="absolute top-4 right-4 text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={18} />
                </button>
                
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-burgundy">{recipe.name}</h3>
                  <div className="flex gap-2">
                    <span className="bg-creme text-burgundy text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                      Rendimento: {recipe.yield} un
                    </span>
                    <span className="bg-creme text-burgundy text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                      Margem: {recipe.profitMargin}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Custo/Unidade</p>
                    <p className="font-bold text-gray-700">R$ {costPerUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Preço Sugerido</p>
                    <p className="text-burgundy font-bold text-xl">R$ {suggestedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>

                <button className="w-full flex items-center justify-center gap-2 text-xs font-bold text-burgundy opacity-60 hover:opacity-100 transition-opacity pt-2">
                  <FileText size={14} /> Gerar Ordem de Produção
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
