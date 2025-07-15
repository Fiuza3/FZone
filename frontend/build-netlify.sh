#!/bin/bash
echo "Iniciando build para Netlify..."
npm ci
echo "Instalação concluída, iniciando build..."
npm run build
echo "Build concluído!"