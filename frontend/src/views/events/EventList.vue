<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useEventStore } from '../../stores/event';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const eventStore = useEventStore();
const authStore = useAuthStore();

const selectedStatus = ref('todos');

onMounted(() => {
  eventStore.fetchEvents();
});

const filteredEvents = computed(() => {
  if (selectedStatus.value === 'todos') {
    return eventStore.events;
  }
  return eventStore.events.filter(event => event.status === selectedStatus.value);
});

const canCreateEdit = computed(() => {
  return authStore.user?.role === 'owner' || 
         authStore.user?.role === 'admin' || 
         authStore.user?.role === 'manager';
});

const getStatusColor = (status) => {
  const colors = {
    planejado: 'bg-yellow-100 text-yellow-800',
    confirmado: 'bg-blue-100 text-blue-800',
    em_andamento: 'bg-green-100 text-green-800',
    concluido: 'bg-gray-100 text-gray-800',
    cancelado: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (status) => {
  const labels = {
    planejado: 'Planejado',
    confirmado: 'Confirmado',
    em_andamento: 'Em Andamento',
    concluido: 'Concluído',
    cancelado: 'Cancelado'
  };
  return labels[status] || status;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR');
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const deleteEvent = async (event) => {
  if (confirm(`Tem certeza que deseja deletar o evento "${event.title}"?`)) {
    try {
      await eventStore.deleteEvent(event._id);
    } catch (error) {
      alert('Erro ao deletar evento');
    }
  }
};
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title">Calendário de Eventos</h1>
      <button 
        v-if="canCreateEdit"
        @click="router.push('/events/new')"
        class="btn btn-primary"
      >
        <span class="material-icons mr-2">event</span>
        Novo Evento
      </button>
    </div>

    <!-- Filtros -->
    <div class="card mb-6">
      <div class="p-4">
        <div class="flex items-center space-x-4">
          <label class="text-sm font-medium text-gray-700">Filtrar por status:</label>
          <select v-model="selectedStatus" class="form-input w-48">
            <option value="todos">Todos</option>
            <option value="planejado">Planejado</option>
            <option value="confirmado">Confirmado</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Lista de Eventos -->
    <div v-if="eventStore.loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
    </div>

    <div v-else-if="filteredEvents.length === 0" class="card">
      <div class="p-8 text-center text-gray-500">
        <span class="material-icons text-4xl mb-4 block">event_note</span>
        <p>Nenhum evento encontrado</p>
      </div>
    </div>

    <div v-else class="grid gap-6">
      <div v-for="event in filteredEvents" :key="event._id" class="card">
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ event.title }}</h3>
              <p class="text-gray-600 mt-1">{{ event.description }}</p>
            </div>
            <span :class="['px-2 py-1 text-xs rounded-full', getStatusColor(event.status)]">
              {{ getStatusLabel(event.status) }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <span class="text-sm text-gray-500">Data</span>
              <p class="font-medium">{{ formatDate(event.startDate) }} - {{ formatDate(event.endDate) }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">Local</span>
              <p class="font-medium">{{ event.location }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">Receita</span>
              <p class="font-medium text-green-600">{{ formatCurrency(event.revenue) }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">Lucro</span>
              <p :class="['font-medium', (event.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600']">
                {{ formatCurrency(event.profit || 0) }} ({{ event.profitMargin || '0.00' }}%)
              </p>
            </div>
          </div>

          <div class="flex justify-between items-center">
            <div class="text-sm text-gray-500">
              Criado por {{ event.createdBy?.name }} em {{ formatDate(event.createdAt) }}
            </div>
            <div v-if="canCreateEdit" class="flex space-x-2">
              <button 
                @click="router.push(`/events/${event._id}/edit`)"
                class="btn btn-outline btn-sm"
              >
                <span class="material-icons text-sm">edit</span>
              </button>
              <button 
                @click="deleteEvent(event)"
                class="btn btn-outline btn-sm text-red-600 hover:bg-red-50"
              >
                <span class="material-icons text-sm">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>