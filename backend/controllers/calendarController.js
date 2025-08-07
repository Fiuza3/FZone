const BlockedDate = require('../models/BlockedDate');
const Event = require('../models/Event');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// ============================================================================
// OBTER BLOQUEIOS DE DATAS (Linhas 8-25)
// ============================================================================
/**
 * Retorna todos os bloqueios de datas da empresa
 */
const getBlockedDates = async (req, res) => {
  try {
    const blockedDates = await BlockedDate.find({ company: req.user.company })
      .sort({ startDate: 1 });
    
    res.json(blockedDates);
  } catch (error) {
    console.error('❌ Erro ao buscar bloqueios de datas:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// CRIAR BLOQUEIO DE DATA (Linhas 27-55)
// ============================================================================
/**
 * Cria um novo bloqueio de data
 */
const createBlockedDate = async (req, res) => {
  try {
    const { title, startDate, endDate, type, description } = req.body;
    
    // Verifica se já existem eventos no período
    const existingEvents = await Event.find({
      company: req.user.company,
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
        { startDate: { $lte: endDate }, endDate: { $exists: false }, startDate: { $gte: startDate } }
      ]
    });
    
    if (existingEvents.length > 0) {
      return res.status(400).json({ 
        error: 'Existem eventos agendados neste período',
        events: existingEvents.map(e => ({ id: e._id, title: e.title, date: e.startDate }))
      });
    }
    
    const blockedDate = new BlockedDate({
      title,
      startDate,
      endDate,
      type,
      description,
      createdBy: req.user._id,
      company: req.user.company
    });
    
    await blockedDate.save();
    res.status(201).json(blockedDate);
  } catch (error) {
    console.error('❌ Erro ao criar bloqueio de data:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// REMOVER BLOQUEIO DE DATA (Linhas 57-75)
// ============================================================================
/**
 * Remove um bloqueio de data
 */
const removeBlockedDate = async (req, res) => {
  try {
    const blockedDate = await BlockedDate.findOneAndDelete({
      _id: req.params.id,
      company: req.user.company
    });
    
    if (!blockedDate) {
      return res.status(404).json({ error: 'Bloqueio de data não encontrado' });
    }
    
    res.json({ message: 'Bloqueio de data removido com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao remover bloqueio de data:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// EXPORTAR CALENDÁRIO PARA PDF (Linhas 77-150)
// ============================================================================
/**
 * Exporta o calendário para PDF
 */
const exportCalendarToPDF = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // Usa o mês e ano atuais se não especificados
    const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    
    // Busca eventos do mês
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);
    
    const [events, blockedDates] = await Promise.all([
      Event.find({
        company: req.user.company,
        $or: [
          { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
          { startDate: { $lte: endDate }, endDate: { $exists: false }, startDate: { $gte: startDate } }
        ]
      }).sort({ startDate: 1 }),
      
      BlockedDate.find({
        company: req.user.company,
        $or: [
          { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
        ]
      }).sort({ startDate: 1 })
    ]);
    
    // Cria o PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Define o cabeçalho
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    doc.fontSize(20).text(`Calendário de Eventos - ${months[targetMonth]} ${targetYear}`, { align: 'center' });
    doc.moveDown();
    
    // Adiciona informações da empresa
    doc.fontSize(12).text(`Empresa: ${req.user.company.name || 'Sua Empresa'}`, { align: 'center' });
    doc.moveDown(2);
    
    // Adiciona eventos
    doc.fontSize(16).text('Eventos Agendados', { underline: true });
    doc.moveDown();
    
    if (events.length === 0) {
      doc.fontSize(12).text('Nenhum evento agendado para este mês.');
    } else {
      events.forEach((event, index) => {
        const startDate = new Date(event.startDate).toLocaleDateString('pt-BR');
        const endDate = event.endDate ? new Date(event.endDate).toLocaleDateString('pt-BR') : startDate;
        
        doc.fontSize(14).text(`${index + 1}. ${event.title}`);
        doc.fontSize(12).text(`Data: ${startDate}${startDate !== endDate ? ` até ${endDate}` : ''}`);
        doc.fontSize(12).text(`Local: ${event.location || 'Não especificado'}`);
        doc.fontSize(12).text(`Status: ${event.status}`);
        
        if (event.description) {
          doc.fontSize(12).text(`Descrição: ${event.description}`);
        }
        
        doc.moveDown();
      });
    }
    
    // Adiciona bloqueios
    doc.moveDown();
    doc.fontSize(16).text('Períodos Bloqueados', { underline: true });
    doc.moveDown();
    
    if (blockedDates.length === 0) {
      doc.fontSize(12).text('Nenhum período bloqueado para este mês.');
    } else {
      blockedDates.forEach((block, index) => {
        const startDate = new Date(block.startDate).toLocaleDateString('pt-BR');
        const endDate = new Date(block.endDate).toLocaleDateString('pt-BR');
        
        doc.fontSize(14).text(`${index + 1}. ${block.title}`);
        doc.fontSize(12).text(`Período: ${startDate} até ${endDate}`);
        doc.fontSize(12).text(`Tipo: ${block.type}`);
        
        if (block.description) {
          doc.fontSize(12).text(`Motivo: ${block.description}`);
        }
        
        doc.moveDown();
      });
    }
    
    // Adiciona rodapé
    doc.fontSize(10).text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, { align: 'center' });
    
    // Finaliza o PDF
    doc.end();
    
    // Configura o cabeçalho da resposta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=calendario-${months[targetMonth]}-${targetYear}.pdf`);
    
    // Envia o PDF como stream
    doc.pipe(res);
    
  } catch (error) {
    console.error('❌ Erro ao exportar calendário:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getBlockedDates,
  createBlockedDate,
  removeBlockedDate,
  exportCalendarToPDF
};