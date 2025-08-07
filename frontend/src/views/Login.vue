<template>
  <v-container fluid fill-height>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card elevation="8" class="pa-8">
          <v-card-title class="text-center">
            <h2 class="text-h4 font-weight-bold">FZone ERP</h2>
          </v-card-title>
          <v-card-subtitle class="text-center mb-6">
            Sistema de Gestão para Buffets
          </v-card-subtitle>
          
          <v-form @submit.prevent="handleLogin">
            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              prepend-inner-icon="mdi-email"
              variant="outlined"
              required
              class="mb-4"
            ></v-text-field>
            
            <v-text-field
              v-model="password"
              label="Senha"
              type="password"
              prepend-inner-icon="mdi-lock"
              variant="outlined"
              required
              class="mb-4"
            ></v-text-field>

            <v-row class="mb-4">
              <v-col>
                <v-checkbox
                  v-model="rememberMe"
                  label="Lembrar-me"
                  density="compact"
                ></v-checkbox>
              </v-col>
              <v-col class="text-right">
                <v-btn variant="text" color="primary" size="small">
                  Esqueceu a senha?
                </v-btn>
              </v-col>
            </v-row>

            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              :loading="loading"
              prepend-icon="mdi-login"
            >
              {{ loading ? 'Entrando...' : 'Entrar' }}
            </v-btn>
          </v-form>
          
          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            class="mt-4"
          >
            {{ error }}
          </v-alert>
          
          <v-card-actions class="justify-center mt-6">
            <span>Não tem uma conta?</span>
            <v-btn
              to="/register"
              variant="text"
              color="primary"
            >
              Registre-se
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

export default {
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    
    const email = ref('admin@example.com');
    const password = ref('admin123');
    const rememberMe = ref(false);
    const loading = ref(false);
    const error = ref('');
    
    const handleLogin = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        const success = await authStore.login(email.value, password.value);
        
        if (success) {
          router.push('/');
        } else {
          error.value = authStore.error || 'Credenciais inválidas';
        }
      } catch (err) {
        error.value = 'Erro ao fazer login. Tente novamente.';
      } finally {
        loading.value = false;
      }
    };
    
    return {
      email,
      password,
      rememberMe,
      loading,
      error,
      handleLogin
    };
  }
};
</script>