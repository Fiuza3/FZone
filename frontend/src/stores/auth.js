import { defineStore } from 'pinia';
import api from '../services/api';
import { login as authLogin, register as authRegister } from '../services/auth';

export const useAuthStore = defineStore('auth', {
  state: () => {
    // Limpa tokens antigos/inválidos na inicialização
    const token = localStorage.getItem('token');
    if (token && token.startsWith('fake-jwt-token-')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    return {
      user: JSON.parse(localStorage.getItem('user')) || null,
      token: localStorage.getItem('token') || null,
      error: null,
      loading: false
    };
  },
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'owner' || state.user?.role === 'admin',
    isManager: (state) => state.user?.role === 'manager',
    userDepartment: (state) => state.user?.department || 'geral',
    userName: (state) => state.user?.name || 'Usuário',
    hasPermission: (state) => (module) => {
      // Admin e Owner têm acesso a tudo
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
        // Usando o serviço de autenticação com tratamento CORS
        console.log('🔑 Tentando login com email:', email);
        const data = await authLogin(email, password);
        
        if (data.success) {
          this.setAuth(data.user, data.token);
          return true;
        }
        
        this.error = data.error || 'Credenciais inválidas';
        return false;
      } catch (error) {
        console.error('❌ Erro no login:', error);
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
        // Em um caso real, isso seria uma chamada API
        // const response = await api.post('/auth/register', userData);
        
        // Simulação de registro para desenvolvimento
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Verifica se o email já existe (simulação)
        if (userData.email === 'admin@example.com') {
          this.error = 'Este email já está em uso';
          return false;
        }
        
        // Cria usuário simulado
        const newUser = {
          id: Math.random().toString(36).substring(2),
          name: userData.name,
          email: userData.email,
          role: 'admin', // Todos os usuários são admin
          department: 'admin' // Todos os usuários têm acesso total
        };
        
        const token = 'fake-jwt-token-' + Math.random().toString(36).substring(2);
        
        // Salva no state e localStorage
        this.setAuth(newUser, token);
        return true;
      } catch (error) {
        console.error('❌ Erro no registro:', error);
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
        // Em um caso real, isso seria uma chamada API
        // const response = await api.put('/auth/profile', profileData);
        
        // Simulação para desenvolvimento
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Atualiza apenas os campos permitidos
        const updatedUser = {
          ...this.user,
          name: profileData.name
        };
        
        // Atualiza no state e localStorage
        this.user = updatedUser;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return true;
      } catch (error) {
        console.error('❌ Erro ao atualizar perfil:', error);
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
        // Em um caso real, isso seria uma chamada API
        // const response = await api.put('/auth/change-password', { currentPassword, newPassword });
        
        // Simulação para desenvolvimento
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Simulação de verificação de senha atual
        if (currentPassword !== 'admin123' && this.user.email === 'admin@example.com') {
          this.error = 'Senha atual incorreta';
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('❌ Erro ao alterar senha:', error);
        this.error = error.response?.data?.error || 'Erro ao alterar senha';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    logout() {
      // Limpa dados de autenticação
      this.user = null;
      this.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      console.log('👋 Logout realizado com sucesso');
    },
    
    clearAuth() {
      // Força limpeza completa da autenticação
      this.user = null;
      this.token = null;
      localStorage.clear();
      console.log('🧽 Autenticação limpa completamente');
    },
    
    setAuth(user, token) {
      this.user = user;
      this.token = token;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    }
  }
});