<!--
Fichier généré pour guider les agents IA (Copilot/Claude/etc.) qui travaillent sur
ce dépôt. Contenu concis — points d'accès, conventions, commandes et exemples
spécifiques au projet.
-->

# Copilot instructions — Gerenciador de Finanças Pessoais

Objetivo rápido: permettre à un agent IA d'être productif aussitôt en décrivant
l'architecture, les conventions de code, les points d'intégration (Supabase) et
les commandes de développement essentielles.

- Architecture (big picture)
  - Frontend React + Vite (entry: `src/main.jsx`, routes dans `src/App.jsx`).
  - Service layer centralisé dans `src/services/` qui parle à Supabase via
    `src/services/supabaseClient.js`.
  - Hooks personnalisés (`src/hooks/`) encapsulent le state et appellent les
    services (ex: `useEntries`, `useAccounts`, `useLimits`).
  - Composants UI dans `src/components/` et pages dans `src/pages/`.
  - Notifications globales via `src/context/ToastContext.jsx` + `useToast()`.

- Points d'intégration externes
  - Supabase (Postgres + Auth + RLS). Variables d'environnement attendues:
    `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` (voir README/GUIDE).
  - Fichiers SQL importants: `schema.sql` (structure, RLS) et `seed.sql`.

- Conventions du projet (importantes à suivre)
  - Services async retournent toujours `{ data, error }` (pattern supabase-js).
  - JSDoc utilisé dans `src/services/*.js` — conservez la documentation en
    ajoutant `@param`/`@returns` lorsque vous modifiez la logique.
  - Hooks exposent `loading`, `data` et des méthodes CRUD (ex: `createEntry`)
    — utilisez-les depuis les composants pages.
  - Components: fichiers UI → `.jsx`; logique/service → `.js`.
  - Texte UI en portugais, mais noms de variables/fonctions en anglais.

- Flux métier critiques (exemples concrets à connaître)
  - Créer uma despesa (entries):
    1) `EntryForm.jsx` valide (valor>0, conta selecionada, categoria, etc.).
    2) `entriesService.insertEntry()` insere em `entries` via Supabase.
    3) `applyEntryEffects()` atualiza saldo da conta e incrementa `limits`.

  - Editar uma despesa:
    1) `revertEntryEffects()` desfaz efeitos anteriores (saldo, limite).
    2) UPDATE na tabela `entries`.
    3) `applyEntryEffects()` aplica os novos efeitos.

- Règles sensibles
  - Não modifique `schema.sql` sem atualizar as policies RLS correspondentes.
  - Não remover RLS: as queries e services assumem `user_id` isolado pelo banco.

- Commandes de développement utiles
  - npm install
  - npm run dev  (démarrer le serveur Vite — http://localhost:5173)
  - npm run build / npm run preview
  - Copier `.env.example` → `.env` et remplir `VITE_SUPABASE_*` avant d'exécuter.

- Patterns de code utiles à exemplifier
  - Service pattern: garder toute la logique métier (apply/revert effects)
    dans `src/services/entriesService.js`, pas dans os componentes.
  - Notifications: utiliser `const { addToast } = useToast()` après opérations
    CRUD pour messages utilisateur.
  - Charts: `src/pages/Reports.jsx` utilise `recharts` — conservez format
    `pt-BR` pour formatação monetária.

- Ce qu'il faut vérifier avant PR
  - Build local (`npm run build`) passe.
  - Tests manuels listés dans `GUIDE.md` (flux de conta → limite → despesa).
  - Não quebrar policies do Supabase (ver `schema.sql`).
  - Preserver JSDoc nas funções modificadas.

- Raccourci: fichiers-clé à ouvrir quand on arrive sur le repo
  - `src/services/entriesService.js` — logique d'effet (apply/revert)
  - `src/services/accountsService.js` — proteção de deleção
  - `src/services/limitsService.js` — cálculo do percentual e níveis de alerta
  - `src/context/ToastContext.jsx` et `src/components/ToastContainer.jsx`
  - `GUIDE.md` / `IMPLEMENTATION.md` / `README.md` para tests e overview

Si quelque chose n'est pas clair ou si vous voulez que j'ajoute des
exemples de PR/commits ou des snippets précis à cet aide-mémoire, dites-le
et j'itérerai rapidement.
