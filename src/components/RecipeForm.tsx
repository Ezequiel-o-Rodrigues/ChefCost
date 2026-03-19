/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Recipe, RecipeItem, Material, Unit } from '../types';

interface RecipeFormProps {
  materials: Material[];
  onSave: (recipe: Omit<Recipe, 'id' | 'userId' | 'createdAt'>) => void;
  onClose: () => void;
  initialData?: Recipe;
}

export const RecipeForm: React.FC<RecipeFormProps> = ({ materials, onSave, onClose, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [yieldQty, setYieldQty] = useState(initialData?.yield || 1);
  const [profitMargin, setProfitMargin] = useState(initialData?.profitMargin || 100);
  const [packagingCost, setPackagingCost] = useState(initialData?.packagingCost || 0);
  const [laborCost, setLaborCost] = useState(initialData?.laborCost || 25);
  const [energyCost, setEnergyCost] = useState(initialData?.energyCost || 5);
  const [wasteFactor, setWasteFactor] = useState(initialData?.wasteFactor || 0.1);
  const [items, setItems] = useState<RecipeItem[]>(initialData?.items || []);

  const addItem = () => {
    if (materials.length > 0) {
      setItems([...items, { materialId: materials[0].id!, qty: 0, unit: 'g' }]);
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof RecipeItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      yield: yieldQty,
      profitMargin,
      packagingCost,
      laborCost,
      energyCost,
      wasteFactor,
      items
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-display font-bold text-burgundy">{initialData ? 'Editar Receita' : 'Nova Receita'}</h2>
          <button onClick={onClose} className="text-gray-400 p-1">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pb-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Nome da Receita</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-creme border-none rounded-xl p-3 focus:ring-2 focus:ring-pastel-pink"
                placeholder="Ex: Bolo de Cenoura"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Rendimento (Un)</label>
                <input
                  required
                  type="number"
                  value={yieldQty}
                  onChange={(e) => setYieldQty(Number(e.target.value))}
                  className="w-full bg-creme border-none rounded-xl p-3"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Margem Lucro (%)</label>
                <input
                  required
                  type="number"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(Number(e.target.value))}
                  className="w-full bg-creme border-none rounded-xl p-3"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-400 uppercase">Ingredientes</h3>
              <button 
                type="button" 
                onClick={addItem}
                className="text-xs bg-pastel-pink text-burgundy px-3 py-1 rounded-full font-bold flex items-center gap-1"
              >
                <Plus size={14} /> Adicionar
              </button>
            </div>
            
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="bg-creme p-3 rounded-xl space-y-2 relative">
                  <button 
                    type="button" 
                    onClick={() => removeItem(index)}
                    className="absolute top-2 right-2 text-red-300 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                  
                  <select
                    value={item.materialId}
                    onChange={(e) => updateItem(index, 'materialId', e.target.value)}
                    className="w-full bg-white border-none rounded-lg p-2 text-sm"
                  >
                    {materials.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={item.qty}
                      onChange={(e) => updateItem(index, 'qty', Number(e.target.value))}
                      className="w-full bg-white border-none rounded-lg p-2 text-sm"
                      placeholder="Qtd"
                    />
                    <select
                      value={item.unit}
                      onChange={(e) => updateItem(index, 'unit', e.target.value as Unit)}
                      className="w-full bg-white border-none rounded-lg p-2 text-sm"
                    >
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                      <option value="un">un</option>
                      <option value="kg">kg</option>
                      <option value="L">L</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full btn-primary">
              {initialData ? 'Atualizar Receita' : 'Salvar Receita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
