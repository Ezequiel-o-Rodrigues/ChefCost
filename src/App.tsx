/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LayoutDashboard, ShoppingBasket, BookOpen, Settings as SettingsIcon, Menu, ChefHat, TrendingUp, ChevronRight, Plus, Package, Calculator, DollarSign, Utensils, Settings } from 'lucide-react';
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
import { ChefAssistant } from './components/ChefAssistant';

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
        return <DashboardSummary materials={materials} recipes={recipes} onOpenSimulator={() => setActiveTab('simulator')} onNavigate={setActiveTab} />;
      case 'ingredients':
        return <IngredientList materials={materials} onAdd={() => setShowIngredientForm(true)} onDelete={deleteMaterial} onUpdate={updateMaterial} />;
      case 'simulator':
        return <ProfitCalculator recipes={recipes} materials={materials} />;
      case 'recipes':
        return <RecipeList recipes={recipes} materials={materials} settings={settings} onAdd={() => setShowRecipeForm(true)} onDelete={deleteRecipe} onUpdate={updateRecipe} onAddMaterial={addMaterial} />;
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
        return <DashboardSummary materials={materials} recipes={recipes} onOpenSimulator={() => setActiveTab('simulator')} onNavigate={setActiveTab} />;
    }
  };  return (
    <div className="min-h-screen bg-creme font-sans text-gray-800">
      <div className="max-w-md md:max-w-6xl mx-auto min-h-screen flex flex-col relative overflow-hidden">
        
        {/* Decorative background logo - subtle */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.01] pointer-events-none select-none overflow-hidden">
          <ChefHat size={800} className="text-burgundy" />
        </div>

        {/* Improved Header - Fixed but spanning full narrow-width on desktop or full on mobile */}
        <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-6xl h-14 sm:h-16 bg-white z-40 border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 md:px-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-burgundy rounded-xl flex items-center justify-center shadow-md transform -rotate-6">
              <ChefHat className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold text-burgundy leading-none">ChefCost</h1>
              <p className="hidden md:block text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Gestão Inteligente</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-creme rounded-xl transition-colors text-gray-400"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Main Content Area - better padding for desktop */}
        <main className="flex-1 overflow-y-auto pb-28 md:pb-16 pt-16 sm:pt-20 px-3 sm:px-4 md:px-8 relative z-10">
          <div className="md:bg-white md:rounded-3xl md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:border md:border-gray-50 md:p-10 md:mt-4 min-h-[calc(100vh-14rem)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Navigation - Integrated vs Floating */}
        <nav className="fixed bottom-0 md:bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-lg bg-white md:bg-white/90 md:backdrop-blur-xl border-t md:border border-gray-100 md:border-black/5 px-1 sm:px-2 h-16 sm:h-20 md:h-18 flex items-center justify-around z-50 md:rounded-3xl md:shadow-2xl">
          <button onClick={() => setActiveTab('dashboard')} className={cn('bottom-nav-item', activeTab === 'dashboard' && 'active')}>
            <LayoutDashboard size={22} className="md:size-20" />
            <span className="text-[9px] md:text-[10px] mt-1.5 font-bold uppercase tracking-tight">Início</span>
          </button>
          <button onClick={() => setActiveTab('ingredients')} className={cn('bottom-nav-item', activeTab === 'ingredients' && 'active')}>
            <Package size={22} className="md:size-20" />
            <span className="text-[9px] md:text-[10px] mt-1.5 font-bold uppercase tracking-tight">Insumos</span>
          </button>
          <button onClick={() => setActiveTab('simulator')} className={cn('bottom-nav-item', activeTab === 'simulator' && 'active')}>
            <div className={cn(
              "p-3 rounded-2xl transition-all duration-300",
              activeTab === 'simulator' ? "bg-burgundy text-white shadow-lg scale-110" : "bg-creme text-burgundy"
            )}>
              <Calculator size={24} className="md:size-22" />
            </div>
          </button>
          <button onClick={() => setActiveTab('recipes')} className={cn('bottom-nav-item', activeTab === 'recipes' && 'active')}>
            <Utensils size={22} className="md:size-20" />
            <span className="text-[9px] md:text-[10px] mt-1.5 font-bold uppercase tracking-tight">Receitas</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={cn('bottom-nav-item', activeTab === 'settings' && 'active')}>
            <Settings size={20} className="sm:size-22 md:size-20" />
            <span className="text-[8px] sm:text-[9px] md:text-[10px] mt-1 sm:mt-1.5 font-bold uppercase tracking-tight">Ajustes</span>
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

        <ChefAssistant />
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
