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
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col>
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">
              {{ isEditing ? 'Editar Tarefa' : 'Nova Tarefa' }}
            </h1>
            <v-breadcrumbs
              :items="[
                { title: 'Dashboard', to: '/' },
                { title: 'Tarefas', to: '/tasks' },
                { title: isEditing ? 'Editar' : 'Nova', disabled: true }
              ]"
              density="compact"
            ></v-breadcrumbs>
          </div>
          
          <v-btn
            @click="cancelForm"
            variant="outlined"
            prepend-icon="mdi-arrow-left"
            size="large"
          >
            Voltar
          </v-btn>
        </div>
      </v-col>
    </v-row>
    
    <!-- Formulário -->
    <v-card elevation="4">
      <v-card-title class="d-flex align-center bg-grey-lighten-5">
        <v-icon class="me-2" color="primary">
          {{ isEditing ? 'mdi-pencil' : 'mdi-plus' }}
        </v-icon>
        {{ isEditing ? 'Editar Tarefa' : 'Criar Nova Tarefa' }}
      </v-card-title>
      
      <v-card-text class="pa-6">
        <!-- Loading -->
        <v-row v-if="isLoading" justify="center">
          <v-col cols="auto" class="text-center">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            ></v-progress-circular>
            <p class="mt-4 text-h6">Carregando dados...</p>
          </v-col>
        </v-row>
        
        <!-- Formulário -->
        <v-form v-else @submit.prevent="saveTask">
          <!-- Alerta de erro -->
          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            closable
            class="mb-6"
            @click:close="errorMessage = ''"
          >
            {{ errorMessage }}
          </v-alert>
          
          <v-row>
            <!-- Título -->
            <v-col cols="12">
              <v-text-field
                v-model="task.title"
                label="Título da Tarefa"
                placeholder="Digite o título da tarefa"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-clipboard-text"
                :rules="[v => !!v || 'Título é obrigatório']"
                required
              ></v-text-field>
            </v-col>
            
            <!-- Descrição -->
            <v-col cols="12">
              <v-textarea
                v-model="task.description"
                label="Descrição"
                placeholder="Descreva a tarefa em detalhes"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-text"
                rows="4"
                auto-grow
              ></v-textarea>
            </v-col>
            
            <!-- Status -->
            <v-col cols="12" md="6">
              <v-select
                v-model="task.status"
                :items="statusOptions"
                item-title="label"
                item-value="value"
                label="Status"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-flag"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-chip
                        :color="
                          item.raw.value === 'pendente' ? 'warning' :
                          item.raw.value === 'em_andamento' ? 'primary' :
                          item.raw.value === 'concluida' ? 'success' : 'error'
                        "
                        size="small"
                        variant="tonal"
                      >
                        {{ item.raw.label }}
                      </v-chip>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
            
            <!-- Prioridade -->
            <v-col cols="12" md="6">
              <v-select
                v-model="task.priority"
                :items="priorityOptions"
                item-title="label"
                item-value="value"
                label="Prioridade"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-priority-high"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-chip
                        :color="
                          item.raw.value === 'baixa' ? 'grey' :
                          item.raw.value === 'media' ? 'info' :
                          item.raw.value === 'alta' ? 'warning' : 'error'
                        "
                        size="small"
                        variant="tonal"
                      >
                        {{ item.raw.label }}
                      </v-chip>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
            
            <!-- Data limite -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="task.dueDate"
                type="date"
                label="Data Limite"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      
      <v-divider></v-divider>
      
      <!-- Ações -->
      <v-card-actions class="pa-6">
        <v-spacer></v-spacer>
        
        <v-btn
          @click="cancelForm"
          variant="outlined"
          size="large"
          prepend-icon="mdi-close"
        >
          Cancelar
        </v-btn>
        
        <v-btn
          @click="saveTask"
          color="primary"
          size="large"
          :loading="isLoading"
          :prepend-icon="isEditing ? 'mdi-content-save' : 'mdi-plus'"
        >
          {{ isEditing ? 'Atualizar' : 'Criar' }} Tarefa
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>