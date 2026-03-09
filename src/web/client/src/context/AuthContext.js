import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import config from '../config';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumInfo, setPremiumInfo] = useState(null);
  useEffect(() => {
    fetchUser();
  }, []);
  const fetchUser = async () => {
    try {
      const res = await fetch('${config.apiUrl}/auth/user', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        if (data) {
          setIsPremium(data.isPremium || false);
          setPremiumInfo({
            isPremium: data.isPremium || false,
            premiumExpiresAt: data.premiumExpiresAt,
            maxPlaylists: data.maxPlaylists || 3,
            maxQueueSize: data.maxQueueSize || 50,
            canUseFilters: data.canUseFilters || false,
            canControlVolume: data.canControlVolume || false
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };
  const login = () => {
    window.location.href = '${config.apiUrl}/auth/discord`;
  };
  const logout = () => {
    window.location.href = `${config.apiUrl}/auth/logout';
  };
  const getAvatarUrl = useCallback((userData) => {
    if (!userData || !userData.id || !userData.avatar) {
      return '/images/default-avatar.png';
    }
    return 'https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`;
  }, []);
  return (
    <AuthContext.Provider value={{ 
      user, loading, login, logout, getAvatarUrl, fetchUser,
      isPremium, premiumInfo
    }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
