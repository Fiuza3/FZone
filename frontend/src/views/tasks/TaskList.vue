<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTaskStore } from '../../stores/task';

const router = useRouter();
const taskStore = useTaskStore();

// Estado
const isLoading = ref(true);
const filters = ref({
  status: '',
  priority: ''
});
const showDeleteModal = ref(false);
const taskToDelete = ref(null);

// Opções de filtro
const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'cancelada', label: 'Cancelada' }
];

const priorityOptions = [
  { value: '', label: 'Todas as prioridades' },
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' }
];

// Tarefas filtradas
const filteredTasks = computed(() => {
  let result = [...taskStore.tasks];
  
  if (filters.value.status) {
    result = result.filter(task => task.status === filters.value.status);
  }
  
  if (filters.value.priority) {
    result = result.filter(task => task.priority === filters.value.priority);
  }
  
  return result;
});

// Carrega tarefas
const loadTasks = async () => {
  console.log('🔄 Carregando tarefas');
  isLoading.value = true;
  
  try {
    await taskStore.fetchTasks();
    console.log(`✅ ${taskStore.tasks.length} tarefas carregadas`);
  } catch (error) {
    console.error('❌ Erro ao carregar tarefas:', error);
  } finally {
    isLoading.value = false;
  }
};

// Aplica filtros
const applyFilters = async () => {
  console.log('🔍 Aplicando filtros:', filters.value);
  isLoading.value = true;
  
  try {
    await taskStore.fetchTasks(filters.value);
  } catch (error) {
    console.error('❌ Erro ao filtrar tarefas:', error);
  } finally {
    isLoading.value = false;
  }
};

// Limpa filtros
const clearFilters = () => {
  filters.value = {
    status: '',
    priority: ''
  };
  applyFilters();
};

// Navega para criar nova tarefa
const goToNewTask = () => {
  router.push('/tasks/new');
};

// Navega para editar tarefa
const editTask = (taskId) => {
  router.push(`/tasks/${taskId}/edit`);
};

// Confirma exclusão de tarefa
const confirmDelete = (task) => {
  taskToDelete.value = task;
  showDeleteModal.value = true;
};

// Deleta tarefa
const deleteTask = async () => {
  if (!taskToDelete.value) return;
  
  console.log('🗑️ Deletando tarefa:', taskToDelete.value._id);
  isLoading.value = true;
  
  try {
    await taskStore.deleteTask(taskToDelete.value._id);
    showDeleteModal.value = false;
    taskToDelete.value = null;
  } catch (error) {
    console.error('❌ Erro ao deletar tarefa:', error);
  } finally {
    isLoading.value = false;
  }
};

// Marca tarefa como concluída
const completeTask = async (taskId) => {
  console.log('✅ Marcando tarefa como concluída:', taskId);
  isLoading.value = true;
  
  try {
    await taskStore.completeTask(taskId);
  } catch (error) {
    console.error('❌ Erro ao concluir tarefa:', error);
  } finally {
    isLoading.value = false;
  }
};

// Carrega tarefas ao montar o componente
onMounted(loadTasks);
</script>

<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col>
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Gerenciamento de Tarefas</h1>
          </div>
          <v-btn
            @click="goToNewTask"
            color="primary"
            prepend-icon="mdi-plus"
            size="large"
          >
            Nova Tarefa
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
              v-model="filters.status"
              :items="statusOptions"
              item-title="label"
              item-value="value"
              label="Status"
              variant="outlined"
              density="compact"
            ></v-select>
          </v-col>
          
          <v-col cols="12" md="4">
            <v-select
              v-model="filters.priority"
              :items="priorityOptions"
              item-title="label"
              item-value="value"
              label="Prioridade"
              variant="outlined"
              density="compact"
            ></v-select>
          </v-col>
          
          <v-col cols="12" md="4" class="d-flex align-end ga-2">
            <v-btn
              @click="applyFilters"
              color="primary"
              prepend-icon="mdi-magnify"
              variant="outlined"
            >
              Filtrar
            </v-btn>
            <v-btn
              @click="clearFilters"
              variant="outlined"
              prepend-icon="mdi-filter-remove"
            >
              Limpar
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    
    <!-- Lista de tarefas -->
    <v-card elevation="4">
      <!-- Loading -->
      <v-row v-if="isLoading" justify="center">
        <v-col cols="auto" class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
          <p class="mt-4 text-h6">Carregando tarefas...</p>
        </v-col>
      </v-row>
      
      <!-- Sem tarefas -->
      <v-card-text v-else-if="filteredTasks.length === 0">
        <v-empty-state
          icon="mdi-clipboard-list-outline"
          title="Nenhuma tarefa encontrada"
          text="Comece criando sua primeira tarefa"
        >
          <template v-slot:actions>
            <v-btn @click="goToNewTask" color="primary">
              Criar Nova Tarefa
            </v-btn>
          </template>
        </v-empty-state>
      </v-card-text>
      
      <!-- Tabela de tarefas -->
      <v-data-table
        v-else
        :items="filteredTasks"
        :headers="[
          { title: 'Título', key: 'title' },
          { title: 'Status', key: 'status' },
          { title: 'Prioridade', key: 'priority' },
          { title: 'Responsável', key: 'assignedTo' },
          { title: 'Data Limite', key: 'dueDate' },
          { title: 'Ações', key: 'actions', sortable: false }
        ]"
        class="elevation-0"
        :items-per-page="10"
      >
        <template v-slot:item.title="{ item }">
          <div>
            <div class="font-weight-medium">{{ item.title }}</div>
            <div v-if="item.description" class="text-caption text-grey-darken-1">
              {{ item.description.substring(0, 100) + (item.description.length > 100 ? '...' : '') }}
            </div>
          </div>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip
            :color="
              item.status === 'pendente' ? 'warning' :
              item.status === 'em_andamento' ? 'primary' :
              item.status === 'concluida' ? 'success' : 'error'
            "
            size="small"
            variant="tonal"
          >
            {{ item.status === 'pendente' ? 'Pendente' :
               item.status === 'em_andamento' ? 'Em andamento' :
               item.status === 'concluida' ? 'Concluída' : 'Cancelada' }}
          </v-chip>
        </template>

        <template v-slot:item.priority="{ item }">
          <v-chip
            :color="
              item.priority === 'baixa' ? 'grey' :
              item.priority === 'media' ? 'info' :
              item.priority === 'alta' ? 'warning' : 'error'
            "
            size="small"
            variant="tonal"
          >
            {{ item.priority === 'baixa' ? 'Baixa' :
               item.priority === 'media' ? 'Média' :
               item.priority === 'alta' ? 'Alta' : 'Urgente' }}
          </v-chip>
        </template>

        <template v-slot:item.assignedTo="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="24" color="primary" class="me-2">
              <span class="text-caption">
                {{ item.assignedTo?.name?.charAt(0).toUpperCase() || 'N' }}
              </span>
            </v-avatar>
            {{ item.assignedTo?.name || 'Não atribuído' }}
          </div>
        </template>

        <template v-slot:item.dueDate="{ item }">
          <div v-if="item.dueDate">
            {{ new Date(item.dueDate).toLocaleDateString('pt-BR') }}
          </div>
          <span v-else class="text-grey-darken-1">Sem data</span>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex ga-1">
            <v-tooltip text="Marcar como concluída" v-if="item.status !== 'concluida' && item.status !== 'cancelada'">
              <template v-slot:activator="{ props }">
                <v-btn
                  @click="completeTask(item._id)"
                  icon="mdi-check-circle"
                  color="success"
                  size="small"
                  variant="text"
                  v-bind="props"
                ></v-btn>
              </template>
            </v-tooltip>
            
            <v-tooltip text="Editar tarefa">
              <template v-slot:activator="{ props }">
                <v-btn
                  @click="editTask(item._id)"
                  icon="mdi-pencil"
                  color="primary"
                  size="small"
                  variant="text"
                  v-bind="props"
                ></v-btn>
              </template>
            </v-tooltip>
            
            <v-tooltip text="Excluir tarefa">
              <template v-slot:activator="{ props }">
                <v-btn
                  @click="confirmDelete(item)"
                  icon="mdi-delete"
                  color="error"
                  size="small"
                  variant="text"
                  v-bind="props"
                ></v-btn>
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </v-card>
    
    <!-- Modal de confirmação de exclusão -->
    <v-dialog v-model="showDeleteModal" max-width="400">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="me-2" color="error">mdi-alert-circle</v-icon>
          Confirmar exclusão
        </v-card-title>
        
        <v-card-text>
          Tem certeza que deseja excluir a tarefa "{{ taskToDelete?.title }}"?
          Esta ação não pode ser desfeita.
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showDeleteModal = false" variant="outlined">
            Cancelar
          </v-btn>
          <v-btn @click="deleteTask" color="error">
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>