<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

// Função para voltar à página inicial
const goHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full text-center">
      <div class="text-6xl font-bold text-gray-300 mb-4">404</div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Página não encontrada</h1>
      <p class="text-gray-600 mb-8">
        Ops! Parece que você se perdeu no nosso ERP.
        A página que você está procurando não existe ou foi movida.
      </p>
      <button 
        @click="goHome" 
        class="btn btn-primary inline-flex items-center"
      >
        <span class="material-icons mr-2">home</span>
        Voltar para o Dashboard
      </button>
    </div>
  </div>
</template>