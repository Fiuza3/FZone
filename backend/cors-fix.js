// Script para adicionar cabeçalhos CORS a todas as respostas
const express = require('express');
const app = express();

// Middleware para adicionar cabeçalhos CORS a todas as respostas
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Responder imediatamente às solicitações OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Exportar o middleware para uso em index.js
module.exports = app;