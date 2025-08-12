<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
import api from '../services/api';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const isLoading = ref(true);
const isSaving = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Dados da empresa
const company = ref({
  name: '',
  email: '',
  phone: '',
  website: '',
  cnpj: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'Brasil',
  description: '',
  logo: '',
  primaryColor: '#0ea5e9',
  timezone: 'America/Sao_Paulo',
  currency: 'BRL',
  language: 'pt-BR',
  businessHours: {
    monday: { open: '08:00', close: '18:00', closed: false },
    tuesday: { open: '08:00', close: '18:00', closed: false },
    wednesday: { open: '08:00', close: '18:00', closed: false },
    thursday: { open: '08:00', close: '18:00', closed: false },
    friday: { open: '08:00', close: '18:00', closed: false },
    saturday: { open: '08:00', close: '14:00', closed: false },
    sunday: { open: '08:00', close: '14:00', closed: true }
  },
  socialMedia: {
    facebook: '',
    instagram: '',
    whatsapp: '',
    linkedin: ''
  },

});

// Verifica se usuário pode editar
const canEdit = computed(() => {
  return authStore.user?.role === 'owner' || authStore.user?.role === 'admin';
});

// Estados brasileiros
const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// Dias da semana
const weekDays = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
];

onMounted(async () => {
  await loadCompanySettings();
});

// Carrega configurações da empresa
const loadCompanySettings = async () => {
  isLoading.value = true;
  
  try {
    const response = await api.get('/company/settings');
    company.value = { ...company.value, ...response.data };
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    errorMessage.value = 'Erro ao carregar configurações da empresa';
  } finally {
    isLoading.value = false;
  }
};

// Salva configurações
const saveSettings = async () => {
  if (!canEdit.value) {
    errorMessage.value = 'Você não tem permissão para alterar as configurações';
    return;
  }
  
  isSaving.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  
  try {
    await api.put('/company/settings', company.value);
    
    // Atualiza dados do usuário no store
    await authStore.getProfile();
    
    successMessage.value = 'Configurações salvas com sucesso!';
    
    notificationStore.addSystemNotification(
      'Configurações atualizadas',
      'As configurações da empresa foram atualizadas com sucesso'
    );
    
    // Remove mensagem após 3 segundos
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
    
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    errorMessage.value = error.response?.data?.error || 'Erro ao salvar configurações';
  } finally {
    isSaving.value = false;
  }
};

// Formata CNPJ
const formatCNPJ = (value) => {
  if (!value) return '';
  const numbers = value.replace(/\D/g, '');
  const cnpj = numbers.substring(0, 14);
  
  if (cnpj.length <= 2) return cnpj;
  if (cnpj.length <= 5) return `${cnpj.substring(0, 2)}.${cnpj.substring(2)}`;
  if (cnpj.length <= 8) return `${cnpj.substring(0, 2)}.${cnpj.substring(2, 5)}.${cnpj.substring(5)}`;
  if (cnpj.length <= 12) return `${cnpj.substring(0, 2)}.${cnpj.substring(2, 5)}.${cnpj.substring(5, 8)}/${cnpj.substring(8)}`;
  return `${cnpj.substring(0, 2)}.${cnpj.substring(2, 5)}.${cnpj.substring(5, 8)}/${cnpj.substring(8, 12)}-${cnpj.substring(12)}`;
};

// Formata telefone
const formatPhone = (value) => {
  if (!value) return '';
  const numbers = value.replace(/\D/g, '');
  const phone = numbers.substring(0, 11);
  
  if (phone.length <= 2) return `(${phone}`;
  if (phone.length <= 6) return `(${phone.substring(0, 2)}) ${phone.substring(2)}`;
  if (phone.length <= 10) return `(${phone.substring(0, 2)}) ${phone.substring(2, 6)}-${phone.substring(6)}`;
  return `(${phone.substring(0, 2)}) ${phone.substring(2, 7)}-${phone.substring(7)}`;
};

// Atualiza CNPJ formatado
const updateCNPJ = (event) => {
  company.value.cnpj = formatCNPJ(event.target.value);
};

// Atualiza telefone formatado
const updatePhone = (event) => {
  company.value.phone = formatPhone(event.target.value);
};
</script>

<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col>
        <h1 class="text-h4 font-weight-bold mb-2">Configurações da Empresa</h1>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-row v-if="isLoading" justify="center">
      <v-col cols="auto" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <p class="mt-4 text-h6">Carregando configurações...</p>
      </v-col>
    </v-row>

    <div v-else>
      <!-- Mensagens -->
      <v-alert
        v-if="successMessage"
        type="success"
        variant="tonal"
        class="mb-6"
        closable
        @click:close="successMessage = ''"
      >
        {{ successMessage }}
      </v-alert>

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

      <!-- Aviso de permissão -->
      <v-alert
        v-if="!canEdit"
        type="warning"
        variant="tonal"
        class="mb-6"
      >
        Apenas proprietários e administradores podem alterar as configurações da empresa.
      </v-alert>

      <v-form @submit.prevent="saveSettings">
        <!-- Informações Básicas -->
        <v-card class="mb-6" elevation="4">
          <v-card-title class="d-flex align-center bg-grey-lighten-5">
            <v-icon class="me-2" color="primary">mdi-office-building</v-icon>
            Informações Básicas
          </v-card-title>
          
          <v-card-text>
            <v-row class="mb-4">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="company.name"
                  label="Nome da Empresa"
                  variant="outlined"
                  density="compact"
                  required
                  :disabled="!canEdit"
                  prepend-inner-icon="mdi-domain"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="company.cnpj"
                  @input="updateCNPJ"
                  label="CNPJ"
                  variant="outlined"
                  density="compact"
                  :disabled="!canEdit"
                  prepend-inner-icon="mdi-card-account-details"
                  placeholder="00.000.000/0000-00"
                ></v-text-field>
              </v-col>
            </v-row>
            
            <v-row class="mb-4">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="company.email"
                  label="Email"
                  type="email"
                  variant="outlined"
                  density="compact"
                  :disabled="!canEdit"
                  prepend-inner-icon="mdi-email"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="company.phone"
                  @input="updatePhone"
                  label="Telefone"
                  variant="outlined"
                  density="compact"
                  :disabled="!canEdit"
                  prepend-inner-icon="mdi-phone"
                  placeholder="(00) 00000-0000"
                ></v-text-field>
              </v-col>
            </v-row>
            
            <v-text-field
              v-model="company.website"
              label="Website"
              type="url"
              variant="outlined"
              density="compact"
              :disabled="!canEdit"
              class="mb-4"
              prepend-inner-icon="mdi-web"
              placeholder="https://www.exemplo.com"
            ></v-text-field>
            
            <v-textarea
              v-model="company.description"
              label="Descrição"
              variant="outlined"
              density="compact"
              :disabled="!canEdit"
              rows="3"
              prepend-inner-icon="mdi-text"
              placeholder="Descreva sua empresa..."
            ></v-textarea>
          </v-card-text>
        </v-card>

        <!-- Endereço -->
        <v-card class="mb-6" elevation="4">
          <v-card-title class="d-flex align-center bg-grey-lighten-5">
            <v-icon class="me-2" color="primary">mdi-map-marker</v-icon>
            Endereço
          </v-card-title>
          
          <v-card-text>
            <v-text-field
              v-model="company.address"
              label="Endereço Completo"
              variant="outlined"
              density="compact"
              :disabled="!canEdit"
              class="mb-4"
              prepend-inner-icon="mdi-road"
              placeholder="Rua, número, bairro"
            ></v-text-field>
            
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="company.city"
                  label="Cidade"
                  variant="outlined"
                  density="compact"
                  :disabled="!canEdit"
                  prepend-inner-icon="mdi-city"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="company.state"
                  :items="brazilianStates"
                  label="Estado"
                  variant="outlined"
                  density="compact"
                  :disabled="!canEdit"
                  prepend-inner-icon="mdi-map"
                  placeholder="Selecione"
                ></v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="company.zipCode"
                  label="CEP"
                  variant="outlined"
                  density="compact"
                  :disabled="!canEdit"
                  prepend-inner-icon="mdi-mailbox"
                  placeholder="00000-000"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Redes Sociais -->
        <v-card class="mb-6" elevation="4">
          <v-card-title class="d-flex align-center bg-grey-lighten-5">
            <v-icon class="me-2" color="primary">mdi-share-variant</v-icon>
            Redes Sociais
          </v-card-title>
          
          <v-card-text>
            <v-row class="mb-4">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="company.socialMedia.facebook"
                  label="Facebook"
                  type="url"
                  variant="outlined"
                  density="compact"
                  :disabled="!canEdit"
                  prepend-inner-icon="mdi-facebook"
                  placeholder="https://facebook.com/sua-empresa"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="company.socialMedia.instagram"
                  label="Instagram"
                  type="url"
                  variant="outlined"
                  density="compact"
                  :disabled="!canEdit"
                  prepend-inner-icon="mdi-instagram"
                  placeholder="https://instagram.com/sua-empresa"
                ></v-text-field>
              </v-col>
            </v-row>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="company.socialMedia.whatsapp"
                  label="WhatsApp"
                  variant="outlined"
                  density="compact"
                  :disabled="!canEdit"
                  prepend-inner-icon="mdi-whatsapp"
                  placeholder="(00) 00000-0000"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="company.socialMedia.linkedin"
                  label="LinkedIn"
                  type="url"
                  variant="outlined"
                  density="compact"
                  :disabled="!canEdit"
                  prepend-inner-icon="mdi-linkedin"
                  placeholder="https://linkedin.com/company/sua-empresa"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Horário de Funcionamento -->
        <v-card class="mb-6" elevation="4">
          <v-card-title class="d-flex align-center bg-grey-lighten-5">
            <v-icon class="me-2" color="primary">mdi-clock-outline</v-icon>
            Horário de Funcionamento
          </v-card-title>
          
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="day in weekDays"
                :key="day.key"
                class="mb-2"
              >
                <template v-slot:prepend>
                  <div class="me-4" style="min-width: 120px;">
                    <span class="text-body-2 font-weight-medium">{{ day.label }}</span>
                  </div>
                </template>
                
                <div class="d-flex align-center ga-4">
                  <v-checkbox
                    v-model="company.businessHours[day.key].closed"
                    :disabled="!canEdit"
                    label="Fechado"
                    density="compact"
                    hide-details
                  ></v-checkbox>
                  
                  <div v-if="!company.businessHours[day.key].closed" class="d-flex align-center ga-2">
                    <v-text-field
                      v-model="company.businessHours[day.key].open"
                      type="time"
                      :disabled="!canEdit"
                      variant="outlined"
                      density="compact"
                      style="width: 120px;"
                      hide-details
                    ></v-text-field>
                    <span class="text-caption">às</span>
                    <v-text-field
                      v-model="company.businessHours[day.key].close"
                      type="time"
                      :disabled="!canEdit"
                      variant="outlined"
                      density="compact"
                      style="width: 120px;"
                      hide-details
                    ></v-text-field>
                  </div>
                </div>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Botões -->
        <v-card-actions v-if="canEdit" class="pa-6">
          <v-spacer></v-spacer>
          <v-btn
            type="submit"
            :loading="isSaving"
            color="primary"
            size="large"
          >
            Salvar Configurações
          </v-btn>
        </v-card-actions>
      </v-form>
    </div>
  </v-container>
</template>