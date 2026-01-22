# Medidas de Seguranca - Gerenciador de Financas

Este documento descreve as medidas de seguranca implementadas no sistema.

## 1. Row Level Security (RLS) - Supabase

### Status das Policies

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| accounts | user_id = auth.uid() | user_id = auth.uid() | user_id = auth.uid() | user_id = auth.uid() |
| entries | user_id = auth.uid() | user_id = auth.uid() | user_id = auth.uid() | user_id = auth.uid() |
| limits | user_id = auth.uid() | user_id = auth.uid() | user_id = auth.uid() | user_id = auth.uid() |

### Triggers de Seguranca

Triggers que forcam `user_id = auth.uid()` no INSERT, impedindo que clientes maliciosos enviem user_id de outro usuario:

- `set_user_id_accounts` - tabela accounts
- `set_user_id_entries` - tabela entries
- `set_user_id_limits` - tabela limits

## 2. Rate Limiting

### Configuracoes

| Operacao | Limite | Janela |
|----------|--------|--------|
| createEntry | 10 req | 1 minuto |
| deleteEntry | 10 req | 1 minuto |
| createAccount | 5 req | 1 minuto |
| updateLimit | 10 req | 1 minuto |
| exportData | 5 req | 1 minuto |
| loginAttempt | 5 req | 5 minutos |

### Implementacao

```javascript
// src/utils/rateLimit.js
import { checkRateLimit, RateLimitError, RATE_LIMITS } from '../utils/rateLimit'

// Nos services:
try {
  checkRateLimit('createEntry', RATE_LIMITS.CREATE_ENTRY.max, RATE_LIMITS.CREATE_ENTRY.windowMs)
} catch (err) {
  if (err instanceof RateLimitError) {
    return { error: { message: err.message, isRateLimited: true } }
  }
}
```

## 3. Autenticacao JWT

### Refresh Automatico

- Intervalo: 30 minutos
- Implementacao: `src/hooks/useAuth.js`
- Comportamento ao falhar: redireciona para /login

```javascript
// Intervalo de refresh
const JWT_REFRESH_INTERVAL = 30 * 60 * 1000 // 30 minutos

// Refresh automatico via setInterval
refreshIntervalRef.current = setInterval(() => {
  refreshSession()
}, JWT_REFRESH_INTERVAL)
```

## 4. Content Security Policy (CSP)

### Configuracao Recomendada

Adicione os seguintes headers no servidor web ou no `index.html`:

```html
<!-- Em public/index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
">
```

### Para Netlify (_headers)

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'none';
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Para Vercel (vercel.json)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://*.supabase.co wss://*.supabase.co;"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

## 5. Protecao contra Ataques Comuns

### XSS (Cross-Site Scripting)

- React escapa automaticamente valores em JSX
- Nao usamos `dangerouslySetInnerHTML`
- Inputs sao sanitizados antes de enviar ao banco

### CSRF (Cross-Site Request Forgery)

- Supabase usa tokens JWT no header Authorization
- Tokens sao armazenados no localStorage/sessionStorage
- Requests sao validados pelo RLS no servidor

### SQL Injection

- Supabase client usa queries parametrizadas
- Nao construimos SQL manualmente
- RLS adiciona camada extra de protecao

## 6. Logs de Seguranca

### O que NAO logamos:

- user_id
- Tokens de autenticacao
- Senhas
- Emails
- Dados de sessao

### O que logamos (apenas em dev):

- Erros genericos de operacoes
- Falhas de rate limit
- Erros de refresh de sessao

## 7. Variaveis de Ambiente

### Arquivo .env (NAO commitar!)

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica
```

### .gitignore deve incluir:

```
.env
.env.local
.env.*.local
```

## 8. Checklist de Seguranca

- [x] RLS habilitado em todas as tabelas
- [x] Policies para SELECT, INSERT, UPDATE, DELETE
- [x] Triggers para forcar user_id
- [x] Rate limiting implementado
- [x] JWT refresh automatico
- [x] Sem logs de dados sensiveis
- [ ] CSP headers configurados (requer deploy)
- [x] Variaveis de ambiente protegidas
- [x] Validacao Zod no frontend

## 9. Atualizacoes de Seguranca

### Como aplicar a migration de triggers:

Execute no Supabase SQL Editor:

```sql
-- Arquivo: supabase/schema.sql (secao de triggers)
-- Ou execute o conteudo de supabase/migrations/add_security_triggers.sql
```

### Verificar se RLS esta ativo:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

## 10. Contato

Para reportar vulnerabilidades de seguranca, entre em contato com o administrador do sistema.
