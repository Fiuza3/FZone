<script setup>
import { ref, computed } from 'vue';

// Estado
const searchQuery = ref('');
const activeCategory = ref('getting-started');

// Categorias de ajuda
const categories = [
  { id: 'getting-started', name: 'Primeiros Passos', icon: 'rocket_launch' },
  { id: 'tasks', name: 'Tarefas', icon: 'task' },
  { id: 'stock', name: 'Estoque', icon: 'inventory' },
  { id: 'finance', name: 'Financeiro', icon: 'payments' },
  { id: 'hr', name: 'RH', icon: 'people' },
  { id: 'account', name: 'Conta e Perfil', icon: 'person' },
  { id: 'faq', name: 'Perguntas Frequentes', icon: 'help' }
];

// Perguntas frequentes
const faqs = [
  {
    question: 'Como criar uma nova tarefa?',
    answer: 'Para criar uma nova tarefa, acesse o módulo de Tarefas no menu lateral e clique no botão "Nova Tarefa". Preencha os campos necessários e clique em "Criar Tarefa".',
    category: 'tasks'
  },
  {
    question: 'Como adicionar um novo produto ao estoque?',
    answer: 'Para adicionar um novo produto, acesse o módulo de Estoque no menu lateral e clique no botão "Novo Produto". Preencha os campos necessários e clique em "Cadastrar Produto".',
    category: 'stock'
  },
  {
    question: 'Como registrar uma nova transação financeira?',
    answer: 'Para registrar uma nova transação, acesse o módulo Financeiro no menu lateral e clique no botão "Nova Transação". Selecione o tipo (receita ou despesa), preencha os campos necessários e clique em "Registrar Transação".',
    category: 'finance'
  },
  {
    question: 'Como cadastrar um novo funcionário?',
    answer: 'Para cadastrar um novo funcionário, acesse o módulo de RH no menu lateral e clique no botão "Novo Funcionário". Preencha os campos necessários e clique em "Cadastrar Funcionário".',
    category: 'hr'
  },
  {
    question: 'Como alterar minha senha?',
    answer: 'Para alterar sua senha, clique no seu perfil no canto superior direito, selecione "Meu Perfil", clique em "Editar" e preencha os campos de senha na seção "Alterar Senha".',
    category: 'account'
  },
  {
    question: 'Como gerar relatórios?',
    answer: 'Cada módulo possui seu próprio relatório. Acesse o módulo desejado e procure pelo botão "Relatório" ou "Gerar Relatório".',
    category: 'getting-started'
  },
  {
    question: 'O sistema funciona em dispositivos móveis?',
    answer: 'Sim, o sistema é responsivo e funciona em dispositivos móveis, mas algumas funcionalidades podem ter uma experiência melhor em telas maiores.',
    category: 'faq'
  },
  {
    question: 'Como exportar dados do sistema?',
    answer: 'Atualmente, a exportação de dados está disponível apenas nos relatórios. Acesse o relatório desejado e procure pelo botão "Exportar" ou "Baixar".',
    category: 'faq'
  }
];

// Filtra FAQs por categoria e pesquisa
const filteredFaqs = computed(() => {
  let result = faqs;
  
  // Filtra por categoria
  if (activeCategory !== 'all') {
    result = result.filter(faq => faq.category === activeCategory);
  }
  
  // Filtra por pesquisa
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(faq => 
      faq.question.toLowerCase().includes(query) || 
      faq.answer.toLowerCase().includes(query)
    );
  }
  
  return result;
});

// Altera categoria ativa
const setActiveCategory = (categoryId) => {
  activeCategory.value = categoryId;
};
</script>

<template>
  <div>
    <h1 class="page-title">Central de Ajuda</h1>
    
    <!-- Pesquisa -->
    <div class="card mb-6">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span class="material-icons text-gray-400">search</span>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          class="form-input pl-10"
          placeholder="Pesquisar na ajuda..."
        />
      </div>
    </div>
    
    <!-- Conteúdo principal -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <!-- Categorias -->
      <div class="md:col-span-1">
        <div class="card">
          <h2 class="text-lg font-semibold mb-4">Categorias</h2>
          
          <nav class="space-y-1">
            <button
              v-for="category in categories"
              :key="category.id"
              @click="setActiveCategory(category.id)"
              :class="[
                'w-full flex items-center px-3 py-2 text-sm rounded-md',
                activeCategory === category.id
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
            >
              <span class="material-icons mr-3 text-lg">{{ category.icon }}</span>
              <span>{{ category.name }}</span>
            </button>
          </nav>
        </div>
      </div>
      
      <!-- Conteúdo da ajuda -->
      <div class="md:col-span-3">
        <div class="card">
          <h2 class="section-title">
            {{ categories.find(c => c.id === activeCategory)?.name || 'Ajuda' }}
          </h2>
          
          <!-- Conteúdo específico da categoria -->
          <div v-if="activeCategory === 'getting-started'" class="mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Bem-vindo ao ERP System</h3>
            <p class="text-gray-600 mb-4">
              Este guia irá ajudá-lo a começar a usar nosso sistema ERP. Siga os passos abaixo para configurar sua conta e começar a usar o sistema.
            </p>
            
            <div class="space-y-4 mt-6">
              <div class="flex">
                <div class="flex-shrink-0">
                  <div class="flex items-center justify-center h-8 w-8 rounded-full bg-primary-100 text-primary-600">
                    1
                  </div>
                </div>
                <div class="ml-4">
                  <h4 class="text-base font-medium text-gray-900">Faça login no sistema</h4>
                  <p class="text-sm text-gray-500">
                    Use suas credenciais para acessar o sistema. Se você não tem uma conta, entre em contato com o administrador.
                  </p>
                </div>
              </div>
              
              <div class="flex">
                <div class="flex-shrink-0">
                  <div class="flex items-center justify-center h-8 w-8 rounded-full bg-primary-100 text-primary-600">
                    2
                  </div>
                </div>
                <div class="ml-4">
                  <h4 class="text-base font-medium text-gray-900">Explore o Dashboard</h4>
                  <p class="text-sm text-gray-500">
                    O Dashboard fornece uma visão geral do sistema com informações importantes e acesso rápido aos módulos.
                  </p>
                </div>
              </div>
              
              <div class="flex">
                <div class="flex-shrink-0">
                  <div class="flex items-center justify-center h-8 w-8 rounded-full bg-primary-100 text-primary-600">
                    3
                  </div>
                </div>
                <div class="ml-4">
                  <h4 class="text-base font-medium text-gray-900">Acesse os módulos</h4>
                  <p class="text-sm text-gray-500">
                    Use o menu lateral para acessar os diferentes módulos do sistema: Tarefas, Estoque, Financeiro e RH.
                  </p>
                </div>
              </div>
              
              <div class="flex">
                <div class="flex-shrink-0">
                  <div class="flex items-center justify-center h-8 w-8 rounded-full bg-primary-100 text-primary-600">
                    4
                  </div>
                </div>
                <div class="ml-4">
                  <h4 class="text-base font-medium text-gray-900">Personalize seu perfil</h4>
                  <p class="text-sm text-gray-500">
                    Acesse seu perfil para atualizar suas informações pessoais e preferências.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- FAQs -->
          <div class="space-y-6">
            <div v-if="filteredFaqs.length === 0" class="text-center py-8">
              <span class="material-icons text-4xl text-gray-400">search_off</span>
              <p class="text-gray-500 mt-2">Nenhum resultado encontrado</p>
            </div>
            
            <div v-for="(faq, index) in filteredFaqs" :key="index" class="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
              <h3 class="text-lg font-medium text-gray-900 mb-2">{{ faq.question }}</h3>
              <p class="text-gray-600">{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>