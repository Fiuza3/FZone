<script setup>
import { ref, onMounted } from 'vue';

const progress = ref(0);
const messages = [
  'Carregando módulos...',
  'Preparando interface...',
  'Conectando ao servidor...',
  'Quase lá...'
];
const currentMessage = ref(messages[0]);
const messageIndex = ref(0);

// Simula progresso de carregamento
onMounted(() => {
  const interval = setInterval(() => {
    if (progress.value < 100) {
      progress.value += Math.floor(Math.random() * 10) + 1;
      
      if (progress.value > 25 && messageIndex.value === 0) {
        messageIndex.value = 1;
        currentMessage.value = messages[1];
      } else if (progress.value > 50 && messageIndex.value === 1) {
        messageIndex.value = 2;
        currentMessage.value = messages[2];
      } else if (progress.value > 75 && messageIndex.value === 2) {
        messageIndex.value = 3;
        currentMessage.value = messages[3];
      }
      
      if (progress.value > 100) {
        progress.value = 100;
      }
    } else {
      clearInterval(interval);
    }
  }, 200);
});
</script>

<template>
  <div class="fixed inset-0 bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center z-50">
    <div class="w-full max-w-md px-4">
      <!-- Logo -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-primary-600">ERP System</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">Sistema de Gestão Empresarial</p>
      </div>
      
      <!-- Barra de progresso -->
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
        <div 
          class="bg-primary-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
      
      <!-- Mensagem -->
      <div class="text-center">
        <p class="text-gray-600 dark:text-gray-400">{{ currentMessage }}</p>
        <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">{{ progress }}%</p>
      </div>
    </div>
  </div>
</template>