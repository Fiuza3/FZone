<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useTaskStore } from '../stores/task';
import { useStockStore } from '../stores/stock';
import { useFinanceStore } from '../stores/finance';
import { useHRStore } from '../stores/hr';

// Stores
const authStore = useAuthStore();
const taskStore = useTaskStore();
const stockStore = useStockStore();
const financeStore = useFinanceStore();
const hrStore = useHRStore();

// Estado
const isLoading = ref(true);
const loadingMessage = ref('Carregando dados...');

// Permissões do usuário
const isAdmin = computed(() => authStore.isAdmin);
const isManager = computed(() => authStore.isManager);
const userDepartment = computed(() => authStore.userDepartment);

// Acesso aos módulos
const hasStockAccess = computed(() => isAdmin.value || userDepartment.value === 'estoque');
const hasFinanceAccess = computed(() => isAdmin.value || userDepartment.value === 'financeiro');
const hasHRAccess = computed(() => isAdmin.value || userDepartment.value === 'rh');

// Carrega dados do dashboard
onMounted(async () => {
  console.log('🔄 Carregando dados do dashboard');
  
  try {
    // Carrega tarefas (todos têm acesso)
    loadingMessage.value = 'Carregando tarefas...';
    await taskStore.fetchTasks();
    
    // Carrega dados de estoque se tiver acesso
    if (hasStockAccess.value) {
      loadingMessage.value = 'Carregando dados de estoque...';
      await stockStore.fetchProducts({ lowStock: true });
    }
    
    // Carrega dados financeiros se tiver acesso
    if (hasFinanceAccess.value) {
      loadingMessage.value = 'Carregando dados financeiros...';
      await financeStore.getBalance();
    }
    
    // Carrega dados de RH se tiver acesso
    if (hasHRAccess.value) {
      loadingMessage.value = 'Carregando dados de RH...';
      await hrStore.fetchEmployees();
    }
    
    console.log('✅ Dados do dashboard carregados com sucesso');
  } catch (error) {
    console.error('❌ Erro ao carregar dados do dashboard:', error);
  } finally {
    isLoading.value = false;
  }
});

// Formatação de valores monetários
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};
</script>

<template>
  <div>
    <!-- Tela de carregamento -->
    <div v-if="isLoading" class="flex items-center justify-center h-64">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">{{ loadingMessage }}</p>
      </div>
    </div>
    
    <!-- Conteúdo do dashboard -->
    <div v-else>
      <h1 class="page-title">Dashboard</h1>
      
      <!-- Boas-vindas -->
      <div class="card mb-6">
        <h2 class="text-xl font-semibold">Bem-vindo, {{ authStore.userName }}!</h2>
        <p class="text-gray-600 mt-2">
          Este é o seu painel de controle do ERP. Aqui você pode visualizar informações importantes
          sobre sua empresa e acessar rapidamente as principais funcionalidades.
        </p>
      </div>
      
      <!-- Cards de resumo -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <!-- Tarefas pendentes -->
        <div class="card bg-blue-50 border-l-4 border-blue-500">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-semibold text-blue-700">Tarefas Pendentes</h3>
              <p class="text-2xl font-bold">{{ taskStore.pendingTasks.length }}</p>
            </div>
            <div class="text-blue-500">
              <span class="material-icons text-3xl">task</span>
            </div>
          </div>
          <div class="mt-4">
            <router-link to="/tasks" class="text-sm text-blue-700 hover:underline">
              Ver todas as tarefas →
            </router-link>
          </div>
        </div>
        
        <!-- Produtos em baixo estoque (apenas para quem tem acesso) -->
        <div v-if="hasStockAccess" class="card bg-yellow-50 border-l-4 border-yellow-500">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-semibold text-yellow-700">Baixo Estoque</h3>
              <p class="text-2xl font-bold">{{ stockStore.lowStockProducts.length }}</p>
            </div>
            <div class="text-yellow-500">
              <span class="material-icons text-3xl">inventory</span>
            </div>
          </div>
          <div class="mt-4">
            <router-link to="/stock" class="text-sm text-yellow-700 hover:underline">
              Gerenciar estoque →
            </router-link>
          </div>
        </div>
        
        <!-- Balanço financeiro (apenas para quem tem acesso) -->
        <div v-if="hasFinanceAccess" class="card bg-green-50 border-l-4 border-green-500">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-semibold text-green-700">Balanço</h3>
              <p class="text-2xl font-bold">{{ financeStore.balance ? formatCurrency(financeStore.balance.balance) : 'R$ 0,00' }}</p>
            </div>
            <div class="text-green-500">
              <span class="material-icons text-3xl">payments</span>
            </div>
          </div>
          <div class="mt-4">
            <router-link to="/finance" class="text-sm text-green-700 hover:underline">
              Ver financeiro →
            </router-link>
          </div>
        </div>
        
        <!-- Funcionários ativos (apenas para quem tem acesso) -->
        <div v-if="hasHRAccess" class="card bg-purple-50 border-l-4 border-purple-500">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-semibold text-purple-700">Funcionários</h3>
              <p class="text-2xl font-bold">{{ hrStore.activeEmployees.length }}</p>
            </div>
            <div class="text-purple-500">
              <span class="material-icons text-3xl">people</span>
            </div>
          </div>
          <div class="mt-4">
            <router-link to="/hr" class="text-sm text-purple-700 hover:underline">
              Gerenciar pessoas →
            </router-link>
          </div>
        </div>
      </div>
      
      <!-- Tarefas recentes -->
      <div class="card mb-6">
        <h2 class="section-title">Tarefas Recentes</h2>
        
        <div v-if="taskStore.tasks.length === 0" class="text-gray-500 text-center py-4">
          Nenhuma tarefa encontrada
        </div>
        
        <ul v-else class="divide-y divide-gray-200">
          <li v-for="task in taskStore.tasks.slice(0, 5)" :key="task._id" class="py-3">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium">{{ task.title }}</h3>
                <p class="text-sm text-gray-500">
                  {{ task.description ? task.description.substring(0, 100) + (task.description.length > 100 ? '...' : '') : 'Sem descrição' }}
                </p>
              </div>
              <div>
                <span 
                  :class="[
                    'px-2 py-1 text-xs rounded-full',
                    task.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                    task.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' :
                    task.status === 'concluida' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  ]"
                >
                  {{ task.status === 'pendente' ? 'Pendente' :
                     task.status === 'em_andamento' ? 'Em andamento' :
                     task.status === 'concluida' ? 'Concluída' : 'Cancelada' }}
                </span>
              </div>
            </div>
          </li>
        </ul>
        
        <div class="mt-4 text-right">
          <router-link to="/tasks" class="text-primary-600 hover:underline">
            Ver todas as tarefas →
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>