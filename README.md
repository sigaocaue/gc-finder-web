# GC Finder Web

Aplicação frontend em Next.js 16.1 + React 19 que ajuda visitantes e membros da Igreja Batista da Lagoinha de Jundiaí a localizar, conhecer e registrar interesse em Grupos de Crescimento (GCs) próximos ao CEP informado. O projeto oferece uma experiência pública com mapa interativo e formulários acolhedores, além de um painel administrativo com autenticação, CRUD e importação assistida por imagem.

## Badges
![Next.js 16.1.6](https://img.shields.io/badge/Next.js-16.1.6-black)
![React 19.2.3](https://img.shields.io/badge/React-19.2.3-blue)
![TypeScript 5](https://img.shields.io/badge/TypeScript-5.0-blueviolet)
![License MIT](https://img.shields.io/badge/License-MIT-brightgreen)

## Funcionalidades
- Busca por CEP com validação e feedbacks via `sonner`, centraliza o mapa e destaca o GC mais próximo com cards contextuais.
- Mapa público baseado em `@vis.gl/react-google-maps` que carrega marcadores para todos os GCs disponibilizados pela API e abre `InfoWindow` com link para detalhes.
- Página de detalhe do GC com localização, horários, responsáveis com contatos clicáveis (WhatsApp, email) e galeria de mídias com lightbox.
- Formulário de interesse enriquecido (React Hook Form + Zod) que envia dados ao endpoint público e redireciona com toast de confirmação.
- Painel administrativo com login protegido por middleware, dashboard com métricas, busca inteligente, tabela responsiva, cards mobile e ações de ativação/exclusão.
- Formulário de GC completo (dados básicos, endereço com busca ViaCEP, encontros, líderes e mídias) e páginas dedicadas para criar/editar.
- Fluxo de importação por imagem com SSE (hooks/useGcImageImport + lib/api/gc-import) que acompanha status, permite revisão dos dados extraídos e salva no backend.
- Toggles de tema light/dark persistidos (`next-themes`), toasts (`sonner`), animações (`framer-motion`) e componentes `shadcn/ui` com design system inspirado na Lagoinha.

## Demonstração
- `http://localhost:3000` → Home com hero, campo de CEP, mapa e CTA para o formulário de interesse.
- `http://localhost:3000/gcs/[id]` → Página de detalhe de um GC carregado pela API — mostra endereço, encontros, líderes, mídias e CTA para registrar interesse.
- `http://localhost:3000/interesse` → Formulário completo que envia dados ao endpoint `/public/interest` e redireciona automaticamente após sucesso.
- `http://localhost:3000/admin/login` → Login administrativo que grava refresh token em cookie e usa middleware para proteger `/admin/*`.
- `http://localhost:3000/admin` → Dashboard com cards de estatísticas e atalho para `GCs`, `Líderes`, `Usuários` e `Importar por imagem`.
- `http://localhost:3000/admin/gcs/importar` → Passos de upload/URL, monitoramento SSE, revisão dos dados extraídos e confirmação com feedback animado.

## Tecnologias
- **Next.js 16.1.6** com App Router, middleware customizado e rewrites internos para rotas amigáveis.
- **React 19.2.3** + **TypeScript 5** com tipagem estrita (`types/`, `types/gc-import.ts`).
- **Tailwind CSS 4** e **shadcn/ui** em cima de componentes Radix e `lucide-react` para ícones.
- **TanStack Query** para cache, estados de loading e refetch automático; **axios** com interceptors para refresh tokens.
- **React Hook Form + Zod** para todos os formulários públicos e administrativos.
- **@vis.gl/react-google-maps** alimentado por `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
- **Framer Motion** para transições suaves, **sonner** para toasts e **next-themes** para tema persistido.
- **Custom hooks** (`useGcImageImport`) e **API helpers** (`lib/api.ts`, `lib/api/gc-import.ts`).

## Organização do projeto
- `app/(public)` → layout público com `Header`, `Footer`, `Home`, planos de interesse e rotas de detalhe.
- `app/admin` → dashboard protegido com `AdminSidebar`, `AdminToolbar`, listagens de GCs, usuários e fluxo de importação.
- `components/home`, `components/map`, `components/gc` → blocos reutilizáveis (hero, mapa, cards, CTA, formulários de detalhes).
- `components/admin` → sidebar, toolbar, formulário avançado de GC e passos da importação por imagem.
- `components/providers.tsx` → `ThemeProvider`, `TanStack Query` e `Toaster` compartilhados.
- `hooks/useGcImageImport.ts` + `lib/api/gc-import.ts` → SSE, fallback, upload/URL e salvamento automatizado.
- `lib/api.ts` → Axios configurado com refresh token, logout, ViaCEP e método `api()` usado em todo o projeto.
- `types/` → DTOs públicos e administrativos, incluindo `GcResponse`, `LeaderResponse`, estatísticas e os tipos do fluxo de importação.
- `.env.example` → variáveis obrigatórias (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_SITE_URL`).

## Licença
MIT License — veja o arquivo `LICENSE`.
