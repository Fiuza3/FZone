const Task = require('../models/Task');

// Listar todas as tarefas do usuário
const getAllTasks = async (req, res) => {
    console.log('📋 Buscando tarefas do usuário:', req.user.name);
    
    try {
        const { status, priority } = req.query;
        let filter = { company: req.user.company };
        
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        
        console.log('🔍 Filtros aplicados:', filter);
        
        const tasks = await Task.find(filter)
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });
            
        console.log(`✅ ${tasks.length} tarefas encontradas`);
        res.json(tasks);
    } catch (error) {
        console.error('❌ Erro ao buscar tarefas:', error);
        res.status(500).json({ error: error.message });
    }
};

// Criar nova tarefa
const createTask = async (req, res) => {
    console.log('➕ Criando nova tarefa');
    
    try {
        const { title, description, priority, dueDate, assignedTo } = req.body;
        
        console.log('📝 Dados da tarefa:', { title, priority, assignedTo });
        
        if (!title || title.trim() === '') {
            console.log('❌ Título obrigatório não fornecido');
            return res.status(400).json({ error: 'Título é obrigatório' });
        }
        
        const taskData = {
            title: title.trim(),
            description: description?.trim(),
            priority: priority || 'media',
            createdBy: req.user._id,
            assignedTo: assignedTo || req.user._id,
            company: req.user.company
        };
        
        if (dueDate) {
            taskData.dueDate = new Date(dueDate);
        }
        
        const task = new Task(taskData);
        await task.save();
        
        // Popula os dados para retorno
        await task.populate('createdBy assignedTo', 'name email');
        
        console.log('✅ Tarefa criada:', task.title);
        res.status(201).json(task);
    } catch (error) {
        console.error('❌ Erro ao criar tarefa:', error);
        res.status(500).json({ error: error.message });
    }
};

// Atualizar tarefa
const updateTask = async (req, res) => {
    console.log('✏️ Atualizando tarefa ID:', req.params.id);
    
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, company: req.user.company },
            req.body,
            { new: true, runValidators: true }
        ).populate('createdBy assignedTo', 'name email');
        
        if (!task) {
            console.log('❌ Tarefa não encontrada ou sem permissão');
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }
        
        console.log('✅ Tarefa atualizada:', task.title);
        res.json(task);
    } catch (error) {
        console.error('❌ Erro ao atualizar tarefa:', error);
        res.status(500).json({ error: error.message });
    }
};

// Marcar tarefa como concluída
const completeTask = async (req, res) => {
    console.log('✅ Marcando tarefa como concluída ID:', req.params.id);
    
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, company: req.user.company },
            { 
                status: 'concluida',
                completedAt: new Date()
            },
            { new: true }
        ).populate('createdBy assignedTo', 'name email');
        
        if (!task) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }
        
        console.log('🎉 Tarefa concluída:', task.title);
        res.json(task);
    } catch (error) {
        console.error('❌ Erro ao concluir tarefa:', error);
        res.status(500).json({ error: error.message });
    }
};

// Deletar tarefa
const deleteTask = async (req, res) => {
    console.log('🗑️ Deletando tarefa ID:', req.params.id);
    
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!task) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }
        
        console.log('✅ Tarefa deletada:', task.title);
        res.json({ message: 'Tarefa deletada com sucesso' });
    } catch (error) {
        console.error('❌ Erro ao deletar tarefa:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllTasks,
    createTask,
    updateTask,
    completeTask,
    deleteTask
};
