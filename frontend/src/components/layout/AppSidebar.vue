<script setup>
	import { computed, ref } from "vue";
	import { useRouter, useRoute } from "vue-router";
	import { useAuthStore } from "../../stores/auth";

	const router = useRouter();
	const route = useRoute();
	const authStore = useAuthStore();
	// Computed para drawer
	const drawer = computed({
		get: () => props.drawerOpen,
		set: (value) => {
			emit("toggle-drawer");
		},
	});

	// Verifica permissões do usuário
	const isAdmin = computed(() => authStore.isAdmin);

	// Props e emits
	const props = defineProps({
		drawerOpen: {
			type: Boolean,
			default: true,
		},
		isDarkMode: {
			type: Boolean,
			default: false,
		},
	});

	const emit = defineEmits(["toggle-drawer", "toggle-theme"]);

	// Navega para a rota
	const navigateTo = (path) => {
		router.push(path);
	};

	// Realiza logout
	const handleLogout = () => {
		authStore.logout();
		router.push("/login");
	};

	// Alterna tema
	const toggleTheme = () => {
		emit("toggle-theme");
	};

	// Menu items organizados
	const menuItems = computed(() => [
		{
			title: "Geral",
			items: [
				{ title: "Dashboard", icon: "mdi-view-dashboard", to: "/", show: true },
				{
					title: "Tarefas",
					icon: "mdi-clipboard-check",
					to: "/tasks",
					show: true,
				},
				{
					title: "Notificações",
					icon: "mdi-bell",
					to: "/notifications",
					show: true,
				},
				{
					title: "Estoque",
					icon: "mdi-package-variant",
					to: "/stock",
					show: authStore.hasPermission("stock"),
				},
				{
					title: "Financeiro",
					icon: "mdi-currency-usd",
					to: "/finance",
					show: authStore.hasPermission("finance"),
				},
				{
					title: "Pessoas",
					icon: "mdi-account-group",
					to: "/hr",
					show: authStore.hasPermission("hr"),
				},
				{ title: "Eventos", icon: "mdi-calendar", to: "/events", show: true },
				{
					title: "Calendário",
					icon: "mdi-calendar-month",
					to: "/calendar",
					show: true,
				},
				{
					title: "Contas",
					icon: "mdi-account-circle",
					to: "/accounts",
					show: isAdmin.value,
				},
			],
		},

		{
			title: "Configurações",
			items: [
				{
					title: "Meu Perfil",
					icon: "mdi-account",
					to: "/profile",
					show: true,
				},
				{
					title: "Configurações",
					icon: "mdi-cog",
					to: "/settings",
					show: true,
				},
				{
					title: "Empresa",
					icon: "mdi-domain",
					to: "/company-settings",
					show: isAdmin.value,
				},
				{ title: "Ajuda", icon: "mdi-help-circle", to: "/help", show: true },
			],
		},
	]);
</script>

<template>
	<v-navigation-drawer v-model="drawer" :width="280">
		<!-- Menu Items -->
		<template v-for="section in menuItems" :key="section.title">
			<v-list-subheader class="ms-4 font-weight-bold text-subtitle-1">{{
				section.title
			}}</v-list-subheader>

			<v-list density="compact" nav>
				<v-list-item
					v-for="item in section.items.filter((i) => i.show)"
					:key="item.to"
					:prepend-icon="item.icon"
					:title="item.title"
					:to="item.to"
					:active="
						route.path === item.to ||
						(item.to !== '/' && route.path.startsWith(item.to))
					"
					color="primary"
					@click="navigateTo(item.to)"
				></v-list-item>
			</v-list>
		</template>

		<v-divider></v-divider>

		<!-- Tema e Logout -->
		<v-list density="compact" nav>
			<v-list-item
				:prepend-icon="isDarkMode ? 'mdi-weather-sunny' : 'mdi-weather-night'"
				:title="isDarkMode ? 'Modo Claro' : 'Modo Escuro'"
				@click="toggleTheme"
				color="secondary"
			></v-list-item>

			<v-list-item
				prepend-icon="mdi-logout"
				title="Sair"
				@click="handleLogout"
				color="error"
			></v-list-item>
		</v-list>
	</v-navigation-drawer>
</template>
