<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// Estado do formulário
const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const department = ref('geral');
const isLoading = ref(false);
const errorMessage = ref('');
const passwordsMatch = ref(true);

// Removido seleção de departamento - todos os usuários têm acesso total

// Verifica se as senhas coincidem em tempo real
watch([password, confirmPassword], () => {
  if (confirmPassword.value && password.value !== confirmPassword.value) {
    passwordsMatch.value = false;
  } else {
    passwordsMatch.value = true;
  }
});

// Função de registro
const handleRegister = async () => {
  console.log('📝 Tentando registrar usuário:', name.value);
  
  // Validação básica
  if (!name.value || !email.value || !password.value) {
    errorMessage.value = 'Por favor, preencha todos os campos obrigatórios';
    return;
  }
  
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'As senhas não coincidem';
    return;
  }
  
  if (password.value.length < 6) {
    errorMessage.value = 'A senha deve ter pelo menos 6 caracteres';
    return;
  }
  
  try {
    isLoading.value = true;
    errorMessage.value = '';
    
    // Tenta registrar o usuário
    const userData = {
      name: name.value,
      email: email.value,
      password: password.value,
      department: 'admin' // Todos os usuários têm acesso total
    };
    
    const success = await authStore.register(userData);
    
    if (success) {
      console.log('✅ Registro bem-sucedido, redirecionando para dashboard');
      router.push('/');
    } else {
      errorMessage.value = authStore.error || 'Erro ao registrar usuário';
    }
  } catch (error) {
    console.error('❌ Erro no registro:', error);
    errorMessage.value = 'Ocorreu um erro ao tentar registrar';
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
        <h2 class="mt-6 text-xl font-bold text-gray-900">Crie sua conta</h2>
      </div>
      
      <!-- Formulário de registro -->
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
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
        
        <!-- Campo de nome -->
        <div>
          <label for="name" class="form-label">Nome completo</label>
          <input
            id="name"
            v-model="name"
            type="text"
            required
            class="form-input"
            placeholder="Seu nome"
          />
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
        
        <!-- Departamento removido - todos os usuários têm acesso total -->
        
        <!-- Campo de senha -->
        <div>
          <label for="password" class="form-label">Senha</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="new-password"
            required
            class="form-input"
            placeholder="••••••••"
          />
          <p class="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
        </div>
        
        <!-- Campo de confirmação de senha -->
        <div>
          <label for="confirm-password" class="form-label">Confirme a senha</label>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            required
            :class="['form-input', !passwordsMatch && confirmPassword ? 'border-red-500 ring-1 ring-red-500' : '']"
            placeholder="••••••••"
          />
          <p v-if="!passwordsMatch && confirmPassword" class="text-xs text-red-500 mt-1">
            As senhas não coincidem
          </p>
        </div>
        
        <!-- Botão de registro -->
        <div>
          <button
            type="submit"
            :disabled="isLoading || !passwordsMatch"
            class="w-full btn btn-primary py-3 flex justify-center"
          >
            <span v-if="isLoading" class="animate-spin mr-2">
              <span class="material-icons text-sm">refresh</span>
            </span>
            {{ isLoading ? 'Registrando...' : 'Registrar' }}
          </button>
        </div>
        
        <!-- Link para login -->
        <div class="text-center">
          <p class="text-sm text-gray-600">
            Já tem uma conta?
            <router-link to="/login" class="font-medium text-primary-600 hover:text-primary-500">
              Faça login
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>