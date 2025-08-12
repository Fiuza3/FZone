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
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col>
        <h1 class="text-h4 font-weight-bold mb-2">Meu Perfil</h1>
      </v-col>
    </v-row>
    
    <!-- Loading -->
    <v-row v-if="isLoading" justify="center">
      <v-col cols="auto" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <p class="mt-4 text-h6">Carregando perfil...</p>
      </v-col>
    </v-row>
    
    <!-- Perfil -->
    <v-row v-else>
      <!-- Informações do perfil -->
      <v-col cols="12" md="8">
        <v-card elevation="4">
          <v-card-title class="d-flex justify-space-between align-center">
            <div class="d-flex align-center">
              <v-icon class="me-2" color="primary">mdi-account</v-icon>
              Informações Pessoais
            </div>
            
            <v-btn
              v-if="!isEditing"
              @click="enableEditing"
              variant="outlined"
              prepend-icon="mdi-pencil"
            >
              Editar
            </v-btn>
          </v-card-title>
          
          <v-card-text>
            <!-- Mensagens -->
            <v-alert
              v-if="successMessage"
              type="success"
              variant="tonal"
              class="mb-4"
              closable
              @click:close="successMessage = ''"
            >
              {{ successMessage }}
            </v-alert>
            
            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              class="mb-4"
              closable
              @click:close="errorMessage = ''"
            >
              {{ errorMessage }}
            </v-alert>
            
            <!-- Formulário -->
            <v-form @submit.prevent="saveProfile">
              <!-- Nome -->
              <v-text-field
                v-model="profile.name"
                label="Nome"
                variant="outlined"
                density="compact"
                :disabled="!isEditing"
                class="mb-4"
                prepend-inner-icon="mdi-account"
              ></v-text-field>
              
              <!-- Email -->
              <v-text-field
                v-model="profile.email"
                label="Email"
                type="email"
                variant="outlined"
                density="compact"
                disabled
                class="mb-4"
                prepend-inner-icon="mdi-email"
                hint="O email não pode ser alterado"
                persistent-hint
              ></v-text-field>
              
              <!-- Campos de senha (apenas em modo de edição) -->
              <v-card v-if="isEditing" class="mt-6" variant="outlined">
                <v-card-title class="d-flex align-center bg-grey-lighten-5">
                  <v-icon class="me-2" color="primary">mdi-lock</v-icon>
                  Alterar Senha
                </v-card-title>
                
                <v-card-text>
                  <!-- Senha atual -->
                  <v-text-field
                    v-model="profile.currentPassword"
                    label="Senha Atual"
                    type="password"
                    variant="outlined"
                    density="compact"
                    class="mb-4"
                    prepend-inner-icon="mdi-lock-outline"
                    placeholder="Digite sua senha atual"
                  ></v-text-field>
                  
                  <!-- Nova senha -->
                  <v-text-field
                    v-model="profile.newPassword"
                    label="Nova Senha"
                    type="password"
                    variant="outlined"
                    density="compact"
                    class="mb-4"
                    prepend-inner-icon="mdi-lock"
                    placeholder="Digite a nova senha"
                    hint="Mínimo de 6 caracteres"
                    persistent-hint
                  ></v-text-field>
                  
                  <!-- Confirmar nova senha -->
                  <v-text-field
                    v-model="profile.confirmPassword"
                    label="Confirmar Nova Senha"
                    type="password"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-lock-check"
                    placeholder="Confirme a nova senha"
                  ></v-text-field>
                </v-card-text>
              </v-card>
            </v-form>
          </v-card-text>
          
          <!-- Botões (apenas em modo de edição) -->
          <v-card-actions v-if="isEditing" class="pa-6">
            <v-spacer></v-spacer>
            <v-btn
              @click="cancelEditing"
              variant="outlined"
              class="me-3"
            >
              Cancelar
            </v-btn>
            
            <v-btn
              @click="saveProfile"
              :loading="isLoading"
              color="primary"
            >
              Salvar Alterações
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      
      <!-- Card de perfil -->
      <v-col cols="12" md="4">
        <v-card elevation="4" class="text-center">
          <v-card-text>
            <v-avatar
              color="primary"
              size="96"
              class="mb-4"
            >
              <span class="text-h4 font-weight-bold text-white">
                {{ profile.name.charAt(0).toUpperCase() }}
              </span>
            </v-avatar>
            
            <h3 class="text-h5 font-weight-medium mb-2">{{ profile.name }}</h3>
            <p class="text-grey-darken-1 mb-4">{{ profile.email }}</p>
            
            <v-divider class="mb-4"></v-divider>
            
            <div class="text-left">
              <div class="d-flex justify-space-between align-center mb-3">
                <span class="text-grey-darken-1">Cargo:</span>
                <v-chip
                  :color="
                    authStore.user?.role === 'owner' ? 'purple' :
                    authStore.user?.role === 'admin' ? 'primary' :
                    authStore.user?.role === 'manager' ? 'info' : 'grey'
                  "
                  size="small"
                  variant="tonal"
                >
                  {{ getRoleLabel(authStore.user?.role) }}
                </v-chip>
              </div>
              
              <div class="d-flex justify-space-between align-center mb-3">
                <span class="text-grey-darken-1">Departamento:</span>
                <span class="font-weight-medium">
                  {{ getDepartmentLabel(authStore.user?.department) }}
                </span>
              </div>
              
              <v-card v-if="authStore.user?.company" class="mt-4" variant="outlined">
                <v-card-title class="text-body-1 font-weight-medium">
                  <v-icon class="me-2">mdi-domain</v-icon>
                  Empresa
                </v-card-title>
                
                <v-card-text class="pt-0">
                  <div class="d-flex align-center mb-2">
                    <v-icon size="small" class="me-2">mdi-office-building</v-icon>
                    <span class="text-body-2">{{ authStore.user.company.name }}</span>
                  </div>
                  
                  <div v-if="authStore.user.company.email" class="d-flex align-center mb-2">
                    <v-icon size="small" class="me-2">mdi-email</v-icon>
                    <span class="text-body-2">{{ authStore.user.company.email }}</span>
                  </div>
                  
                  <div v-if="authStore.user.company.phone" class="d-flex align-center mb-2">
                    <v-icon size="small" class="me-2">mdi-phone</v-icon>
                    <span class="text-body-2">{{ authStore.user.company.phone }}</span>
                  </div>
                  
                  <div v-if="authStore.user.company.address" class="d-flex align-start">
                    <v-icon size="small" class="me-2 mt-1">mdi-map-marker</v-icon>
                    <span class="text-body-2">{{ authStore.user.company.address }}</span>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>