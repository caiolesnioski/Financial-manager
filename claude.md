# Gerenciador de Finanças Pessoais

## Visao Geral
Sistema de gerenciamento financeiro pessoal desenvolvido com React + Vite, Tailwind CSS e Supabase como backend.

## Stack Tecnologica
- **Frontend:** React 18, React Router DOM 6
- **Estilizacao:** Tailwind CSS 3
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Graficos:** Recharts, Chart.js
- **Icones:** Lucide React
- **Build:** Vite 5

## Estrutura do Projeto

```
src/
├── services/           # Camada de servicos (logica de negocio)
│   ├── supabaseClient.js   # Cliente Supabase
│   ├── authService.js      # Autenticacao
│   ├── accountsService.js  # CRUD de contas
│   ├── entriesService.js   # CRUD de lancamentos
│   └── limitsService.js    # CRUD de limites
├── hooks/              # Custom hooks React
│   ├── useAuth.js
│   ├── useAccounts.js
│   ├── useEntries.js
│   └── useLimits.js (se existir)
├── pages/              # Paginas/rotas
│   ├── Dashboard.jsx
│   ├── Login.jsx
│   ├── Accounts.jsx
│   ├── NewEntry.jsx
│   ├── Cashflow.jsx
│   ├── Limits.jsx
│   ├── Reports.jsx
│   └── Settings.jsx
├── components/         # Componentes reutilizaveis
│   ├── Navbar.jsx
│   ├── EntryForm.jsx
│   ├── EntryList.jsx
│   ├── AccountForm.jsx
│   ├── AccountList.jsx
│   ├── LimitForm.jsx
│   ├── LimitList.jsx
│   ├── MonthlyNavigator.jsx
│   └── DashboardCards.jsx
├── App.jsx             # Rotas principais
└── main.jsx            # Entry point
```

## Comandos

```bash
npm run dev      # Servidor de desenvolvimento (localhost:5173)
npm run build    # Build para producao
npm run preview  # Preview do build
```

## Variaveis de Ambiente

Arquivo `.env` na raiz:
```
VITE_SUPABASE_URL=<url_do_projeto_supabase>
VITE_SUPABASE_ANON_KEY=<chave_anonima_supabase>
```

## Banco de Dados (Supabase)

### Tabelas Principais
- **accounts** - Contas bancarias (nome, tipo, saldo)
- **entries** - Lancamentos (despesa, receita, transferencia)
- **limits** - Limites de gasto por categoria/periodo

### Seguranca
- Row Level Security (RLS) ativado
- Dados isolados por `user_id`
- Autenticacao obrigatoria

## Padroes de Codigo

### Services
- Funcoes async que interagem com Supabase
- Documentados com JSDoc
- Retornam `{ data, error }`

### Hooks
- Gerenciam estado e loading
- Chamam services internamente
- Expoe funcoes CRUD para componentes

### Componentes
- Functional components com hooks
- Props tipadas implicitamente
- Tailwind para estilizacao inline

## Fluxos Importantes

### Criar Lancamento
1. Validacao no frontend (valor > 0, conta obrigatoria)
2. INSERT na tabela `entries`
3. `applyEntryEffects()` atualiza saldo da conta e limite

### Editar Lancamento
1. `revertEntryEffects()` desfaz efeitos anteriores
2. UPDATE na tabela `entries`
3. `applyEntryEffects()` aplica novos efeitos

### Sistema de Alertas de Limite
- 0-79%: Safe (verde)
- 80-89%: Warning (amarelo)
- 90-99%: Critical (laranja)
- 100%+: Exceeded (vermelho)

## Convencoes

- Arquivos JSX para componentes React
- Arquivos JS para logica/services
- Nomes em ingles para codigo, portugues para UI
- Cores primarias: verde esmeralda (#10b981)
