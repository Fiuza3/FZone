const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const {
  inviteEmployee,
  acceptInvite,
  getEmployees,
  getPendingInvites
} = require('../controllers/employeeController');

// Rota pública para aceitar convite
router.post('/accept-invite', acceptInvite);

// Rotas protegidas
router.use(authenticateToken);

// Convidar funcionário (apenas owner/admin)
router.post('/invite', inviteEmployee);

// Listar funcionários da empresa
router.get('/', getEmployees);

// Listar convites pendentes
router.get('/invites', getPendingInvites);

module.exports = router;