<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStockStore } from '../../stores/stock';

const router = useRouter();
const stockStore = useStockStore();

// Estado
const isLoading = ref(true);

// Carrega relatório
const loadReport = async () => {
  console.log('🔄 Gerando relatório de estoque');
  isLoading.value = true;
  
  try {
    await stockStore.getStockReport();
    console.log('✅ Relatório gerado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
  } finally {
    isLoading.value = false;
  }
};

// Volta para a lista de produtos
const goToStock = () => {
  router.push('/stock');
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
      <h1 class="page-title">Relatório de Estoque</h1>
      <button @click="goToStock" class="btn btn-outline flex items-center">
        <span class="material-icons mr-1">arrow_back</span>
        Voltar para Estoque
      </button>
    </div>
    
    <!-- Carregando -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
    
    <!-- Relatório -->
    <div v-else class="space-y-6">
      <!-- Resumo geral -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card bg-blue-50 border-l-4 border-blue-500">
          <h3 class="font-semibold text-blue-700">Total de Produtos</h3>
          <p class="text-3xl font-bold mt-2">{{ stockStore.report.totalProducts }}</p>
        </div>
        
        <div class="card bg-green-50 border-l-4 border-green-500">
          <h3 class="font-semibold text-green-700">Valor Total em Estoque</h3>
          <p class="text-3xl font-bold mt-2">{{ formatCurrency(stockStore.report.totalValue) }}</p>
        </div>
        
        <div class="card bg-yellow-50 border-l-4 border-yellow-500">
          <h3 class="font-semibold text-yellow-700">Produtos em Baixo Estoque</h3>
          <p class="text-3xl font-bold mt-2">{{ stockStore.report.lowStockItems.length }}</p>
        </div>
      </div>
      
      <!-- Produtos em baixo estoque -->
      <div class="card">
        <h2 class="section-title">Produtos em Baixo Estoque</h2>
        
        <div v-if="stockStore.report.lowStockItems.length === 0" class="text-center py-4 text-gray-500">
          Nenhum produto em baixo estoque
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade Atual
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estoque Mínimo
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in stockStore.report.lowStockItems" :key="item.sku">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-medium text-gray-900">{{ item.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.sku }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                    {{ item.quantity }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.minStock }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Breakdown por categoria -->
      <div class="card">
        <h2 class="section-title">Distribuição por Categoria</h2>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade de Produtos
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Total
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(data, category) in stockStore.report.categoryBreakdown" :key="category">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    {{ category }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ data.count }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatCurrency(data.totalValue) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Top produtos por valor -->
      <div class="card">
        <h2 class="section-title">Top 5 Produtos por Valor</h2>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor em Estoque
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="product in stockStore.report.topValueProducts" :key="product.sku">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-medium text-gray-900">{{ product.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ product.sku }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatCurrency(product.value) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>