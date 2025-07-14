const { execSync } = require('child_process');

// Desabilita o uso de módulos nativos do Rollup
process.env.ROLLUP_NATIVE = 'false';

try {
  // Executa o build do Vite
  execSync('npx vite build', { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}