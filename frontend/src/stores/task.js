import { defineStore } from 'pinia';
import api from '../services/api';

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
    loading: false,
    error: null
  }),
  
  getters: {
    pendingTasks: (state) => state.tasks.filter(task => task.status === 'pendente'),
    completedTasks: (state) => state.tasks.filter(task => task.status === 'concluida'),
    inProgressTasks: (state) => state.tasks.filter(task => task.status === 'em_andamento'),
    urgentTasks: (state) => state.tasks.filter(task => task.priority === 'urgente')
  },
  
  actions: {
    async fetchTasks(filters = {}) {
      console.log('📋 Buscando tarefas com filtros:', filters);
      this.loading = true;
      
      try {
        const response = await api.get('/tasks', { params: filters });
        console.log(`✅ ${response.data.length} tarefas carregadas`);
        this.tasks = response.data;
        return this.tasks;
      } catch (error) {
        console.error('❌ Erro ao buscar tarefas:', error);
        this.error = error.response?.data?.error || 'Erro ao carregar tarefas';
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    async createTask(taskData) {
      console.log('➕ Criando nova tarefa:', taskData.title);
      this.loading = true;
      
      try {
        const response = await api.post('/tasks', taskData);
        console.log('✅ Tarefa criada:', response.data.title);
        this.tasks.unshift(response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Erro ao criar tarefa:', error);
        this.error = error.response?.data?.error || 'Erro ao criar tarefa';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateTask(id, taskData) {
      console.log('✏️ Atualizando tarefa ID:', id);
      this.loading = true;
      
      try {
        const response = await api.put(`/tasks/${id}`, taskData);
        console.log('✅ Tarefa atualizada:', response.data.title);
        
        // Atualiza a tarefa na lista
        const index = this.tasks.findIndex(task => task._id === id);
        if (index !== -1) {
          this.tasks[index] = response.data;
        }
        
        return response.data;
      } catch (error) {
        console.error('❌ Erro ao atualizar tarefa:', error);
        this.error = error.response?.data?.error || 'Erro ao atualizar tarefa';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async completeTask(id) {
      console.log('✅ Marcando tarefa como concluída ID:', id);
      this.loading = true;
      
      try {
        const response = await api.patch(`/tasks/${id}/complete`);
        console.log('🎉 Tarefa concluída:', response.data.title);
        
        // Atualiza a tarefa na lista
        const index = this.tasks.findIndex(task => task._id === id);
        if (index !== -1) {
          this.tasks[index] = response.data;
        }
        
        return response.data;
      } catch (error) {
        console.error('❌ Erro ao concluir tarefa:', error);
        this.error = error.response?.data?.error || 'Erro ao concluir tarefa';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteTask(id) {
      console.log('🗑️ Deletando tarefa ID:', id);
      this.loading = true;
      
      try {
        await api.delete(`/tasks/${id}`);
        console.log('✅ Tarefa deletada com sucesso');
        
        // Remove a tarefa da lista
        this.tasks = this.tasks.filter(task => task._id !== id);
        return true;
      } catch (error) {
        console.error('❌ Erro ao deletar tarefa:', error);
        this.error = error.response?.data?.error || 'Erro ao deletar tarefa';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});