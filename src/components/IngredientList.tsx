import React, { useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { Material } from '../types';
import { IngredientForm } from './IngredientForm';

interface IngredientListProps {
  materials: Material[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, material: Omit<Material, 'id' | 'userId' | 'pricePerMinUnit'>) => void;
}

const getDisplayPrice = (material: Material): string => {
  const { unit, pricePerMinUnit } = material;
  const factor = unit === 'kg' || unit === 'L' ? 1000 : 1;
  const pricePerUnit = pricePerMinUnit * factor;
  const decimals = pricePerUnit < 0.1 ? 4 : 2;
  return `R$ ${pricePerUnit.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}/${unit}`;
};

export const IngredientList: React.FC<IngredientListProps> = ({ materials, onAdd, onDelete, onUpdate }) => {
  const [editing, setEditing] = useState<Material | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      onDelete(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex justify-between items-center px-2 md:px-0">
        <h1 className="text-2xl font-display font-bold text-burgundy">Ingredientes</h1>
        <button
          onClick={onAdd}
          className="bg-pastel-pink p-2 rounded-full text-burgundy active:scale-90 transition-transform"
        >
          <Plus size={24} />
        </button>
      </header>

      <div className="space-y-2">
        {materials.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-gray-400">Nenhum ingrediente cadastrado.</p>
            <button onClick={onAdd} className="btn-secondary text-sm">Começar a comprar!</button>
          </div>
        ) : (
          materials.map((item) => (
            <div key={item.id} className="card bg-white flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.name}</p>
                <p className="text-xs text-gray-400">
                  {item.packageQty}{item.unit} • R$ {item.pricePaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <p className="text-burgundy font-bold text-sm whitespace-nowrap">{getDisplayPrice(item)}</p>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setEditing(item)}
                  className="p-2 text-gray-400 hover:text-burgundy hover:bg-creme rounded-lg transition-colors active:scale-90"
                  aria-label="Editar"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item.id!)}
                  className={`p-2 rounded-lg transition-all active:scale-90 ${
                    confirmDeleteId === item.id
                      ? 'text-white bg-red-500'
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                  aria-label={confirmDeleteId === item.id ? 'Confirmar exclusão' : 'Excluir'}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {editing && (
        <IngredientForm
          initialData={editing}
          onSave={(data) => { onUpdate(editing.id!, data); setEditing(null); }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
};
