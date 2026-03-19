const TOKEN_KEY = 'authToken';
const EMAIL_KEY = 'userEmail';
const ROLE_KEY = 'userRole';

export const authService = {
  login: async (email: string, password: string): Promise<{ email: string; role: string }> => {
    const res = await fetch(`${window.location.origin}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao fazer login');
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(EMAIL_KEY, email);
    localStorage.setItem(ROLE_KEY, data.role);
    return { email, role: data.role };
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(ROLE_KEY);
  },

  getSession: (): { email: string; token: string; role: string } | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    const email = localStorage.getItem(EMAIL_KEY);
    const role = localStorage.getItem(ROLE_KEY) ?? 'user';
    return token && email ? { token, email, role } : null;
  },

  getAuthHeaders: (): Record<string, string> => {
    const token = localStorage.getItem(TOKEN_KEY);
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  },
};
