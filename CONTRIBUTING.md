# Guia de Contribuicao

Obrigado pelo interesse em contribuir com o Gerenciador de Financas Pessoais! Este documento fornece diretrizes para contribuicoes.

## Indice

- [Codigo de Conduta](#codigo-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Configuracao do Ambiente](#configuracao-do-ambiente)
- [Fluxo de Desenvolvimento](#fluxo-de-desenvolvimento)
- [Padroes de Codigo](#padroes-de-codigo)
- [Commits](#commits)
- [Pull Requests](#pull-requests)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Funcionalidades](#sugerindo-funcionalidades)

---

## Codigo de Conduta

Este projeto adota um Codigo de Conduta que esperamos que todos os participantes sigam. Por favor, seja respeitoso e construtivo em todas as interacoes.

### Nossos Padroes

- Usar linguagem acolhedora e inclusiva
- Respeitar pontos de vista diferentes
- Aceitar criticas construtivas graciosamente
- Focar no que e melhor para a comunidade
- Mostrar empatia com outros membros

---

## Como Posso Contribuir?

### Tipos de Contribuicao

1. **Correcao de Bugs** - Encontrou um bug? Abra uma issue ou envie um PR
2. **Novas Funcionalidades** - Tem uma ideia? Discuta primeiro em uma issue
3. **Documentacao** - Melhorias no README, comentarios no codigo
4. **Testes** - Adicionar testes unitarios ou de integracao
5. **Traducoes** - Ajudar a traduzir a interface
6. **Code Review** - Revisar PRs de outros contribuidores

---

## Configuracao do Ambiente

### Pre-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase (gratuita)
- Git

### Passos

1. **Fork o repositorio**

   Clique no botao "Fork" no GitHub

2. **Clone seu fork**

   ```bash
   git clone https://github.com/seu-usuario/gerenciador-financas.git
   cd gerenciador-financas
   ```

3. **Adicione o upstream**

   ```bash
   git remote add upstream https://github.com/original/gerenciador-financas.git
   ```

4. **Instale as dependencias**

   ```bash
   npm install
   ```

5. **Configure as variaveis de ambiente**

   ```bash
   cp .env.example .env
   # Edite .env com suas credenciais do Supabase
   ```

6. **Inicie o servidor de desenvolvimento**

   ```bash
   npm run dev
   ```

---

## Fluxo de Desenvolvimento

### 1. Sincronize com o upstream

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### 2. Crie uma branch

Use prefixos descritivos:

- `feature/` - Nova funcionalidade
- `fix/` - Correcao de bug
- `docs/` - Documentacao
- `refactor/` - Refatoracao
- `test/` - Testes

```bash
git checkout -b feature/nome-da-funcionalidade
```

### 3. Faca suas alteracoes

- Mantenha commits pequenos e focados
- Teste suas alteracoes localmente
- Siga os padroes de codigo

### 4. Commit e Push

```bash
git add .
git commit -m "feat: adiciona nova funcionalidade X"
git push origin feature/nome-da-funcionalidade
```

### 5. Abra um Pull Request

- Va ate seu fork no GitHub
- Clique em "Compare & pull request"
- Preencha o template do PR

---

## Padroes de Codigo

### Geral

- Use **2 espacos** para indentacao
- Arquivos devem terminar com uma linha em branco
- Remova espacos em branco no final das linhas
- Use aspas simples para strings em JavaScript

### React/JSX

```jsx
// Componentes funcionais com hooks
const MeuComponente = ({ prop1, prop2 }) => {
  const [estado, setEstado] = useState(null)

  useEffect(() => {
    // efeitos aqui
  }, [])

  return (
    <div className="classe-tailwind">
      {/* conteudo */}
    </div>
  )
}

export default MeuComponente
```

### Nomenclatura

| Tipo | Convencao | Exemplo |
|------|-----------|---------|
| Componentes | PascalCase | `UserProfile.jsx` |
| Funcoes | camelCase | `getUserData()` |
| Constantes | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Arquivos CSS | kebab-case | `user-profile.css` |
| Variaveis | camelCase | `isLoading` |

### Estrutura de Arquivos

```
src/
├── components/     # Componentes reutilizaveis
├── pages/          # Paginas/rotas
├── hooks/          # Custom hooks
├── services/       # Logica de negocio/API
├── context/        # React Context
├── utils/          # Funcoes utilitarias
└── schemas/        # Schemas de validacao
```

### Tailwind CSS

- Prefira classes utilitarias a CSS customizado
- Use o arquivo `tailwind.config.js` para customizacoes
- Agrupe classes relacionadas:

```jsx
// Bom
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">

// Evite linhas muito longas - quebre se necessario
<div
  className={`
    flex items-center justify-between
    p-4 bg-white rounded-lg shadow
    hover:shadow-lg transition-shadow
  `}
>
```

---

## Commits

### Formato

Seguimos o padrao [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<escopo>): <descricao>

[corpo opcional]

[rodape opcional]
```

### Tipos

| Tipo | Descricao |
|------|-----------|
| `feat` | Nova funcionalidade |
| `fix` | Correcao de bug |
| `docs` | Documentacao |
| `style` | Formatacao (sem mudanca de logica) |
| `refactor` | Refatoracao |
| `test` | Adicao/correcao de testes |
| `chore` | Tarefas de manutencao |

### Exemplos

```bash
feat(accounts): adiciona suporte a contas de investimento

fix(entries): corrige calculo de saldo em transferencias

docs(readme): atualiza instrucoes de instalacao

refactor(hooks): simplifica useEntries com useMemo
```

---

## Pull Requests

### Checklist

Antes de abrir um PR, verifique:

- [ ] Codigo segue os padroes do projeto
- [ ] Testes passando (se aplicavel)
- [ ] Documentacao atualizada (se necessario)
- [ ] Commits seguem o padrao Conventional Commits
- [ ] Branch atualizada com main
- [ ] Sem conflitos de merge

### Template de PR

```markdown
## Descricao

Breve descricao das mudancas.

## Tipo de Mudanca

- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Mudanca que quebra compatibilidade
- [ ] Documentacao

## Como Testar

1. Passo 1
2. Passo 2
3. ...

## Screenshots (se aplicavel)

## Checklist

- [ ] Meu codigo segue os padroes do projeto
- [ ] Fiz self-review do meu codigo
- [ ] Comentei partes complexas do codigo
- [ ] Atualizei a documentacao
- [ ] Minhas mudancas nao geram novos warnings
```

---

## Reportando Bugs

### Antes de Reportar

1. Verifique se o bug ja foi reportado nas Issues
2. Tente reproduzir o bug na versao mais recente
3. Colete informacoes sobre seu ambiente

### Template de Bug Report

```markdown
## Descricao do Bug

Descricao clara e concisa do bug.

## Passos para Reproduzir

1. Va para '...'
2. Clique em '...'
3. Role ate '...'
4. Veja o erro

## Comportamento Esperado

O que deveria acontecer.

## Screenshots

Se aplicavel, adicione screenshots.

## Ambiente

- OS: [ex: Windows 10, macOS 12]
- Browser: [ex: Chrome 100, Firefox 95]
- Node: [ex: 18.12.0]
- Versao do Projeto: [ex: 0.1.0]

## Contexto Adicional

Qualquer outra informacao relevante.
```

---

## Sugerindo Funcionalidades

### Processo

1. **Abra uma Issue** descrevendo a funcionalidade
2. **Aguarde feedback** da comunidade e mantenedores
3. **Discuta a implementacao** antes de comecar
4. **Implemente** apos aprovacao

### Template de Feature Request

```markdown
## Problema

Descricao do problema que essa funcionalidade resolve.

## Solucao Proposta

Descricao clara da solucao.

## Alternativas Consideradas

Outras solucoes que voce considerou.

## Contexto Adicional

Mockups, exemplos, referencias.
```

---

## Duvidas?

Se tiver duvidas sobre como contribuir, abra uma Issue com a tag `question` ou entre em contato com os mantenedores.

Obrigado por contribuir!
