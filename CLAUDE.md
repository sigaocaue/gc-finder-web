# CLAUDE.md — Instruções para o Claude Code CLI

Este arquivo define as regras de comportamento, padrões de código e convenções que o Claude Code deve seguir **em todas as interações** neste projeto.

---

## 🌐 Idioma e Comunicação

- **Todas as respostas, explicações, perguntas e mensagens do Claude devem ser em português brasileiro (pt-BR)**, independentemente do idioma em que a pergunta foi feita
- Use acentuação correta em português: ã, é, ç, ó, etc.
- Seja direto e objetivo nas explicações

---

## 💻 Idioma do Código

- **Todo o código gerado deve estar em inglês**: nomes de variáveis, funções, componentes, interfaces, tipos, arquivos e pastas
- **Comentários em código** que explicam trechos relevantes ou não óbvios devem estar em **português brasileiro**, com acentuação correta
- Exemplo correto:
  ```tsx
  // Busca o GC mais próximo com base no CEP informado pelo usuário
  async function fetchNearbyGc(zipCode: string) {
    ...
  }
  ```
- Nunca usar `any` no TypeScript — tipagem estrita em todo o projeto
- Nunca usar `console.log` em produção

---

## 📝 Mensagem de Commit

- Ao final de cada execução que **criar ou modificar arquivos** no projeto, o Claude deve informar a mensagem de commit recomendada
- A mensagem de commit deve estar em **inglês** e seguir o padrão **Conventional Commits**:
  ```
  <tipo>(<escopo>): <descrição curta em inglês>
  ```
- Tipos válidos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`
- Exemplos:
  ```
  feat(map): add Google Maps integration with GC pins
  feat(admin): add GC create and edit form
  fix(auth): fix refresh token interceptor on 401
  chore(deps): add react-hook-form and zod
  style(home): adjust hero section spacing on mobile
  ```
- **Não gere mensagem de commit** quando a tarefa não envolver criação ou alteração de arquivos (ex: perguntas, explicações, consultas)

---

## 🏗️ Padrões de Arquitetura

- Framework: **Next.js 15** com App Router
- Linguagem: **TypeScript** com tipagem estrita (`strict: true` no tsconfig)
- Estilização: **Tailwind CSS v4** — usar apenas classes utilitárias, sem CSS inline desnecessário
- Componentes UI: **shadcn/ui** — instalar componentes individualmente conforme necessário
- Requisições HTTP: **TanStack Query** para dados do servidor + `fetch` nativo
- Formulários: **React Hook Form** + **Zod** para validação
- Notificações: **sonner** para toasts
- Ícones: **Lucide React**
- Mapa: **@vis.gl/react-google-maps**
- Tema: **next-themes** (dark/light toggle)

---

## 🗂️ Organização de Arquivos

```
gc-finder-web/
├── app/                     → Rotas do Next.js App Router
│   ├── (public)/            → Grupo de rotas públicas
│   │   ├── page.tsx         → Home (mapa + busca por CEP)
│   │   ├── gcs/[id]/        → Detalhe do GC
│   │   └── interesse/       → Formulário de interesse
│   ├── admin/               → Rotas protegidas do painel admin
│   │   ├── login/
│   │   ├── gcs/
│   │   └── lideres/
│   ├── layout.tsx           → Layout raiz
│   └── globals.css          → Estilos globais + variáveis Tailwind
├── components/
│   ├── ui/                  → Componentes shadcn/ui (gerados automaticamente)
│   ├── map/                 → Componentes relacionados ao mapa
│   ├── gc/                  → Componentes de GC (card, detalhe, etc.)
│   ├── admin/               → Componentes do painel admin
│   ├── forms/               → Formulários reutilizáveis
│   └── layout/              → Header, Footer, Sidebar, etc.
├── lib/
│   ├── api.ts               → Funções de chamada à API (fetch wrapper)
│   ├── auth.ts              → Lógica de autenticação e tokens
│   ├── utils.ts             → Utilitários gerais (gerado pelo shadcn/ui)
│   └── validations/         → Schemas Zod reutilizáveis
├── hooks/                   → Custom hooks (useNearbyGc, useAuth, etc.)
├── types/                   → Interfaces e tipos TypeScript
├── middleware.ts             → Proteção de rotas /admin/*
├── .env.local.example       → Exemplo de variáveis de ambiente
├── README.md
├── SETUP.md
└── CLAUDE.md
```

---

## 🔐 Autenticação no Frontend

- Access token: armazenado **em memória** (Context ou variável de módulo) — nunca em localStorage
- Refresh token: armazenado em **cookie HttpOnly** via resposta do backend
- Middleware do Next.js protege todas as rotas `/admin/*` exceto `/admin/login`
- Interceptor de fetch renova o access token automaticamente ao receber 401
- Nunca expor o access token em logs ou no DOM

---

## 🌍 Variáveis de Ambiente

- `NEXT_PUBLIC_API_URL` — URL base da API do backend
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — chave da Google Maps JavaScript API
- Nunca commitar `.env.local` real — apenas `.env.local.example`
- Sempre atualizar `.env.local.example` ao adicionar novas variáveis

---

## ♿ Acessibilidade

- Labels em todos os inputs dos formulários
- `aria-label` em botões que contêm apenas ícones
- Contraste mínimo WCAG AA
- `alt` em todas as imagens
- Foco visível em todos os elementos interativos

---

## 📱 Responsividade

- Mobile-first: desenvolver primeiro para mobile, depois adaptar para desktop
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- Sidebar do admin: drawer no mobile, fixa no desktop
- Tabelas do admin: cards empilhados no mobile

---

## ✅ Checklist antes de finalizar qualquer tarefa

Antes de concluir uma tarefa, o Claude deve verificar:

- [ ] O código está em inglês (variáveis, funções, componentes)?
- [ ] Os comentários relevantes estão em português?
- [ ] Não há uso de `any` no TypeScript?
- [ ] Não há `console.log` no código?
- [ ] Nenhuma chave ou variável sensível está hardcoded?
- [ ] O `.env.local.example` foi atualizado se novas variáveis foram adicionadas?
- [ ] Os componentes são responsivos (mobile-first)?
- [ ] Inputs de formulário têm labels e validação com Zod?
- [ ] A mensagem de commit foi informada (se houve criação/alteração de arquivos)?
