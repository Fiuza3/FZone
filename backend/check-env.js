// Script para verificar variáveis de ambiente
console.log('🔍 Verificando variáveis de ambiente:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI existe:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET existe:', !!process.env.JWT_SECRET);

if (process.env.MONGODB_URI) {
  console.log('MONGODB_URI começa com mongodb:', process.env.MONGODB_URI.startsWith('mongodb'));
} else {
  console.log('❌ MONGODB_URI não encontrada!');
}