import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    lastId: 0
  }),
  
  getters: {
    unreadCount: (state) => state.notifications.filter(n => !n.read).length,
    hasUnread: (state) => state.notifications.some(n => !n.read),
    allNotifications: (state) => state.notifications
  },
  
  actions: {
    // Adiciona uma nova notificação
    addNotification(notification) {
      this.lastId++;
      const newNotification = {
        id: this.lastId,
        date: new Date(),
        read: false,
        ...notification
      };
      
      this.notifications.unshift(newNotification);
      
      // Salva no localStorage
      this.saveNotifications();
      
      return newNotification;
    },
    
    // Adiciona notificação de tarefa
    addTaskNotification(task) {
      return this.addNotification({
        type: 'task',
        title: 'Nova tarefa atribuída',
        message: `Você recebeu uma nova tarefa: "${task.title}"`,
        priority: task.priority
      });
    },
    
    // Adiciona notificação de estoque baixo
    addLowStockNotification(product) {
      return this.addNotification({
        type: 'stock',
        title: 'Alerta de estoque baixo',
        message: `O produto "${product.name}" está com estoque abaixo do mínimo (${product.quantity}/${product.minStock})`,
        productId: product.id
      });
    },
    
    // Adiciona notificação de transação financeira
    addFinanceNotification(transaction) {
      return this.addNotification({
        type: 'finance',
        title: `Transação ${transaction.type === 'receita' ? 'recebida' : 'efetuada'}`,
        message: `A transação "${transaction.description}" foi ${transaction.status === 'pago' ? 'paga' : 'registrada'}`,
        transactionId: transaction.id,
        amount: transaction.amount
      });
    },
    
    // Adiciona notificação de RH
    addHRNotification(employee, action) {
      return this.addNotification({
        type: 'hr',
        title: `Funcionário ${action}`,
        message: `O funcionário "${employee.name}" foi ${action}`,
        employeeId: employee.id
      });
    },
    
    // Adiciona notificação do sistema
    addSystemNotification(title, message) {
      return this.addNotification({
        type: 'system',
        title,
        message
      });
    },
    
    // Marca uma notificação como lida
    markAsRead(id) {
      const notification = this.notifications.find(n => n.id === id);
      if (notification) {
        notification.read = true;
        this.saveNotifications();
      }
    },
    
    // Marca todas as notificações como lidas
    markAllAsRead() {
      this.notifications.forEach(notification => {
        notification.read = true;
      });
      this.saveNotifications();
    },
    
    // Remove uma notificação
    removeNotification(id) {
      this.notifications = this.notifications.filter(n => n.id !== id);
      this.saveNotifications();
    },
    
    // Remove todas as notificações
    clearAllNotifications() {
      this.notifications = [];
      this.saveNotifications();
    },
    
    // Carrega notificações do localStorage
    loadNotifications() {
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        try {
          const parsed = JSON.parse(savedNotifications);
          this.notifications = parsed.notifications.map(n => ({
            ...n,
            date: new Date(n.date)
          }));
          this.lastId = parsed.lastId;
        } catch (e) {
          console.error('Erro ao carregar notificações:', e);
        }
      }
    },
    
    // Salva notificações no localStorage
    saveNotifications() {
      localStorage.setItem('notifications', JSON.stringify({
        notifications: this.notifications,
        lastId: this.lastId
      }));
    }
  }
});