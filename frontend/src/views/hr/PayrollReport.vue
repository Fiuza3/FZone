<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useHRStore } from '../../stores/hr';

const router = useRouter();
const hrStore = useHRStore();

// Estado
const isLoading = ref(true);

// Carrega relatório
const loadReport = async () => {
  console.log('🔄 Gerando relatório de folha de pagamento');
  isLoading.value = true;
  
  try {
    await hrStore.getPayrollReport();
    console.log('✅ Relatório gerado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
  } finally {
    isLoading.value = false;
  }
};

// Volta para a lista de funcionários
const goToHR = () => {
  router.push('/hr');
};

// Formata moeda
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Carrega relatório ao montar o componente
onMounted(loadReport);
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title">Relatório de Folha de Pagamento</h1>
      <button @click="goToHR" class="btn btn-outline flex items-center">
        <span class="material-icons mr-1">arrow_back</span>
        Voltar para RH
      </button>
    </div>
    
    <!-- Carregando -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
    
    <!-- Relatório -->
    <div v-else-if="hrStore.payrollReport" class="space-y-6">
      <!-- Resumo geral -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card bg-blue-50 border-l-4 border-blue-500">
          <h3 class="font-semibold text-blue-700">Total de Funcionários</h3>
          <p class="text-3xl font-bold mt-2">{{ hrStore.payrollReport.totals.totalEmployees }}</p>
        </div>
        
        <div class="card bg-green-50 border-l-4 border-green-500">
          <h3 class="font-semibold text-green-700">Folha Total</h3>
          <p class="text-3xl font-bold mt-2 text-green-600">{{ formatCurrency(hrStore.payrollReport.totals.totalSalary) }}</p>
        </div>
        
        <div class="card bg-purple-50 border-l-4 border-purple-500">
          <h3 class="font-semibold text-purple-700">Salário Médio</h3>
          <p class="text-3xl font-bold mt-2 text-purple-600">{{ formatCurrency(hrStore.payrollReport.totals.avgSalaryCompany) }}</p>
        </div>
      </div>
      
      <!-- Breakdown por departamento -->
      <div class="card">
        <h2 class="section-title">Folha por Departamento</h2>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departamento
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Funcionários
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Folha Total
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salário Médio
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % da Folha
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="dept in hrStore.payrollReport.departmentBreakdown" :key="dept._id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    {{ dept._id === 'financeiro' ? 'Financeiro' :
                       dept._id === 'estoque' ? 'Estoque' :
                       dept._id === 'vendas' ? 'Vendas' :
                       dept._id === 'marketing' ? 'Marketing' :
                       dept._id === 'rh' ? 'RH' :
                       dept._id === 'ti' ? 'TI' : dept._id }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ dept.totalEmployees }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {{ formatCurrency(dept.totalSalary) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatCurrency(dept.avgSalary) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        class="bg-blue-600 h-2.5 rounded-full" 
                        :style="`width: ${(dept.totalSalary / hrStore.payrollReport.totals.totalSalary * 100).toFixed(1)}%`"
                      ></div>
                    </div>
                    <span class="ml-2 text-sm text-gray-700">
                      {{ (dept.totalSalary / hrStore.payrollReport.totals.totalSalary * 100).toFixed(1) }}%
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Gráfico (simulado) -->
      <div class="card">
        <h2 class="section-title">Distribuição da Folha de Pagamento</h2>
        
        <div class="h-64 flex items-center justify-center">
          <div class="text-center text-gray-500">
            <span class="material-icons text-4xl">bar_chart</span>
            <p class="mt-2">Gráfico de distribuição da folha de pagamento</p>
            <p class="text-sm">(Implementação com Chart.js seria adicionada aqui)</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Sem dados -->
    <div v-else class="card py-8 text-center">
      <span class="material-icons text-4xl text-gray-400">info</span>
      <p class="text-gray-500 mt-2">Nenhum dado disponível para o relatório</p>
    </div>
  </div>
</template>