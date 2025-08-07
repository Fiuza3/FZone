import { ref, computed } from 'vue'

// Estado global das notificações
const notifications = ref([])
const snackbar = ref({
  show: false,
  message: '',
  color: 'info',
  timeout: 4000
})

export function useNotifications() {
  // Computed
  const unreadCount = computed(() => 
    notifications.value.filter(n => !n.read).length
  )
  
  const hasUnread = computed(() => unreadCount.value > 0)
  
  const recentNotifications = computed(() => 
    notifications.value.slice(0, 5)
  )

  // Adicionar notificação
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info',
      priority: notification.priority || 'medium',
      read: false,
      date: new Date(),
      ...notification
    }
    
    notifications.value.unshift(newNotification)
    
    // Mostrar snackbar para notificações de alta prioridade
    if (notification.priority === 'high') {
      const color = notification.type === 'task' ? 'warning' :
                   notification.type === 'stock' ? 'error' : 'info'
      showSnackbar(notification.message, color, 8000)
    }
    
    // Limitar a 50 notificações
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }
  }

  // Mostrar snackbar
  const showSnackbar = (message, color = 'info', timeout = 4000) => {
    snackbar.value = {
      show: true,
      message,
      color,
      timeout
    }
  }

  // Mostrar notificação de sucesso
  const showSuccess = (message) => {
    showSnackbar(message, 'success')
  }

  // Mostrar notificação de erro
  const showError = (message) => {
    showSnackbar(message, 'error', 6000)
  }

  // Mostrar notificação de aviso
  const showWarning = (message) => {
    showSnackbar(message, 'warning', 5000)
  }

  // Mostrar notificação de info
  const showInfo = (message) => {
    showSnackbar(message, 'info')
  }

  // Marcar como lida
  const markAsRead = (id) => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  // Marcar todas como lidas
  const markAllAsRead = () => {
    notifications.value.forEach(n => n.read = true)
  }

  // Remover notificação
  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  // Limpar todas
  const clearAll = () => {
    notifications.value = []
  }

  // Fechar snackbar
  const closeSnackbar = () => {
    snackbar.value.show = false
  }

  // Inicializar apenas se não houver notificações
  const initializeIfEmpty = () => {
    if (notifications.value.length === 0) {
      addNotification({
        title: 'Sistema Iniciado',
        message: 'Sistema de notificações ativo. Monitorando tarefas, eventos e estoque.',
        type: 'system'
      })
    }
  }

  return {
    // Estado
    notifications,
    snackbar,
    
    // Computed
    unreadCount,
    hasUnread,
    recentNotifications,
    
    // Métodos
    addNotification,
    showSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    closeSnackbar,
    initializeIfEmpty
  }
}