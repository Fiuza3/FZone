<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStockStore } from '../../stores/stock';

const router = useRouter();
const route = useRoute();
const stockStore = useStockStore();

// Estado do formulário
const product = ref({
  name: '',
  description: '',
  sku: '',
  category: 'outros',
  price: 0,
  cost: 0,
  quantity: 0,
  minStock: 5,
  supplier: ''
});

const isLoading = ref(false);
const isEditing = computed(() => !!route.params.id);
const errorMessage = ref('');

// Opções de categoria
const categoryOptions = [
  { value: 'eletrônicos', label: 'Eletrônicos' },
  { value: 'roupas', label: 'Roupas' },
  { value: 'casa', label: 'Casa' },
  { value: 'esporte', label: 'Esporte' },
  { value: 'livros', label: 'Livros' },
  { value: 'outros', label: 'Outros' }
];

// Margem de lucro calculada
const profitMargin = computed(() => {
  if (product.value.cost <= 0) return 0;
  const margin = ((product.value.price - product.value.cost) / product.value.cost) * 100;
  return parseFloat(margin.toFixed(2));
});

// Carrega dados do produto se estiver editando
onMounted(async () => {
  if (isEditing.value) {
    isLoading.value = true;
    
    try {
      // Em um caso real, buscaríamos o produto específico
      // Aqui vamos simular encontrando no store
      await stockStore.fetchProducts();
      const existingProduct = stockStore.products.find(p => p._id === route.params.id);
      
      if (existingProduct) {
        product.value = { ...existingProduct };
      } else {
        errorMessage.value = 'Produto não encontrado';
      }
    } catch (error) {
      console.error('❌ Erro ao carregar produto:', error);
      errorMessage.value = 'Erro ao carregar dados do produto';
    } finally {
      isLoading.value = false;
    }
  }
});

// Gera SKU automático
const generateSKU = () => {
  if (product.value.name) {
    const prefix = product.value.category.substring(0, 3).toUpperCase();
    const namePart = product.value.name.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    product.value.sku = `${prefix}-${namePart}-${randomNum}`;
  }
};

// Salva o produto
const saveProduct = async () => {
  if (!product.value.name.trim()) {
    errorMessage.value = 'O nome do produto é obrigatório';
    return;
  }
  
  if (!product.value.sku.trim()) {
    errorMessage.value = 'O SKU do produto é obrigatório';
    return;
  }
  
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    if (isEditing.value) {
      await stockStore.updateProduct(route.params.id, product.value);
      console.log('✅ Produto atualizado com sucesso');
    } else {
      await stockStore.createProduct(product.value);
      console.log('✅ Produto criado com sucesso');
    }
    
    // Redireciona para a lista de produtos
    router.push('/stock');
  } catch (error) {
    console.error('❌ Erro ao salvar produto:', error);
    errorMessage.value = error.response?.data?.error || 'Erro ao salvar produto';
  } finally {
    isLoading.value = false;
  }
};

// Cancela e volta para a lista
const cancelForm = () => {
  router.push('/stock');
};
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title">{{ isEditing ? 'Editar Produto' : 'Novo Produto' }}</h1>
    </div>
    
    <!-- Formulário -->
    <div class="card">
      <!-- Carregando -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
      
      <!-- Formulário -->
      <form v-else @submit.prevent="saveProduct" class="space-y-6">
        <!-- Mensagem de erro -->
        <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-500 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <span class="material-icons text-red-500">error</span>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ errorMessage }}</p>
            </div>
          </div>
        </div>
        
        <!-- Nome -->
        <div>
          <label for="name" class="form-label">Nome <span class="text-red-500">*</span></label>
          <input
            id="name"
            v-model="product.name"
            type="text"
            required
            class="form-input"
            placeholder="Nome do produto"
          />
        </div>
        
        <!-- Descrição -->
        <div>
          <label for="description" class="form-label">Descrição</label>
          <textarea
            id="description"
            v-model="product.description"
            rows="3"
            class="form-input"
            placeholder="Descrição detalhada do produto"
          ></textarea>
        </div>
        
        <!-- SKU e Categoria -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- SKU -->
          <div>
            <label for="sku" class="form-label">SKU <span class="text-red-500">*</span></label>
            <div class="flex">
              <input
                id="sku"
                v-model="product.sku"
                type="text"
                required
                class="form-input rounded-r-none"
                placeholder="Código único do produto"
              />
              <button 
                type="button"
                @click="generateSKU"
                class="bg-gray-200 text-gray-700 px-3 rounded-r border border-gray-300 border-l-0"
                title="Gerar SKU automático"
              >
                <span class="material-icons text-sm">autorenew</span>
              </button>
            </div>
          </div>
          
          <!-- Categoria -->
          <div>
            <label for="category" class="form-label">Categoria</label>
            <select
              id="category"
              v-model="product.category"
              class="form-input"
            >
              <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
        
        <!-- Preço e Custo -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Preço de venda -->
          <div>
            <label for="price" class="form-label">Preço de venda <span class="text-red-500">*</span></label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500">R$</span>
              </div>
              <input
                id="price"
                v-model.number="product.price"
                type="number"
                min="0"
                step="0.01"
                required
                class="form-input pl-10"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <!-- Custo -->
          <div>
            <label for="cost" class="form-label">Custo <span class="text-red-500">*</span></label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500">R$</span>
              </div>
              <input
                id="cost"
                v-model.number="product.cost"
                type="number"
                min="0"
                step="0.01"
                required
                class="form-input pl-10"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <!-- Margem de lucro (calculada) -->
          <div>
            <label class="form-label">Margem de lucro</label>
            <div class="form-input bg-gray-50 flex items-center">
              <span 
                :class="[
                  'font-medium',
                  profitMargin <= 0 ? 'text-red-600' :
                  profitMargin < 15 ? 'text-orange-600' :
                  profitMargin > 50 ? 'text-green-600' : 'text-blue-600'
                ]"
              >
                {{ profitMargin }}%
              </span>
            </div>
          </div>
        </div>
        
        <!-- Estoque -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Quantidade -->
          <div>
            <label for="quantity" class="form-label">Quantidade em estoque</label>
            <input
              id="quantity"
              v-model.number="product.quantity"
              type="number"
              min="0"
              class="form-input"
              placeholder="0"
            />
          </div>
          
          <!-- Estoque mínimo -->
          <div>
            <label for="min-stock" class="form-label">Estoque mínimo</label>
            <input
              id="min-stock"
              v-model.number="product.minStock"
              type="number"
              min="0"
              class="form-input"
              placeholder="5"
            />
            <p class="text-xs text-gray-500 mt-1">
              Alerta será exibido quando o estoque estiver abaixo deste valor
            </p>
          </div>
        </div>
        
        <!-- Fornecedor -->
        <div>
          <label for="supplier" class="form-label">Fornecedor</label>
          <input
            id="supplier"
            v-model="product.supplier"
            type="text"
            class="form-input"
            placeholder="Nome do fornecedor"
          />
        </div>
        
        <!-- Botões de ação -->
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="cancelForm"
            class="btn btn-outline"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            :disabled="isLoading"
            class="btn btn-primary"
          >
            <span v-if="isLoading" class="animate-spin mr-2">
              <span class="material-icons text-sm">refresh</span>
            </span>
            {{ isEditing ? 'Atualizar' : 'Cadastrar' }} Produto
          </button>
        </div>
      </form>
    </div>
  </div>
</template>