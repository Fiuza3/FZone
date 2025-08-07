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
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col>
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Calendário de Eventos</h1>
          </div>
          <v-btn
            v-if="canCreateEdit"
            @click="router.push('/events/new')"
            color="primary"
            prepend-icon="mdi-calendar-plus"
            size="large"
          >
            Novo Evento
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Filtros -->
    <v-card class="mb-6" elevation="4">
      <v-card-title class="d-flex align-center bg-grey-lighten-5">
        <v-icon class="me-2" color="primary">mdi-filter</v-icon>
        Filtros
      </v-card-title>
      
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedStatus"
              :items="[
                { title: 'Todos', value: 'todos' },
                { title: 'Planejado', value: 'planejado' },
                { title: 'Confirmado', value: 'confirmado' },
                { title: 'Em Andamento', value: 'em_andamento' },
                { title: 'Concluído', value: 'concluido' },
                { title: 'Cancelado', value: 'cancelado' }
              ]"
              label="Filtrar por status"
              variant="outlined"
              density="compact"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Lista de Eventos -->
    <div v-if="eventStore.loading">
      <v-row justify="center">
        <v-col cols="auto" class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
          <p class="mt-4 text-h6">Carregando eventos...</p>
        </v-col>
      </v-row>
    </div>

    <v-card v-else-if="filteredEvents.length === 0" elevation="4">
      <v-card-text>
        <v-empty-state
          icon="mdi-calendar-outline"
          title="Nenhum evento encontrado"
          text="Comece criando seu primeiro evento"
        >
          <template v-slot:actions v-if="canCreateEdit">
            <v-btn @click="router.push('/events/new')" color="primary">
              Criar Novo Evento
            </v-btn>
          </template>
        </v-empty-state>
      </v-card-text>
    </v-card>

    <div v-else>
      <v-row>
        <v-col v-for="event in filteredEvents" :key="event._id" cols="12">
          <v-card elevation="4" hover>
            <v-card-text class="pa-6">
              <div class="d-flex justify-space-between align-start mb-4">
                <div class="flex-grow-1">
                  <h3 class="text-h6 font-weight-bold mb-2">{{ event.title }}</h3>
                  <p class="text-body-2 text-grey-darken-1">{{ event.description }}</p>
                </div>
                <v-chip
                  :color="
                    event.status === 'planejado' ? 'warning' :
                    event.status === 'confirmado' ? 'primary' :
                    event.status === 'em_andamento' ? 'info' :
                    event.status === 'concluido' ? 'success' : 'error'
                  "
                  size="small"
                  variant="tonal"
                >
                  {{ getStatusLabel(event.status) }}
                </v-chip>
              </div>

              <v-row class="mb-4">
                <v-col cols="12" md="6" lg="3">
                  <div class="d-flex align-center mb-2">
                    <v-icon class="me-2" size="small" color="primary">mdi-calendar</v-icon>
                    <span class="text-caption text-grey-darken-1">Data</span>
                  </div>
                  <p class="font-weight-medium">
                    {{ formatDate(event.startDate) }} - {{ formatDate(event.endDate) }}
                  </p>
                </v-col>
                
                <v-col cols="12" md="6" lg="3">
                  <div class="d-flex align-center mb-2">
                    <v-icon class="me-2" size="small" color="primary">mdi-map-marker</v-icon>
                    <span class="text-caption text-grey-darken-1">Local</span>
                  </div>
                  <p class="font-weight-medium">{{ event.location }}</p>
                </v-col>
                
                <v-col cols="12" md="6" lg="3">
                  <div class="d-flex align-center mb-2">
                    <v-icon class="me-2" size="small" color="success">mdi-currency-usd</v-icon>
                    <span class="text-caption text-grey-darken-1">Receita</span>
                  </div>
                  <p class="font-weight-bold text-success">{{ formatCurrency(event.revenue) }}</p>
                </v-col>
                
                <v-col cols="12" md="6" lg="3">
                  <div class="d-flex align-center mb-2">
                    <v-icon class="me-2" size="small" color="info">mdi-trending-up</v-icon>
                    <span class="text-caption text-grey-darken-1">Lucro</span>
                  </div>
                  <p :class="[
                    'font-weight-bold',
                    (event.profit || 0) >= 0 ? 'text-success' : 'text-error'
                  ]">
                    {{ formatCurrency(event.profit || 0) }} ({{ event.profitMargin || '0.00' }}%)
                  </p>
                </v-col>
              </v-row>

              <v-divider class="mb-4"></v-divider>

              <div class="d-flex justify-space-between align-center">
                <div class="d-flex align-center">
                  <v-avatar size="24" color="primary" class="me-2">
                    <span class="text-caption">
                      {{ event.createdBy?.name?.charAt(0).toUpperCase() || 'U' }}
                    </span>
                  </v-avatar>
                  <span class="text-caption text-grey-darken-1">
                    Criado por {{ event.createdBy?.name }} em {{ formatDate(event.createdAt) }}
                  </span>
                </div>
                
                <div v-if="canCreateEdit" class="d-flex ga-1">
                  <v-tooltip text="Editar evento">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        @click="router.push(`/events/${event._id}/edit`)"
                        icon="mdi-pencil"
                        color="primary"
                        size="small"
                        variant="text"
                        v-bind="props"
                      ></v-btn>
                    </template>
                  </v-tooltip>
                  
                  <v-tooltip text="Excluir evento">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        @click="deleteEvent(event)"
                        icon="mdi-delete"
                        color="error"
                        size="small"
                        variant="text"
                        v-bind="props"
                      ></v-btn>
                    </template>
                  </v-tooltip>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>