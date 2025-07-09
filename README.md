# 🍫 FZone - Sistema de Gestão para Buffets

> *"Transformando eventos em experiências inesquecíveis com gestão profissional"*

Bem-vindo ao **FZone**, o sistema completo de gestão desenvolvido especialmente para buffets e empresas de eventos. Gerencie seu negócio de forma profissional e eficiente!

## 🎯 O que é o FZone?

O FZone é um ERP completo e moderno que oferece:

- **📅 Gestão de Eventos** - Planeje, organize e controle todos os seus eventos
- **📋 Gerenciamento de Tarefas** - Mantenha sua equipe sempre organizada
- **📦 Controle de Estoque** - Gerencie ingredientes e produtos com precisão
- **💰 Gestão Financeira** - Controle receitas, despesas e margem de lucro
- **👥 Recursos Humanos** - Administre sua equipe e folha de pagamento
- **🏢 Multi-empresa** - Sistema isolado por empresa com controle de permissões

Tudo isso com uma interface moderna, intuitiva e responsiva!

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Vue 3** - Framework JavaScript reativo e moderno
- **Pinia** - Gerenciamento de estado
- **Vue Router** - Roteamento SPA
- **Tailwind CSS** - Framework CSS utilitário
- **Material Icons** - Ícones do Google

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web minimalista
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação e autorização
- **bcrypt** - Criptografia de senhas

## 🚀 Como Instalar e Executar

### Pré-requisitos

- **Node.js** (versão 16 ou superior)
- **MongoDB** (local ou MongoDB Atlas)
- **Git** para clonar o repositório

### Passo 1: Clone o Repositório

```bash
git clone https://github.com/seu-usuario/fzone-erp.git
cd fzone-erp
```

### Passo 2: Configure o Backend

```bash
# Entre na pasta do backend
cd backend

# Instale as dependências
npm install

# Crie o arquivo .env
cp .env.example .env

# Configure as variáveis de ambiente no .env:
PORT=3000
MONGODB_URI=mongodb://localhost:27017/fzone_database
JWT_SECRET=sua_chave_secreta_super_segura_aqui
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Inicie o servidor
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

### Passo 3: Configure o Frontend

```bash
# Volte para a pasta raiz e entre na pasta do frontend
cd ../frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

## 👤 Primeiro Acesso

### Usuário Padrão
- **Email**: admin@example.com
- **Senha**: admin123
- **Empresa**: Buffet Chocolate com Menta

⚠️ **Importante**: Altere a senha padrão após o primeiro login!

### Criando Novos Usuários
1. Acesse o módulo **"Contas"** (apenas admin/owner)
2. Clique em **"Convidar Funcionário"**
3. Preencha email, cargo e departamento
4. Envie o link de convite para o funcionário
5. O funcionário criará sua própria senha

## 📋 Funcionalidades Principais

### 🎉 Gestão de Eventos
- Criação e edição de eventos
- Controle de status (Planejado → Confirmado → Em Andamento → Concluído)
- Seleção de produtos do estoque
- Definição de equipe e pagamentos
- Controle de despesas adicionais
- Cálculo automático de lucro e margem
- Desconto automático do estoque quando confirmado

### 📋 Tarefas
- Criação e atribuição de tarefas
- Controle de status e prioridades
- Notificações automáticas

### 📦 Estoque
- Cadastro de produtos e ingredientes
- Controle de quantidade e estoque mínimo
- Alertas de baixo estoque
- Relatórios de movimentação

### 💰 Financeiro
- Controle de receitas e despesas
- Transações automáticas dos eventos
- Relatórios financeiros
- Cálculo de balanço

### 👥 Recursos Humanos
- Cadastro de funcionários
- Controle de departamentos
- Relatórios de folha de pagamento

### 🔐 Sistema de Permissões
- **Owner/Admin**: Acesso total
- **Manager**: Pode criar/editar eventos
- **Employee**: Acesso limitado por departamento
- Controle granular por módulo

## 🏢 Multi-empresa

- Isolamento completo de dados por empresa
- Sistema de convites para funcionários
- Controle de permissões por empresa
- Cada usuário vinculado a uma empresa específica

## 🔔 Sistema de Notificações

- Notificações em tempo real
- Alertas de estoque baixo
- Notificações de novos eventos
- Histórico de notificações

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Se encontrar algum problema ou tiver dúvidas:

1. Verifique a [documentação](docs/)
2. Procure em [Issues](https://github.com/seu-usuario/fzone-erp/issues)
3. Crie uma nova issue se necessário

## 📝 Notas Finais

O FZone foi desenvolvido especificamente para buffets e empresas de eventos, com foco na gestão completa do negócio. 

**Principais diferenciais:**
- ✅ Gestão completa de eventos com cálculo de lucro
- ✅ Controle automático de estoque por evento
- ✅ Sistema multi-empresa com isolamento de dados
- ✅ Interface moderna e responsiva
- ✅ Controle granular de permissões

---

**Desenvolvido com ❤️ para transformar a gestão de buffets e eventos!**