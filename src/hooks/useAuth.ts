import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const session = authService.getSession();
    if (session) {
      setUserEmail(session.email);
      setIsAdmin(session.role === 'admin');
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { email: resolvedEmail, role } = await authService.login(email, password);
    setUserEmail(resolvedEmail);
    setIsAdmin(role === 'admin');
  };

  const logout = () => {
    authService.logout();
    setUserEmail(null);
    setIsAdmin(false);
  };

  return { userEmail, isAuthenticated: !!userEmail, isAdmin, login, logout };
};
