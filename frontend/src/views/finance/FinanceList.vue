<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFinanceStore } from '../../stores/finance';

const router = useRouter();
const financeStore = useFinanceStore();

// Estado
const isLoading = ref(true);
const filters = ref({
  type: '',
  category: '',
  startDate: '',
  endDate: '',
  status: ''
});
const showDeleteModal = ref(false);
const transactionToDelete = ref(null);

// Opções de filtro
const typeOptions = [
  { value: '', label: 'Todos os tipos' },
  { value: 'receita', label: 'Receita' },
  { value: 'despesa', label: 'Despesa' }
];

const categoryOptions = [
  { value: '', label: 'Todas as categorias' },
  { value: 'vendas', label: 'Vendas' },
  { value: 'compras', label: 'Compras' },
  { value: 'salarios', label: 'Salários' },
  { value: 'aluguel', label: 'Aluguel' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'outros', label: 'Outros' }
];

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'pago', label: 'Pago' },
  { value: 'cancelado', label: 'Cancelado' }
];

// Carrega transações
const loadTransactions = async () => {
  console.log('🔄 Carregando transações');
  isLoading.value = true;
  
  try {
    await financeStore.fetchTransactions(filters.value);
    console.log(`✅ ${financeStore.transactions.length} transações carregadas`);
  } catch (error) {
    console.error('❌ Erro ao carregar transações:', error);
  } finally {
    isLoading.value = false;
  }
};

// Aplica filtros
const applyFilters = () => {
  loadTransactions();
};

// Limpa filtros
const clearFilters = () => {
  filters.value = {
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    status: ''
  };
  loadTransactions();
};

// Navega para criar nova transação
const goToNewTransaction = () => {
  router.push('/finance/new');
};

// Navega para editar transação
const editTransaction = (transactionId) => {
  router.push(`/finance/${transactionId}/edit`);
};

// Navega para relatório financeiro
const goToReport = () => {
  router.push('/finance/report');
};

// Navega para projeção financeira
const goToProjection = () => {
  router.push('/finance/projection');
};

// Confirma exclusão de transação
const confirmDelete = (transaction) => {
  transactionToDelete.value = transaction;
  showDeleteModal.value = true;
};

// Deleta transação
const deleteTransaction = async () => {
  if (!transactionToDelete.value) return;
  
  console.log('🗑️ Deletando transação:', transactionToDelete.value._id);
  isLoading.value = true;
  
  try {
    await financeStore.deleteTransaction(transactionToDelete.value._id);
    showDeleteModal.value = false;
    transactionToDelete.value = null;
  } catch (error) {
    console.error('❌ Erro ao deletar transação:', error);
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

// Carrega transações ao montar o componente
onMounted(loadTransactions);
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title">Gerenciamento Financeiro</h1>
      <div class="flex space-x-2">
        <button @click="goToProjection" class="btn btn-outline flex items-center">
          <span class="material-icons mr-1">trending_up</span>
          Projeção
        </button>
        <button @click="goToReport" class="btn btn-outline flex items-center">
          <span class="material-icons mr-1">assessment</span>
          Relatório
        </button>
        <button @click="goToNewTransaction" class="btn btn-primary flex items-center">
          <span class="material-icons mr-1">add</span>
          Nova Transação
        </button>
      </div>
    </div>
    
    <!-- Filtros -->
    <div class="card mb-6">
      <h2 class="text-lg font-semibold mb-4">Filtros</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <!-- Filtro de tipo -->
        <div>
          <label for="type-filter" class="form-label">Tipo</label>
          <select
            id="type-filter"
            v-model="filters.type"
            class="form-input"
          >
            <option v-for="option in typeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <!-- Filtro de categoria -->
        <div>
          <label for="category-filter" class="form-label">Categoria</label>
          <select
            id="category-filter"
            v-model="filters.category"
            class="form-input"
          >
            <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
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
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Data inicial -->
        <div>
          <label for="start-date" class="form-label">Data inicial</label>
          <input
            id="start-date"
            v-model="filters.startDate"
            type="date"
            class="form-input"
          />
        </div>
        
        <!-- Data final -->
        <div>
          <label for="end-date" class="form-label">Data final</label>
          <input
            id="end-date"
            v-model="filters.endDate"
            type="date"
            class="form-input"
          />
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
    
    <!-- Lista de transações -->
    <div class="card">
      <!-- Carregando -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
      
      <!-- Sem transações -->
      <div v-else-if="financeStore.transactions.length === 0" class="text-center py-8">
        <span class="material-icons text-4xl text-gray-400">payments</span>
        <p class="text-gray-500 mt-2">Nenhuma transação encontrada</p>
        <button @click="goToNewTransaction" class="btn btn-primary mt-4">
          Registrar Nova Transação
        </button>
      </div>
      
      <!-- Tabela de transações -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
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
            <tr v-for="transaction in financeStore.transactions" :key="transaction._id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">{{ transaction.description }}</div>
                <div class="text-sm text-gray-500">{{ transaction.reference || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="[
                    'px-2 py-1 text-xs rounded-full',
                    transaction.type === 'receita' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ transaction.type === 'receita' ? 'Receita' : 'Despesa' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                  {{ transaction.category }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div 
                  :class="[
                    'font-medium',
                    transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'
                  ]"
                >
                  {{ formatCurrency(transaction.amount) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(transaction.date) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="[
                    'px-2 py-1 text-xs rounded-full',
                    transaction.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                    transaction.status === 'pago' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  ]"
                >
                  {{ transaction.status === 'pendente' ? 'Pendente' :
                     transaction.status === 'pago' ? 'Pago' : 'Cancelado' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <!-- Botão de editar -->
                  <button 
                    @click="editTransaction(transaction._id)" 
                    class="text-blue-600 hover:text-blue-900"
                    title="Editar transação"
                  >
                    <span class="material-icons">edit</span>
                  </button>
                  
                  <!-- Botão de excluir -->
                  <button 
                    @click="confirmDelete(transaction)" 
                    class="text-red-600 hover:text-red-900"
                    title="Excluir transação"
                  >
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Modal de confirmação de exclusão -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">Confirmar exclusão</h3>
        <p class="mb-6">
          Tem certeza que deseja excluir a transação "{{ transactionToDelete?.description }}"?
          Esta ação não pode ser desfeita.
        </p>
        <div class="flex justify-end space-x-2">
          <button @click="showDeleteModal = false" class="btn btn-outline">
            Cancelar
          </button>
          <button @click="deleteTransaction" class="btn btn-danger">
            Excluir
          </button>
        </div>
      </div>
    </div>
  </div>
</template>