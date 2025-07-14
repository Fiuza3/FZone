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
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title">Configurações da Empresa</h1>
    </div>

    <!-- Carregando -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
    </div>

    <div v-else>
      <!-- Mensagens -->
      <div v-if="successMessage" class="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
        <div class="flex">
          <span class="material-icons text-green-500 mr-3">check_circle</span>
          <p class="text-green-700">{{ successMessage }}</p>
        </div>
      </div>

      <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div class="flex">
          <span class="material-icons text-red-500 mr-3">error</span>
          <p class="text-red-700">{{ errorMessage }}</p>
        </div>
      </div>

      <!-- Aviso de permissão -->
      <div v-if="!canEdit" class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
        <div class="flex">
          <span class="material-icons text-yellow-500 mr-3">warning</span>
          <p class="text-yellow-700">
            Apenas proprietários e administradores podem alterar as configurações da empresa.
          </p>
        </div>
      </div>

      <form @submit.prevent="saveSettings" class="space-y-8">
        <!-- Informações Básicas -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-semibold">Informações Básicas</h2>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">Nome da Empresa <span class="text-red-500">*</span></label>
                <input 
                  v-model="company.name" 
                  type="text" 
                  required 
                  :disabled="!canEdit"
                  class="form-input" 
                />
              </div>
              <div>
                <label class="form-label">CNPJ</label>
                <input 
                  :value="company.cnpj"
                  @input="updateCNPJ"
                  type="text" 
                  :disabled="!canEdit"
                  class="form-input"
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">Email</label>
                <input 
                  v-model="company.email" 
                  type="email" 
                  :disabled="!canEdit"
                  class="form-input" 
                />
              </div>
              <div>
                <label class="form-label">Telefone</label>
                <input 
                  :value="company.phone"
                  @input="updatePhone"
                  type="text" 
                  :disabled="!canEdit"
                  class="form-input"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
            
            <div>
              <label class="form-label">Website</label>
              <input 
                v-model="company.website" 
                type="url" 
                :disabled="!canEdit"
                class="form-input"
                placeholder="https://www.exemplo.com"
              />
            </div>
            
            <div>
              <label class="form-label">Descrição</label>
              <textarea 
                v-model="company.description" 
                :disabled="!canEdit"
                class="form-input" 
                rows="3"
                placeholder="Descreva sua empresa..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Endereço -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-semibold">Endereço</h2>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="form-label">Endereço Completo</label>
              <input 
                v-model="company.address" 
                type="text" 
                :disabled="!canEdit"
                class="form-input"
                placeholder="Rua, número, bairro"
              />
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="form-label">Cidade</label>
                <input 
                  v-model="company.city" 
                  type="text" 
                  :disabled="!canEdit"
                  class="form-input" 
                />
              </div>
              <div>
                <label class="form-label">Estado</label>
                <select 
                  v-model="company.state" 
                  :disabled="!canEdit"
                  class="form-input"
                >
                  <option value="">Selecione</option>
                  <option v-for="state in brazilianStates" :key="state" :value="state">
                    {{ state }}
                  </option>
                </select>
              </div>
              <div>
                <label class="form-label">CEP</label>
                <input 
                  v-model="company.zipCode" 
                  type="text" 
                  :disabled="!canEdit"
                  class="form-input"
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Redes Sociais -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-semibold">Redes Sociais</h2>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">Facebook</label>
                <input 
                  v-model="company.socialMedia.facebook" 
                  type="url" 
                  :disabled="!canEdit"
                  class="form-input"
                  placeholder="https://facebook.com/sua-empresa"
                />
              </div>
              <div>
                <label class="form-label">Instagram</label>
                <input 
                  v-model="company.socialMedia.instagram" 
                  type="url" 
                  :disabled="!canEdit"
                  class="form-input"
                  placeholder="https://instagram.com/sua-empresa"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">WhatsApp</label>
                <input 
                  v-model="company.socialMedia.whatsapp" 
                  type="text" 
                  :disabled="!canEdit"
                  class="form-input"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label class="form-label">LinkedIn</label>
                <input 
                  v-model="company.socialMedia.linkedin" 
                  type="url" 
                  :disabled="!canEdit"
                  class="form-input"
                  placeholder="https://linkedin.com/company/sua-empresa"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Horário de Funcionamento -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-semibold">Horário de Funcionamento</h2>
          </div>
          <div class="p-6">
            <div class="space-y-3">
              <div 
                v-for="day in weekDays" 
                :key="day.key"
                class="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
              >
                <div class="w-24">
                  <span class="text-sm font-medium">{{ day.label }}</span>
                </div>
                
                <div class="flex items-center space-x-2">
                  <input 
                    v-model="company.businessHours[day.key].closed"
                    type="checkbox"
                    :disabled="!canEdit"
                    class="h-4 w-4 text-primary-600"
                  />
                  <span class="text-sm">Fechado</span>
                </div>
                
                <div v-if="!company.businessHours[day.key].closed" class="flex items-center space-x-2">
                  <input 
                    v-model="company.businessHours[day.key].open"
                    type="time"
                    :disabled="!canEdit"
                    class="form-input w-24"
                  />
                  <span class="text-sm">às</span>
                  <input 
                    v-model="company.businessHours[day.key].close"
                    type="time"
                    :disabled="!canEdit"
                    class="form-input w-24"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>



        <!-- Botões -->
        <div v-if="canEdit" class="flex justify-end">
          <button 
            type="submit" 
            :disabled="isSaving"
            class="btn btn-primary"
          >
            <span v-if="isSaving" class="animate-spin mr-2">
              <span class="material-icons text-sm">refresh</span>
            </span>
            Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  </div>
</template>