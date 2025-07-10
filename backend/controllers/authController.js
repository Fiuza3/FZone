const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============================================================================
// GERAÇÃO DE TOKEN JWT (Linhas 6-13)
// ============================================================================
/**
 * Gera um token JWT para autenticação do usuário
 * @param {string} userId - ID do usuário no banco de dados
 * @returns {string} Token JWT válido por 24 horas
 */
const generateToken = (userId) => {
  console.log('🎫 Gerando token JWT para usuário:', userId);
  
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

// ============================================================================
// REGISTRO DE NOVO USUÁRIO (Linhas 87-147)
// ============================================================================
/**
 * Registra um novo usuário no sistema
 * Valida dados, define permissões e cria conta
 * @param {Object} req - Request com dados do usuário
 * @param {Object} res - Response com token e dados do usuário criado
 */
const register = async (req, res) => {
  console.log('📝 Tentativa de registro de novo usuário');
  
  try {
    // Extrai dados do usuário (Linha 100)
    const { name, email, password, role, department, company } = req.body;
    console.log('📋 Dados recebidos:', { name, email, role, department });
    
    // Verifica se email já está em uso (Linhas 103-110)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ Email já cadastrado:', email);
      return res.status(400).json({ 
        error: 'Email já está em uso',
        code: 'EMAIL_EXISTS'
      });
    }

    // Cria novo usuário com permissões baseadas no departamento (Linhas 112-125)
    const user = new User({
      name,
      email,
      password,
      role: role || 'employee',
      department: department || 'geral',
      company: company,
      permissions: {
        tasks: true, // Todos têm acesso a tarefas
        stock: role === 'owner' || role === 'admin' || department === 'estoque',
        finance: role === 'owner' || role === 'admin' || department === 'financeiro' || department === 'vendas',
        hr: role === 'owner' || role === 'admin' || department === 'rh'
      }
    });

    // Salva usuário no banco de dados (Linhas 127-129)
    await user.save();
    console.log('✅ Usuário criado com sucesso:', user.name);

    // Gera token para login automático (Linha 131)
    const token = generateToken(user._id);

    // Retorna dados do usuário criado (Linhas 133-146)
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

// ============================================================================
// AUTENTICAÇÃO DE USUÁRIO (Linhas 21-85)
// ============================================================================
/**
 * Realiza login do usuário no sistema
 * Verifica credenciais, status da conta e gera token JWT
 * @param {Object} req - Request com email e password
 * @param {Object} res - Response com token e dados do usuário
 */
const login = async (req, res) => {
  console.log('🔑 Tentativa de login');
  
  try {
    // Extrai credenciais do corpo da requisição (Linha 34)
    const { email, password } = req.body;
    console.log('📧 Email fornecido:', email);
    
    // Busca usuário no banco de dados (Linhas 37-44)
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return res.status(401).json({ 
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verifica se a conta está ativa (Linhas 46-53)
    if (!user.isActive) {
      console.log('❌ Conta desativada');
      return res.status(401).json({ 
        error: 'Conta desativada',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // Valida senha fornecida (Linhas 55-62)
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Senha incorreta');
      return res.status(401).json({ 
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    console.log('✅ Login bem-sucedido para:', user.name);

    // Gera token JWT para sessão (Linha 66)
    const token = generateToken(user._id);

    // Retorna dados do usuário autenticado (Linhas 68-81)
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

// ============================================================================
// OBTENÇÃO DE PERFIL DO USUÁRIO (Linhas 149-181)
// ============================================================================
/**
 * Retorna dados completos do perfil do usuário logado
 * Inclui informações da empresa associada
 * @param {Object} req - Request com usuário autenticado
 * @param {Object} res - Response com dados do perfil
 */
const getProfile = async (req, res) => {
  console.log('👤 Solicitação de perfil do usuário:', req.user.name);
  
  try {
    // Busca usuário com dados da empresa (Linhas 162-165)
    const user = await User.findById(req.user._id)
      .populate('company', 'name email phone address')
      .select('-password'); // Exclui senha por segurança
    
    // Verifica se usuário existe (Linhas 167-169)
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Retorna dados completos do perfil (Linhas 171-180)
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        permissions: user.permissions,
        createdAt: user.createdAt,
        company: user.company // Dados da empresa populados
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