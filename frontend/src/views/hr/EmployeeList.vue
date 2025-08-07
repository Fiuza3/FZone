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
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col>
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Gerenciamento de Pessoas</h1>
          </div>
          <div class="d-flex ga-2">
            <v-btn
              @click="goToPayrollReport"
              variant="outlined"
              prepend-icon="mdi-chart-line"
              size="large"
            >
              Folha de Pagamento
            </v-btn>
            <v-btn
              @click="goToNewEmployee"
              color="primary"
              prepend-icon="mdi-account-plus"
              size="large"
            >
              Novo Funcionário
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
    
    <!-- Filtros -->
    <v-card class="mb-6" elevation="4">
      <v-card-title class="d-flex align-center bg-grey-lighten-5">
        <v-icon class="me-2" color="primary">mdi-filter</v-icon>
        Filtros
      </v-card-title>
      
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="filters.department"
              :items="departmentOptions"
              item-title="label"
              item-value="value"
              label="Departamento"
              variant="outlined"
              density="compact"
            ></v-select>
          </v-col>
          
          <v-col cols="12" md="4">
            <v-select
              v-model="filters.status"
              :items="statusOptions"
              item-title="label"
              item-value="value"
              label="Status"
              variant="outlined"
              density="compact"
            ></v-select>
          </v-col>
          
          <v-col cols="12" md="4" class="d-flex align-end ga-2">
            <v-btn
              @click="applyFilters"
              color="primary"
              prepend-icon="mdi-magnify"
              variant="outlined"
            >
              Filtrar
            </v-btn>
            <v-btn
              @click="clearFilters"
              variant="outlined"
              prepend-icon="mdi-filter-remove"
            >
              Limpar
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    
    <!-- Lista de funcionários -->
    <v-card elevation="4">
      <!-- Loading -->
      <v-row v-if="isLoading" justify="center">
        <v-col cols="auto" class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
          <p class="mt-4 text-h6">Carregando funcionários...</p>
        </v-col>
      </v-row>
      
      <!-- Sem funcionários -->
      <v-card-text v-else-if="hrStore.employees.length === 0">
        <v-empty-state
          icon="mdi-account-group-outline"
          title="Nenhum funcionário encontrado"
          text="Comece cadastrando seu primeiro funcionário"
        >
          <template v-slot:actions>
            <v-btn @click="goToNewEmployee" color="primary">
              Cadastrar Novo Funcionário
            </v-btn>
          </template>
        </v-empty-state>
      </v-card-text>
      
      <!-- Tabela de funcionários -->
      <v-data-table
        v-else
        :items="hrStore.employees"
        :headers="[
          { title: 'Funcionário', key: 'name' },
          { title: 'Cargo', key: 'position' },
          { title: 'Departamento', key: 'department' },
          { title: 'Salário', key: 'salary' },
          { title: 'Status', key: 'status' },
          { title: 'Ações', key: 'actions', sortable: false }
        ]"
        class="elevation-0"
        :items-per-page="10"
      >
        <template v-slot:item.name="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar color="primary" class="me-3" size="40">
              <span class="font-weight-bold">{{ item.name.charAt(0).toUpperCase() }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.name }}</div>
              <div class="text-caption text-grey-darken-1">{{ item.email }}</div>
            </div>
          </div>
        </template>

        <template v-slot:item.position="{ item }">
          <div>
            <div class="font-weight-medium">{{ item.position }}</div>
            <div class="text-caption text-grey-darken-1">{{ item.yearsOfService }} anos</div>
          </div>
        </template>

        <template v-slot:item.department="{ item }">
          <v-chip size="small" variant="tonal">
            {{ item.department }}
          </v-chip>
        </template>

        <template v-slot:item.salary="{ item }">
          <span class="font-weight-bold text-success">
            {{ formatCurrency(item.salary) }}
          </span>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip
            :color="
              item.status === 'ativo' ? 'success' :
              item.status === 'inativo' ? 'error' :
              item.status === 'ferias' ? 'info' : 'warning'
            "
            size="small"
            variant="tonal"
          >
            {{ item.status === 'ativo' ? 'Ativo' :
               item.status === 'inativo' ? 'Inativo' :
               item.status === 'ferias' ? 'Férias' : 'Licença' }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex ga-1">
            <v-tooltip text="Editar funcionário">
              <template v-slot:activator="{ props }">
                <v-btn
                  @click="editEmployee(item._id)"
                  icon="mdi-pencil"
                  color="primary"
                  size="small"
                  variant="text"
                  v-bind="props"
                ></v-btn>
              </template>
            </v-tooltip>
            
            <v-tooltip text="Desativar funcionário" v-if="item.status === 'ativo'">
              <template v-slot:activator="{ props }">
                <v-btn
                  @click="confirmDeactivate(item)"
                  icon="mdi-account-off"
                  color="error"
                  size="small"
                  variant="text"
                  v-bind="props"
                ></v-btn>
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </v-card>
    
    <!-- Modal de confirmação de desativação -->
    <v-dialog v-model="showDeactivateModal" max-width="400">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="me-2" color="error">mdi-alert-circle</v-icon>
          Confirmar desativação
        </v-card-title>
        
        <v-card-text>
          Tem certeza que deseja desativar o funcionário "{{ employeeToDeactivate?.name }}"?
          O funcionário não poderá mais acessar o sistema.
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showDeactivateModal = false" variant="outlined">
            Cancelar
          </v-btn>
          <v-btn @click="deactivateEmployee" color="error">
            Desativar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>