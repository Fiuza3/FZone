# Guia de Deploy do FZone

Este guia explica como fazer o deploy do sistema FZone, tanto do frontend quanto do backend.

## 🚀 Deploy do Frontend (Vercel)

1. **Preparação**:
   - Certifique-se de que o código está funcionando localmente
   - Verifique se o arquivo `vercel.json` está configurado corretamente

2. **Deploy no Vercel**:
   - Acesse [vercel.com](https://vercel.com) e faça login
   - Clique em "Add New" > "Project"
   - Importe o repositório do GitHub
   - Configure:
     - Root Directory: `frontend`
     - Build Command: `npm install && npm run build`
     - Output Directory: `dist`
   - Em "Environment Variables", adicione:
     - `VITE_API_URL`: URL da sua API (ex: `https://fzone-api.onrender.com/api`)
   - Clique em "Deploy"

3. **Verificação**:
   - Após o deploy, teste o login com:
     - Email: `admin@example.com`
     - Senha: `admin123`

## 🌐 Deploy do Backend (Render)

1. **Preparação**:
   - Certifique-se de que o código está funcionando localmente
   - Verifique se as variáveis de ambiente estão configuradas no `.env`

2. **Deploy no Render**:
   - Acesse [render.com](https://render.com) e faça login
   - Clique em "New" > "Web Service"
   - Conecte seu repositório GitHub
   - Configure:
     - Name: `fzone-api`
     - Root Directory: `backend`
     - Runtime: `Node`
     - Build Command: `npm install`
     - Start Command: `node index.js`
   - Em "Environment Variables", adicione:
     - `MONGODB_URI`: URL do seu banco MongoDB
     - `JWT_SECRET`: Chave secreta para JWT
     - `NODE_ENV`: `production`
     - `FRONTEND_URL`: URL do seu frontend no Vercel

3. **Configuração do CORS**:
   - Após o deploy, adicione o domínio do frontend às origens permitidas no CORS
   - Edite o arquivo `backend/index.js` e atualize a configuração do CORS

## 📊 Populando o Banco de Dados

Para popular o banco de dados com dados iniciais:

1. **Usando o script de seed**:
   ```bash
   # Na raiz do projeto
   node db-seed.js
   ```

2. **Manualmente via MongoDB Shell**:
   - Conecte-se ao seu banco MongoDB
   - Execute o script em `frontend/src/services/mockData.js` > `mongoDbScript`

## 🔄 Modo de Desenvolvimento

Para desenvolvimento local sem backend:

1. O frontend está configurado para usar dados mockados
2. Login com:
   - Email: `admin@example.com`
   - Senha: `admin123`
3. Todas as operações CRUD funcionam localmente com o banco de dados em memória

## 📝 Notas Importantes

- O sistema está configurado para funcionar mesmo sem backend em produção
- Os dados mockados permitem testar todas as funcionalidades
- Para usar o backend real, atualize a variável `VITE_API_URL` no frontend