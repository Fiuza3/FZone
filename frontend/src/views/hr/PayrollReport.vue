<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useHRStore } from '../../stores/hr';

const router = useRouter();
const hrStore = useHRStore();

// Estado
const isLoading = ref(true);

// Carrega relatório
const loadReport = async () => {
  console.log('🔄 Gerando relatório de folha de pagamento');
  isLoading.value = true;
  
  try {
    await hrStore.getPayrollReport();
    console.log('✅ Relatório gerado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
  } finally {
    isLoading.value = false;
  }
};

// Volta para a lista de funcionários
const goToHR = () => {
  router.push('/hr');
};

// Formata moeda
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Carrega relatório ao montar o componente
onMounted(loadReport);
</script>

<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col>
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Relatório de Folha de Pagamento</h1>
          </div>
          <v-btn
            @click="goToHR"
            variant="outlined"
            prepend-icon="mdi-arrow-left"
            size="large"
          >
            Voltar para RH
          </v-btn>
        </div>
      </v-col>
    </v-row>
    
    <!-- Loading -->
    <v-row v-if="isLoading" justify="center">
      <v-col cols="auto" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <p class="mt-4 text-h6">Gerando relatório...</p>
      </v-col>
    </v-row>
    
    <!-- Relatório -->
    <div v-else-if="hrStore.payrollReport">
      <!-- Resumo geral -->
      <v-row class="mb-6">
        <v-col cols="12" sm="4">
          <v-card color="info" variant="tonal" elevation="4">
            <v-card-text>
              <div class="d-flex justify-space-between align-center">
                <div>
                  <v-card-subtitle class="text-info pa-0">Total de Funcionários</v-card-subtitle>
                  <div class="text-h3 font-weight-bold">{{ hrStore.payrollReport.totals.totalEmployees }}</div>
                </div>
                <v-icon size="48" class="text-info">mdi-account-group</v-icon>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="4">
          <v-card color="success" variant="tonal" elevation="4">
            <v-card-text>
              <div class="d-flex justify-space-between align-center">
                <div>
                  <v-card-subtitle class="text-success pa-0">Folha Total</v-card-subtitle>
                  <div class="text-h3 font-weight-bold">{{ formatCurrency(hrStore.payrollReport.totals.totalSalary) }}</div>
                </div>
                <v-icon size="48" class="text-success">mdi-currency-usd</v-icon>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="4">
          <v-card color="primary" variant="tonal" elevation="4">
            <v-card-text>
              <div class="d-flex justify-space-between align-center">
                <div>
                  <v-card-subtitle class="text-primary pa-0">Salário Médio</v-card-subtitle>
                  <div class="text-h3 font-weight-bold">{{ formatCurrency(hrStore.payrollReport.totals.avgSalaryCompany) }}</div>
                </div>
                <v-icon size="48" class="text-primary">mdi-calculator</v-icon>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- Breakdown por departamento -->
      <v-card class="mb-6" elevation="4">
        <v-card-title class="d-flex align-center bg-grey-lighten-5">
          <v-icon class="me-2" color="primary">mdi-chart-bar</v-icon>
          Folha por Departamento
        </v-card-title>
        
        <v-data-table
          :items="hrStore.payrollReport.departmentBreakdown"
          :headers="[
            { title: 'Departamento', key: '_id' },
            { title: 'Funcionários', key: 'totalEmployees' },
            { title: 'Folha Total', key: 'totalSalary' },
            { title: 'Salário Médio', key: 'avgSalary' },
            { title: '% da Folha', key: 'percentage' }
          ]"
          class="elevation-0"
          :items-per-page="10"
        >
          <template v-slot:item._id="{ item }">
            <v-chip
              :color="
                item._id === 'financeiro' ? 'success' :
                item._id === 'estoque' ? 'warning' :
                item._id === 'vendas' ? 'info' :
                item._id === 'marketing' ? 'purple' :
                item._id === 'rh' ? 'pink' :
                item._id === 'ti' ? 'primary' : 'grey'
              "
              size="small"
              variant="tonal"
            >
              {{ item._id === 'financeiro' ? 'Financeiro' :
                 item._id === 'estoque' ? 'Estoque' :
                 item._id === 'vendas' ? 'Vendas' :
                 item._id === 'marketing' ? 'Marketing' :
                 item._id === 'rh' ? 'RH' :
                 item._id === 'ti' ? 'TI' : item._id }}
            </v-chip>
          </template>

          <template v-slot:item.totalSalary="{ item }">
            <span class="font-weight-bold">{{ formatCurrency(item.totalSalary) }}</span>
          </template>

          <template v-slot:item.avgSalary="{ item }">
            {{ formatCurrency(item.avgSalary) }}
          </template>

          <template v-slot:item.percentage="{ item }">
            <div class="d-flex align-center">
              <v-progress-linear
                :model-value="(item.totalSalary / hrStore.payrollReport.totals.totalSalary * 100)"
                color="primary"
                height="8"
                rounded
                class="me-2"
                style="min-width: 100px;"
              ></v-progress-linear>
              <span class="text-caption">
                {{ (item.totalSalary / hrStore.payrollReport.totals.totalSalary * 100).toFixed(1) }}%
              </span>
            </div>
          </template>
        </v-data-table>
      </v-card>
      
      <!-- Gráfico (simulado) -->
      <v-card elevation="4">
        <v-card-title class="d-flex align-center bg-grey-lighten-5">
          <v-icon class="me-2" color="primary">mdi-chart-pie</v-icon>
          Distribuição da Folha de Pagamento
        </v-card-title>
        
        <v-card-text>
          <div class="d-flex justify-center align-center" style="height: 300px;">
            <div class="text-center">
              <v-icon size="64" color="grey-lighten-1">mdi-chart-bar</v-icon>
              <p class="mt-4 text-h6">Gráfico de distribuição da folha de pagamento</p>
              <p class="text-caption text-grey">(Implementação com Chart.js seria adicionada aqui)</p>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
    
    <!-- Sem dados -->
    <v-card v-else elevation="4">
      <v-card-text class="text-center pa-8">
        <v-empty-state
          icon="mdi-information-outline"
          title="Nenhum dado disponível"
          text="Não há dados suficientes para gerar o relatório de folha de pagamento"
        ></v-empty-state>
      </v-card-text>
    </v-card>
  </v-container>
</template>