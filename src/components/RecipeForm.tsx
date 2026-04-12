/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { X, Trash2, Search, Check, Plus, Image as ImageIcon, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Recipe, RecipeItem, Material, Unit, AppSettings } from '../types';
import { IngredientForm } from './IngredientForm';

interface RecipeFormProps {
  materials: Material[];
  settings: AppSettings;
  onSave: (recipe: Omit<Recipe, 'id' | 'userId' | 'createdAt'>) => void;
  onAddMaterial: (material: Omit<Material, 'id' | 'userId'>) => Promise<void>;
  onClose: () => void;
  initialData?: Recipe;
}

export const RecipeForm: React.FC<RecipeFormProps> = ({ materials, settings, onSave, onAddMaterial, onClose, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [yieldQty, setYieldQty] = useState(initialData?.yield || 1);
  const [profitMargin, setProfitMargin] = useState(initialData?.profitMargin || 100);
  const [packagingCost, setPackagingCost] = useState(initialData?.packagingCost || 0);
  const [laborCost, setLaborCost] = useState(initialData?.laborCost || settings.hourlyRate);
  const [energyCost, setEnergyCost] = useState(initialData?.energyCost || settings.energyRate);
  const [wasteFactor, setWasteFactor] = useState(initialData?.wasteFactor || 0.1);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(initialData?.prepTimeMinutes || 0);
  const [photoUrl, setPhotoUrl] = useState(initialData?.photoUrl || '');
  const [instructions, setInstructions] = useState(initialData?.instructions || '');
  const [items, setItems] = useState<RecipeItem[]>(initialData?.items || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewIngredientForm, setShowNewIngredientForm] = useState(false);

  const filteredMaterials = useMemo(() => {
    return materials.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [materials, searchQuery]);

  const handleToggleIngredient = (material: Material) => {
    const exists = items.find(i => i.materialId === material.id);
    if (exists) {
      setItems(items.filter(i => i.materialId !== material.id));
    } else {
      setItems([{ materialId: material.id!, qty: 0, unit: 'g' }, ...items]);
    }
  };

  const updateItem = (index: number, field: keyof RecipeItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    if (!name.trim()) return;
    onSave({
      name,
      yield: yieldQty,
      profitMargin,
      packagingCost,
      laborCost,
      energyCost,
      wasteFactor,
      prepTimeMinutes,
      photoUrl,
      instructions,
      items
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center sm:p-4 z-[100] backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center flex-shrink-0 pb-3 border-b border-gray-100">
          <h2 className="text-xl font-display font-bold text-burgundy">{initialData ? 'Editar Receita' : 'Nova Receita'}</h2>
          <button onClick={onClose} className="text-gray-400 p-2 hover:text-gray-600 hover:bg-creme rounded-xl transition-colors active:scale-90">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-1 pt-4 custom-scrollbar">
          
          {/* Informações Básicas */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Nome da Receita</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-creme border-none rounded-xl p-3 focus:ring-2 focus:ring-pastel-pink text-burgundy font-medium"
                placeholder="Ex: Bolo de Cenoura"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Rendimento</label>
                <input
                  type="number"
                  min="1"
                  value={yieldQty === 0 ? '' : yieldQty}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') setYieldQty(0);
                    else setYieldQty(Math.max(1, Number(val)));
                  }}
                  className="w-full bg-creme border-none rounded-xl p-3 text-burgundy font-medium text-sm sm:text-base"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Margem (%)</label>
                <input
                  type="number"
                  min="0"
                  value={profitMargin === 0 ? '' : profitMargin}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') setProfitMargin(0);
                    else setProfitMargin(Math.max(0, Number(val)));
                  }}
                  className="w-full bg-creme border-none rounded-xl p-3 text-burgundy font-medium text-sm sm:text-base"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Tempo (min)</label>
                <input
                  type="number"
                  min="0"
                  value={prepTimeMinutes === 0 ? '' : prepTimeMinutes}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') setPrepTimeMinutes(0);
                    else setPrepTimeMinutes(Math.max(0, Number(val)));
                  }}
                  className="w-full bg-creme border-none rounded-xl p-3 text-burgundy font-medium text-sm sm:text-base"
                  placeholder="Ex: 60"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-6">
            
            {/* Secao: A Despensa */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-400 uppercase">Sua Despensa</h3>
                <button
                  type="button"
                  onClick={() => setShowNewIngredientForm(true)}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase text-burgundy bg-pastel-pink/30 px-2 py-1 rounded-lg hover:bg-pastel-pink/50 transition-colors"
                >
                  <Plus size={12} /> Novo Ingrediente
                </button>
              </div>
              
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar ingrediente..."
                  className="w-full bg-creme border-none rounded-xl p-2 pl-9 text-sm focus:ring-2 focus:ring-pastel-pink"
                />
              </div>

              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 custom-scrollbar">
                {filteredMaterials.map(m => {
                  const isAdded = items.some(i => i.materialId === m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleToggleIngredient(m)}
                      className={`
                        text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1 transition-all active:scale-95 border
                        ${isAdded 
                          ? 'bg-burgundy text-white border-burgundy shadow-md scale-[0.98]' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-pastel-pink hover:text-burgundy'}
                      `}
                    >
                      {isAdded && <Check size={12} />}
                      {m.name}
                    </button>
                  );
                })}
                {filteredMaterials.length === 0 && (
                  <p className="text-xs text-gray-400 py-2 w-full text-center">Nenhum ingrediente encontrado.</p>
                )}
              </div>
            </div>

            {/* Secao: Na Panela */}
            <div className="space-y-3 bg-creme/50 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-burgundy uppercase flex items-center gap-2">
                Na Panela <span className="text-xs bg-white/80 text-gray-500 px-2 py-0.5 rounded-full shadow-sm">{items.length}</span>
              </h3>
              
              <div className="space-y-2">
                <AnimatePresence>
                  {items.map((item, index) => {
                    const material = materials.find(m => m.id === item.materialId);
                    if (!material) return null;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, scale: 0.9 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        key={item.materialId} 
                        className="bg-white p-3 rounded-xl flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 shadow-sm border border-gray-100/50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-700 truncate">{material.name}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <input
                            required
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.qty === 0 ? '' : item.qty}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateItem(index, 'qty', val === '' ? 0 : Number(val));
                            }}
                            className="w-16 bg-creme border-none rounded-lg p-2 text-sm text-center focus:ring-2 focus:ring-pastel-pink font-medium"
                            placeholder="Qtd"
                          />
                          <select
                            value={item.unit}
                            onChange={(e) => updateItem(index, 'unit', e.target.value as Unit)}
                            className="bg-creme border-none rounded-lg p-2 text-sm focus:ring-2 focus:ring-pastel-pink text-gray-600 font-bold"
                          >
                            <option value="g">g</option>
                            <option value="ml">ml</option>
                            <option value="un">un</option>
                            <option value="kg">kg</option>
                            <option value="L">L</option>
                          </select>
                          <button 
                            type="button" 
                            onClick={() => handleToggleIngredient(material)}
                            className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {items.length === 0 && (
                  <p className="text-xs text-center text-gray-400 py-6">Toque nos ingredientes da Despensa para adicioná-los à panela.</p>
                )}
              </div>
            </div>

            {/* Secao: Detalhes Adicionais (Mais discreta) */}
            <div className="border-t border-gray-50 pt-6 space-y-4">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Detalhes Adicionais</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Upload de Foto */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 flex items-center gap-2 cursor-pointer hover:text-burgundy transition-colors">
                    <div className="w-8 h-8 bg-creme rounded-lg flex items-center justify-center">
                      <ImageIcon size={16} />
                    </div>
                    <span>{photoUrl ? 'Trocar Foto' : 'Adicionar Foto'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                  
                  {photoUrl && (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden group border border-gray-100">
                      <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-md rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Modo de Preparo */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <div className="w-8 h-8 bg-creme rounded-lg flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                    <span>Modo de Preparo</span>
                  </div>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={photoUrl ? 3 : 2}
                    className="w-full bg-creme border-none rounded-xl p-3 focus:ring-1 focus:ring-pastel-pink text-xs custom-scrollbar resize-none"
                    placeholder="Dicas de preparo..."
                  />
                </div>
              </div>
            </div>

          </div>

        </div>

        <div className="pt-3 flex-shrink-0 border-t border-gray-100">
          <button type="button" onClick={handleSubmit} className="w-full btn-primary py-3 text-sm shadow-md">
            {initialData ? 'Atualizar Receita' : 'Salvar Receita'}
          </button>
        </div>

        <AnimatePresence>
          {showNewIngredientForm && (
            <IngredientForm 
              onSave={async (data) => {
                await onAddMaterial(data);
                setShowNewIngredientForm(false);
              }} 
              onClose={() => setShowNewIngredientForm(false)} 
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
