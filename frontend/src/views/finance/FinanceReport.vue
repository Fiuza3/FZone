<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useFinanceStore } from '../../stores/finance';

const router = useRouter();
const financeStore = useFinanceStore();

// Estado
const isLoading = ref(true);
const dateRange = ref({
  startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // Primeiro dia do mês atual
  endDate: new Date().toISOString().split('T')[0] // Hoje
});

// Carrega relatório
const loadReport = async () => {
  console.log('🔄 Gerando relatório financeiro');
  isLoading.value = true;
  
  try {
    await financeStore.getFinancialReport(dateRange.value);
    console.log('✅ Relatório gerado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
  } finally {
    isLoading.value = false;
  }
};

// Volta para a lista de transações
const goToFinance = () => {
  router.push('/finance');
};

// Formata moeda
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Atualiza relatório quando o período muda
const updateReport = () => {
  loadReport();
};

// Períodos predefinidos
const setPeriod = (period) => {
  const today = new Date();
  let startDate = new Date();
  
  switch (period) {
    case 'today':
      startDate = today;
      break;
    case 'week':
      startDate = new Date(today.setDate(today.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(today.setMonth(today.getMonth() - 1));
      break;
    case 'quarter':
      startDate = new Date(today.setMonth(today.getMonth() - 3));
      break;
    case 'year':
      startDate = new Date(today.setFullYear(today.getFullYear() - 1));
      break;
  }
  
  dateRange.value = {
    startDate: startDate.toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  };
  
  loadReport();
};

// Carrega relatório ao montar o componente
onMounted(loadReport);
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title">Relatório Financeiro</h1>
      <button @click="goToFinance" class="btn btn-outline flex items-center">
        <span class="material-icons mr-1">arrow_back</span>
        Voltar para Financeiro
      </button>
    </div>
    
    <!-- Seleção de período -->
    <div class="card mb-6">
      <h2 class="text-lg font-semibold mb-4">Período</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Data inicial -->
        <div>
          <label for="start-date" class="form-label">Data inicial</label>
          <input
            id="start-date"
            v-model="dateRange.startDate"
            type="date"
            class="form-input"
          />
        </div>
        
        <!-- Data final -->
        <div>
          <label for="end-date" class="form-label">Data final</label>
          <input
            id="end-date"
            v-model="dateRange.endDate"
            type="date"
            class="form-input"
          />
        </div>
        
        <!-- Botão de atualizar -->
        <div class="flex items-end">
          <button @click="updateReport" class="btn btn-primary">
            <span class="material-icons mr-1">refresh</span>
            Atualizar
          </button>
        </div>
      </div>
      
      <!-- Períodos predefinidos -->
      <div class="flex flex-wrap gap-2 mt-4">
        <button @click="setPeriod('today')" class="btn btn-outline text-sm py-1">Hoje</button>
        <button @click="setPeriod('week')" class="btn btn-outline text-sm py-1">Últimos 7 dias</button>
        <button @click="setPeriod('month')" class="btn btn-outline text-sm py-1">Último mês</button>
        <button @click="setPeriod('quarter')" class="btn btn-outline text-sm py-1">Último trimestre</button>
        <button @click="setPeriod('year')" class="btn btn-outline text-sm py-1">Último ano</button>
      </div>
    </div>
    
    <!-- Carregando -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
    
    <!-- Relatório -->
    <div v-else-if="financeStore.report" class="space-y-6">
      <!-- Resumo geral -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card bg-green-50 border-l-4 border-green-500">
          <h3 class="font-semibold text-green-700">Receitas</h3>
          <p class="text-3xl font-bold mt-2 text-green-600">{{ formatCurrency(financeStore.report.balance.receitas) }}</p>
        </div>
        
        <div class="card bg-red-50 border-l-4 border-red-500">
          <h3 class="font-semibold text-red-700">Despesas</h3>
          <p class="text-3xl font-bold mt-2 text-red-600">{{ formatCurrency(financeStore.report.balance.despesas) }}</p>
        </div>
        
        <div 
          :class="[
            'card border-l-4',
            financeStore.report.balance.balance >= 0 
              ? 'bg-blue-50 border-blue-500' 
              : 'bg-red-50 border-red-500'
          ]"
        >
          <h3 
            :class="[
              'font-semibold',
              financeStore.report.balance.balance >= 0 ? 'text-blue-700' : 'text-red-700'
            ]"
          >
            Saldo
          </h3>
          <p 
            :class="[
              'text-3xl font-bold mt-2',
              financeStore.report.balance.balance >= 0 ? 'text-blue-600' : 'text-red-600'
            ]"
          >
            {{ formatCurrency(financeStore.report.balance.balance) }}
          </p>
        </div>
      </div>
      
      <!-- Breakdown por categoria -->
      <div class="card">
        <h2 class="section-title">Transações por Categoria</h2>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(item, index) in financeStore.report.categoryBreakdown" :key="index">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    :class="[
                      'px-2 py-1 text-xs rounded-full',
                      item._id.type === 'receita' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ item._id.type === 'receita' ? 'Receita' : 'Despesa' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    {{ item._id.category }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ item.count }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div 
                    :class="[
                      'font-medium',
                      item._id.type === 'receita' ? 'text-green-600' : 'text-red-600'
                    ]"
                  >
                    {{ formatCurrency(item.total) }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Breakdown por método de pagamento -->
      <div class="card">
        <h2 class="section-title">Transações por Método de Pagamento</h2>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método de Pagamento
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(item, index) in financeStore.report.paymentMethodBreakdown" :key="index">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    {{ item._id === 'dinheiro' ? 'Dinheiro' :
                       item._id === 'cartao' ? 'Cartão' :
                       item._id === 'pix' ? 'PIX' :
                       item._id === 'transferencia' ? 'Transferência' :
                       item._id === 'boleto' ? 'Boleto' : item._id }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ item.count }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {{ formatCurrency(item.total) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Sem dados -->
    <div v-else class="card py-8 text-center">
      <span class="material-icons text-4xl text-gray-400">info</span>
      <p class="text-gray-500 mt-2">Nenhum dado disponível para o período selecionado</p>
    </div>
  </div>
</template>