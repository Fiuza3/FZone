// Serviço de autenticação com suporte a CORS
import api from './api';
import { axiosWithProxy } from './proxy';
import axios from 'axios';

// URL base da API
const API_URL = import.meta.env.VITE_API_URL || 'https://fzone-api.onrender.com/api';

// Login com tratamento de CORS
export const login = async (email, password) => {
  try {
    // Tenta primeiro com a API normal
    console.log('🔑 Tentando login com email:', email);
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    // Se for erro de CORS, tenta com proxy
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.log('🔄 Erro de CORS detectado, tentando login com proxy...');
      
      try {
        // Tenta com fetch diretamente (pode contornar alguns problemas de CORS)
        const directResponse = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': window.location.origin
          },
          body: JSON.stringify({ email, password }),
          mode: 'cors'
        });
        
        if (directResponse.ok) {
          return await directResponse.json();
        }
      } catch (directError) {
        console.log('❌ Tentativa direta falhou:', directError);
      }
      
      // Tenta com proxy
      try {
        const proxyResponse = await axiosWithProxy(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          data: { email, password }
        });
        
        return proxyResponse.data;
      } catch (proxyError) {
        console.error('❌ Todas as tentativas de login falharam');
        throw proxyError;
      }
    }
    
    throw error;
  }
};

// Registro com tratamento de CORS
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    // Tratamento de CORS similar ao login
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      const proxyResponse = await axiosWithProxy(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: userData
      });
      
      return proxyResponse.data;
    }
    
    throw error;
  }
};

export default { login, register };