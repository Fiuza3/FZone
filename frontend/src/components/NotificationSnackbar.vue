<script setup>
import { useNotifications } from '../composables/useNotifications'

const { snackbar, closeSnackbar } = useNotifications()
</script>

<template>
  <v-snackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    :timeout="snackbar.timeout"
    location="top right"
    variant="elevated"
  >
    {{ snackbar.message }}
    
    <template v-slot:actions>
      <v-btn
        color="white"
        variant="text"
        @click="closeSnackbar"
        icon="mdi-close"
        size="small"
      ></v-btn>
    </template>
  </v-snackbar>
</template>