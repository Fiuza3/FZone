import axios from 'axios';
import mockApi from './mockApi';

// Verifica se deve usar API mockada
const useMockApi = true; // Sempre usar mockada para desenvolvimento

// Cria instância do axios com configurações padrão
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://fzone-api.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// API wrapper que decide entre real e mockada
const api = useMockApi ? mockApi : axiosInstance;

// Adiciona interceptores apenas se estiver usando axios real
if (!useMockApi && axiosInstance.interceptors) {
  // Interceptor para adicionar token de autenticação
  axiosInstance.interceptors.request.use(
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
  axiosInstance.interceptors.response.use(
    response => {
      return response;
    },
    error => {
      // Tratamento de erro de autenticação
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?session=expired';
      }
      
      // Log de erro
      console.error('❌ API Error:', error.response?.data || error.message);
      return Promise.reject(error);
    }
  );
}

// Log para indicar qual API está sendo usada
console.log(`💻 Usando API ${useMockApi ? 'mockada' : 'real'} para desenvolvimento`);

export default api;