/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LayoutDashboard, ShoppingBasket, BookOpen, Settings as SettingsIcon, Menu, ChefHat, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { DashboardSummary } from './components/DashboardSummary';
import { IngredientList } from './components/IngredientList';
import { RecipeList } from './components/RecipeList';
import { SettingsForm } from './components/SettingsForm';
import { ConversionForm } from './components/ConversionForm';
import { IngredientForm } from './components/IngredientForm';
import { RecipeForm } from './components/RecipeForm';
import { ProfitCalculator } from './components/ProfitCalculator';
import { SimpleAuth } from './components/SimpleAuth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sidebar } from './components/Sidebar';
import { AdminDashboard } from './components/AdminDashboard';
import { Documentation } from './components/Documentation';

import { useAuth } from './hooks/useAuth';
import { useAPI } from './hooks/useAPI';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function AppContent() {
  const { userEmail, isAuthenticated, isAdmin, login, logout } = useAuth();
  const {
    materials, recipes, conversions, settings, loading,
    addMaterial, updateMaterial, deleteMaterial,
    addRecipe, updateRecipe, deleteRecipe,
    addConversion, deleteConversion,
    updateSettings,
  } = useAPI(userEmail);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'ingredients' | 'recipes' | 'simulator' | 'settings'>('dashboard');
  const [showIngredientForm, setShowIngredientForm] = useState(false);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  if (!isAuthenticated) {
    return <SimpleAuth onLogin={login} />;
  }

  if (isAdmin) {
    return <AdminDashboard onLogout={logout} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-creme">
        <div className="w-12 h-12 border-4 border-pastel-pink border-t-burgundy rounded-full animate-spin"></div>
      </div>
    );
  }

  if (showDocs) {
    return <Documentation onBack={() => setShowDocs(false)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardSummary materials={materials} recipes={recipes} onOpenSimulator={() => setActiveTab('simulator')} />;
      case 'ingredients':
        return <IngredientList materials={materials} onAdd={() => setShowIngredientForm(true)} onDelete={deleteMaterial} onUpdate={updateMaterial} />;
      case 'simulator':
        return <ProfitCalculator recipes={recipes} materials={materials} />;
      case 'recipes':
        return <RecipeList recipes={recipes} materials={materials} settings={settings} onAdd={() => setShowRecipeForm(true)} onDelete={deleteRecipe} onUpdate={updateRecipe} />;
      case 'settings':
        return (
          <div className="p-6 pt-20 space-y-6">
            <header>
              <h1 className="text-2xl font-display font-bold text-burgundy">Configurações</h1>
            </header>
            <SettingsForm settings={settings} onSave={updateSettings} />
            <ConversionForm conversions={conversions} onSave={addConversion} onDelete={deleteConversion} />
          </div>
        );
      default:
        return <DashboardSummary materials={materials} recipes={recipes} />;
    }
  };  return (
    <div className="min-h-screen bg-creme font-sans text-gray-800">
      <div className="max-w-md md:max-w-6xl mx-auto min-h-screen flex flex-col relative overflow-hidden">
        
        {/* Decorative background logo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none overflow-hidden">
          <ChefHat size={600} className="text-burgundy" />
        </div>

        {/* Improved Header */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md z-40 border-b border-black/5 flex items-center justify-between px-6 md:px-12 w-full max-w-md md:max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-burgundy rounded-xl flex items-center justify-center shadow-lg transform -rotate-12">
              <ChefHat className="text-white" size={24} />
            </div>
            <div className="hidden xs:block">
              <h1 className="text-xl font-display font-bold text-burgundy leading-none">ChefCost</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Gestão Inteligente</p>
            </div>
            <h1 className="text-xl font-display font-bold text-burgundy leading-none xs:hidden">ChefCost</h1>
          </div>
          
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-creme rounded-xl transition-colors text-gray-500 bg-white/50"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-32 md:pb-36 pt-20 px-4 md:px-0 relative">
          <div className="md:bg-white md:rounded-3xl md:shadow-xl md:p-8 md:mt-4 min-h-[calc(100vh-16rem)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="relative z-10"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Responsive Bottom/Middle Navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[calc(100%-2rem)] md:max-w-2xl bg-white/95 backdrop-blur-xl border border-black/5 px-2 h-20 md:h-22 flex items-center justify-around z-50 mb-4 md:mb-8 rounded-3xl shadow-2xl overflow-hidden">
          <button onClick={() => setActiveTab('dashboard')} className={cn('bottom-nav-item', activeTab === 'dashboard' && 'active')}>
            <LayoutDashboard size={22} className="md:size-26" />
            <span className="text-[9px] md:text-[11px] mt-1.5 font-bold uppercase tracking-tight">Início</span>
          </button>
          <button onClick={() => setActiveTab('ingredients')} className={cn('bottom-nav-item', activeTab === 'ingredients' && 'active')}>
            <ShoppingBasket size={22} className="md:size-26" />
            <span className="text-[9px] md:text-[11px] mt-1.5 font-bold uppercase tracking-tight">Ingredientes</span>
          </button>
          <button onClick={() => setActiveTab('simulator')} className={cn('bottom-nav-item', activeTab === 'simulator' && 'active')}>
            <TrendingUp size={22} className="md:size-26" />
            <span className="text-[9px] md:text-[11px] mt-1.5 font-bold uppercase tracking-tight text-center">Simulador</span>
          </button>
          <button onClick={() => setActiveTab('recipes')} className={cn('bottom-nav-item', activeTab === 'recipes' && 'active')}>
            <BookOpen size={22} className="md:size-26" />
            <span className="text-[9px] md:text-[11px] mt-1.5 font-bold uppercase tracking-tight">Receitas</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={cn('bottom-nav-item', activeTab === 'settings' && 'active')}>
            <SettingsIcon size={22} className="md:size-26" />
            <span className="text-[9px] md:text-[11px] mt-1.5 font-bold uppercase tracking-tight">Ajustes</span>
          </button>
        </nav>

        {showIngredientForm && (
          <IngredientForm onSave={addMaterial} onClose={() => setShowIngredientForm(false)} />
        )}
        {showRecipeForm && (
          <RecipeForm materials={materials} settings={settings} onSave={addRecipe} onAddMaterial={addMaterial} onClose={() => setShowRecipeForm(false)} />
        )}

        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenDocs={() => setShowDocs(true)}
          onLogout={logout}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
