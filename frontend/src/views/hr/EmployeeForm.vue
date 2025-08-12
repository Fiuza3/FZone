<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useHRStore } from '../../stores/hr';
import { useNotificationStore } from '../../stores/notification';

const router = useRouter();
const route = useRoute();
const hrStore = useHRStore();
const notificationStore = useNotificationStore();

// Estado do formulário
const employee = ref({
  name: '',
  email: '',
  phone: '',
  position: '',
  department: 'ti',
  salary: 0,
  hireDate: new Date().toISOString().split('T')[0],
  status: 'ativo',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: ''
  },
  documents: {
    cpf: '',
    rg: ''
  },
  emergencyContact: {
    name: '',
    phone: '',
    relationship: ''
  }
});

const isLoading = ref(false);
const isEditing = computed(() => !!route.params.id);
const errorMessage = ref('');

// Opções de departamento
const departmentOptions = [
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'estoque', label: 'Estoque' },
  { value: 'vendas', label: 'Vendas' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'rh', label: 'RH' },
  { value: 'ti', label: 'TI' }
];

// Opções de status
const statusOptions = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
  { value: 'ferias', label: 'Férias' },
  { value: 'licenca', label: 'Licença' }
];

// Opções de relacionamento
const relationshipOptions = [
  { value: 'conjuge', label: 'Cônjuge' },
  { value: 'pai', label: 'Pai' },
  { value: 'mae', label: 'Mãe' },
  { value: 'filho', label: 'Filho(a)' },
  { value: 'irmao', label: 'Irmão/Irmã' },
  { value: 'outro', label: 'Outro' }
];

// Carrega dados do funcionário se estiver editando
onMounted(async () => {
  if (isEditing.value) {
    isLoading.value = true;
    
    try {
      // Em um caso real, buscaríamos o funcionário específico
      // Aqui vamos simular encontrando no store
      await hrStore.fetchEmployees();
      const existingEmployee = hrStore.employees.find(e => e._id === route.params.id);
      
      if (existingEmployee) {
        employee.value = { ...existingEmployee };
        
        // Garante que a data esteja no formato correto
        if (employee.value.hireDate) {
          employee.value.hireDate = new Date(employee.value.hireDate).toISOString().split('T')[0];
        }
      } else {
        errorMessage.value = 'Funcionário não encontrado';
      }
    } catch (error) {
      console.error('❌ Erro ao carregar funcionário:', error);
      errorMessage.value = 'Erro ao carregar dados do funcionário';
    } finally {
      isLoading.value = false;
    }
  }
});

// Formata CPF
const formatCPF = (value) => {
  if (!value) return '';
  
  // Remove caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const cpf = numbers.substring(0, 11);
  
  // Formata como XXX.XXX.XXX-XX
  if (cpf.length <= 3) {
    return cpf;
  } else if (cpf.length <= 6) {
    return `${cpf.substring(0, 3)}.${cpf.substring(3)}`;
  } else if (cpf.length <= 9) {
    return `${cpf.substring(0, 3)}.${cpf.substring(3, 6)}.${cpf.substring(6)}`;
  } else {
    return `${cpf.substring(0, 3)}.${cpf.substring(3, 6)}.${cpf.substring(6, 9)}-${cpf.substring(9)}`;
  }
};

// Atualiza CPF formatado
const updateCPF = (event) => {
  employee.value.documents.cpf = formatCPF(event.target.value);
};

// Salva o funcionário
const saveEmployee = async () => {
  if (!employee.value.name.trim()) {
    errorMessage.value = 'O nome do funcionário é obrigatório';
    return;
  }
  
  if (!employee.value.email.trim()) {
    errorMessage.value = 'O email do funcionário é obrigatório';
    return;
  }
  
  if (!employee.value.documents.cpf.trim() || employee.value.documents.cpf.replace(/\D/g, '').length !== 11) {
    errorMessage.value = 'CPF inválido';
    return;
  }
  
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    if (isEditing.value) {
      await hrStore.updateEmployee(route.params.id, employee.value);
      console.log('✅ Funcionário atualizado com sucesso');
      notificationStore.addHRNotification({
        id: route.params.id,
        name: employee.value.name
      }, 'atualizado');
    } else {
      await hrStore.createEmployee(employee.value);
      console.log('✅ Funcionário cadastrado com sucesso');
      notificationStore.addHRNotification({
        id: Math.random().toString(36).substring(2),
        name: employee.value.name
      }, 'adicionado');
    }
    
    // Redireciona para a lista de funcionários
    router.push('/hr');
  } catch (error) {
    console.error('❌ Erro ao salvar funcionário:', error);
    errorMessage.value = error.response?.data?.error || 'Erro ao salvar funcionário';
  } finally {
    isLoading.value = false;
  }
};

// Cancela e volta para a lista
const cancelForm = () => {
  router.push('/hr');
};
</script>

<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col>
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">{{ isEditing ? 'Editar Funcionário' : 'Novo Funcionário' }}</h1>
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
      <!-- Loading -->
      <v-row v-if="isLoading" justify="center" class="pa-8">
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
      <v-form v-else @submit.prevent="saveEmployee">
        <v-card-text>
          <!-- Mensagem de erro -->
          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            class="mb-6"
            closable
            @click:close="errorMessage = ''"
          >
            {{ errorMessage }}
          </v-alert>
          
          <!-- Informações básicas -->
          <v-card class="mb-6" variant="outlined">
            <v-card-title class="d-flex align-center bg-grey-lighten-5">
              <v-icon class="me-2" color="primary">mdi-account</v-icon>
              Informações Básicas
            </v-card-title>
            
            <v-card-text>
              <!-- Nome -->
              <v-text-field
                v-model="employee.name"
                label="Nome completo"
                variant="outlined"
                density="compact"
                required
                class="mb-4"
                prepend-inner-icon="mdi-account"
                placeholder="Nome completo do funcionário"
              ></v-text-field>
              
              <!-- Email e Telefone -->
              <v-row class="mb-4">
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="employee.email"
                    label="Email"
                    type="email"
                    variant="outlined"
                    density="compact"
                    required
                    prepend-inner-icon="mdi-email"
                    placeholder="email@exemplo.com"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="employee.phone"
                    label="Telefone"
                    type="tel"
                    variant="outlined"
                    density="compact"
                    required
                    prepend-inner-icon="mdi-phone"
                    placeholder="(00) 00000-0000"
                  ></v-text-field>
                </v-col>
              </v-row>
              
              <!-- Cargo, Departamento e Status -->
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="employee.position"
                    label="Cargo"
                    variant="outlined"
                    density="compact"
                    required
                    prepend-inner-icon="mdi-briefcase"
                    placeholder="Cargo do funcionário"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" md="4">
                  <v-select
                    v-model="employee.department"
                    :items="departmentOptions"
                    item-title="label"
                    item-value="value"
                    label="Departamento"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-domain"
                  ></v-select>
                </v-col>
                
                <v-col cols="12" md="4">
                  <v-select
                    v-model="employee.status"
                    :items="statusOptions"
                    item-title="label"
                    item-value="value"
                    label="Status"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-account-check"
                  ></v-select>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          
          <!-- Informações de contratação -->
          <v-card class="mb-6" variant="outlined">
            <v-card-title class="d-flex align-center bg-grey-lighten-5">
              <v-icon class="me-2" color="primary">mdi-calendar-account</v-icon>
              Informações de Contratação
            </v-card-title>
            
            <v-card-text>
              <v-row>
                <!-- Data de contratação -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="employee.hireDate"
                    label="Data de contratação"
                    type="date"
                    variant="outlined"
                    density="compact"
                    required
                    prepend-inner-icon="mdi-calendar"
                  ></v-text-field>
                </v-col>
                
                <!-- Salário -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="employee.salary"
                    label="Salário"
                    type="number"
                    min="0"
                    step="0.01"
                    variant="outlined"
                    density="compact"
                    required
                    prepend-inner-icon="mdi-currency-usd"
                    prefix="R$"
                    placeholder="0.00"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          
          <!-- Documentos -->
          <v-card class="mb-6" variant="outlined">
            <v-card-title class="d-flex align-center bg-grey-lighten-5">
              <v-icon class="me-2" color="primary">mdi-card-account-details</v-icon>
              Documentos
            </v-card-title>
            
            <v-card-text>
              <v-row>
                <!-- CPF -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="employee.documents.cpf"
                    @input="updateCPF"
                    label="CPF"
                    variant="outlined"
                    density="compact"
                    required
                    prepend-inner-icon="mdi-card-account-details"
                    placeholder="000.000.000-00"
                  ></v-text-field>
                </v-col>
                
                <!-- RG -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="employee.documents.rg"
                    label="RG"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-card-account-details-outline"
                    placeholder="00.000.000-0"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          
          <!-- Endereço -->
          <v-card class="mb-6" variant="outlined">
            <v-card-title class="d-flex align-center bg-grey-lighten-5">
              <v-icon class="me-2" color="primary">mdi-map-marker</v-icon>
              Endereço
            </v-card-title>
            
            <v-card-text>
              <!-- Rua -->
              <v-text-field
                v-model="employee.address.street"
                label="Rua"
                variant="outlined"
                density="compact"
                class="mb-4"
                prepend-inner-icon="mdi-road"
                placeholder="Rua, número e complemento"
              ></v-text-field>
              
              <!-- Cidade, Estado e CEP -->
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="employee.address.city"
                    label="Cidade"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-city"
                    placeholder="Cidade"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="employee.address.state"
                    label="Estado"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-map"
                    placeholder="Estado"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="employee.address.zipCode"
                    label="CEP"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-mailbox"
                    placeholder="00000-000"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          
          <!-- Contato de emergência -->
          <v-card class="mb-6" variant="outlined">
            <v-card-title class="d-flex align-center bg-grey-lighten-5">
              <v-icon class="me-2" color="primary">mdi-phone-alert</v-icon>
              Contato de Emergência
            </v-card-title>
            
            <v-card-text>
              <!-- Nome -->
              <v-text-field
                v-model="employee.emergencyContact.name"
                label="Nome"
                variant="outlined"
                density="compact"
                class="mb-4"
                prepend-inner-icon="mdi-account-outline"
                placeholder="Nome do contato de emergência"
              ></v-text-field>
              
              <!-- Telefone e Relacionamento -->
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="employee.emergencyContact.phone"
                    label="Telefone"
                    type="tel"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-phone"
                    placeholder="(00) 00000-0000"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-select
                    v-model="employee.emergencyContact.relationship"
                    :items="relationshipOptions"
                    item-title="label"
                    item-value="value"
                    label="Relacionamento"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-account-heart"
                    placeholder="Selecione..."
                  ></v-select>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-card-text>
        
        <!-- Botões de ação -->
        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn
            @click="cancelForm"
            variant="outlined"
            size="large"
            class="me-3"
          >
            Cancelar
          </v-btn>
          
          <v-btn
            type="submit"
            :loading="isLoading"
            color="primary"
            size="large"
          >
            {{ isEditing ? 'Atualizar' : 'Cadastrar' }} Funcionário
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-container>
</template>