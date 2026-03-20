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
            O ChefCost é o seu novo caderno de receitas digital inteligente. Ele foi criado de forma simples para ajudar você, que faz maravilhas na cozinha, a saber exatamente quanto gasta na produção de um prato ou doce, e por qual valor deve vendê-lo para ter lucro de verdade. Esqueça contas difíceis, deixe a matemática com a gente!
          </p>
        </section>

        <section className="space-y-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Passo a Passo (Fácil e rápido)</h3>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-pastel-pink rounded-full flex items-center justify-center text-burgundy font-bold">1</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-burgundy">
                  <ShoppingBasket size={18} />
                  <h4>Passo 1: Cadastre seus Ingredientes</h4>
                </div>
                <p className="text-sm text-gray-500">Vá na aba "Ingredientes" para adicionar tudo o que você compra no supermercado (como leite, farinha, embalagens). Diga qual foi o valor que você pagou no pacote fechado, e o aplicativo fará as contas dividindo para achar o preço de cada grama sozinho!</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-pastel-pink rounded-full flex items-center justify-center text-burgundy font-bold">2</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-burgundy">
                  <Calculator size={18} />
                  <h4>Passo 2: Monte suas Receitas</h4>
                </div>
                <p className="text-sm text-gray-500">Na aba "Receitas", você vai juntar os ingredientes que acabou de cadastrar para montar o seu bolo ou prato. Diga quantas porções a receita rende e quanto de lucro (dinheiro extra além dos custos) você deseja ganhar. Pronto: o preço sugerido de venda aparecerá na tela!</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-pastel-pink rounded-full flex items-center justify-center text-burgundy font-bold">3</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-burgundy">
                  <Settings size={18} />
                  <h4>Passo 3: Adicione seus Custos Adicionais</h4>
                </div>
                <p className="text-sm text-gray-500">O seu trabalho tem valor! Por isso, na aba de "Ajustes", coloque um valor para a sua hora de trabalho, além do custo mensal estimado com energia e gás (nós damos algumas sugestões no app). Isso ajudará a garantir que sua empresa não está pagando para você trabalhar nela.</p>
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
            <li>Sempre que for ao mercado e um produto estiver mais caro, lembre-se de voltar no app e atualizar o preço dele!</li>
            <li>A embalagem do produto (caixinha, etiqueta, laço de fita) também tem que entrar na conta. Cadastre-as como ingredientes para o seu dinheiro não sair pelo ralo!</li>
            <li>Não tenha medo de cobrar o preço justo usando a Margem de Lucro; o ChefCost vai garantir que é um bom preço para o seu cliente e para o seu bolso.</li>
          </ul>
        </section>

        <footer className="text-center py-6 border-t border-gray-100">
          <p className="text-xs text-gray-400">Dúvidas? Entre em contato com o desenvolvedor.</p>
          <p className="text-sm font-bold text-burgundy mt-1">ezequielrod2020@gmail.com</p>
        </footer>
      </div>
    </div>
  );
};
