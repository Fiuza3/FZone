import { useNotifications } from './useNotifications'
import { useTaskStore } from '../stores/task'
import { useEventStore } from '../stores/event'
import { useHRStore } from '../stores/hr'
import { useStockStore } from '../stores/stock'

export function useAutomaticNotifications() {
  const { addNotification } = useNotifications()
  const taskStore = useTaskStore()
  const eventStore = useEventStore()
  const hrStore = useHRStore()
  const stockStore = useStockStore()

  // Verificar tarefas próximas do vencimento (12 horas)
  const checkTaskDeadlines = () => {
    const now = new Date()
    const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60 * 1000)

    taskStore.tasks.forEach(task => {
      if (task.dueDate && task.status !== 'concluida' && task.status !== 'cancelada') {
        const dueDate = new Date(task.dueDate)
        
        if (dueDate <= twelveHoursFromNow && dueDate > now) {
          const hoursLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60))
          
          addNotification({
            title: 'Tarefa Próxima do Vencimento',
            message: `"${task.title}" vence em ${hoursLeft}h`,
            type: 'task',
            priority: 'high'
          })
        }
      }
    })
  }

  // Verificar eventos próximos (24 horas)
  const checkUpcomingEvents = () => {
    const now = new Date()
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    eventStore.events.forEach(event => {
      if (event.startDate && event.status !== 'cancelado' && event.status !== 'concluido') {
        const eventDate = new Date(event.startDate)
        
        if (eventDate <= twentyFourHoursFromNow && eventDate > now) {
          const hoursLeft = Math.ceil((eventDate - now) / (1000 * 60 * 60))
          
          addNotification({
            title: 'Evento Próximo',
            message: `"${event.title}" acontece em ${hoursLeft}h`,
            type: 'system',
            priority: 'high'
          })
        }
      }
    })
  }

  // Verificar férias próximas (30 dias)
  const checkUpcomingVacations = () => {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    hrStore.employees.forEach(employee => {
      if (employee.vacationDate && employee.status === 'ativo') {
        const vacationDate = new Date(employee.vacationDate)
        
        if (vacationDate <= thirtyDaysFromNow && vacationDate > now) {
          const daysLeft = Math.ceil((vacationDate - now) / (1000 * 60 * 60 * 24))
          
          addNotification({
            title: 'Férias Próximas',
            message: `${employee.name} entra de férias em ${daysLeft} dias`,
            type: 'hr',
            priority: 'medium'
          })
        }
      }
    })
  }

  // Verificar aniversários (hoje)
  const checkBirthdays = () => {
    const today = new Date()
    const todayMonth = today.getMonth() + 1
    const todayDay = today.getDate()

    hrStore.employees.forEach(employee => {
      if (employee.birthDate && employee.status === 'ativo') {
        const birthDate = new Date(employee.birthDate)
        const birthMonth = birthDate.getMonth() + 1
        const birthDay = birthDate.getDate()
        
        if (birthMonth === todayMonth && birthDay === todayDay) {
          const age = today.getFullYear() - birthDate.getFullYear()
          
          addNotification({
            title: '🎉 Aniversário Hoje!',
            message: `${employee.name} está fazendo ${age} anos hoje!`,
            type: 'hr',
            priority: 'medium'
          })
        }
      }
    })
  }

  // Verificar estoque baixo usando dados reais
  const checkLowStock = () => {
    if (stockStore.products && stockStore.products.length > 0) {
      stockStore.products.forEach(product => {
        if (product.quantity <= (product.minQuantity || 5)) {
          addNotification({
            title: 'Estoque Baixo',
            message: `${product.name} - apenas ${product.quantity} unidades restantes`,
            type: 'stock',
            priority: 'high'
          })
        }
      })
    }
  }

  // Executar todas as verificações
  const runAllChecks = async () => {
    try {
      // Aguardar carregamento dos dados se necessário
      await Promise.all([
        taskStore.tasks.length === 0 ? taskStore.fetchTasks() : Promise.resolve(),
        eventStore.events.length === 0 ? eventStore.fetchEvents() : Promise.resolve(),
        hrStore.employees.length === 0 ? hrStore.fetchEmployees() : Promise.resolve(),
        stockStore.products.length === 0 ? stockStore.fetchProducts() : Promise.resolve()
      ])

      // Executar verificações
      checkTaskDeadlines()
      checkUpcomingEvents()
      checkUpcomingVacations()
      checkBirthdays()
      checkLowStock()
      
      console.log('✅ Verificações automáticas de notificações executadas')
    } catch (error) {
      console.error('❌ Erro ao executar verificações automáticas:', error)
    }
  }

  // Inicializar verificações periódicas
  const startPeriodicChecks = () => {
    // Executar imediatamente
    runAllChecks()
    
    // Executar a cada 30 minutos
    const interval = setInterval(runAllChecks, 30 * 60 * 1000)
    
    return () => clearInterval(interval)
  }

  // Executar verificações com dados reais apenas
  const generateRealNotifications = () => {
    // Executar apenas verificações com dados reais
    runAllChecks()
  }

  return {
    checkTaskDeadlines,
    checkUpcomingEvents,
    checkUpcomingVacations,
    checkBirthdays,
    checkLowStock,
    runAllChecks,
    startPeriodicChecks,
    generateRealNotifications
  }
}