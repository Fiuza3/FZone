<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';

const route = useRoute();
const router = useRouter();

const form = ref({
  name: '',
  password: '',
  confirmPassword: ''
});

const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const inviteInfo = ref(null);

const token = route.params.token;

onMounted(async () => {
  // Aqui você poderia validar o token primeiro, mas vamos fazer isso no submit
  console.log('Token do convite:', token);
});

const acceptInvite = async () => {
  if (!form.value.name.trim()) {
    errorMessage.value = 'Nome é obrigatório';
    return;
  }

  if (form.value.password.length < 6) {
    errorMessage.value = 'Senha deve ter pelo menos 6 caracteres';
    return;
  }

  if (form.value.password !== form.value.confirmPassword) {
    errorMessage.value = 'Senhas não coincidem';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await api.post('/employees/accept-invite', {
      token,
      name: form.value.name,
      password: form.value.password
    });

    successMessage.value = 'Conta criada com sucesso! Redirecionando para o login...';
    
    setTimeout(() => {
      router.push('/login');
    }, 2000);

  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Erro ao aceitar convite';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-primary-600">FZone</h1>
        <h2 class="mt-6 text-2xl font-bold text-gray-900">
          Aceitar Convite
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Complete seu cadastro para acessar o sistema
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Mensagem de Sucesso -->
        <div v-if="successMessage" class="mb-4 p-4 bg-green-50 border-l-4 border-green-500">
          <p class="text-green-700">{{ successMessage }}</p>
        </div>

        <!-- Mensagem de Erro -->
        <div v-if="errorMessage" class="mb-4 p-4 bg-red-50 border-l-4 border-red-500">
          <p class="text-red-700">{{ errorMessage }}</p>
        </div>

        <!-- Formulário -->
        <form v-if="!successMessage" @submit.prevent="acceptInvite" class="space-y-6">
          <!-- Nome -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Nome completo <span class="text-red-500">*</span>
            </label>
            <div class="mt-1">
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Seu nome completo"
              />
            </div>
          </div>

          <!-- Senha -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Senha <span class="text-red-500">*</span>
            </label>
            <div class="mt-1">
              <input
                id="password"
                v-model="form.password"
                type="password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <!-- Confirmar Senha -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Confirmar senha <span class="text-red-500">*</span>
            </label>
            <div class="mt-1">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                type="password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Digite a senha novamente"
              />
            </div>
          </div>

          <!-- Botão -->
          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <span v-if="isLoading" class="animate-spin mr-2">
                <span class="material-icons text-sm">refresh</span>
              </span>
              {{ isLoading ? 'Criando conta...' : 'Criar minha conta' }}
            </button>
          </div>
        </form>

        <!-- Link para login -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Já tem uma conta?
            <router-link to="/login" class="font-medium text-primary-600 hover:text-primary-500">
              Fazer login
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>