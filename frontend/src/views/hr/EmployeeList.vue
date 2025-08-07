<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useHRStore } from '../../stores/hr';

const router = useRouter();
const hrStore = useHRStore();

// Estado
const isLoading = ref(true);
const filters = ref({
  department: '',
  status: ''
});
const showDeactivateModal = ref(false);
const employeeToDeactivate = ref(null);

// Opções de filtro
const departmentOptions = [
  { value: '', label: 'Todos os departamentos' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'estoque', label: 'Estoque' },
  { value: 'vendas', label: 'Vendas' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'rh', label: 'RH' },
  { value: 'ti', label: 'TI' }
];

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
  { value: 'ferias', label: 'Férias' },
  { value: 'licenca', label: 'Licença' }
];

// Carrega funcionários
const loadEmployees = async () => {
  console.log('🔄 Carregando funcionários');
  isLoading.value = true;
  
  try {
    await hrStore.fetchEmployees(filters.value);
    console.log(`✅ ${hrStore.employees.length} funcionários carregados`);
  } catch (error) {
    console.error('❌ Erro ao carregar funcionários:', error);
  } finally {
    isLoading.value = false;
  }
};

// Aplica filtros
const applyFilters = () => {
  loadEmployees();
};

// Limpa filtros
const clearFilters = () => {
  filters.value = {
    department: '',
    status: ''
  };
  loadEmployees();
};

// Navega para criar novo funcionário
const goToNewEmployee = () => {
  router.push('/hr/new');
};

// Navega para editar funcionário
const editEmployee = (employeeId) => {
  router.push(`/hr/${employeeId}/edit`);
};

// Navega para relatório de folha
const goToPayrollReport = () => {
  router.push('/hr/payroll');
};

// Confirma desativação de funcionário
const confirmDeactivate = (employee) => {
  employeeToDeactivate.value = employee;
  showDeactivateModal.value = true;
};

// Desativa funcionário
const deactivateEmployee = async () => {
  if (!employeeToDeactivate.value) return;
  
  console.log('🚫 Desativando funcionário:', employeeToDeactivate.value._id);
  isLoading.value = true;
  
  try {
    await hrStore.deactivateEmployee(employeeToDeactivate.value._id);
    showDeactivateModal.value = false;
    employeeToDeactivate.value = null;
  } catch (error) {
    console.error('❌ Erro ao desativar funcionário:', error);
  } finally {
    isLoading.value = false;
  }
};

// Formata moeda
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Formata data
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
};

// Carrega funcionários ao montar o componente
onMounted(loadEmployees);
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title">Gerenciamento de Pessoas</h1>
      <div class="flex space-x-2">
        <button @click="goToPayrollReport" class="btn btn-outline flex items-center">
          <span class="material-icons mr-1">assessment</span>
          Folha de Pagamento
        </button>
        <button @click="goToNewEmployee" class="btn btn-primary flex items-center">
          <span class="material-icons mr-1">add</span>
          Novo Funcionário
        </button>
      </div>
    </div>
    
    <!-- Filtros -->
    <div class="card mb-6">
      <h2 class="text-lg font-semibold mb-4">Filtros</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Filtro de departamento -->
        <div>
          <label for="department-filter" class="form-label">Departamento</label>
          <select
            id="department-filter"
            v-model="filters.department"
            class="form-input"
          >
            <option v-for="option in departmentOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <!-- Filtro de status -->
        <div>
          <label for="status-filter" class="form-label">Status</label>
          <select
            id="status-filter"
            v-model="filters.status"
            class="form-input"
          >
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <!-- Botões de ação -->
        <div class="flex items-end space-x-2">
          <button @click="applyFilters" class="btn btn-primary">
            <span class="material-icons mr-1">search</span>
            Filtrar
          </button>
          <button @click="clearFilters" class="btn btn-outline">
            <span class="material-icons mr-1">clear</span>
            Limpar
          </button>
        </div>
      </div>
    </div>
    
    <!-- Lista de funcionários -->
    <div class="card">
      <!-- Carregando -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
      
      <!-- Sem funcionários -->
      <div v-else-if="hrStore.employees.length === 0" class="text-center py-8">
        <span class="material-icons text-4xl text-gray-400">people</span>
        <p class="text-gray-500 mt-2">Nenhum funcionário encontrado</p>
        <button @click="goToNewEmployee" class="btn btn-primary mt-4">
          Cadastrar Novo Funcionário
        </button>
      </div>
      
      <!-- Tabela de funcionários -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Funcionário
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cargo
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Departamento
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Salário
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="employee in hrStore.employees" :key="employee._id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span class="text-gray-600 font-medium">{{ employee.name.charAt(0) }}</span>
                  </div>
                  <div class="ml-4">
                    <div class="font-medium text-gray-900">{{ employee.name }}</div>
                    <div class="text-sm text-gray-500">{{ employee.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ employee.position }}</div>
                <div class="text-xs text-gray-500">{{ employee.yearsOfService }} anos</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                  {{ employee.department }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ formatCurrency(employee.salary) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="[
                    'px-2 py-1 text-xs rounded-full',
                    employee.status === 'ativo' ? 'bg-green-100 text-green-800' :
                    employee.status === 'inativo' ? 'bg-red-100 text-red-800' :
                    employee.status === 'ferias' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  ]"
                >
                  {{ employee.status === 'ativo' ? 'Ativo' :
                     employee.status === 'inativo' ? 'Inativo' :
                     employee.status === 'ferias' ? 'Férias' : 'Licença' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <!-- Botão de editar -->
                  <button 
                    @click="editEmployee(employee._id)" 
                    class="text-blue-600 hover:text-blue-900"
                    title="Editar funcionário"
                  >
                    <span class="material-icons">edit</span>
                  </button>
                  
                  <!-- Botão de desativar (apenas para ativos) -->
                  <button 
                    v-if="employee.status === 'ativo'"
                    @click="confirmDeactivate(employee)" 
                    class="text-red-600 hover:text-red-900"
                    title="Desativar funcionário"
                  >
                    <span class="material-icons">person_off</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Modal de confirmação de desativação -->
    <div v-if="showDeactivateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">Confirmar desativação</h3>
        <p class="mb-6">
          Tem certeza que deseja desativar o funcionário "{{ employeeToDeactivate?.name }}"?
          O funcionário não poderá mais acessar o sistema.
        </p>
        <div class="flex justify-end space-x-2">
          <button @click="showDeactivateModal = false" class="btn btn-outline">
            Cancelar
          </button>
          <button @click="deactivateEmployee" class="btn btn-danger">
            Desativar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>