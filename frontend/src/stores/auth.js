import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    error: null,
    loading: false
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'owner' || state.user?.role === 'admin',
    isManager: (state) => state.user?.role === 'manager',
    userDepartment: (state) => state.user?.department || 'geral',
    userName: (state) => state.user?.name || 'Usuário',
    hasPermission: (state) => (module) => {
      if (state.user?.role === 'owner' || state.user?.role === 'admin') {
        return true;
      }
      if (!state.user?.permissions) return false;
      return state.user.permissions[module] === true;
    }
  },
  
  actions: {
    async login(email, password) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.post('/auth/login', { email, password });
        
        if (response.data.success) {
          this.setAuth(response.data.user, response.data.token);
          return true;
        }
        
        this.error = response.data.error || 'Credenciais inválidas';
        return false;
      } catch (error) {
        console.error('Erro no login:', error);
        this.error = error.response?.data?.error || 'Erro ao fazer login';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async register(userData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.post('/auth/register', userData);
        
        if (response.data.success) {
          this.setAuth(response.data.user, response.data.token);
          return true;
        }
        
        this.error = response.data.error || 'Erro ao registrar';
        return false;
      } catch (error) {
        console.error('Erro no registro:', error);
        this.error = error.response?.data?.error || 'Erro ao registrar usuário';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async getProfile() {
      try {
        const response = await api.get('/auth/profile');
        this.user = response.data.user;
        localStorage.setItem('user', JSON.stringify(this.user));
        return response.data;
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        throw error;
      }
    },
    
    async updateProfile(profileData) {
      if (!this.token) return false;
      
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.put('/auth/profile', profileData);
        
        if (response.data.success) {
          this.user = response.data.user;
          localStorage.setItem('user', JSON.stringify(this.user));
          return true;
        }
        
        this.error = response.data.error || 'Erro ao atualizar perfil';
        return false;
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        this.error = error.response?.data?.error || 'Erro ao atualizar perfil';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async changePassword(currentPassword, newPassword) {
      if (!this.token) return false;
      
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.put('/auth/change-password', { 
          currentPassword, 
          newPassword 
        });
        
        if (response.data.success) {
          return true;
        }
        
        this.error = response.data.error || 'Erro ao alterar senha';
        return false;
      } catch (error) {
        console.error('Erro ao alterar senha:', error);
        this.error = error.response?.data?.error || 'Erro ao alterar senha';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    
    setAuth(user, token) {
      this.user = user;
      this.token = token;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    }
  }
});