const Product = require('../models/Product');

// Listar todos os produtos
const getProducts = async (req, res) => {
  console.log('📦 Solicitação para listar produtos');
  
  try {
    const { category, lowStock, sortBy = 'name', sortOrder = 'asc', search } = req.query;
    let filter = { company: req.user.company, isActive: true };
    
    // Filtro por categoria
    if (category) {
      filter.category = category;
      console.log('🏷️ Filtrando por categoria:', category);
    }
    
    // Filtro por busca (nome ou SKU)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
      console.log('🔍 Buscando por:', search);
    }
    
    // Configura ordenação
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const products = await Product.find(filter).sort(sortOptions);
    console.log(`📋 ${products.length} produtos encontrados`);
    
    // Filtro por baixo estoque (aplicado após busca para usar virtual)
    let filteredProducts = products;
    if (lowStock === 'true') {
      filteredProducts = products.filter(product => product.isLowStock);
      console.log(`⚠️ ${filteredProducts.length} produtos em baixo estoque`);
    }
    
    // Adiciona campos virtuais ao response
    const productsWithVirtuals = filteredProducts.map(product => ({
      ...product.toObject(),
      profitMargin: product.profitMargin,
      isLowStock: product.isLowStock
    }));
    
    res.json(productsWithVirtuals);
    
  } catch (error) {
    console.error('❌ Erro ao buscar produtos:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar produtos',
      details: error.message
    });
  }
};

// Criar novo produto
const createProduct = async (req, res) => {
  console.log('➕ Criando novo produto');
  
  try {
    const productData = {
      ...req.body,
      company: req.user.company
    };
    console.log('📝 Dados do produto:', productData);
    
    const product = new Product(productData);
    await product.save();
    
    console.log('✅ Produto criado:', product.name);
    
    res.status(201).json({
      message: 'Produto criado com sucesso',
      product: {
        ...product.toObject(),
        profitMargin: product.profitMargin,
        isLowStock: product.isLowStock
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar produto:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'SKU já existe',
        code: 'DUPLICATE_SKU'
      });
    }
    
    res.status(500).json({ 
      error: 'Erro ao criar produto',
      details: error.message
    });
  }
};

// Atualizar produto
const updateProduct = async (req, res) => {
  console.log('✏️ Atualizando produto ID:', req.params.id);
  
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      console.log('❌ Produto não encontrado');
      return res.status(404).json({ 
        error: 'Produto não encontrado'
      });
    }
    
    console.log('✅ Produto atualizado:', product.name);
    
    res.json({
      message: 'Produto atualizado com sucesso',
      product: {
        ...product.toObject(),
        profitMargin: product.profitMargin,
        isLowStock: product.isLowStock
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar produto:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar produto',
      details: error.message
    });
  }
};

// Ajustar estoque
const adjustStock = async (req, res) => {
  console.log('📊 Ajustando estoque do produto ID:', req.params.id);
  
  try {
    const { quantity, operation } = req.body; // operation: 'add' ou 'subtract'
    
    console.log(`🔢 Operação: ${operation}, Quantidade: ${quantity}`);
    
    const product = await Product.findOne({ _id: req.params.id, company: req.user.company });
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    const oldQuantity = product.quantity;
    
    if (operation === 'add') {
      product.quantity += quantity;
    } else if (operation === 'subtract') {
      product.quantity = Math.max(0, product.quantity - quantity);
    } else {
      product.quantity = quantity; // Definir quantidade absoluta
    }
    
    await product.save();
    
    console.log(`📦 Estoque ajustado: ${oldQuantity} → ${product.quantity}`);
    
    res.json({
      message: 'Estoque ajustado com sucesso',
      product: {
        ...product.toObject(),
        profitMargin: product.profitMargin,
        isLowStock: product.isLowStock
      },
      adjustment: {
        oldQuantity,
        newQuantity: product.quantity,
        operation
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao ajustar estoque:', error);
    res.status(500).json({ 
      error: 'Erro ao ajustar estoque',
      details: error.message
    });
  }
};

// Relatório de estoque
const getStockReport = async (req, res) => {
  console.log('📊 Gerando relatório de estoque');
  
  try {
    const { period = '30' } = req.query;
    const products = await Product.find({ company: req.user.company, isActive: true });
    
    const report = {
      totalProducts: products.length,
      totalValue: 0,
      totalCost: 0,
      totalProfit: 0,
      lowStockItems: [],
      categoryBreakdown: {},
      topValueProducts: [],
      topProfitProducts: [],
      mostExpensive: [],
      cheapest: [],
      highestMargin: [],
      lowestMargin: []
    };
    
    products.forEach(product => {
      const productValue = product.quantity * product.price;
      const productCost = product.quantity * product.cost;
      const productProfit = productValue - productCost;
      const profitMargin = product.cost > 0 ? ((product.price - product.cost) / product.cost) * 100 : 0;
      
      report.totalValue += productValue;
      report.totalCost += productCost;
      report.totalProfit += productProfit;
      
      // Produtos em baixo estoque
      if (product.quantity <= product.minStock) {
        report.lowStockItems.push({
          name: product.name,
          sku: product.sku,
          category: product.category,
          quantity: product.quantity,
          minStock: product.minStock,
          status: 'critical'
        });
      }
      
      // Breakdown por categoria
      if (!report.categoryBreakdown[product.category]) {
        report.categoryBreakdown[product.category] = {
          count: 0,
          totalValue: 0,
          totalCost: 0,
          totalProfit: 0
        };
      }
      report.categoryBreakdown[product.category].count++;
      report.categoryBreakdown[product.category].totalValue += productValue;
      report.categoryBreakdown[product.category].totalCost += productCost;
      report.categoryBreakdown[product.category].totalProfit += productProfit;
    });
    
    // Top 5 produtos por valor em estoque
    report.topValueProducts = products
      .map(p => ({
        name: p.name,
        sku: p.sku,
        category: p.category,
        value: p.quantity * p.price,
        quantity: p.quantity
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    
    // Top 5 produtos por lucro
    report.topProfitProducts = products
      .map(p => ({
        name: p.name,
        sku: p.sku,
        category: p.category,
        profit: (p.quantity * p.price) - (p.quantity * p.cost),
        profitMargin: p.cost > 0 ? ((p.price - p.cost) / p.cost) * 100 : 0
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
    
    // 5 produtos mais caros
    report.mostExpensive = products
      .map(p => ({
        name: p.name,
        sku: p.sku,
        category: p.category,
        price: p.price,
        cost: p.cost
      }))
      .sort((a, b) => b.price - a.price)
      .slice(0, 5);
    
    // 5 produtos mais baratos
    report.cheapest = products
      .map(p => ({
        name: p.name,
        sku: p.sku,
        category: p.category,
        price: p.price,
        cost: p.cost
      }))
      .sort((a, b) => a.price - b.price)
      .slice(0, 5);
    
    // 5 produtos com maior margem
    report.highestMargin = products
      .filter(p => p.cost > 0)
      .map(p => ({
        name: p.name,
        sku: p.sku,
        category: p.category,
        price: p.price,
        cost: p.cost,
        profitMargin: ((p.price - p.cost) / p.cost) * 100
      }))
      .sort((a, b) => b.profitMargin - a.profitMargin)
      .slice(0, 5);
    
    // 5 produtos com menor margem
    report.lowestMargin = products
      .filter(p => p.cost > 0)
      .map(p => ({
        name: p.name,
        sku: p.sku,
        category: p.category,
        price: p.price,
        cost: p.cost,
        profitMargin: ((p.price - p.cost) / p.cost) * 100
      }))
      .sort((a, b) => a.profitMargin - b.profitMargin)
      .slice(0, 5);
    
    console.log('📈 Relatório gerado:', {
      totalProducts: report.totalProducts,
      totalValue: report.totalValue.toFixed(2),
      totalProfit: report.totalProfit.toFixed(2),
      lowStockCount: report.lowStockItems.length
    });
    
    res.json(report);
    
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
    res.status(500).json({ 
      error: 'Erro ao gerar relatório',
      details: error.message
    });
  }
};

// Busca produtos para autocomplete
const searchProducts = async (req, res) => {
  console.log('🔍 Busca para autocomplete');
  
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }
    
    const products = await Product.find({
      company: req.user.company,
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { sku: { $regex: q, $options: 'i' } }
      ]
    })
    .select('name sku quantity')
    .limit(10)
    .sort({ name: 1 });
    
    console.log(`🔍 ${products.length} produtos encontrados para "${q}"`);
    
    res.json(products);
  } catch (error) {
    console.error('❌ Erro na busca:', error);
    res.status(500).json({ error: error.message });
  }
};

// Excluir produto
const deleteProduct = async (req, res) => {
  console.log('🗑️ Excluindo produto ID:', req.params.id);
  
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      company: req.user.company
    });
    
    if (!product) {
      console.log('❌ Produto não encontrado');
      return res.status(404).json({ 
        error: 'Produto não encontrado'
      });
    }
    
    console.log('✅ Produto excluído:', product.name);
    
    res.json({
      message: 'Produto excluído com sucesso',
      product: {
        _id: product._id,
        name: product.name
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao excluir produto:', error);
    res.status(500).json({ 
      error: 'Erro ao excluir produto',
      details: error.message
    });
  }
};

// Exportar relatório
const exportReport = async (req, res) => {
  console.log('📤 Exportando relatório');
  
  try {
    const { format = 'csv', period = '30' } = req.query;
    const products = await Product.find({ company: req.user.company, isActive: true });
    
    if (format === 'csv') {
      const csvData = products.map(p => ({
        Nome: p.name,
        SKU: p.sku,
        Categoria: p.category,
        'Preço (R$)': p.price.toFixed(2).replace('.', ','),
        'Custo (R$)': p.cost.toFixed(2).replace('.', ','),
        Quantidade: p.quantity,
        'Valor Total (R$)': (p.quantity * p.price).toFixed(2).replace('.', ','),
        'Margem (%)': p.cost > 0 ? (((p.price - p.cost) / p.cost) * 100).toFixed(2) : '0,00'
      }));
      
      const headers = Object.keys(csvData[0]).join(';');
      const rows = csvData.map(row => Object.values(row).join(';')).join('\n');
      const csv = headers + '\n' + rows;
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="relatorio-estoque.csv"');
      return res.send('\uFEFF' + csv); // BOM para UTF-8
    }
    
    if (format === 'json') {
      const reportData = {
        geradoEm: new Date().toISOString(),
        periodo: period + ' dias',
        totalProdutos: products.length,
        produtos: products.map(p => ({
          nome: p.name,
          sku: p.sku,
          categoria: p.category,
          preco: p.price,
          custo: p.cost,
          quantidade: p.quantity,
          valorTotal: p.quantity * p.price,
          margemLucro: p.cost > 0 ? (((p.price - p.cost) / p.cost) * 100).toFixed(2) : 0
        }))
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="relatorio-estoque.json"');
      return res.json(reportData);
    }
    
    res.status(400).json({ error: 'Formato não suportado' });
    
  } catch (error) {
    console.error('❌ Erro ao exportar relatório:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getStockReport,
  exportReport,
  searchProducts
};