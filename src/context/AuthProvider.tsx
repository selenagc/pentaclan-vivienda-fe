import { useState, type ReactNode } from 'react';
import { AuthContext, type AuthContextValue } from './auth-context';
import { authStorage } from '../lib/authStorage';
import { authService } from '../services/authService';
import type { LoginCredentials, User } from '../types/auth.types';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Inicializa desde localStorage para mantener la sesión tras recargar.
  const [user, setUser] = useState<User | null>(() => authStorage.getUser());

  const login: AuthContextValue['login'] = async (credentials: LoginCredentials) => {
    const { accessToken, refreshToken, user: loggedUser } = await authService.login(credentials);
    authStorage.save(accessToken, refreshToken, loggedUser);
    setUser(loggedUser);
  };

  const logout: AuthContextValue['logout'] = () => {
    authStorage.clear();
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
