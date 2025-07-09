<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTaskStore } from '../../stores/task';
import { useNotificationStore } from '../../stores/notification';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const route = useRoute();
const taskStore = useTaskStore();
const notificationStore = useNotificationStore();
const authStore = useAuthStore();

// Estado do formulário
const task = ref({
  title: '',
  description: '',
  priority: 'media',
  status: 'pendente',
  dueDate: '',
  assignedTo: ''
});

const isLoading = ref(false);
const isEditing = computed(() => !!route.params.id);
const errorMessage = ref('');

// Opções de prioridade
const priorityOptions = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' }
];

// Opções de status
const statusOptions = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'cancelada', label: 'Cancelada' }
];

// Carrega dados da tarefa se estiver editando
onMounted(async () => {
  if (isEditing.value) {
    isLoading.value = true;
    
    try {
      // Em um caso real, buscaríamos a tarefa específica
      // Aqui vamos simular encontrando no store
      await taskStore.fetchTasks();
      const existingTask = taskStore.tasks.find(t => t._id === route.params.id);
      
      if (existingTask) {
        task.value = {
          title: existingTask.title,
          description: existingTask.description || '',
          priority: existingTask.priority,
          status: existingTask.status,
          dueDate: existingTask.dueDate ? new Date(existingTask.dueDate).toISOString().split('T')[0] : '',
          assignedTo: existingTask.assignedTo?._id || authStore.user.id
        };
      } else {
        errorMessage.value = 'Tarefa não encontrada';
      }
    } catch (error) {
      console.error('❌ Erro ao carregar tarefa:', error);
      errorMessage.value = 'Erro ao carregar dados da tarefa';
    } finally {
      isLoading.value = false;
    }
  } else {
    // Define o usuário atual como responsável por padrão
    task.value.assignedTo = authStore.user?.id;
  }
});

// Salva a tarefa
const saveTask = async () => {
  if (!task.value.title.trim()) {
    errorMessage.value = 'O título da tarefa é obrigatório';
    return;
  }
  
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    if (isEditing.value) {
      await taskStore.updateTask(route.params.id, task.value);
      console.log('✅ Tarefa atualizada com sucesso');
      notificationStore.addSystemNotification('Tarefa atualizada', `A tarefa "${task.value.title}" foi atualizada com sucesso`);
    } else {
      await taskStore.createTask(task.value);
      console.log('✅ Tarefa criada com sucesso');
      notificationStore.addTaskNotification(task.value);
    }
    
    // Redireciona para a lista de tarefas
    router.push('/tasks');
  } catch (error) {
    console.error('❌ Erro ao salvar tarefa:', error);
    errorMessage.value = 'Erro ao salvar tarefa';
  } finally {
    isLoading.value = false;
  }
};

// Cancela e volta para a lista
const cancelForm = () => {
  router.push('/tasks');
};
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title">{{ isEditing ? 'Editar Tarefa' : 'Nova Tarefa' }}</h1>
    </div>
    
    <!-- Formulário -->
    <div class="card">
      <!-- Carregando -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
      
      <!-- Formulário -->
      <form v-else @submit.prevent="saveTask" class="space-y-6">
        <!-- Mensagem de erro -->
        <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-500 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <span class="material-icons text-red-500">error</span>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ errorMessage }}</p>
            </div>
          </div>
        </div>
        
        <!-- Título -->
        <div>
          <label for="title" class="form-label">Título <span class="text-red-500">*</span></label>
          <input
            id="title"
            v-model="task.title"
            type="text"
            required
            class="form-input"
            placeholder="Digite o título da tarefa"
          />
        </div>
        
        <!-- Descrição -->
        <div>
          <label for="description" class="form-label">Descrição</label>
          <textarea
            id="description"
            v-model="task.description"
            rows="4"
            class="form-input"
            placeholder="Descreva a tarefa em detalhes"
          ></textarea>
        </div>
        
        <!-- Status e Prioridade -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Status -->
          <div>
            <label for="status" class="form-label">Status</label>
            <select
              id="status"
              v-model="task.status"
              class="form-input"
            >
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          
          <!-- Prioridade -->
          <div>
            <label for="priority" class="form-label">Prioridade</label>
            <select
              id="priority"
              v-model="task.priority"
              class="form-input"
            >
              <option v-for="option in priorityOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
        
        <!-- Data limite -->
        <div>
          <label for="due-date" class="form-label">Data limite</label>
          <input
            id="due-date"
            v-model="task.dueDate"
            type="date"
            class="form-input"
          />
        </div>
        
        <!-- Botões de ação -->
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="cancelForm"
            class="btn btn-outline"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            :disabled="isLoading"
            class="btn btn-primary"
          >
            <span v-if="isLoading" class="animate-spin mr-2">
              <span class="material-icons text-sm">refresh</span>
            </span>
            {{ isEditing ? 'Atualizar' : 'Criar' }} Tarefa
          </button>
        </div>
      </form>
    </div>
  </div>
</template>