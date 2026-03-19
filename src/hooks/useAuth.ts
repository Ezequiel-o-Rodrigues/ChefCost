import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const session = authService.getSession();
    if (session) setUserEmail(session.email);
  }, []);

  const login = async (email: string, password: string) => {
    const resolvedEmail = await authService.login(email, password);
    setUserEmail(resolvedEmail);
  };

  const logout = () => {
    authService.logout();
    setUserEmail(null);
  };

  return { userEmail, isAuthenticated: !!userEmail, login, logout };
};
