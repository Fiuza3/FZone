import { defineStore } from 'pinia';
import api from '../services/api';

export const useHRStore = defineStore('hr', {
  state: () => ({
    employees: [],
    payrollReport: null,
    birthdayReport: null,
    loading: false,
    error: null
  }),
  
  getters: {
    activeEmployees: (state) => state.employees.filter(emp => emp.status === 'ativo'),
    employeesByDepartment: (state) => {
      const departments = {};
      state.employees.forEach(emp => {
        if (!departments[emp.department]) {
          departments[emp.department] = [];
        }
        departments[emp.department].push(emp);
      });
      return departments;
    },
    totalSalaries: (state) => {
      return state.activeEmployees.reduce((total, emp) => total + emp.salary, 0);
    }
  },
  
  actions: {
    async fetchEmployees(filters = {}) {
      console.log('👥 Buscando funcionários com filtros:', filters);
      this.loading = true;
      
      try {
        const response = await api.get('/hr', { params: filters });
        console.log(`✅ ${response.data.length} funcionários carregados`);
        this.employees = response.data;
        return this.employees;
      } catch (error) {
        console.error('❌ Erro ao buscar funcionários:', error);
        this.error = error.response?.data?.error || 'Erro ao carregar funcionários';
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    async createEmployee(employeeData) {
      console.log('➕ Cadastrando novo funcionário:', employeeData.name);
      this.loading = true;
      
      try {
        const response = await api.post('/hr', employeeData);
        console.log('✅ Funcionário cadastrado:', response.data.employee.name);
        this.employees.push(response.data.employee);
        return response.data.employee;
      } catch (error) {
        console.error('❌ Erro ao cadastrar funcionário:', error);
        this.error = error.response?.data?.error || 'Erro ao cadastrar funcionário';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateEmployee(id, employeeData) {
      console.log('✏️ Atualizando funcionário ID:', id);
      this.loading = true;
      
      try {
        const response = await api.put(`/hr/${id}`, employeeData);
        console.log('✅ Funcionário atualizado:', response.data.employee.name);
        
        // Atualiza o funcionário na lista
        const index = this.employees.findIndex(emp => emp._id === id);
        if (index !== -1) {
          this.employees[index] = response.data.employee;
        }
        
        return response.data.employee;
      } catch (error) {
        console.error('❌ Erro ao atualizar funcionário:', error);
        this.error = error.response?.data?.error || 'Erro ao atualizar funcionário';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async deactivateEmployee(id) {
      console.log('🚫 Desativando funcionário ID:', id);
      this.loading = true;
      
      try {
        const response = await api.patch(`/hr/${id}/deactivate`);
        console.log('✅ Funcionário desativado:', response.data.employee.name);
        
        // Atualiza o funcionário na lista
        const index = this.employees.findIndex(emp => emp._id === id);
        if (index !== -1) {
          this.employees[index] = response.data.employee;
        }
        
        return response.data.employee;
      } catch (error) {
        console.error('❌ Erro ao desativar funcionário:', error);
        this.error = error.response?.data?.error || 'Erro ao desativar funcionário';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async getPayrollReport() {
      console.log('💰 Gerando relatório de folha de pagamento');
      this.loading = true;
      
      try {
        const response = await api.get('/hr/payroll');
        console.log('✅ Relatório de folha gerado com sucesso');
        this.payrollReport = response.data;
        return this.payrollReport;
      } catch (error) {
        console.error('❌ Erro ao gerar relatório de folha:', error);
        this.error = error.response?.data?.error || 'Erro ao gerar relatório de folha';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async getBirthdayReport() {
      console.log('🎂 Gerando relatório de aniversariantes');
      this.loading = true;
      
      try {
        const response = await api.get('/hr/birthdays');
        console.log('✅ Relatório de aniversariantes gerado com sucesso');
        this.birthdayReport = response.data;
        return this.birthdayReport;
      } catch (error) {
        console.error('❌ Erro ao gerar relatório de aniversariantes:', error);
        this.error = error.response?.data?.error || 'Erro ao gerar relatório de aniversariantes';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});