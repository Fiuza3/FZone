<script setup>
import { computed, onMounted } from 'vue';
import { useNotificationStore } from '../stores/notification';

// Store de notificações
const notificationStore = useNotificationStore();

// Carrega notificações ao montar o componente
onMounted(() => {
  notificationStore.loadNotifications();
});

// Notificações do store
const notifications = computed(() => notificationStore.allNotifications);

// Marcar notificação como lida
const markAsRead = (id) => {
  notificationStore.markAsRead(id);
};

// Marcar todas como lidas
const markAllAsRead = () => {
  notificationStore.markAllAsRead();
};

// Excluir notificação
const deleteNotification = (id) => {
  notificationStore.removeNotification(id);
};

// Limpar todas as notificações
const clearAllNotifications = () => {
  notificationStore.clearAllNotifications();
};

// Formatar data relativa
const formatRelativeTime = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) return 'agora';
  if (diffMin < 60) return `${diffMin} min atrás`;
  if (diffHour < 24) return `${diffHour} h atrás`;
  if (diffDay < 30) return `${diffDay} dias atrás`;
  
  return date.toLocaleDateString();
};

// Ícone baseado no tipo
const getIcon = (type) => {
  switch (type) {
    case 'task': return 'task';
    case 'stock': return 'inventory';
    case 'finance': return 'payments';
    case 'hr': return 'people';
    case 'system': return 'system_update';
    default: return 'notifications';
  }
};

// Cor baseada no tipo
const getColor = (type) => {
  switch (type) {
    case 'task': return 'blue';
    case 'stock': return 'yellow';
    case 'finance': return 'green';
    case 'hr': return 'purple';
    case 'system': return 'gray';
    default: return 'gray';
  }
};
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title">Notificações</h1>
      
      <div class="flex space-x-2">
        <button 
          @click="markAllAsRead" 
          class="btn btn-outline flex items-center"
          :disabled="!notificationStore.hasUnread"
        >
          <span class="material-icons mr-1">done_all</span>
          Marcar todas como lidas
        </button>
        
        <button 
          @click="clearAllNotifications" 
          class="btn btn-outline flex items-center"
          :disabled="notifications.length === 0"
        >
          <span class="material-icons mr-1">delete_sweep</span>
          Limpar todas
        </button>
      </div>
    </div>
    
    <!-- Lista de notificações -->
    <div class="card">
      <div v-if="notifications.length === 0" class="text-center py-8">
        <span class="material-icons text-4xl text-gray-400">notifications_off</span>
        <p class="text-gray-500 mt-2">Nenhuma notificação</p>
      </div>
      
      <ul v-else class="divide-y divide-gray-200">
        <li 
          v-for="notification in notifications" 
          :key="notification.id"
          :class="['p-4 hover:bg-gray-50', !notification.read && 'bg-blue-50']"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <div 
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  `bg-${getColor(notification.type)}-100`,
                  `text-${getColor(notification.type)}-600`
                ]"
              >
                <span class="material-icons">{{ getIcon(notification.type) }}</span>
              </div>
            </div>
            
            <div class="ml-4 flex-1">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                <p class="text-xs text-gray-500">{{ formatRelativeTime(notification.date) }}</p>
              </div>
              <p class="text-sm text-gray-500">{{ notification.message }}</p>
              
              <div class="mt-2 flex space-x-2">
                <button 
                  v-if="!notification.read"
                  @click="markAsRead(notification.id)" 
                  class="text-xs text-blue-600 hover:text-blue-800"
                >
                  Marcar como lida
                </button>
                <button 
                  @click="deleteNotification(notification.id)" 
                  class="text-xs text-red-600 hover:text-red-800"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>