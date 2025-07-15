// API mockada para desenvolvimento
import { events, tasks, products, transactions, employees } from './mockData';

// Simula delay de rede
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Funções auxiliares
const findById = (collection, id) => collection.find(item => item.id === id);
const generateId = () => Math.random().toString(36).substring(2, 10);

// API mockada
const mockApi = {
  // Eventos
  async getEvents() {
    await delay();
    return { data: events };
  },
  
  async getEvent(id) {
    await delay();
    const event = findById(events, id);
    if (!event) throw new Error('Evento não encontrado');
    return { data: event };
  },
  
  async createEvent(eventData) {
    await delay();
    const newEvent = {
      id: generateId(),
      ...eventData,
      status: eventData.status || 'pending'
    };
    events.push(newEvent);
    return { data: newEvent };
  },
  
  async updateEvent(id, eventData) {
    await delay();
    const index = events.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Evento não encontrado');
    events[index] = { ...events[index], ...eventData };
    return { data: events[index] };
  },
  
  async deleteEvent(id) {
    await delay();
    const index = events.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Evento não encontrado');
    events.splice(index, 1);
    return { data: { success: true } };
  },
  
  // Tarefas
  async getTasks() {
    await delay();
    return { data: tasks };
  },
  
  async getTask(id) {
    await delay();
    const task = findById(tasks, id);
    if (!task) throw new Error('Tarefa não encontrada');
    return { data: task };
  },
  
  async createTask(taskData) {
    await delay();
    const newTask = {
      id: generateId(),
      ...taskData,
      status: taskData.status || 'pending'
    };
    tasks.push(newTask);
    return { data: newTask };
  },
  
  async updateTask(id, taskData) {
    await delay();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Tarefa não encontrada');
    tasks[index] = { ...tasks[index], ...taskData };
    return { data: tasks[index] };
  },
  
  async deleteTask(id) {
    await delay();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Tarefa não encontrada');
    tasks.splice(index, 1);
    return { data: { success: true } };
  },
  
  // Produtos
  async getProducts() {
    await delay();
    return { data: products };
  },
  
  // Transações
  async getTransactions() {
    await delay();
    return { data: transactions };
  },
  
  // Funcionários
  async getEmployees() {
    await delay();
    return { data: employees };
  },
  
  // Dashboard
  async getDashboardData() {
    await delay();
    return {
      data: {
        eventCount: events.length,
        upcomingEvents: events.filter(e => e.status === 'confirmed').length,
        pendingTasks: tasks.filter(t => t.status === 'pending').length,
        monthlyRevenue: 25000,
        lowStockItems: products.filter(p => p.quantity <= p.minQuantity).length
      }
    };
  }
};

export default mockApi;