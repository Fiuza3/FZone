const Company = require('../models/Company');

// ============================================================================
// OBTER CONFIGURAÇÕES DA EMPRESA (Linhas 5-25)
// ============================================================================
/**
 * Retorna dados completos da empresa do usuário logado
 */
const getCompanySettings = async (req, res) => {
  try {
    const company = await Company.findById(req.user.company);
    
    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    
    res.json(company);
  } catch (error) {
    console.error('❌ Erro ao buscar configurações:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// ATUALIZAR CONFIGURAÇÕES DA EMPRESA (Linhas 27-55)
// ============================================================================
/**
 * Atualiza dados da empresa (apenas owner/admin)
 */
const updateCompanySettings = async (req, res) => {
  try {
    // Verifica se usuário tem permissão
    if (req.user.role !== 'owner' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Apenas proprietários e administradores podem alterar configurações da empresa' 
      });
    }
    
    const company = await Company.findByIdAndUpdate(
      req.user.company,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    
    console.log('✅ Configurações da empresa atualizadas:', company.name);
    
    res.json({
      message: 'Configurações atualizadas com sucesso',
      company
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar configurações:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCompanySettings,
  updateCompanySettings
};