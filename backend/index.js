const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');
const errorHandler = require('./middlewares/errorHandler');
const corsMiddleware = require('./middlewares/corsMiddleware');

// Importa modelos para registrá-los
require('./models/User');
require('./models/Company');
require('./models/Invitation');
require('./models/Task');
require('./models/Product');
require('./models/Transaction');
require('./models/Employee');
require('./models/Event');

// Rotas
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const stockRoutes = require('./routes/stockRoutes');
const financeRoutes = require('./routes/financeRoutes');
const hrRoutes = require('./routes/hrRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const eventRoutes = require('./routes/eventRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const companyRoutes = require('./routes/companyRoutes');
const calendarRoutes = require('./routes/calendarRoutes');

// Carrega variáveis de ambiente
dotenv.config();

// Verifica variáveis de ambiente críticas
console.log('🔍 Verificando variáveis de ambiente:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI existe:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET existe:', !!process.env.JWT_SECRET);

// Se não encontrar MONGODB_URI, usar valor padrão
if (!process.env.MONGODB_URI) {
  console.log('⚠️ MONGODB_URI não encontrada, usando valor padrão');
  process.env.MONGODB_URI = 'mongodb+srv://devfiuza:Demerval739%24@fzone.447xln8.mongodb.net/?retryWrites=true&w=majority&appName=FZone';
}

// Verifica se JWT_SECRET existe, senão define um valor padrão
if (!process.env.JWT_SECRET) {
  console.log('⚠️ JWT_SECRET não encontrada, usando valor padrão');
  process.env.JWT_SECRET = 'fzone_jwt_secret_key_2024';
}

// Mostra a string de conexão para debug (ocultando a senha)
const debugUri = process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//[USUARIO]:[SENHA]@');
console.log('🔍 String de conexão MongoDB:', debugUri);

// Verifica se a string de conexão tem o formato correto
if (process.env.MONGODB_URI.startsWith('MONGODB_URI=')) {
  console.log('⚠️ Formato incorreto detectado, corrigindo string de conexão');
  process.env.MONGODB_URI = process.env.MONGODB_URI.replace('MONGODB_URI=', '');
}

// Inicializa Express
const app = express();
const PORT = process.env.PORT || 3000;

// Conecta ao MongoDB
connectDB();

// Middlewares
app.use(cors({
  origin: ['https://f-zone-frontend-5fhm0l4jw-marcus-fiuzas-projects.vercel.app', 'https://f-zone.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(corsMiddleware); // Middleware CORS personalizado para garantir que os cabeçalhos sejam aplicados
app.use(express.json());

// Log de requisições
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/calendar', calendarRoutes);

// Rota de status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
});

// Middleware de erro
app.use(errorHandler);

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`
  🚀 Servidor ERP rodando em http://localhost:${PORT}
  📊 Ambiente: ${process.env.NODE_ENV}
  ⏱️  ${new Date().toLocaleString()}
  `);
});