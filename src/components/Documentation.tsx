/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, BookOpen, ShoppingBasket, Calculator, Settings, HelpCircle } from 'lucide-react';

interface DocumentationProps {
  onBack: () => void;
}

export const Documentation: React.FC<DocumentationProps> = ({ onBack }) => {
  return (
    <div className="p-6 space-y-8 bg-creme min-h-screen pb-24">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-white rounded-full transition-colors">
          <ArrowLeft size={24} className="text-burgundy" />
        </button>
        <h1 className="text-2xl font-display font-bold text-burgundy">Documentação</h1>
      </header>

      <div className="space-y-10">
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-burgundy">
            <BookOpen size={24} />
            <h2 className="text-xl font-display font-bold">O que é o ChefCost?</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            O ChefCost é uma ferramenta inteligente projetada para ajudar confeiteiros e gastrônomos a calcularem o custo real de suas produções e precificarem seus produtos de forma justa e lucrativa.
          </p>
        </section>

        <section className="space-y-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Passo a Passo</h3>
          
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-pastel-pink rounded-full flex items-center justify-center text-burgundy font-bold">1</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-burgundy">
                  <ShoppingBasket size={18} />
                  <h4>Cadastre seus Insumos</h4>
                </div>
                <p className="text-sm text-gray-500">Comece adicionando tudo o que você compra. Informe o preço pago e a quantidade da embalagem. O sistema calculará automaticamente o custo por grama ou mililitro.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-pastel-pink rounded-full flex items-center justify-center text-burgundy font-bold">2</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-burgundy">
                  <Calculator size={18} />
                  <h4>Crie suas Receitas</h4>
                </div>
                <p className="text-sm text-gray-500">Monte suas fichas técnicas selecionando os insumos cadastrados. Informe o rendimento da receita e a margem de lucro desejada.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-pastel-pink rounded-full flex items-center justify-center text-burgundy font-bold">3</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-burgundy">
                  <Settings size={18} />
                  <h4>Ajuste seus Custos Fixos</h4>
                </div>
                <p className="text-sm text-gray-500">Na aba de Ajustes, defina o valor da sua hora de trabalho e os custos estimados de energia e gás. Isso é fundamental para uma precificação precisa.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-3xl shadow-sm space-y-4 border border-black/5">
          <div className="flex items-center gap-3 text-burgundy">
            <HelpCircle size={24} />
            <h2 className="text-xl font-display font-bold">Dicas de Ouro</h2>
          </div>
          <ul className="space-y-3 text-sm text-gray-600 list-disc pl-4">
            <li>Sempre atualize o preço dos insumos quando houver reajuste no mercado.</li>
            <li>Não esqueça de incluir embalagens como insumos para um custo total real.</li>
            <li>Use a margem de lucro para cobrir imprevistos e reinvestir no seu negócio.</li>
          </ul>
        </section>

        <footer className="text-center py-6 border-t border-gray-100">
          <p className="text-xs text-gray-400">Dúvidas? Entre em contato com o desenvolvedor.</p>
          <p className="text-sm font-bold text-burgundy mt-1">ezequeilerod2020@gmail.com</p>
        </footer>
      </div>
    </div>
  );
};
