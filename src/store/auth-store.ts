import { create } from 'zustand';

interface User {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        set({ error: data.error || 'حدث خطأ', isLoading: false });
        return false;
      }
      
      set({ user: data.user, isLoading: false });
      return true;
    } catch {
      set({ error: 'حدث خطأ في الاتصال', isLoading: false });
      return false;
    }
  },
  
  register: async (name, email, password, phone) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        set({ error: data.error || 'حدث خطأ', isLoading: false });
        return false;
      }
      
      set({ user: data.user, isLoading: false });
      return true;
    } catch {
      set({ error: 'حدث خطأ في الاتصال', isLoading: false });
      return false;
    }
  },
  
  logout: async () => {
    set({ isLoading: true });
    
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      set({ user: null, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
  
  checkAuth: async () => {
    set({ isLoading: true });
    
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (data.user) {
        set({ user: data.user, isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch {
      set({ user: null, isLoading: false });
    }
  },
  
  clearError: () => set({ error: null }),
}));
