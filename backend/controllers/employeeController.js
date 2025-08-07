const User = require('../models/User');
const Invitation = require('../models/Invitation');
const crypto = require('crypto');

// Convidar funcionário (apenas owner/admin)
const inviteEmployee = async (req, res) => {
  try {
    const { email, role, department } = req.body;
    
    // Verifica se usuário tem permissão (owner ou admin)
    if (req.user.role !== 'owner' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas proprietários e administradores podem convidar funcionários' });
    }
    
    // Verifica se usuário tem empresa associada
    if (!req.user.company) {
      return res.status(400).json({ error: 'Usuário não possui empresa associada. Crie uma empresa primeiro.' });
    }
    
    // Verifica se email já está cadastrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Este email já possui uma conta' });
    }
    
    // Verifica se já existe convite pendente
    const existingInvitation = await Invitation.findOne({ 
      email, 
      company: req.user.company, 
      status: 'pending' 
    });
    if (existingInvitation) {
      return res.status(400).json({ error: 'Já existe um convite pendente para este email' });
    }
    
    // Define permissões baseadas no departamento
    const permissions = {
      tasks: true,
      stock: role === 'admin' || department === 'estoque',
      finance: role === 'admin' || department === 'financeiro' || department === 'vendas',
      hr: role === 'admin' || department === 'rh'
    };
    
    // Gera token único para o convite
    const token = crypto.randomBytes(32).toString('hex');
    
    const invitation = new Invitation({
      email,
      company: req.user.company,
      invitedBy: req.user._id,
      role: role || 'employee',
      department,
      permissions,
      token
    });
    
    await invitation.save();
    
    console.log(`📧 Convite enviado para ${email} - Departamento: ${department}`);
    
    res.status(201).json({
      message: 'Convite enviado com sucesso',
      invitation: {
        email: invitation.email,
        role: invitation.role,
        department: invitation.department,
        permissions: invitation.permissions,
        inviteLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invite/${token}`
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao enviar convite:', error);
    res.status(500).json({ error: error.message });
  }
};

// Aceitar convite
const acceptInvite = async (req, res) => {
  try {
    const { token, name, password } = req.body;
    
    // Busca convite válido
    const invitation = await Invitation.findOne({
      token,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('company');
    
    if (!invitation) {
      return res.status(400).json({ error: 'Convite inválido ou expirado' });
    }
    
    // Verifica se email já foi cadastrado
    const existingUser = await User.findOne({ email: invitation.email });
    if (existingUser) {
      return res.status(400).json({ error: 'Este email já possui uma conta' });
    }
    
    // Cria o usuário
    const user = new User({
      name,
      email: invitation.email,
      password,
      role: invitation.role,
      department: invitation.department,
      company: invitation.company._id,
      permissions: invitation.permissions
    });
    
    await user.save();
    
    // Marca convite como aceito
    invitation.status = 'accepted';
    await invitation.save();
    
    console.log(`✅ Funcionário ${name} aceitou convite - Empresa: ${invitation.company.name}`);
    
    res.status(201).json({
      message: 'Conta criada com sucesso',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        company: user.company,
        permissions: user.permissions
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao aceitar convite:', error);
    res.status(500).json({ error: error.message });
  }
};

// Listar funcionários da empresa
const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ 
      company: req.user.company 
    }).select('-password').populate('company', 'name');
    
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Listar convites pendentes
const getPendingInvites = async (req, res) => {
  try {
    const invites = await Invitation.find({
      company: req.user.company,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('invitedBy', 'name');
    
    res.json(invites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  inviteEmployee,
  acceptInvite,
  getEmployees,
  getPendingInvites
};