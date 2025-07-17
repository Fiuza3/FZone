<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import AppSidebar from './components/layout/AppSidebar.vue';
import AppHeader from './components/layout/AppHeader.vue';
import AppFooter from './components/layout/AppFooter.vue';
import LoadingScreen from './components/layout/LoadingScreen.vue';

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
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Tela de carregamento inicial -->
    <LoadingScreen v-if="initialLoading" />
    
    <!-- Tela de carregamento de dados -->
    <div v-else-if="isLoading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Carregando ERP...</p>
      </div>
    </div>
    
    <!-- Layout para usuários autenticados -->
    <div v-else-if="isAuthenticated" class="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <!-- Sidebar -->
      <AppSidebar 
        :mobile-menu-open="mobileMenuOpen"
        @toggle-mobile-menu="mobileMenuOpen = !mobileMenuOpen"
      />
      
      <!-- Conteúdo principal -->
      <div class="flex flex-col flex-1 md:pl-56 overflow-hidden">
        <!-- Header -->
        <AppHeader 
          @toggle-mobile-menu="mobileMenuOpen = !mobileMenuOpen" 
          :is-dark-mode="isDarkMode"
          @toggle-dark-mode="toggleDarkMode"
        />
        
        <!-- Conteúdo da página com transições -->
        <main class="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </main>
        
        <!-- Footer -->
        <AppFooter />
      </div>
    </div>
    
    <!-- Layout para usuários não autenticados -->
    <div v-else class="min-h-screen">
      <!-- Botão de alternar tema -->
      <div class="absolute top-4 right-4">
        <button 
          @click="toggleDarkMode" 
          class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          aria-label="Alternar tema"
        >
          <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        </button>
      </div>
      
      <router-view />
    </div>
  </div>
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