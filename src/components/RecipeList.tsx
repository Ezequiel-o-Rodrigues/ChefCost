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
                <div className="absolute top-4 right-4 flex gap-3 transition-opacity">
                  <button
                    onClick={() => setEditing(recipe)}
                    className="text-gray-400 hover:text-burgundy p-1 bg-creme-dark/50 rounded-lg hover:bg-pastel-pink/20 transition-colors"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(recipe.id!)}
                    className="text-red-300 hover:text-red-500 p-1 bg-creme-dark/50 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                
                {recipe.photoUrl && (
                  <div className="h-40 -mx-4 -mt-4 mb-4 overflow-hidden rounded-t-2xl border-b border-gray-100">
                    <img 
                      src={recipe.photoUrl} 
                      alt={recipe.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}

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
                  {recipe.instructions && (
                    <p className="text-xs text-gray-500 line-clamp-2 italic pt-1">{recipe.instructions}</p>
                  )}
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
