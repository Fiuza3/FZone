<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useEventStore } from '../../stores/event';
import api from '../../services/api';
import { useNotificationStore } from '../../stores/notification';

const router = useRouter();
const route = useRoute();
const eventStore = useEventStore();
const products = ref([]);
const employees = ref([]);
const notificationStore = useNotificationStore();

const isEditing = computed(() => !!route.params.id);
const isLoading = ref(false);
const errorMessage = ref('');

const form = ref({
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  location: '',
  status: 'planejado',
  revenue: 0,
  items: [],
  staff: [],
  expenses: []
});

const statusOptions = [
  { value: 'planejado', label: 'Planejado' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' }
];

const expenseCategories = [
  { value: 'transporte', label: 'Transporte' },
  { value: 'equipamento', label: 'Equipamento' },
  { value: 'decoracao', label: 'Decoração' },
  { value: 'outros', label: 'Outros' }
];

// Cálculos
const totalItemsCost = computed(() => {
  if (!form.value.items || form.value.items.length === 0) return 0;
  return form.value.items.reduce((total, item) => {
    const quantity = Number(item.quantity) || 0;
    const unitCost = Number(item.unitCost) || 0;
    return total + (quantity * unitCost);
  }, 0);
});

const totalStaffCost = computed(() => {
  if (!form.value.staff || form.value.staff.length === 0) return 0;
  return form.value.staff.reduce((total, member) => {
    const payment = Number(member.payment) || 0;
    return total + payment;
  }, 0);
});

const totalExpenses = computed(() => {
  if (!form.value.expenses || form.value.expenses.length === 0) return 0;
  return form.value.expenses.reduce((total, expense) => {
    const amount = Number(expense.amount) || 0;
    return total + amount;
  }, 0);
});

const totalCost = computed(() => {
  return totalItemsCost.value + totalStaffCost.value + totalExpenses.value;
});

const profit = computed(() => {
  const revenue = Number(form.value.revenue) || 0;
  const cost = Number(totalCost.value) || 0;
  return revenue - cost;
});

const profitMargin = computed(() => {
  if (form.value.revenue === 0 || isNaN(profit.value)) return '0.00';
  return ((profit.value / form.value.revenue) * 100).toFixed(2);
});

onMounted(async () => {
  // Buscar dados para o formulário
  try {
    const response = await api.get('/events/form-data');
    products.value = response.data.products;
    employees.value = response.data.employees;
  } catch (error) {
    console.error('Erro ao carregar dados do formulário:', error);
  }
  
  if (isEditing.value) {
    // Carregar dados do evento para edição
    const event = eventStore.events.find(e => e._id === route.params.id);
    if (event) {
      form.value = {
        title: event.title,
        description: event.description || '',
        startDate: new Date(event.startDate).toISOString().slice(0, 16),
        endDate: new Date(event.endDate).toISOString().slice(0, 16),
        location: event.location,
        status: event.status,
        revenue: event.revenue,
        items: event.items || [],
        staff: event.staff || [],
        expenses: event.expenses || []
      };
    }
  }
});

// Funções para gerenciar itens
const addItem = () => {
  form.value.items.push({
    product: '',
    quantity: 1,
    unitCost: 0
  });
};

const removeItem = (index) => {
  form.value.items.splice(index, 1);
};

const updateItemCost = (index) => {
  const item = form.value.items[index];
  const product = products.value.find(p => p._id === item.product);
  if (product) {
    item.unitCost = Number(product.cost) || 0;
  }
};

// Funções para gerenciar equipe
const addStaffMember = () => {
  form.value.staff.push({
    employee: '',
    role: '',
    payment: 0
  });
};

const removeStaffMember = (index) => {
  form.value.staff.splice(index, 1);
};

// Funções para gerenciar despesas
const addExpense = () => {
  form.value.expenses.push({
    description: '',
    amount: 0,
    category: 'outros'
  });
};

const removeExpense = (index) => {
  form.value.expenses.splice(index, 1);
};

const saveEvent = async () => {
  if (!form.value.title.trim()) {
    errorMessage.value = 'Título é obrigatório';
    return;
  }
  
  if (!form.value.startDate || !form.value.endDate) {
    errorMessage.value = 'Datas de início e fim são obrigatórias';
    return;
  }
  
  if (new Date(form.value.startDate) >= new Date(form.value.endDate)) {
    errorMessage.value = 'Data de fim deve ser posterior à data de início';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const eventData = {
      ...form.value,
      startDate: new Date(form.value.startDate),
      endDate: new Date(form.value.endDate)
    };

    if (isEditing.value) {
      await eventStore.updateEvent(route.params.id, eventData);
      notificationStore.addSystemNotification(
        'Evento atualizado',
        `O evento "${form.value.title}" foi atualizado com sucesso`
      );
    } else {
      await eventStore.createEvent(eventData);
      notificationStore.addSystemNotification(
        'Evento criado',
        `O evento "${form.value.title}" foi criado com sucesso`
      );
    }

    router.push('/events');
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Erro ao salvar evento';
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
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title">{{ isEditing ? 'Editar Evento' : 'Novo Evento' }}</h1>
    </div>

    <form @submit.prevent="saveEvent" class="space-y-6">
      <!-- Mensagem de Erro -->
      <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-500 p-4">
        <p class="text-red-700">{{ errorMessage }}</p>
      </div>

      <!-- Informações Básicas -->
      <div class="card">
        <div class="card-header">
          <h2 class="text-lg font-semibold">Informações Básicas</h2>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label">Título <span class="text-red-500">*</span></label>
              <input v-model="form.title" type="text" required class="form-input" />
            </div>
            <div>
              <label class="form-label">Status</label>
              <select v-model="form.status" class="form-input">
                <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="form-label">Descrição</label>
            <textarea v-model="form.description" class="form-input" rows="3"></textarea>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="form-label">Data/Hora Início <span class="text-red-500">*</span></label>
              <input v-model="form.startDate" type="datetime-local" required class="form-input" />
            </div>
            <div>
              <label class="form-label">Data/Hora Fim <span class="text-red-500">*</span></label>
              <input v-model="form.endDate" type="datetime-local" required class="form-input" />
            </div>
            <div>
              <label class="form-label">Receita <span class="text-red-500">*</span></label>
              <input v-model.number="form.revenue" type="number" min="0" step="0.01" required class="form-input" />
            </div>
          </div>
          
          <div>
            <label class="form-label">Local <span class="text-red-500">*</span></label>
            <input v-model="form.location" type="text" required class="form-input" />
          </div>
        </div>
      </div>

      <!-- Itens/Produtos -->
      <div class="card">
        <div class="card-header">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold">Itens do Evento</h2>
            <button type="button" @click="addItem" class="btn btn-outline btn-sm">
              <span class="material-icons mr-1">add</span>
              Adicionar Item
            </button>
          </div>
        </div>
        <div class="p-6">
          <div v-if="form.items.length === 0" class="text-center text-gray-500 py-4">
            Nenhum item adicionado
          </div>
          <div v-else class="space-y-4">
            <div v-for="(item, index) in form.items" :key="index" class="border rounded-lg p-4">
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label class="form-label">Produto</label>
                  <select v-model="item.product" @change="updateItemCost(index)" class="form-input">
                    <option value="">Selecione um produto</option>
                    <option v-for="product in products" :key="product._id" :value="product._id">
                      {{ product.name }} ({{ product.sku }})
                    </option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Quantidade</label>
                  <input v-model.number="item.quantity" type="number" min="1" class="form-input" />
                </div>
                <div>
                  <label class="form-label">Custo Unitário</label>
                  <input v-model.number="item.unitCost" type="number" min="0" step="0.01" class="form-input" />
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-medium">{{ formatCurrency(item.quantity * item.unitCost) }}</span>
                  <button type="button" @click="removeItem(index)" class="btn btn-outline btn-sm text-red-600">
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="text-right font-semibold">
              Total Itens: {{ formatCurrency(totalItemsCost) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Equipe -->
      <div class="card">
        <div class="card-header">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold">Equipe do Evento</h2>
            <button type="button" @click="addStaffMember" class="btn btn-outline btn-sm">
              <span class="material-icons mr-1">add</span>
              Adicionar Pessoa
            </button>
          </div>
        </div>
        <div class="p-6">
          <div v-if="form.staff.length === 0" class="text-center text-gray-500 py-4">
            Nenhuma pessoa adicionada
          </div>
          <div v-else class="space-y-4">
            <div v-for="(member, index) in form.staff" :key="index" class="border rounded-lg p-4">
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label class="form-label">Funcionário</label>
                  <select v-model="member.employee" class="form-input">
                    <option value="">Selecione um funcionário</option>
                    <option v-for="employee in employees" :key="employee._id" :value="employee._id">
                      {{ employee.name }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Função</label>
                  <input v-model="member.role" type="text" class="form-input" placeholder="Ex: Garçom, Cozinheiro" />
                </div>
                <div>
                  <label class="form-label">Pagamento</label>
                  <input v-model.number="member.payment" type="number" min="0" step="0.01" class="form-input" />
                </div>
                <div>
                  <button type="button" @click="removeStaffMember(index)" class="btn btn-outline btn-sm text-red-600">
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="text-right font-semibold">
              Total Equipe: {{ formatCurrency(totalStaffCost) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Despesas -->
      <div class="card">
        <div class="card-header">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold">Despesas Adicionais</h2>
            <button type="button" @click="addExpense" class="btn btn-outline btn-sm">
              <span class="material-icons mr-1">add</span>
              Adicionar Despesa
            </button>
          </div>
        </div>
        <div class="p-6">
          <div v-if="form.expenses.length === 0" class="text-center text-gray-500 py-4">
            Nenhuma despesa adicionada
          </div>
          <div v-else class="space-y-4">
            <div v-for="(expense, index) in form.expenses" :key="index" class="border rounded-lg p-4">
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label class="form-label">Descrição</label>
                  <input v-model="expense.description" type="text" class="form-input" />
                </div>
                <div>
                  <label class="form-label">Categoria</label>
                  <select v-model="expense.category" class="form-input">
                    <option v-for="cat in expenseCategories" :key="cat.value" :value="cat.value">
                      {{ cat.label }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Valor</label>
                  <input v-model.number="expense.amount" type="number" min="0" step="0.01" class="form-input" />
                </div>
                <div>
                  <button type="button" @click="removeExpense(index)" class="btn btn-outline btn-sm text-red-600">
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="text-right font-semibold">
              Total Despesas: {{ formatCurrency(totalExpenses) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Resumo Financeiro -->
      <div class="card">
        <div class="card-header">
          <h2 class="text-lg font-semibold">Resumo Financeiro</h2>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div class="bg-green-50 p-4 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ formatCurrency(form.revenue) }}</div>
              <div class="text-sm text-green-700">Receita</div>
            </div>
            <div class="bg-red-50 p-4 rounded-lg">
              <div class="text-2xl font-bold text-red-600">{{ formatCurrency(totalCost) }}</div>
              <div class="text-sm text-red-700">Custo Total</div>
            </div>
            <div :class="['p-4 rounded-lg', profit >= 0 ? 'bg-blue-50' : 'bg-red-50']">
              <div :class="['text-2xl font-bold', profit >= 0 ? 'text-blue-600' : 'text-red-600']">
                {{ formatCurrency(profit) }}
              </div>
              <div :class="['text-sm', profit >= 0 ? 'text-blue-700' : 'text-red-700']">Lucro</div>
            </div>
            <div :class="['p-4 rounded-lg', profit >= 0 ? 'bg-blue-50' : 'bg-red-50']">
              <div :class="['text-2xl font-bold', profit >= 0 ? 'text-blue-600' : 'text-red-600']">
                {{ profitMargin }}%
              </div>
              <div :class="['text-sm', profit >= 0 ? 'text-blue-700' : 'text-red-700']">Margem</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botões -->
      <div class="flex justify-end space-x-3">
        <button type="button" @click="router.push('/events')" class="btn btn-outline">
          Cancelar
        </button>
        <button type="submit" :disabled="isLoading" class="btn btn-primary">
          <span v-if="isLoading" class="animate-spin mr-2">
            <span class="material-icons text-sm">refresh</span>
          </span>
          {{ isEditing ? 'Atualizar' : 'Criar' }} Evento
        </button>
      </div>
    </form>
  </div>
</template>