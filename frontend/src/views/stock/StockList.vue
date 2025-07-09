<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStockStore } from '../../stores/stock';
import { useNotificationStore } from '../../stores/notification';

const router = useRouter();
const stockStore = useStockStore();
const notificationStore = useNotificationStore();

// Estado
const isLoading = ref(true);
const filters = ref({
  category: '',
  lowStock: false
});

// Opções de categoria
const categoryOptions = [
  { value: '', label: 'Todas as categorias' },
  { value: 'eletrônicos', label: 'Eletrônicos' },
  { value: 'roupas', label: 'Roupas' },
  { value: 'casa', label: 'Casa' },
  { value: 'esporte', label: 'Esporte' },
  { value: 'livros', label: 'Livros' },
  { value: 'outros', label: 'Outros' }
];

// Carrega produtos
const loadProducts = async () => {
  console.log('🔄 Carregando produtos');
  isLoading.value = true;
  
  try {
    await stockStore.fetchProducts(filters.value);
    console.log(`✅ ${stockStore.products.length} produtos carregados`);
  } catch (error) {
    console.error('❌ Erro ao carregar produtos:', error);
  } finally {
    isLoading.value = false;
  }
};

// Aplica filtros
const applyFilters = () => {
  loadProducts();
};

// Limpa filtros
const clearFilters = () => {
  filters.value = {
    category: '',
    lowStock: false
  };
  loadProducts();
};

// Navega para criar novo produto
const goToNewProduct = () => {
  router.push('/stock/new');
};

// Navega para editar produto
const editProduct = (productId) => {
  router.push(`/stock/${productId}/edit`);
};

// Navega para relatório de estoque
const goToReport = () => {
  router.push('/stock/report');
};

// Ajusta estoque
const adjustStock = (product, operation, amount = 1) => {
  stockStore.adjustStock(product._id, amount, operation);
  
  // Verifica se o produto está com estoque baixo após ajuste
  if (operation === 'subtract' && product.quantity - amount <= product.minStock) {
    notificationStore.addLowStockNotification({
      id: product._id,
      name: product.name,
      quantity: product.quantity - amount,
      minStock: product.minStock
    });
  }
};

// Formata moeda
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Carrega produtos ao montar o componente
onMounted(loadProducts);
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title">Gerenciamento de Estoque</h1>
      <div class="flex space-x-2">
        <button @click="goToReport" class="btn btn-outline flex items-center">
          <span class="material-icons mr-1">assessment</span>
          Relatório
        </button>
        <button @click="goToNewProduct" class="btn btn-primary flex items-center">
          <span class="material-icons mr-1">add</span>
          Novo Produto
        </button>
      </div>
    </div>
    
    <!-- Filtros -->
    <div class="card mb-6">
      <h2 class="text-lg font-semibold mb-4">Filtros</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        
        <!-- Filtro de baixo estoque -->
        <div class="flex items-end">
          <label class="inline-flex items-center">
            <input 
              type="checkbox" 
              v-model="filters.lowStock"
              class="form-checkbox h-5 w-5 text-primary-600"
            >
            <span class="ml-2 text-gray-700">Apenas produtos em baixo estoque</span>
          </label>
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
    
    <!-- Lista de produtos -->
    <div class="card">
      <!-- Carregando -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
      
      <!-- Sem produtos -->
      <div v-else-if="stockStore.products.length === 0" class="text-center py-8">
        <span class="material-icons text-4xl text-gray-400">inventory</span>
        <p class="text-gray-500 mt-2">Nenhum produto encontrado</p>
        <button @click="goToNewProduct" class="btn btn-primary mt-4">
          Cadastrar Novo Produto
        </button>
      </div>
      
      <!-- Tabela de produtos -->
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
                Categoria
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preço
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estoque
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in stockStore.products" :key="product._id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">{{ product.name }}</div>
                <div v-if="product.description" class="text-sm text-gray-500 truncate max-w-xs">
                  {{ product.description }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ product.sku }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                  {{ product.category }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatCurrency(product.price) }}</div>
                <div class="text-xs text-gray-500">
                  Margem: {{ product.profitMargin }}%
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div 
                  :class="[
                    'text-sm font-medium',
                    product.isLowStock ? 'text-red-600' : 'text-gray-900'
                  ]"
                >
                  {{ product.quantity }} unidades
                </div>
                <div v-if="product.isLowStock" class="text-xs text-red-500">
                  Estoque baixo!
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <!-- Botões de ajuste de estoque -->
                  <button 
                    @click="adjustStock(product, 'add', 1)" 
                    class="text-green-600 hover:text-green-900"
                    title="Adicionar 1 unidade"
                  >
                    <span class="material-icons">add_circle</span>
                  </button>
                  
                  <button 
                    @click="adjustStock(product, 'subtract', 1)" 
                    class="text-red-600 hover:text-red-900"
                    title="Remover 1 unidade"
                    :disabled="product.quantity <= 0"
                  >
                    <span class="material-icons">remove_circle</span>
                  </button>
                  
                  <!-- Botão de editar -->
                  <button 
                    @click="editProduct(product._id)" 
                    class="text-blue-600 hover:text-blue-900"
                    title="Editar produto"
                  >
                    <span class="material-icons">edit</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>