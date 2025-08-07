<script setup>
import { ref, watch, onMounted } from 'vue';

// Estado
const successMessage = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

// Função para aplicar tema
const applyTheme = (theme) => {
  const html = document.documentElement;
  
  if (theme === 'dark') {
    html.classList.add('dark');
    document.body.classList.add('bg-gray-900');
    document.body.classList.add('text-white');
  } else {
    html.classList.remove('dark');
    document.body.classList.remove('bg-gray-900');
    document.body.classList.remove('text-white');
  }
  
  console.log('🌈 Tema aplicado:', theme);
};

// Função para aplicar densidade
const applyDensity = (density) => {
  const body = document.body;
  
  if (density === 'compact') {
    body.classList.add('compact-mode');
  } else {
    body.classList.remove('compact-mode');
  }
  
  console.log('📜 Densidade aplicada:', density);
};

// Função para aplicar tamanho de fonte
const applyFontSize = (size) => {
  const html = document.documentElement;
  
  // Remove classes anteriores
  html.classList.remove('text-sm', 'text-base', 'text-lg');
  
  // Aplica nova classe
  switch (size) {
    case 'small':
      html.classList.add('text-sm');
      break;
    case 'medium':
      html.classList.add('text-base');
      break;
    case 'large':
      html.classList.add('text-lg');
      break;
  }
  
  console.log('📝 Tamanho de fonte aplicado:', size);
};

// Carrega configurações do localStorage ou usa padrões
const loadSettings = () => {
  const savedSettings = localStorage.getItem('userSettings');
  if (savedSettings) {
    return JSON.parse(savedSettings);
  }
  return {
    notifications: {
      browser: true,
      tasks: true,
      system: true
    },
    appearance: {
      theme: 'light',
      density: 'comfortable',
      fontSize: 'medium'
    },
    privacy: {
      shareData: false,
      analytics: true
    }
  };
};

// Configurações
const settings = ref(loadSettings());

// Aplica configurações quando o componente é montado
onMounted(() => {
  applyTheme(settings.value.appearance.theme);
  applyDensity(settings.value.appearance.density);
  applyFontSize(settings.value.appearance.fontSize);
});

// Observa mudanças nas configurações
watch(() => settings.value.appearance.theme, applyTheme);
watch(() => settings.value.appearance.density, applyDensity);
watch(() => settings.value.appearance.fontSize, applyFontSize);

// Salva configurações
const saveSettings = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    // Simulação de salvamento (em um caso real, chamaria a API)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Salva no localStorage para simular persistência
    localStorage.setItem('userSettings', JSON.stringify(settings.value));
    
    successMessage.value = 'Configurações salvas com sucesso';
    
    // Limpa mensagem de sucesso após 3 segundos
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error) {
    console.error('❌ Erro ao salvar configurações:', error);
    errorMessage.value = 'Erro ao salvar configurações';
  } finally {
    isLoading.value = false;
  }
};

// Restaura configurações padrão
const restoreDefaults = () => {
  settings.value = {
    notifications: {
      browser: true,
      tasks: true,
      system: true
    },
    appearance: {
      theme: 'light',
      density: 'comfortable',
      fontSize: 'medium'
    },
    privacy: {
      shareData: false,
      analytics: true
    }
  };
};
</script>

<template>
  <div>
    <h1 class="page-title">Configurações</h1>
    
    <!-- Mensagens -->
    <div v-if="successMessage" class="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <span class="material-icons text-green-500">check_circle</span>
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-700">{{ successMessage }}</p>
        </div>
      </div>
    </div>
    
    <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <span class="material-icons text-red-500">error</span>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
    
    <!-- Configurações -->
    <div class="space-y-6">
      <!-- Notificações -->
      <div class="card">
        <h2 class="section-title">Notificações</h2>
        
        <div class="space-y-4">

          
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-medium text-gray-900 dark:text-white">Notificações do Navegador</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Receba notificações no navegador</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.notifications.browser" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-medium text-gray-900 dark:text-white">Atualizações de Tarefas</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Notificações sobre tarefas atribuídas a você</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.notifications.tasks" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-medium text-gray-900 dark:text-white">Atualizações do Sistema</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Notificações sobre atualizações do sistema</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.notifications.system" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>
      
      <!-- Aparência -->
      <div class="card">
        <h2 class="section-title">Aparência</h2>
        
        <div class="space-y-4">
          <div>
            <label for="theme" class="form-label">Tema</label>
            <select id="theme" v-model="settings.appearance.theme" class="form-input">
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
              <option value="system">Sistema</option>
            </select>
          </div>
          
          <div>
            <label for="density" class="form-label">Densidade</label>
            <select id="density" v-model="settings.appearance.density" class="form-input">
              <option value="comfortable">Confortável</option>
              <option value="compact">Compacto</option>
            </select>
          </div>
          
          <div>
            <label for="font-size" class="form-label">Tamanho da Fonte</label>
            <select id="font-size" v-model="settings.appearance.fontSize" class="form-input">
              <option value="small">Pequeno</option>
              <option value="medium">Médio</option>
              <option value="large">Grande</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Privacidade -->
      <div class="card">
        <h2 class="section-title">Privacidade</h2>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-medium text-gray-900 dark:text-white">Compartilhar Dados de Uso</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Ajude-nos a melhorar o sistema compartilhando dados anônimos de uso</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.privacy.shareData" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-medium text-gray-900 dark:text-white">Analytics</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Permitir coleta de dados para análise de desempenho</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.privacy.analytics" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>
      
      <!-- Botões -->
      <div class="flex justify-end space-x-3">
        <button
          @click="restoreDefaults"
          class="btn btn-outline"
        >
          Restaurar Padrões
        </button>
        
        <button
          @click="saveSettings"
          :disabled="isLoading"
          class="btn btn-primary"
        >
          <span v-if="isLoading" class="animate-spin mr-2">
            <span class="material-icons text-sm">refresh</span>
          </span>
          Salvar Configurações
        </button>
      </div>
    </div>
  </div>
</template>