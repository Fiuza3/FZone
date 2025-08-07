<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import AppSidebar from './components/layout/AppSidebar.vue';
import LoadingScreen from './components/layout/LoadingScreen.vue';
import NotificationDropdown from './components/NotificationDropdown.vue';
import NotificationSnackbar from './components/NotificationSnackbar.vue';

const authStore = useAuthStore();
const router = useRouter();
const isLoading = ref(true);
const mobileMenuOpen = ref(false);
const initialLoading = ref(true);

// Verifica se o usuário está autenticado
const isAuthenticated = computed(() => authStore.isAuthenticated);

// Verifica preferência de tema
const isDarkMode = ref(localStorage.getItem('darkMode') === 'true');

// Aplica tema escuro se necessário
onMounted(() => {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
  }
  
  // Verifica autenticação
  setTimeout(async () => {
    if (authStore.isAuthenticated) {
      await authStore.getProfile();
    }
    
    isLoading.value = false;
    
    // Remove tela de carregamento inicial após um pequeno delay
    setTimeout(() => {
      initialLoading.value = false;
    }, 500);
  }, 1000);
});

// Alterna entre tema claro e escuro
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem('darkMode', isDarkMode.value);
  
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Toggle drawer
const toggleDrawer = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};
</script>

<template>
  <v-app>
    <!-- Tela de carregamento inicial -->
    <LoadingScreen v-if="initialLoading" />
    
    <!-- Tela de carregamento de dados -->
    <v-container v-else-if="isLoading" fluid fill-height>
      <v-row justify="center" align="center">
        <v-col cols="auto">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="mt-4 text-center">Carregando ERP...</p>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- Layout para usuários autenticados -->
    <template v-else-if="isAuthenticated">
      <!-- Sidebar -->
      <AppSidebar 
        :drawer-open="mobileMenuOpen"
        :is-dark-mode="isDarkMode"
        @toggle-drawer="toggleDrawer"
        @toggle-theme="toggleDarkMode"
      />
      
      <!-- Header -->
      <v-app-bar elevation="1">
        <v-app-bar-nav-icon
          @click="toggleDrawer"
        ></v-app-bar-nav-icon>
        
        <v-app-bar-title>{{ authStore.user?.company?.name || 'FZone ERP' }}</v-app-bar-title>
        
        <v-spacer></v-spacer>
        
        <NotificationDropdown />
        
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" variant="text">
              <v-avatar size="32" color="primary">
                {{ authStore.userName.charAt(0).toUpperCase() }}
              </v-avatar>
            </v-btn>
          </template>
          <v-list>
            <v-list-item to="/profile" prepend-icon="mdi-account">
              <v-list-item-title>Perfil</v-list-item-title>
            </v-list-item>
            <v-list-item to="/settings" prepend-icon="mdi-cog">
              <v-list-item-title>Configurações</v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item @click="authStore.logout(); $router.push('/login')" prepend-icon="mdi-logout">
              <v-list-item-title>Sair</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-app-bar>
      
      <!-- Conteúdo principal -->
      <v-main>
        <v-container fluid>
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </v-container>
      </v-main>
      
      <!-- Snackbar de notificações -->
      <NotificationSnackbar />
    </template>
    
    <!-- Layout para usuários não autenticados -->
    <template v-else>
      <!-- Botão de alternar tema -->
      <v-btn
        @click="toggleDarkMode"
        icon
        style="position: absolute; top: 16px; right: 16px; z-index: 1000;"
        variant="outlined"
      >
        <v-icon>{{ isDarkMode ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>
      
      <router-view />
    </template>
  </v-app>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>