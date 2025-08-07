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
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title">Gerenciamento de Tarefas</h1>
      <button @click="goToNewTask" class="btn btn-primary flex items-center">
        <span class="material-icons mr-1">add</span>
        Nova Tarefa
      </button>
    </div>
    
    <!-- Filtros -->
    <div class="card mb-6">
      <h2 class="text-lg font-semibold mb-4">Filtros</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Filtro de status -->
        <div>
          <label for="status-filter" class="form-label">Status</label>
          <select
            id="status-filter"
            v-model="filters.status"
            class="form-input"
          >
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <!-- Filtro de prioridade -->
        <div>
          <label for="priority-filter" class="form-label">Prioridade</label>
          <select
            id="priority-filter"
            v-model="filters.priority"
            class="form-input"
          >
            <option v-for="option in priorityOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <!-- Botões de ação -->
        <div class="flex items-end space-x-2">
          <button @click="applyFilters" class="btn btn-primary">
            <span class="material-icons mr-1">search</span>
            Filtrar
          </button>
          <button @click="clearFilters" class="btn btn-outline">
            <span class="material-icons mr-1">clear</span>
            Limpar
          </button>
        </div>
      </div>
    </div>
    
    <!-- Lista de tarefas -->
    <div class="card">
      <!-- Carregando -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
      
      <!-- Sem tarefas -->
      <div v-else-if="filteredTasks.length === 0" class="text-center py-8">
        <span class="material-icons text-4xl text-gray-400">task</span>
        <p class="text-gray-500 mt-2">Nenhuma tarefa encontrada</p>
        <button @click="goToNewTask" class="btn btn-primary mt-4">
          Criar Nova Tarefa
        </button>
      </div>
      
      <!-- Tabela de tarefas -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Título
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prioridade
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Responsável
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Limite
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="task in filteredTasks" :key="task._id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">{{ task.title }}</div>
                <div v-if="task.description" class="text-sm text-gray-500 truncate max-w-xs">
                  {{ task.description }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="[
                    'px-2 py-1 text-xs rounded-full',
                    task.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                    task.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' :
                    task.status === 'concluida' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  ]"
                >
                  {{ task.status === 'pendente' ? 'Pendente' :
                     task.status === 'em_andamento' ? 'Em andamento' :
                     task.status === 'concluida' ? 'Concluída' : 'Cancelada' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="[
                    'px-2 py-1 text-xs rounded-full',
                    task.priority === 'baixa' ? 'bg-gray-100 text-gray-800' :
                    task.priority === 'media' ? 'bg-blue-100 text-blue-800' :
                    task.priority === 'alta' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  ]"
                >
                  {{ task.priority === 'baixa' ? 'Baixa' :
                     task.priority === 'media' ? 'Média' :
                     task.priority === 'alta' ? 'Alta' : 'Urgente' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ task.assignedTo?.name || 'Não atribuído' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="task.dueDate" class="text-sm text-gray-900">
                  {{ new Date(task.dueDate).toLocaleDateString() }}
                </div>
                <div v-else class="text-sm text-gray-500">
                  Sem data
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <!-- Botão de concluir (apenas para tarefas não concluídas) -->
                  <button 
                    v-if="task.status !== 'concluida' && task.status !== 'cancelada'"
                    @click="completeTask(task._id)" 
                    class="text-green-600 hover:text-green-900"
                    title="Marcar como concluída"
                  >
                    <span class="material-icons">check_circle</span>
                  </button>
                  
                  <!-- Botão de editar -->
                  <button 
                    @click="editTask(task._id)" 
                    class="text-blue-600 hover:text-blue-900"
                    title="Editar tarefa"
                  >
                    <span class="material-icons">edit</span>
                  </button>
                  
                  <!-- Botão de excluir -->
                  <button 
                    @click="confirmDelete(task)" 
                    class="text-red-600 hover:text-red-900"
                    title="Excluir tarefa"
                  >
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Modal de confirmação de exclusão -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">Confirmar exclusão</h3>
        <p class="mb-6">
          Tem certeza que deseja excluir a tarefa "{{ taskToDelete?.title }}"?
          Esta ação não pode ser desfeita.
        </p>
        <div class="flex justify-end space-x-2">
          <button @click="showDeleteModal = false" class="btn btn-outline">
            Cancelar
          </button>
          <button @click="deleteTask" class="btn btn-danger">
            Excluir
          </button>
        </div>
      </div>
    </div>
  </div>
</template>