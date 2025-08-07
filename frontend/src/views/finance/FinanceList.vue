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
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col>
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Gerenciamento Financeiro</h1>
          </div>
          <div class="d-flex ga-2">
            <v-btn
              @click="goToProjection"
              variant="outlined"
              prepend-icon="mdi-trending-up"
              size="large"
            >
              Projeção
            </v-btn>
            <v-btn
              @click="goToReport"
              variant="outlined"
              prepend-icon="mdi-chart-line"
              size="large"
            >
              Relatório
            </v-btn>
            <v-btn
              @click="goToNewTransaction"
              color="primary"
              prepend-icon="mdi-plus"
              size="large"
            >
              Nova Transação
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
        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <v-select
              v-model="filters.type"
              :items="typeOptions"
              item-title="label"
              item-value="value"
              label="Tipo"
              variant="outlined"
              density="compact"
            ></v-select>
          </v-col>
          
          <v-col cols="12" md="4">
            <v-select
              v-model="filters.category"
              :items="categoryOptions"
              item-title="label"
              item-value="value"
              label="Categoria"
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
        </v-row>
        
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filters.startDate"
              type="date"
              label="Data inicial"
              variant="outlined"
              density="compact"
            ></v-text-field>
          </v-col>
          
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filters.endDate"
              type="date"
              label="Data final"
              variant="outlined"
              density="compact"
            ></v-text-field>
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
    
    <!-- Lista de transações -->
    <v-card elevation="4">
      <!-- Loading -->
      <v-row v-if="isLoading" justify="center">
        <v-col cols="auto" class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
          <p class="mt-4 text-h6">Carregando transações...</p>
        </v-col>
      </v-row>
      
      <!-- Sem transações -->
      <v-card-text v-else-if="financeStore.transactions.length === 0">
        <v-empty-state
          icon="mdi-credit-card-outline"
          title="Nenhuma transação encontrada"
          text="Comece registrando sua primeira transação financeira"
        >
          <template v-slot:actions>
            <v-btn @click="goToNewTransaction" color="primary">
              Registrar Nova Transação
            </v-btn>
          </template>
        </v-empty-state>
      </v-card-text>
      
      <!-- Tabela de transações -->
      <v-data-table
        v-else
        :items="financeStore.transactions"
        :headers="[
          { title: 'Descrição', key: 'description' },
          { title: 'Tipo', key: 'type' },
          { title: 'Categoria', key: 'category' },
          { title: 'Valor', key: 'amount' },
          { title: 'Data', key: 'date' },
          { title: 'Status', key: 'status' },
          { title: 'Ações', key: 'actions', sortable: false }
        ]"
        class="elevation-0"
        :items-per-page="10"
      >
        <template v-slot:item.description="{ item }">
          <div>
            <div class="font-weight-medium">{{ item.description }}</div>
            <div class="text-caption text-grey-darken-1">{{ item.reference || '-' }}</div>
          </div>
        </template>

        <template v-slot:item.type="{ item }">
          <v-chip
            :color="item.type === 'receita' ? 'success' : 'error'"
            size="small"
            variant="tonal"
          >
            {{ item.type === 'receita' ? 'Receita' : 'Despesa' }}
          </v-chip>
        </template>

        <template v-slot:item.category="{ item }">
          <v-chip size="small" variant="tonal">
            {{ item.category }}
          </v-chip>
        </template>

        <template v-slot:item.amount="{ item }">
          <span
            :class="[
              'font-weight-bold',
              item.type === 'receita' ? 'text-success' : 'text-error'
            ]"
          >
            {{ formatCurrency(item.amount) }}
          </span>
        </template>

        <template v-slot:item.date="{ item }">
          {{ formatDate(item.date) }}
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip
            :color="
              item.status === 'pendente' ? 'warning' :
              item.status === 'pago' ? 'success' : 'error'
            "
            size="small"
            variant="tonal"
          >
            {{ item.status === 'pendente' ? 'Pendente' :
               item.status === 'pago' ? 'Pago' : 'Cancelado' }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex ga-1">
            <v-tooltip text="Editar transação">
              <template v-slot:activator="{ props }">
                <v-btn
                  @click="editTransaction(item._id)"
                  icon="mdi-pencil"
                  color="primary"
                  size="small"
                  variant="text"
                  v-bind="props"
                ></v-btn>
              </template>
            </v-tooltip>
            
            <v-tooltip text="Excluir transação">
              <template v-slot:activator="{ props }">
                <v-btn
                  @click="confirmDelete(item)"
                  icon="mdi-delete"
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
    
    <!-- Modal de confirmação de exclusão -->
    <v-dialog v-model="showDeleteModal" max-width="400">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="me-2" color="error">mdi-alert-circle</v-icon>
          Confirmar exclusão
        </v-card-title>
        
        <v-card-text>
          Tem certeza que deseja excluir a transação "{{ transactionToDelete?.description }}"?
          Esta ação não pode ser desfeita.
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showDeleteModal = false" variant="outlined">
            Cancelar
          </v-btn>
          <v-btn @click="deleteTransaction" color="error">
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>