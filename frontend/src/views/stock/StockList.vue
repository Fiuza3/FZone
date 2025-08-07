<script setup>
	import { ref, onMounted, computed } from "vue";
	import { useRouter } from "vue-router";
	import { useStockStore } from "../../stores/stock";
	import { useNotificationStore } from "../../stores/notification";

	const router = useRouter();
	const stockStore = useStockStore();
	const notificationStore = useNotificationStore();

	// Estado
	const isLoading = ref(true);
	const selectedItems = ref([]);
	const showDeleteDialog = ref(false);
	const showAdjustDialog = ref(false);
	const adjustProduct = ref(null);
	const adjustQuantity = ref(1);
	const adjustOperation = ref("add");
	const showSnackbar = ref(false);
	const snackbarMessage = ref('');
	const snackbarColor = ref('success');

	const filters = ref({
		category: "",
		lowStock: false,
		search: "",
	});

	// Opções de categoria
	const categoryOptions = [
		{ title: "Todas as categorias", value: "" },
		{ title: "Eletrônicos", value: "eletrônicos" },
		{ title: "Roupas", value: "roupas" },
		{ title: "Casa", value: "casa" },
		{ title: "Esporte", value: "esporte" },
		{ title: "Livros", value: "livros" },
		{ title: "Automotivo", value: "automotivo" },
		{ title: "Outros", value: "outros" },
	];

	// Headers da tabela
	const headers = [
		{ title: "Produto", key: "name", sortable: true },
		{ title: "SKU", key: "sku", sortable: true },
		{ title: "Categoria", key: "category", sortable: true },
		{ title: "Preço", key: "price", sortable: true },
		{ title: "Estoque", key: "quantity", sortable: true },
		{ title: "Ações", key: "actions", sortable: false },
	];

	// Computed
	const totalValue = computed(() => {
		return stockStore.products.reduce((total, product) => {
			return total + product.quantity * product.price;
		}, 0);
	});

	const lowStockCount = computed(() => {
		return stockStore.products.filter((p) => p.quantity <= p.minStock).length;
	});

	// Carrega produtos
	const loadProducts = async () => {
		isLoading.value = true;
		try {
			await stockStore.fetchProducts(filters.value);
		} catch (error) {
			console.error("Erro ao carregar produtos:", error);
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
			category: "",
			lowStock: false,
			search: "",
		};
		loadProducts();
	};

	// Navega para criar novo produto
	const goToNewProduct = () => {
		router.push("/stock/new");
	};

	// Navega para editar produto
	const editProduct = (productId) => {
		router.push(`/stock/${productId}/edit`);
	};

	// Navega para relatório de estoque
	const goToReport = () => {
		router.push("/stock/report");
	};

	// Abre dialog de ajuste de estoque
	const openAdjustDialog = (product, operation) => {
		adjustProduct.value = product;
		adjustOperation.value = operation;
		adjustQuantity.value = 1;
		showAdjustDialog.value = true;
	};

	// Confirma ajuste de estoque
	const confirmAdjust = async () => {
		console.log('🔄 Iniciando ajuste de estoque:', {
			productId: adjustProduct.value._id,
			quantity: adjustQuantity.value,
			operation: adjustOperation.value
		});
		
		try {
			await stockStore.adjustStock(
				adjustProduct.value._id,
				adjustQuantity.value,
				adjustOperation.value
			);
			console.log('✅ Ajuste realizado com sucesso');
			showAdjustDialog.value = false;
			snackbarMessage.value = `Estoque ${adjustOperation.value === 'add' ? 'adicionado' : 'removido'} com sucesso!`;
			snackbarColor.value = 'success';
			showSnackbar.value = true;
		} catch (error) {
			console.error('❌ Erro ao ajustar estoque:', error);
			snackbarMessage.value = 'Erro ao ajustar estoque. Tente novamente.';
			snackbarColor.value = 'error';
			showSnackbar.value = true;
		}
	};

	// Cor da categoria
	const getCategoryColor = (category) => {
		const colors = {
			"eletrônicos": "blue",
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

	// Gera dados do sparkline (simulado)
	const getSparklineData = (product) => {
		return Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 10);
	};

	// Carrega produtos ao montar o componente
	onMounted(loadProducts);
</script>

<template>
	<v-container fluid class="pa-6">
		<!-- Header com métricas -->
		<v-row class="mb-6">
			<v-col>
				<div class="d-flex justify-space-between align-center mb-4">
					<div>
						<h1 class="text-h4 font-weight-bold mb-2">
							Gerenciamento de Estoque
						</h1>
					</div>

					<div class="d-flex ga-3">
						<v-btn
							@click="goToReport"
							color="info"
							variant="outlined"
							prepend-icon="mdi-chart-line"
							size="large"
						>
							Relatório
						</v-btn>

						<v-btn
							@click="goToNewProduct"
							color="primary"
							prepend-icon="mdi-plus"
							size="large"
							elevation="2"
						>
							Novo Produto
						</v-btn>
					</div>
				</div>

				<!-- Cards de métricas -->
				<v-row class="mb-4">
					<v-col cols="12" sm="6" md="4">
						<v-card color="success" theme="dark" elevation="4" height="120">
							<v-card-text class="pa-4">
								<div class="d-flex justify-space-between align-center">
									<div class="flex-grow-1">
										<v-card-subtitle class="text-success-lighten-2 pa-0 text-caption">
											Valor Total em Estoque
										</v-card-subtitle>
										<div class="text-h4 font-weight-bold text-truncate">
											{{ formatCurrency(totalValue) }}
										</div>
									</div>
									<v-icon size="32" class="text-success-lighten-2">
										mdi-currency-usd
									</v-icon>
								</div>
								<v-sparkline
									:value="[1000, 1200, 1500, 1800, 2100, 2400, totalValue]"
									color="white"
									height="20"
									class="mt-2"
								></v-sparkline>
							</v-card-text>
						</v-card>
					</v-col>

					<v-col cols="12" sm="6" md="3">
						<v-card color="primary" theme="dark" elevation="4" height="120">
							<v-card-text class="pa-4">
								<div class="d-flex justify-space-between align-center">
									<div>
										<v-card-subtitle class="text-primary-lighten-2 pa-0 text-caption">
											Total de Produtos
										</v-card-subtitle>
										<div class="text-h4 font-weight-bold">
											{{ stockStore.products.length }}
										</div>
									</div>
									<v-icon size="32" class="text-primary-lighten-2">
										mdi-package-variant
									</v-icon>
								</div>
								<v-sparkline
									:value="[12, 15, 18, 22, 25, 28, stockStore.products.length]"
									color="white"
									height="20"
									class="mt-2"
								></v-sparkline>
							</v-card-text>
						</v-card>
					</v-col>

					<v-col cols="12" sm="6" md="2">
						<v-card color="warning" theme="dark" elevation="4" height="120">
							<v-card-text class="pa-4">
								<div class="d-flex justify-space-between align-center">
									<div>
										<v-card-subtitle class="text-warning-lighten-2 pa-0 text-caption">
											Baixo Estoque
										</v-card-subtitle>
										<div class="text-h4 font-weight-bold">
											{{ lowStockCount }}
										</div>
									</div>
									<v-badge :content="lowStockCount" color="error">
										<v-icon size="32" class="text-warning-lighten-2">
											mdi-alert-circle
										</v-icon>
									</v-badge>
								</div>
								<v-progress-linear
									:model-value="
										(lowStockCount / stockStore.products.length) * 100
									"
									color="white"
									height="4"
									rounded
									class="mt-2"
								></v-progress-linear>
							</v-card-text>
						</v-card>
					</v-col>

					<v-col cols="12" sm="6" md="3">
						<v-card color="info" theme="dark" elevation="4" height="120">
							<v-card-text class="pa-4">
								<div class="d-flex justify-space-between align-center">
									<div>
										<v-card-subtitle class="text-info-lighten-2 pa-0 text-caption">
											Categorias
										</v-card-subtitle>
										<div class="text-h4 font-weight-bold">
											{{ categoryOptions.length - 1 }}
										</div>
									</div>
									<v-icon size="32" class="text-info-lighten-2">
										mdi-tag-multiple
									</v-icon>
								</div>
								<v-sparkline
									:value="[3, 4, 5, 4, 5, 5, categoryOptions.length - 1]"
									color="white"
									height="20"
									class="mt-2"
								></v-sparkline>
							</v-card-text>
						</v-card>
					</v-col>
				</v-row>
			</v-col>
		</v-row>

		<!-- Filtros -->
		<v-card class="mb-6" elevation="4">
			<v-card-title class="d-flex align-center bg-grey-lighten-5">
				<v-icon class="me-2" color="primary">mdi-filter-variant</v-icon>
				Filtros de Busca
				<v-spacer></v-spacer>
				<v-chip color="primary" variant="tonal" size="small">
					Filtros Ativos: {{ Object.values(filters).filter((v) => v).length }}
				</v-chip>
			</v-card-title>

			<v-card-text class="pt-6">
				<v-row>
					<v-col cols="12" md="4">
						<v-text-field
							v-model="filters.search"
							label="Buscar Produto"
							placeholder="Nome ou SKU..."
							prepend-inner-icon="mdi-magnify"
							variant="outlined"
							clearable
							density="comfortable"
						></v-text-field>
					</v-col>

					<v-col cols="12" md="4">
						<v-select
							v-model="filters.category"
							:items="categoryOptions"
							label="Categoria"
							variant="outlined"
							prepend-inner-icon="mdi-tag"
							clearable
							density="comfortable"
						></v-select>
					</v-col>

					<v-col cols="12" md="4" class="d-flex align-center">
						<v-switch
							v-model="filters.lowStock"
							label="Apenas baixo estoque"
							color="warning"
							inset
							hide-details
						></v-switch>
					</v-col>
				</v-row>

				<v-row class="mt-2">
					<v-col class="d-flex justify-end ga-3">
						<v-btn
							@click="applyFilters"
							color="primary"
							prepend-icon="mdi-magnify"
							variant="elevated"
						>
							Filtrar
						</v-btn>

						<v-btn
							@click="clearFilters"
							variant="outlined"
							prepend-icon="mdi-refresh"
						>
							Limpar
						</v-btn>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>

		<!-- Lista de produtos -->
		<v-card elevation="4">
			<v-card-title class="d-flex align-center bg-grey-lighten-5">
				<v-icon class="me-2" color="primary">mdi-package-variant</v-icon>
				Produtos em Estoque
				<v-spacer></v-spacer>
				<v-chip color="info" variant="tonal">
					{{ stockStore.products.length }} produtos
				</v-chip>
			</v-card-title>

			<!-- Loading -->
			<v-card-text v-if="isLoading" class="text-center py-12">
				<v-progress-circular
					indeterminate
					color="primary"
					size="64"
				></v-progress-circular>
				<p class="mt-4 text-h6">Carregando produtos...</p>
			</v-card-text>

			<!-- Empty State -->
			<v-card-text
				v-else-if="stockStore.products.length === 0"
				class="text-center py-12"
			>
				<v-empty-state
					icon="mdi-package-variant-closed"
					title="Nenhum produto encontrado"
					text="Comece cadastrando seu primeiro produto no estoque"
				>
					<template v-slot:actions>
						<v-btn
							@click="goToNewProduct"
							color="primary"
							prepend-icon="mdi-plus"
							size="large"
						>
							Cadastrar Produto
						</v-btn>
					</template>
				</v-empty-state>
			</v-card-text>

			<!-- Data Table -->
			<v-data-table
				v-else
				:headers="headers"
				:items="stockStore.products"
				v-model="selectedItems"
				class="elevation-0"
				item-value="_id"
				show-select
				:items-per-page="10"
				:items-per-page-options="[10, 25, 50, 100]"
			>
				<!-- Produto -->
				<template v-slot:item.name="{ item }">
					<div class="d-flex align-center py-3">
						<v-avatar color="primary" class="me-3" size="40">
							<v-icon>mdi-package-variant</v-icon>
						</v-avatar>
						<div>
							<div class="font-weight-medium text-body-1">{{ item.name }}</div>
							<div
								v-if="item.description"
								class="text-caption text-medium-emphasis"
							>
								{{ item.description.substring(0, 50)
								}}{{ item.description.length > 50 ? "..." : "" }}
							</div>
						</div>
					</div>
				</template>

				<!-- SKU -->
				<template v-slot:item.sku="{ item }">
					<v-chip size="small" variant="outlined" color="primary">
						{{ item.sku }}
					</v-chip>
				</template>

				<!-- Categoria -->
				<template v-slot:item.category="{ item }">
					<v-chip
						:color="getCategoryColor(item.category)"
						size="small"
						variant="tonal"
					>
						<v-icon start size="small">mdi-tag</v-icon>
						{{ item.category }}
					</v-chip>
				</template>

				<!-- Preço -->
				<template v-slot:item.price="{ item }">
					<div>
						<div class="font-weight-medium text-body-1">
							{{ formatCurrency(item.price) }}
						</div>
						<div class="text-caption text-success" v-if="item.cost">
							Custo: {{ formatCurrency(item.cost) }}
						</div>
					</div>
				</template>

				<!-- Estoque -->
				<template v-slot:item.quantity="{ item }">
					<div class="d-flex align-center">
						<div class="me-3">
							<div
								:class="
									item.quantity <= (item.minStock || 5)
										? 'text-error font-weight-bold'
										: 'font-weight-medium'
								"
							>
								{{ item.quantity }} un.
							</div>
							<v-chip
								v-if="item.quantity <= (item.minStock || 5)"
								color="error"
								size="x-small"
								class="mt-1"
							>
								<v-icon start size="x-small">mdi-alert</v-icon>
								Baixo
							</v-chip>
						</div>

						<!-- Sparkline do histórico -->
						<v-sparkline
							:value="getSparklineData(item)"
							:color="
								item.quantity <= (item.minStock || 5) ? 'error' : 'primary'
							"
							height="30"
							width="80"
							line-width="2"
							auto-draw
							smooth
						></v-sparkline>
					</div>
				</template>

				<!-- Ações -->
				<template v-slot:item.actions="{ item }">
					<div class="d-flex ga-1">
						<v-tooltip text="Adicionar estoque">
							<template v-slot:activator="{ props }">
								<v-btn
									v-bind="props"
									@click="openAdjustDialog(item, 'add')"
									icon="mdi-plus-circle"
									color="success"
									variant="text"
									size="small"
								></v-btn>
							</template>
						</v-tooltip>

						<v-tooltip text="Remover estoque">
							<template v-slot:activator="{ props }">
								<v-btn
									v-bind="props"
									@click="openAdjustDialog(item, 'subtract')"
									icon="mdi-minus-circle"
									color="error"
									variant="text"
									size="small"
									:disabled="item.quantity <= 0"
								></v-btn>
							</template>
						</v-tooltip>

						<v-tooltip text="Editar produto">
							<template v-slot:activator="{ props }">
								<v-btn
									v-bind="props"
									@click="editProduct(item._id)"
									icon="mdi-pencil"
									color="primary"
									variant="text"
									size="small"
								></v-btn>
							</template>
						</v-tooltip>
					</div>
				</template>
			</v-data-table>
		</v-card>

		<!-- Dialog de ajuste de estoque -->
		<v-dialog v-model="showAdjustDialog" max-width="500">
			<v-card>
				<v-card-title class="d-flex align-center">
					<v-icon
						class="me-2"
						:color="adjustOperation === 'add' ? 'success' : 'error'"
					>
						{{
							adjustOperation === "add" ? "mdi-plus-circle" : "mdi-minus-circle"
						}}
					</v-icon>
					{{ adjustOperation === "add" ? "Adicionar" : "Remover" }} Estoque
				</v-card-title>

				<v-card-text>
					<div class="mb-4">
						<strong>Produto:</strong> {{ adjustProduct?.name }}
					</div>
					<div class="mb-4">
						<strong>Estoque atual:</strong>
						{{ adjustProduct?.quantity }} unidades
					</div>

					<v-text-field
						v-model.number="adjustQuantity"
						label="Quantidade"
						type="number"
						min="1"
						:max="adjustOperation === 'subtract' ? adjustProduct?.quantity : undefined"
						variant="outlined"
						prepend-inner-icon="mdi-numeric"
						:rules="[
							v => !!v || 'Quantidade é obrigatória',
							v => v > 0 || 'Quantidade deve ser maior que zero',
							v => adjustOperation === 'add' || v <= adjustProduct?.quantity || 'Quantidade não pode ser maior que o estoque atual'
						]"
					></v-text-field>
				</v-card-text>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn @click="showAdjustDialog = false" variant="text">
						Cancelar
					</v-btn>
					<v-btn
						@click="confirmAdjust"
						:color="adjustOperation === 'add' ? 'success' : 'error'"
						variant="elevated"
					>
						Confirmar
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<!-- Snackbar para feedback -->
		<v-snackbar
			v-model="showSnackbar"
			:color="snackbarColor"
			timeout="3000"
			location="top"
		>
			{{ snackbarMessage }}
			<template v-slot:actions>
				<v-btn
					color="white"
					variant="text"
					@click="showSnackbar = false"
				>
					Fechar
				</v-btn>
			</template>
		</v-snackbar>
	</v-container>
</template>
