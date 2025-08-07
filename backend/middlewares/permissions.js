// Middleware para verificar permissões de módulo
const checkModulePermission = (module) => {
  return (req, res, next) => {
    const user = req.user;
    
    // Owner e admin têm acesso total
    if (user.role === 'owner' || user.role === 'admin') {
      console.log(`✅ Acesso liberado: ${user.role} tem acesso total ao módulo ${module}`);
      return next();
    }
    
    // Verifica permissão específica do módulo
    if (!user.permissions || !user.permissions[module]) {
      console.log(`❌ Acesso negado: Usuário ${user.name} sem permissão para ${module}`);
      return res.status(403).json({
        error: `Acesso negado ao módulo ${module}`,
        code: 'MODULE_ACCESS_DENIED'
      });
    }
    
    console.log(`✅ Acesso liberado: Usuário ${user.name} tem permissão para ${module}`);
    next();
  };
};

// Middleware para filtrar dados por empresa
const filterByCompany = (req, res, next) => {
  req.companyFilter = { company: req.user.company };
  next();
};

module.exports = {
  checkModulePermission,
  filterByCompany
};