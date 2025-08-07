<script setup>
	import { ref, onMounted, computed } from "vue";
	import { useFinanceStore } from "../../stores/finance";

	const financeStore = useFinanceStore();
	const isLoading = ref(true);
	const projection = ref([]);
	const months = ref(6);
	const currentBalance = ref(0);
	const expensesByCategory = ref([]);
	const incomeBySource = ref([]);
	const showExportDialog = ref(false);

	const monthOptions = [
		{ value: 3, label: "3 meses" },
		{ value: 6, label: "6 meses" },
		{ value: 12, label: "12 meses" },
		{ value: 24, label: "24 meses" },
	];

	onMounted(async () => {
		await loadProjection();
	});

	const loadProjection = async () => {
		isLoading.value = true;

		try {
			const response = await fetch(
				`/api/finance/projection?months=${months.value}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);

			if (response.ok) {
				projection.value = await response.json();
			}

			// Busca saldo atual
			await financeStore.getBalance();
			currentBalance.value = financeStore.balance?.balance || 0;

			incomeBySource.value = [
				{ source: "Eventos", amount: 25000, percentage: 60 },
				{ source: "Consultorias", amount: 10000, percentage: 24 },
				{ source: "Produtos", amount: 4500, percentage: 11 },
				{ source: "Outros", amount: 2000, percentage: 5 },
			];
		} catch (error) {
			console.error("Erro ao carregar projeção:", error);
		} finally {
			isLoading.value = false;
		}
	};

	const formatCurrency = (value) => {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	};

	const formatMonth = (monthStr) => {
		const [year, month] = monthStr.split("-");
		const date = new Date(year, month - 1);
		return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
	};

	const getBalanceColor = (balance) => {
		if (balance > 0) return "text-green-600";
		if (balance < 0) return "text-red-600";
		return "text-gray-600";
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

	const topExpenseCategory = computed(() => {
		if (expensesByCategory.value.length === 0) return null;
		return expensesByCategory.value.reduce((max, cat) =>
			cat.amount > max.amount ? cat : max
		);
	});

	const topIncomeSource = computed(() => {
		if (incomeBySource.value.length === 0) return null;
		return incomeBySource.value.reduce((max, source) =>
			source.amount > max.amount ? source : max
		);
	});

	const exportProjection = async (format) => {
		try {
			const data = {
				projection: projection.value,
				summary: {
					currentBalance: currentBalance.value,
					totalIncome: totalProjectedIncome.value,
					totalExpenses: totalProjectedExpenses.value,
					finalBalance: finalBalance.value,
				},
				expensesByCategory: expensesByCategory.value,
				incomeBySource: incomeBySource.value,
			};

			if (format === "json") {
				const blob = new Blob([JSON.stringify(data, null, 2)], {
					type: "application/json",
				});
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `projecao-financeira-${months.value}m.json`;
				a.click();
			} else if (format === "csv") {
				const csv = projection.value
					.map((p) => `${p.month},${p.income},${p.expenses},${p.balance}`)
					.join("\n");
				const blob = new Blob([`Mês,Receitas,Despesas,Saldo\n${csv}`], {
					type: "text/csv",
				});
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `projecao-financeira-${months.value}m.csv`;
				a.click();
			}

			showExportDialog.value = false;
		} catch (error) {
			console.error("Erro ao exportar:", error);
		}
	};
</script>

<template>
	<v-container fluid class="pa-6">
		<!-- Header -->
		<v-row class="mb-6">
			<v-col>
				<div class="d-flex justify-space-between align-center mb-4">
					<div>
						<h1 class="text-h4 font-weight-bold">Projeção Financeira</h1>
					</div>

					<div class="d-flex ga-3">
						<v-btn-toggle
							v-model="months"
							color="primary"
							variant="outlined"
							divided
							@update:model-value="loadProjection"
						>
							<v-btn :value="3" size="small">3M</v-btn>
							<v-btn :value="6" size="small">6M</v-btn>
							<v-btn :value="12" size="small">12M</v-btn>
							<v-btn :value="24" size="small">24M</v-btn>
						</v-btn-toggle>

						<v-btn
							@click="showExportDialog = true"
							color="success"
							variant="outlined"
							prepend-icon="mdi-download"
							size="large"
						>
							Exportar
						</v-btn>

						<v-btn
							to="/finance"
							variant="outlined"
							prepend-icon="mdi-arrow-left"
							size="large"
						>
							Voltar
						</v-btn>
					</div>
				</div>
			</v-col>
		</v-row>

		<!-- Loading -->
		<v-row v-if="isLoading" justify="center">
			<v-col cols="auto" class="text-center">
				<v-progress-circular
					indeterminate
					color="primary"
					size="64"
				></v-progress-circular>
				<p class="mt-4 text-h6">Gerando projeção...</p>
			</v-col>
		</v-row>

		<div v-else>
			<!-- Cards de Resumo -->
			<v-row class="mb-6">
				<v-col cols="12" sm="6" md="3">
					<v-card color="primary-lighten-4" elevation="4" height="120">
						<v-card-text class="pa-4">
							<div class="d-flex justify-space-between align-center">
								<div>
									<v-card-subtitle
										class="text-primary-darken-2 pa-0 text-caption"
									>
										Saldo Atual
									</v-card-subtitle>
									<div class="text-h5 font-weight-bold text-black">
										{{ formatCurrency(currentBalance) }}
									</div>
								</div>
								<v-icon size="32" class="text-primary-darken-1">
									mdi-wallet
								</v-icon>
							</div>
						</v-card-text>
					</v-card>
				</v-col>

				<v-col cols="12" sm="6" md="3">
					<v-card color="success-lighten-4" elevation="4" height="120">
						<v-card-text class="pa-4">
							<div class="d-flex justify-space-between align-center">
								<div>
									<v-card-subtitle
										class="text-success-darken-2 pa-0 text-caption"
									>
										Receitas Projetadas
									</v-card-subtitle>
									<div class="text-h5 font-weight-bold text-black">
										{{ formatCurrency(totalProjectedIncome) }}
									</div>
								</div>
								<v-icon size="32" class="text-success-darken-1">
									mdi-trending-up
								</v-icon>
							</div>
						</v-card-text>
					</v-card>
				</v-col>

				<v-col cols="12" sm="6" md="3">
					<v-card color="error-lighten-4" elevation="4" height="120">
						<v-card-text class="pa-4">
							<div class="d-flex justify-space-between align-center">
								<div>
									<v-card-subtitle
										class="text-error-darken-2 pa-0 text-caption"
									>
										Despesas Projetadas
									</v-card-subtitle>
									<div class="text-h5 font-weight-bold text-black">
										{{ formatCurrency(totalProjectedExpenses) }}
									</div>
								</div>
								<v-icon size="32" class="text-error-darken-1">
									mdi-trending-down
								</v-icon>
							</div>
						</v-card-text>
					</v-card>
				</v-col>

				<v-col cols="12" sm="6" md="3">
					<v-card color="info-lighten-4" elevation="4" height="120">
						<v-card-text class="pa-4">
							<div class="d-flex justify-space-between align-center">
								<div>
									<v-card-subtitle class="text-info-darken-2 pa-0 text-caption">
										Saldo Final
									</v-card-subtitle>
									<div
										class="text-h5 font-weight-bold"
										:class="finalBalance >= 0 ? 'text-success' : 'text-error'"
									>
										{{ formatCurrency(finalBalance) }}
									</div>
								</div>
								<v-icon size="32" class="text-info-darken-1">
									mdi-calculator
								</v-icon>
							</div>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>

			<!-- Gráficos e Análises -->
			<v-row class="mb-6">
				<!-- Evolução do Saldo -->
				<v-col cols="12" md="8">
					<v-card elevation="4">
						<v-card-title class="d-flex align-center bg-grey-lighten-5">
							<v-icon class="me-2" color="primary">mdi-chart-line</v-icon>
							Evolução do Saldo
						</v-card-title>

						<v-card-text class="pa-6">
							<v-sparkline
								v-if="projection.length > 0"
								:value="projection.map((p) => p.balance)"
								:labels="projection.map((p) => p.month)"
								color="primary"
								line-width="3"
								padding="16"
								smooth="10"
								stroke-linecap="round"
								type="trend"
								auto-draw
								show-labels
								label-size="3"
								height="200"
							></v-sparkline>

							<v-empty-state
								v-else
								icon="mdi-chart-line"
								title="Sem dados para projeção"
								text="Configure transações fixas"
							></v-empty-state>
						</v-card-text>
					</v-card>
				</v-col>

				<!-- Principais Insights -->
				<v-col cols="12" md="4">
					<v-card elevation="4" class="mb-4">
						<v-card-title class="d-flex align-center bg-error-lighten-4">
							<v-icon class="me-2" color="error">mdi-trending-down</v-icon>
							Maior Gasto
						</v-card-title>
						<v-card-text v-if="topExpenseCategory">
							<div class="text-h6 font-weight-bold text-error">
								{{ topExpenseCategory.category }}
							</div>
							<div class="text-h5 font-weight-bold text-black">
								{{ formatCurrency(topExpenseCategory.amount) }}
							</div>
							<div class="text-caption text-grey-darken-1">
								{{ topExpenseCategory.percentage }}% do total
							</div>
						</v-card-text>
					</v-card>

					<v-card elevation="4">
						<v-card-title class="d-flex align-center bg-success-lighten-4">
							<v-icon class="me-2" color="success">mdi-trending-up</v-icon>
							Maior Receita
						</v-card-title>
						<v-card-text v-if="topIncomeSource">
							<div class="text-h6 font-weight-bold text-success">
								{{ topIncomeSource.source }}
							</div>
							<div class="text-h5 font-weight-bold text-black">
								{{ formatCurrency(topIncomeSource.amount) }}
							</div>
							<div class="text-caption text-grey-darken-1">
								{{ topIncomeSource.percentage }}% do total
							</div>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>

			<!-- Análise de Gastos e Receitas -->
			<v-row class="mb-6">
				<!-- Gastos por Categoria -->
				<v-col cols="12" md="6">
					<v-card elevation="4">
						<v-card-title class="d-flex align-center bg-grey-lighten-5">
							<v-icon class="me-2" color="error">mdi-chart-pie</v-icon>
							Gastos por Categoria
						</v-card-title>

						<v-card-text>
							<v-list>
								<v-list-item
									v-for="expense in expensesByCategory"
									:key="expense.category"
									class="px-0"
								>
									<template v-slot:prepend>
										<v-avatar color="error" size="32">
											<span class="text-caption font-weight-bold">
												{{ expense.percentage }}%
											</span>
										</v-avatar>
									</template>

									<v-list-item-title class="font-weight-medium">
										{{ expense.category }}
									</v-list-item-title>

									<template v-slot:append>
										<div class="text-right">
											<div class="font-weight-bold text-error">
												{{ formatCurrency(expense.amount) }}
											</div>
											<v-progress-linear
												:model-value="expense.percentage"
												color="error"
												height="4"
												rounded
												class="mt-1"
												style="width: 80px"
											></v-progress-linear>
										</div>
									</template>
								</v-list-item>
							</v-list>
						</v-card-text>
					</v-card>
				</v-col>

				<!-- Receitas por Fonte -->
				<v-col cols="12" md="6">
					<v-card elevation="4">
						<v-card-title class="d-flex align-center bg-grey-lighten-5">
							<v-icon class="me-2" color="success">mdi-chart-donut</v-icon>
							Receitas por Fonte
						</v-card-title>

						<v-card-text>
							<v-list>
								<v-list-item
									v-for="income in incomeBySource"
									:key="income.source"
									class="px-0"
								>
									<template v-slot:prepend>
										<v-avatar color="success" size="32">
											<span class="text-caption font-weight-bold">
												{{ income.percentage }}%
											</span>
										</v-avatar>
									</template>

									<v-list-item-title class="font-weight-medium">
										{{ income.source }}
									</v-list-item-title>

									<template v-slot:append>
										<div class="text-right">
											<div class="font-weight-bold text-success">
												{{ formatCurrency(income.amount) }}
											</div>
											<v-progress-linear
												:model-value="income.percentage"
												color="success"
												height="4"
												rounded
												class="mt-1"
												style="width: 80px"
											></v-progress-linear>
										</div>
									</template>
								</v-list-item>
							</v-list>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>

			<!-- Detalhamento Mensal -->
			<v-card elevation="4">
				<v-card-title class="d-flex align-center bg-grey-lighten-5">
					<v-icon class="me-2" color="primary">mdi-calendar-month</v-icon>
					Detalhamento por Mês
				</v-card-title>

				<v-data-table
					v-if="projection.length > 0"
					:items="projection"
					:headers="[
						{ title: 'Mês', key: 'month' },
						{ title: 'Receitas', key: 'income' },
						{ title: 'Despesas', key: 'expenses' },
						{ title: 'Resultado', key: 'result' },
						{ title: 'Saldo Acumulado', key: 'balance' },
					]"
					class="elevation-0"
					:items-per-page="12"
				>
					<template v-slot:item.month="{ item }">
						<div class="font-weight-medium">
							{{ formatMonth(item.month) }}
						</div>
					</template>

					<template v-slot:item.income="{ item }">
						<span class="font-weight-bold text-success">
							{{ formatCurrency(item.income) }}
						</span>
					</template>

					<template v-slot:item.expenses="{ item }">
						<span class="font-weight-bold text-error">
							{{ formatCurrency(item.expenses) }}
						</span>
					</template>

					<template v-slot:item.result="{ item }">
						<span
							class="font-weight-bold"
							:class="
								item.income - item.expenses >= 0 ? 'text-success' : 'text-error'
							"
						>
							{{ formatCurrency(item.income - item.expenses) }}
						</span>
					</template>

					<template v-slot:item.balance="{ item }">
						<v-chip
							:color="item.balance >= 0 ? 'success' : 'error'"
							variant="tonal"
							size="small"
						>
							{{ formatCurrency(item.balance) }}
						</v-chip>
					</template>
				</v-data-table>

				<v-card-text v-else>
					<v-empty-state
						icon="mdi-table"
						title="Nenhum dado disponível"
						text="Configure transações fixas para gerar projeções"
					></v-empty-state>
				</v-card-text>
			</v-card>
		</div>

		<!-- Dialog de Exportação -->
		<v-dialog v-model="showExportDialog" max-width="400">
			<v-card>
				<v-card-title class="d-flex align-center">
					<v-icon class="me-2" color="success">mdi-download</v-icon>
					Exportar Projeção
				</v-card-title>

				<v-card-text>
					<p class="mb-4">
						Escolha o formato para exportar a projeção financeira:
					</p>

					<v-list>
						<v-list-item @click="exportProjection('json')" class="rounded">
							<template v-slot:prepend>
								<v-icon color="primary">mdi-code-json</v-icon>
							</template>
							<v-list-item-title>JSON</v-list-item-title>
							<v-list-item-subtitle
								>Dados completos estruturados</v-list-item-subtitle
							>
						</v-list-item>

						<v-list-item @click="exportProjection('csv')" class="rounded">
							<template v-slot:prepend>
								<v-icon color="success">mdi-file-delimited</v-icon>
							</template>
							<v-list-item-title>CSV</v-list-item-title>
							<v-list-item-subtitle>Planilha para Excel</v-list-item-subtitle>
						</v-list-item>
					</v-list>
				</v-card-text>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn @click="showExportDialog = false" variant="outlined">
						Cancelar
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</v-container>
</template>
