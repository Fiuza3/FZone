<script setup>
import { ref, computed } from 'vue';

// Estado
const searchQuery = ref('');
const activeCategory = ref('getting-started');

// Categorias de ajuda
const categories = [
  { id: 'getting-started', name: 'Primeiros Passos', icon: 'rocket-launch' },
  { id: 'tasks', name: 'Tarefas', icon: 'clipboard-check' },
  { id: 'stock', name: 'Estoque', icon: 'package-variant' },
  { id: 'finance', name: 'Financeiro', icon: 'currency-usd' },
  { id: 'hr', name: 'RH', icon: 'account-group' },
  { id: 'account', name: 'Conta e Perfil', icon: 'account' },
  { id: 'faq', name: 'Perguntas Frequentes', icon: 'help-circle' }
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
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col>
        <h1 class="text-h4 font-weight-bold mb-2">Central de Ajuda</h1>
      </v-col>
    </v-row>
    
    <!-- Pesquisa -->
    <v-card class="mb-6" elevation="4">
      <v-card-text>
        <v-text-field
          v-model="searchQuery"
          label="Pesquisar na ajuda"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-magnify"
          placeholder="Pesquisar na ajuda..."
          clearable
        ></v-text-field>
      </v-card-text>
    </v-card>
    
    <!-- Conteúdo principal -->
    <v-row>
      <!-- Categorias -->
      <v-col cols="12" md="3">
        <v-card elevation="4">
          <v-card-title class="d-flex align-center bg-grey-lighten-5">
            <v-icon class="me-2" color="primary">mdi-format-list-bulleted</v-icon>
            Categorias
          </v-card-title>
          
          <v-list density="compact">
            <v-list-item
              v-for="category in categories"
              :key="category.id"
              @click="setActiveCategory(category.id)"
              :active="activeCategory === category.id"
              :prepend-icon="`mdi-${category.icon.replace('_', '-')}`"
              :title="category.name"
              class="cursor-pointer"
            ></v-list-item>
          </v-list>
        </v-card>
      </v-col>
      
      <!-- Conteúdo da ajuda -->
      <v-col cols="12" md="9">
        <v-card elevation="4">
          <v-card-title class="d-flex align-center bg-grey-lighten-5">
            <v-icon class="me-2" color="primary">mdi-help-circle</v-icon>
            {{ categories.find(c => c.id === activeCategory)?.name || 'Ajuda' }}
          </v-card-title>
          
          <v-card-text>
            <!-- Conteúdo específico da categoria -->
            <div v-if="activeCategory === 'getting-started'" class="mb-6">
              <h3 class="text-h6 font-weight-medium mb-4">Bem-vindo ao ERP System</h3>
              <p class="text-body-1 mb-6">
                Este guia irá ajudá-lo a começar a usar nosso sistema ERP. Siga os passos abaixo para configurar sua conta e começar a usar o sistema.
              </p>
              
              <v-timeline density="compact" side="end">
                <v-timeline-item
                  dot-color="primary"
                  size="small"
                >
                  <template v-slot:opposite>
                    <div class="text-caption">Passo 1</div>
                  </template>
                  
                  <v-card variant="tonal" color="primary">
                    <v-card-text class="py-2">
                      <h4 class="text-body-1 font-weight-medium mb-1">Faça login no sistema</h4>
                      <p class="text-body-2">
                        Use suas credenciais para acessar o sistema. Se você não tem uma conta, entre em contato com o administrador.
                      </p>
                    </v-card-text>
                  </v-card>
                </v-timeline-item>
                
                <v-timeline-item
                  dot-color="primary"
                  size="small"
                >
                  <template v-slot:opposite>
                    <div class="text-caption">Passo 2</div>
                  </template>
                  
                  <v-card variant="tonal" color="primary">
                    <v-card-text class="py-2">
                      <h4 class="text-body-1 font-weight-medium mb-1">Explore o Dashboard</h4>
                      <p class="text-body-2">
                        O Dashboard fornece uma visão geral do sistema com informações importantes e acesso rápido aos módulos.
                      </p>
                    </v-card-text>
                  </v-card>
                </v-timeline-item>
                
                <v-timeline-item
                  dot-color="primary"
                  size="small"
                >
                  <template v-slot:opposite>
                    <div class="text-caption">Passo 3</div>
                  </template>
                  
                  <v-card variant="tonal" color="primary">
                    <v-card-text class="py-2">
                      <h4 class="text-body-1 font-weight-medium mb-1">Acesse os módulos</h4>
                      <p class="text-body-2">
                        Use o menu lateral para acessar os diferentes módulos do sistema: Tarefas, Estoque, Financeiro e RH.
                      </p>
                    </v-card-text>
                  </v-card>
                </v-timeline-item>
                
                <v-timeline-item
                  dot-color="primary"
                  size="small"
                >
                  <template v-slot:opposite>
                    <div class="text-caption">Passo 4</div>
                  </template>
                  
                  <v-card variant="tonal" color="primary">
                    <v-card-text class="py-2">
                      <h4 class="text-body-1 font-weight-medium mb-1">Personalize seu perfil</h4>
                      <p class="text-body-2">
                        Acesse seu perfil para atualizar suas informações pessoais e preferências.
                      </p>
                    </v-card-text>
                  </v-card>
                </v-timeline-item>
              </v-timeline>
            </div>
            
            <!-- FAQs -->
            <div>
              <v-empty-state
                v-if="filteredFaqs.length === 0"
                icon="mdi-magnify-close"
                title="Nenhum resultado encontrado"
                text="Tente usar termos diferentes na pesquisa"
              ></v-empty-state>
              
              <v-expansion-panels v-else variant="accordion">
                <v-expansion-panel
                  v-for="(faq, index) in filteredFaqs"
                  :key="index"
                  :title="faq.question"
                  :text="faq.answer"
                ></v-expansion-panel>
              </v-expansion-panels>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>