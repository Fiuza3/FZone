<script setup>
  import { ref, onMounted, computed } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import { useFinanceStore } from "../../stores/finance";
  import { useNotificationStore } from "../../stores/notification";

  const router = useRouter();
  const route = useRoute();
  const financeStore = useFinanceStore();
  const notificationStore = useNotificationStore();

  // Estado do formulário
  const transaction = ref({
    type: "receita",
    category: "vendas",
    description: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "dinheiro",
    status: "pago",
    reference: "",
    isRecurring: false,
    recurringDay: 1
  });

  const isLoading = ref(false);
  const isEditing = computed(() => !!route.params.id);
  const errorMessage = ref("");

  // Opções de tipo
  const typeOptions = [
    { value: "receita", label: "Receita" },
    { value: "despesa", label: "Despesa" },
  ];

  // Opções de categoria
  const categoryOptions = computed(() => {
    if (transaction.value.type === "receita") {
      return [
        { value: "vendas", label: "Vendas" },
        { value: "servicos", label: "Serviços" },
        { value: "investimentos", label: "Investimentos" },
        { value: "gorjeta", label: "Gorjeta" },
        { value: "outros", label: "Outros" },
      ];
    } else {
      return [
        { value: "compras", label: "Compras" },
        { value: "salarios", label: "Salários" },
        { value: "aluguel", label: "Aluguel" },
        { value: "marketing", label: "Marketing" },
        { value: "despesas-gerais", label: "Despesas Gerais" },
        { value: "impostos", label: "Impostos" },
        { value: "manutencao", label: "Manutenção" },
        { value: "viagens", label: "Viagens" },
        { value: "outros", label: "Outros" },
      ];
    }
  });

  // Opções de método de pagamento
  const paymentMethodOptions = [
    { value: "dinheiro", label: "Dinheiro" },
    { value: "cartao", label: "Cartão" },
    { value: "pix", label: "PIX" },
    { value: "transferencia", label: "Transferência" },
    { value: "boleto", label: "Boleto" },
  ];

  // Opções de status
  const statusOptions = [
    { value: "pendente", label: "Pendente" },
    { value: "pago", label: "Pago" },
    { value: "cancelado", label: "Cancelado" },
  ];

  // Carrega dados da transação se estiver editando
  onMounted(async () => {
    if (isEditing.value) {
      isLoading.value = true;

      try {
        // Em um caso real, buscaríamos a transação específica
        // Aqui vamos simular encontrando no store
        await financeStore.fetchTransactions();
        const existingTransaction = financeStore.transactions.find(
          (t) => t._id === route.params.id
        );

        if (existingTransaction) {
          transaction.value = {
            type: existingTransaction.type,
            category: existingTransaction.category,
            description: existingTransaction.description,
            amount: existingTransaction.amount,
            date: existingTransaction.date
              ? new Date(existingTransaction.date).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
            paymentMethod: existingTransaction.paymentMethod,
            status: existingTransaction.status,
            reference: existingTransaction.reference || "",
          };
        } else {
          errorMessage.value = "Transação não encontrada";
        }
      } catch (error) {
        console.error("❌ Erro ao carregar transação:", error);
        errorMessage.value = "Erro ao carregar dados da transação";
      } finally {
        isLoading.value = false;
      }
    }
  });

  // Atualiza categoria quando o tipo muda
  const handleTypeChange = () => {
    // Redefine a categoria com base no novo tipo
    if (transaction.value.type === "receita") {
      transaction.value.category = "vendas";
    } else {
      transaction.value.category = "compras";
    }
  };

  // Salva a transação
  const saveTransaction = async () => {
    if (!transaction.value.description.trim()) {
      errorMessage.value = "A descrição da transação é obrigatória";
      return;
    }

    if (transaction.value.amount <= 0) {
      errorMessage.value = "O valor deve ser maior que zero";
      return;
    }

    isLoading.value = true;
    errorMessage.value = "";

    try {
      if (isEditing.value) {
        await financeStore.updateTransaction(
          route.params.id,
          transaction.value
        );
        console.log("✅ Transação atualizada com sucesso");
        notificationStore.addSystemNotification(
          "Transação atualizada",
          `A transação "${transaction.value.description}" foi atualizada`
        );
      } else {
        await financeStore.createTransaction(transaction.value);
        console.log("✅ Transação criada com sucesso");
        notificationStore.addFinanceNotification({
          id: Math.random().toString(36).substring(2),
          type: transaction.value.type,
          description: transaction.value.description,
          status: transaction.value.status,
          amount: transaction.value.amount,
        });
      }

      // Redireciona para a lista de transações
      router.push("/finance");
    } catch (error) {
      console.error("❌ Erro ao salvar transação:", error);
      errorMessage.value = "Erro ao salvar transação";
    } finally {
      isLoading.value = false;
    }
  };

  // Cancela e volta para a lista
  const cancelForm = () => {
    router.push("/finance");
  };
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title">
        {{ isEditing ? "Editar Transação" : "Nova Transação" }}
      </h1>
    </div>

    <!-- Formulário -->
    <div class="card">
      <!-- Carregando -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <div
          class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"
        ></div>
      </div>

      <!-- Formulário -->
      <form v-else @submit.prevent="saveTransaction" class="space-y-6">
        <!-- Mensagem de erro -->
        <div
          v-if="errorMessage"
          class="bg-red-50 border-l-4 border-red-500 p-4"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <span class="material-icons text-red-500">error</span>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ errorMessage }}</p>
            </div>
          </div>
        </div>

        <!-- Tipo e Categoria -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Tipo -->
          <div>
            <label for="type" class="form-label"
              >Tipo <span class="text-red-500">*</span></label
            >
            <select
              id="type"
              v-model="transaction.type"
              class="form-input"
              @change="handleTypeChange"
            >
              <option
                v-for="option in typeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- Categoria -->
          <div>
            <label for="category" class="form-label"
              >Categoria <span class="text-red-500">*</span></label
            >
            <select
              id="category"
              v-model="transaction.category"
              class="form-input"
            >
              <option
                v-for="option in categoryOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Descrição -->
        <div>
          <label for="description" class="form-label"
            >Descrição <span class="text-red-500">*</span></label
          >
          <input
            id="description"
            v-model="transaction.description"
            type="text"
            required
            class="form-input"
            placeholder="Descrição da transação"
          />
        </div>

        <!-- Valor e Data -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Valor -->
          <div>
            <label for="amount" class="form-label"
              >Valor <span class="text-red-500">*</span></label
            >
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <span class="text-gray-500">R$</span>
              </div>
              <input
                id="amount"
                v-model.number="transaction.amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                class="form-input pl-10"
                placeholder="0.00"
              />
            </div>
          </div>

          <!-- Data -->
          <div>
            <label for="date" class="form-label"
              >Data <span class="text-red-500">*</span></label
            >
            <input
              id="date"
              v-model="transaction.date"
              type="date"
              required
              class="form-input"
            />
          </div>
        </div>

        <!-- Método de pagamento e Status -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Método de pagamento -->
          <div>
            <label for="payment-method" class="form-label"
              >Método de pagamento</label
            >
            <select
              id="payment-method"
              v-model="transaction.paymentMethod"
              class="form-input"
            >
              <option
                v-for="option in paymentMethodOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- Status -->
          <div>
            <label for="status" class="form-label">Status</label>
            <select id="status" v-model="transaction.status" class="form-input">
              <option
                v-for="option in statusOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Referência -->
        <div>
          <label for="reference" class="form-label">Referência</label>
          <input
            id="reference"
            v-model="transaction.reference"
            type="text"
            class="form-input"
            placeholder="Número da nota, pedido, etc."
          />
        </div>
        
        <!-- Transação Fixa -->
        <div class="border-t border-gray-200 pt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Transação Recorrente</h3>
          
          <div class="space-y-4">
            <!-- Checkbox para ativar recorrência -->
            <div class="flex items-center">
              <input
                id="is-recurring"
                v-model="transaction.isRecurring"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label for="is-recurring" class="ml-2 text-sm text-gray-700">
                Esta é uma transação fixa (repetir mensalmente)
              </label>
            </div>
            
            <!-- Dia do mês (apenas se recorrente) -->
            <div v-if="transaction.isRecurring" class="max-w-xs">
              <label for="recurring-day" class="form-label">Dia do mês para repetição</label>
              <select
                id="recurring-day"
                v-model.number="transaction.recurringDay"
                class="form-input"
              >
                <option v-for="day in 31" :key="day" :value="day">
                  Dia {{ day }}
                </option>
              </select>
              <p class="text-xs text-gray-500 mt-1">
                A transação será repetida automaticamente todo mês neste dia
              </p>
            </div>
          </div>
        </div>

        <!-- Botões de ação -->
        <div class="flex justify-end space-x-3">
          <button type="button" @click="cancelForm" class="btn btn-outline">
            Cancelar
          </button>

          <button type="submit" :disabled="isLoading" class="btn btn-primary">
            <span v-if="isLoading" class="animate-spin mr-2">
              <span class="material-icons text-sm">refresh</span>
            </span>
            {{ isEditing ? "Atualizar" : "Registrar" }} Transação
          </button>
        </div>
        - Referência -->
        <div>
          <label for="reference" class="form-label">Referência</label>
          <input
            id="reference"
            v-model="transaction.reference"
            type="text"
            class="form-input"
            placeholder="Número da nota, pedido, etc."
          />
        </div>

        <!-- Botões de ação -->
        <div class="flex justify-end space-x-3">
          <button type="button" @click="cancelForm" class="btn btn-outline">
            Cancelar
          </button>

          <button type="submit" :disabled="isLoading" class="btn btn-primary">
            <span v-if="isLoading" class="animate-spin mr-2">
              <span class="material-icons text-sm">refresh</span>
            </span>
            {{ isEditing ? "Atualizar" : "Registrar" }} Transação
          </button>
        </div>
        - Referência -->
        <div>
          <label for="reference" class="form-label">Referência</label>
          <input
            id="reference"
            v-model="transaction.reference"
            type="text"
            class="form-input"
            placeholder="Número da nota, pedido, etc."
          />
        </div>

        <!-- Botões de ação -->
        <div class="flex justify-end space-x-3">
          <button type="button" @click="cancelForm" class="btn btn-outline">
            Cancelar
          </button>

          <button type="submit" :disabled="isLoading" class="btn btn-primary">
            <span v-if="isLoading" class="animate-spin mr-2">
              <span class="material-icons text-sm">refresh</span>
            </span>
            {{ isEditing ? "Atualizar" : "Registrar" }} Transação
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
