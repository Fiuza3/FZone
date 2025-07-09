# 🧙‍♂️ Backend do Super ERP Incrível

> *"A parte misteriosa que ninguém vê, mas todo mundo culpa quando algo dá errado"*

## 🤖 O que é isso?

Este é o backend do nosso glorioso ERP - o cérebro da operação, o mago por trás da cortina, o chef na cozinha. Enquanto o frontend é o garçom bonito que traz sua comida, nós somos os que realmente fazem o trabalho pesado.

## 🛠️ Tecnologias (ou "ferramentas de tortura")

- **Node.js** - Porque PHP é coisa do passado
- **Express** - Para rotear requisições sem enlouquecer
- **MongoDB** - Banco de dados para quem tem alergia a SQL
- **Mongoose** - Para falar com o MongoDB sem precisar de um tradutor
- **JWT** - Tokens mágicos que dizem "sim, este usuário pode entrar"
- **Bcrypt** - Para transformar senhas em salada de letras e números

## 🏃‍♂️ Como Rodar (Sem Explodir o Computador)

### Passo 1: Configuração Inicial

```bash
# Entre na pasta do backend
cd backend

# Instale as dependências
npm install

# Se der erro, tente:
npm install --force
# (Força bruta sempre resolve, né?)
```

### Passo 2: Configure o Ambiente

Crie um arquivo `.env` na raiz do backend com:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/erp_database
JWT_SECRET=alguma_coisa_super_secreta_tipo_sua_senha_do_facebook
NODE_ENV=development
```

Se você não tem MongoDB instalado:
1. Baixe em mongodb.com
2. Instale
3. Reze para funcionar de primeira

### Passo 3: Inicie o Servidor

```bash
# Modo desenvolvimento (com reinício automático)
npm run dev

# Modo produção (sem reinício, para os corajosos)
npm start
```

Se tudo der certo, você verá algo como:
```
🚀 Servidor ERP rodando em http://localhost:3000
📊 Ambiente: development
⏱️ [data e hora atual]
```

Se não der certo... bem, bem-vindo ao mundo do desenvolvimento!

## 📁 Estrutura de Pastas (ou "onde está aquele código que eu escrevi ontem?")

```
backend/
├── controllers/    # Controladores (o cérebro das operações)
├── middlewares/    # Middlewares (os seguranças da balada)
├── models/         # Modelos (as plantas da construção)
├── routes/         # Rotas (os mapas para chegar aos controladores)
├── .env            # Configurações secretas (não cometa o erro de compartilhar)
├── db.js           # Conexão com o banco (a ponte para os dados)
└── index.js        # Arquivo principal (o maestro da orquestra)
```

## 🔍 API Endpoints (ou "URLs mágicas")

### Autenticação
- `POST /api/auth/register` - Crie uma conta (se você for digno)
- `POST /api/auth/login` - Entre no sistema (se lembrar a senha)
- `GET /api/auth/profile` - Veja quem você é (crise existencial digital)

### Tarefas
- `GET /api/tasks` - Veja todas as suas tarefas (e chore)
- `POST /api/tasks` - Crie mais trabalho para si mesmo
- `PUT /api/tasks/:id` - Mude uma tarefa (provavelmente adiando-a)
- `DELETE /api/tasks/:id` - Desista de uma tarefa

### Estoque, Financeiro e RH
Temos endpoints para tudo isso também! Explore o código ou a documentação completa para descobrir (é como uma caça ao tesouro, mas com APIs).

## 🐛 Problemas Comuns (ou "por que isso não funciona?")

1. **Erro de conexão com MongoDB**
   - Você instalou MongoDB?
   - Ele está rodando?
   - Tentou desligar e ligar de novo?

2. **JWT não funciona**
   - Você definiu JWT_SECRET no .env?
   - O token está sendo enviado no header?
   - Você não expirou, né?

3. **Nada funciona**
   - Respire fundo
   - Tome um café
   - Tente `npm install` novamente
   - Considere uma carreira como padeiro

## 🧙‍♂️ Palavras Finais

Este backend foi construído com sangue, suor e Stack Overflow. Trate-o com respeito.

Lembre-se: "Em caso de dúvida, reinicie o servidor" - Sabedoria ancestral dos desenvolvedores.