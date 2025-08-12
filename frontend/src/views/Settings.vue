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
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col>
        <h1 class="text-h4 font-weight-bold mb-2">Configurações</h1>
      </v-col>
    </v-row>
    
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
    
    <!-- Configurações -->
    <div>
      <!-- Notificações -->
      <v-card class="mb-6" elevation="4">
        <v-card-title class="d-flex align-center bg-grey-lighten-5">
          <v-icon class="me-2" color="primary">mdi-bell</v-icon>
          Notificações
        </v-card-title>
        
        <v-card-text>
          <v-list>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-web</v-icon>
              </template>
              
              <v-list-item-title>Notificações do Navegador</v-list-item-title>
              <v-list-item-subtitle>Receba notificações no navegador</v-list-item-subtitle>
              
              <template v-slot:append>
                <v-switch
                  v-model="settings.notifications.browser"
                  color="primary"
                  hide-details
                ></v-switch>
              </template>
            </v-list-item>
            
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-clipboard-check</v-icon>
              </template>
              
              <v-list-item-title>Atualizações de Tarefas</v-list-item-title>
              <v-list-item-subtitle>Notificações sobre tarefas atribuídas a você</v-list-item-subtitle>
              
              <template v-slot:append>
                <v-switch
                  v-model="settings.notifications.tasks"
                  color="primary"
                  hide-details
                ></v-switch>
              </template>
            </v-list-item>
            
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-cog</v-icon>
              </template>
              
              <v-list-item-title>Atualizações do Sistema</v-list-item-title>
              <v-list-item-subtitle>Notificações sobre atualizações do sistema</v-list-item-subtitle>
              
              <template v-slot:append>
                <v-switch
                  v-model="settings.notifications.system"
                  color="primary"
                  hide-details
                ></v-switch>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
      
      <!-- Aparência -->
      <v-card class="mb-6" elevation="4">
        <v-card-title class="d-flex align-center bg-grey-lighten-5">
          <v-icon class="me-2" color="primary">mdi-palette</v-icon>
          Aparência
        </v-card-title>
        
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-select
                v-model="settings.appearance.theme"
                :items="[
                  { title: 'Claro', value: 'light' },
                  { title: 'Escuro', value: 'dark' },
                  { title: 'Sistema', value: 'system' }
                ]"
                label="Tema"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-theme-light-dark"
              ></v-select>
            </v-col>
            
            <v-col cols="12" md="4">
              <v-select
                v-model="settings.appearance.density"
                :items="[
                  { title: 'Confortável', value: 'comfortable' },
                  { title: 'Compacto', value: 'compact' }
                ]"
                label="Densidade"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-view-compact"
              ></v-select>
            </v-col>
            
            <v-col cols="12" md="4">
              <v-select
                v-model="settings.appearance.fontSize"
                :items="[
                  { title: 'Pequeno', value: 'small' },
                  { title: 'Médio', value: 'medium' },
                  { title: 'Grande', value: 'large' }
                ]"
                label="Tamanho da Fonte"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-format-size"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
      
      <!-- Privacidade -->
      <v-card class="mb-6" elevation="4">
        <v-card-title class="d-flex align-center bg-grey-lighten-5">
          <v-icon class="me-2" color="primary">mdi-shield-account</v-icon>
          Privacidade
        </v-card-title>
        
        <v-card-text>
          <v-list>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-share-variant</v-icon>
              </template>
              
              <v-list-item-title>Compartilhar Dados de Uso</v-list-item-title>
              <v-list-item-subtitle>Ajude-nos a melhorar o sistema compartilhando dados anônimos de uso</v-list-item-subtitle>
              
              <template v-slot:append>
                <v-switch
                  v-model="settings.privacy.shareData"
                  color="primary"
                  hide-details
                ></v-switch>
              </template>
            </v-list-item>
            
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-chart-line</v-icon>
              </template>
              
              <v-list-item-title>Analytics</v-list-item-title>
              <v-list-item-subtitle>Permitir coleta de dados para análise de desempenho</v-list-item-subtitle>
              
              <template v-slot:append>
                <v-switch
                  v-model="settings.privacy.analytics"
                  color="primary"
                  hide-details
                ></v-switch>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
      
      <!-- Botões -->
      <v-card-actions class="pa-6">
        <v-spacer></v-spacer>
        <v-btn
          @click="restoreDefaults"
          variant="outlined"
          class="me-3"
        >
          Restaurar Padrões
        </v-btn>
        
        <v-btn
          @click="saveSettings"
          :loading="isLoading"
          color="primary"
        >
          Salvar Configurações
        </v-btn>
      </v-card-actions>
    </div>
  </v-container>
</template>