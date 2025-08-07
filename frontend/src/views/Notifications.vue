<script setup>
import { onMounted } from 'vue';
import { useNotifications } from '../composables/useNotifications';

const { 
  notifications, 
  unreadCount, 
  hasUnread, 
  markAsRead, 
  markAllAsRead, 
  removeNotification, 
  clearAll,
  initializeIfEmpty
} = useNotifications();

// Carrega notificações ao montar
onMounted(() => {
  initializeIfEmpty();
});

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
</script>

<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col>
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Notificações</h1>
            <v-chip v-if="hasUnread" color="primary" size="small">
              {{ unreadCount }} não lidas
            </v-chip>
          </div>
          
          <div class="d-flex ga-2">
            <v-btn
              @click="markAllAsRead"
              variant="outlined"
              prepend-icon="mdi-check-all"
              size="large"
              :disabled="!hasUnread"
            >
              Marcar todas como lidas
            </v-btn>
            
            <v-btn
              @click="clearAll"
              variant="outlined"
              prepend-icon="mdi-delete-sweep"
              size="large"
              :disabled="notifications.length === 0"
            >
              Limpar todas
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
    
    <!-- Lista de notificações -->
    <v-card elevation="4">
      <v-card-text v-if="notifications.length === 0">
        <v-empty-state
          icon="mdi-bell-off-outline"
          title="Nenhuma notificação"
          text="Você está em dia! Não há notificações pendentes."
        ></v-empty-state>
      </v-card-text>
      
      <v-list v-else>
        <v-list-item
          v-for="notification in notifications"
          :key="notification.id"
          :class="!notification.read ? 'bg-primary-lighten-5' : ''"
          class="px-4 py-3"
        >
          <template v-slot:prepend>
            <v-avatar
              :color="
                notification.type === 'task' ? 'primary' :
                notification.type === 'stock' ? 'warning' :
                notification.type === 'finance' ? 'success' :
                notification.type === 'hr' ? 'info' :
                notification.type === 'system' ? 'grey' : 'grey'
              "
              size="40"
            >
              <v-icon>
                {{
                  notification.type === 'task' ? 'mdi-clipboard-check' :
                  notification.type === 'stock' ? 'mdi-package-variant' :
                  notification.type === 'finance' ? 'mdi-currency-usd' :
                  notification.type === 'hr' ? 'mdi-account-group' :
                  notification.type === 'system' ? 'mdi-cog' : 'mdi-bell'
                }}
              </v-icon>
            </v-avatar>
          </template>

          <v-list-item-title class="font-weight-medium mb-1">
            {{ notification.title }}
            <v-chip v-if="!notification.read" color="primary" size="x-small" class="ml-2">
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
          
          <v-list-item-subtitle class="text-body-2 mb-2">
            {{ notification.message }}
          </v-list-item-subtitle>
          
          <div class="d-flex justify-space-between align-center">
            <span class="text-caption text-grey-darken-1">
              {{ formatRelativeTime(notification.date) }}
            </span>
            
            <div class="d-flex ga-1">
              <v-tooltip text="Marcar como lida" v-if="!notification.read">
                <template v-slot:activator="{ props }">
                  <v-btn
                    @click="markAsRead(notification.id)"
                    icon="mdi-check"
                    color="primary"
                    size="small"
                    variant="text"
                    v-bind="props"
                  ></v-btn>
                </template>
              </v-tooltip>
              
              <v-tooltip text="Excluir notificação">
                <template v-slot:activator="{ props }">
                  <v-btn
                    @click="removeNotification(notification.id)"
                    icon="mdi-delete"
                    color="error"
                    size="small"
                    variant="text"
                    v-bind="props"
                  ></v-btn>
                </template>
              </v-tooltip>
            </div>
          </div>
        </v-list-item>
      </v-list>
    </v-card>
  </v-container>
</template>