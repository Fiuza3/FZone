// Script para popular o banco de dados MongoDB com dados iniciais
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Carrega variáveis de ambiente
dotenv.config();

// Modelos
const User = require('./backend/models/User');
const Company = require('./backend/models/Company');
const Event = require('./backend/models/Event');
const Task = require('./backend/models/Task');
const Product = require('./backend/models/Product');
const Transaction = require('./backend/models/Transaction');
const Employee = require('./backend/models/Employee');

// Dados iniciais
const seedData = {
  companies: [
    {
      _id: new mongoose.Types.ObjectId(),
      name: "Buffet Chocolate com Menta",
      address: "Rua das Flores, 123",
      phone: "(11) 3456-7890",
      email: "contato@chocolatecommenta.com",
      logo: "https://example.com/logo.png"
    }
  ],
  
  users: [
    {
      name: "Administrador",
      email: "admin@example.com",
      password: "admin123", // Será criptografada antes de salvar
      role: "admin",
      department: "admin",
      permissions: {
        events: true,
        tasks: true,
        stock: true,
        finance: true,
        hr: true,
        accounts: true
      }
    },
    {
      name: "Gerente",
      email: "manager@example.com",
      password: "manager123", // Será criptografada antes de salvar
      role: "manager",
      department: "events",
      permissions: {
        events: true,
        tasks: true,
        stock: true,
        finance: false,
        hr: false,
        accounts: false
      }
    }
  ],
  
  events: [
    {
      title: "Casamento Silva",
      date: "2025-08-15",
      status: "confirmed",
      client: "João Silva",
      phone: "(11) 98765-4321",
      guests: 150,
      price: 15000,
      expenses: 8000,
      profit: 7000,
      margin: 46.67,
      location: "Salão Primavera",
      notes: "Cliente VIP, atenção especial"
    },
    {
      title: "Aniversário 15 Anos",
      date: "2025-07-22",
      status: "pending",
      client: "Maria Oliveira",
      phone: "(11) 91234-5678",
      guests: 80,
      price: 8500,
      expenses: 4200,
      profit: 4300,
      margin: 50.59,
      location: "Espaço Jardim",
      notes: "Decoração tema jardim encantado"
    },
    {
      title: "Confraternização Empresa XYZ",
      date: "2025-12-18",
      status: "confirmed",
      client: "Empresa XYZ",
      phone: "(11) 3456-7890",
      guests: 200,
      price: 22000,
      expenses: 12000,
      profit: 10000,
      margin: 45.45,
      location: "Salão Empresarial",
      notes: "Evento corporativo, cardápio executivo"
    }
  ],
  
  products: [
    {
      name: "Farinha de Trigo",
      category: "Ingredientes",
      unit: "kg",
      quantity: 50,
      minQuantity: 10,
      price: 4.5
    },
    {
      name: "Açúcar",
      category: "Ingredientes",
      unit: "kg",
      quantity: 30,
      minQuantity: 5,
      price: 3.8
    },
    {
      name: "Chocolate em Pó",
      category: "Ingredientes",
      unit: "kg",
      quantity: 15,
      minQuantity: 3,
      price: 12.5
    },
    {
      name: "Taças de Cristal",
      category: "Utensílios",
      unit: "un",
      quantity: 200,
      minQuantity: 50,
      price: 15.0
    }
  ],
  
  employees: [
    {
      name: "Carlos Souza",
      role: "Chef",
      department: "Cozinha",
      salary: 4500,
      hireDate: "2023-01-15",
      phone: "(11) 98888-7777",
      email: "carlos@example.com"
    },
    {
      name: "Ana Lima",
      role: "Garçonete",
      department: "Atendimento",
      salary: 2200,
      hireDate: "2023-03-10",
      phone: "(11) 97777-6666",
      email: "ana@example.com"
    },
    {
      name: "Roberto Alves",
      role: "Gerente",
      department: "Administração",
      salary: 5500,
      hireDate: "2022-11-05",
      phone: "(11) 96666-5555",
      email: "roberto@example.com"
    }
  ]
};

// Função para conectar ao MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`MongoDB conectado: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Erro ao conectar ao MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Função para limpar o banco de dados
const clearDatabase = async () => {
  console.log('Limpando banco de dados...');
  await User.deleteMany({});
  await Company.deleteMany({});
  await Event.deleteMany({});
  await Task.deleteMany({});
  await Product.deleteMany({});
  await Transaction.deleteMany({});
  await Employee.deleteMany({});
  console.log('Banco de dados limpo com sucesso!');
};

// Função para popular o banco de dados
const seedDatabase = async () => {
  try {
    // Conecta ao banco de dados
    await connectDB();
    
    // Limpa o banco de dados
    await clearDatabase();
    
    // Cria a empresa
    const company = await Company.create(seedData.companies[0]);
    console.log(`Empresa criada: ${company.name}`);
    
    // Cria os usuários
    for (const userData of seedData.users) {
      // Criptografa a senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Cria o usuário
      const user = await User.create({
        ...userData,
        password: hashedPassword,
        company: company._id
      });
      
      console.log(`Usuário criado: ${user.name} (${user.email})`);
      
      // Define o primeiro usuário como dono da empresa
      if (userData.role === 'admin') {
        company.owner = user._id;
        await company.save();
      }
    }
    
    // Cria os eventos
    for (const eventData of seedData.events) {
      const event = await Event.create({
        ...eventData,
        company: company._id
      });
      console.log(`Evento criado: ${event.title}`);
    }
    
    // Busca os eventos criados para referência
    const events = await Event.find();
    
    // Cria as tarefas
    const tasks = [
      {
        title: "Confirmar fornecedores",
        description: "Entrar em contato com todos os fornecedores para confirmar presença",
        status: "pending",
        priority: "high",
        dueDate: "2025-07-10",
        event: events[0]._id,
        company: company._id
      },
      {
        title: "Comprar ingredientes",
        description: "Comprar ingredientes para o menu do evento",
        status: "completed",
        priority: "medium",
        dueDate: "2025-07-08",
        event: events[0]._id,
        company: company._id
      },
      {
        title: "Preparar decoração",
        description: "Montar e testar a decoração do evento",
        status: "pending",
        priority: "medium",
        dueDate: "2025-07-14",
        event: events[0]._id,
        company: company._id
      }
    ];
    
    for (const taskData of tasks) {
      const task = await Task.create(taskData);
      console.log(`Tarefa criada: ${task.title}`);
    }
    
    // Cria os produtos
    for (const productData of seedData.products) {
      const product = await Product.create({
        ...productData,
        company: company._id
      });
      console.log(`Produto criado: ${product.name}`);
    }
    
    // Cria as transações
    const transactions = [
      {
        date: "2025-07-01",
        description: "Pagamento Evento Casamento Silva",
        type: "income",
        amount: 15000,
        category: "Eventos",
        status: "completed",
        event: events[0]._id,
        company: company._id
      },
      {
        date: "2025-07-03",
        description: "Compra de ingredientes",
        type: "expense",
        amount: 2500,
        category: "Insumos",
        status: "completed",
        event: events[0]._id,
        company: company._id
      },
      {
        date: "2025-07-05",
        description: "Pagamento fornecedor decoração",
        type: "expense",
        amount: 3000,
        category: "Fornecedores",
        status: "pending",
        event: events[0]._id,
        company: company._id
      }
    ];
    
    for (const transactionData of transactions) {
      const transaction = await Transaction.create(transactionData);
      console.log(`Transação criada: ${transaction.description}`);
    }
    
    // Cria os funcionários
    for (const employeeData of seedData.employees) {
      const employee = await Employee.create({
        ...employeeData,
        company: company._id
      });
      console.log(`Funcionário criado: ${employee.name}`);
    }
    
    console.log('✅ Banco de dados populado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Erro ao popular banco de dados: ${error.message}`);
    process.exit(1);
  }
};

// Executa a função de seed
seedDatabase();