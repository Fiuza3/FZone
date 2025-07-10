<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useNotificationStore } from '../../stores/notification';

const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const showProfileMenu = ref(false);
const showNotifications = ref(false);

// Carrega notificações ao montar o componente
onMounted(async () => {
  notificationStore.loadNotifications();
  
  // Carrega perfil com dados da empresa se não estiver carregado
  if (!authStore.user?.company) {
    await authStore.getProfile();
  }
  
  // Adiciona notificação de boas-vindas apenas no primeiro acesso
  const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
  if (!hasSeenWelcome) {
    notificationStore.addSystemNotification(
      'Bem-vindo ao FZone', 
      `Olá ${authStore.userName}! Bem-vindo ao sistema de gestão da ${authStore.user?.company?.name || 'sua empresa'}. Explore os módulos disponíveis e gerencie seu negócio com eficiência.`
    );
    localStorage.setItem('hasSeenWelcome', 'true');
  }
  
  // Adiciona evento de clique global para fechar menus
  document.addEventListener('click', (event) => {
    // Verifica se o clique foi fora do menu de notificações
    const notificationButton = document.querySelector('#notification-button');
    const notificationMenu = document.querySelector('#notification-menu');
    
    if (notificationButton && notificationMenu) {
      if (!notificationButton.contains(event.target) && !notificationMenu.contains(event.target)) {
        showNotifications.value = false;
      }
    }
    
    // Verifica se o clique foi fora do menu de perfil
    const profileButton = document.querySelector('#profile-button');
    const profileMenu = document.querySelector('#profile-menu');
    
    if (profileButton && profileMenu) {
      if (!profileButton.contains(event.target) && !profileMenu.contains(event.target)) {
        showProfileMenu.value = false;
      }
    }
  });
});

// Notificações do store (apenas as 5 mais recentes)
const notifications = computed(() => notificationStore.allNotifications.slice(0, 5));

// Contagem de notificações não lidas
const unreadCount = computed(() => notificationStore.unreadCount);

// Toggle menu de perfil
const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value;
  if (showProfileMenu.value) {
    showNotifications.value = false;
  }
};

// Toggle menu de notificações
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) {
    showProfileMenu.value = false;
  }
};

// Fecha menus
const closeMenus = () => {
  showProfileMenu.value = false;
  showNotifications.value = false;
};

// Marcar notificação como lida
const markAsRead = (id) => {
  notificationStore.markAsRead(id);
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

// Ver todas as notificações
const viewAllNotifications = () => {
  showNotifications.value = false;
  router.push('/notifications');
};

// Realiza logout
const handleLogout = () => {
  console.log('👋 Iniciando logout do header');
  authStore.logout();
  window.location.href = '/login';
};
</script>

<template>
  <header class="bg-white shadow-sm h-16 flex items-center px-6 sticky top-0 z-10">
    <!-- Botão do menu mobile -->
    <div class="md:hidden">
      <button 
        @click="$emit('toggle-mobile-menu')"
        class="text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <span class="material-icons">menu</span>
      </button>
    </div>
    
    <!-- Nome da empresa -->
    <h1 class="text-xl font-semibold text-gray-800 hidden md:block">
      {{ authStore.user?.company?.name || 'Dashboard' }}
    </h1>
    
    <!-- Espaçador -->
    <div class="flex-grow"></div>
    
    <!-- Notificações -->
    <div class="relative mr-4">
      <button 
        id="notification-button"
        @click="toggleNotifications"
        class="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-800"
      >
        <span class="material-icons">notifications</span>
        <span 
          v-if="unreadCount > 0"
          class="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
        >
          {{ unreadCount }}
        </span>
      </button>
      
      <!-- Menu dropdown de notificações -->
      <div 
        id="notification-menu"
        v-if="showNotifications"
        class="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-20"
      >
        <div class="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
          <h3 class="font-medium">Notificações</h3>
          <span class="text-xs text-gray-500">{{ unreadCount }} não lidas</span>
        </div>
        
        <div class="max-h-60 overflow-y-auto">
          <div v-if="notifications.length === 0" class="px-4 py-2 text-sm text-gray-500">
            Nenhuma notificação
          </div>
          
          <a 
            v-for="notification in notifications" 
            :key="notification.id"
            href="#"
            @click.prevent="markAsRead(notification.id)"
            :class="['block px-4 py-2 hover:bg-gray-100', !notification.read && 'bg-blue-50']"
          >
            <div class="flex justify-between">
              <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
              <p class="text-xs text-gray-500">{{ formatRelativeTime(notification.date) }}</p>
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ notification.message }}</p>
          </a>
        </div>
        
        <div class="border-t border-gray-100 text-center">
          <button 
            @click="viewAllNotifications"
            class="block w-full px-4 py-2 text-sm text-primary-600 hover:bg-gray-100"
          >
            Ver todas
          </button>
        </div>
      </div>
    </div>
    
    <!-- Perfil do usuário -->
    <div class="relative">
      <button 
        id="profile-button"
        @click="toggleProfileMenu"
        class="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
      >
        <div class="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center">
          {{ authStore.userName.charAt(0).toUpperCase() }}
        </div>
        <span class="hidden md:inline-block">{{ authStore.userName }}</span>
        <span class="material-icons text-sm">
          {{ showProfileMenu ? 'arrow_drop_up' : 'arrow_drop_down' }}
        </span>
      </button>
      
      <!-- Menu dropdown -->
      <div 
        id="profile-menu"
        v-if="showProfileMenu"
        class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20"
      >
        <router-link to="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          Meu Perfil
        </router-link>
        <router-link to="/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          Configurações
        </router-link>
        <div class="border-t border-gray-100"></div>
        <a 
          @click.prevent="handleLogout"
          href="#" 
          class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
        >
          Sair
        </a>
      </div>
    </div>
  </header>
</template>