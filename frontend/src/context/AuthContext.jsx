import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await api.post('/api/auth/login', { username, password });
    if (response.data && response.data.success) {
      const authData = response.data.data;
      const userObj = {
        id: authData.id,
        username: authData.username,
        fullName: authData.fullName,
        email: authData.email,
        role: authData.role,
        baseId: authData.baseId,
        baseName: authData.baseName,
      };

      setToken(authData.accessToken);
      setUser(userObj);

      localStorage.setItem('token', authData.accessToken);
      localStorage.setItem('user', JSON.stringify(userObj));
      return userObj;
    } else {
      throw new Error(response.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
