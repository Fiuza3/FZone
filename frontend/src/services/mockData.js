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

export default {
  events,
  tasks,
  products,
  transactions,
  employees
};