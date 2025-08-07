import { defineStore } from 'pinia';
import api from '../services/api';

export const useEmployeeStore = defineStore('employee', {
  state: () => ({
    employees: [],
    invitations: [],
    loading: false,
    error: null
  }),

  actions: {
    async inviteEmployee(inviteData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.post('/employees/invite', inviteData);
        await this.fetchInvitations();
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Erro ao enviar convite';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchEmployees() {
      this.loading = true;
      
      try {
        const response = await api.get('/employees');
        this.employees = response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Erro ao buscar funcionários';
      } finally {
        this.loading = false;
      }
    },

    async fetchInvitations() {
      try {
        const response = await api.get('/employees/invites');
        this.invitations = response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Erro ao buscar convites';
      }
    }
  }
});