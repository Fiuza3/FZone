// Script para construir o projeto sem usar o Rollup nativo
const { execSync } = require('child_process');

// Desabilita o uso de módulos nativos do Rollup
process.env.ROLLUP_NATIVE = 'false';

try {
  console.log('🔧 Iniciando build sem Rollup nativo...');
  
  // Executa o build do Vite com variáveis de ambiente específicas
  execSync('npx vite build --emptyOutDir', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      ROLLUP_NATIVE: 'false'
    }
  });
  
  console.log('✅ Build concluído com sucesso!');
} catch (error) {
  console.error('❌ Erro durante o build:', error);
  process.exit(1);
}