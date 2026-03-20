import React from 'react';
import { ChevronRight, Plus, Package, Calculator, TrendingUp, DollarSign } from 'lucide-react';
import { Material, Recipe } from '../types';
import { calculateRecipeTotalCost } from '../utils/calculations';
import { toMaterialsMap } from '../utils/materialUtils';

interface DashboardSummaryProps {
  materials: Material[];
  recipes: Recipe[];
  onOpenSimulator: () => void;
  onNavigate: (tab: any) => void;
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({ materials, recipes, onOpenSimulator, onNavigate }) => {
  const materialsMap = toMaterialsMap(materials);

  const totalProfit = recipes.reduce((acc, recipe) => {
    const { suggestedPrice, costPerUnit } = calculateRecipeTotalCost(recipe, materialsMap);
    return acc + (suggestedPrice - costPerUnit) * (recipe.yield || 1);
  }, 0);

  const totalInvestment = materials.reduce((acc, m) => acc + (m.pricePaid || 0), 0);

  return (
    <div className="space-y-8 pb-12">
      <header className="px-2">
        <h1 className="text-3xl font-display font-bold text-burgundy">ChefCost</h1>
        <p className="text-gray-500 font-medium">Bem-vindo(a) à sua cozinha inteligente.</p>
      </header>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 xs:grid-cols-3 gap-4 px-2">
        <button 
          onClick={() => onNavigate('recipes')}
          className="flex flex-col items-center justify-center p-4 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group active:scale-95"
        >
          <div className="w-12 h-12 bg-pastel-pink/30 rounded-2xl flex items-center justify-center text-burgundy group-hover:scale-110 transition-transform mb-3">
            <Plus size={24} />
          </div>
          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Nova Receita</span>
        </button>
        
        <button 
          onClick={() => onNavigate('ingredients')}
          className="flex flex-col items-center justify-center p-4 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group active:scale-95"
        >
          <div className="w-12 h-12 bg-creme-dark/20 rounded-2xl flex items-center justify-center text-gray-700 group-hover:scale-110 transition-transform mb-3">
            <Package size={24} />
          </div>
          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Novo Insumo</span>
        </button>

        <button 
          onClick={onOpenSimulator}
          className="flex flex-col items-center justify-center p-4 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group active:scale-95"
        >
          <div className="w-12 h-12 bg-burgundy/5 rounded-2xl flex items-center justify-center text-burgundy group-hover:scale-110 transition-transform mb-3">
            <Calculator size={24} />
          </div>
          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Simular</span>
        </button>
      </div>

      {/* Main Stats Card */}
      <button
        onClick={onOpenSimulator}
        className="w-full relative overflow-hidden card bg-burgundy text-white text-left active:scale-[0.99] transition-transform p-8 flex flex-col justify-between min-h-[160px] shadow-2xl"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <TrendingUp size={120} />
        </div>
        
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Lucro Potencial Estimado</p>
          <p className="text-4xl font-display font-bold">R$ {fmt(totalProfit)}</p>
          <p className="mt-4 text-xs opacity-50 max-w-[200px]">Cálculo baseado no rendimento total de suas {recipes.length} receitas cadastradas.</p>
        </div>
        
        <div className="relative z-10 mt-auto flex justify-end">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Ver detalhes</span>
            <ChevronRight size={14} />
          </div>
        </div>
      </button>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-2">
        <div className="bg-creme rounded-3xl p-6 border border-burgundy/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-burgundy">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Investimento em Estoque</p>
            <p className="text-xl font-bold text-gray-700">R$ {fmt(totalInvestment)}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-6 border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-pastel-pink/10 rounded-2xl flex items-center justify-center text-burgundy">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Margem Média</p>
            <p className="text-xl font-bold text-gray-700">100% <span className="text-[10px] text-green-500 font-bold ml-1">Normal</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};
