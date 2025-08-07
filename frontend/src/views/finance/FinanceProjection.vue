<script setup>
import { ref, onMounted, computed } from 'vue';
import { useFinanceStore } from '../../stores/finance';

const financeStore = useFinanceStore();
const isLoading = ref(true);
const projection = ref([]);
const months = ref(6);
const currentBalance = ref(0);

const monthOptions = [
  { value: 3, label: '3 meses' },
  { value: 6, label: '6 meses' },
  { value: 12, label: '12 meses' },
  { value: 24, label: '24 meses' }
];

onMounted(async () => {
  await loadProjection();
});

const loadProjection = async () => {
  isLoading.value = true;
  
  try {
    const response = await fetch(`/api/finance/projection?months=${months.value}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      projection.value = await response.json();
    }
    
    // Busca saldo atual
    await financeStore.getBalance();
    currentBalance.value = financeStore.balance?.balance || 0;
  } catch (error) {
    console.error('Erro ao carregar projeção:', error);
  } finally {
    isLoading.value = false;
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatMonth = (monthStr) => {
  const [year, month] = monthStr.split('-');
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

const getBalanceColor = (balance) => {
  if (balance > 0) return 'text-green-600';
  if (balance < 0) return 'text-red-600';
  return 'text-gray-600';
};

const totalProjectedIncome = computed(() => {
  return projection.value.reduce((sum, month) => sum + month.income, 0);
});

const totalProjectedExpenses = computed(() => {
  return projection.value.reduce((sum, month) => sum + month.expenses, 0);
});

const finalBalance = computed(() => {
  if (projection.value.length === 0) return currentBalance.value;
  return projection.value[projection.value.length - 1].balance;
});
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title">Projeção Financeira</h1>
      
      <div class="flex items-center space-x-4">
        <select v-model="months" @change="loadProjection" class="form-input">
          <option v-for="option in monthOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Carregando -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
    </div>

    <div v-else>
      <!-- Resumo Atual -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="card bg-blue-50 border-l-4 border-blue-500">
          <h3 class="font-semibold text-blue-700">Saldo Atual</h3>
          <p class="text-2xl font-bold" :class="getBalanceColor(currentBalance)">
            {{ formatCurrency(currentBalance) }}
          </p>
        </div>
        
        <div class="card bg-green-50 border-l-4 border-green-500">
          <h3 class="font-semibold text-green-700">Receitas Projetadas</h3>
          <p class="text-2xl font-bold text-green-600">
            {{ formatCurrency(totalProjectedIncome) }}
          </p>
        </div>
        
        <div class="card bg-red-50 border-l-4 border-red-500">
          <h3 class="font-semibold text-red-700">Despesas Projetadas</h3>
          <p class="text-2xl font-bold text-red-600">
            {{ formatCurrency(totalProjectedExpenses) }}
          </p>
        </div>
        
        <div class="card bg-purple-50 border-l-4 border-purple-500">
          <h3 class="font-semibold text-purple-700">Saldo Final</h3>
          <p class="text-2xl font-bold" :class="getBalanceColor(finalBalance)">
            {{ formatCurrency(finalBalance) }}
          </p>
        </div>
      </div>

      <!-- Gráfico de Projeção -->
      <div class="card mb-6">
        <h2 class="section-title">Evolução do Saldo</h2>
        <div class="h-64 flex items-end justify-between space-x-2 p-4">
          <div 
            v-for="(month, index) in projection" 
            :key="index"
            class="flex flex-col items-center flex-1"
          >
            <div 
              class="rounded-t w-full transition-all"
              :class="month.balance >= 0 ? 'bg-gradient-to-t from-green-500 to-green-300' : 'bg-gradient-to-t from-red-500 to-red-300'"
              :style="{ 
                height: `${Math.max(Math.abs(month.balance) / Math.max(...projection.map(m => Math.abs(m.balance))) * 200, 10)}px` 
              }"
              :title="`${formatMonth(month.month)}: ${formatCurrency(month.balance)}`"
            ></div>
            <span class="text-xs text-gray-600 mt-2 transform -rotate-45 origin-left">
              {{ month.month }}
            </span>
          </div>
        </div>
      </div>

      <!-- Detalhamento Mensal -->
      <div class="card">
        <h2 class="section-title">Detalhamento por Mês</h2>
        
        <div v-if="projection.length === 0" class="text-center py-8 text-gray-500">
          <span class="material-icons text-4xl mb-4 block">trending_up</span>
          <p>Nenhuma transação fixa cadastrada para projeção</p>
          <router-link to="/finance/new" class="text-primary-600 hover:underline">
            Cadastrar transação fixa →
          </router-link>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mês
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Receitas
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Despesas
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Resultado
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Saldo Acumulado
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(month, index) in projection" :key="index">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-medium text-gray-900">
                    {{ formatMonth(month.month) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-green-600 font-medium">
                    {{ formatCurrency(month.income) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-red-600 font-medium">
                    {{ formatCurrency(month.expenses) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div :class="getBalanceColor(month.income - month.expenses)" class="font-medium">
                    {{ formatCurrency(month.income - month.expenses) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div :class="getBalanceColor(month.balance)" class="font-bold">
                    {{ formatCurrency(month.balance) }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>