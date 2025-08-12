<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../services/api';
import { useNotificationStore } from '../../stores/notification';

const router = useRouter();
const notificationStore = useNotificationStore();

// Estado
const isLoading = ref(true);
const events = ref([]);
const blockedDates = ref([]);
const selectedDate = ref(new Date());
const showEventModal = ref(false);
const showBlockModal = ref(false);

const newEvent = ref({
  title: '',
  startDate: '',
  endDate: '',
  location: '',
  status: 'planejado',
  description: ''
});

const newBlock = ref({
  title: '',
  startDate: '',
  endDate: '',
  type: 'ferias',
  description: ''
});

// Opções
const eventStatus = [
  { value: 'planejado', label: 'Planejado' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' }
];

const blockTypes = [
  { value: 'ferias', label: 'Férias' },
  { value: 'manutencao', label: 'Manutenção' },
  { value: 'feriado', label: 'Feriado' },
  { value: 'indisponivel', label: 'Indisponível' }
];

// Data formatada
const formatSelectedDate = computed(() => {
  return selectedDate.value.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Eventos da data selecionada
const selectedDateEvents = computed(() => {
  const selectedDateStr = selectedDate.value.toDateString();
  return events.value.filter(event => {
    const eventDate = new Date(event.startDate).toDateString();
    return eventDate === selectedDateStr;
  });
});

// Bloqueios da data selecionada
const selectedDateBlocks = computed(() => {
  return blockedDates.value.filter(block => {
    const blockStart = new Date(block.startDate);
    const blockEnd = new Date(block.endDate);
    return selectedDate.value >= blockStart && selectedDate.value <= blockEnd;
  });
});

// Funções auxiliares
const getEventColor = (status) => {
  switch (status) {
    case 'planejado': return 'warning';
    case 'confirmado': return 'success';
    case 'em_andamento': return 'primary';
    case 'concluido': return 'purple';
    case 'cancelado': return 'error';
    default: return 'grey';
  }
};

const getStatusLabel = (status) => {
  const statusObj = eventStatus.find(s => s.value === status);
  return statusObj ? statusObj.label : status;
};

const getBlockTypeLabel = (type) => {
  const typeObj = blockTypes.find(t => t.value === type);
  return typeObj ? typeObj.label : type;
};

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Ações
const loadEventsForDate = (date) => {
  selectedDate.value = date;
};

const openEventModal = () => {
  const formattedDate = selectedDate.value.toISOString().split('T')[0];
  newEvent.value = {
    title: '',
    startDate: formattedDate,
    endDate: formattedDate,
    location: '',
    status: 'planejado',
    description: ''
  };
  showEventModal.value = true;
};

const openBlockModal = () => {
  const formattedDate = selectedDate.value.toISOString().split('T')[0];
  newBlock.value = {
    title: '',
    startDate: formattedDate,
    endDate: formattedDate,
    type: 'ferias',
    description: ''
  };
  showBlockModal.value = true;
};

const viewEvent = (event) => {
  router.push(`/events/${event._id}`);
};

const createEvent = async () => {
  try {
    isLoading.value = true;
    const response = await api.post('/events', newEvent.value);
    events.value.push(response.data);
    showEventModal.value = false;
    notificationStore.addSystemNotification(
      'Evento Criado',
      `O evento "${newEvent.value.title}" foi criado com sucesso.`
    );
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    notificationStore.addSystemNotification(
      'Erro',
      'Não foi possível criar o evento. Tente novamente.',
      'error'
    );
  } finally {
    isLoading.value = false;
  }
};

const createBlock = async () => {
  try {
    isLoading.value = true;
    const response = await api.post('/calendar/blocks', newBlock.value);
    blockedDates.value.push(response.data);
    showBlockModal.value = false;
    notificationStore.addSystemNotification(
      'Data Bloqueada',
      `O período de "${newBlock.value.title}" foi bloqueado com sucesso.`
    );
  } catch (error) {
    console.error('Erro ao bloquear data:', error);
    notificationStore.addSystemNotification(
      'Erro',
      'Não foi possível bloquear a data. Tente novamente.',
      'error'
    );
  } finally {
    isLoading.value = false;
  }
};

const loadEvents = async () => {
  try {
    const response = await api.get('/events');
    events.value = response.data;
  } catch (error) {
    console.error('Erro ao carregar eventos:', error);
  }
};

const loadBlockedDates = async () => {
  try {
    const response = await api.get('/calendar/blocks');
    blockedDates.value = response.data;
  } catch (error) {
    console.error('Erro ao carregar datas bloqueadas:', error);
  }
};

onMounted(async () => {
  isLoading.value = true;
  try {
    await Promise.all([loadEvents(), loadBlockedDates()]);
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  } finally {
    isLoading.value = false;
  }
});
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
            @click="openBlockModal"
            color="warning"
            variant="outlined"
            prepend-icon="mdi-calendar-remove"
            size="large"
          >
            Bloquear Data
          </v-btn>
        </div>
      </v-col>
    </v-row>
    
    <!-- Calendário -->
    <v-card elevation="4">
      <!-- Loading -->
      <v-row v-if="isLoading" justify="center" class="pa-8">
        <v-col cols="auto" class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
          <p class="mt-4 text-h6">Carregando calendário...</p>
        </v-col>
      </v-row>
      
      <!-- Calendário simples -->
      <v-card-text v-else>
        <v-row>
          <!-- Date Picker -->
          <v-col cols="12" md="4">
            <v-date-picker
              v-model="selectedDate"
              color="primary"
              show-adjacent-months
              @update:model-value="loadEventsForDate"
            ></v-date-picker>
          </v-col>
          
          <!-- Lista de eventos -->
          <v-col cols="12" md="8">
            <v-card variant="outlined">
              <v-card-title class="d-flex align-center">
                <v-icon class="me-2">mdi-calendar-today</v-icon>
                Eventos de {{ formatSelectedDate }}
                <v-spacer></v-spacer>
                <v-btn
                  @click="openEventModal"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-plus"
                >
                  Novo Evento
                </v-btn>
              </v-card-title>
              
              <v-card-text>
                <div v-if="selectedDateEvents.length === 0" class="text-center py-8">
                  <v-icon size="64" color="grey-lighten-1">mdi-calendar-blank</v-icon>
                  <p class="text-grey mt-4">Nenhum evento nesta data</p>
                  <v-btn
                    @click="openEventModal"
                    color="primary"
                    variant="outlined"
                    class="mt-2"
                  >
                    Criar Evento
                  </v-btn>
                </div>
                
                <v-list v-else>
                  <v-list-item
                    v-for="event in selectedDateEvents"
                    :key="event._id"
                    @click="viewEvent(event)"
                    class="cursor-pointer"
                  >
                    <template v-slot:prepend>
                      <v-avatar
                        :color="getEventColor(event.status)"
                        size="small"
                      >
                        <v-icon size="small">mdi-calendar</v-icon>
                      </v-avatar>
                    </template>
                    
                    <v-list-item-title>{{ event.title }}</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ event.location }} • {{ formatTime(event.startDate) }}
                    </v-list-item-subtitle>
                    
                    <template v-slot:append>
                      <v-chip
                        :color="getEventColor(event.status)"
                        size="small"
                        variant="tonal"
                      >
                        {{ getStatusLabel(event.status) }}
                      </v-chip>
                    </template>
                  </v-list-item>
                </v-list>
                
                <!-- Bloqueios -->
                <div v-if="selectedDateBlocks.length > 0" class="mt-4">
                  <v-divider class="mb-4"></v-divider>
                  <h4 class="text-subtitle-1 mb-2">Bloqueios</h4>
                  <v-list>
                    <v-list-item
                      v-for="block in selectedDateBlocks"
                      :key="block._id"
                    >
                      <template v-slot:prepend>
                        <v-avatar color="error" size="small">
                          <v-icon size="small">mdi-calendar-remove</v-icon>
                        </v-avatar>
                      </template>
                      
                      <v-list-item-title>{{ block.title }}</v-list-item-title>
                      <v-list-item-subtitle>{{ block.description }}</v-list-item-subtitle>
                      
                      <template v-slot:append>
                        <v-chip color="error" size="small" variant="tonal">
                          {{ getBlockTypeLabel(block.type) }}
                        </v-chip>
                      </template>
                    </v-list-item>
                  </v-list>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    
    <!-- Modal de Novo Evento -->
    <v-dialog v-model="showEventModal" max-width="500">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="me-2" color="primary">mdi-calendar-plus</v-icon>
          Novo Evento
        </v-card-title>
        
        <v-form @submit.prevent="createEvent">
          <v-card-text>
            <v-text-field
              v-model="newEvent.title"
              label="Título"
              variant="outlined"
              density="compact"
              required
              class="mb-4"
              prepend-inner-icon="mdi-format-title"
              placeholder="Nome do evento"
            ></v-text-field>
            
            <v-row class="mb-4">
              <v-col cols="6">
                <v-text-field
                  v-model="newEvent.startDate"
                  label="Data Início"
                  type="date"
                  variant="outlined"
                  density="compact"
                  required
                  prepend-inner-icon="mdi-calendar-start"
                ></v-text-field>
              </v-col>
              
              <v-col cols="6">
                <v-text-field
                  v-model="newEvent.endDate"
                  label="Data Fim"
                  type="date"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-calendar-end"
                ></v-text-field>
              </v-col>
            </v-row>
            
            <v-text-field
              v-model="newEvent.location"
              label="Local"
              variant="outlined"
              density="compact"
              class="mb-4"
              prepend-inner-icon="mdi-map-marker"
              placeholder="Local do evento"
            ></v-text-field>
            
            <v-select
              v-model="newEvent.status"
              :items="eventStatus"
              item-title="label"
              item-value="value"
              label="Status"
              variant="outlined"
              density="compact"
              class="mb-4"
              prepend-inner-icon="mdi-flag"
            ></v-select>
            
            <v-textarea
              v-model="newEvent.description"
              label="Descrição"
              variant="outlined"
              density="compact"
              rows="3"
              prepend-inner-icon="mdi-text"
              placeholder="Descrição do evento"
            ></v-textarea>
          </v-card-text>
          
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              @click="showEventModal = false"
              variant="outlined"
            >
              Cancelar
            </v-btn>
            
            <v-btn
              type="submit"
              :loading="isLoading"
              color="primary"
            >
              Criar Evento
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
    
    <!-- Modal de Bloqueio -->
    <v-dialog v-model="showBlockModal" max-width="500">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="me-2" color="warning">mdi-calendar-remove</v-icon>
          Bloquear Período
        </v-card-title>
        
        <v-form @submit.prevent="createBlock">
          <v-card-text>
            <v-text-field
              v-model="newBlock.title"
              label="Título"
              variant="outlined"
              density="compact"
              required
              class="mb-4"
              prepend-inner-icon="mdi-format-title"
              placeholder="Ex: Férias da Equipe"
            ></v-text-field>
            
            <v-row class="mb-4">
              <v-col cols="6">
                <v-text-field
                  v-model="newBlock.startDate"
                  label="Data Início"
                  type="date"
                  variant="outlined"
                  density="compact"
                  required
                  prepend-inner-icon="mdi-calendar-start"
                ></v-text-field>
              </v-col>
              
              <v-col cols="6">
                <v-text-field
                  v-model="newBlock.endDate"
                  label="Data Fim"
                  type="date"
                  variant="outlined"
                  density="compact"
                  required
                  prepend-inner-icon="mdi-calendar-end"
                ></v-text-field>
              </v-col>
            </v-row>
            
            <v-select
              v-model="newBlock.type"
              :items="blockTypes"
              item-title="label"
              item-value="value"
              label="Tipo"
              variant="outlined"
              density="compact"
              class="mb-4"
              prepend-inner-icon="mdi-tag"
            ></v-select>
            
            <v-textarea
              v-model="newBlock.description"
              label="Descrição"
              variant="outlined"
              density="compact"
              rows="3"
              prepend-inner-icon="mdi-text"
              placeholder="Motivo do bloqueio"
            ></v-textarea>
          </v-card-text>
          
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              @click="showBlockModal = false"
              variant="outlined"
            >
              Cancelar
            </v-btn>
            
            <v-btn
              type="submit"
              :loading="isLoading"
              color="warning"
            >
              Bloquear Período
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </v-container>
</template>