<script setup>
	import { ref, onMounted, computed } from "vue";
	import { useRouter, useRoute } from "vue-router";
	import { useStockStore } from "../../stores/stock";

	const router = useRouter();
	const route = useRoute();
	const stockStore = useStockStore();

	// Referências do formulário
	const form = ref(null);
	const isLoading = ref(false);
	const isEditing = computed(() => !!route.params.id);
	const showSuccessDialog = ref(false);

	// Estado do formulário
	const product = ref({
		name: "",
		description: "",
		sku: "",
		category: "outros",
		price: 0,
		cost: 0,
		quantity: 0,
		minStock: 5,
		supplier: "",
		unit: "un",
	});

	// Opções de categoria
	const categoryOptions = [
		{ title: "Eletrônicos", value: "eletrônicos" },
		{ title: "Roupas", value: "roupas" },
		{ title: "Casa", value: "casa" },
		{ title: "Esporte", value: "esporte" },
		{ title: "Livros", value: "livros" },
		{ title: "Automotivo", value: "automotivo" },
		{ title: "Outros", value: "outros" },
	];

	// Opções de unidade
	const unitOptions = [
		{ title: "Unidade", value: "un" },
		{ title: "Quilograma", value: "kg" },
		{ title: "Litro", value: "l" },
		{ title: "Metro", value: "m" },
		{ title: "Pacote", value: "pct" },
	];

	// Breadcrumbs
	const breadcrumbs = [
		{ title: "Dashboard", to: "/" },
		{ title: "Estoque", to: "/stock" },
		{
			title: isEditing.value ? "Editar Produto" : "Novo Produto",
			disabled: true,
		},
	];

	// Regras de validação
	const rules = {
		required: (value) => !!value || "Campo obrigatório",
		minLength: (length) => (value) =>
			(value && value.length >= length) || `Mínimo ${length} caracteres`,
		positive: (value) => value > 0 || "Valor deve ser maior que zero",
		sku: (value) => {
			if (!value) return "SKU é obrigatório";
			if (value.length < 3) return "SKU deve ter pelo menos 3 caracteres";
			return true;
		},
	};

	// Computed
	const profitMargin = computed(() => {
		if (product.value.cost <= 0) return 0;
		const margin =
			((product.value.price - product.value.cost) / product.value.cost) * 100;
		return parseFloat(margin.toFixed(2));
	});

	const profitMarginColor = computed(() => {
		if (profitMargin.value <= 0) return "error";
		if (profitMargin.value < 15) return "warning";
		if (profitMargin.value > 50) return "success";
		return "info";
	});

	const totalValue = computed(() => {
		return product.value.quantity * product.value.price;
	});

	// Carrega dados do produto se estiver editando
	onMounted(async () => {
		if (isEditing.value) {
			isLoading.value = true;
			try {
				await stockStore.fetchProducts();
				const existingProduct = stockStore.products.find(
					(p) => p._id === route.params.id
				);
				if (existingProduct) {
					product.value = { ...existingProduct };
				}
			} catch (error) {
				console.error("Erro ao carregar produto:", error);
			} finally {
				isLoading.value = false;
			}
		}
	});

	// Estado para snackbar
	const showSnackbar = ref(false);
	const snackbarMessage = ref('');
	const showDeleteDialog = ref(false);

	// Gera SKU automático
	const generateSKU = () => {
		if (!product.value.name || !product.value.category) {
			snackbarMessage.value = 'Preencha o nome do produto e selecione uma categoria primeiro!';
			showSnackbar.value = true;
			return;
		}
		
		const prefix = product.value.category.substring(0, 3).toUpperCase();
		let namePart = product.value.name
			.replace(/[^a-zA-Z]/g, '') // Remove caracteres especiais
			.substring(0, 3)
			.toUpperCase();
			
		// Se não sobrou nada após remover caracteres especiais, usa 'PRD'
		if (!namePart) {
			namePart = 'PRD';
		}
		
		const randomNum = Math.floor(Math.random() * 10000)
			.toString()
			.padStart(4, '0');
			
		product.value.sku = `${prefix}-${namePart}-${randomNum}`;
	};

	// Salva o produto
	const saveProduct = async () => {
		const { valid } = await form.value.validate();
		if (!valid) return;

		isLoading.value = true;

		try {
			if (isEditing.value) {
				await stockStore.updateProduct(route.params.id, product.value);
			} else {
				await stockStore.createProduct(product.value);
			}

			showSuccessDialog.value = true;
		} catch (error) {
			console.error("Erro ao salvar produto:", error);
		} finally {
			isLoading.value = false;
		}
	};

	// Confirma sucesso e volta para lista
	const confirmSuccess = () => {
		showSuccessDialog.value = false;
		router.push("/stock");
	};

	// Cancela e volta para a lista
	const cancelForm = () => {
		router.push("/stock");
	};

	// Exclui o produto
	const deleteProduct = async () => {
		try {
			await stockStore.deleteProduct(route.params.id);
			showDeleteDialog.value = false;
			router.push('/stock');
		} catch (error) {
			console.error('Erro ao excluir produto:', error);
			snackbarMessage.value = 'Erro ao excluir produto. Tente novamente.';
			showSnackbar.value = true;
		}
	};

	// Formata moeda
	const formatCurrency = (value) => {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
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
						<h1 class="text-h4 font-weight-bold mb-2">
							{{ isEditing ? "Editar Produto" : "Novo Produto" }}
						</h1>
					</div>

					<div class="d-flex ga-3">
						<v-btn
							@click="cancelForm"
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
		<v-row v-if="isLoading && isEditing" justify="center">
			<v-col cols="auto" class="text-center">
				<v-progress-circular
					indeterminate
					color="primary"
					size="64"
				></v-progress-circular>
				<p class="mt-4 text-h6">Carregando dados do produto...</p>
			</v-col>
		</v-row>

		<!-- Formulário -->
		<v-form v-else ref="form" @submit.prevent="saveProduct">
			<v-row>
				<!-- Coluna principal -->
				<v-col cols="12" lg="8">
					<!-- Informações básicas -->
					<v-card class="mb-6" elevation="4">
						<v-card-title class="d-flex align-center bg-grey-lighten-5">
							<v-icon class="me-2" color="primary">mdi-information</v-icon>
							Informações Básicas
						</v-card-title>

						<v-card-text class="pt-6">
							<v-row>
								<v-col cols="12">
									<v-text-field
										v-model="product.name"
										label="Nome do Produto"
										placeholder="Digite o nome do produto"
										prepend-inner-icon="mdi-package-variant"
										variant="outlined"
										:rules="[rules.required, rules.minLength(3)]"
										density="comfortable"
									></v-text-field>
								</v-col>

								<v-col cols="12">
									<v-textarea
										v-model="product.description"
										label="Descrição"
										placeholder="Descrição detalhada do produto"
										prepend-inner-icon="mdi-text"
										variant="outlined"
										rows="3"
										density="comfortable"
									></v-textarea>
								</v-col>

								<v-col cols="12" md="6">
									<v-text-field
										v-model="product.sku"
										label="SKU"
										placeholder="Código único do produto"
										prepend-inner-icon="mdi-barcode"
										variant="outlined"
										:rules="[rules.sku]"
										density="comfortable"
									>
										<template v-slot:append-inner>
											<v-btn
												@click="generateSKU"
												icon="mdi-autorenew"
												variant="text"
												size="small"
												color="primary"
												title="Gerar SKU automático"
											></v-btn>
										</template>
									</v-text-field>
								</v-col>

								<v-col cols="12" md="6">
									<v-select
										v-model="product.category"
										:items="categoryOptions"
										label="Categoria"
										prepend-inner-icon="mdi-tag"
										variant="outlined"
										density="comfortable"
									></v-select>
								</v-col>
							</v-row>
						</v-card-text>
					</v-card>

					<!-- Preços e custos -->
					<v-card class="mb-6" elevation="4">
						<v-card-title class="d-flex align-center bg-grey-lighten-5">
							<v-icon class="me-2" color="success">mdi-currency-usd</v-icon>
							Preços e Custos
						</v-card-title>

						<v-card-text class="pt-6">
							<v-row>
								<v-col cols="12" md="4">
									<v-text-field
										v-model.number="product.price"
										label="Preço de Venda"
										type="number"
										min="0"
										step="0.01"
										prepend-inner-icon="mdi-currency-usd"
										variant="outlined"
										:rules="[rules.required, rules.positive]"
										density="comfortable"
									></v-text-field>
								</v-col>

								<v-col cols="12" md="4">
									<v-text-field
										v-model.number="product.cost"
										label="Custo"
										type="number"
										min="0"
										step="0.01"
										prepend-inner-icon="mdi-calculator"
										variant="outlined"
										:rules="[rules.required, rules.positive]"
										density="comfortable"
									></v-text-field>
								</v-col>

								<v-col cols="12" md="4">
									<v-text-field
										:model-value="profitMargin + '%'"
										label="Margem de Lucro"
										prepend-inner-icon="mdi-percent"
										variant="outlined"
										readonly
										:color="profitMarginColor"
										density="comfortable"
									></v-text-field>
								</v-col>
							</v-row>
						</v-card-text>
					</v-card>

					<!-- Estoque -->
					<v-card class="mb-6" elevation="4">
						<v-card-title class="d-flex align-center bg-grey-lighten-5">
							<v-icon class="me-2" color="warning"
								>mdi-package-variant-closed</v-icon
							>
							Controle de Estoque
						</v-card-title>

						<v-card-text class="pt-6">
							<v-row>
								<v-col cols="12" md="4">
									<v-text-field
										v-model.number="product.quantity"
										label="Quantidade em Estoque"
										type="number"
										min="0"
										prepend-inner-icon="mdi-numeric"
										variant="outlined"
										density="comfortable"
									></v-text-field>
								</v-col>

								<v-col cols="12" md="4">
									<v-text-field
										v-model.number="product.minStock"
										label="Estoque Mínimo"
										type="number"
										min="0"
										prepend-inner-icon="mdi-alert-circle"
										variant="outlined"
										density="comfortable"
										hint="Alerta será exibido quando atingir este valor"
										persistent-hint
									></v-text-field>
								</v-col>

								<v-col cols="12" md="4">
									<v-select
										v-model="product.unit"
										:items="unitOptions"
										label="Unidade de Medida"
										prepend-inner-icon="mdi-ruler"
										variant="outlined"
										density="comfortable"
									></v-select>
								</v-col>
							</v-row>
						</v-card-text>
					</v-card>

					<!-- Fornecedor -->
					<v-card elevation="4">
						<v-card-title class="d-flex align-center bg-grey-lighten-5">
							<v-icon class="me-2" color="info">mdi-truck</v-icon>
							Informações do Fornecedor
						</v-card-title>

						<v-card-text class="pt-6">
							<v-text-field
								v-model="product.supplier"
								label="Fornecedor"
								placeholder="Nome do fornecedor"
								prepend-inner-icon="mdi-domain"
								variant="outlined"
								density="comfortable"
							></v-text-field>
						</v-card-text>
					</v-card>
				</v-col>

				<!-- Sidebar com resumo -->
				<v-col cols="12" lg="4">
					<!-- Resumo do produto -->
					<v-card class="mb-6" elevation="4" color="primary" theme="dark">
						<v-card-title class="d-flex align-center">
							<v-icon class="me-2">mdi-chart-line</v-icon>
							Resumo do Produto
						</v-card-title>

						<v-card-text>
							<div class="mb-4">
								<div class="text-caption text-primary-lighten-2">
									Valor Total em Estoque
								</div>
								<div class="text-h4 font-weight-bold">
									{{ formatCurrency(totalValue) }}
								</div>
							</div>

							<div class="mb-4">
								<div class="text-caption text-primary-lighten-2">
									Margem de Lucro
								</div>
								<div class="text-h5 font-weight-bold">{{ profitMargin }}%</div>
							</div>

							<v-sparkline
								:value="[product.cost, product.price, totalValue]"
								color="white"
								height="60"
								class="mt-4"
							></v-sparkline>
						</v-card-text>
					</v-card>

					<!-- Ações -->
					<v-card elevation="4">
						<v-card-title class="d-flex align-center bg-grey-lighten-5">
							<v-icon class="me-2" color="primary">mdi-cog</v-icon>
							Ações
						</v-card-title>

						<v-card-text class="pt-6">
							<div class="d-flex flex-column ga-3">
								<v-btn
									type="submit"
									color="primary"
									size="large"
									block
									:loading="isLoading"
									prepend-icon="mdi-content-save"
									variant="elevated"
								>
									{{ isEditing ? "Atualizar" : "Cadastrar" }} Produto
								</v-btn>

								<v-btn
									@click="cancelForm"
									variant="outlined"
									size="large"
									block
									prepend-icon="mdi-cancel"
								>
									Cancelar
								</v-btn>

								<v-divider class="my-2"></v-divider>

								<v-btn
									v-if="!isEditing"
									@click="generateSKU"
									variant="text"
									size="large"
									block
									prepend-icon="mdi-autorenew"
								>
									Gerar SKU Automático
								</v-btn>

								<v-btn
									v-if="isEditing"
									@click="showDeleteDialog = true"
									variant="text"
									size="large"
									block
									prepend-icon="mdi-delete"
									color="error"
								>
									Excluir Produto
								</v-btn>
							</div>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>
		</v-form>

		<!-- Dialog de sucesso -->
		<v-dialog v-model="showSuccessDialog" max-width="400">
			<v-card>
				<v-card-title class="d-flex align-center text-success">
					<v-icon class="me-2" color="success">mdi-check-circle</v-icon>
					Sucesso!
				</v-card-title>

				<v-card-text>
					Produto {{ isEditing ? "atualizado" : "cadastrado" }} com sucesso!
				</v-card-text>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn @click="confirmSuccess" color="success" variant="elevated">
						OK
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<!-- Snackbar para avisos -->
		<v-snackbar
			v-model="showSnackbar"
			color="warning"
			timeout="4000"
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

		<!-- Dialog de confirmação de exclusão -->
		<v-dialog v-model="showDeleteDialog" max-width="400">
			<v-card>
				<v-card-title class="d-flex align-center text-error">
					<v-icon class="me-2" color="error">mdi-alert-circle</v-icon>
					Confirmar Exclusão
				</v-card-title>

				<v-card-text>
					Tem certeza que deseja excluir o produto "{{ product.name }}"?
					<br><br>
					<strong>Esta ação não pode ser desfeita.</strong>
				</v-card-text>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn @click="showDeleteDialog = false" variant="text">
						Cancelar
					</v-btn>
					<v-btn @click="deleteProduct" color="error" variant="elevated">
						Excluir
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</v-container>
</template>
