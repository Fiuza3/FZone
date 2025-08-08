<script setup>
	import { ref, onMounted, computed } from "vue";
	import { useAuthStore } from "../stores/auth";
	import { useTaskStore } from "../stores/task";
	import { useStockStore } from "../stores/stock";
	import { useFinanceStore } from "../stores/finance";
	import { useHRStore } from "../stores/hr";
	import { useDashboardStore } from "../stores/dashboard";
	import { useEventStore } from "../stores/event";
	import { useNotifications } from "../composables/useNotifications";
	import { useAutomaticNotifications } from "../composables/useAutomaticNotifications";

	// Stores
	const authStore = useAuthStore();
	const taskStore = useTaskStore();
	const stockStore = useStockStore();
	const financeStore = useFinanceStore();
	const hrStore = useHRStore();
	const dashboardStore = useDashboardStore();
	const eventStore = useEventStore();
	
	// Notificações
	const { 
		addNotification, 
		showSuccess, 
		showError, 
		showWarning,
		initializeIfEmpty
	} = useNotifications();
	
	// Notificações automáticas
	const { 
		startPeriodicChecks,
		generateRealNotifications
	} = useAutomaticNotifications();

	// Estado
	const isLoading = ref(true);
	const loadingMessage = ref("Carregando dados...");

	// Permissões do usuário
	const isAdmin = computed(() => authStore.isAdmin);
	const isManager = computed(() => authStore.isManager);
	const userDepartment = computed(() => authStore.userDepartment);

	// Acesso aos módulos
	const hasStockAccess = computed(
		() => isAdmin.value || userDepartment.value === "estoque"
	);
	const hasFinanceAccess = computed(
		() => isAdmin.value || userDepartment.value === "financeiro"
	);
	const hasHRAccess = computed(
		() => isAdmin.value || userDepartment.value === "rh"
	);

	// Carrega dados do dashboard
	onMounted(async () => {
		console.log("🔄 Carregando dados do dashboard avançado");

		try {
			loadingMessage.value = "Carregando métricas...";
			await dashboardStore.loadDashboard();

			// Carrega tarefas (todos têm acesso)
			loadingMessage.value = "Carregando tarefas...";
			await taskStore.fetchTasks();

			// Carrega dados de estoque se tiver acesso
			if (hasStockAccess.value) {
				loadingMessage.value = "Carregando dados de estoque...";
				await stockStore.fetchProducts({ lowStock: true });
			}

			// Carrega dados financeiros se tiver acesso
			if (hasFinanceAccess.value) {
				loadingMessage.value = "Carregando dados financeiros...";
				await financeStore.getBalance();
			}

			// Carrega dados de RH se tiver acesso
			if (hasHRAccess.value) {
				loadingMessage.value = "Carregando dados de RH...";
				await hrStore.fetchEmployees();
			}

			// Carrega eventos
			loadingMessage.value = "Carregando eventos...";
			await eventStore.fetchEvents();

			console.log("✅ Dashboard avançado carregado com sucesso");
			
			// Inicializar notificações se necessário
			initializeIfEmpty();
			
			// Executar verificações com dados reais
			generateRealNotifications();
			
			// Iniciar verificações periódicas
			startPeriodicChecks();
			
			showSuccess('Dashboard carregado com sucesso!');
		} catch (error) {
			console.error("❌ Erro ao carregar dashboard:", error);
			showError('Erro ao carregar dados do dashboard');
		} finally {
			isLoading.value = false;
		}
	});

	// Formatação de valores monetários
	const formatCurrency = (value) => {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	};

	// Eventos ordenados por data (mais próximo primeiro)
	const sortedEvents = computed(() => {
		const now = new Date();
		return eventStore.events
			.filter(event => new Date(event.startDate) >= now && event.status !== 'cancelado')
			.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
	});

	// Breadcrumbs
	const breadcrumbs = [
		{
			title: "Dashboard",
			disabled: true,
		},
	];
</script>

<template>
	<div>
		<!-- Tela de carregamento -->
		<v-container v-if="isLoading" fluid fill-height>
			<v-row justify="center" align="center">
				<v-col cols="auto" class="text-center">
					<v-progress-circular
						indeterminate
						color="primary"
						size="64"
					></v-progress-circular>
					<p class="mt-4">{{ loadingMessage }}</p>
				</v-col>
			</v-row>
		</v-container>

		<!-- Conteúdo do dashboard -->
		<div v-else>
			<!-- Boas-vindas -->
			<v-card class="mb-6" elevation="2">
				<v-card-title class="d-flex align-center">
					<v-avatar color="primary" class="me-3">
						<span class="text-h6">{{
							authStore.userName.charAt(0).toUpperCase()
						}}</span>
					</v-avatar>
					<div>
						<h2 class="text-h5">Bem-vindo, {{ authStore.userName }}!</h2>
						<v-card-subtitle class="pa-0">
							Dashboard executivo da
							{{ authStore.user?.company?.name || "sua empresa" }}
						</v-card-subtitle>
					</div>
				</v-card-title>
			</v-card>

			<!-- Métricas Avançadas -->
			<v-row v-if="dashboardStore.metrics" class="mb-6">
				<!-- Total de Eventos -->
				<v-col cols="12" sm="6" lg="3">
					<v-card color="primary-lighten-4" elevation="8">
						<v-card-text>
							<div class="d-flex justify-space-between align-center">
								<div>
									<v-card-subtitle class="text-primary-darken-2 pa-0"
										>Total de Eventos</v-card-subtitle
									>
									<div class="text-h3 font-weight-bold text-black">
										{{ dashboardStore.metrics.events.total }}
									</div>
									<div class="text-caption mt-1 text-black">
										{{ dashboardStore.metrics.events.thisMonth }} este mês
									</div>
								</div>
								<v-icon size="48" class="text-primary-darken-1"
									>mdi-calendar-multiple</v-icon
								>
							</div>
							<v-sparkline
								:value="[2, 5, 3, 8, 7, 12, 15]"
								color="primary"
								height="40"
								class="mt-3"
							></v-sparkline>
						</v-card-text>
					</v-card>
				</v-col>

				<!-- Receita Mensal -->
				<v-col cols="12" sm="6" lg="3">
					<v-card color="success-lighten-4" elevation="8">
						<v-card-text>
							<div class="d-flex justify-space-between align-center">
								<div>
									<v-card-subtitle class="text-success-darken-2 pa-0"
										>Receita Mensal</v-card-subtitle
									>
									<div class="text-h3 font-weight-bold text-black">
										{{
											formatCurrency(dashboardStore.metrics.revenue.thisMonth)
										}}
									</div>
									<div class="text-caption mt-1 text-black">
										<v-icon size="small" class="me-1">mdi-trending-up</v-icon>
										{{ dashboardStore.monthlyGrowth }}% crescimento
									</div>
								</div>
								<v-icon size="48" class="text-success-darken-1"
									>mdi-currency-usd</v-icon
								>
							</div>
							<v-sparkline
								:value="[10, 15, 12, 20, 18, 25, 30]"
								color="success"
								height="40"
								class="mt-3"
							></v-sparkline>
						</v-card-text>
					</v-card>
				</v-col>

				<!-- Próximos Eventos -->
				<v-col cols="12" sm="6" lg="3">
					<v-card color="info-lighten-4" elevation="8">
						<v-card-text>
							<div class="d-flex justify-space-between align-center">
								<div>
									<v-card-subtitle class="text-info-darken-2 pa-0"
										>Próximos Eventos</v-card-subtitle
									>
									<div class="text-h3 font-weight-bold text-black">
										{{ dashboardStore.metrics.events.upcoming }}
									</div>
									<div class="text-caption mt-1 text-black">Próximos 30 dias</div>
								</div>
								<v-icon size="48" class="text-info-darken-1"
									>mdi-calendar-clock</v-icon
								>
							</div>
							<v-progress-linear
								:model-value="
									(dashboardStore.metrics.events.upcoming / 20) * 100
								"
								color="info"
								height="6"
								rounded
								class="mt-3"
							></v-progress-linear>
						</v-card-text>
					</v-card>
				</v-col>

				<!-- Alertas -->
				<v-col cols="12" sm="6" lg="3">
					<v-card color="warning-lighten-4" elevation="8">
						<v-card-text>
							<div class="d-flex justify-space-between align-center">
								<div>
									<v-card-subtitle class="text-warning-darken-2 pa-0"
										>Alertas</v-card-subtitle
									>
									<div class="text-h3 font-weight-bold text-black">
										{{ dashboardStore.totalAlerts }}
									</div>
									<div class="text-caption mt-1 text-black">
										{{ dashboardStore.metrics.alerts.lowStock }} estoque baixo
									</div>
								</div>
								<v-badge :content="dashboardStore.totalAlerts" color="error">
									<v-icon size="48" class="text-warning-darken-1"
										>mdi-alert-circle</v-icon
									>
								</v-badge>
							</div>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>

			<!-- Slide de Eventos Próximos -->
			<v-card class="mb-6" elevation="4">
				<v-card-title class="d-flex align-center">
					<v-icon class="me-2" color="primary">mdi-calendar-clock</v-icon>
					Próximos Eventos
					<v-spacer></v-spacer>
					<v-chip color="info" variant="tonal">
						{{ sortedEvents.length }} eventos
					</v-chip>
				</v-card-title>
				
				<v-card-text v-if="sortedEvents.length === 0">
					<v-empty-state
						icon="mdi-calendar-outline"
						title="Nenhum evento próximo"
						text="Todos os eventos foram concluídos ou não há eventos agendados"
					></v-empty-state>
				</v-card-text>
				
				<v-slide-group v-else show-arrows class="pa-4">
					<v-slide-group-item v-for="event in sortedEvents" :key="event._id">
						<v-card
							class="ma-2"
							width="300"
							height="200"
							elevation="3"
							hover
							:color="event.status === 'confirmado' ? 'primary' : event.status === 'planejado' ? 'warning' : 'info'"
							variant="tonal"
						>
							<v-card-title class="d-flex align-center">
								<v-icon class="me-2">mdi-calendar</v-icon>
								<span class="text-truncate">{{ event.title }}</span>
							</v-card-title>
							
							<v-card-text>
								<div class="d-flex align-center mb-2">
									<v-icon size="small" class="me-1">mdi-clock</v-icon>
									<span class="text-body-2">
										{{ new Date(event.startDate).toLocaleDateString('pt-BR') }}
									</span>
								</div>
								
								<div class="d-flex align-center mb-2" v-if="event.location">
									<v-icon size="small" class="me-1">mdi-map-marker</v-icon>
									<span class="text-body-2 text-truncate">{{ event.location }}</span>
								</div>
								
								<div class="d-flex align-center mb-2" v-if="event.guests">
									<v-icon size="small" class="me-1">mdi-account-group</v-icon>
									<span class="text-body-2">{{ event.guests }} convidados</span>
								</div>
								
								<div class="d-flex justify-space-between align-center mt-3">
									<v-chip
										:color="event.status === 'confirmado' ? 'success' : event.status === 'planejado' ? 'warning' : 'info'"
										size="small"
									>
										{{ event.status === 'confirmado' ? 'Confirmado' : event.status === 'planejado' ? 'Planejado' : 'Em Andamento' }}
									</v-chip>
									
									<span class="text-success font-weight-bold" v-if="event.budget">
										{{ formatCurrency(event.budget) }}
									</span>
								</div>
							</v-card-text>
						</v-card>
					</v-slide-group-item>
				</v-slide-group>
				
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn to="/events" variant="text" color="primary" append-icon="mdi-arrow-right">
						Ver todos os eventos
					</v-btn>
				</v-card-actions>
			</v-card>

			<!-- Cards de resumo com ações rápidas -->
			<v-row class="mb-6">
				<!-- Tarefas pendentes -->
				<v-col cols="12" sm="6" lg="3">
					<v-card elevation="4" hover>
						<v-card-text>
							<div class="d-flex justify-space-between align-center">
								<div>
									<v-card-subtitle class="pa-0 text-primary"
										>Tarefas Pendentes</v-card-subtitle
									>
									<div class="text-h4 font-weight-bold text-primary">
										{{ taskStore.pendingTasks.length }}
									</div>
								</div>
								<v-avatar color="primary" size="56">
									<v-icon size="28">mdi-clipboard-check</v-icon>
								</v-avatar>
							</div>
							<v-progress-linear
								:model-value="(taskStore.pendingTasks.length / 20) * 100"
								color="primary"
								height="4"
								rounded
								class="mt-3"
							></v-progress-linear>
						</v-card-text>
						<v-card-actions>
							<v-btn
								to="/tasks"
								variant="text"
								color="primary"
								prepend-icon="mdi-arrow-right"
							>
								Ver tarefas
							</v-btn>
						</v-card-actions>
					</v-card>
				</v-col>

				<!-- Baixo Estoque -->
				<v-col v-if="hasStockAccess" cols="12" sm="6" lg="3">
					<v-card elevation="4" hover>
						<v-card-text>
							<div class="d-flex justify-space-between align-center">
								<div>
									<v-card-subtitle class="pa-0 text-warning"
										>Baixo Estoque</v-card-subtitle
									>
									<div class="text-h4 font-weight-bold text-warning">
										{{ stockStore.lowStockProducts.length }}
									</div>
								</div>
								<v-avatar color="warning" size="56">
									<v-icon size="28">mdi-package-variant</v-icon>
								</v-avatar>
							</div>
							<v-chip
								v-if="stockStore.lowStockProducts.length > 0"
								color="error"
								size="small"
								class="mt-2"
							>
								<v-icon start size="small">mdi-alert</v-icon>
								Atenção necessária
							</v-chip>
						</v-card-text>
						<v-card-actions>
							<v-btn
								to="/stock"
								variant="text"
								color="warning"
								prepend-icon="mdi-arrow-right"
							>
								Gerenciar estoque
							</v-btn>
						</v-card-actions>
					</v-card>
				</v-col>

				<!-- Balanço Financeiro -->
				<v-col v-if="hasFinanceAccess" cols="12" sm="6" lg="3">
					<v-card elevation="4" hover>
						<v-card-text>
							<div class="d-flex justify-space-between align-center">
								<div>
									<v-card-subtitle class="pa-0 text-success"
										>Balanço</v-card-subtitle
									>
									<div class="text-h4 font-weight-bold text-success">
										{{
											financeStore.balance
												? formatCurrency(financeStore.balance.balance)
												: "R$ 0,00"
										}}
									</div>
								</div>
								<v-avatar color="success" size="56">
									<v-icon size="28">mdi-currency-usd</v-icon>
								</v-avatar>
							</div>
							<v-rating
								:model-value="4.5"
								color="amber"
								density="compact"
								half-increments
								readonly
								size="small"
								class="mt-2"
							></v-rating>
						</v-card-text>
						<v-card-actions>
							<v-btn
								to="/finance"
								variant="text"
								color="success"
								prepend-icon="mdi-arrow-right"
							>
								Ver financeiro
							</v-btn>
						</v-card-actions>
					</v-card>
				</v-col>

				<!-- Funcionários -->
				<v-col v-if="hasHRAccess" cols="12" sm="6" lg="3">
					<v-card elevation="4" hover>
						<v-card-text>
							<div class="d-flex justify-space-between align-center">
								<div>
									<v-card-subtitle class="pa-0 text-info"
										>Funcionários</v-card-subtitle
									>
									<div class="text-h4 font-weight-bold text-info">
										{{ hrStore.activeEmployees.length }}
									</div>
								</div>
								<v-avatar color="info" size="56">
									<v-icon size="28">mdi-account-group</v-icon>
								</v-avatar>
							</div>
							<div class="d-flex align-center mt-2" v-if="hrStore.activeEmployees.length > 0">
								<div class="d-flex">
									<v-avatar v-for="n in Math.min(3, hrStore.activeEmployees.length)" :key="n" color="info" size="24" class="me-1">
										<span class="text-caption">{{
											String.fromCharCode(65 + n - 1)
										}}</span>
									</v-avatar>
								</div>
								<span v-if="hrStore.activeEmployees.length > 3" class="text-caption ms-2"
									>+{{ hrStore.activeEmployees.length - 3 }} mais</span
								>
							</div>
							<div v-else class="text-caption mt-2 text-grey">
								Carregando funcionários...
							</div>
						</v-card-text>
						<v-card-actions>
							<v-btn
								to="/hr"
								variant="text"
								color="info"
								prepend-icon="mdi-arrow-right"
							>
								Gerenciar pessoas
							</v-btn>
						</v-card-actions>
					</v-card>
				</v-col>
			</v-row>

			<!-- Gráfico de Receitas -->
			<v-card
				v-if="dashboardStore.revenueChart.length > 0"
				class="mb-6"
				elevation="4"
			>
				<v-card-title class="d-flex align-center">
					<v-icon class="me-2" color="primary">mdi-chart-line</v-icon>
					Receitas dos Últimos 12 Meses
					<v-spacer></v-spacer>
					<v-chip color="success" variant="tonal">
						<v-icon start>mdi-trending-up</v-icon>
						+{{ dashboardStore.monthlyGrowth }}%
					</v-chip>
				</v-card-title>
				<v-card-text>
					<v-sparkline
						:value="
							dashboardStore.revenueChart.slice(-12).map((m) => m.revenue)
						"
						:labels="dashboardStore.revenueChart.slice(-12).map((m) => m.month)"
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
				</v-card-text>
			</v-card>

			<!-- Eventos Próximos -->
			<v-card
				v-if="dashboardStore.upcomingEvents.length > 0"
				class="mb-6"
				elevation="4"
			>
				<v-card-title class="d-flex align-center">
					<v-icon class="me-2" color="primary">mdi-calendar-multiple</v-icon>
					Eventos Próximos
					<v-spacer></v-spacer>
					<v-badge
						:content="dashboardStore.upcomingEvents.length"
						color="primary"
					>
						<v-icon>mdi-calendar</v-icon>
					</v-badge>
				</v-card-title>
				<v-card-text>
					<v-timeline density="compact" side="end">
						<v-timeline-item
							v-for="event in dashboardStore.upcomingEvents.slice(0, 5)"
							:key="event._id"
							:dot-color="
								event.status === 'planejado'
									? 'warning'
									: event.status === 'confirmado'
									? 'primary'
									: 'success'
							"
							size="small"
						>
							<template v-slot:opposite>
								<div class="text-caption">
									{{ new Date(event.startDate).toLocaleDateString("pt-BR") }}
								</div>
							</template>

							<v-card
								variant="tonal"
								:color="
									event.status === 'planejado'
										? 'warning'
										: event.status === 'confirmado'
										? 'primary'
										: 'success'
								"
							>
								<v-card-text class="py-2">
									<div class="d-flex justify-space-between align-center">
										<div>
											<div class="font-weight-medium">{{ event.title }}</div>
											<div class="text-caption d-flex align-center mt-1">
												<v-icon size="small" class="me-1"
													>mdi-map-marker</v-icon
												>
												{{ event.location }}
											</div>
										</div>
										<div class="text-right">
											<v-chip
												:color="
													event.status === 'planejado'
														? 'warning'
														: event.status === 'confirmado'
														? 'primary'
														: 'success'
												"
												size="small"
											>
												{{
													event.status === "planejado"
														? "Planejado"
														: event.status === "confirmado"
														? "Confirmado"
														: "Em Andamento"
												}}
											</v-chip>
											<div class="text-success font-weight-bold mt-1">
												{{ formatCurrency(event.revenue) }}
											</div>
										</div>
									</div>
								</v-card-text>
							</v-card>
						</v-timeline-item>
					</v-timeline>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn
						to="/events"
						variant="text"
						color="primary"
						append-icon="mdi-arrow-right"
					>
						Ver todos os eventos
					</v-btn>
				</v-card-actions>
			</v-card>

			<!-- Tarefas recentes -->
			<v-card class="mb-6" elevation="4">
				<v-card-title class="d-flex align-center">
					<v-icon class="me-2" color="primary">mdi-clipboard-list</v-icon>
					Tarefas Recentes
					<v-spacer></v-spacer>
					<v-tooltip text="Adicionar nova tarefa">
						<template v-slot:activator="{ props }">
							<v-btn
								icon="mdi-plus"
								color="primary"
								size="small"
								v-bind="props"
							></v-btn>
						</template>
					</v-tooltip>
				</v-card-title>

				<v-card-text v-if="taskStore.tasks.length === 0">
					<v-empty-state
						icon="mdi-clipboard-outline"
						title="Nenhuma tarefa encontrada"
						text="Comece criando sua primeira tarefa"
					></v-empty-state>
				</v-card-text>

				<v-list v-else>
					<v-list-item
						v-for="task in taskStore.tasks.slice(0, 5)"
						:key="task._id"
						class="px-4"
					>
						<template v-slot:prepend>
							<v-checkbox-btn
								:model-value="task.status === 'concluida'"
								color="success"
								readonly
							></v-checkbox-btn>
						</template>

						<v-list-item-title class="font-weight-medium">
							{{ task.title }}
						</v-list-item-title>

						<v-list-item-subtitle v-if="task.description">
							{{
								task.description.substring(0, 100) +
								(task.description.length > 100 ? "..." : "")
							}}
						</v-list-item-subtitle>

						<template v-slot:append>
							<v-chip
								:color="
									task.status === 'pendente'
										? 'warning'
										: task.status === 'em_andamento'
										? 'primary'
										: task.status === 'concluida'
										? 'success'
										: 'error'
								"
								size="small"
								variant="tonal"
							>
								{{
									task.status === "pendente"
										? "Pendente"
										: task.status === "em_andamento"
										? "Em andamento"
										: task.status === "concluida"
										? "Concluída"
										: "Cancelada"
								}}
							</v-chip>
						</template>
					</v-list-item>
				</v-list>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn
						to="/tasks"
						variant="text"
						color="primary"
						append-icon="mdi-arrow-right"
					>
						Ver todas as tarefas
					</v-btn>
				</v-card-actions>
			</v-card>
		</div>
	</div>
</template>
