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
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col>
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Contas</h1>
          </div>
          <v-btn
            v-if="authStore.isAdmin"
            @click="openInviteModal"
            color="primary"
            prepend-icon="mdi-account-plus"
            size="large"
          >
            Convidar Funcionário
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Lista de Funcionários -->
    <v-card class="mb-6" elevation="4">
      <v-card-title class="d-flex align-center bg-grey-lighten-5">
        <v-icon class="me-2" color="primary">mdi-account-group</v-icon>
        Funcionários
      </v-card-title>
      
      <!-- Loading -->
      <v-row v-if="employeeStore.loading" justify="center" class="pa-8">
        <v-col cols="auto" class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
          <p class="mt-4 text-h6">Carregando funcionários...</p>
        </v-col>
      </v-row>
      
      <!-- Empty state -->
      <v-card-text v-else-if="employeeStore.employees.length === 0">
        <v-empty-state
          icon="mdi-account-group-outline"
          title="Nenhum funcionário encontrado"
          text="Convide funcionários para começar"
        ></v-empty-state>
      </v-card-text>
      
      <!-- Data table -->
      <v-data-table
        v-else
        :items="employeeStore.employees"
        :headers="[
          { title: 'Nome', key: 'name' },
          { title: 'Email', key: 'email' },
          { title: 'Cargo', key: 'role' },
          { title: 'Departamento', key: 'department' },
          { title: 'Cadastro', key: 'createdAt' },
          { title: 'Status', key: 'status' }
        ]"
        class="elevation-0"
        :items-per-page="10"
      >
        <template v-slot:item.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar color="primary" class="me-3">
              <span class="text-white">{{ item.name.charAt(0).toUpperCase() }}</span>
            </v-avatar>
            {{ item.name }}
          </div>
        </template>

        <template v-slot:item.role="{ item }">
          <v-chip
            :color="
              item.role === 'owner' ? 'purple' :
              item.role === 'admin' ? 'primary' :
              item.role === 'manager' ? 'info' : 'grey'
            "
            size="small"
            variant="tonal"
          >
            {{ getRoleLabel(item.role) }}
          </v-chip>
        </template>

        <template v-slot:item.department="{ item }">
          {{ getDepartmentLabel(item.department) }}
        </template>

        <template v-slot:item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip
            color="success"
            size="small"
            variant="tonal"
          >
            Ativo
          </v-chip>
        </template>
      </v-data-table>
    </v-card>

    <!-- Convites Pendentes -->
    <v-card v-if="employeeStore.invitations.length > 0" elevation="4">
      <v-card-title class="d-flex align-center bg-grey-lighten-5">
        <v-icon class="me-2" color="warning">mdi-email-outline</v-icon>
        Convites Pendentes
      </v-card-title>
      
      <v-data-table
        :items="employeeStore.invitations"
        :headers="[
          { title: 'Email', key: 'email' },
          { title: 'Cargo', key: 'role' },
          { title: 'Departamento', key: 'department' },
          { title: 'Enviado em', key: 'createdAt' },
          { title: 'Expira em', key: 'expiresAt' }
        ]"
        class="elevation-0"
        :items-per-page="10"
      >
        <template v-slot:item.email="{ item }">
          <span class="font-weight-medium">{{ item.email }}</span>
        </template>

        <template v-slot:item.role="{ item }">
          <v-chip
            color="warning"
            size="small"
            variant="tonal"
          >
            {{ getRoleLabel(item.role) }}
          </v-chip>
        </template>

        <template v-slot:item.department="{ item }">
          {{ getDepartmentLabel(item.department) }}
        </template>

        <template v-slot:item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>

        <template v-slot:item.expiresAt="{ item }">
          {{ formatDate(item.expiresAt) }}
        </template>
      </v-data-table>
    </v-card>

    <!-- Modal de Convite -->
    <v-dialog v-model="showInviteModal" max-width="500">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="me-2" color="primary">mdi-account-plus</v-icon>
          Convidar Funcionário
        </v-card-title>
        
        <v-card-text>
          <InviteForm @close="closeInviteModal" @success="closeInviteModal" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>