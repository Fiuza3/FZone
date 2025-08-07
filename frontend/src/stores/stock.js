import { defineStore } from 'pinia';
import api from '../services/api';

export const useStockStore = defineStore('stock', {
  state: () => ({
    products: [],
    loading: false,
    error: null,
    report: null
  }),
  
  getters: {
    lowStockProducts: (state) => state.products.filter(product => product.isLowStock),
    productsByCategory: (state) => {
      const categories = {};
      state.products.forEach(product => {
        if (!categories[product.category]) {
          categories[product.category] = [];
        }
        categories[product.category].push(product);
      });
      return categories;
    },
    totalStockValue: (state) => {
      return state.products.reduce((total, product) => {
        return total + (product.quantity * product.cost);
      }, 0);
    }
  },
  
  actions: {
    async fetchProducts(filters = {}, sortBy = 'name', sortOrder = 'asc') {
      console.log('📦 Buscando produtos com filtros:', filters);
      this.loading = true;
      
      try {
        const params = { ...filters, sortBy, sortOrder };
        const response = await api.get('/stock', { params });
        console.log(`✅ ${response.data.length} produtos carregados`);
        this.products = response.data;
        return this.products;
      } catch (error) {
        console.error('❌ Erro ao buscar produtos:', error);
        this.error = error.response?.data?.error || 'Erro ao carregar produtos';
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    async createProduct(productData) {
      console.log('➕ Criando novo produto:', productData.name);
      this.loading = true;
      
      try {
        const response = await api.post('/stock', productData);
        console.log('✅ Produto criado:', response.data.product.name);
        this.products.push(response.data.product);
        return response.data.product;
      } catch (error) {
        console.error('❌ Erro ao criar produto:', error);
        this.error = error.response?.data?.error || 'Erro ao criar produto';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateProduct(id, productData) {
      console.log('✏️ Atualizando produto ID:', id);
      this.loading = true;
      
      try {
        const response = await api.put(`/stock/${id}`, productData);
        console.log('✅ Produto atualizado:', response.data.product.name);
        
        // Atualiza o produto na lista
        const index = this.products.findIndex(product => product._id === id);
        if (index !== -1) {
          this.products[index] = response.data.product;
        }
        
        return response.data.product;
      } catch (error) {
        console.error('❌ Erro ao atualizar produto:', error);
        this.error = error.response?.data?.error || 'Erro ao atualizar produto';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async adjustStock(id, quantity, operation) {
      console.log(`📊 Ajustando estoque: ${operation} ${quantity} unidades ao produto ID: ${id}`);
      this.loading = true;
      
      try {
        const response = await api.patch(`/stock/${id}/adjust`, {
          quantity,
          operation
        });
        
        console.log('✅ Estoque ajustado:', response.data.adjustment);
        
        // Atualiza o produto na lista
        const index = this.products.findIndex(product => product._id === id);
        if (index !== -1) {
          this.products[index] = response.data.product;
        }
        
        return response.data;
      } catch (error) {
        console.error('❌ Erro ao ajustar estoque:', error);
        this.error = error.response?.data?.error || 'Erro ao ajustar estoque';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async getStockReport(period = '30') {
      console.log('📊 Gerando relatório de estoque para período:', period);
      this.loading = true;
      
      try {
        const response = await api.get('/stock/report', { params: { period } });
        console.log('✅ Relatório gerado com sucesso');
        this.report = response.data;
        return this.report;
      } catch (error) {
        console.error('❌ Erro ao gerar relatório:', error);
        this.error = error.response?.data?.error || 'Erro ao gerar relatório';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async exportReport(format = 'csv', period = '30') {
      console.log(`📤 Exportando relatório em formato ${format}`);
      
      try {
        const response = await api.get('/stock/export', { 
          params: { format, period },
          responseType: 'blob'
        });
        
        const blob = new Blob([response.data], { 
          type: format === 'csv' ? 'text/csv' : 'application/json' 
        });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const date = new Date().toISOString().split('T')[0];
        const extension = format === 'csv' ? 'csv' : 'json';
        link.download = `relatorio-estoque-${date}.${extension}`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('✅ Relatório exportado com sucesso');
        return true;
      } catch (error) {
        console.error('❌ Erro ao exportar relatório:', error);
        throw error;
      }
    },
    
    async deleteProduct(id) {
      console.log('🗑️ Excluindo produto ID:', id);
      this.loading = true;
      
      try {
        await api.delete(`/stock/${id}`);
        console.log('✅ Produto excluído com sucesso');
        
        // Remove o produto da lista
        const index = this.products.findIndex(product => product._id === id);
        if (index !== -1) {
          this.products.splice(index, 1);
        }
        
        return true;
      } catch (error) {
        console.error('❌ Erro ao excluir produto:', error);
        this.error = error.response?.data?.error || 'Erro ao excluir produto';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async searchProducts(query) {
      if (!query || query.length < 2) {
        return [];
      }
      
      try {
        const response = await api.get('/stock/search', { params: { q: query } });
        return response.data;
      } catch (error) {
        console.error('❌ Erro na busca:', error);
        return [];
      }
    }
  }
});