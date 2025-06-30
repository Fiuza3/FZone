const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Registra um novo usuário
 * @route POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    
    // Verifica se o usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }
    
    // Cria o novo usuário
    const user = new User({
      name,
      email,
      password,
      role,
      department
    });
    
    await user.save();
    
    // Gera token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar usuário', error: error.message });
  }
};

/**
 * Autentica um usuário
 * @route POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Busca o usuário pelo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    // Verifica se o usuário está ativo
    if (!user.isActive) {
      return res.status(401).json({ message: 'Usuário desativado' });
    }
    
    // Verifica a senha
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    // Gera token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao fazer login', error: error.message });
  }
};

/**
 * Obtém o perfil do usuário autenticado
 * @route GET /api/auth/profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao obter perfil', error: error.message });
  }
};