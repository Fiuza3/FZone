const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema para usuários do sistema ERP
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'manager', 'employee'],
    default: 'employee'
  },
  department: {
    type: String,
    enum: ['financeiro', 'estoque', 'rh', 'ti', 'vendas', 'marketing', 'juridico', 'geral'],
    default: 'geral'
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  permissions: {
    tasks: { type: Boolean, default: true },
    stock: { type: Boolean, default: false },
    finance: { type: Boolean, default: false },
    hr: { type: Boolean, default: false }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

// Middleware para hash da senha antes de salvar
userSchema.pre('save', async function(next) {
  console.log('🔐 Middleware: Processando senha do usuário antes de salvar');
  
  // Só faz hash se a senha foi modificada
  if (!this.isModified('password')) {
    console.log('📝 Senha não foi modificada, pulando hash');
    return next();
  }
  
  try {
    // Gera hash da senha com salt 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('✅ Hash da senha gerado com sucesso');
    next();
  } catch (error) {
    console.error('❌ Erro ao gerar hash da senha:', error);
    next(error);
  }
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function(candidatePassword) {
  console.log('🔍 Comparando senha fornecida com hash armazenado');
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('🎯 Resultado da comparação:', isMatch ? 'Senha correta' : 'Senha incorreta');
    return isMatch;
  } catch (error) {
    console.error('❌ Erro ao comparar senhas:', error);
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);