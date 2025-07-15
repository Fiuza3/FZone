// Serviço de proxy para contornar problemas de CORS
import axios from 'axios';

// URLs dos serviços de proxy CORS
const CORS_PROXIES = [
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?'
];

// Função para tentar diferentes proxies
export const fetchWithProxy = async (url, options = {}) => {
  // Primeiro tenta sem proxy
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    console.log('🔄 Tentando com proxy devido a erro CORS...');
    
    // Tenta cada proxy em sequência
    for (const proxy of CORS_PROXIES) {
      try {
        const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl, options);
        return response;
      } catch (proxyError) {
        console.error(`❌ Proxy ${proxy} falhou:`, proxyError);
      }
    }
    
    throw new Error('Todos os proxies falharam');
  }
};

// Versão com axios
export const axiosWithProxy = async (url, options = {}) => {
  // Primeiro tenta sem proxy
  try {
    const response = await axios(url, options);
    return response;
  } catch (error) {
    console.log('🔄 Tentando com proxy devido a erro CORS...');
    
    // Tenta cada proxy em sequência
    for (const proxy of CORS_PROXIES) {
      try {
        const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
        const response = await axios(proxyUrl, options);
        return response;
      } catch (proxyError) {
        console.error(`❌ Proxy ${proxy} falhou:`, proxyError);
      }
    }
    
    throw new Error('Todos os proxies falharam');
  }
};

export default { fetchWithProxy, axiosWithProxy };