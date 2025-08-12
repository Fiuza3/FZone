// ============================================================================
// CONTROLLER DE DASHBOARD AVANÇADO (Linhas 1-150)
// ============================================================================
/**
 * Controller responsável por fornecer dados analíticos e métricas
 * para o dashboard executivo do sistema
 */

const Event = require('../models/Event');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const User = require('../models/User');

// ============================================================================
// MÉTRICAS GERAIS DO DASHBOARD (Linhas 15-65)
// ============================================================================
/**
 * Retorna métricas principais para o dashboard
 * Inclui eventos, receitas, lucros e alertas
 * @param {Object} req - Request com usuário autenticado
 * @param {Object} res - Response com métricas do dashboard
 */
const getDashboardMetrics = async (req, res) => {
  try {
    const companyId = req.user.company;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Métricas de eventos (Linhas 28-35)
    const [totalEvents, eventsThisMonth, upcomingEvents] = await Promise.all([
      Event.countDocuments({ company: companyId }),
      Event.countDocuments({ 
        company: companyId, 
        createdAt: { $gte: startOfMonth } 
      }),
      Event.countDocuments({ 
        company: companyId, 
        startDate: { $gte: now },
        status: { $in: ['planejado', 'confirmado'] }
      })
    ]);

    // Métricas financeiras (Linhas 37-50)
    const revenueThisMonth = await Event.aggregate([
      { $match: { company: companyId, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$revenue' } } }
    ]);

    const revenueThisYear = await Event.aggregate([
      { $match: { company: companyId, createdAt: { $gte: startOfYear } } },
      { $group: { _id: null, total: { $sum: '$revenue' } } }
    ]);

    // Alertas do sistema (Linhas 52-58)
    const lowStockProducts = await Product.countDocuments({
      company: companyId,
      $expr: { $lte: ['$quantity', '$minStock'] }
    });

    // Compila métricas (Linhas 60-75)
    const metrics = {
      events: {
        total: totalEvents,
        thisMonth: eventsThisMonth,
        upcoming: upcomingEvents
      },
      revenue: {
        thisMonth: revenueThisMonth[0]?.total || 0,
        thisYear: revenueThisYear[0]?.total || 0
      },
      alerts: {
        lowStock: lowStockProducts
      },
      lastUpdated: now
    };

    res.json(metrics);
  } catch (error) {
    console.error('❌ Erro ao buscar métricas:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// GRÁFICO DE RECEITAS POR MÊS (Linhas 80-120)
// ============================================================================
/**
 * Retorna dados para gráfico de receitas dos últimos 12 meses
 * @param {Object} req - Request com usuário autenticado
 * @param {Object} res - Response com dados do gráfico
 */
const getRevenueChart = async (req, res) => {
  try {
    const companyId = req.user.company;
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // Busca receitas por mês das transações
    const revenueByMonth = await Transaction.aggregate([
      {
        $match: {
          company: companyId,
          type: 'receita',
          status: 'pago',
          date: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Formata dados para o gráfico
    const chartData = revenueByMonth.map(item => ({
      month: `${item._id.month}/${item._id.year}`,
      revenue: item.revenue,
      transactions: item.count
    }));

    res.json(chartData);
  } catch (error) {
    console.error('❌ Erro ao gerar gráfico:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// EVENTOS PRÓXIMOS (Linhas 125-150)
// ============================================================================
/**
 * Retorna lista de eventos próximos (próximos 30 dias)
 * @param {Object} req - Request com usuário autenticado
 * @param {Object} res - Response com eventos próximos
 */
const getUpcomingEvents = async (req, res) => {
  try {
    const companyId = req.user.company;
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

    // Busca eventos próximos (Linhas 138-148)
    const upcomingEvents = await Event.find({
      company: companyId,
      startDate: { $gte: now, $lte: thirtyDaysFromNow },
      status: { $in: ['planejado', 'confirmado', 'em_andamento'] }
    })
    .select('title startDate location status revenue')
    .sort({ startDate: 1 })
    .limit(10);

    res.json(upcomingEvents);
  } catch (error) {
    console.error('❌ Erro ao buscar eventos próximos:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboardMetrics,
  getRevenueChart,
  getUpcomingEvents
};