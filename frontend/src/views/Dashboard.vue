<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useTaskStore } from '../stores/task';
import { useStockStore } from '../stores/stock';
import { useFinanceStore } from '../stores/finance';
import { useHRStore } from '../stores/hr';
import { useDashboardStore } from '../stores/dashboard';

// Stores
const authStore = useAuthStore();
const taskStore = useTaskStore();
const stockStore = useStockStore();
const financeStore = useFinanceStore();
const hrStore = useHRStore();
const dashboardStore = useDashboardStore();

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
  console.log('🔄 Carregando dados do dashboard avançado');
  
  try {
    loadingMessage.value = 'Carregando métricas...';
    await dashboardStore.loadDashboard();
    
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
    
    console.log('✅ Dashboard avançado carregado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao carregar dashboard:', error);
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
          Dashboard executivo da {{ authStore.user?.company?.name || 'sua empresa' }}. 
          Acompanhe métricas em tempo real e tome decisões estratégicas.
        </p>
      </div>
      
      <!-- Métricas Avançadas -->
      <div v-if="dashboardStore.metrics" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <!-- Total de Eventos -->
        <div class="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-semibold text-blue-100">Total de Eventos</h3>
              <p class="text-3xl font-bold">{{ dashboardStore.metrics.events.total }}</p>
              <p class="text-sm text-blue-100 mt-1">
                {{ dashboardStore.metrics.events.thisMonth }} este mês
              </p>
            </div>
            <div class="text-blue-200">
              <span class="material-icons text-4xl">event</span>
            </div>
          </div>
        </div>
        
        <!-- Receita Mensal -->
        <div class="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-semibold text-green-100">Receita Mensal</h3>
              <p class="text-3xl font-bold">{{ formatCurrency(dashboardStore.metrics.revenue.thisMonth) }}</p>
              <p class="text-sm text-green-100 mt-1">
                Crescimento: {{ dashboardStore.monthlyGrowth }}%
              </p>
            </div>
            <div class="text-green-200">
              <span class="material-icons text-4xl">trending_up</span>
            </div>
          </div>
        </div>
        
        <!-- Eventos Próximos -->
        <div class="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-semibold text-purple-100">Próximos Eventos</h3>
              <p class="text-3xl font-bold">{{ dashboardStore.metrics.events.upcoming }}</p>
              <p class="text-sm text-purple-100 mt-1">
                Próximos 30 dias
              </p>
            </div>
            <div class="text-purple-200">
              <span class="material-icons text-4xl">schedule</span>
            </div>
          </div>
        </div>
        
        <!-- Alertas -->
        <div class="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-semibold text-orange-100">Alertas</h3>
              <p class="text-3xl font-bold">{{ dashboardStore.totalAlerts }}</p>
              <p class="text-sm text-orange-100 mt-1">
                {{ dashboardStore.metrics.alerts.lowStock }} estoque baixo
              </p>
            </div>
            <div class="text-orange-200">
              <span class="material-icons text-4xl">warning</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Cards de resumo tradicionais -->
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
      
      <!-- Gráfico de Receitas -->
      <div v-if="dashboardStore.revenueChart.length > 0" class="card mb-6">
        <h2 class="section-title">Receitas dos Últimos 12 Meses</h2>
        <div class="h-64 flex items-end justify-between space-x-2 p-4">
          <div 
            v-for="(month, index) in dashboardStore.revenueChart.slice(-12)" 
            :key="index"
            class="flex flex-col items-center flex-1"
          >
            <div 
              class="bg-gradient-to-t from-blue-500 to-blue-300 rounded-t w-full transition-all hover:from-blue-600 hover:to-blue-400"
              :style="{ height: `${Math.max((month.revenue / Math.max(...dashboardStore.revenueChart.map(m => m.revenue))) * 200, 10)}px` }"
              :title="`${month.month}: ${formatCurrency(month.revenue)} (${month.events} eventos)`"
            ></div>
            <span class="text-xs text-gray-600 mt-2 transform -rotate-45 origin-left">
              {{ month.month }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Eventos Próximos -->
      <div v-if="dashboardStore.upcomingEvents.length > 0" class="card mb-6">
        <h2 class="section-title">Eventos Próximos</h2>
        <div class="space-y-3">
          <div 
            v-for="event in dashboardStore.upcomingEvents.slice(0, 5)" 
            :key="event._id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 rounded-full" :class="{
                'bg-yellow-400': event.status === 'planejado',
                'bg-blue-400': event.status === 'confirmado',
                'bg-green-400': event.status === 'em_andamento'
              }"></div>
              <div>
                <h4 class="font-medium text-gray-900">{{ event.title }}</h4>
                <p class="text-sm text-gray-600">{{ event.location }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900">
                {{ new Date(event.startDate).toLocaleDateString('pt-BR') }}
              </p>
              <p class="text-sm text-green-600">{{ formatCurrency(event.revenue) }}</p>
            </div>
          </div>
        </div>
        <div class="mt-4 text-center">
          <router-link to="/events" class="text-primary-600 hover:underline text-sm">
            Ver todos os eventos →
          </router-link>
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