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

// Carrega o perfil do usuário se estiver autenticado
onMounted(async () => {
  console.log('🔄 App montado, verificando autenticação');
  
  // Simula carregamento inicial
  setTimeout(async () => {
    if (authStore.isAuthenticated) {
      console.log('🔑 Token encontrado, carregando perfil');
      await authStore.getProfile();
    }
    
    isLoading.value = false;
    console.log('✅ Inicialização concluída');
    
    // Remove tela de carregamento inicial após um pequeno delay
    setTimeout(() => {
      initialLoading.value = false;
    }, 500);
  }, 2000); // Simula carregamento de 2 segundos
});
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
    <div v-else-if="isAuthenticated" class="flex h-screen overflow-hidden">
      <!-- Sidebar -->
      <AppSidebar 
        :mobile-menu-open="mobileMenuOpen"
        @toggle-mobile-menu="mobileMenuOpen = !mobileMenuOpen"
      />
      
      <!-- Conteúdo principal -->
      <div class="flex flex-col flex-1 overflow-hidden">
        <!-- Header -->
        <AppHeader @toggle-mobile-menu="mobileMenuOpen = !mobileMenuOpen" />
        
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
      <router-view />
    </div>
  </div>
</template>