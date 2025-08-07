const mongoose = require('mongoose');

// Schema para transações financeiras
const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['receita', 'despesa']
  },
  category: {
    type: String,
    required: true,
    enum: ['vendas', 'compras', 'salarios', 'aluguel', 'marketing', 'manutencao', 'outros']
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  date: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['dinheiro', 'cartao', 'pix', 'transferencia', 'boleto'],
    default: 'dinheiro'
  },
  status: {
    type: String,
    enum: ['pendente', 'pago', 'cancelado'],
    default: 'pago'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringDay: {
    type: Number,
    min: 1,
    max: 31,
    default: 1
  },
  nextDueDate: {
    type: Date
  },
  reference: {
    type: String, // Pode referenciar uma venda, compra, etc.
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

// Middleware para log de transações
transactionSchema.pre('save', function(next) {
  console.log('💳 Nova transação sendo registrada:');
  console.log(`   Tipo: ${this.type.toUpperCase()}`);
  console.log(`   Categoria: ${this.category}`);
  console.log(`   Valor: R$ ${this.amount.toFixed(2)}`);
  console.log(`   Descrição: ${this.description}`);
  console.log(`   Status: ${this.status}`);
  next();
});

// Método estático para calcular projeção
transactionSchema.statics.calculateProjection = async function(companyId, months = 6) {
  const now = new Date();
  const endDate = new Date(now.getFullYear(), now.getMonth() + months, 0);
  
  // Busca transações fixas ativas
  const recurringTransactions = await this.find({
    company: companyId,
    isRecurring: true,
    status: { $ne: 'cancelado' }
  });
  
  let projection = [];
  let currentBalance = 0;
  
  // Calcula saldo atual
  const currentBalanceData = await this.calculateBalance(null, now, companyId);
  currentBalance = currentBalanceData.balance;
  
  // Projeta para os próximos meses
  for (let i = 0; i < months; i++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    
    recurringTransactions.forEach(transaction => {
      if (transaction.type === 'receita') {
        monthlyIncome += transaction.amount;
      } else {
        monthlyExpenses += transaction.amount;
      }
    });
    
    currentBalance += monthlyIncome - monthlyExpenses;
    
    projection.push({
      month: monthDate.toISOString().slice(0, 7),
      income: monthlyIncome,
      expenses: monthlyExpenses,
      balance: currentBalance
    });
  }
  
  return projection;
};

// Método estático para calcular balanço
transactionSchema.statics.calculateBalance = async function(startDate, endDate, companyId) {
  console.log('📊 Calculando balanço financeiro...');
  
  const matchFilter = {
    company: companyId,
    status: 'pago'
  };
  
  if (startDate || endDate) {
    matchFilter.date = {};
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      matchFilter.date.$gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchFilter.date.$lte = end;
    }
  }
  
  console.log('🔍 Filtro de busca:', JSON.stringify(matchFilter, null, 2));
  
  const pipeline = [
    { $match: matchFilter },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' }
      }
    }
  ];

  const results = await this.aggregate(pipeline);
  console.log('💰 Resultados da agregação:', results);

  let receitas = 0;
  let despesas = 0;

  results.forEach(result => {
    if (result._id === 'receita') receitas = result.total;
    if (result._id === 'despesa') despesas = result.total;
  });

  const balance = receitas - despesas;
  console.log(`📈 Receitas: R$ ${receitas.toFixed(2)}`);
  console.log(`📉 Despesas: R$ ${despesas.toFixed(2)}`);
  console.log(`💰 Saldo: R$ ${balance.toFixed(2)}`);

  return { receitas, despesas, balance };
};

module.exports = mongoose.model('Transaction', transactionSchema);