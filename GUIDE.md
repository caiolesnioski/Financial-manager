# 📊 Gerenciador de Finanças Pessoais

Sistema completo de gerenciamento financeiro pessoal com React, Tailwind CSS e Supabase.

## ✨ Funcionalidades Implementadas

### 1. **Gestão de Contas** 💳
- Criar, editar e deletar contas bancárias
- Rastrear saldo inicial e atual
- Proteção contra exclusão de contas com lançamentos
- Suporte a múltiplos tipos de conta

### 2. **Lançamentos** 📝
- Criar despesas, receitas e transferências
- Categorização automática
- **Validações:**
  - Valores obrigatoriamente positivos
  - Seleção obrigatória de conta
  - Contas diferentes em transferências
  - Botão de salvar desabilitado quando inválido
- Atualização automática de saldos de conta

### 3. **Limites de Gasto** 🎯
- Criar limites por categoria com período (data início/fim)
- Cores personalizáveis
- **Sistema de alertas:**
  - 🟡 80-89% → Aviso (amarelo)
  - 🟠 90-99% → Crítico (laranja)
  - 🔴 100%+ → Excedido (vermelho)
- Incremento automático ao criar despesa
- Reversão automática ao deletar/editar despesa

### 4. **Relatórios** 📈
- Gráfico de receitas vs despesas
- Gráfico de despesas por categoria
- Timeline de evolução de saldo
- Tabela de uso de limites
- Seletor de mês para análise histórica

### 5. **Notificações** 🔔
- Sistema Toast reutilizável
- Tipos: sucesso, erro, aviso, info
- Animação suave de entrada/saída
- Disponível em toda a aplicação via `useToast()`

## 🧪 Guia de Teste Completo

### Teste 1: Fluxo Básico de Conta e Limite

**Passo 1:** Criar Conta
```
1. Ir para "Contas"
2. Clique em "Nova Conta"
3. Preencha:
   - Nome: "Banco Principal"
   - Tipo: "Corrente"
   - Saldo Inicial: "1000,00"
4. Clique em "Salvar"
✓ Conta criada com saldo de R$ 1.000,00
```

**Passo 2:** Criar Limite
```
1. Ir para "Limites"
2. Clique em "Novo limite"
3. Preencha:
   - Categoria: "Alimentação"
   - Limite: "500,00"
   - Data Início: [mês atual, dia 1]
   - Data Fim: [último dia do mês]
   - Cor: Verde
4. Clique em "Salvar"
✓ Limite criado: 0% de utilização
```

**Passo 3:** Criar Despesa e Verificar Cascata
```
1. Ir para "Novo Lançamento"
2. Selecione "Despesa"
3. Preencha:
   - Valor: "150,00"
   - Categoria: "Alimentação"
   - Conta: "Banco Principal"
   - Data: [data de hoje]
   - Descrição: "Compras de mercado"
4. Clique em "Salvar"
✓ Verificar atualizações automáticas:
  - Saldo da conta em "Contas" deve ser R$ 850,00
  - Limite em "Limites" deve mostrar 150/500 (30%)
```

### Teste 2: Limites e Alertas

**Passo 1:** Atualizar para Alerta (80%)
```
1. Criar despesa de R$ 250,00 em "Alimentação"
✓ Limite deve mostrar 400/500 (80%) com alerta AMARELO
```

**Passo 2:** Atualizar para Crítico (90%)
```
1. Criar despesa de R$ 50,00 em "Alimentação"
✓ Limite deve mostrar 450/500 (90%) com alerta LARANJA
```

**Passo 3:** Exceder Limite (100%+)
```
1. Criar despesa de R$ 50,00 em "Alimentação"
✓ Limite deve mostrar 500/500 (100%) com alerta VERMELHO
✓ Mensagem "Excedido em R$ 0,00"
```

### Teste 3: Reversão de Efeitos

**Passo 1:** Editar Despesa
```
1. Ir para "Lançamentos"
2. Clique em uma despesa para editar
3. Altere o valor de R$ 150 para R$ 100
4. Clique em "Salvar"
✓ Saldo da conta deve aumentar em R$ 50
✓ Limite usado deve diminuir em R$ 50
```

**Passo 2:** Deletar Despesa
```
1. Ir para "Lançamentos"
2. Clique no ícone de lixo
3. Confirme a exclusão
✓ Saldo da conta deve aumentar
✓ Limite usado deve ser removido
```

### Teste 4: Proteção de Conta

**Passo 1:** Tentar Deletar Conta com Lançamentos
```
1. Ir para "Contas"
2. Clique em "Deletar" na conta "Banco Principal"
3. Confirme a exclusão
✗ Deve aparecer erro: "Não é possível deletar... Existem X lançamento(s)..."
✓ Conta não deve ser deletada
```

### Teste 5: Validações de Entrada

**Passo 1:** Valor Inválido
```
1. Ir para "Novo Lançamento"
2. Tente deixar valor vazio ou zero
✗ Botão "Salvar" deve estar desabilitado (cinza)
✓ Preencha com R$ 100
✓ Botão "Salvar" ativa (verde)
```

**Passo 2:** Sem Conta Selecionada
```
1. Ir para "Novo Lançamento"
2. Selecione "Despesa"
3. Tente não selecionar conta
✗ Botão "Salvar" desabilitado
```

**Passo 3:** Transferência Inválida
```
1. Selecione "Transferência"
2. Preencha origem = destino
✗ Botão "Salvar" deve estar desabilitado
```

### Teste 6: Relatórios

**Passo 1:** Verificar Gráficos
```
1. Ir para "Relatórios"
2. Verifique:
   - Gráfico "Receitas vs Despesas" mostra valores corretos
   - Gráfico "Despesas por Categoria" com pizza colorida
   - Timeline de "Evolução do Saldo"
   - Tabela de "Uso de Limites"
3. Mude o seletor de mês
✓ Gráficos atualizam com dados corretos
```

## 🔄 Integração de Dados

### Fluxo de Criação de Despesa
```
1. Usuário cria despesa de R$ 100
   ↓
2. Lançamento inserido no banco
   ↓
3. applyEntryEffects() executa:
   - Decrementa saldo da conta em R$ 100
   - Incrementa limite gasto em R$ 100
   - Calcula novo percentual do limite
   - Retorna nível de alerta
```

### Fluxo de Edição
```
1. Usuário edita despesa (R$ 100 → R$ 150)
   ↓
2. revertEntryEffects() desfaz a despesa anterior
   - Incrementa saldo em R$ 100
   - Decrementa limite em R$ 100
   ↓
3. applyEntryEffects() aplica nova despesa
   - Decrementa saldo em R$ 150
   - Incrementa limite em R$ 150
```

## 🛠️ Stack Técnico

- **Frontend:** React 18, Tailwind CSS, Lucide Icons
- **Charts:** Recharts
- **Backend:** Supabase (PostgreSQL + Auth)
- **Validação:** Form validation em React
- **Notificações:** Context + Toast custom

## 📝 Arquitetura

```
src/
├── services/          # CRUD + Business Logic
│   ├── accountsService.js
│   ├── entriesService.js
│   ├── limitsService.js
│   ├── authService.js
│   └── supabaseClient.js
├── hooks/             # Custom Hooks
│   ├── useAuth.js
│   ├── useAccounts.js
│   ├── useEntries.js
│   └── useLimits.js
├── pages/             # Page Components
│   ├── Dashboard.jsx
│   ├── Accounts.jsx
│   ├── NewEntry.jsx
│   ├── Limits.jsx
│   ├── Reports.jsx
│   └── ...
├── components/        # Reusable Components
│   ├── EntryForm.jsx
│   ├── LimitForm.jsx
│   ├── LimitAlert.jsx
│   ├── ToastContainer.jsx
│   └── ...
└── context/           # Context API
    └── ToastContext.jsx
```

## ✅ Checklist de Funcionalidades

- ✅ CRUD de Contas
- ✅ CRUD de Lançamentos (Despesa/Receita/Transferência)
- ✅ CRUD de Limites com Período
- ✅ Validações de Entrada
- ✅ Proteção contra Exclusão de Contas
- ✅ Atualização Automática de Saldos
- ✅ Incremento Automático de Limites
- ✅ Sistema de Alertas (80%, 90%, 100%+)
- ✅ Relatórios com Gráficos (Recharts)
- ✅ Notificações Toast
- ✅ Comentários JSDoc
- ✅ Autenticação Supabase (RLS)

## 🎯 Próximas Melhorias (Opcional)

- [ ] Export de relatórios em PDF
- [ ] Backup automático de dados
- [ ] Dashboard com widgets customizáveis
- [ ] Tags e busca avançada de lançamentos
- [ ] Configuração de recorrência (repetição)
- [ ] Metas financeiras
- [ ] Comparação de períodos
- [ ] Dark mode
- [ ] App mobile (React Native)

---

**Status:** ✅ **Pronto para Produção**

Todos os testes passando ✓ Código bem documentado ✓ UX otimizada ✓
