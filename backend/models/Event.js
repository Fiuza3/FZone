const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
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
  location: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['planejado', 'confirmado', 'em_andamento', 'concluido', 'cancelado'],
    default: 'planejado'
  },
  // Produtos/itens consumidos no evento
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitCost: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  // Pessoas que trabalharão no evento
  staff: [{
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      required: true,
      trim: true
    },
    payment: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  // Despesas adicionais
  expenses: [{
    description: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      enum: ['transporte', 'equipamento', 'decoracao', 'outros'],
      default: 'outros'
    }
  }],
  // Valores financeiros
  revenue: {
    type: Number,
    required: true,
    min: 0
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para calcular custo total dos itens
eventSchema.virtual('totalItemsCost').get(function() {
  if (!this.items || this.items.length === 0) return 0;
  return this.items.reduce((total, item) => {
    const quantity = Number(item.quantity) || 0;
    const unitCost = Number(item.unitCost) || 0;
    return total + (quantity * unitCost);
  }, 0);
});

// Virtual para calcular custo total da equipe
eventSchema.virtual('totalStaffCost').get(function() {
  if (!this.staff || this.staff.length === 0) return 0;
  return this.staff.reduce((total, member) => {
    const payment = Number(member.payment) || 0;
    return total + payment;
  }, 0);
});

// Virtual para calcular total de despesas
eventSchema.virtual('totalExpenses').get(function() {
  if (!this.expenses || this.expenses.length === 0) return 0;
  return this.expenses.reduce((total, expense) => {
    const amount = Number(expense.amount) || 0;
    return total + amount;
  }, 0);
});

// Virtual para calcular custo total do evento
eventSchema.virtual('totalCost').get(function() {
  return this.totalItemsCost + this.totalStaffCost + this.totalExpenses;
});

// Virtual para calcular lucro
eventSchema.virtual('profit').get(function() {
  return this.revenue - this.totalCost;
});

// Virtual para calcular margem de lucro
eventSchema.virtual('profitMargin').get(function() {
  const revenue = Number(this.revenue) || 0;
  const profit = Number(this.profit) || 0;
  if (revenue === 0) return '0.00';
  return ((profit / revenue) * 100).toFixed(2);
});

// Middleware para log de eventos
eventSchema.pre('save', function(next) {
  if (this.isNew) {
    console.log('🎉 Novo evento criado:', this.title);
    console.log(`📅 Data: ${this.startDate.toLocaleDateString()} - ${this.endDate.toLocaleDateString()}`);
    console.log(`📍 Local: ${this.location}`);
    console.log(`💰 Receita: R$ ${this.revenue.toFixed(2)}`);
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);