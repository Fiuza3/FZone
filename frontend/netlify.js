const { execSync } = require('child_process');

// Desabilita o uso de módulos nativos do Rollup
process.env.ROLLUP_NATIVE = 'false';

try {
  // Executa o build do Vite
  execSync('npx vite build --emptyOutDir', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      ROLLUP_NATIVE: 'false',
      NODE_OPTIONS: '--no-node-snapshot'
    }
  });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}