import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import './assets/custom.css'

// Cria a instância do app Vue
const app = createApp(App)

// Configura Pinia para gerenciamento de estado
const pinia = createPinia()
app.use(pinia)

// Configura Vue Router
app.use(router)

// Monta o app no elemento #app
app.mount('#app')

console.log('🚀 ERP inicializado com sucesso!');