<script setup>
	import { ref, onMounted, computed, watch } from "vue";
	import { useRouter } from "vue-router";
	import { useStockStore } from "../../stores/stock";

	const router = useRouter();
	const stockStore = useStockStore();

	// Estado
	const isLoading = ref(true);
	const selectedPeriod = ref("30");
	const showExportDialog = ref(false);

	// Opções de período
	const periodOptions = [
		{ title: "Últimos 7 dias", value: "7" },
		{ title: "Últimos 30 dias", value: "30" },
		{ title: "Últimos 90 dias", value: "90" },
		{ title: "Este ano", value: "365" },
	];

	// Breadcrumbs
	const breadcrumbs = [
		{ title: "Dashboard", to: "/" },
		{ title: "Estoque", to: "/stock" },
		{ title: "Relatório", disabled: true },
	];

	// Headers das tabelas
	const profitHeaders = [
		{ title: "Produto", key: "name" },
		{ title: "SKU", key: "sku" },
		{ title: "Lucro Total", key: "profit" },
		{ title: "Margem (%)", key: "profitMargin" },
	];

	const priceHeaders = [
		{ title: "Produto", key: "name" },
		{ title: "SKU", key: "sku" },
		{ title: "Preço", key: "price" },
		{ title: "Custo", key: "cost" },
	];

	const marginHeaders = [
		{ title: "Produto", key: "name" },
		{ title: "SKU", key: "sku" },
		{ title: "Margem (%)", key: "profitMargin" },
		{ title: "Preço", key: "price" },
	];

	// Computed
	const reportData = computed(() => stockStore.report);

	// Carrega relatório
	const loadReport = async () => {
		isLoading.value = true;
		try {
			await stockStore.getStockReport(selectedPeriod.value);
		} catch (error) {
			console.error("Erro ao gerar relatório:", error);
		} finally {
			isLoading.value = false;
		}
	};

	// Recarrega quando período muda
	watch(selectedPeriod, () => {
		loadReport();
	});

	// Volta para a lista de produtos
	const goToStock = () => {
		router.push("/stock");
	};

	// Exporta relatório
	const exportReport = async (format) => {
		try {
			await stockStore.exportReport(format, selectedPeriod.value);
			showExportDialog.value = false;
		} catch (error) {
			console.error("Erro ao exportar relatório:", error);
		}
	};

	// Cor da categoria
	const getCategoryColor = (category) => {
		const colors = {
			eletrônicos: "blue",
			roupas: "purple",
			casa: "green",
			esporte: "orange",
			livros: "brown",
			automotivo: "red",
			outros: "grey",
		};
		return colors[category] || "grey";
	};

	// Formata moeda
	const formatCurrency = (value) => {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	};

	// Formata porcentagem
	const formatPercentage = (value) => {
		return `${value.toFixed(1)}%`;
	};

	// Gera dados do sparkline (simulado)
	const getSparklineData = () => {
		return Array.from(
			{ length: 7 },
			() => Math.floor(Math.random() * 100) + 20
		);
	};

	// Carrega relatório ao montar o componente
	onMounted(loadReport);
</script>

<template>
	<v-container fluid class="pa-6">
		<!-- Header -->
		<v-row class="mb-6">
			<v-col>
				<div class="d-flex justify-space-between align-center mb-4">
					<div>
						<h1 class="text-h4 font-weight-bold mb-2">Relatório de Estoque</h1>
					</div>

					<div class="d-flex ga-3">
						<v-select
							v-model="selectedPeriod"
							:items="periodOptions"
							label="Período"
							variant="outlined"
							density="compact"
							style="min-width: 150px"
						></v-select>

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
							@click="goToStock"
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
				<p class="mt-4 text-h6">Gerando relatório...</p>
			</v-col>
		</v-row>

		<!-- Relatório -->
		<div v-else-if="reportData">
			<!-- Métricas principais -->
			<v-row class="mb-4">
				<v-col cols="12" sm="6" md="4">
					<v-card color="success-lighten-4" elevation="4" height="120">
						<v-card-text class="pa-4">
							<div class="d-flex justify-space-between align-center">
								<div class="flex-grow-1">
									<v-card-subtitle
										class="text-success-darken-2 pa-0 text-caption"
									>
										Valor Total em Estoque
									</v-card-subtitle>
									<div class="text-h4 font-weight-bold text-truncate text-black">
										{{ formatCurrency(reportData.totalValue) }}
									</div>
								</div>
								<v-icon size="32" class="text-success-darken-1">
									mdi-currency-usd
								</v-icon>
							</div>
							<v-sparkline
								:value="getSparklineData()"
								color="success"
								height="20"
								class="mt-2"
							></v-sparkline>
						</v-card-text>
					</v-card>
				</v-col>

				<v-col cols="12" sm="6" md="4">
					<v-card color="info-lighten-4" elevation="4" height="120">
						<v-card-text class="pa-4">
							<div class="d-flex justify-space-between align-center">
								<div class="flex-grow-1">
									<v-card-subtitle
										class="text-info-darken-2 pa-0 text-caption"
									>
										Lucro Total Potencial
									</v-card-subtitle>
									<div class="text-h4 font-weight-bold text-truncate text-black">
										{{ formatCurrency(reportData.totalProfit) }}
									</div>
								</div>
								<v-icon size="32" class="text-info-darken-1">
									mdi-trending-up
								</v-icon>
							</div>
							<v-sparkline
								:value="getSparklineData()"
								color="info"
								height="20"
								class="mt-2"
							></v-sparkline>
						</v-card-text>
					</v-card>
				</v-col>

				<v-col cols="12" sm="4" md="2">
					<v-card color="primary-lighten-4" elevation="4" height="120">
						<v-card-text class="pa-4">
							<div class="d-flex justify-space-between align-center">
								<div>
									<v-card-subtitle
										class="text-primary-darken-2 pa-0 text-caption"
									>
										Total de Produtos
									</v-card-subtitle>
									<div class="text-h4 font-weight-bold text-black">
										{{ reportData.totalProducts }}
									</div>
								</div>
								<v-icon size="32" class="text-primary-darken-1">
									mdi-package-variant
								</v-icon>
							</div>
							<v-sparkline
								:value="getSparklineData()"
								color="primary"
								height="20"
								class="mt-2"
							></v-sparkline>
						</v-card-text>
					</v-card>
				</v-col>

				<v-col cols="12" sm="4" md="2">
					<v-card color="warning-lighten-4" elevation="4" height="120">
						<v-card-text class="pa-4">
							<div class="d-flex justify-space-between align-center">
								<div>
									<v-card-subtitle
										class="text-warning-darken-2 pa-0 text-caption"
									>
										Baixo Estoque
									</v-card-subtitle>
									<div class="text-h4 font-weight-bold text-black">
										{{ reportData.lowStockItems.length }}
									</div>
								</div>
								<v-badge
									:content="reportData.lowStockItems.length"
									color="error"
								>
									<v-icon size="32" class="text-warning-darken-1">
										mdi-alert-circle
									</v-icon>
								</v-badge>
							</div>
							<v-progress-linear
								:model-value="
									(reportData.lowStockItems.length / reportData.totalProducts) *
									100
								"
								color="warning"
								height="4"
								rounded
								class="mt-2"
							></v-progress-linear>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>

			<!-- Top 5 Produtos que Mais Dão Lucro -->
			<v-card class="mb-6" elevation="4">
				<v-card-title class="d-flex align-center bg-grey-lighten-5">
					<v-icon class="me-2" color="success">mdi-trophy</v-icon>
					Top 5 Produtos que Mais Dão Lucro
				</v-card-title>

				<v-data-table
					:headers="profitHeaders"
					:items="reportData.topProfitProducts"
					class="elevation-0"
					:items-per-page="5"
				>
					<template v-slot:item.name="{ item, index }">
						<div class="d-flex align-center py-2">
							<v-avatar
								:color="index < 3 ? 'success' : 'primary'"
								class="me-3"
								size="32"
							>
								<span class="font-weight-bold">{{ index + 1 }}</span>
							</v-avatar>
							<div>
								<div class="font-weight-medium">{{ item.name }}</div>
								<v-chip
									:color="getCategoryColor(item.category)"
									size="x-small"
									variant="tonal"
								>
									{{ item.category }}
								</v-chip>
							</div>
						</div>
					</template>

					<template v-slot:item.profit="{ item }">
						<span class="font-weight-bold text-success">{{
							formatCurrency(item.profit)
						}}</span>
					</template>

					<template v-slot:item.profitMargin="{ item }">
						<v-chip
							:color="
								item.profitMargin > 30
									? 'success'
									: item.profitMargin > 15
									? 'warning'
									: 'error'
							"
							size="small"
						>
							{{ formatPercentage(item.profitMargin) }}
						</v-chip>
					</template>
				</v-data-table>
			</v-card>

			<!-- Produtos Mais Caros vs Mais Baratos -->
			<v-row class="mb-6">
				<v-col cols="12" md="6">
					<v-card elevation="4">
						<v-card-title class="d-flex align-center bg-grey-lighten-5">
							<v-icon class="me-2" color="error">mdi-arrow-up-bold</v-icon>
							5 Produtos Mais Caros
						</v-card-title>

						<v-data-table
							:headers="priceHeaders"
							:items="reportData.mostExpensive"
							class="elevation-0"
							:items-per-page="5"
						>
							<template v-slot:item.name="{ item, index }">
								<div class="d-flex align-center py-2">
									<v-avatar color="error" class="me-3" size="24">
										<span class="text-caption font-weight-bold">{{
											index + 1
										}}</span>
									</v-avatar>
									<div class="font-weight-medium">{{ item.name }}</div>
								</div>
							</template>

							<template v-slot:item.price="{ item }">
								<span class="font-weight-bold text-error">{{
									formatCurrency(item.price)
								}}</span>
							</template>

							<template v-slot:item.cost="{ item }">
								<span class="text-medium-emphasis">{{
									formatCurrency(item.cost)
								}}</span>
							</template>
						</v-data-table>
					</v-card>
				</v-col>

				<v-col cols="12" md="6">
					<v-card elevation="4">
						<v-card-title class="d-flex align-center bg-grey-lighten-5">
							<v-icon class="me-2" color="success">mdi-arrow-down-bold</v-icon>
							5 Produtos Mais Baratos
						</v-card-title>

						<v-data-table
							:headers="priceHeaders"
							:items="reportData.cheapest"
							class="elevation-0"
							:items-per-page="5"
						>
							<template v-slot:item.name="{ item, index }">
								<div class="d-flex align-center py-2">
									<v-avatar color="success" class="me-3" size="24">
										<span class="text-caption font-weight-bold">{{
											index + 1
										}}</span>
									</v-avatar>
									<div class="font-weight-medium">{{ item.name }}</div>
								</div>
							</template>

							<template v-slot:item.price="{ item }">
								<span class="font-weight-bold text-success">{{
									formatCurrency(item.price)
								}}</span>
							</template>

							<template v-slot:item.cost="{ item }">
								<span class="text-medium-emphasis">{{
									formatCurrency(item.cost)
								}}</span>
							</template>
						</v-data-table>
					</v-card>
				</v-col>
			</v-row>

			<!-- Maior vs Menor Margem -->
			<v-row class="mb-6">
				<v-col cols="12" md="6">
					<v-card elevation="4">
						<v-card-title class="d-flex align-center bg-grey-lighten-5">
							<v-icon class="me-2" color="success">mdi-trending-up</v-icon>
							5 Maiores Margens de Lucro
						</v-card-title>

						<v-data-table
							:headers="marginHeaders"
							:items="reportData.highestMargin"
							class="elevation-0"
							:items-per-page="5"
						>
							<template v-slot:item.name="{ item, index }">
								<div class="d-flex align-center py-2">
									<v-avatar color="success" class="me-3" size="24">
										<span class="text-caption font-weight-bold">{{
											index + 1
										}}</span>
									</v-avatar>
									<div class="font-weight-medium">{{ item.name }}</div>
								</div>
							</template>

							<template v-slot:item.profitMargin="{ item }">
								<v-chip color="success" size="small">
									{{ formatPercentage(item.profitMargin) }}
								</v-chip>
							</template>

							<template v-slot:item.price="{ item }">
								<span class="font-weight-medium">{{
									formatCurrency(item.price)
								}}</span>
							</template>
						</v-data-table>
					</v-card>
				</v-col>

				<v-col cols="12" md="6">
					<v-card elevation="4">
						<v-card-title class="d-flex align-center bg-grey-lighten-5">
							<v-icon class="me-2" color="warning">mdi-trending-down</v-icon>
							5 Menores Margens de Lucro
						</v-card-title>

						<v-data-table
							:headers="marginHeaders"
							:items="reportData.lowestMargin"
							class="elevation-0"
							:items-per-page="5"
						>
							<template v-slot:item.name="{ item, index }">
								<div class="d-flex align-center py-2">
									<v-avatar color="warning" class="me-3" size="24">
										<span class="text-caption font-weight-bold">{{
											index + 1
										}}</span>
									</v-avatar>
									<div class="font-weight-medium">{{ item.name }}</div>
								</div>
							</template>

							<template v-slot:item.profitMargin="{ item }">
								<v-chip
									:color="item.profitMargin < 10 ? 'error' : 'warning'"
									size="small"
								>
									{{ formatPercentage(item.profitMargin) }}
								</v-chip>
							</template>

							<template v-slot:item.price="{ item }">
								<span class="font-weight-medium">{{
									formatCurrency(item.price)
								}}</span>
							</template>
						</v-data-table>
					</v-card>
				</v-col>
			</v-row>
		</div>

		<!-- Dialog de exportação -->
		<v-dialog v-model="showExportDialog" max-width="400">
			<v-card>
				<v-card-title class="d-flex align-center">
					<v-icon class="me-2" color="success">mdi-download</v-icon>
					Exportar Relatório
				</v-card-title>

				<v-card-text>
					<p class="mb-4">Escolha o formato para exportação:</p>

					<div class="d-flex flex-column ga-2">
						<v-btn
							@click="exportReport('csv')"
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
