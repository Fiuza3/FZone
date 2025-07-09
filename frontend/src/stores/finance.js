import { defineStore } from 'pinia';
import api from '../services/api';

export const useFinanceStore = defineStore('finance', {
  state: () => ({
    transactions: [],
    balance: null,
    report: null,
    loading: false,
    error: null
  }),
  
  getters: {
    incomeTransactions: (state) => state.transactions.filter(t => t.type === 'receita'),
    expenseTransactions: (state) => state.transactions.filter(t => t.type === 'despesa'),
    pendingTransactions: (state) => state.transactions.filter(t => t.status === 'pendente'),
    totalIncome: (state) => {
      return state.incomeTransactions.reduce((total, t) => total + t.amount, 0);
    },
    totalExpense: (state) => {
      return state.expenseTransactions.reduce((total, t) => total + t.amount, 0);
    },
    currentBalance: (state) => {
      if (state.balance) return state.balance.balance;
      return state.totalIncome - state.totalExpense;
    }
  },
  
  actions: {
    async fetchTransactions(filters = {}) {
      console.log('💰 Buscando transações com filtros:', filters);
      this.loading = true;
      
      try {
        const response = await api.get('/finance', { params: filters });
        console.log(`✅ ${response.data.length} transações carregadas`);
        this.transactions = response.data;
        return this.transactions;
      } catch (error) {
        console.error('❌ Erro ao buscar transações:', error);
        this.error = error.response?.data?.error || 'Erro ao carregar transações';
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    async createTransaction(transactionData) {
      console.log('➕ Criando nova transação:', transactionData.description);
      this.loading = true;
      
      try {
        const response = await api.post('/finance', transactionData);
        console.log('✅ Transação criada:', response.data.transaction.description);
        this.transactions.unshift(response.data.transaction);
        return response.data.transaction;
      } catch (error) {
        console.error('❌ Erro ao criar transação:', error);
        this.error = error.response?.data?.error || 'Erro ao criar transação';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateTransaction(id, transactionData) {
      console.log('✏️ Atualizando transação ID:', id);
      this.loading = true;
      
      try {
        const response = await api.put(`/finance/${id}`, transactionData);
        console.log('✅ Transação atualizada:', response.data.transaction.description);
        
        // Atualiza a transação na lista
        const index = this.transactions.findIndex(t => t._id === id);
        if (index !== -1) {
          this.transactions[index] = response.data.transaction;
        }
        
        return response.data.transaction;
      } catch (error) {
        console.error('❌ Erro ao atualizar transação:', error);
        this.error = error.response?.data?.error || 'Erro ao atualizar transação';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteTransaction(id) {
      console.log('🗑️ Deletando transação ID:', id);
      this.loading = true;
      
      try {
        await api.delete(`/finance/${id}`);
        console.log('✅ Transação deletada com sucesso');
        
        // Remove a transação da lista
        this.transactions = this.transactions.filter(t => t._id !== id);
        return true;
      } catch (error) {
        console.error('❌ Erro ao deletar transação:', error);
        this.error = error.response?.data?.error || 'Erro ao deletar transação';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async getBalance(dateRange = {}) {
      console.log('💰 Calculando balanço financeiro');
      this.loading = true;
      
      try {
        const response = await api.get('/finance/balance', { params: dateRange });
        console.log('✅ Balanço calculado:', response.data);
        this.balance = response.data;
        return this.balance;
      } catch (error) {
        console.error('❌ Erro ao calcular balanço:', error);
        this.error = error.response?.data?.error || 'Erro ao calcular balanço';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async getFinancialReport(dateRange = {}) {
      console.log('📊 Gerando relatório financeiro');
      this.loading = true;
      
      try {
        const response = await api.get('/finance/report', { params: dateRange });
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
    }
  }
});