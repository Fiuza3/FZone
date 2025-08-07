<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useFinanceStore } from '../../stores/finance';
import { useNotificationStore } from '../../stores/notification';

const router = useRouter();
const route = useRoute();
const financeStore = useFinanceStore();
const notificationStore = useNotificationStore();

const transaction = ref({
  type: 'receita',
  category: 'vendas',
  description: '',
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  paymentMethod: 'dinheiro',
  status: 'pago',
  reference: '',
  isRecurring: false,
  recurringDay: 1
});

const isLoading = ref(false);
const isEditing = computed(() => !!route.params.id);
const errorMessage = ref('');

const typeOptions = [
  { value: 'receita', title: 'Receita', color: 'success' },
  { value: 'despesa', title: 'Despesa', color: 'error' }
];

const categoryOptions = computed(() => {
  if (transaction.value.type === 'receita') {
    return [
      { value: 'vendas', title: 'Vendas' },
      { value: 'outros', title: 'Outros' }
    ];
  } else {
    return [
      { value: 'compras', title: 'Compras' },
      { value: 'salarios', title: 'Salários' },
      { value: 'aluguel', title: 'Aluguel' },
      { value: 'marketing', title: 'Marketing' },
      { value: 'manutencao', title: 'Manutenção' },
      { value: 'outros', title: 'Outros' }
    ];
  }
});

const paymentMethodOptions = [
  { value: 'dinheiro', title: 'Dinheiro' },
  { value: 'cartao', title: 'Cartão' },
  { value: 'pix', title: 'PIX' },
  { value: 'transferencia', title: 'Transferência' },
  { value: 'boleto', title: 'Boleto' }
];

const statusOptions = [
  { value: 'pendente', title: 'Pendente', color: 'warning' },
  { value: 'pago', title: 'Pago', color: 'success' },
  { value: 'cancelado', title: 'Cancelado', color: 'error' }
];

onMounted(async () => {
  if (isEditing.value) {
    isLoading.value = true;
    try {
      await financeStore.fetchTransactions();
      const existingTransaction = financeStore.transactions.find(
        (t) => t._id === route.params.id
      );
      if (existingTransaction) {
        transaction.value = {
          ...existingTransaction,
          date: existingTransaction.date
            ? new Date(existingTransaction.date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          reference: existingTransaction.reference || ''
        };
      } else {
        errorMessage.value = 'Transação não encontrada';
      }
    } catch (error) {
      errorMessage.value = 'Erro ao carregar dados da transação';
    } finally {
      isLoading.value = false;
    }
  }
});

const handleTypeChange = () => {
  transaction.value.category = transaction.value.type === 'receita' ? 'vendas' : 'compras';
};

const saveTransaction = async () => {
  if (!transaction.value.description.trim()) {
    errorMessage.value = 'A descrição da transação é obrigatória';
    return;
  }
  if (transaction.value.amount <= 0) {
    errorMessage.value = 'O valor deve ser maior que zero';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    if (isEditing.value) {
      await financeStore.updateTransaction(route.params.id, transaction.value);
    } else {
      await financeStore.createTransaction(transaction.value);
    }
    router.push('/finance');
  } catch (error) {
    errorMessage.value = 'Erro ao salvar transação';
  } finally {
    isLoading.value = false;
  }
};

const cancelForm = () => {
  router.push('/finance');
};
</script>

<template>
	<v-container fluid class="pa-6">
		<v-row class="mb-6">
			<v-col>
				<div class="d-flex justify-space-between align-center mb-4">
					<h1 class="text-h4 font-weight-bold">
						{{ isEditing ? 'Editar Transação' : 'Nova Transação' }}
					</h1>
					<v-btn
						@click="cancelForm"
						variant="outlined"
						prepend-icon="mdi-arrow-left"
					>
						Voltar
					</v-btn>
				</div>
			</v-col>
		</v-row>

		<v-row v-if="isLoading" justify="center">
			<v-col cols="auto" class="text-center">
				<v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
				<p class="mt-4 text-h6">Carregando...</p>
			</v-col>
		</v-row>

		<v-form v-else @submit.prevent="saveTransaction">
			<v-card elevation="4">
				<v-card-title class="d-flex align-center bg-grey-lighten-5">
					<v-icon class="me-2" color="primary">mdi-cash-register</v-icon>
					Dados da Transação
				</v-card-title>

				<v-card-text class="pa-6">
					<v-alert v-if="errorMessage" type="error" class="mb-6">
						{{ errorMessage }}
					</v-alert>

					<v-row class="mb-4">
						<v-col cols="12" md="6">
							<v-select
								v-model="transaction.type"
								:items="typeOptions"
								label="Tipo *"
								variant="outlined"
								density="comfortable"
								@update:model-value="handleTypeChange"
								required
							>
								<template #selection="{ item }">
									<v-chip :color="item.raw.color" size="small">
										{{ item.title }}
									</v-chip>
								</template>
							</v-select>
						</v-col>

						<v-col cols="12" md="6">
							<v-select
								v-model="transaction.category"
								:items="categoryOptions"
								label="Categoria *"
								variant="outlined"
								density="comfortable"
								required
							></v-select>
						</v-col>
					</v-row>

					<v-row class="mb-4">
						<v-col cols="12">
							<v-text-field
								v-model="transaction.description"
								label="Descrição *"
								variant="outlined"
								density="comfortable"
								placeholder="Descrição da transação"
								required
							></v-text-field>
						</v-col>
					</v-row>

					<v-row class="mb-4">
						<v-col cols="12" md="6">
							<v-text-field
								v-model.number="transaction.amount"
								label="Valor *"
								type="number"
								min="0.01"
								step="0.01"
								variant="outlined"
								density="comfortable"
								prefix="R$"
								placeholder="0,00"
								required
							></v-text-field>
						</v-col>

						<v-col cols="12" md="6">
							<v-text-field
								v-model="transaction.date"
								label="Data *"
								type="date"
								variant="outlined"
								density="comfortable"
								prepend-inner-icon="mdi-calendar"
								required
							></v-text-field>
						</v-col>
					</v-row>

					<v-row class="mb-4">
						<v-col cols="12" md="6">
							<v-select
								v-model="transaction.paymentMethod"
								:items="paymentMethodOptions"
								label="Método de Pagamento"
								variant="outlined"
								density="comfortable"
								prepend-inner-icon="mdi-credit-card"
							></v-select>
						</v-col>

						<v-col cols="12" md="6">
							<v-select
								v-model="transaction.status"
								:items="statusOptions"
								label="Status"
								variant="outlined"
								density="comfortable"
							>
								<template #selection="{ item }">
									<v-chip :color="item.raw.color" size="small">
										{{ item.title }}
									</v-chip>
								</template>
							</v-select>
						</v-col>
					</v-row>

					<v-row class="mb-4">
						<v-col cols="12">
							<v-text-field
								v-model="transaction.reference"
								label="Referência"
								variant="outlined"
								density="comfortable"
								placeholder="Número da nota, pedido, etc."
								prepend-inner-icon="mdi-file-document"
							></v-text-field>
						</v-col>
					</v-row>

					<v-divider class="my-6"></v-divider>

					<v-row>
						<v-col cols="12">
							<h3 class="text-h6 mb-4 d-flex align-center">
								<v-icon class="me-2" color="primary">mdi-repeat</v-icon>
								Transação Recorrente
							</h3>

							<v-checkbox
								v-model="transaction.isRecurring"
								label="Esta é uma transação fixa (repetir mensalmente)"
								color="primary"
								density="comfortable"
							></v-checkbox>

							<v-expand-transition>
								<div v-if="transaction.isRecurring" class="mt-4">
									<v-select
										v-model.number="transaction.recurringDay"
										:items="Array.from({length: 31}, (_, i) => ({ value: i + 1, title: `Dia ${i + 1}` }))"
										label="Dia do mês para repetição"
										variant="outlined"
										density="comfortable"
										style="max-width: 300px"
									></v-select>
									<v-alert type="info" variant="tonal" class="mt-2">
										A transação será repetida automaticamente todo mês neste dia
									</v-alert>
								</div>
							</v-expand-transition>
						</v-col>
					</v-row>
				</v-card-text>

				<v-card-actions class="pa-6 pt-0">
					<v-spacer></v-spacer>
					<v-btn
						@click="cancelForm"
						variant="outlined"
						size="large"
					>
						Cancelar
					</v-btn>
					<v-btn
						type="submit"
						:loading="isLoading"
						color="primary"
						size="large"
						prepend-icon="mdi-content-save"
					>
						{{ isEditing ? 'Atualizar' : 'Registrar' }} Transação
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-form>
	</v-container>
</template>
