const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar autenticação JWT
const authenticateToken = async (req, res, next) => {
  console.log('🔐 Middleware de autenticação executado');
  
  try {
    // Pega o token do header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    console.log('🎫 Token recebido:', token ? 'Token presente' : 'Token ausente');
    
    if (!token) {
      console.log('❌ Acesso negado: Token não fornecido');
      return res.status(401).json({ 
        error: 'Token de acesso requerido',
        code: 'NO_TOKEN'
      });
    }

    // Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token válido para usuário ID:', decoded.userId);
    
    // Busca o usuário no banco
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('❌ Usuário não encontrado para o token');
      return res.status(401).json({ 
        error: 'Token inválido - usuário não existe',
        code: 'INVALID_USER'
      });
    }

    if (!user.isActive) {
      console.log('❌ Usuário inativo tentando acessar');
      return res.status(401).json({ 
        error: 'Conta desativada',
        code: 'INACTIVE_USER'
      });
    }

    // Adiciona o usuário ao request
    req.user = user;
    console.log('👤 Usuário autenticado:', user.name, `(${user.role})`);
    
    next();
  } catch (error) {
    console.error('❌ Erro na autenticação:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        code: 'EXPIRED_TOKEN'
      });
    }
    
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      code: 'SERVER_ERROR'
    });
  }
};

// Middleware para verificar permissões por role
const requireRole = (roles) => {
  return (req, res, next) => {
    console.log('🛡️ Verificando permissões de role...');
    console.log('   Roles permitidas:', roles);
    console.log('   Role do usuário:', req.user.role);
    
    if (!roles.includes(req.user.role)) {
      console.log('❌ Acesso negado: Role insuficiente');
      return res.status(403).json({ 
        error: 'Permissão insuficiente para esta operação',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: roles,
        current: req.user.role
      });
    }
    
    console.log('✅ Permissão concedida');
    next();
  };
};

// Middleware para verificar departamento
const requireDepartment = (departments) => {
  return (req, res, next) => {
    console.log('🏢 Verificando permissões de departamento...');
    console.log('   Departamentos permitidos:', departments);
    console.log('   Departamento do usuário:', req.user.department);
    
    if (!departments.includes(req.user.department) && req.user.role !== 'admin') {
      console.log('❌ Acesso negado: Departamento não autorizado');
      return res.status(403).json({ 
        error: 'Acesso restrito ao seu departamento',
        code: 'DEPARTMENT_RESTRICTED'
      });
    }
    
    console.log('✅ Acesso ao departamento autorizado');
    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requireDepartment
};