<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Estado do formulário
const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

// Redireciona para a página solicitada após login
const redirectPath = route.query.redirect || '/';

// Função de login
const handleLogin = async () => {
  console.log('🔑 Tentando login com email:', email.value);
  
  // Validação básica
  if (!email.value || !password.value) {
    errorMessage.value = 'Por favor, preencha todos os campos';
    return;
  }
  
  try {
    isLoading.value = true;
    errorMessage.value = '';
    
    // Tenta fazer login
    const success = await authStore.login(email.value, password.value);
    
    if (success) {
      console.log('✅ Login bem-sucedido, redirecionando para:', redirectPath);
      router.push(redirectPath);
    } else {
      errorMessage.value = authStore.error || 'Erro ao fazer login';
    }
  } catch (error) {
    console.error('❌ Erro no login:', error);
    errorMessage.value = 'Ocorreu um erro ao tentar fazer login';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo e título -->
      <div class="text-center">
        <h1 class="text-3xl font-extrabold text-gray-900">ERP System</h1>
        <h2 class="mt-6 text-xl font-bold text-gray-900">Faça login na sua conta</h2>
      </div>
      
      <!-- Formulário de login -->
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <!-- Mensagem de erro -->
        <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <span class="material-icons text-red-500">error</span>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ errorMessage }}</p>
            </div>
          </div>
        </div>
        
        <!-- Campo de email -->
        <div>
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="form-input"
            placeholder="seu@email.com"
          />
        </div>
        
        <!-- Campo de senha -->
        <div>
          <label for="password" class="form-label">Senha</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            class="form-input"
            placeholder="••••••••"
          />
        </div>
        
        <!-- Lembrar-me e Esqueci a senha -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="rememberMe"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              Lembrar-me
            </label>
          </div>
          
          <div class="text-sm">
            <a href="#" class="font-medium text-primary-600 hover:text-primary-500">
              Esqueceu sua senha?
            </a>
          </div>
        </div>
        
        <!-- Botão de login -->
        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full btn btn-primary py-3 flex justify-center"
          >
            <span v-if="isLoading" class="animate-spin mr-2">
              <span class="material-icons text-sm">refresh</span>
            </span>
            {{ isLoading ? 'Entrando...' : 'Entrar' }}
          </button>
        </div>
        
        <!-- Link para registro -->
        <div class="text-center">
          <p class="text-sm text-gray-600">
            Não tem uma conta?
            <router-link to="/register" class="font-medium text-primary-600 hover:text-primary-500">
              Registre-se
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>