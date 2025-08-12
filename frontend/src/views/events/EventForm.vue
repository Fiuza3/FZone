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
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col>
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">{{ isEditing ? 'Editar Evento' : 'Novo Evento' }}</h1>
          </div>
          <v-btn
            @click="router.push('/events')"
            variant="outlined"
            prepend-icon="mdi-arrow-left"
            size="large"
          >
            Voltar
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-form @submit.prevent="saveEvent">
      <!-- Mensagem de Erro -->
      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        class="mb-6"
        closable
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>

      <!-- Informações Básicas -->
      <v-card class="mb-6" elevation="4">
        <v-card-title class="d-flex align-center bg-grey-lighten-5">
          <v-icon class="me-2" color="primary">mdi-calendar</v-icon>
          Informações Básicas
        </v-card-title>
        
        <v-card-text>
          <v-row class="mb-4">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.title"
                label="Título"
                variant="outlined"
                density="compact"
                required
                prepend-inner-icon="mdi-format-title"
                placeholder="Título do evento"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.status"
                :items="statusOptions"
                item-title="label"
                item-value="value"
                label="Status"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-flag"
              ></v-select>
            </v-col>
          </v-row>
          
          <v-textarea
            v-model="form.description"
            label="Descrição"
            variant="outlined"
            density="compact"
            rows="3"
            class="mb-4"
            prepend-inner-icon="mdi-text"
            placeholder="Descrição do evento"
          ></v-textarea>
          
          <v-row class="mb-4">
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.startDate"
                label="Data/Hora Início"
                type="datetime-local"
                variant="outlined"
                density="compact"
                required
                prepend-inner-icon="mdi-calendar-start"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.endDate"
                label="Data/Hora Fim"
                type="datetime-local"
                variant="outlined"
                density="compact"
                required
                prepend-inner-icon="mdi-calendar-end"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="form.revenue"
                label="Receita"
                type="number"
                min="0"
                step="0.01"
                variant="outlined"
                density="compact"
                required
                prepend-inner-icon="mdi-currency-usd"
                prefix="R$"
                placeholder="0.00"
              ></v-text-field>
            </v-col>
          </v-row>
          
          <v-text-field
            v-model="form.location"
            label="Local"
            variant="outlined"
            density="compact"
            required
            prepend-inner-icon="mdi-map-marker"
            placeholder="Local do evento"
          ></v-text-field>
        </v-card-text>
      </v-card>

      <!-- Itens/Produtos -->
      <v-card class="mb-6" elevation="4">
        <v-card-title class="d-flex align-center justify-space-between bg-grey-lighten-5">
          <div class="d-flex align-center">
            <v-icon class="me-2" color="primary">mdi-package-variant</v-icon>
            Itens do Evento
          </div>
          <v-btn
            @click="addItem"
            color="primary"
            variant="outlined"
            size="small"
            prepend-icon="mdi-plus"
          >
            Adicionar Item
          </v-btn>
        </v-card-title>
        
        <v-card-text>
          <v-empty-state
            v-if="form.items.length === 0"
            icon="mdi-package-variant-closed"
            title="Nenhum item adicionado"
            text="Adicione itens para o evento"
          ></v-empty-state>
          
          <div v-else>
            <v-card
              v-for="(item, index) in form.items"
              :key="index"
              class="mb-4"
              variant="outlined"
            >
              <v-card-text>
                <v-row align="end">
                  <v-col cols="12" md="3">
                    <v-select
                      v-model="item.product"
                      :items="products"
                      item-title="name"
                      item-value="_id"
                      label="Produto"
                      variant="outlined"
                      density="compact"
                      @update:model-value="updateItemCost(index)"
                      prepend-inner-icon="mdi-package"
                    >
                      <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props">
                          <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                          <v-list-item-subtitle>{{ item.raw.sku }}</v-list-item-subtitle>
                        </v-list-item>
                      </template>
                    </v-select>
                  </v-col>
                  <v-col cols="12" md="2">
                    <v-text-field
                      v-model.number="item.quantity"
                      label="Quantidade"
                      type="number"
                      min="1"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-counter"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="2">
                    <v-text-field
                      v-model.number="item.unitCost"
                      label="Custo Unitário"
                      type="number"
                      min="0"
                      step="0.01"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-currency-usd"
                      prefix="R$"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="3">
                    <div class="d-flex align-center justify-space-between">
                      <v-chip color="success" variant="tonal">
                        {{ formatCurrency(item.quantity * item.unitCost) }}
                      </v-chip>
                      <v-btn
                        @click="removeItem(index)"
                        icon="mdi-delete"
                        color="error"
                        variant="text"
                        size="small"
                      ></v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            
            <v-divider class="my-4"></v-divider>
            <div class="text-right">
              <v-chip color="primary" size="large" variant="tonal">
                <v-icon start>mdi-calculator</v-icon>
                Total Itens: {{ formatCurrency(totalItemsCost) }}
              </v-chip>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Equipe -->
      <v-card class="mb-6" elevation="4">
        <v-card-title class="d-flex align-center justify-space-between bg-grey-lighten-5">
          <div class="d-flex align-center">
            <v-icon class="me-2" color="primary">mdi-account-group</v-icon>
            Equipe do Evento
          </div>
          <v-btn
            @click="addStaffMember"
            color="primary"
            variant="outlined"
            size="small"
            prepend-icon="mdi-plus"
          >
            Adicionar Pessoa
          </v-btn>
        </v-card-title>
        
        <v-card-text>
          <v-empty-state
            v-if="form.staff.length === 0"
            icon="mdi-account-group-outline"
            title="Nenhuma pessoa adicionada"
            text="Adicione membros da equipe para o evento"
          ></v-empty-state>
          
          <div v-else>
            <v-card
              v-for="(member, index) in form.staff"
              :key="index"
              class="mb-4"
              variant="outlined"
            >
              <v-card-text>
                <v-row align="end">
                  <v-col cols="12" md="3">
                    <v-select
                      v-model="member.employee"
                      :items="employees"
                      item-title="name"
                      item-value="_id"
                      label="Funcionário"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-account"
                      placeholder="Selecione um funcionário"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-text-field
                      v-model="member.role"
                      label="Função"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-briefcase"
                      placeholder="Ex: Garçom, Cozinheiro"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-text-field
                      v-model.number="member.payment"
                      label="Pagamento"
                      type="number"
                      min="0"
                      step="0.01"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-currency-usd"
                      prefix="R$"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="3">
                    <div class="d-flex justify-end">
                      <v-btn
                        @click="removeStaffMember(index)"
                        icon="mdi-delete"
                        color="error"
                        variant="text"
                        size="small"
                      ></v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            
            <v-divider class="my-4"></v-divider>
            <div class="text-right">
              <v-chip color="info" size="large" variant="tonal">
                <v-icon start>mdi-account-cash</v-icon>
                Total Equipe: {{ formatCurrency(totalStaffCost) }}
              </v-chip>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Despesas -->
      <v-card class="mb-6" elevation="4">
        <v-card-title class="d-flex align-center justify-space-between bg-grey-lighten-5">
          <div class="d-flex align-center">
            <v-icon class="me-2" color="primary">mdi-receipt</v-icon>
            Despesas Adicionais
          </div>
          <v-btn
            @click="addExpense"
            color="primary"
            variant="outlined"
            size="small"
            prepend-icon="mdi-plus"
          >
            Adicionar Despesa
          </v-btn>
        </v-card-title>
        
        <v-card-text>
          <v-empty-state
            v-if="form.expenses.length === 0"
            icon="mdi-receipt-outline"
            title="Nenhuma despesa adicionada"
            text="Adicione despesas adicionais para o evento"
          ></v-empty-state>
          
          <div v-else>
            <v-card
              v-for="(expense, index) in form.expenses"
              :key="index"
              class="mb-4"
              variant="outlined"
            >
              <v-card-text>
                <v-row align="end">
                  <v-col cols="12" md="3">
                    <v-text-field
                      v-model="expense.description"
                      label="Descrição"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-text"
                      placeholder="Descrição da despesa"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-select
                      v-model="expense.category"
                      :items="expenseCategories"
                      item-title="label"
                      item-value="value"
                      label="Categoria"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-tag"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-text-field
                      v-model.number="expense.amount"
                      label="Valor"
                      type="number"
                      min="0"
                      step="0.01"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-currency-usd"
                      prefix="R$"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="3">
                    <div class="d-flex justify-end">
                      <v-btn
                        @click="removeExpense(index)"
                        icon="mdi-delete"
                        color="error"
                        variant="text"
                        size="small"
                      ></v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            
            <v-divider class="my-4"></v-divider>
            <div class="text-right">
              <v-chip color="warning" size="large" variant="tonal">
                <v-icon start>mdi-receipt</v-icon>
                Total Despesas: {{ formatCurrency(totalExpenses) }}
              </v-chip>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Resumo Financeiro -->
      <v-card class="mb-6" elevation="4">
        <v-card-title class="d-flex align-center bg-grey-lighten-5">
          <v-icon class="me-2" color="primary">mdi-calculator</v-icon>
          Resumo Financeiro
        </v-card-title>
        
        <v-card-text>
          <v-row>
            <v-col cols="6" md="3">
              <v-card color="success" variant="tonal" elevation="2">
                <v-card-text class="text-center">
                  <div class="text-h4 font-weight-bold">{{ formatCurrency(form.revenue) }}</div>
                  <div class="text-caption mt-1">Receita</div>
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="6" md="3">
              <v-card color="error" variant="tonal" elevation="2">
                <v-card-text class="text-center">
                  <div class="text-h4 font-weight-bold">{{ formatCurrency(totalCost) }}</div>
                  <div class="text-caption mt-1">Custo Total</div>
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="6" md="3">
              <v-card :color="profit >= 0 ? 'info' : 'error'" variant="tonal" elevation="2">
                <v-card-text class="text-center">
                  <div class="text-h4 font-weight-bold">{{ formatCurrency(profit) }}</div>
                  <div class="text-caption mt-1">Lucro</div>
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="6" md="3">
              <v-card :color="profit >= 0 ? 'primary' : 'error'" variant="tonal" elevation="2">
                <v-card-text class="text-center">
                  <div class="text-h4 font-weight-bold">{{ profitMargin }}%</div>
                  <div class="text-caption mt-1">Margem</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Botões -->
      <v-card-actions class="pa-6">
        <v-spacer></v-spacer>
        <v-btn
          @click="router.push('/events')"
          variant="outlined"
          size="large"
          class="me-3"
        >
          Cancelar
        </v-btn>
        
        <v-btn
          type="submit"
          :loading="isLoading"
          color="primary"
          size="large"
        >
          {{ isEditing ? 'Atualizar' : 'Criar' }} Evento
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-container>
</template>