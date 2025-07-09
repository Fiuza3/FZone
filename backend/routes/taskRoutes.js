const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticateToken } = require('../middlewares/auth');
const { checkModulePermission } = require('../middlewares/permissions');

// Todas as rotas de tarefas requerem autenticação e permissão
router.use(authenticateToken);
router.use(checkModulePermission('tasks'));

// Rotas CRUD
router.get('/', taskController.getAllTasks);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

// Rota específica para marcar como concluída
router.patch('/:id/complete', taskController.completeTask);

module.exports = router;