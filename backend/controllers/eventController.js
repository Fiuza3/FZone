const Event = require('../models/Event');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Listar eventos
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ company: req.user.company })
      .populate('items.product', 'name sku')
      .populate('staff.employee', 'name email')
      .populate('createdBy', 'name')
      .sort({ startDate: 1 });
    
    // Adiciona campos virtuais
    const eventsWithVirtuals = events.map(event => ({
      ...event.toObject(),
      totalItemsCost: event.totalItemsCost,
      totalStaffCost: event.totalStaffCost,
      totalExpenses: event.totalExpenses,
      totalCost: event.totalCost,
      profit: event.profit,
      profitMargin: event.profitMargin
    }));
    
    res.json(eventsWithVirtuals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Criar evento
const createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      company: req.user.company,
      createdBy: req.user._id
    };
    
    const event = new Event(eventData);
    await event.save();
    
    // Popula dados para retorno
    await event.populate([
      { path: 'items.product', select: 'name sku' },
      { path: 'staff.employee', select: 'name email' },
      { path: 'createdBy', select: 'name' }
    ]);
    
    // Adiciona campos virtuais
    const eventWithVirtuals = {
      ...event.toObject(),
      totalItemsCost: event.totalItemsCost,
      totalStaffCost: event.totalStaffCost,
      totalExpenses: event.totalExpenses,
      totalCost: event.totalCost,
      profit: event.profit,
      profitMargin: event.profitMargin
    };
    
    // Cria transações automáticas para despesas
    if (event.expenses && event.expenses.length > 0) {
      for (const expense of event.expenses) {
        await Transaction.create({
          type: 'despesa',
          category: 'outros',
          description: `${expense.description} - Evento: ${event.title}`,
          amount: expense.amount,
          date: new Date(),
          status: 'pago',
          reference: event._id.toString(),
          company: req.user.company,
          createdBy: req.user._id
        });
      }
    }
    
    // Cria transação de receita
    if (event.revenue > 0) {
      await Transaction.create({
        type: 'receita',
        category: 'vendas',
        description: `Receita do evento: ${event.title}`,
        amount: event.revenue,
        date: event.startDate,
        status: 'pago',
        reference: event._id.toString(),
        company: req.user.company,
        createdBy: req.user._id
      });
    }
    
    // Desconta itens do estoque se evento for confirmado
    if (event.status === 'confirmado' && event.items && event.items.length > 0) {
      const Product = require('../models/Product');
      
      for (const item of event.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.quantity = Math.max(0, product.quantity - item.quantity);
          await product.save();
          console.log(`📦 Estoque atualizado: ${product.name} - ${item.quantity} unidades descontadas`);
        }
      }
    }
    
    // Notificar todos os funcionários da empresa
    const employees = await User.find({ company: req.user.company });
    console.log(`📢 Notificando ${employees.length} funcionários sobre novo evento: ${event.title}`);
    
    res.status(201).json(eventWithVirtuals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Atualizar evento
const updateEvent = async (req, res) => {
  try {
    const oldEvent = await Event.findOne({ _id: req.params.id, company: req.user.company });
    if (!oldEvent) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company },
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'items.product', select: 'name sku' },
      { path: 'staff.employee', select: 'name email' },
      { path: 'createdBy', select: 'name' }
    ]);
    
    // Se status mudou para confirmado, desconta do estoque
    if (oldEvent.status !== 'confirmado' && event.status === 'confirmado' && event.items && event.items.length > 0) {
      const Product = require('../models/Product');
      
      for (const item of event.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.quantity = Math.max(0, product.quantity - item.quantity);
          await product.save();
          console.log(`📦 Estoque atualizado: ${product.name} - ${item.quantity} unidades descontadas`);
        }
      }
    }
    
    // Se status mudou de confirmado para cancelado, devolve ao estoque
    if (oldEvent.status === 'confirmado' && event.status === 'cancelado' && event.items && event.items.length > 0) {
      const Product = require('../models/Product');
      
      for (const item of event.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.quantity += item.quantity;
          await product.save();
          console.log(`🔄 Estoque devolvido: ${product.name} - ${item.quantity} unidades adicionadas`);
        }
      }
    }
    
    // Adiciona campos virtuais
    const eventWithVirtuals = {
      ...event.toObject(),
      totalItemsCost: event.totalItemsCost,
      totalStaffCost: event.totalStaffCost,
      totalExpenses: event.totalExpenses,
      totalCost: event.totalCost,
      profit: event.profit,
      profitMargin: event.profitMargin
    };
    
    res.json(eventWithVirtuals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Deletar evento
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      company: req.user.company
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    // Remove transações relacionadas
    await Transaction.deleteMany({
      reference: event._id.toString(),
      company: req.user.company
    });
    
    res.json({ message: 'Evento deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obter dados para formulário (produtos e funcionários)
const getFormData = async (req, res) => {
  try {
    const [products, employees] = await Promise.all([
      require('../models/Product').find({ company: req.user.company, isActive: true }).select('name sku cost'),
      require('../models/User').find({ company: req.user.company, isActive: true }).select('name email')
    ]);
    
    res.json({ products, employees });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obter relatório de eventos
const getEventsReport = async (req, res) => {
  try {
    const events = await Event.find({ company: req.user.company });
    
    const report = {
      totalEvents: events.length,
      totalRevenue: events.reduce((sum, event) => sum + event.revenue, 0),
      totalCost: events.reduce((sum, event) => sum + event.totalCost, 0),
      totalProfit: events.reduce((sum, event) => sum + event.profit, 0),
      eventsByStatus: events.reduce((acc, event) => {
        acc[event.status] = (acc[event.status] || 0) + 1;
        return acc;
      }, {}),
      upcomingEvents: events.filter(event => 
        event.startDate > new Date() && event.status !== 'cancelado'
      ).length
    };
    
    report.averageProfitMargin = report.totalRevenue > 0 
      ? ((report.totalProfit / report.totalRevenue) * 100).toFixed(2)
      : 0;
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsReport,
  getFormData
};