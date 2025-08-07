<script setup>
import { ref } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info'
  },
  title: String,
  message: String,
  closable: {
    type: Boolean,
    default: true
  },
  actions: Array
})

const show = ref(true)

const close = () => {
  show.value = false
}
</script>

<template>
  <v-alert
    v-model="show"
    :type="type"
    variant="tonal"
    :closable="closable"
    class="mb-4"
  >
    <template v-slot:title v-if="title">
      {{ title }}
    </template>
    
    {{ message }}
    
    <template v-slot:actions v-if="actions && actions.length">
      <v-btn
        v-for="action in actions"
        :key="action.text"
        :color="action.color || 'primary'"
        :variant="action.variant || 'text'"
        size="small"
        @click="action.handler"
      >
        {{ action.text }}
      </v-btn>
    </template>
  </v-alert>
</template>