/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Material } from '../types';

interface IngredientListProps {
  materials: Material[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export const IngredientList: React.FC<IngredientListProps> = ({ materials, onAdd, onDelete }) => {
  return (
    <div className="p-6 pt-20 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-display font-bold text-burgundy">Insumos</h1>
        <button 
          onClick={onAdd}
          className="bg-pastel-pink p-2 rounded-full text-burgundy active:scale-90 transition-transform"
        >
          <Plus size={24} />
        </button>
      </header>
      
      <div className="space-y-3">
        {materials.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-gray-400">Nenhum insumo cadastrado.</p>
            <button onClick={onAdd} className="btn-secondary text-sm">Começar a comprar!</button>
          </div>
        ) : (
          materials.map((item) => (
            <div key={item.id} className="card bg-white flex justify-between items-center group">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-gray-400">
                  {item.packageQty}{item.unit} • R$ {item.pricePaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-burgundy font-bold">R$ {item.pricePerMinUnit.toLocaleString('pt-BR', { minimumFractionDigits: 4 })}/g</p>
                </div>
                <button 
                  onClick={() => onDelete(item.id!)}
                  className="text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
