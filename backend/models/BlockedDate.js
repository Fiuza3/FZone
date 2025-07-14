const mongoose = require('mongoose');

// Schema para datas bloqueadas
const blockedDateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['ferias', 'manutencao', 'feriado', 'indisponivel'],
    default: 'ferias'
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
}, {
  timestamps: true
});

// Middleware para log de bloqueios
blockedDateSchema.pre('save', function(next) {
  console.log('🚫 Novo bloqueio de data sendo registrado:');
  console.log(`   Título: ${this.title}`);
  console.log(`   Período: ${new Date(this.startDate).toLocaleDateString()} até ${new Date(this.endDate).toLocaleDateString()}`);
  console.log(`   Tipo: ${this.type}`);
  next();
});

module.exports = mongoose.model('BlockedDate', blockedDateSchema);