const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Gerar token JWT
const generateToken = (userId) => {
  console.log('🎫 Gerando token JWT para usuário:', userId);
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

// Registrar novo usuário
const register = async (req, res) => {
  console.log('📝 Tentativa de registro de novo usuário');
  
  try {
    const { name, email, password, role, department, company } = req.body;
    
    console.log('📋 Dados recebidos:', { name, email, role, department });
    
    // Verifica se usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ Email já cadastrado:', email);
      return res.status(400).json({ 
        error: 'Email já está em uso',
        code: 'EMAIL_EXISTS'
      });
    }

    // Cria novo usuário
    const user = new User({
      name,
      email,
      password,
      role: role || 'employee',
      department: department || 'geral',
      company: company,
      permissions: {
        tasks: true,
        stock: role === 'owner' || role === 'admin' || department === 'estoque',
        finance: role === 'owner' || role === 'admin' || department === 'financeiro' || department === 'vendas',
        hr: role === 'owner' || role === 'admin' || department === 'rh'
      }
    });

    await user.save();
    console.log('✅ Usuário criado com sucesso:', user.name);

    // Gera token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      token,
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
    console.error('❌ Erro no registro:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
};

// Login do usuário
const login = async (req, res) => {
  console.log('🔑 Tentativa de login');
  
  try {
    const { email, password } = req.body;
    
    console.log('📧 Email fornecido:', email);
    
    // Busca usuário por email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return res.status(401).json({ 
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verifica se conta está ativa
    if (!user.isActive) {
      console.log('❌ Conta desativada');
      return res.status(401).json({ 
        error: 'Conta desativada',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // Verifica senha
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Senha incorreta');
      return res.status(401).json({ 
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    console.log('✅ Login bem-sucedido para:', user.name);

    // Gera token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
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
    console.error('❌ Erro no login:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
};

// Obter perfil do usuário logado
const getProfile = async (req, res) => {
  console.log('👤 Solicitação de perfil do usuário:', req.user.name);
  
  try {
    // Busca o usuário com dados da empresa
    const user = await User.findById(req.user._id)
      .populate('company', 'name email phone address')
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        permissions: user.permissions,
        createdAt: user.createdAt,
        company: user.company
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar perfil:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile
};