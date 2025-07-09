<script setup>
// Obtém o ano atual para o copyright
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="bg-white border-t border-gray-200 py-4 px-6 mt-auto">
    <div class="container mx-auto flex flex-col md:flex-row justify-between items-center">
      <div class="text-sm text-gray-600 mb-2 md:mb-0">
        &copy; {{ currentYear }} ERP System. Todos os direitos reservados.
      </div>
      
      <div class="flex space-x-4">
        <a href="#" class="text-sm text-gray-600 hover:text-primary-600">Termos de Uso</a>
        <a href="#" class="text-sm text-gray-600 hover:text-primary-600">Privacidade</a>
        <router-link to="/help" class="text-sm text-gray-600 hover:text-primary-600">Ajuda</router-link>
      </div>
    </div>
  </footer>
</template>