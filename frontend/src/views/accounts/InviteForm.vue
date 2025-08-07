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
    <div v-if="successMessage" class="mb-4 p-4 bg-green-50 border-l-4 border-green-500">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-green-700 font-medium">{{ successMessage }}</p>
          <p class="text-sm text-green-600 mt-1">Compartilhe o link abaixo com o funcionário:</p>
          <div class="mt-2 p-2 bg-gray-100 rounded text-sm break-all">
            {{ inviteLink }}
          </div>
          <button @click="copyLink" class="mt-2 text-sm text-green-600 hover:text-green-800">
            📋 Copiar Link
          </button>
        </div>
        <button @click="close" class="text-green-400 hover:text-green-600">
          <span class="material-icons">close</span>
        </button>
      </div>
    </div>

    <!-- Formulário -->
    <form v-else @submit.prevent="sendInvite" class="space-y-4">
      <!-- Mensagem de Erro -->
      <div v-if="errorMessage" class="p-4 bg-red-50 border-l-4 border-red-500">
        <p class="text-red-700">{{ errorMessage }}</p>
      </div>

      <!-- Email -->
      <div>
        <label for="email" class="form-label">Email <span class="text-red-500">*</span></label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          class="form-input"
          placeholder="email@exemplo.com"
        />
      </div>

      <!-- Cargo -->
      <div>
        <label for="role" class="form-label">Cargo</label>
        <select id="role" v-model="form.role" class="form-input">
          <option v-for="option in roleOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Departamento -->
      <div>
        <label for="department" class="form-label">Departamento</label>
        <select id="department" v-model="form.department" class="form-input">
          <option v-for="option in departmentOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Permissões Automáticas -->
      <div class="p-3 bg-blue-50 rounded">
        <h4 class="text-sm font-medium text-blue-800 mb-2">Permissões que serão concedidas:</h4>
        <ul class="text-xs text-blue-700 space-y-1">
          <li>✅ Tarefas (sempre)</li>
          <li v-if="form.role === 'admin' || form.department === 'financeiro' || form.department === 'vendas'">✅ Financeiro</li>
          <li v-if="form.role === 'admin' || form.department === 'estoque'">✅ Estoque</li>
          <li v-if="form.role === 'admin' || form.department === 'rh'">✅ Recursos Humanos</li>
        </ul>
      </div>

      <!-- Botões -->
      <div class="flex justify-end space-x-3">
        <button type="button" @click="close" class="btn btn-outline">
          Cancelar
        </button>
        <button type="submit" :disabled="isLoading" class="btn btn-primary">
          <span v-if="isLoading" class="animate-spin mr-2">
            <span class="material-icons text-sm">refresh</span>
          </span>
          Enviar Convite
        </button>
      </div>
    </form>
  </div>
</template>