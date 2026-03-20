import React, { useState, useMemo } from 'react';
import { X, TrendingUp, ShoppingCart, DollarSign, Package } from 'lucide-react';
import { Recipe, Material } from '../types';
import { calculateRecipeTotalCost, convertToMinUnit } from '../utils/calculations';
import { toMaterialsMap } from '../utils/materialUtils';

interface ProfitCalculatorProps {
  recipes: Recipe[];
  materials: Material[];
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

export const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({ recipes, materials }) => {
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipes[0]?.id ?? '');
  const [units, setUnits] = useState(10);

  const materialsMap = useMemo(() => toMaterialsMap(materials), [materials]);

  const recipe = recipes.find(r => r.id === selectedRecipeId);

  const result = useMemo(() => {
    if (!recipe) return null;
    const { costPerUnit, suggestedPrice } = calculateRecipeTotalCost(recipe, materialsMap);
    const totalRevenue = suggestedPrice * units;
    const totalCost = costPerUnit * units;
    const totalProfit = totalRevenue - totalCost;
    const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    return { costPerUnit, suggestedPrice, totalRevenue, totalCost, totalProfit, margin };
  }, [recipe, materialsMap, units]);

  return (
    <div className="p-6 pt-20 space-y-6 pb-24">
      <header>
        <h1 className="text-2xl font-display font-bold text-burgundy">Simulador de Lucro</h1>
        <p className="text-gray-500 text-sm">Simule suas vendas e veja o retorno exato</p>
      </header>

        {/* Inputs */}
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Produto</label>
            <select
              value={selectedRecipeId}
              onChange={e => setSelectedRecipeId(e.target.value)}
              className="w-full bg-creme border-none rounded-xl p-3 font-medium text-gray-700 focus:ring-2 focus:ring-pastel-pink"
            >
              {recipes.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Unidades a vender</label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setUnits(u => Math.max(1, u - 1))}
                className="w-12 h-12 rounded-full bg-creme text-burgundy font-bold text-2xl flex items-center justify-center active:scale-90 transition-transform"
              >−</button>
              <input
                type="number"
                min={1}
                value={units}
                onChange={e => setUnits(Math.max(1, Number(e.target.value)))}
                className="w-20 bg-creme border-none rounded-xl p-3 text-center text-3xl font-display font-bold text-burgundy focus:ring-2 focus:ring-pastel-pink"
              />
              <button
                onClick={() => setUnits(u => u + 1)}
                className="w-12 h-12 rounded-full bg-creme text-burgundy font-bold text-2xl flex items-center justify-center active:scale-90 transition-transform"
              >+</button>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center">Resultado da Simulação</h3>

            {/* Preço por unidade */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-creme rounded-2xl p-4 space-y-2 text-center">
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <Package size={16} />
                  <span className="text-[10px] font-bold uppercase">Custo/Un</span>
                </div>
                <p className="text-lg font-display font-bold text-gray-700">R$ {fmt(result.costPerUnit)}</p>
              </div>
              <div className="bg-creme rounded-2xl p-4 space-y-2 text-center">
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <DollarSign size={16} />
                  <span className="text-[10px] font-bold uppercase">Preço/Un</span>
                </div>
                <p className="text-lg font-display font-bold text-burgundy">R$ {fmt(result.suggestedPrice)}</p>
              </div>
            </div>

            {/* Investimento */}
            <div className="bg-orange-50 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShoppingCart size={18} className="text-orange-500" />
                </div>
                <div className="text-center flex-1">
                  <p className="text-xs text-orange-400 font-bold uppercase tracking-wide">Você vai investir</p>
                  <p className="text-sm text-orange-300">{units} un × R$ {fmt(result.costPerUnit)}</p>
                </div>
              </div>

              <div className="border-t border-orange-200/50 pt-3 mt-3">
                <p className="text-[10px] text-orange-400 font-bold uppercase mb-2 text-center">Ingredientes Necessários:</p>
                <div className="space-y-1 bg-white/40 p-3 rounded-xl">
                  {recipe.items.map((item, idx) => {
                    const material = materialsMap[item.materialId];
                    if (!material) return null;
                    const qtyInMinUnit = convertToMinUnit(item.qty, item.unit) * units;
                    const cost = qtyInMinUnit * material.pricePerMinUnit;
                    return (
                      <div key={idx} className="flex justify-between text-xs text-orange-800/80 items-center">
                        <span>{item.qty * units}{item.unit} de {material.name}</span>
                        <span className="font-bold">R$ {fmt(cost)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-2xl font-display font-bold text-orange-500 text-center">R$ {fmt(result.totalCost)}</p>
            </div>

            {/* Receita */}
            <div className="bg-blue-50 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <DollarSign size={18} className="text-blue-500" />
                </div>
                <div className="text-center flex-1">
                  <p className="text-xs text-blue-400 font-bold uppercase tracking-wide">Você vai faturar</p>
                  <p className="text-sm text-blue-300">{units} un × R$ {fmt(result.suggestedPrice)}</p>
                </div>
              </div>
              <p className="text-2xl font-display font-bold text-blue-500 text-center">R$ {fmt(result.totalRevenue)}</p>
            </div>

            {/* Lucro */}
            <div className="bg-burgundy rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-center gap-3">
                <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={22} className="text-white" />
                </div>
                <div className="text-center flex-1">
                  <p className="text-sm text-white/80 font-bold uppercase tracking-wide">Lucro líquido</p>
                  <p className="text-xs text-white/60">Margem de {result.margin.toFixed(1)}%</p>
                </div>
              </div>
              <p className="text-3xl font-display font-bold text-white text-center">R$ {fmt(result.totalProfit)}</p>
            </div>
          </div>
        )}

        {recipes.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Cadastre receitas para usar o simulador.</p>
          </div>
        )}
    </div>
  );
};
