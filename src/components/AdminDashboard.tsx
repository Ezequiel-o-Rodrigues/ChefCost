import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Trash2, Plus, LogOut, ChefHat, X } from 'lucide-react';
import { authService } from '../services/authService';

interface User {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

const api = (path: string, options?: RequestInit) =>
  fetch(`${window.location.origin}${path}`, { ...options, headers: authService.getAuthHeaders() });

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await api('/api/admin/users');
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleUser = async (id: number) => {
    await api(`/api/admin/users/${id}/toggle`, { method: 'PATCH' });
    fetchUsers();
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Remover este usuário permanentemente?')) return;
    await api(`/api/admin/users/${id}`, { method: 'DELETE' });
    fetchUsers();
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await api('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({ email: newEmail, password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNewEmail('');
      setNewPassword('');
      setShowAdd(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const regularUsers = users.filter(u => u.role !== 'admin');
  const activeCount = regularUsers.filter(u => u.is_active).length;

  return (
    <div className="min-h-screen bg-creme">
      {/* Header */}
      <div className="bg-burgundy text-white p-6 pt-12">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ChefHat size={28} />
            <div>
              <h1 className="text-xl font-display font-bold">Painel Admin</h1>
              <p className="text-xs opacity-70">ChefCost</p>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card bg-white">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Usuários</p>
            <p className="text-2xl font-display font-bold text-burgundy">{regularUsers.length}</p>
          </div>
          <div className="card bg-white">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Ativos</p>
            <p className="text-2xl font-display font-bold text-green-600">{activeCount}</p>
          </div>
        </div>

        {/* Add user */}
        <div className="card bg-white space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-burgundy">Usuários</h2>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="flex items-center gap-1 bg-pastel-pink text-burgundy text-xs font-bold px-3 py-1.5 rounded-full"
            >
              {showAdd ? <X size={14} /> : <Plus size={14} />}
              {showAdd ? 'Fechar' : 'Novo Usuário'}
            </button>
          </div>

          {showAdd && (
            <form onSubmit={addUser} className="bg-creme p-4 rounded-2xl space-y-3">
              <input
                type="email"
                placeholder="Email do usuário"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                required
                className="w-full bg-white border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-pastel-pink"
              />
              <input
                type="password"
                placeholder="Senha inicial"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                className="w-full bg-white border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-pastel-pink"
              />
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button type="submit" disabled={saving} className="w-full btn-primary text-sm py-2 disabled:opacity-50">
                {saving ? 'Criando...' : 'Criar e Liberar Acesso'}
              </button>
            </form>
          )}

          {/* User list */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-pastel-pink border-t-burgundy rounded-full animate-spin" />
            </div>
          ) : regularUsers.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-6">Nenhum usuário cadastrado.</p>
          ) : (
            <div className="space-y-2">
              {regularUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-creme transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${user.is_active ? 'bg-green-400' : 'bg-red-300'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{user.email}</p>
                      <p className="text-[10px] text-gray-400">
                        {user.is_active ? 'Acesso liberado' : 'Acesso bloqueado'} •{' '}
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleUser(user.id)}
                      title={user.is_active ? 'Bloquear' : 'Liberar'}
                      className={`p-1.5 rounded-full transition-colors ${user.is_active ? 'text-green-500 hover:bg-red-50 hover:text-red-400' : 'text-red-400 hover:bg-green-50 hover:text-green-500'}`}
                    >
                      {user.is_active ? <UserCheck size={18} /> : <UserX size={18} />}
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="p-1.5 rounded-full text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
