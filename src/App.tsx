/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LayoutDashboard, ShoppingBasket, BookOpen, Settings as SettingsIcon, Menu, ChefHat } from 'lucide-react';
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
import { SimpleAuth } from './components/SimpleAuth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sidebar } from './components/Sidebar';
import { AdminDashboard } from './components/AdminDashboard';

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

  const [activeTab, setActiveTab] = useState<'dashboard' | 'ingredients' | 'recipes' | 'settings'>('dashboard');
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
        return <DashboardSummary materials={materials} recipes={recipes} />;
      case 'ingredients':
        return <IngredientList materials={materials} onAdd={() => setShowIngredientForm(true)} onDelete={deleteMaterial} onUpdate={updateMaterial} />;
      case 'recipes':
        return <RecipeList recipes={recipes} materials={materials} onAdd={() => setShowRecipeForm(true)} onDelete={deleteRecipe} onUpdate={updateRecipe} />;
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
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto relative bg-creme shadow-2xl overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
        <ChefHat size={300} className="text-burgundy" />
      </div>

      <div className="absolute top-6 left-6 z-40">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-burgundy active:scale-90 transition-transform"
        >
          <Menu size={24} />
        </button>
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenDocs={() => setShowDocs(true)}
        onLogout={logout}
      />

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

      {showIngredientForm && (
        <IngredientForm onSave={addMaterial} onClose={() => setShowIngredientForm(false)} />
      )}
      {showRecipeForm && (
        <RecipeForm materials={materials} onSave={addRecipe} onClose={() => setShowRecipeForm(false)} />
      )}

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-black/5 flex justify-around items-center h-20 px-4 z-50 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('dashboard')} className={cn('bottom-nav-item', activeTab === 'dashboard' && 'active')}>
          <LayoutDashboard size={24} />
          <span className="text-[10px] mt-1 font-bold uppercase">Início</span>
        </button>
        <button onClick={() => setActiveTab('ingredients')} className={cn('bottom-nav-item', activeTab === 'ingredients' && 'active')}>
          <ShoppingBasket size={24} />
          <span className="text-[10px] mt-1 font-bold uppercase">Insumos</span>
        </button>
        <button onClick={() => setActiveTab('recipes')} className={cn('bottom-nav-item', activeTab === 'recipes' && 'active')}>
          <BookOpen size={24} />
          <span className="text-[10px] mt-1 font-bold uppercase">Receitas</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={cn('bottom-nav-item', activeTab === 'settings' && 'active')}>
          <SettingsIcon size={24} />
          <span className="text-[10px] mt-1 font-bold uppercase">Ajustes</span>
        </button>
      </nav>
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
