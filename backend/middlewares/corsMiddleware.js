/**
 * Middleware para lidar com requisições preflight OPTIONS e configurar cabeçalhos CORS
 */
const corsMiddleware = (req, res, next) => {
  // Origens permitidas
  const allowedOrigins = [
    'https://f-zone-frontend-5fhm0l4jw-marcus-fiuzas-projects.vercel.app',
    'https://f-zone.vercel.app',
    'http://localhost:5173'
  ];
  
  // Verifica se a origem da requisição está na lista de origens permitidas
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  // Configura outros cabeçalhos CORS
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Responde imediatamente para requisições OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Passa para o próximo middleware
  next();
};

module.exports = corsMiddleware;