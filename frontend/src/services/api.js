import axios from 'axios';
import { axiosWithProxy } from './proxy';

// Cria instância do axios com configurações padrão
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://fzone-api.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  },
  withCredentials: false
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    // Tratamento de erro de autenticação
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?session=expired';
    }
    
    // Log de erro
    console.error('❌ API Error:', error.response?.data || error.message);
    
    // Se for erro de CORS, tenta com proxy
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.log('🔄 Erro de CORS detectado, tentando com proxy...');
      try {
        // Extrai a URL completa da requisição original
        const originalRequest = error.config;
        const fullUrl = originalRequest.baseURL + originalRequest.url;
        
        // Tenta com o serviço de proxy
        const response = await axiosWithProxy(fullUrl, {
          method: originalRequest.method,
          headers: originalRequest.headers,
          data: originalRequest.data
        });
        
        return response;
      } catch (proxyError) {
        console.error('❌ Falha ao usar proxy:', proxyError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;