const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { authenticateToken } = require('../middlewares/auth');
const { checkModulePermission } = require('../middlewares/permissions');

// Todas as rotas requerem autenticação e permissão de stock
router.use(authenticateToken);
router.use(checkModulePermission('stock'));

// Rotas CRUD
router.get('/', stockController.getProducts);
router.get('/search', stockController.searchProducts);
router.post('/', stockController.createProduct);
router.put('/:id', stockController.updateProduct);
router.delete('/:id', stockController.deleteProduct);
router.patch('/:id/adjust', stockController.adjustStock);
router.get('/report', stockController.getStockReport);
router.get('/export', stockController.exportReport);

module.exports = router;