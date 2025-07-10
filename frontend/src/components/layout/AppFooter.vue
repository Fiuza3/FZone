<script setup>
// Obtém o ano atual para o copyright
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="bg-white border-t border-gray-200 py-2 px-6 mt-auto">
    <div class="container mx-auto text-center">
      <div class="text-xs text-gray-500">
        FZone &copy; {{ currentYear }} - Buffet Chocolate com Menta
      </div>
    </div>
  </footer>
</template>