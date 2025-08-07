# DOCUMENTAÇÃO COMPLETA - FZone ERP

## VISÃO GERAL DO SISTEMA

O FZone é um sistema ERP (Enterprise Resource Planning) desenvolvido especificamente para buffets e empresas de eventos. O sistema é dividido em duas partes principais:

- **Backend**: API REST em Node.js com Express e MongoDB
- **Frontend**: Aplicação Vue.js 3 com Pinia, Vue Router e Vuetify

---

## ARQUITETURA DO BACKEND

### 1. ESTRUTURA DE ARQUIVOS

```
backend/
├── controllers/     # Lógica de negócio
├── middlewares/     # Autenticação e validações
├── models/         # Schemas do MongoDB
├── routes/         # Definição das rotas da API
├── db.js          # Conexão com MongoDB
└── index.js       # Servidor principal
```

### 2. FLUXO DE FUNCIONAMENTO

**index.js** → Servidor principal que:

- Configura Express e middlewares
- Conecta ao MongoDB via `db.js`
- Registra todas as rotas (`/api/auth`, `/api/tasks`, etc.)
- Aplica middleware de tratamento de erros

**Rotas** → Direcionam requisições para controllers:

- `authRoutes.js` → `/api/auth/*` → `authController.js`
- `taskRoutes.js` → `/api/tasks/*` → `taskController.js`
- `eventRoutes.js` → `/api/events/*` → `eventController.js`

**Controllers** → Executam lógica de negócio:

- Validam dados recebidos
- Interagem com Models (MongoDB)
- Retornam respostas JSON

**Models** → Definem estrutura dos dados:

- `User.js` - Usuários do sistema
- `Company.js` - Empresas/buffets
- `Event.js` - Eventos/festas
- `Task.js` - Tarefas
- `Product.js` - Produtos do estoque
- `Transaction.js` - Transações financeiras

### 3. SISTEMA DE AUTENTICAÇÃO

**Middleware `auth.js`**:

- Verifica token JWT em todas as rotas protegidas
- Adiciona dados do usuário em `req.user`
- Bloqueia acesso não autorizado

**Middleware `permissions.js`**:

- Verifica permissões específicas por módulo
- Baseado em roles (owner, admin, manager, employee)
- Controla acesso a funcionalidades

---

## ARQUITETURA DO FRONTEND

### 1. ESTRUTURA DE ARQUIVOS

```
frontend/src/
├── components/     # Componentes reutilizáveis
│   └── layout/    # Header, Sidebar, Footer
├── views/         # Páginas/telas do sistema
├── stores/        # Gerenciamento de estado (Pinia)
├── services/      # Comunicação com API
├── router/        # Configuração de rotas
├── plugins/       # Configuração do Vuetify
├── App.vue        # Componente raiz
└── main.js        # Ponto de entrada
```

### 2. FLUXO DE FUNCIONAMENTO

**main.js** → Ponto de entrada que:

- Cria instância Vue
- Configura Pinia (gerenciamento de estado)
- Configura Vue Router (navegação)
- Configura Vuetify (UI framework)
- Monta aplicação em `#app`

**App.vue** → Componente raiz que:

- Verifica autenticação do usuário
- Controla tema claro/escuro
- Renderiza layout baseado no status de login
- Gerencia tela de carregamento

### 3. SISTEMA DE LAYOUT

**Para usuários autenticados**:

```
App.vue
├── AppSidebar.vue    # Menu lateral com navegação
├── AppHeader.vue     # Cabeçalho com perfil e notificações
├── <router-view>     # Conteúdo da página atual
└── AppFooter.vue     # Rodapé
```

**Para usuários não autenticados**:

```
App.vue
└── <router-view>     # Login.vue ou Register.vue
```

### 4. GERENCIAMENTO DE ESTADO (PINIA)

**stores/auth.js** - Estado de autenticação:

- `user`: Dados do usuário logado
- `token`: Token JWT
- `isAuthenticated`: Status de login
- Actions: `login()`, `logout()`, `getProfile()`

**stores/task.js** - Estado das tarefas:

- `tasks`: Lista de tarefas
- `pendingTasks`: Tarefas pendentes
- Actions: `fetchTasks()`, `createTask()`, `updateTask()`

**Outros stores**: `dashboard.js`, `event.js`, `finance.js`, `stock.js`, `hr.js`

### 5. COMUNICAÇÃO COM API

**services/api.js** - Cliente HTTP configurado:

- Interceptor de request: Adiciona token JWT automaticamente
- Interceptor de response: Trata erros 401 (não autorizado)
- Base URL configurável via variável de ambiente

**services/auth.js** - Serviços de autenticação:

- `login(email, password)`: Autentica usuário
- `register(userData)`: Registra novo usuário
- Tratamento de erros CORS

### 6. SISTEMA DE ROTAS

**router/index.js** - Configuração de navegação:

**Rotas públicas** (sem autenticação):

- `/login` → `Login.vue`
- `/register` → `Register.vue`

**Rotas protegidas** (requer autenticação):

- `/` → `Dashboard.vue`
- `/tasks` → `TaskList.vue`
- `/events` → `EventList.vue`
- `/finance` → `FinanceList.vue`

**Guards de rota**:

- `requireAuth`: Verifica se usuário está logado
- `requirePermission`: Verifica permissões específicas
- `requireAdmin`: Verifica se é administrador

---

## FLUXO COMPLETO DE UMA REQUISIÇÃO

### EXEMPLO: Listar Tarefas

1. **Frontend**: Usuário clica em "Tarefas" no menu
2. **Router**: Navega para `/tasks` → carrega `TaskList.vue`
3. **Vue Component**: `TaskList.vue` é montado
4. **Store**: Componente chama `taskStore.fetchTasks()`
5. **Service**: Store usa `api.get('/tasks')`
6. **HTTP**: Requisição GET para `http://localhost:3000/api/tasks`
7. **Backend**: Express recebe requisição
8. **Middleware**: `auth.js` verifica token JWT
9. **Route**: `/api/tasks` direciona para `taskController.js`
10. **Controller**: `getTasks()` busca dados no MongoDB
11. **Model**: `Task.find()` retorna tarefas do banco
12. **Response**: Controller retorna JSON com tarefas
13. **Frontend**: Store atualiza estado com dados recebidos
14. **Vue**: Componente re-renderiza com novas tarefas

---

## SISTEMA DE PERMISSÕES

### ROLES (Funções)

- **owner**: Dono da empresa (acesso total)
- **admin**: Administrador (acesso quase total)
- **manager**: Gerente (acesso limitado)
- **employee**: Funcionário (acesso básico)

### MÓDULOS

- **tasks**: Tarefas (todos têm acesso)
- **stock**: Estoque (admin + departamento estoque)
- **finance**: Financeiro (admin + departamento financeiro)
- **hr**: Recursos Humanos (admin + departamento RH)

### VERIFICAÇÃO

**Backend**: Middleware `permissions.js` verifica antes de executar ação
**Frontend**: Store `auth.js` tem getter `hasPermission(module)`

---

## COMPONENTES PRINCIPAIS

### 1. Dashboard.vue

- Tela inicial após login
- Carrega dados de múltiplos stores
- Exibe métricas e resumos
- Adapta conteúdo baseado em permissões

### 2. AppSidebar.vue

- Menu de navegação lateral
- Filtra opções por permissões
- Versão desktop e mobile
- Indica rota ativa

### 3. AppHeader.vue

- Cabeçalho com informações do usuário
- Menu de notificações
- Alternador de tema
- Menu de perfil com logout

### 4. Login.vue

- Formulário de autenticação
- Validação de campos
- Redirecionamento após login
- Tratamento de erros

---

## TECNOLOGIAS E DEPENDÊNCIAS

### Backend

- **Express.js**: Framework web
- **MongoDB + Mongoose**: Banco de dados
- **JWT**: Autenticação
- **bcryptjs**: Hash de senhas
- **CORS**: Comunicação cross-origin
- **PDFKit**: Geração de relatórios PDF

### Frontend

- **Vue 3**: Framework JavaScript
- **Pinia**: Gerenciamento de estado
- **Vue Router**: Navegação SPA
- **Vuetify**: Framework de UI
- **Axios**: Cliente HTTP
- **Tailwind CSS**: Estilização
- **Chart.js**: Gráficos

---

## CONFIGURAÇÃO E EXECUÇÃO

### Backend

1. Instalar dependências: `npm install`
2. Configurar `.env` com MongoDB URI
3. Executar: `npm run dev`
4. API disponível em `http://localhost:3000`

### Frontend

1. Instalar dependências: `npm install`
2. Executar: `npm run dev`
3. App disponível em `http://localhost:5173`

### Banco de Dados

- Popular dados iniciais: `node db-seed.js`
- Usuário padrão: admin@example.com / admin123

---

## RESUMO DO FUNCIONAMENTO

O FZone ERP funciona como uma aplicação web moderna onde:

1. **App.vue** controla o layout geral e autenticação
2. **Router** gerencia navegação entre páginas
3. **Stores (Pinia)** mantêm estado da aplicação
4. **Services** fazem comunicação HTTP com backend
5. **Components/Views** renderizam interface do usuário
6. **Backend API** processa requisições e gerencia dados
7. **MongoDB** armazena todos os dados persistentes

O sistema é modular, escalável e segue padrões modernos de desenvolvimento web, com separação clara entre frontend e backend, autenticação robusta e controle granular de permissões.

Como SKU FUNCIONA :
Exemplo 1: Nome "Açúcar Cristal" + Categoria "alimentos" → ALI-ACU-1234

Exemplo 2: Nome "123 Produto" + Categoria "outros" → OUT-PRD-5678

Exemplo 3: Nome vazio → Mostra alerta pedindo preenchimento
