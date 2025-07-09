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

// Método estático para calcular balanço
transactionSchema.statics.calculateBalance = async function(startDate, endDate) {
  console.log('📊 Calculando balanço financeiro...');
  
  const pipeline = [
    {
      $match: {
        date: {
          $gte: startDate || new Date('1900-01-01'),
          $lte: endDate || new Date()
        },
        status: 'pago'
      }
    },
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