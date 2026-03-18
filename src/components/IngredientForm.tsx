/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Material, Unit } from '../types';

interface IngredientFormProps {
  onSave: (material: Omit<Material, 'id' | 'userId' | 'pricePerMinUnit'>) => void;
  onClose: () => void;
  initialData?: Material;
}

export const IngredientForm: React.FC<IngredientFormProps> = ({ onSave, onClose, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [unit, setUnit] = useState<Unit>(initialData?.unit || 'kg');
  const [packageQty, setPackageQty] = useState(initialData?.packageQty || 1);
  const [pricePaid, setPricePaid] = useState(initialData?.pricePaid || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, unit, packageQty, pricePaid });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 space-y-6 shadow-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-display font-bold text-burgundy">Novo Insumo</h2>
          <button onClick={onClose} className="text-gray-400 p-1">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Nome do Insumo</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-creme border-none rounded-xl p-3 focus:ring-2 focus:ring-pastel-pink"
              placeholder="Ex: Farinha de Trigo"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Unidade</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as Unit)}
                className="w-full bg-creme border-none rounded-xl p-3 focus:ring-2 focus:ring-pastel-pink"
              >
                <option value="kg">Quilograma (kg)</option>
                <option value="g">Grama (g)</option>
                <option value="L">Litro (L)</option>
                <option value="ml">Mililitro (ml)</option>
                <option value="un">Unidade (un)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Qtd. Embalagem</label>
              <input
                required
                type="number"
                step="0.01"
                value={packageQty}
                onChange={(e) => setPackageQty(Number(e.target.value))}
                className="w-full bg-creme border-none rounded-xl p-3 focus:ring-2 focus:ring-pastel-pink"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Preço Pago (R$)</label>
            <input
              required
              type="number"
              step="0.01"
              value={pricePaid}
              onChange={(e) => setPricePaid(Number(e.target.value))}
              className="w-full bg-creme border-none rounded-xl p-3 focus:ring-2 focus:ring-pastel-pink"
              placeholder="0,00"
            />
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full btn-primary">
              Salvar Insumo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
