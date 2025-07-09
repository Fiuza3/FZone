<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useHRStore } from '../../stores/hr';
import { useNotificationStore } from '../../stores/notification';

const router = useRouter();
const route = useRoute();
const hrStore = useHRStore();
const notificationStore = useNotificationStore();

// Estado do formulário
const employee = ref({
  name: '',
  email: '',
  phone: '',
  position: '',
  department: 'ti',
  salary: 0,
  hireDate: new Date().toISOString().split('T')[0],
  status: 'ativo',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: ''
  },
  documents: {
    cpf: '',
    rg: ''
  },
  emergencyContact: {
    name: '',
    phone: '',
    relationship: ''
  }
});

const isLoading = ref(false);
const isEditing = computed(() => !!route.params.id);
const errorMessage = ref('');

// Opções de departamento
const departmentOptions = [
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'estoque', label: 'Estoque' },
  { value: 'vendas', label: 'Vendas' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'rh', label: 'RH' },
  { value: 'ti', label: 'TI' }
];

// Opções de status
const statusOptions = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
  { value: 'ferias', label: 'Férias' },
  { value: 'licenca', label: 'Licença' }
];

// Opções de relacionamento
const relationshipOptions = [
  { value: 'conjuge', label: 'Cônjuge' },
  { value: 'pai', label: 'Pai' },
  { value: 'mae', label: 'Mãe' },
  { value: 'filho', label: 'Filho(a)' },
  { value: 'irmao', label: 'Irmão/Irmã' },
  { value: 'outro', label: 'Outro' }
];

// Carrega dados do funcionário se estiver editando
onMounted(async () => {
  if (isEditing.value) {
    isLoading.value = true;
    
    try {
      // Em um caso real, buscaríamos o funcionário específico
      // Aqui vamos simular encontrando no store
      await hrStore.fetchEmployees();
      const existingEmployee = hrStore.employees.find(e => e._id === route.params.id);
      
      if (existingEmployee) {
        employee.value = { ...existingEmployee };
        
        // Garante que a data esteja no formato correto
        if (employee.value.hireDate) {
          employee.value.hireDate = new Date(employee.value.hireDate).toISOString().split('T')[0];
        }
      } else {
        errorMessage.value = 'Funcionário não encontrado';
      }
    } catch (error) {
      console.error('❌ Erro ao carregar funcionário:', error);
      errorMessage.value = 'Erro ao carregar dados do funcionário';
    } finally {
      isLoading.value = false;
    }
  }
});

// Formata CPF
const formatCPF = (value) => {
  if (!value) return '';
  
  // Remove caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const cpf = numbers.substring(0, 11);
  
  // Formata como XXX.XXX.XXX-XX
  if (cpf.length <= 3) {
    return cpf;
  } else if (cpf.length <= 6) {
    return `${cpf.substring(0, 3)}.${cpf.substring(3)}`;
  } else if (cpf.length <= 9) {
    return `${cpf.substring(0, 3)}.${cpf.substring(3, 6)}.${cpf.substring(6)}`;
  } else {
    return `${cpf.substring(0, 3)}.${cpf.substring(3, 6)}.${cpf.substring(6, 9)}-${cpf.substring(9)}`;
  }
};

// Atualiza CPF formatado
const updateCPF = (event) => {
  employee.value.documents.cpf = formatCPF(event.target.value);
};

// Salva o funcionário
const saveEmployee = async () => {
  if (!employee.value.name.trim()) {
    errorMessage.value = 'O nome do funcionário é obrigatório';
    return;
  }
  
  if (!employee.value.email.trim()) {
    errorMessage.value = 'O email do funcionário é obrigatório';
    return;
  }
  
  if (!employee.value.documents.cpf.trim() || employee.value.documents.cpf.replace(/\D/g, '').length !== 11) {
    errorMessage.value = 'CPF inválido';
    return;
  }
  
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    if (isEditing.value) {
      await hrStore.updateEmployee(route.params.id, employee.value);
      console.log('✅ Funcionário atualizado com sucesso');
      notificationStore.addHRNotification({
        id: route.params.id,
        name: employee.value.name
      }, 'atualizado');
    } else {
      await hrStore.createEmployee(employee.value);
      console.log('✅ Funcionário cadastrado com sucesso');
      notificationStore.addHRNotification({
        id: Math.random().toString(36).substring(2),
        name: employee.value.name
      }, 'adicionado');
    }
    
    // Redireciona para a lista de funcionários
    router.push('/hr');
  } catch (error) {
    console.error('❌ Erro ao salvar funcionário:', error);
    errorMessage.value = error.response?.data?.error || 'Erro ao salvar funcionário';
  } finally {
    isLoading.value = false;
  }
};

// Cancela e volta para a lista
const cancelForm = () => {
  router.push('/hr');
};
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title">{{ isEditing ? 'Editar Funcionário' : 'Novo Funcionário' }}</h1>
    </div>
    
    <!-- Formulário -->
    <div class="card">
      <!-- Carregando -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
      
      <!-- Formulário -->
      <form v-else @submit.prevent="saveEmployee" class="space-y-6">
        <!-- Mensagem de erro -->
        <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-500 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <span class="material-icons text-red-500">error</span>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ errorMessage }}</p>
            </div>
          </div>
        </div>
        
        <!-- Informações básicas -->
        <div>
          <h2 class="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h2>
          
          <!-- Nome -->
          <div class="mb-4">
            <label for="name" class="form-label">Nome completo <span class="text-red-500">*</span></label>
            <input
              id="name"
              v-model="employee.name"
              type="text"
              required
              class="form-input"
              placeholder="Nome completo do funcionário"
            />
          </div>
          
          <!-- Email e Telefone -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label for="email" class="form-label">Email <span class="text-red-500">*</span></label>
              <input
                id="email"
                v-model="employee.email"
                type="email"
                required
                class="form-input"
                placeholder="email@exemplo.com"
              />
            </div>
            
            <div>
              <label for="phone" class="form-label">Telefone <span class="text-red-500">*</span></label>
              <input
                id="phone"
                v-model="employee.phone"
                type="tel"
                required
                class="form-input"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
          
          <!-- Cargo, Departamento e Status -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label for="position" class="form-label">Cargo <span class="text-red-500">*</span></label>
              <input
                id="position"
                v-model="employee.position"
                type="text"
                required
                class="form-input"
                placeholder="Cargo do funcionário"
              />
            </div>
            
            <div>
              <label for="department" class="form-label">Departamento</label>
              <select
                id="department"
                v-model="employee.department"
                class="form-input"
              >
                <option v-for="option in departmentOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
            
            <div>
              <label for="status" class="form-label">Status</label>
              <select
                id="status"
                v-model="employee.status"
                class="form-input"
              >
                <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Informações de contratação -->
        <div>
          <h2 class="text-lg font-medium text-gray-900 mb-4">Informações de Contratação</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Data de contratação -->
            <div>
              <label for="hire-date" class="form-label">Data de contratação <span class="text-red-500">*</span></label>
              <input
                id="hire-date"
                v-model="employee.hireDate"
                type="date"
                required
                class="form-input"
              />
            </div>
            
            <!-- Salário -->
            <div>
              <label for="salary" class="form-label">Salário <span class="text-red-500">*</span></label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-gray-500">R$</span>
                </div>
                <input
                  id="salary"
                  v-model.number="employee.salary"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  class="form-input pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Documentos -->
        <div>
          <h2 class="text-lg font-medium text-gray-900 mb-4">Documentos</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- CPF -->
            <div>
              <label for="cpf" class="form-label">CPF <span class="text-red-500">*</span></label>
              <input
                id="cpf"
                :value="employee.documents.cpf"
                @input="updateCPF"
                type="text"
                required
                class="form-input"
                placeholder="000.000.000-00"
              />
            </div>
            
            <!-- RG -->
            <div>
              <label for="rg" class="form-label">RG</label>
              <input
                id="rg"
                v-model="employee.documents.rg"
                type="text"
                class="form-input"
                placeholder="00.000.000-0"
              />
            </div>
          </div>
        </div>
        
        <!-- Endereço -->
        <div>
          <h2 class="text-lg font-medium text-gray-900 mb-4">Endereço</h2>
          
          <!-- Rua -->
          <div class="mb-4">
            <label for="street" class="form-label">Rua</label>
            <input
              id="street"
              v-model="employee.address.street"
              type="text"
              class="form-input"
              placeholder="Rua, número e complemento"
            />
          </div>
          
          <!-- Cidade, Estado e CEP -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label for="city" class="form-label">Cidade</label>
              <input
                id="city"
                v-model="employee.address.city"
                type="text"
                class="form-input"
                placeholder="Cidade"
              />
            </div>
            
            <div>
              <label for="state" class="form-label">Estado</label>
              <input
                id="state"
                v-model="employee.address.state"
                type="text"
                class="form-input"
                placeholder="Estado"
              />
            </div>
            
            <div>
              <label for="zip-code" class="form-label">CEP</label>
              <input
                id="zip-code"
                v-model="employee.address.zipCode"
                type="text"
                class="form-input"
                placeholder="00000-000"
              />
            </div>
          </div>
        </div>
        
        <!-- Contato de emergência -->
        <div>
          <h2 class="text-lg font-medium text-gray-900 mb-4">Contato de Emergência</h2>
          
          <!-- Nome -->
          <div class="mb-4">
            <label for="emergency-name" class="form-label">Nome</label>
            <input
              id="emergency-name"
              v-model="employee.emergencyContact.name"
              type="text"
              class="form-input"
              placeholder="Nome do contato de emergência"
            />
          </div>
          
          <!-- Telefone e Relacionamento -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="emergency-phone" class="form-label">Telefone</label>
              <input
                id="emergency-phone"
                v-model="employee.emergencyContact.phone"
                type="tel"
                class="form-input"
                placeholder="(00) 00000-0000"
              />
            </div>
            
            <div>
              <label for="emergency-relationship" class="form-label">Relacionamento</label>
              <select
                id="emergency-relationship"
                v-model="employee.emergencyContact.relationship"
                class="form-input"
              >
                <option value="">Selecione...</option>
                <option v-for="option in relationshipOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Botões de ação -->
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="cancelForm"
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
            {{ isEditing ? 'Atualizar' : 'Cadastrar' }} Funcionário
          </button>
        </div>
      </form>
    </div>
  </div>
</template>