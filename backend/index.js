const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');
const errorHandler = require('./middlewares/errorHandler');

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

// Inicializa Express
const app = express();
const PORT = process.env.PORT || 3000;

// Conecta ao MongoDB
connectDB();

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