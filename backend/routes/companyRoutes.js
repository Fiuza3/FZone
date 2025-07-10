const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const {
  getCompanySettings,
  updateCompanySettings
} = require('../controllers/companyController');

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Rotas de configurações da empresa
router.get('/settings', getCompanySettings);
router.put('/settings', updateCompanySettings);

module.exports = router;