const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'employee'],
    default: 'employee'
  },
  department: {
    type: String,
    enum: ['financeiro', 'estoque', 'rh', 'ti', 'vendas', 'marketing', 'juridico', 'geral'],
    required: true
  },
  permissions: {
    tasks: { type: Boolean, default: true },
    stock: { type: Boolean, default: false },
    finance: { type: Boolean, default: false },
    hr: { type: Boolean, default: false }
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Invitation', invitationSchema);