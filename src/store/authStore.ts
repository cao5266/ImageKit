// 用户认证状态管理
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  isVIP: boolean;
  vipType?: 'monthly' | 'yearly';
  vipExpireAt?: Date;
  credits?: number;        // 点数余额
  vipLevel?: number;       // VIP 等级 (0-3)
}

interface AuthState {
  // 状态
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 初始状态
      user: null,
      token: null,
      isAuthenticated: false,
      
      // 设置用户
      setUser: (user) => set({ user, isAuthenticated: true }),
      
      // 设置Token
      setToken: (token) => set({ token }),
      
      // 登录
      login: (user, token) => set({
        user,
        token,
        isAuthenticated: true,
      }),
      
      // 登出
      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
      }),
      
      // 更新用户信息
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
