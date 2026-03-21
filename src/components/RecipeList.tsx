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
  onAddMaterial: (material: Omit<Material, 'id' | 'userId'>) => Promise<void>;
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

export const RecipeList: React.FC<RecipeListProps> = ({ recipes, materials, settings, onAdd, onDelete, onUpdate, onAddMaterial }) => {
  const [editing, setEditing] = useState<Recipe | null>(null);
  const materialsMap = toMaterialsMap(materials);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center px-2 md:px-0">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => {
              const { costPerUnit, suggestedPrice } = calculateRecipeTotalCost(recipe, materialsMap);
              
              const getStatusBadge = () => {
                if (recipe.profitMargin >= 150) return { label: 'Alta Margem', color: 'bg-green-100 text-green-700' };
                if (recipe.profitMargin >= 80) return { label: 'Lucro OK', color: 'bg-blue-100 text-blue-700' };
                return { label: 'Revisar Margem', color: 'bg-amber-100 text-amber-700' };
              };
              
              const badge = getStatusBadge();

              return (
                <div key={recipe.id} className="card bg-white space-y-4 group relative flex flex-col h-full border border-gray-100 hover:shadow-xl transition-all duration-300">
                  {/* Ações */}
                  <div className="absolute top-4 right-4 flex gap-3 transition-opacity z-20">
                    <button
                      onClick={() => setEditing(recipe)}
                      className="text-gray-400 hover:text-burgundy p-1 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-pastel-pink/20 transition-colors shadow-sm"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(recipe.id!)}
                      className="text-red-300 hover:text-red-500 p-1 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  {recipe.photoUrl && (
                    <div className="h-56 -mx-4 -mt-4 mb-4 overflow-hidden rounded-t-2xl border-b border-gray-100 relative group">
                      <img 
                        src={recipe.photoUrl} 
                        alt={recipe.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-lg text-burgundy">{recipe.name}</h3>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
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
                      <p className="text-xs text-gray-500 line-clamp-3 italic pt-2">{recipe.instructions}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50 mt-auto">
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
            })}
          </div>
        )}
      </div>

      {editing && (
        <RecipeForm
          materials={materials}
          settings={settings}
          initialData={editing}
          onSave={(data) => { onUpdate(editing.id!, data); setEditing(null); }}
          onAddMaterial={onAddMaterial}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
};
