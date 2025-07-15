const mongoose = require('mongoose');

// Função para conectar ao MongoDB
const connectDB = async () => {
  try {
    console.log('🔄 Conectando ao MongoDB...');
    
    // String de conexão segura via variável de ambiente ou fallback para string direta
    let MONGODB_URI = process.env.MONGODB_URI || 
      'mongodb+srv://devfiuza:Demerval739%24@fzone.447xln8.mongodb.net/?retryWrites=true&w=majority&appName=FZone';
    
    // Corrige o formato se necessário
    if (MONGODB_URI.startsWith('MONGODB_URI=')) {
      MONGODB_URI = MONGODB_URI.replace('MONGODB_URI=', '');
    }
    
    console.log('🔍 Verificando string de conexão:', MONGODB_URI ? 'String encontrada' : 'String vazia');
    console.log('🔍 Primeiros caracteres:', MONGODB_URI.substring(0, 20) + '...');
    
    const conn = await mongoose.connect(MONGODB_URI, {
      // As opções abaixo não são mais necessárias no Mongoose 6+
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // useCreateIndex: true,
      // useFindAndModify: false
    });
    
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    
    // Registra eventos de conexão
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erro na conexão MongoDB:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB desconectado');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconectado');
    });
    
    return conn;
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;