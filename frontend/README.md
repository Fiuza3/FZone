# 🎮 Frontend do Super ERP Incrível

> *"A parte bonita do sistema, onde os botões fazem coisas mágicas acontecerem"*

## 🤓 Guia para Desenvolvedores (e Curiosos)

Então você decidiu mexer no frontend? Corajoso(a) você, hein? Aqui vai um guia para não se perder nesse labirinto de componentes Vue.

### 📁 Estrutura de Pastas (ou "onde está aquele arquivo que eu vi ontem?")

```
src/
├── assets/         # Imagens e coisas bonitas
├── components/     # Peças de Lego para montar telas
│   ├── auth/       # Coisas de login (para manter intrusos longe)
│   ├── dashboard/  # Gráficos bonitos que impressionam o chefe
│   ├── finance/    # Onde o dinheiro aparece e desaparece
│   ├── hr/         # Gestão de pessoas (não, não pode demitir por aqui)
│   ├── layout/     # Estrutura básica (tipo o esqueleto do sistema)
│   ├── stock/      # Controle de produtos (para não vender o que não tem)
│   └── tasks/      # Tarefas (para fingir que você é produtivo)
├── router/         # Decide para onde você vai quando clica em coisas
├── services/       # Conversa com o backend (tipo um tradutor)
├── stores/         # Onde guardamos os dados enquanto você usa o app
└── views/          # Telas completas (combinação dos componentes)
```

### 🚀 Como Rodar o Frontend Sozinho

```bash
# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev

# Para construir para produção (se você é corajoso)
npm run build
```

### 🔧 Customização

Quer mudar as cores? Acha que nosso design não é tão bonito quanto pensamos?

1. Mexa no arquivo `tailwind.config.js` para cores e temas
2. Altere os componentes em `src/components`
3. Chore quando quebrar algo
4. Repita

### 🧪 Testando

Testes? Hahaha... boa piada! 

(Ok, sério agora, você pode adicionar testes com Vitest ou Jest se quiser. Nós acreditamos em você!)

### 📱 Responsividade

O sistema funciona em telas pequenas? Mais ou menos. É como usar um submarino para atravessar um rio - tecnicamente funciona, mas não é a melhor experiência.

## 🤔 Perguntas Frequentes

**P: Por que Vue e não React?**  
R: Porque gostamos de templates HTML legíveis e não de JSX que parece código alienígena.

**P: O sistema é seguro?**  
R: Tão seguro quanto deixar sua bicicleta trancada com um cadeado de plástico. Brincadeira, usamos JWT e outras coisas sérias.

**P: Posso contribuir?**  
R: Claro! Veja o README principal para instruções. Aceitamos PRs, sugestões e doações em forma de café.

## 🎉 Créditos

Feito com muito café, algumas lágrimas e Stack Overflow.

**Lembre-se:** "Um bom frontend é como uma boa piada - não precisa ser explicado."