/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LogIn, ChefHat } from 'lucide-react';

interface SimpleAuthProps {
  onLogin: (email: string) => void;
}

export const SimpleAuth: React.FC<SimpleAuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao fazer login');
        return;
      }

      // Salva o token e email no localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userEmail', email);
      
      onLogin(email);
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
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

      <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-white border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-pastel-pink focus:border-transparent transition-all"
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-white border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-pastel-pink focus:border-transparent transition-all"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <LogIn size={20} />
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
        Sistema de Inteligência de Custos
      </p>
    </div>
  );
};
