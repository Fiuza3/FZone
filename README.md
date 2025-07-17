# FZone - Sistema de Gestão para Buffets

Sistema completo de gestão desenvolvido para buffets e empresas de eventos.

## Funcionalidades

- Gestão de Eventos
- Gerenciamento de Tarefas
- Controle de Estoque
- Gestão Financeira
- Recursos Humanos
- Multi-empresa

## Tecnologias

### Frontend
- Vue 3
- Pinia
- Vue Router
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT

## Instalação

### Pré-requisitos
- Node.js (versão 16 ou superior)
- MongoDB (local ou MongoDB Atlas)
- Git

### Backend

```bash
# Entre na pasta do backend
cd backend

# Instale as dependências
npm install

# Configure o arquivo .env
# Já existe um arquivo .env com configurações para MongoDB local

# Inicie o servidor
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

### Frontend

```bash
# Entre na pasta do frontend
cd frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

## Populando o Banco de Dados

```bash
# Na raiz do projeto
node db-seed.js
```

## Primeiro Acesso

### Usuário Padrão
- Email: admin@example.com
- Senha: admin123
- Empresa: Buffet Chocolate com Menta