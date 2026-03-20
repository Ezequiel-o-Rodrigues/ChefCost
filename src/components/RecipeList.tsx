import React, { useState } from 'react';
import { Plus, Trash2, Pencil, Clock } from 'lucide-react';
import { Recipe, Material, AppSettings } from '../types';
import { calculateRecipeTotalCost } from '../utils/calculations';
import { toMaterialsMap } from '../utils/materialUtils';
import { RecipeForm } from './RecipeForm';

interface RecipeListProps {
  recipes: Recipe[];
  materials: Material[];
  settings: AppSettings;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, recipe: Omit<Recipe, 'id' | 'userId' | 'createdAt'>) => void;
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

export const RecipeList: React.FC<RecipeListProps> = ({ recipes, materials, settings, onAdd, onDelete, onUpdate }) => {
  const [editing, setEditing] = useState<Recipe | null>(null);
  const materialsMap = toMaterialsMap(materials);

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
                {/* Ações */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditing(recipe)}
                    className="text-gray-300 hover:text-burgundy"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(recipe.id!)}
                    className="text-red-300 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-burgundy">{recipe.name}</h3>
                  <div className="flex gap-2">
                    <span className="bg-creme text-burgundy text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                      Rendimento: {recipe.yield} un
                    </span>
                    <span className="bg-creme text-burgundy text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                      Margem: {recipe.profitMargin}%
                    </span>
                    {recipe.prepTimeMinutes ? (
                      <span className="bg-creme text-burgundy text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter flex items-center gap-1">
                        <Clock size={10} /> {recipe.prepTimeMinutes} min
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Custo/Unidade</p>
                    <p className="font-bold text-gray-700">R$ {fmt(costPerUnit)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Preço Sugerido</p>
                    <p className="text-burgundy font-bold text-xl">R$ {fmt(suggestedPrice)}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {editing && (
        <RecipeForm
          materials={materials}
          settings={settings}
          initialData={editing}
          onSave={(data) => { onUpdate(editing.id!, data); setEditing(null); }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
};
