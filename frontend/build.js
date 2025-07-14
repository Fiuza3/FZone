const { execSync } = require('child_process');

try {
  // Remover dependências problemáticas
  execSync('npm uninstall rollup', { stdio: 'inherit' });
  
  // Instalar versão específica do Rollup
  execSync('npm install rollup@3.29.4 --no-save', { stdio: 'inherit' });
  
  // Executar build
  execSync('npx vite build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      ROLLUP_NATIVE: 'false'
    }
  });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}