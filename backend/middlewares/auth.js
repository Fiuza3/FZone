const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware para proteger rotas que requerem autenticação
 */
const protect = async (req, res, next) => {
  try {
    // Verifica se o token está presente no header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Acesso não autorizado' });
    }
    
    // Extrai o token do header
    const token = authHeader.split(' ')[1];
    
    // Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Busca o usuário pelo ID e exclui a senha do resultado
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }
    
    // Verifica se o usuário está ativo
    if (!user.isActive) {
      return res.status(401).json({ message: 'Usuário desativado' });
    }
    
    // Adiciona o usuário ao objeto de requisição
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    res.status(500).json({ message: 'Erro de autenticação', error: error.message });
  }
};

/**
 * Middleware para verificar permissões de acesso baseadas em função
 * @param {Array} roles - Array de funções permitidas
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Acesso não autorizado' });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acesso proibido' });
    }
    
    next();
  };
};

module.exports = { protect, authorize };