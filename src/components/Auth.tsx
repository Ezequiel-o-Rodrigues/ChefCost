/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LogIn, ChefHat } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export const Auth: React.FC = () => {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8 bg-creme">
      <div className="space-y-4">
        <div className="w-24 h-24 bg-burgundy rounded-full mx-auto flex items-center justify-center text-white shadow-xl">
          <ChefHat size={48} />
        </div>
        <h1 className="text-4xl font-display font-bold text-burgundy">ChefCost</h1>
        <p className="text-gray-500 max-w-xs mx-auto">
          Gerencie seus custos, receitas e precificação de forma simples e profissional.
        </p>
      </div>

      <button 
        onClick={handleLogin}
        className="btn-primary w-full max-w-xs flex items-center justify-center gap-3"
      >
        <LogIn size={20} />
        Entrar com Google
      </button>

      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
        Sistema de Inteligência de Custos
      </p>
    </div>
  );
};
