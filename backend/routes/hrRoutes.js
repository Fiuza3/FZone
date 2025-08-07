const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hrController');
const { authenticateToken } = require('../middlewares/auth');
const { checkModulePermission } = require('../middlewares/permissions');

// Todas as rotas requerem autenticação e permissão de hr
router.use(authenticateToken);
router.use(checkModulePermission('hr'));

// Rotas CRUD
router.get('/', hrController.getEmployees);
router.post('/', hrController.createEmployee);
router.put('/:id', hrController.updateEmployee);
router.patch('/:id/deactivate', hrController.deactivateEmployee);
router.get('/payroll', hrController.getPayrollReport);
router.get('/birthdays', hrController.getBirthdayReport);

module.exports = router;