# 🚀 Super ERP Incrível

> *"Porque gerenciar uma empresa não precisa ser tão doloroso quanto pisar em Lego descalço"*

Olá, humano cansado de planilhas! Bem-vindo ao **Super ERP Incrível**, o sistema que vai fazer você se perguntar como sobreviveu tanto tempo usando papel e caneta (ou Excel, que às vezes é ainda pior).

## 🤔 O que diabos é isso?

É um ERP simples, mas poderoso, que vai ajudar você a:

- **Gerenciar tarefas** - Para você parar de esquecer o que deveria estar fazendo
- **Controlar estoque** - Porque "acho que ainda tem no depósito" não é uma estratégia
- **Organizar finanças** - Para descobrir onde foi parar todo aquele dinheiro
- **Administrar pessoas** - Porque Post-its com nomes colados na parede não é RH

Tudo isso com uma interface bonita que não parece que foi desenhada em 1997!

## 🛠️ Tecnologias (ou "a parte que faz os nerds sorrirem")

- **Vue 3** - Porque React é muito mainstream
- **MongoDB** - Onde guardamos seus dados quando você não está olhando
- **Express** - O carteiro que entrega seus dados
- **Tailwind CSS** - Para ficar bonito sem precisar de um designer
- **JWT** - Para manter os intrusos longe (ou pelo menos tentar)

## 🏃‍♂️ Como Rodar (Sem Tropeçar)

### Pré-requisitos

- **Node.js** - Se você não tem, em que caverna esteve vivendo?
- **MongoDB** - Banco de dados para pessoas que odeiam SQL
- **Paciência** - A mais importante de todas

### Passo 1: Clone o projeto (ou baixe, se você é desses)

```bash
git clone https://github.com/seu-usuario/super-erp-incrivel.git
cd super-erp-incrivel
```

### Passo 2: Configure o Backend (a parte chata, mas necessária)

```bash
# Entre na pasta do backend
cd backend

# Instale as dependências (e reze para não ter conflitos)
npm install

# Crie um arquivo .env com estas configurações
echo "PORT=3000
MONGODB_URI=mongodb://localhost:27017/erp_database
JWT_SECRET=minha_senha_super_secreta_que_ninguem_vai_adivinhar
NODE_ENV=development" > .env

# Inicie o servidor e cruze os dedos
npm run dev
```

Se tudo der certo (haha), você verá uma mensagem bonita no terminal. Se não der, bem... stackoverflow.com é seu amigo.

### Passo 3: Configure o Frontend (a parte divertida)

```bash
# Volte para a pasta raiz e entre na pasta do frontend
cd ..
cd frontend

# Instale as dependências (e mais orações)
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Agora abra seu navegador em `http://localhost:5173` e voilà! Se aparecer uma tela de login, deu certo. Se aparecer um erro, você ganhou a chance de praticar suas habilidades de debugging!

## 👤 Primeiro Acesso

Como você é especial, criamos um usuário para você:

- **Email**: admin@example.com
- **Senha**: admin123

(Sim, é uma senha horrível. Mude assim que entrar, pelo amor de tudo que é sagrado!)

## 🤝 Contribuindo

Encontrou um bug? Tem uma ideia? Quer melhorar algo?

1. Abra uma issue
2. Faça um fork
3. Crie uma branch
4. Faça suas alterações
5. Envie um PR
6. Espere ansiosamente enquanto avaliamos

## 📝 Notas Finais

Este ERP foi feito com ❤️, ☕ e uma quantidade questionável de pizza. Se ele salvar você de pelo menos uma reunião desnecessária, consideramos nossa missão cumprida.

Lembre-se: "Um ERP ruim é melhor que planilha nenhuma, mas um bom ERP é melhor que férias" - Alguém, provavelmente.

**Boa sorte e que a força dos dados esteja com você!**