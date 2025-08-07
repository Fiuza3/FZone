import { defineStore } from 'pinia';
import api from '../services/api';

export const useEventStore = defineStore('event', {
  state: () => ({
    events: [],
    loading: false,
    error: null
  }),

  getters: {
    upcomingEvents: (state) => {
      const now = new Date();
      return state.events.filter(event => 
        new Date(event.startDate) > now && event.status !== 'cancelado'
      );
    },
    
    eventsByMonth: (state) => {
      return state.events.reduce((acc, event) => {
        const month = new Date(event.startDate).toISOString().slice(0, 7);
        if (!acc[month]) acc[month] = [];
        acc[month].push(event);
        return acc;
      }, {});
    }
  },

  actions: {
    async fetchEvents() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.get('/events');
        this.events = response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Erro ao buscar eventos';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createEvent(eventData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.post('/events', eventData);
        this.events.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Erro ao criar evento';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateEvent(id, eventData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.put(`/events/${id}`, eventData);
        const index = this.events.findIndex(e => e._id === id);
        if (index !== -1) {
          this.events[index] = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Erro ao atualizar evento';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteEvent(id) {
      this.loading = true;
      this.error = null;
      
      try {
        await api.delete(`/events/${id}`);
        this.events = this.events.filter(e => e._id !== id);
      } catch (error) {
        this.error = error.response?.data?.error || 'Erro ao deletar evento';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getEventsReport() {
      try {
        const response = await api.get('/events/report');
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Erro ao buscar relatório';
        throw error;
      }
    }
  }
});