// ============================================================================
// STORE DO DASHBOARD AVANÇADO (Linhas 1-100)
// ============================================================================
/**
 * Store responsável por gerenciar dados analíticos e métricas
 * do dashboard executivo
 */

import { defineStore } from 'pinia';
import api from '../services/api';

export const useDashboardStore = defineStore('dashboard', {
  // ============================================================================
  // ESTADO DO STORE (Linhas 14-22)
  // ============================================================================
  state: () => ({
    metrics: null,           // Métricas gerais
    revenueChart: [],        // Dados do gráfico de receitas
    upcomingEvents: [],      // Eventos próximos
    loading: false,          // Estado de carregamento
    error: null              // Mensagens de erro
  }),

  // ============================================================================
  // GETTERS COMPUTADOS (Linhas 25-40)
  // ============================================================================
  getters: {
    /**
     * Retorna crescimento percentual da receita mensal
     */
    monthlyGrowth: (state) => {
      if (!state.revenueChart || state.revenueChart.length < 2) return 0;
      
      const current = state.revenueChart[state.revenueChart.length - 1]?.revenue || 0;
      const previous = state.revenueChart[state.revenueChart.length - 2]?.revenue || 0;
      
      if (previous === 0) return 0;
      return ((current - previous) / previous * 100).toFixed(1);
    },

    /**
     * Retorna total de alertas ativos
     */
    totalAlerts: (state) => {
      if (!state.metrics?.alerts) return 0;
      return Object.values(state.metrics.alerts).reduce((sum, count) => sum + count, 0);
    }
  },

  // ============================================================================
  // AÇÕES DO STORE (Linhas 45-100)
  // ============================================================================
  actions: {
    /**
     * Busca métricas gerais do dashboard (Linhas 50-65)
     */
    async fetchMetrics() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.get('/dashboard/metrics');
        this.metrics = response.data;
        console.log('📊 Métricas carregadas:', this.metrics);
      } catch (error) {
        this.error = error.response?.data?.error || 'Erro ao carregar métricas';
        console.error('❌ Erro ao buscar métricas:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Busca dados para gráfico de receitas (Linhas 67-82)
     */
    async fetchRevenueChart() {
      try {
        const response = await api.get('/dashboard/revenue-chart');
        this.revenueChart = response.data;
        console.log('📈 Dados do gráfico carregados:', this.revenueChart.length, 'meses');
      } catch (error) {
        this.error = error.response?.data?.error || 'Erro ao carregar gráfico';
        console.error('❌ Erro ao buscar gráfico:', error);
        throw error;
      }
    },

    /**
     * Busca eventos próximos (Linhas 84-99)
     */
    async fetchUpcomingEvents() {
      try {
        const response = await api.get('/dashboard/upcoming-events');
        this.upcomingEvents = response.data;
        console.log('📅 Eventos próximos carregados:', this.upcomingEvents.length);
      } catch (error) {
        this.error = error.response?.data?.error || 'Erro ao carregar eventos';
        console.error('❌ Erro ao buscar eventos próximos:', error);
        throw error;
      }
    },

    /**
     * Carrega todos os dados do dashboard
     */
    async loadDashboard() {
      await Promise.all([
        this.fetchMetrics(),
        this.fetchRevenueChart(),
        this.fetchUpcomingEvents()
      ]);
    }
  }
});