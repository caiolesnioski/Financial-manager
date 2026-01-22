<div align="center">

# Gerenciador de Financas Pessoais

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.28-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**Sistema completo de gerenciamento financeiro pessoal com controle de contas, lancamentos, limites de gastos e relatorios visuais.**

[Funcionalidades](#-funcionalidades) •
[Instalacao](#-instalacao) •
[Uso](#-como-usar) •
[Screenshots](#-screenshots) •
[Contribuir](#-contribuindo)

</div>

---

## Funcionalidades

### Gestao de Contas
- Criar, editar e deletar contas bancarias
- Rastrear saldos iniciais e atuais
- Protecao contra exclusao de contas com lancamentos
- Suporte a multiplos tipos de conta (corrente, poupanca, cartao, etc.)

### Lancamentos Financeiros
- Tres tipos de lancamento: **Despesa**, **Receita** e **Transferencia**
- Validacoes rigorosas (valor positivo, conta obrigatoria)
- Atualizacao automatica de saldos
- Incremento automatico de limites de gasto

### Limites de Gasto
- CRUD completo com periodo (data inicio/fim)
- Cores customizaveis por categoria
- Sistema de alertas em 4 niveis:
  - **Safe** (0-79%) - Verde
  - **Warning** (80-89%) - Amarelo
  - **Critical** (90-99%) - Laranja
  - **Exceeded** (100%+) - Vermelho

### Relatorios e Analytics
- Grafico de Receitas vs Despesas
- Grafico de Despesas por Categoria (pizza)
- Timeline de Evolucao de Saldo
- Tabela de Uso de Limites com barras de progresso
- Seletor de mes para analise historica

### Recursos Adicionais
- Sistema de notificacoes Toast
- Tema claro/escuro
- Exportacao de dados (CSV, PDF)
- Autenticacao segura via Supabase

---

## Stack Tecnologica

| Tecnologia | Uso |
|------------|-----|
| **React 18** | Framework frontend |
| **Vite 5** | Build tool e dev server |
| **Tailwind CSS 3** | Estilizacao |
| **Supabase** | Backend (PostgreSQL + Auth + RLS) |
| **Recharts** | Graficos e visualizacoes |
| **Chart.js** | Graficos adicionais |
| **Lucide React** | Icones |
| **Zod** | Validacao de schemas |

---

## Pre-requisitos

Antes de comecar, voce precisa ter instalado:

- [Node.js](https://nodejs.org/) versao 18 ou superior
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- Uma conta no [Supabase](https://supabase.com/) (gratuito)

---

## Instalacao

### 1. Clone o repositorio

```bash
git clone https://github.com/seu-usuario/gerenciador-financas.git
cd gerenciador-financas
```

### 2. Instale as dependencias

```bash
npm install
```

### 3. Configure as variaveis de ambiente

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

> **Onde encontrar essas credenciais?**
> 1. Acesse [app.supabase.com](https://app.supabase.com)
> 2. Selecione seu projeto
> 3. Va em **Settings** > **API**
> 4. Copie a **Project URL** e a **anon public key**

### 4. Configure o banco de dados

Execute o arquivo `schema.sql` no SQL Editor do Supabase:

1. Acesse o painel do Supabase
2. Va em **SQL Editor**
3. Cole o conteudo de `schema.sql`
4. Execute o script

Isso ira criar:
- Tabelas: `accounts`, `entries`, `limits`
- Row Level Security (RLS)
- Politicas de acesso por usuario

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173)

---

## Como Usar

### Primeiro Acesso

1. Crie uma conta ou faca login
2. Adicione suas contas bancarias em **Contas**
3. Defina limites de gasto em **Limites**
4. Registre seus lancamentos em **Novo Lancamento**
5. Acompanhe sua saude financeira no **Dashboard** e **Relatorios**

### Comandos Disponiveis

| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Gera build de producao |
| `npm run preview` | Preview do build de producao |

---

## Screenshots

> **Adicione suas screenshots aqui!**
> Salve as imagens na pasta `docs/screenshots/` e atualize os caminhos abaixo.

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)
*Visao geral das financas com cards de resumo*

### Lancamentos
![Lancamentos](docs/screenshots/lancamentos.png)
*Lista de lancamentos com filtros e busca*

### Relatorios
![Relatorios](docs/screenshots/relatorios.png)
*Graficos interativos de receitas e despesas*

### Limites
![Limites](docs/screenshots/limites.png)
*Controle de limites com alertas visuais*

---

## Estrutura do Projeto

```
gerenciador-financas/
├── .github/
│   └── workflows/          # CI/CD (futuro)
├── docs/
│   └── screenshots/        # Screenshots para documentacao
├── src/
│   ├── components/         # Componentes reutilizaveis
│   │   ├── AccountList.jsx
│   │   ├── CategorySelector.jsx
│   │   ├── DashboardCards.jsx
│   │   ├── EntryForm.jsx
│   │   ├── LimitAlert.jsx
│   │   ├── LimitForm.jsx
│   │   ├── LimitList.jsx
│   │   ├── MonthlyNavigator.jsx
│   │   └── ToastContainer.jsx
│   ├── context/            # React Context
│   │   ├── ThemeContext.jsx
│   │   └── ToastContext.jsx
│   ├── hooks/              # Custom Hooks
│   │   ├── useAccounts.js
│   │   ├── useAuth.js
│   │   ├── useEntries.js
│   │   ├── useFormValidation.js
│   │   └── useLimits.js
│   ├── pages/              # Paginas/Rotas
│   │   ├── AccountForm.jsx
│   │   ├── Accounts.jsx
│   │   ├── Cashflow.jsx
│   │   ├── Dashboard.jsx
│   │   ├── EntryList.jsx
│   │   ├── LimitForm.jsx
│   │   ├── Limits.jsx
│   │   ├── Login.jsx
│   │   ├── Navbar.jsx
│   │   ├── NewEntry.jsx
│   │   ├── Reports.jsx
│   │   └── Settings.jsx
│   ├── schemas/            # Schemas de validacao (Zod)
│   │   ├── accountSchema.js
│   │   ├── entrySchema.js
│   │   └── limitSchema.js
│   ├── services/           # Camada de servicos
│   │   ├── accountsService.js
│   │   ├── authService.js
│   │   ├── entriesService.js
│   │   ├── limitsService.js
│   │   ├── recurringService.js
│   │   └── supabaseClient.js
│   ├── utils/              # Utilitarios
│   │   ├── categorias.js
│   │   ├── exportUtils.js
│   │   └── rateLimit.js
│   ├── App.jsx             # Componente principal
│   ├── index.css           # Estilos globais
│   └── main.jsx            # Entry point
├── .env.example            # Exemplo de variaveis de ambiente
├── .gitignore              # Arquivos ignorados pelo Git
├── CONTRIBUTING.md         # Guia para contribuidores
├── LICENSE                 # Licenca MIT
├── package.json            # Dependencias e scripts
├── schema.sql              # Schema do banco de dados
├── seed.sql                # Dados de exemplo
├── tailwind.config.js      # Configuracao Tailwind
└── vite.config.js          # Configuracao Vite
```

---

## Variaveis de Ambiente

| Variavel | Descricao | Obrigatoria |
|----------|-----------|-------------|
| `VITE_SUPABASE_URL` | URL do seu projeto Supabase | Sim |
| `VITE_SUPABASE_ANON_KEY` | Chave anonima publica do Supabase | Sim |

> **IMPORTANTE:** Nunca commite o arquivo `.env` com credenciais reais!

---

## Seguranca

Este projeto implementa diversas camadas de seguranca:

- **Row Level Security (RLS)** - Dados isolados por usuario
- **Autenticacao obrigatoria** - Todas as rotas protegidas
- **Validacao de entrada** - Schemas Zod no frontend
- **Variaveis de ambiente** - Credenciais fora do codigo

Para mais detalhes, consulte [SECURITY.md](SECURITY.md).

---

## Contribuindo

Contribuicoes sao bem-vindas! Por favor, leia o [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes sobre nosso codigo de conduta e processo de submissao de pull requests.

### Passos Rapidos

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudancas (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

---

## Licenca

Este projeto esta licenciado sob a Licenca MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## Autor

Desenvolvido com dedicacao para ajudar no controle financeiro pessoal.

---

## Agradecimentos

- [React](https://reactjs.org/) - Biblioteca JavaScript para interfaces
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitario
- [Recharts](https://recharts.org/) - Biblioteca de graficos
- [Lucide](https://lucide.dev/) - Icones bonitos e consistentes
