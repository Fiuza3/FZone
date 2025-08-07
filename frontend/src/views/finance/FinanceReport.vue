<script setup>
	import { ref, onMounted, computed } from "vue";
	import { useRouter } from "vue-router";
	import { useFinanceStore } from "../../stores/finance";

	const router = useRouter();
	const financeStore = useFinanceStore();

	const isLoading = ref(true);
	const dateRange = ref({
		startDate: new Date(new Date().setDate(1)).toISOString().split("T")[0],
		endDate: new Date().toISOString().split("T")[0],
	});
	const showExportDialog = ref(false);

	const loadReport = async () => {
		isLoading.value = true;
		try {
			await financeStore.getFinancialReport(dateRange.value);
		} catch (error) {
			console.error("Erro ao gerar relatório:", error);
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

	const setPeriod = (period) => {
		const today = new Date();
		let startDate = new Date();

		switch (period) {
			case "today":
				startDate = today;
				break;
			case "week":
				startDate = new Date(today.setDate(today.getDate() - 7));
				break;
			case "month":
				startDate = new Date(today.setMonth(today.getMonth() - 1));
				break;
			case "quarter":
				startDate = new Date(today.setMonth(today.getMonth() - 3));
				break;
			case "year":
				startDate = new Date(today.setFullYear(today.getFullYear() - 1));
				break;
		}

		dateRange.value = {
			startDate: startDate.toISOString().split("T")[0],
			endDate: new Date().toISOString().split("T")[0],
		};

		loadReport();
	};

	const exportReport = async (format) => {
		try {
			const data = {
				period: financeStore.report?.period,
				balance: financeStore.report?.balance,
				categoryBreakdown: financeStore.report?.categoryBreakdown,
				paymentMethodBreakdown: financeStore.report?.paymentMethodBreakdown,
			};

			if (format === "json") {
				const blob = new Blob([JSON.stringify(data, null, 2)], {
					type: "application/json",
				});
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `relatorio-financeiro-${dateRange.value.startDate}-${dateRange.value.endDate}.json`;
				a.click();
			} else if (format === "csv") {
				let csv = "Tipo,Categoria,Quantidade,Total\n";
				financeStore.report?.categoryBreakdown?.forEach((item) => {
					csv += `${item._id.type},${item._id.category},${item.count},${item.total}\n`;
				});
				const blob = new Blob([csv], { type: "text/csv" });
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `relatorio-financeiro-${dateRange.value.startDate}-${dateRange.value.endDate}.csv`;
				a.click();
			}

			showExportDialog.value = false;
		} catch (error) {
			console.error("Erro ao exportar:", error);
		}
	};

	onMounted(loadReport);
</script>

<template>
	<v-container fluid class="pa-6">
		<!-- Header -->
		<v-row class="mb-6">
			<v-col>
				<div class="d-flex justify-space-between align-center mb-4">
					<div>
						<h1 class="text-h4 font-weight-bold">Relatório Financeiro</h1>
					</div>

					<div class="d-flex ga-3">
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

		<!-- Filtros de Período -->
		<v-row class="mb-6">
			<v-col>
				<v-card elevation="4">
					<v-card-title class="d-flex align-center bg-grey-lighten-5">
						<v-icon class="me-2" color="primary">mdi-calendar-range</v-icon>
						Período do Relatório
					</v-card-title>

					<v-card-text class="pa-6">
						<v-row class="mb-4">
							<v-col cols="12" md="4">
								<v-text-field
									v-model="dateRange.startDate"
									label="Data Inicial"
									type="date"
									variant="outlined"
									density="comfortable"
									prepend-inner-icon="mdi-calendar"
								></v-text-field>
							</v-col>

							<v-col cols="12" md="4">
								<v-text-field
									v-model="dateRange.endDate"
									label="Data Final"
									type="date"
									variant="outlined"
									density="comfortable"
									prepend-inner-icon="mdi-calendar"
								></v-text-field>
							</v-col>

							<v-col cols="12" md="4" class="d-flex align-center">
								<v-btn
									@click="loadReport"
									color="primary"
									size="large"
									prepend-icon="mdi-refresh"
									block
									style="margin-bottom: 24px"
								>
									Atualizar
								</v-btn>
							</v-col>
						</v-row>

						<div class="d-flex flex-wrap ga-2">
							<v-btn @click="setPeriod('today')" size="small" variant="outlined"
								>Hoje</v-btn
							>
							<v-btn @click="setPeriod('week')" size="small" variant="outlined"
								>7 dias</v-btn
							>
							<v-btn @click="setPeriod('month')" size="small" variant="outlined"
								>30 dias</v-btn
							>
							<v-btn
								@click="setPeriod('quarter')"
								size="small"
								variant="outlined"
								>3 meses</v-btn
							>
							<v-btn @click="setPeriod('year')" size="small" variant="outlined"
								>1 ano</v-btn
							>
						</div>
					</v-card-text>
				</v-card>
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
				<p class="mt-4 text-h6">Gerando relatório...</p>
			</v-col>
		</v-row>

		<div v-else-if="financeStore.report">
			<!-- Cards de Resumo -->
			<v-row class="mb-6">
				<v-col cols="12" sm="6" md="4">
					<v-card color="success-lighten-4" elevation="4" height="120">
						<v-card-text class="pa-4">
							<div class="d-flex justify-space-between align-center">
								<div>
									<v-card-subtitle
										class="text-success-darken-2 pa-0 text-caption"
									>
										Receitas
									</v-card-subtitle>
									<div class="text-h5 font-weight-bold text-black">
										{{
											formatCurrency(financeStore.report.balance.receitas || 0)
										}}
									</div>
								</div>
								<v-icon size="32" class="text-success-darken-1">
									mdi-trending-up
								</v-icon>
							</div>
						</v-card-text>
					</v-card>
				</v-col>

				<v-col cols="12" sm="6" md="4">
					<v-card color="error-lighten-4" elevation="4" height="120">
						<v-card-text class="pa-4">
							<div class="d-flex justify-space-between align-center">
								<div>
									<v-card-subtitle
										class="text-error-darken-2 pa-0 text-caption"
									>
										Despesas
									</v-card-subtitle>
									<div class="text-h5 font-weight-bold text-black">
										{{
											formatCurrency(financeStore.report.balance.despesas || 0)
										}}
									</div>
								</div>
								<v-icon size="32" class="text-error-darken-1">
									mdi-trending-down
								</v-icon>
							</div>
						</v-card-text>
					</v-card>
				</v-col>

				<v-col cols="12" sm="6" md="4">
					<v-card
						:color="
							financeStore.report.balance.balance >= 0
								? 'info-lighten-4'
								: 'error-lighten-4'
						"
						elevation="4"
						height="120"
					>
						<v-card-text class="pa-4">
							<div class="d-flex justify-space-between align-center">
								<div>
									<v-card-subtitle
										:class="
											financeStore.report.balance.balance >= 0
												? 'text-info-darken-2'
												: 'text-error-darken-2'
										"
										class="pa-0 text-caption"
									>
										Saldo
									</v-card-subtitle>
									<div
										class="text-h5 font-weight-bold"
										:class="
											financeStore.report.balance.balance >= 0
												? 'text-success'
												: 'text-error'
										"
									>
										{{
											formatCurrency(financeStore.report.balance.balance || 0)
										}}
									</div>
								</div>
								<v-icon
									size="32"
									:class="
										financeStore.report.balance.balance >= 0
											? 'text-info-darken-1'
											: 'text-error-darken-1'
									"
								>
									mdi-calculator
								</v-icon>
							</div>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>

			<!-- Transações por Categoria -->
			<v-row class="mb-6">
				<v-col>
					<v-card elevation="4">
						<v-card-title class="d-flex align-center bg-grey-lighten-5">
							<v-icon class="me-2" color="primary">mdi-chart-pie</v-icon>
							Transações por Categoria
						</v-card-title>

						<v-card-text class="pa-0">
							<v-data-table
								:items="financeStore.report.categoryBreakdown || []"
								:headers="[
									{ title: 'Tipo', key: '_id.type', sortable: true },
									{ title: 'Categoria', key: '_id.category', sortable: true },
									{ title: 'Quantidade', key: 'count', sortable: true },
									{ title: 'Total', key: 'total', sortable: true },
								]"
								class="elevation-0"
								density="comfortable"
							>
								<template #item._id.type="{ item }">
									<v-chip
										:color="item._id.type === 'receita' ? 'success' : 'error'"
										size="small"
										variant="flat"
									>
										{{ item._id.type === "receita" ? "Receita" : "Despesa" }}
									</v-chip>
								</template>

								<template #item._id.category="{ item }">
									<v-chip size="small" variant="outlined">
										{{ item._id.category }}
									</v-chip>
								</template>

								<template #item.total="{ item }">
									<span
										class="font-weight-bold"
										:class="
											item._id.type === 'receita'
												? 'text-success'
												: 'text-error'
										"
									>
										{{ formatCurrency(item.total) }}
									</span>
								</template>
							</v-data-table>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>

			<!-- Transações por Método de Pagamento -->
			<v-row class="mb-6">
				<v-col>
					<v-card elevation="4">
						<v-card-title class="d-flex align-center bg-grey-lighten-5">
							<v-icon class="me-2" color="primary">mdi-credit-card</v-icon>
							Transações por Método de Pagamento
						</v-card-title>

						<v-card-text class="pa-0">
							<v-data-table
								:items="financeStore.report.paymentMethodBreakdown || []"
								:headers="[
									{ title: 'Método de Pagamento', key: '_id', sortable: true },
									{ title: 'Quantidade', key: 'count', sortable: true },
									{ title: 'Total', key: 'total', sortable: true },
								]"
								class="elevation-0"
								density="comfortable"
							>
								<template #item._id="{ item }">
									<v-chip size="small" variant="outlined">
										{{
											item._id === "dinheiro"
												? "Dinheiro"
												: item._id === "cartao"
												? "Cartão"
												: item._id === "pix"
												? "PIX"
												: item._id === "transferencia"
												? "Transferência"
												: item._id === "boleto"
												? "Boleto"
												: item._id
										}}
									</v-chip>
								</template>

								<template #item.total="{ item }">
									<span class="font-weight-bold">
										{{ formatCurrency(item.total) }}
									</span>
								</template>
							</v-data-table>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>
		</div>

		<!-- Sem dados -->
		<v-row v-else justify="center">
			<v-col cols="auto" class="text-center">
				<v-card elevation="4" class="pa-8">
					<v-icon size="64" color="grey-lighten-1"
						>mdi-information-outline</v-icon
					>
					<p class="text-h6 mt-4 text-grey">
						Nenhum dado disponível para o período selecionado
					</p>
				</v-card>
			</v-col>
		</v-row>

		<!-- Dialog de Exportação -->
		<v-dialog v-model="showExportDialog" max-width="400">
			<v-card>
				<v-card-title class="d-flex align-center">
					<v-icon class="me-2" color="success">mdi-download</v-icon>
					Exportar Relatório
				</v-card-title>

				<v-card-text>
					<p class="mb-4">Escolha o formato para exportar o relatório:</p>
					<div class="d-flex flex-column ga-3">
						<v-btn
							@click="exportReport('json')"
							color="primary"
							variant="outlined"
							prepend-icon="mdi-code-json"
							block
						>
							JSON
						</v-btn>
						<v-btn
							@click="exportReport('csv')"
							color="success"
							variant="outlined"
							prepend-icon="mdi-file-delimited"
							block
						>
							CSV
						</v-btn>
					</div>
				</v-card-text>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn @click="showExportDialog = false" variant="text">
						Cancelar
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</v-container>
</template>
