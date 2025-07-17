// API mockada para desenvolvimento
import { events, tasks, products, transactions, employees } from './mockData';

// Banco de dados em memória
const db = {
  events: [...events],
  tasks: [...tasks],
  products: [...products],
  transactions: [...transactions],
  employees: [...employees]
};

// Gera ID único
const generateId = () => Math.random().toString(36).substring(2, 10);

// Simula delay de rede
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// API mockada
const api = {
  // Autenticação
  async post(url, data) {
    console.log('📡 API Mock POST:', url, data);
    await delay();
    
    // Login
    if (url === '/auth/login') {
      if (data.email === 'admin@example.com' && data.password === 'admin123') {
        return {
          data: {
            success: true,
            user: {
              id: '1',
              name: 'Administrador',
              email: 'admin@example.com',
              role: 'admin',
              department: 'admin',
              permissions: {
                events: true,
                tasks: true,
                stock: true,
                finance: true,
                hr: true,
                accounts: true
              }
            },
            token: 'mock-token-' + Math.random().toString(36).substring(2)
          }
        };
      } else {
        return {
          data: {
            success: false,
            error: 'Credenciais inválidas'
          }
        };
      }
    }
    
    // Tarefas
    if (url === '/tasks') {
      const newTask = {
        id: generateId(),
        ...data,
        status: data.status || 'pending'
      };
      db.tasks.push(newTask);
      return { data: newTask };
    }
    
    // Eventos
    if (url === '/events') {
      const newEvent = {
        id: generateId(),
        ...data,
        status: data.status || 'pending'
      };
      db.events.push(newEvent);
      return { data: newEvent };
    }
    
    // Produtos
    if (url === '/stock') {
      const newProduct = {
        id: generateId(),
        ...data
      };
      db.products.push(newProduct);
      return { data: newProduct };
    }
    
    // Transações
    if (url === '/finance') {
      const newTransaction = {
        id: generateId(),
        ...data,
        date: data.date || new Date().toISOString().split('T')[0]
      };
      db.transactions.push(newTransaction);
      return { data: newTransaction };
    }
    
    // Funcionários
    if (url === '/employees') {
      const newEmployee = {
        id: generateId(),
        ...data,
        hireDate: data.hireDate || new Date().toISOString().split('T')[0]
      };
      db.employees.push(newEmployee);
      return { data: newEmployee };
    }
    
    return { data: { success: true, id: generateId() } };
  },
  
  async get(url) {
    console.log('📡 API Mock GET:', url);
    await delay();
    
    // Tarefas
    if (url === '/tasks') {
      return { data: db.tasks };
    }
    
    // Eventos
    if (url === '/events') {
      return { data: db.events };
    }
    
    // Produtos
    if (url === '/stock') {
      return { data: db.products };
    }
    
    // Transações
    if (url === '/finance') {
      return { data: db.transactions };
    }
    
    // Funcionários
    if (url === '/employees') {
      return { data: db.employees };
    }
    
    // Dashboard
    if (url === '/dashboard') {
      return {
        data: {
          eventCount: db.events.length,
          upcomingEvents: db.events.filter(e => e.status === 'confirmed').length,
          pendingTasks: db.tasks.filter(t => t.status === 'pending').length,
          monthlyRevenue: db.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0),
          lowStockItems: db.products.filter(p => p.quantity <= p.minQuantity).length
        }
      };
    }
    
    return { data: [] };
  },
  
  async put(url, data) {
    console.log('📡 API Mock PUT:', url, data);
    await delay();
    
    // Extrai ID da URL
    const id = url.split('/').pop();
    
    // Tarefas
    if (url.includes('/tasks/')) {
      const index = db.tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        db.tasks[index] = { ...db.tasks[index], ...data };
        return { data: db.tasks[index] };
      }
    }
    
    // Eventos
    if (url.includes('/events/')) {
      const index = db.events.findIndex(e => e.id === id);
      if (index !== -1) {
        db.events[index] = { ...db.events[index], ...data };
        return { data: db.events[index] };
      }
    }
    
    // Produtos
    if (url.includes('/stock/')) {
      const index = db.products.findIndex(p => p.id === id);
      if (index !== -1) {
        db.products[index] = { ...db.products[index], ...data };
        return { data: db.products[index] };
      }
    }
    
    return { data: { success: true } };
  },
  
  async delete(url) {
    console.log('📡 API Mock DELETE:', url);
    await delay();
    
    // Extrai ID da URL
    const id = url.split('/').pop();
    
    // Tarefas
    if (url.includes('/tasks/')) {
      const index = db.tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        db.tasks.splice(index, 1);
      }
    }
    
    // Eventos
    if (url.includes('/events/')) {
      const index = db.events.findIndex(e => e.id === id);
      if (index !== -1) {
        db.events.splice(index, 1);
      }
    }
    
    // Produtos
    if (url.includes('/stock/')) {
      const index = db.products.findIndex(p => p.id === id);
      if (index !== -1) {
        db.products.splice(index, 1);
      }
    }
    
    return { data: { success: true } };
  }
};

// Log para indicar que estamos usando API mockada
console.log('📡 Usando API mockada para desenvolvimento');

export default api;