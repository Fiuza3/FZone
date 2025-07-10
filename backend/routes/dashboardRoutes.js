// ============================================================================
// ROTAS DO DASHBOARD AVANÇADO (Linhas 1-30)
// ============================================================================
/**
 * Define rotas para métricas e análises do dashboard
 * Todas as rotas requerem autenticação
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const {
  getDashboardMetrics,
  getRevenueChart,
  getUpcomingEvents
} = require('../controllers/dashboardController');

// ============================================================================
// MIDDLEWARE DE AUTENTICAÇÃO (Linha 19)
// ============================================================================
router.use(authenticateToken);

// ============================================================================
// ROTAS DE MÉTRICAS E ANÁLISES (Linhas 24-28)
// ============================================================================
router.get('/metrics', getDashboardMetrics);      // Métricas gerais
router.get('/revenue-chart', getRevenueChart);    // Gráfico de receitas
router.get('/upcoming-events', getUpcomingEvents); // Eventos próximos

module.exports = router;