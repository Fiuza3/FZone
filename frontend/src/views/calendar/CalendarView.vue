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
const currentDate = ref(new Date());
const showEventModal = ref(false);
const showBlockModal = ref(false);
const selectedDate = ref(null);
const selectedEvent = ref(null);
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

// Tipos de bloqueio
const blockTypes = [
  { value: 'ferias', label: 'Férias' },
  { value: 'manutencao', label: 'Manutenção' },
  { value: 'feriado', label: 'Feriado' },
  { value: 'indisponivel', label: 'Indisponível' }
];

// Status de eventos
const eventStatus = [
  { value: 'planejado', label: 'Planejado', color: 'bg-yellow-200 border-yellow-500' },
  { value: 'confirmado', label: 'Confirmado', color: 'bg-green-200 border-green-500' },
  { value: 'em_andamento', label: 'Em Andamento', color: 'bg-blue-200 border-blue-500' },
  { value: 'concluido', label: 'Concluído', color: 'bg-purple-200 border-purple-500' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-red-200 border-red-500' }
];

// Meses e dias da semana
const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Mês e ano atual
const currentMonth = computed(() => months[currentDate.value.getMonth()]);
const currentYear = computed(() => currentDate.value.getFullYear());

// Dias do mês atual
const daysInMonth = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  return new Date(year, month + 1, 0).getDate();
});

// Primeiro dia da semana do mês (0 = Domingo, 1 = Segunda, etc)
const firstDayOfMonth = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  return new Date(year, month, 1).getDay();
});

// Dias do calendário (incluindo dias do mês anterior e próximo para preencher a grade)
const calendarDays = computed(() => {
  const days = [];
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  
  // Dias do mês anterior
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayOfMonth.value - 1; i >= 0; i--) {
    days.push({
      day: prevMonthDays - i,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false
    });
  }
  
  // Dias do mês atual
  for (let i = 1; i <= daysInMonth.value; i++) {
    days.push({
      day: i,
      month,
      year,
      isCurrentMonth: true
    });
  }
  
  // Dias do próximo mês
  const remainingDays = 42 - days.length; // 6 semanas * 7 dias = 42
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false
    });
  }
  
  return days;
});

// Verifica se uma data tem eventos
const getEventsForDay = (day) => {
  const date = new Date(day.year, day.month, day.day);
  return events.value.filter(event => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate || event.startDate);
    return date >= new Date(eventStart.setHours(0,0,0,0)) && 
           date <= new Date(eventEnd.setHours(23,59,59,999));
  });
};

// Verifica se uma data está bloqueada
const isDateBlocked = (day) => {
  const date = new Date(day.year, day.month, day.day);
  return blockedDates.value.some(block => {
    const blockStart = new Date(block.startDate);
    const blockEnd = new Date(block.endDate);
    return date >= new Date(blockStart.setHours(0,0,0,0)) && 
           date <= new Date(blockEnd.setHours(23,59,59,999));
  });
};

// Obtém o bloco para uma data
const getBlockForDay = (day) => {
  const date = new Date(day.year, day.month, day.day);
  return blockedDates.value.find(block => {
    const blockStart = new Date(block.startDate);
    const blockEnd = new Date(block.endDate);
    return date >= new Date(blockStart.setHours(0,0,0,0)) && 
           date <= new Date(blockEnd.setHours(23,59,59,999));
  });
};

// Navega para o mês anterior
const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
};

// Navega para o próximo mês
const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
};

// Navega para o mês atual
const goToToday = () => {
  currentDate.value = new Date();
};

// Abre modal para criar evento
const openEventModal = (day) => {
  selectedDate.value = new Date(day.year, day.month, day.day);
  
  // Verifica se a data está bloqueada
  if (isDateBlocked({ day: selectedDate.value.getDate(), month: selectedDate.value.getMonth(), year: selectedDate.value.getFullYear() })) {
    notificationStore.addSystemNotification(
      'Data Bloqueada',
      'Esta data está bloqueada e não pode receber eventos.'
    );
    return;
  }
  
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

// Abre modal para criar bloqueio
const openBlockModal = (day) => {
  selectedDate.value = new Date(day.year, day.month, day.day);
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

// Abre modal para visualizar evento
const viewEvent = (event) => {
  selectedEvent.value = event;
  router.push(`/events/${event._id}`);
};

// Cria novo evento
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
    await loadEvents();
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

// Cria novo bloqueio
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
    await loadBlockedDates();
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

// Carrega eventos
const loadEvents = async () => {
  try {
    const response = await api.get('/events');
    events.value = response.data;
  } catch (error) {
    console.error('Erro ao carregar eventos:', error);
    notificationStore.addSystemNotification(
      'Erro',
      'Não foi possível carregar os eventos. Tente novamente.',
      'error'
    );
  }
};

// Carrega datas bloqueadas
const loadBlockedDates = async () => {
  try {
    const response = await api.get('/calendar/blocks');
    blockedDates.value = response.data;
  } catch (error) {
    console.error('Erro ao carregar datas bloqueadas:', error);
    notificationStore.addSystemNotification(
      'Erro',
      'Não foi possível carregar as datas bloqueadas. Tente novamente.',
      'error'
    );
  }
};

// Exporta calendário para PDF
const exportToPDF = async () => {
  try {
    isLoading.value = true;
    const response = await api.get('/calendar/export', { responseType: 'blob' });
    
    // Cria URL para o blob e força o download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `calendario-${currentMonth.value}-${currentYear.value}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    notificationStore.addSystemNotification(
      'Exportação Concluída',
      'O calendário foi exportado com sucesso.'
    );
  } catch (error) {
    console.error('Erro ao exportar calendário:', error);
    notificationStore.addSystemNotification(
      'Erro',
      'Não foi possível exportar o calendário. Tente novamente.',
      'error'
    );
  } finally {
    isLoading.value = false;
  }
};

// Obtém a cor do status do evento
const getEventStatusColor = (status) => {
  const statusObj = eventStatus.find(s => s.value === status);
  return statusObj ? statusObj.color : 'bg-gray-200 border-gray-500';
};

// Obtém a cor do tipo de bloqueio
const getBlockTypeColor = (type) => {
  switch (type) {
    case 'ferias':
      return 'bg-blue-100 border-blue-400';
    case 'manutencao':
      return 'bg-orange-100 border-orange-400';
    case 'feriado':
      return 'bg-red-100 border-red-400';
    case 'indisponivel':
      return 'bg-gray-100 border-gray-400';
    default:
      return 'bg-gray-100 border-gray-400';
  }
};

// Formata data
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

// Carrega dados ao montar o componente
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
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title">Calendário de Eventos</h1>
      
      <div class="flex space-x-2">
        <button @click="exportToPDF" class="btn btn-outline flex items-center">
          <span class="material-icons mr-1">download</span>
          Exportar PDF
        </button>
      </div>
    </div>
    
    <!-- Controles do calendário -->
    <div class="card mb-6">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <button @click="prevMonth" class="p-2 rounded-full hover:bg-gray-100">
            <span class="material-icons">chevron_left</span>
          </button>
          
          <h2 class="text-xl font-semibold">{{ currentMonth }} {{ currentYear }}</h2>
          
          <button @click="nextMonth" class="p-2 rounded-full hover:bg-gray-100">
            <span class="material-icons">chevron_right</span>
          </button>
          
          <button @click="goToToday" class="btn btn-sm btn-outline ml-4">
            Hoje
          </button>
        </div>
        
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <span class="w-3 h-3 rounded-full bg-yellow-200 border border-yellow-500"></span>
            <span class="text-sm">Planejado</span>
          </div>
          
          <div class="flex items-center space-x-2">
            <span class="w-3 h-3 rounded-full bg-green-200 border border-green-500"></span>
            <span class="text-sm">Confirmado</span>
          </div>
          
          <div class="flex items-center space-x-2">
            <span class="w-3 h-3 rounded-full bg-blue-100 border border-blue-400"></span>
            <span class="text-sm">Bloqueado</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Calendário -->
    <div class="card">
      <!-- Carregando -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
      
      <!-- Calendário -->
      <div v-else class="calendar">
        <!-- Dias da semana -->
        <div class="grid grid-cols-7 gap-1 mb-1">
          <div 
            v-for="day in weekdays" 
            :key="day"
            class="p-2 text-center font-semibold text-sm bg-gray-100"
          >
            {{ day }}
          </div>
        </div>
        
        <!-- Dias do mês -->
        <div class="grid grid-cols-7 gap-1">
          <div 
            v-for="(day, index) in calendarDays" 
            :key="index"
            :class="[
              'min-h-24 p-1 border relative',
              day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400',
              isDateBlocked(day) ? 'bg-blue-50' : ''
            ]"
          >
            <!-- Número do dia -->
            <div class="flex justify-between">
              <span class="text-sm font-medium">{{ day.day }}</span>
              
              <!-- Menu de ações -->
              <div class="relative group">
                <button class="p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100">
                  <span class="material-icons text-sm">more_vert</span>
                </button>
                
                <div class="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                  <button 
                    @click="openEventModal(day)"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Criar Evento
                  </button>
                  <button 
                    @click="openBlockModal(day)"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Bloquear Data
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Eventos do dia -->
            <div class="mt-1 space-y-1">
              <div 
                v-for="event in getEventsForDay(day).slice(0, 2)" 
                :key="event._id"
                :class="[
                  'text-xs p-1 rounded truncate cursor-pointer border-l-4',
                  getEventStatusColor(event.status)
                ]"
                @click="viewEvent(event)"
              >
                {{ event.title }}
              </div>
              
              <!-- Indicador de mais eventos -->
              <div 
                v-if="getEventsForDay(day).length > 2"
                class="text-xs text-center text-gray-500"
              >
                +{{ getEventsForDay(day).length - 2 }} mais
              </div>
            </div>
            
            <!-- Indicador de data bloqueada -->
            <div 
              v-if="isDateBlocked(day)"
              class="absolute inset-0 bg-blue-50 bg-opacity-50 flex items-center justify-center"
            >
              <div 
                :class="[
                  'text-xs p-1 rounded truncate border-l-4 bg-opacity-90 w-full',
                  getBlockTypeColor(getBlockForDay(day)?.type)
                ]"
              >
                {{ getBlockForDay(day)?.title || 'Bloqueado' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de Novo Evento -->
    <div v-if="showEventModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">Novo Evento</h3>
        
        <form @submit.prevent="createEvent" class="space-y-4">
          <div>
            <label class="form-label">Título <span class="text-red-500">*</span></label>
            <input 
              v-model="newEvent.title"
              type="text"
              required
              class="form-input"
              placeholder="Nome do evento"
            />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Data Início <span class="text-red-500">*</span></label>
              <input 
                v-model="newEvent.startDate"
                type="date"
                required
                class="form-input"
              />
            </div>
            
            <div>
              <label class="form-label">Data Fim</label>
              <input 
                v-model="newEvent.endDate"
                type="date"
                class="form-input"
              />
            </div>
          </div>
          
          <div>
            <label class="form-label">Local</label>
            <input 
              v-model="newEvent.location"
              type="text"
              class="form-input"
              placeholder="Local do evento"
            />
          </div>
          
          <div>
            <label class="form-label">Status</label>
            <select v-model="newEvent.status" class="form-input">
              <option 
                v-for="status in eventStatus" 
                :key="status.value" 
                :value="status.value"
              >
                {{ status.label }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="form-label">Descrição</label>
            <textarea 
              v-model="newEvent.description"
              class="form-input"
              rows="3"
              placeholder="Descrição do evento"
            ></textarea>
          </div>
          
          <div class="flex justify-end space-x-2">
            <button 
              type="button"
              @click="showEventModal = false"
              class="btn btn-outline"
            >
              Cancelar
            </button>
            
            <button 
              type="submit"
              class="btn btn-primary"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="animate-spin mr-2">
                <span class="material-icons text-sm">refresh</span>
              </span>
              Criar Evento
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Modal de Bloqueio de Data -->
    <div v-if="showBlockModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">Bloquear Período</h3>
        
        <form @submit.prevent="createBlock" class="space-y-4">
          <div>
            <label class="form-label">Título <span class="text-red-500">*</span></label>
            <input 
              v-model="newBlock.title"
              type="text"
              required
              class="form-input"
              placeholder="Ex: Férias da Equipe"
            />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Data Início <span class="text-red-500">*</span></label>
              <input 
                v-model="newBlock.startDate"
                type="date"
                required
                class="form-input"
              />
            </div>
            
            <div>
              <label class="form-label">Data Fim <span class="text-red-500">*</span></label>
              <input 
                v-model="newBlock.endDate"
                type="date"
                required
                class="form-input"
              />
            </div>
          </div>
          
          <div>
            <label class="form-label">Tipo</label>
            <select v-model="newBlock.type" class="form-input">
              <option 
                v-for="type in blockTypes" 
                :key="type.value" 
                :value="type.value"
              >
                {{ type.label }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="form-label">Descrição</label>
            <textarea 
              v-model="newBlock.description"
              class="form-input"
              rows="3"
              placeholder="Motivo do bloqueio"
            ></textarea>
          </div>
          
          <div class="flex justify-end space-x-2">
            <button 
              type="button"
              @click="showBlockModal = false"
              class="btn btn-outline"
            >
              Cancelar
            </button>
            
            <button 
              type="submit"
              class="btn btn-primary"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="animate-spin mr-2">
                <span class="material-icons text-sm">refresh</span>
              </span>
              Bloquear Período
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar {
  min-height: 600px;
}
</style>