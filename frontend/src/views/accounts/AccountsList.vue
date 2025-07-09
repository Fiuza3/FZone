<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useEmployeeStore } from '../../stores/employee';
import { useAuthStore } from '../../stores/auth';
import InviteForm from './InviteForm.vue';

const router = useRouter();
const employeeStore = useEmployeeStore();
const authStore = useAuthStore();

const showInviteModal = ref(false);

onMounted(() => {
  employeeStore.fetchEmployees();
  employeeStore.fetchInvitations();
});

const openInviteModal = () => {
  showInviteModal.value = true;
};

const closeInviteModal = () => {
  showInviteModal.value = false;
};

const getRoleLabel = (role) => {
  const roles = {
    owner: 'Proprietário',
    admin: 'Administrador', 
    manager: 'Gerente',
    employee: 'Funcionário'
  };
  return roles[role] || role;
};

const getDepartmentLabel = (department) => {
  const departments = {
    financeiro: 'Financeiro',
    estoque: 'Estoque',
    rh: 'Recursos Humanos',
    ti: 'Tecnologia da Informação',
    vendas: 'Vendas',
    marketing: 'Marketing',
    juridico: 'Jurídico',
    geral: 'Geral'
  };
  return departments[department] || department;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR');
};
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title">Contas</h1>
      <button 
        v-if="authStore.isAdmin"
        @click="openInviteModal"
        class="btn btn-primary"
      >
        <span class="material-icons mr-2">person_add</span>
        Convidar Funcionário
      </button>
    </div>

    <!-- Lista de Funcionários -->
    <div class="card mb-6">
      <div class="card-header">
        <h2 class="text-lg font-semibold">Funcionários</h2>
      </div>
      
      <div v-if="employeeStore.loading" class="p-4 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
      </div>
      
      <div v-else-if="employeeStore.employees.length === 0" class="p-4 text-center text-gray-500">
        Nenhum funcionário encontrado
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departamento</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cadastro</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="employee in employeeStore.employees" :key="employee._id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center mr-3">
                    {{ employee.name.charAt(0).toUpperCase() }}
                  </div>
                  {{ employee.name }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">{{ employee.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {{ getRoleLabel(employee.role) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">{{ getDepartmentLabel(employee.department) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">{{ formatDate(employee.createdAt) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                  Ativo
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Convites Pendentes -->
    <div v-if="employeeStore.invitations.length > 0" class="card">
      <div class="card-header">
        <h2 class="text-lg font-semibold">Convites Pendentes</h2>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departamento</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enviado em</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expira em</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="invite in employeeStore.invitations" :key="invite._id">
              <td class="px-6 py-4 whitespace-nowrap font-medium">{{ invite.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                  {{ getRoleLabel(invite.role) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">{{ getDepartmentLabel(invite.department) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">{{ formatDate(invite.createdAt) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">{{ formatDate(invite.expiresAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Convite -->
    <div v-if="showInviteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">Convidar Funcionário</h3>
        <InviteForm @close="closeInviteModal" @success="closeInviteModal" />
      </div>
    </div>
  </div>
</template>