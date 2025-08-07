const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsReport,
  getFormData
} = require('../controllers/eventController');

// Middleware para verificar se pode criar/editar eventos
const requireManagerOrAbove = (req, res, next) => {
  if (req.user.role === 'owner' || req.user.role === 'admin' || req.user.role === 'manager') {
    return next();
  }
  return res.status(403).json({ 
    error: 'Apenas gerentes ou superiores podem criar/editar eventos',
    code: 'INSUFFICIENT_PERMISSIONS'
  });
};

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Rotas de leitura - todos podem ver
router.get('/', getEvents);
router.get('/report', getEventsReport);
router.get('/form-data', getFormData);

// Rotas de escrita - apenas manager ou superior
router.post('/', requireManagerOrAbove, createEvent);
router.put('/:id', requireManagerOrAbove, updateEvent);
router.delete('/:id', requireManagerOrAbove, deleteEvent);

module.exports = router;