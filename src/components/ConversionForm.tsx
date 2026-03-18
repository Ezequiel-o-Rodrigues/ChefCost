/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Conversion } from '../types';

interface ConversionFormProps {
  conversions: Conversion[];
  onSave: (conversion: Omit<Conversion, 'id' | 'userId'>) => void;
  onDelete: (id: string) => void;
}

export const ConversionForm: React.FC<ConversionFormProps> = ({ conversions, onSave, onDelete }) => {
  const [name, setName] = useState('');
  const [grams, setGrams] = useState(0);
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = () => {
    if (name && grams > 0) {
      onSave({ name, grams });
      setName('');
      setGrams(0);
      setShowAdd(false);
    }
  };

  return (
    <div className="card bg-white space-y-4">
      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
        <h3 className="font-bold text-burgundy">Conversões Padrão</h3>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="text-xs bg-pastel-pink text-burgundy px-3 py-1 rounded-full font-bold flex items-center gap-1"
        >
          {showAdd ? <X size={14} /> : <Plus size={14} />} {showAdd ? 'Fechar' : 'Nova'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-creme p-4 rounded-xl space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Nome da Medida</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border-none rounded-lg p-2 text-sm"
              placeholder="Ex: Xícara de farinha"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Equivalente em Gramas (g)</label>
            <input
              type="number"
              value={grams}
              onChange={(e) => setGrams(Number(e.target.value))}
              className="w-full bg-white border-none rounded-lg p-2 text-sm"
              placeholder="0"
            />
          </div>
          <button 
            onClick={handleAdd}
            className="w-full btn-primary text-xs py-2"
          >
            Adicionar Conversão
          </button>
        </div>
      )}

      <div className="space-y-2">
        {conversions.map((conv) => (
          <div key={conv.id} className="flex justify-between items-center p-2 hover:bg-creme rounded-lg transition-colors group">
            <span className="text-sm">{conv.name}</span>
            <div className="flex items-center gap-3">
              <span className="text-burgundy font-bold text-sm">{conv.grams}g</span>
              <button 
                onClick={() => onDelete(conv.id!)}
                className="text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
