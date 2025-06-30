const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');

// Rotas
const authRoutes = require('./routes/authRoutes');

// Carrega variáveis de ambiente
dotenv.config();

// Inicializa Express
const app = express();
const PORT = process.env.PORT || 3000;

// Conecta ao MongoDB
connectDB().then(() => {
  console.log('📦 Banco de dados inicializado');
});

// Middlewares
app.use(cors());
app.use(express.json());

// Log de requisições
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// Rotas da API
app.use('/api/auth', authRoutes);

// Rota de status
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'online',
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`
  🚀 Servidor FZone ERP rodando em http://localhost:${PORT}
  📊 Ambiente: ${process.env.NODE_ENV}
  ⏱️  ${new Date().toLocaleString()}
  `);
});