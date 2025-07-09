<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const isLoading = ref(true);
const isEditing = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// Dados do perfil
const profile = ref({
  name: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// Carrega dados do perfil
onMounted(async () => {
  isLoading.value = true;
  
  try {
    await authStore.getProfile();
    
    profile.value = {
      name: authStore.user?.name || '',
      email: authStore.user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  } catch (error) {
    console.error('❌ Erro ao carregar perfil:', error);
    errorMessage.value = 'Erro ao carregar dados do perfil';
  } finally {
    isLoading.value = false;
  }
});

// Habilita edição
const enableEditing = () => {
  isEditing.value = true;
  successMessage.value = '';
  errorMessage.value = '';
};

// Cancela edição
const cancelEditing = () => {
  isEditing.value = false;
  
  // Restaura dados originais
  profile.value = {
    name: authStore.user?.name || '',
    email: authStore.user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
};

// Salva alterações
const saveProfile = async () => {
  // Validação básica
  if (!profile.value.name.trim()) {
    errorMessage.value = 'Nome é obrigatório';
    return;
  }
  
  // Validação de senha (apenas se estiver alterando)
  if (profile.value.newPassword) {
    if (profile.value.newPassword.length < 6) {
      errorMessage.value = 'A nova senha deve ter pelo menos 6 caracteres';
      return;
    }
    
    if (profile.value.newPassword !== profile.value.confirmPassword) {
      errorMessage.value = 'As senhas não coincidem';
      return;
    }
    
    if (!profile.value.currentPassword) {
      errorMessage.value = 'Senha atual é obrigatória para alterar a senha';
      return;
    }
  }
  
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    // Simulação de atualização (em um caso real, chamaria a API)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Atualiza apenas o nome no store (em um caso real, atualizaria no backend)
    authStore.user.name = profile.value.name;
    localStorage.setItem('user', JSON.stringify(authStore.user));
    
    successMessage.value = 'Perfil atualizado com sucesso';
    isEditing.value = false;
    
    // Limpa campos de senha
    profile.value.currentPassword = '';
    profile.value.newPassword = '';
    profile.value.confirmPassword = '';
  } catch (error) {
    console.error('❌ Erro ao atualizar perfil:', error);
    errorMessage.value = 'Erro ao atualizar perfil';
  } finally {
    isLoading.value = false;
  }
};

// Funções para formatar labels
const getRoleLabel = (role) => {
  const roles = {
    owner: 'Proprietário',
    admin: 'Administrador',
    manager: 'Gerente',
    employee: 'Funcionário'
  };
  return roles[role] || role;
};

const getDepartmentLabel = (department) => {
  const departments = {
    financeiro: 'Financeiro',
    estoque: 'Estoque',
    rh: 'Recursos Humanos',
    ti: 'Tecnologia da Informação',
    vendas: 'Vendas',
    marketing: 'Marketing',
    juridico: 'Jurídico',
    geral: 'Geral'
  };
  return departments[department] || department;
};
</script>

<template>
  <div>
    <h1 class="page-title">Meu Perfil</h1>
    
    <!-- Carregando -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
    </div>
    
    <!-- Perfil -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Informações do perfil -->
      <div class="md:col-span-2">
        <div class="card">
          <div class="flex justify-between items-center mb-6">
            <h2 class="section-title mb-0">Informações Pessoais</h2>
            
            <div v-if="!isEditing">
              <button @click="enableEditing" class="btn btn-outline flex items-center">
                <span class="material-icons mr-1">edit</span>
                Editar
              </button>
            </div>
          </div>
          
          <!-- Mensagens -->
          <div v-if="successMessage" class="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <span class="material-icons text-green-500">check_circle</span>
              </div>
              <div class="ml-3">
                <p class="text-sm text-green-700">{{ successMessage }}</p>
              </div>
            </div>
          </div>
          
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
          
          <!-- Formulário -->
          <form @submit.prevent="saveProfile" class="space-y-6">
            <!-- Nome -->
            <div>
              <label for="name" class="form-label">Nome</label>
              <input
                id="name"
                v-model="profile.name"
                type="text"
                :disabled="!isEditing"
                class="form-input"
              />
            </div>
            
            <!-- Email -->
            <div>
              <label for="email" class="form-label">Email</label>
              <input
                id="email"
                v-model="profile.email"
                type="email"
                disabled
                class="form-input bg-gray-50"
              />
              <p class="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
            </div>
            
            <!-- Campos de senha (apenas em modo de edição) -->
            <div v-if="isEditing" class="border-t border-gray-200 pt-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Alterar Senha</h3>
              
              <!-- Senha atual -->
              <div class="mb-4">
                <label for="current-password" class="form-label">Senha Atual</label>
                <input
                  id="current-password"
                  v-model="profile.currentPassword"
                  type="password"
                  class="form-input"
                  placeholder="Digite sua senha atual"
                />
              </div>
              
              <!-- Nova senha -->
              <div class="mb-4">
                <label for="new-password" class="form-label">Nova Senha</label>
                <input
                  id="new-password"
                  v-model="profile.newPassword"
                  type="password"
                  class="form-input"
                  placeholder="Digite a nova senha"
                />
                <p class="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
              </div>
              
              <!-- Confirmar nova senha -->
              <div>
                <label for="confirm-password" class="form-label">Confirmar Nova Senha</label>
                <input
                  id="confirm-password"
                  v-model="profile.confirmPassword"
                  type="password"
                  class="form-input"
                  placeholder="Confirme a nova senha"
                />
              </div>
            </div>
            
            <!-- Botões (apenas em modo de edição) -->
            <div v-if="isEditing" class="flex justify-end space-x-3">
              <button
                type="button"
                @click="cancelEditing"
                class="btn btn-outline"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                :disabled="isLoading"
                class="btn btn-primary"
              >
                <span v-if="isLoading" class="animate-spin mr-2">
                  <span class="material-icons text-sm">refresh</span>
                </span>
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Card de perfil -->
      <div>
        <div class="card text-center">
          <div class="w-24 h-24 rounded-full bg-primary-600 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-4">
            {{ profile.name.charAt(0).toUpperCase() }}
          </div>
          
          <h3 class="text-xl font-semibold">{{ profile.name }}</h3>
          <p class="text-gray-600">{{ profile.email }}</p>
          
          <div class="mt-4 pt-4 border-t border-gray-200 space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Cargo:</span>
              <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                {{ getRoleLabel(authStore.user?.role) }}
              </span>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Departamento:</span>
              <span class="text-sm font-medium">
                {{ getDepartmentLabel(authStore.user?.department) }}
              </span>
            </div>
            
            <div v-if="authStore.user?.company" class="pt-3 border-t border-gray-100">
              <div class="text-left">
                <h4 class="text-sm font-medium text-gray-900 mb-2">Empresa</h4>
                <div class="space-y-1 text-sm text-gray-600">
                  <div class="flex items-center">
                    <span class="material-icons text-sm mr-2">business</span>
                    {{ authStore.user.company.name }}
                  </div>
                  <div v-if="authStore.user.company.email" class="flex items-center">
                    <span class="material-icons text-sm mr-2">email</span>
                    {{ authStore.user.company.email }}
                  </div>
                  <div v-if="authStore.user.company.phone" class="flex items-center">
                    <span class="material-icons text-sm mr-2">phone</span>
                    {{ authStore.user.company.phone }}
                  </div>
                  <div v-if="authStore.user.company.address" class="flex items-start">
                    <span class="material-icons text-sm mr-2 mt-0.5">location_on</span>
                    <span class="break-words">{{ authStore.user.company.address }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>