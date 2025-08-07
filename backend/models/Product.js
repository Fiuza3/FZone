const mongoose = require('mongoose');

// Schema para produtos do estoque
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  category: {
    type: String,
    required: true,
    enum: ['eletrônicos', 'roupas', 'casa', 'esporte', 'livros', 'automotivo', 'outros']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minStock: {
    type: Number,
    default: 5,
    min: 0
  },
  supplier: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
}, {
  timestamps: true
});

// Virtual para calcular margem de lucro
productSchema.virtual('profitMargin').get(function() {
  console.log('💰 Calculando margem de lucro para produto:', this.name);
  if (this.cost === 0) return 0;
  const margin = ((this.price - this.cost) / this.cost) * 100;
  console.log(`📊 Margem calculada: ${margin.toFixed(2)}%`);
  return parseFloat(margin.toFixed(2));
});

// Virtual para verificar se está em baixo estoque
productSchema.virtual('isLowStock').get(function() {
  const lowStock = this.quantity <= this.minStock;
  if (lowStock) {
    console.log('⚠️ ALERTA: Produto em baixo estoque:', this.name, `(${this.quantity} unidades)`);
  }
  return lowStock;
});

// Middleware para log de alterações no estoque
productSchema.pre('save', function(next) {
  if (this.isModified('quantity')) {
    console.log('📦 Alteração no estoque detectada:');
    console.log(`   Produto: ${this.name}`);
    console.log(`   Quantidade anterior: ${this.get('quantity', null, { getters: false })}`);
    console.log(`   Nova quantidade: ${this.quantity}`);
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);