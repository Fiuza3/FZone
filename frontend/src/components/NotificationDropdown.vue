<script setup>
import { useNotifications } from '../composables/useNotifications'
import { useRouter } from 'vue-router'

const router = useRouter()
const { 
  recentNotifications, 
  unreadCount, 
  hasUnread, 
  markAsRead, 
  markAllAsRead 
} = useNotifications()

// Formatar tempo relativo
const formatRelativeTime = (date) => {
  const now = new Date()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  
  if (diffMin < 1) return 'agora'
  if (diffMin < 60) return `${diffMin}min`
  if (diffHour < 24) return `${diffHour}h`
  return `${diffDay}d`
}

// Ícone por tipo
const getIcon = (type) => {
  const icons = {
    task: 'mdi-clipboard-check',
    stock: 'mdi-package-variant',
    finance: 'mdi-currency-usd',
    hr: 'mdi-account-group',
    system: 'mdi-cog'
  }
  return icons[type] || 'mdi-bell'
}

// Cor por tipo
const getColor = (type) => {
  const colors = {
    task: 'primary',
    stock: 'warning',
    finance: 'success',
    hr: 'info',
    system: 'grey'
  }
  return colors[type] || 'grey'
}

// Ir para página de notificações
const goToNotifications = () => {
  router.push('/notifications')
}
</script>

<template>
  <v-menu offset-y min-width="350" max-width="400">
    <template v-slot:activator="{ props }">
      <v-btn icon v-bind="props">
        <v-badge 
          :content="unreadCount" 
          :model-value="hasUnread"
          color="error"
          overlap
        >
          <v-icon>mdi-bell</v-icon>
        </v-badge>
      </v-btn>
    </template>
    
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center py-3">
        <span class="text-h6">Notificações</span>
        <v-btn 
          v-if="hasUnread"
          @click="markAllAsRead"
          size="small"
          variant="text"
          color="primary"
        >
          Marcar todas
        </v-btn>
      </v-card-title>
      
      <v-divider></v-divider>
      
      <div v-if="recentNotifications.length === 0" class="pa-4 text-center">
        <v-icon size="48" color="grey-lighten-1">mdi-bell-off</v-icon>
        <p class="text-grey-darken-1 mt-2">Nenhuma notificação</p>
      </div>
      
      <v-list v-else density="compact" max-height="300" class="overflow-y-auto">
        <v-list-item
          v-for="notification in recentNotifications"
          :key="notification.id"
          @click="markAsRead(notification.id)"
          :class="!notification.read ? 'bg-primary-lighten-5' : ''"
        >
          <template v-slot:prepend>
            <v-avatar 
              :color="getColor(notification.type)" 
              size="32"
            >
              <v-icon size="18">{{ getIcon(notification.type) }}</v-icon>
            </v-avatar>
          </template>
          
          <v-list-item-title class="text-body-2 font-weight-medium">
            {{ notification.title }}
            <v-chip 
              v-if="!notification.read" 
              color="primary" 
              size="x-small" 
              class="ml-1"
            >
              Nova
            </v-chip>
            <v-chip 
              v-if="notification.priority === 'high'" 
              color="error" 
              size="x-small" 
              class="ml-1"
            >
              Urgente
            </v-chip>
          </v-list-item-title>
          
          <v-list-item-subtitle class="text-caption">
            {{ notification.message }}
          </v-list-item-subtitle>
          
          <template v-slot:append>
            <span class="text-caption text-grey-darken-1">
              {{ formatRelativeTime(notification.date) }}
            </span>
          </template>
        </v-list-item>
      </v-list>
      
      <v-divider></v-divider>
      
      <v-card-actions class="justify-center">
        <v-btn 
          @click="goToNotifications"
          variant="text" 
          color="primary"
          size="small"
        >
          Ver todas as notificações
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>