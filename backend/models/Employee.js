const mongoose = require('mongoose');

// Schema para funcionários (RH)
const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    enum: ['financeiro', 'estoque', 'vendas', 'marketing', 'rh', 'ti']
  },
  salary: {
    type: Number,
    required: true,
    min: 0
  },
  hireDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['ativo', 'inativo', 'ferias', 'licenca'],
    default: 'ativo'
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  documents: {
    cpf: {
      type: String,
      required: true,
      unique: true
    },
    rg: String
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  }
}, {
  timestamps: true
});

// Virtual para calcular tempo de empresa
employeeSchema.virtual('yearsOfService').get(function() {
  console.log('📅 Calculando tempo de serviço para:', this.name);
  const now = new Date();
  const hireDate = new Date(this.hireDate);
  const years = (now - hireDate) / (1000 * 60 * 60 * 24 * 365.25);
  const yearsRounded = Math.floor(years * 10) / 10; // Uma casa decimal
  console.log(`⏰ Tempo de serviço: ${yearsRounded} anos`);
  return yearsRounded;
});

// Middleware para log de alterações salariais
employeeSchema.pre('save', function(next) {
  if (this.isModified('salary')) {
    console.log('💰 Alteração salarial detectada:');
    console.log(`   Funcionário: ${this.name}`);
    console.log(`   Novo salário: R$ ${this.salary.toFixed(2)}`);
    console.log(`   Cargo: ${this.position}`);
  }
  
  if (this.isModified('status')) {
    console.log('📋 Mudança de status do funcionário:');
    console.log(`   Funcionário: ${this.name}`);
    console.log(`   Novo status: ${this.status}`);
  }
  
  next();
});

// Método estático para relatório de folha de pagamento
employeeSchema.statics.getPayrollReport = async function() {
  console.log('📊 Gerando relatório de folha de pagamento...');
  
  const pipeline = [
    {
      $match: { status: 'ativo' }
    },
    {
      $group: {
        _id: '$department',
        totalEmployees: { $sum: 1 },
        totalSalary: { $sum: '$salary' },
        avgSalary: { $avg: '$salary' }
      }
    },
    {
      $sort: { totalSalary: -1 }
    }
  ];

  const report = await this.aggregate(pipeline);
  console.log('💼 Relatório de folha por departamento:', report);
  
  return report;
};

module.exports = mongoose.model('Employee', employeeSchema);