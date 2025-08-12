<script setup>
import { ref } from 'vue';
import { useEmployeeStore } from '../../stores/employee';

const emit = defineEmits(['close', 'success']);

const employeeStore = useEmployeeStore();

const form = ref({
  email: '',
  role: 'employee',
  department: 'geral'
});

const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const inviteLink = ref('');

const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'manager', label: 'Gerente' },
  { value: 'employee', label: 'Funcionário' }
];

const departmentOptions = [
  { value: 'geral', label: 'Geral' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'estoque', label: 'Estoque' },
  { value: 'rh', label: 'Recursos Humanos' },
  { value: 'ti', label: 'Tecnologia da Informação' },
  { value: 'vendas', label: 'Vendas' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'juridico', label: 'Jurídico' }
];

const sendInvite = async () => {
  if (!form.value.email.trim()) {
    errorMessage.value = 'Email é obrigatório';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const response = await employeeStore.inviteEmployee(form.value);
    
    successMessage.value = 'Convite enviado com sucesso!';
    inviteLink.value = response.invitation.inviteLink;
    
    // Reset form
    form.value = {
      email: '',
      role: 'employee', 
      department: 'geral'
    };
    
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Erro ao enviar convite';
  } finally {
    isLoading.value = false;
  }
};

const copyLink = () => {
  navigator.clipboard.writeText(inviteLink.value);
  alert('Link copiado para a área de transferência!');
};

const close = () => {
  emit('close');
};
</script>

<template>
  <div>
    <!-- Mensagem de Sucesso -->
    <v-alert
      v-if="successMessage"
      type="success"
      variant="tonal"
      class="mb-4"
      closable
      @click:close="close"
    >
      <div>
        <div class="font-weight-medium mb-2">{{ successMessage }}</div>
        <div class="text-body-2 mb-3">Compartilhe o link abaixo com o funcionário:</div>
        
        <v-card variant="outlined" class="mb-3">
          <v-card-text class="pa-3">
            <div class="text-body-2 text-break">{{ inviteLink }}</div>
          </v-card-text>
        </v-card>
        
        <v-btn
          @click="copyLink"
          size="small"
          variant="outlined"
          prepend-icon="mdi-content-copy"
        >
          Copiar Link
        </v-btn>
      </div>
    </v-alert>

    <!-- Formulário -->
    <v-form v-else @submit.prevent="sendInvite">
      <!-- Mensagem de Erro -->
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

      <!-- Email -->
      <v-text-field
        v-model="form.email"
        label="Email"
        type="email"
        variant="outlined"
        density="compact"
        required
        class="mb-4"
        prepend-inner-icon="mdi-email"
        placeholder="email@exemplo.com"
      ></v-text-field>

      <!-- Cargo -->
      <v-select
        v-model="form.role"
        :items="roleOptions"
        item-title="label"
        item-value="value"
        label="Cargo"
        variant="outlined"
        density="compact"
        class="mb-4"
        prepend-inner-icon="mdi-briefcase"
      ></v-select>

      <!-- Departamento -->
      <v-select
        v-model="form.department"
        :items="departmentOptions"
        item-title="label"
        item-value="value"
        label="Departamento"
        variant="outlined"
        density="compact"
        class="mb-4"
        prepend-inner-icon="mdi-domain"
      ></v-select>

      <!-- Permissões Automáticas -->
      <v-card variant="tonal" color="info" class="mb-6">
        <v-card-title class="text-body-1">
          <v-icon class="me-2">mdi-shield-check</v-icon>
          Permissões que serão concedidas:
        </v-card-title>
        
        <v-card-text class="pt-0">
          <v-list density="compact">
            <v-list-item prepend-icon="mdi-check-circle" class="text-body-2">
              Tarefas (sempre)
            </v-list-item>
            <v-list-item 
              v-if="form.role === 'admin' || form.department === 'financeiro' || form.department === 'vendas'"
              prepend-icon="mdi-check-circle"
              class="text-body-2"
            >
              Financeiro
            </v-list-item>
            <v-list-item 
              v-if="form.role === 'admin' || form.department === 'estoque'"
              prepend-icon="mdi-check-circle"
              class="text-body-2"
            >
              Estoque
            </v-list-item>
            <v-list-item 
              v-if="form.role === 'admin' || form.department === 'rh'"
              prepend-icon="mdi-check-circle"
              class="text-body-2"
            >
              Recursos Humanos
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <!-- Botões -->
      <div class="d-flex justify-end ga-3">
        <v-btn
          @click="close"
          variant="outlined"
        >
          Cancelar
        </v-btn>
        
        <v-btn
          type="submit"
          :loading="isLoading"
          color="primary"
        >
          Enviar Convite
        </v-btn>
      </div>
    </v-form>
  </div>
</template>