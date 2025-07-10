const Transaction = require('../models/Transaction');

// Listar transações
const getTransactions = async (req, res) => {
  console.log('💰 Solicitação para listar transações');
  
  try {
    const { type, category, startDate, endDate, status } = req.query;
    let filter = { company: req.user.company };
    
    // Aplicar filtros
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    console.log('🔍 Filtros aplicados:', filter);
    
    const transactions = await Transaction.find(filter)
      .populate('createdBy', 'name email')
      .sort({ date: -1 })
      .limit(100); // Limita a 100 registros
    
    console.log(`📋 ${transactions.length} transações encontradas`);
    
    res.json(transactions);
    
  } catch (error) {
    console.error('❌ Erro ao buscar transações:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar transações',
      details: error.message
    });
  }
};

// Criar nova transação
const createTransaction = async (req, res) => {
  console.log('➕ Criando nova transação');
  
  try {
    const transactionData = {
      ...req.body,
      createdBy: req.user._id,
      company: req.user.company
    };
    
    console.log('📝 Dados da transação:', transactionData);
    
    const transaction = new Transaction(transactionData);
    await transaction.save();
    
    // Popula o usuário para retorno
    await transaction.populate('createdBy', 'name email');
    
    console.log('✅ Transação criada:', transaction.description);
    
    res.status(201).json({
      message: 'Transação criada com sucesso',
      transaction
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar transação:', error);
    res.status(500).json({ 
      error: 'Erro ao criar transação',
      details: error.message
    });
  }
};

// Atualizar transação
const updateTransaction = async (req, res) => {
  console.log('✏️ Atualizando transação ID:', req.params.id);
  
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company },
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');
    
    if (!transaction) {
      console.log('❌ Transação não encontrada');
      return res.status(404).json({ 
        error: 'Transação não encontrada'
      });
    }
    
    console.log('✅ Transação atualizada:', transaction.description);
    
    res.json({
      message: 'Transação atualizada com sucesso',
      transaction
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar transação:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar transação',
      details: error.message
    });
  }
};

// Deletar transação
const deleteTransaction = async (req, res) => {
  console.log('🗑️ Deletando transação ID:', req.params.id);
  
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      company: req.user.company
    });
    
    if (!transaction) {
      return res.status(404).json({ 
        error: 'Transação não encontrada'
      });
    }
    
    console.log('✅ Transação deletada:', transaction.description);
    
    res.json({
      message: 'Transação deletada com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro ao deletar transação:', error);
    res.status(500).json({ 
      error: 'Erro ao deletar transação',
      details: error.message
    });
  }
};

// Obter balanço financeiro
const getBalance = async (req, res) => {
  console.log('📊 Calculando balanço financeiro');
  
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date('1900-01-01');
    const end = endDate ? new Date(endDate) : new Date();
    
    console.log('📅 Período:', start.toISOString(), 'até', end.toISOString());
    
    const balance = await Transaction.calculateBalance(start, end, req.user.company);
    
    res.json({
      period: {
        startDate: start,
        endDate: end
      },
      ...balance
    });
    
  } catch (error) {
    console.error('❌ Erro ao calcular balanço:', error);
    res.status(500).json({ 
      error: 'Erro ao calcular balanço',
      details: error.message
    });
  }
};

// Relatório financeiro detalhado
const getFinancialReport = async (req, res) => {
  console.log('📈 Gerando relatório financeiro detalhado');
  
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 dias atrás
    const end = endDate ? new Date(endDate) : new Date();
    
    // Balanço geral
    const balance = await Transaction.calculateBalance(start, end, req.user.company);
    
    // Transações por categoria
    const categoryReport = await Transaction.aggregate([
      {
        $match: {
          company: req.user.company,
          date: { $gte: start, $lte: end },
          status: 'pago'
        }
      },
      {
        $group: {
          _id: { type: '$type', category: '$category' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);
    
    // Transações por método de pagamento
    const paymentMethodReport = await Transaction.aggregate([
      {
        $match: {
          company: req.user.company,
          date: { $gte: start, $lte: end },
          status: 'pago'
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);
    
    console.log('📊 Relatório gerado com sucesso');
    
    res.json({
      period: { startDate: start, endDate: end },
      balance,
      categoryBreakdown: categoryReport,
      paymentMethodBreakdown: paymentMethodReport
    });
    
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
    res.status(500).json({ 
      error: 'Erro ao gerar relatório',
      details: error.message
    });
  }
};

// Obter projeção financeira
const getProjection = async (req, res) => {
  console.log('🔮 Calculando projeção financeira');
  
  try {
    const { months = 6 } = req.query;
    
    const projection = await Transaction.calculateProjection(req.user.company, parseInt(months));
    
    res.json(projection);
  } catch (error) {
    console.error('❌ Erro ao calcular projeção:', error);
    res.status(500).json({ 
      error: 'Erro ao calcular projeção',
      details: error.message
    });
  }
};

// Listar transações fixas
const getRecurringTransactions = async (req, res) => {
  console.log('🔁 Listando transações fixas');
  
  try {
    const transactions = await Transaction.find({
      company: req.user.company,
      isRecurring: true,
      status: { $ne: 'cancelado' }
    })
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });
    
    res.json(transactions);
  } catch (error) {
    console.error('❌ Erro ao listar transações fixas:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getBalance,
  getFinancialReport,
  getProjection,
  getRecurringTransactions
};