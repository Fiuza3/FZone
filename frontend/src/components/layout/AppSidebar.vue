<script setup>
  import { computed, ref } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import { useAuthStore } from "../../stores/auth";

  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();

  // Verifica permissões do usuário
  const isAdmin = computed(() => authStore.isAdmin);
  const isManager = computed(() => authStore.isManager);
  const userDepartment = computed(() => authStore.userDepartment);

  // Verifica rota ativa
  const isActive = (path) => {
    if (path === '/') {
      return route.path === '/';
    }
    return route.path.startsWith(path);
  };

  // Props e emits
  const props = defineProps({
    mobileMenuOpen: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(["toggle-mobile-menu"]);

  // Navega para a rota
  const navigateTo = (path) => {
    console.log("🧭 Navegando para:", path);
    router.push(path);
    mobileMenuOpen.value = false;
  };

  // Toggle menu mobile
  const toggleMobileMenu = () => {
    emit("toggle-mobile-menu");
  };

  // Realiza logout
  const handleLogout = () => {
    console.log("👋 Iniciando logout");
    authStore.logout();
    router.push("/login");
  };
</script>

<template>
  <aside class="bg-gray-800 text-white w-64 flex-shrink-0 hidden md:block">
    <!-- Props e eventos são ignorados neste componente -->
    <div class="p-4 border-b border-gray-700">
      <h1 class="text-xl font-bold">FZone</h1>
      <p class="text-sm text-gray-400">{{ authStore.userName }}</p>
    </div>

    <nav class="p-2 space-y-1">
      <!-- Principais -->
      <div class="mb-2">
        <p
          class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider"
        >
          Principal
        </p>

        <!-- Dashboard -->
        <div
          @click="navigateTo('/')"
          :class="[
            'p-3 rounded-md cursor-pointer flex items-center',
            route.path === '/'
              ? 'bg-primary-600'
              : 'hover:bg-gray-700',
          ]"
        >
          <span class="material-icons mr-3">dashboard</span>
          <span>Dashboard</span>
        </div>

        <!-- Tarefas -->
        <div
          @click="navigateTo('/tasks')"
          :class="[
            'p-3 rounded-md cursor-pointer flex items-center',
            isActive('/tasks') ? 'bg-primary-600' : 'hover:bg-gray-700',
          ]"
        >
          <span class="material-icons mr-3">task</span>
          <span>Tarefas</span>
        </div>

        <!-- Notificações -->
        <div
          @click="navigateTo('/notifications')"
          :class="[
            'p-3 rounded-md cursor-pointer flex items-center',
            isActive('/notifications') ? 'bg-primary-600' : 'hover:bg-gray-700',
          ]"
        >
          <span class="material-icons mr-3">notifications</span>
          <span>Notificações</span>
        </div>
      </div>

      <!-- Módulos -->
      <div class="mb-2">
        <p
          class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider"
        >
          Módulos
        </p>

        <!-- Estoque -->
        <div
          v-if="authStore.hasPermission('stock')"
          @click="navigateTo('/stock')"
          :class="[
            'p-3 rounded-md cursor-pointer flex items-center',
            isActive('/stock') ? 'bg-primary-600' : 'hover:bg-gray-700',
          ]"
        >
          <span class="material-icons mr-3">inventory</span>
          <span>Estoque</span>
        </div>

        <!-- Financeiro -->
        <div
          v-if="authStore.hasPermission('finance')"
          @click="navigateTo('/finance')"
          :class="[
            'p-3 rounded-md cursor-pointer flex items-center',
            isActive('/finance') ? 'bg-primary-600' : 'hover:bg-gray-700',
          ]"
        >
          <span class="material-icons mr-3">payments</span>
          <span>Financeiro</span>
        </div>

        <!-- RH -->
        <div
          v-if="authStore.hasPermission('hr')"
          @click="navigateTo('/hr')"
          :class="[
            'p-3 rounded-md cursor-pointer flex items-center',
            isActive('/hr') ? 'bg-primary-600' : 'hover:bg-gray-700',
          ]"
        >
          <span class="material-icons mr-3">people</span>
          <span>Pessoas</span>
        </div>

        <!-- Eventos -->
        <div
          @click="navigateTo('/events')"
          :class="[
            'p-3 rounded-md cursor-pointer flex items-center',
            isActive('/events') ? 'bg-primary-600' : 'hover:bg-gray-700',
          ]"
        >
          <span class="material-icons mr-3">event</span>
          <span>Eventos</span>
        </div>

        <!-- Contas -->
        <div
          v-if="authStore.isAdmin"
          @click="navigateTo('/accounts')"
          :class="[
            'p-3 rounded-md cursor-pointer flex items-center',
            isActive('/accounts') ? 'bg-primary-600' : 'hover:bg-gray-700',
          ]"
        >
          <span class="material-icons mr-3">account_circle</span>
          <span>Contas</span>
        </div>
      </div>

      <!-- Configurações -->
      <div class="mb-2">
        <p
          class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider"
        >
          Configurações
        </p>

        <!-- Perfil -->
        <div
          @click="navigateTo('/profile')"
          :class="[
            'p-3 rounded-md cursor-pointer flex items-center',
            isActive('/profile') ? 'bg-primary-600' : 'hover:bg-gray-700',
          ]"
        >
          <span class="material-icons mr-3">person</span>
          <span>Meu Perfil</span>
        </div>

        <!-- Configurações -->
        <div
          @click="navigateTo('/settings')"
          :class="[
            'p-3 rounded-md cursor-pointer flex items-center',
            isActive('/settings') ? 'bg-primary-600' : 'hover:bg-gray-700',
          ]"
        >
          <span class="material-icons mr-3">settings</span>
          <span>Configurações</span>
        </div>

        <!-- Ajuda -->
        <div
          @click="navigateTo('/help')"
          :class="[
            'p-3 rounded-md cursor-pointer flex items-center',
            isActive('/help') ? 'bg-primary-600' : 'hover:bg-gray-700',
          ]"
        >
          <span class="material-icons mr-3">help</span>
          <span>Ajuda</span>
        </div>
      </div>

      <!-- Separador -->
      <div class="border-t border-gray-700 my-4"></div>

      <!-- Logout -->
      <div
        @click="handleLogout"
        class="p-3 rounded-md cursor-pointer flex items-center hover:bg-red-700"
      >
        <span class="material-icons mr-3">logout</span>
        <span>Sair</span>
      </div>
    </nav>

    <div class="absolute bottom-0 left-0 w-64 p-4 text-xs text-gray-500">
      <p>FZone v1.0</p>
      <p>© {{ new Date().getFullYear() }}</p>
    </div>
  </aside>

  <!-- Versão mobile do sidebar -->
  <div v-if="mobileMenuOpen" class="md:hidden fixed inset-0 z-40">
    <!-- Overlay de fundo -->
    <div
      class="fixed inset-0 bg-gray-600 bg-opacity-75"
      @click="mobileMenuOpen = false"
    ></div>

    <!-- Menu lateral mobile -->
    <div class="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800">
      <div class="absolute top-0 right-0 -mr-12 pt-2">
        <button
          @click="mobileMenuOpen = false"
          class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
        >
          <span class="sr-only">Fechar menu</span>
          <span class="material-icons text-white">close</span>
        </button>
      </div>

      <!-- Conteúdo do menu mobile (igual ao desktop) -->
      <div class="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
        <div class="p-4 border-b border-gray-700">
          <h1 class="text-xl font-bold text-white">FZone</h1>
          <p class="text-sm text-gray-400">{{ authStore.userName }}</p>
        </div>

        <nav class="mt-5 px-2 space-y-1">
          <!-- Principais -->
          <div class="mb-2">
            <p
              class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider"
            >
              Principal
            </p>

            <!-- Dashboard -->
            <div
              @click="navigateTo('/')"
              :class="[
                'p-3 rounded-md cursor-pointer flex items-center',
                route.path === '/'
                  ? 'bg-primary-600'
                  : 'hover:bg-gray-700',
              ]"
            >
              <span class="material-icons mr-3">dashboard</span>
              <span>Dashboard</span>
            </div>

            <!-- Tarefas -->
            <div
              @click="navigateTo('/tasks')"
              :class="[
                'p-3 rounded-md cursor-pointer flex items-center',
                isActive('/tasks') ? 'bg-primary-600' : 'hover:bg-gray-700',
              ]"
            >
              <span class="material-icons mr-3">task</span>
              <span>Tarefas</span>
            </div>

            <!-- Notificações -->
            <div
              @click="navigateTo('/notifications')"
              :class="[
                'p-3 rounded-md cursor-pointer flex items-center',
                isActive('/notifications')
                  ? 'bg-primary-600'
                  : 'hover:bg-gray-700',
              ]"
            >
              <span class="material-icons mr-3">notifications</span>
              <span>Notificações</span>
            </div>
          </div>

          <!-- Módulos -->
          <div class="mb-2">
            <p
              class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider"
            >
              Módulos
            </p>

            <!-- Estoque -->
            <div
              v-if="authStore.hasPermission('stock')"
              @click="navigateTo('/stock')"
              :class="[
                'p-3 rounded-md cursor-pointer flex items-center',
                isActive('/stock') ? 'bg-primary-600' : 'hover:bg-gray-700',
              ]"
            >
              <span class="material-icons mr-3">inventory</span>
              <span>Estoque</span>
            </div>

            <!-- Financeiro -->
            <div
              v-if="authStore.hasPermission('finance')"
              @click="navigateTo('/finance')"
              :class="[
                'p-3 rounded-md cursor-pointer flex items-center',
                isActive('/finance') ? 'bg-primary-600' : 'hover:bg-gray-700',
              ]"
            >
              <span class="material-icons mr-3">payments</span>
              <span>Financeiro</span>
            </div>

            <!-- RH -->
            <div
              v-if="authStore.hasPermission('hr')"
              @click="navigateTo('/hr')"
              :class="[
                'p-3 rounded-md cursor-pointer flex items-center',
                isActive('/hr') ? 'bg-primary-600' : 'hover:bg-gray-700',
              ]"
            >
              <span class="material-icons mr-3">people</span>
              <span>Pessoas</span>
            </div>

            <!-- Eventos -->
            <div
              @click="navigateTo('/events')"
              :class="[
                'p-3 rounded-md cursor-pointer flex items-center',
                isActive('/events') ? 'bg-primary-600' : 'hover:bg-gray-700',
              ]"
            >
              <span class="material-icons mr-3">event</span>
              <span>Eventos</span>
            </div>

            <!-- Contas -->
            <div
              v-if="authStore.isAdmin"
              @click="navigateTo('/accounts')"
              :class="[
                'p-3 rounded-md cursor-pointer flex items-center',
                isActive('/accounts') ? 'bg-primary-600' : 'hover:bg-gray-700',
              ]"
            >
              <span class="material-icons mr-3">account_circle</span>
              <span>Contas</span>
            </div>
          </div>

          <!-- Configurações -->
          <div class="mb-2">
            <p
              class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider"
            >
              Configurações
            </p>

            <!-- Perfil -->
            <div
              @click="navigateTo('/profile')"
              :class="[
                'p-3 rounded-md cursor-pointer flex items-center',
                isActive('/profile') ? 'bg-primary-600' : 'hover:bg-gray-700',
              ]"
            >
              <span class="material-icons mr-3">person</span>
              <span>Meu Perfil</span>
            </div>

            <!-- Configurações -->
            <div
              @click="navigateTo('/settings')"
              :class="[
                'p-3 rounded-md cursor-pointer flex items-center',
                isActive('/settings') ? 'bg-primary-600' : 'hover:bg-gray-700',
              ]"
            >
              <span class="material-icons mr-3">settings</span>
              <span>Configurações</span>
            </div>

            <!-- Ajuda -->
            <div
              @click="navigateTo('/help')"
              :class="[
                'p-3 rounded-md cursor-pointer flex items-center',
                isActive('/help') ? 'bg-primary-600' : 'hover:bg-gray-700',
              ]"
            >
              <span class="material-icons mr-3">help</span>
              <span>Ajuda</span>
            </div>
          </div>

          <!-- Separador -->
          <div class="border-t border-gray-700 my-4"></div>

          <!-- Logout -->
          <div
            @click="handleLogout"
            class="p-3 rounded-md cursor-pointer flex items-center hover:bg-red-700"
          >
            <span class="material-icons mr-3">logout</span>
            <span>Sair</span>
          </div>
        </nav>
      </div>
    </div>

    <div class="flex-shrink-0 w-14">
      <!-- Espaçador para forçar a barra lateral a encolher para acomodar o botão de fechar -->
    </div>
  </div>
</template>
