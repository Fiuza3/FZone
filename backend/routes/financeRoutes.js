const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { authenticateToken } = require('../middlewares/auth');
const { checkModulePermission } = require('../middlewares/permissions');

// Todas as rotas requerem autenticação e permissão de finance
router.use(authenticateToken);
router.use(checkModulePermission('finance'));

// Rotas CRUD
router.get('/', financeController.getTransactions);
router.post('/', financeController.createTransaction);
router.put('/:id', financeController.updateTransaction);
router.delete('/:id', financeController.deleteTransaction);

// Relatórios financeiros
router.get('/balance', financeController.getBalance);
router.get('/report', financeController.getFinancialReport);
router.get('/projection', financeController.getProjection);
router.get('/recurring', financeController.getRecurringTransactions);

module.exports = router;