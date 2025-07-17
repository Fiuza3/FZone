<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          FZone ERP
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
          Sistema de Gestão para Buffets
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email-address" class="sr-only">Email</label>
            <input id="email-address" name="email" type="email" autocomplete="email" required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email"
              v-model="email">
          </div>
          <div>
            <label for="password" class="sr-only">Senha</label>
            <input id="password" name="password" type="password" autocomplete="current-password" required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Senha"
              v-model="password">
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input id="remember-me" name="remember-me" type="checkbox" 
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
              v-model="rememberMe">
            <label for="remember-me" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              Lembrar-me
            </label>
          </div>

          <div class="text-sm">
            <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              Esqueceu a senha?
            </a>
          </div>
        </div>

        <div>
          <button type="submit" 
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            :disabled="loading">
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
            </span>
            <span v-if="loading">Entrando...</span>
            <span v-else>Entrar</span>
          </button>
        </div>
        
        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700 dark:text-red-300">
                {{ error }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="text-center">
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Não tem uma conta?
            <router-link to="/register" class="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              Registre-se
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

export default {
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    
    const email = ref('admin@example.com');
    const password = ref('admin123');
    const rememberMe = ref(false);
    const loading = ref(false);
    const error = ref('');
    
    const handleLogin = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        const success = await authStore.login(email.value, password.value);
        
        if (success) {
          router.push('/');
        } else {
          error.value = authStore.error || 'Credenciais inválidas';
        }
      } catch (err) {
        error.value = 'Erro ao fazer login. Tente novamente.';
      } finally {
        loading.value = false;
      }
    };
    
    return {
      email,
      password,
      rememberMe,
      loading,
      error,
      handleLogin
    };
  }
};
</script>