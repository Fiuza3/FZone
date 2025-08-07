const mongoose = require('mongoose');

// Schema para tarefas
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pendente', 'em_andamento', 'concluida', 'cancelada'],
    default: 'pendente'
  },
  priority: {
    type: String,
    enum: ['baixa', 'media', 'alta', 'urgente'],
    default: 'media'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  category: {
    type: String,
    enum: ['estoque', 'financeiro', 'rh', 'geral'],
    default: 'geral'
  },
  tags: [String]
}, {
  timestamps: true
});

// Middleware para log de alterações de status
taskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    console.log('📝 Alteração de status da tarefa:');
    console.log(`   Tarefa: ${this.title}`);
    console.log(`   Status anterior: ${this.get('status', null, { getters: false })}`);
    console.log(`   Novo status: ${this.status}`);
    
    // Se status mudou para concluída, registra a data de conclusão
    if (this.status === 'concluida' && !this.completedAt) {
      console.log('✅ Tarefa marcada como concluída');
      this.completedAt = new Date();
    }
  }
  next();
});

// Virtual para verificar se a tarefa está atrasada
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'concluida' || this.status === 'cancelada') {
    return false;
  }
  
  const isLate = new Date() > new Date(this.dueDate);
  if (isLate) {
    console.log('⚠️ ALERTA: Tarefa atrasada:', this.title);
  }
  return isLate;
});

module.exports = mongoose.model('Task', taskSchema);