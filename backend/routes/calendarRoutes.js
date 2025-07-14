const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const {
  getBlockedDates,
  createBlockedDate,
  removeBlockedDate,
  exportCalendarToPDF
} = require('../controllers/calendarController');

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Rotas de bloqueios de datas
router.get('/blocks', getBlockedDates);
router.post('/blocks', createBlockedDate);
router.delete('/blocks/:id', removeBlockedDate);

// Exportação para PDF
router.get('/export', exportCalendarToPDF);

module.exports = router;