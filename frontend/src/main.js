import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/custom.css'
import './style.css'

// Cria a instância do app Vue
const app = createApp(App)

// Adiciona o Pinia para gerenciamento de estado
app.use(createPinia())

// Adiciona o Vue Router
app.use(router)

// Monta o app no elemento #app
app.mount('#app')

// Mensagem de inicialização
console.log('🚀 ERP inicializado com sucesso!')

// Aviso de modo de desenvolvimento
console.log('⚠️ MODO DE DESENVOLVIMENTO: Usando dados mockados')
console.log('📝 Login: admin@example.com / Senha: admin123')