// Script para testar a conexão com MongoDB
require('dotenv').config();
const mongoose = require('mongoose');

// Função para testar conexão
async function testConnection() {
  console.log('🔍 Testando conexão com MongoDB...');
  
  try {
    // String de conexão direta (sem variáveis de ambiente)
    const directUri = 'mongodb+srv://devfiuza:Demerval739%24@fzone.447xln8.mongodb.net/?retryWrites=true&w=majority&appName=FZone';
    
    console.log('🔄 Tentando conectar com string direta...');
    const conn = await mongoose.connect(directUri);
    console.log('✅ Conexão bem-sucedida!');
    console.log(`📊 Host: ${conn.connection.host}`);
    
    // Desconecta após teste
    await mongoose.disconnect();
    console.log('👋 Desconectado do MongoDB');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message);
    return false;
  }
}

// Executa o teste
testConnection()
  .then(success => {
    if (success) {
      console.log('✅ Teste concluído com sucesso');
      process.exit(0);
    } else {
      console.log('❌ Teste falhou');
      process.exit(1);
    }
  });