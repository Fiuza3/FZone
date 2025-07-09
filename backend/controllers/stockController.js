const Product = require('../models/Product');

// Listar todos os produtos
const getProducts = async (req, res) => {
  console.log('📦 Solicitação para listar produtos');
  
  try {
    const { category, lowStock } = req.query;
    let filter = { company: req.user.company, isActive: true };
    
    // Filtro por categoria
    if (category) {
      filter.category = category;
      console.log('🏷️ Filtrando por categoria:', category);
    }
    
    const products = await Product.find(filter).sort({ name: 1 });
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
    const products = await Product.find({ company: req.user.company, isActive: true });
    
    const report = {
      totalProducts: products.length,
      totalValue: 0,
      lowStockItems: [],
      categoryBreakdown: {},
      topValueProducts: []
    };
    
    products.forEach(product => {
      // Valor total do estoque
      const productValue = product.quantity * product.cost;
      report.totalValue += productValue;
      
      // Produtos em baixo estoque
      if (product.isLowStock) {
        report.lowStockItems.push({
          name: product.name,
          sku: product.sku,
          quantity: product.quantity,
          minStock: product.minStock
        });
      }
      
      // Breakdown por categoria
      if (!report.categoryBreakdown[product.category]) {
        report.categoryBreakdown[product.category] = {
          count: 0,
          totalValue: 0
        };
      }
      report.categoryBreakdown[product.category].count++;
      report.categoryBreakdown[product.category].totalValue += productValue;
    });
    
    // Top 5 produtos por valor
    report.topValueProducts = products
      .map(p => ({
        name: p.name,
        sku: p.sku,
        value: p.quantity * p.cost
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    
    console.log('📈 Relatório gerado:', {
      totalProducts: report.totalProducts,
      totalValue: report.totalValue.toFixed(2),
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

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  adjustStock,
  getStockReport
};