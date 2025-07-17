// Dados mockados para desenvolvimento

// Eventos
export const events = [
  {
    id: '1',
    title: 'Casamento Silva',
    date: '2025-08-15',
    status: 'confirmed',
    client: 'João Silva',
    phone: '(11) 98765-4321',
    guests: 150,
    price: 15000,
    expenses: 8000,
    profit: 7000,
    margin: 46.67,
    location: 'Salão Primavera',
    notes: 'Cliente VIP, atenção especial'
  },
  {
    id: '2',
    title: 'Aniversário 15 Anos',
    date: '2025-07-22',
    status: 'pending',
    client: 'Maria Oliveira',
    phone: '(11) 91234-5678',
    guests: 80,
    price: 8500,
    expenses: 4200,
    profit: 4300,
    margin: 50.59,
    location: 'Espaço Jardim',
    notes: 'Decoração tema jardim encantado'
  },
  {
    id: '3',
    title: 'Confraternização Empresa XYZ',
    date: '2025-12-18',
    status: 'confirmed',
    client: 'Empresa XYZ',
    phone: '(11) 3456-7890',
    guests: 200,
    price: 22000,
    expenses: 12000,
    profit: 10000,
    margin: 45.45,
    location: 'Salão Empresarial',
    notes: 'Evento corporativo, cardápio executivo'
  }
];

// Tarefas
export const tasks = [
  {
    id: '1',
    title: 'Confirmar fornecedores',
    description: 'Entrar em contato com todos os fornecedores para confirmar presença',
    status: 'pending',
    priority: 'high',
    dueDate: '2025-07-10',
    assignedTo: '1',
    eventId: '1'
  },
  {
    id: '2',
    title: 'Comprar ingredientes',
    description: 'Comprar ingredientes para o menu do evento',
    status: 'completed',
    priority: 'medium',
    dueDate: '2025-07-08',
    assignedTo: '2',
    eventId: '1'
  },
  {
    id: '3',
    title: 'Preparar decoração',
    description: 'Montar e testar a decoração do evento',
    status: 'pending',
    priority: 'medium',
    dueDate: '2025-07-14',
    assignedTo: '1',
    eventId: '1'
  }
];

// Produtos em estoque
export const products = [
  {
    id: '1',
    name: 'Farinha de Trigo',
    category: 'Ingredientes',
    unit: 'kg',
    quantity: 50,
    minQuantity: 10,
    price: 4.5
  },
  {
    id: '2',
    name: 'Açúcar',
    category: 'Ingredientes',
    unit: 'kg',
    quantity: 30,
    minQuantity: 5,
    price: 3.8
  },
  {
    id: '3',
    name: 'Chocolate em Pó',
    category: 'Ingredientes',
    unit: 'kg',
    quantity: 15,
    minQuantity: 3,
    price: 12.5
  },
  {
    id: '4',
    name: 'Taças de Cristal',
    category: 'Utensílios',
    unit: 'un',
    quantity: 200,
    minQuantity: 50,
    price: 15.0
  }
];

// Transações financeiras
export const transactions = [
  {
    id: '1',
    date: '2025-07-01',
    description: 'Pagamento Evento Casamento Silva',
    type: 'income',
    amount: 15000,
    category: 'Eventos',
    status: 'completed',
    eventId: '1'
  },
  {
    id: '2',
    date: '2025-07-03',
    description: 'Compra de ingredientes',
    type: 'expense',
    amount: 2500,
    category: 'Insumos',
    status: 'completed',
    eventId: '1'
  },
  {
    id: '3',
    date: '2025-07-05',
    description: 'Pagamento fornecedor decoração',
    type: 'expense',
    amount: 3000,
    category: 'Fornecedores',
    status: 'pending',
    eventId: '1'
  }
];

// Funcionários
export const employees = [
  {
    id: '1',
    name: 'Carlos Souza',
    role: 'Chef',
    department: 'Cozinha',
    salary: 4500,
    hireDate: '2023-01-15',
    phone: '(11) 98888-7777',
    email: 'carlos@example.com'
  },
  {
    id: '2',
    name: 'Ana Lima',
    role: 'Garçonete',
    department: 'Atendimento',
    salary: 2200,
    hireDate: '2023-03-10',
    phone: '(11) 97777-6666',
    email: 'ana@example.com'
  },
  {
    id: '3',
    name: 'Roberto Alves',
    role: 'Gerente',
    department: 'Administração',
    salary: 5500,
    hireDate: '2022-11-05',
    phone: '(11) 96666-5555',
    email: 'roberto@example.com'
  }
];

// Dados para banco de dados MongoDB
export const mongoDbData = {
  users: [
    {
      name: "Administrador",
      email: "admin@example.com",
      password: "$2a$10$X7.H/S1WJf.vVRBFgKJ25OZeL5BX5WjZ9GYT/wJF.V0HnV4yvBGAe", // hash de "admin123"
      role: "admin",
      department: "admin",
      company: "1",
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
      password: "$2a$10$X7.H/S1WJf.vVRBFgKJ25OZeL5BX5WjZ9GYT/wJF.V0HnV4yvBGAe", // hash de "manager123"
      role: "manager",
      department: "events",
      company: "1",
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
  companies: [
    {
      _id: "1",
      name: "Buffet Chocolate com Menta",
      address: "Rua das Flores, 123",
      phone: "(11) 3456-7890",
      email: "contato@chocolatecommenta.com",
      logo: "https://example.com/logo.png",
      owner: "1" // ID do usuário admin
    }
  ],
  events: events.map(event => ({
    ...event,
    company: "1"
  })),
  tasks: tasks.map(task => ({
    ...task,
    company: "1"
  })),
  products: products.map(product => ({
    ...product,
    company: "1"
  })),
  transactions: transactions.map(transaction => ({
    ...transaction,
    company: "1"
  })),
  employees: employees.map(employee => ({
    ...employee,
    company: "1"
  }))
};

// Script para inserir dados no MongoDB
export const mongoDbScript = `
// Conectar ao MongoDB
use fzone_database

// Limpar coleções existentes
db.users.drop()
db.companies.drop()
db.events.drop()
db.tasks.drop()
db.products.drop()
db.transactions.drop()
db.employees.drop()

// Inserir empresas
db.companies.insertMany(${JSON.stringify(mongoDbData.companies, null, 2)})

// Inserir usuários
db.users.insertMany(${JSON.stringify(mongoDbData.users, null, 2)})

// Inserir eventos
db.events.insertMany(${JSON.stringify(mongoDbData.events, null, 2)})

// Inserir tarefas
db.tasks.insertMany(${JSON.stringify(mongoDbData.tasks, null, 2)})

// Inserir produtos
db.products.insertMany(${JSON.stringify(mongoDbData.products, null, 2)})

// Inserir transações
db.transactions.insertMany(${JSON.stringify(mongoDbData.transactions, null, 2)})

// Inserir funcionários
db.employees.insertMany(${JSON.stringify(mongoDbData.employees, null, 2)})

// Verificar inserções
print("Empresas inseridas:", db.companies.count())
print("Usuários inseridos:", db.users.count())
print("Eventos inseridos:", db.events.count())
print("Tarefas inseridas:", db.tasks.count())
print("Produtos inseridos:", db.products.count())
print("Transações inseridas:", db.transactions.count())
print("Funcionários inseridos:", db.employees.count())
`;

export default {
  events,
  tasks,
  products,
  transactions,
  employees,
  mongoDbData,
  mongoDbScript
};