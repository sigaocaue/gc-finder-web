# GC Finder — Frontend

> Aplicação web para localização de Grupos de Crescimento (GCs) da Igreja Batista da Lagoinha de Jundiaí, permitindo que qualquer pessoa encontre o GC mais próximo da sua casa pelo CEP e visualize os grupos em um mapa interativo.

---

## 1. Visão Geral

### Objetivo
Oferecer uma interface simples, acolhedora e intuitiva onde qualquer pessoa possa digitar seu CEP e encontrar o GC mais próximo de sua casa, visualizar todos os GCs no mapa, conhecer os responsáveis de cada GC e registrar seu interesse em participar. O painel administrativo (rota protegida) permite gerenciar os cadastros de GCs, responsáveis, encontros e mídias.

### Público-alvo
- **Visitantes/membros:** Pessoas que desejam encontrar um GC próximo de casa — público geral, não técnico
- **Administradores:** Líderes e responsáveis da Lagoinha Jundiaí que gerenciam os cadastros dos GCs

### Referências visuais
- Site da Lagoinha Global: https://l2.lagoinha.com 
- Site da Lagoinha Jundiaí: https://lagoinhajundiai.com.br/
- Google Maps embed com pins — referência para a experiência de mapa interativo
- Churchbase / MinistryPlatform — painéis administrativos para igrejas

---

## 2. Stack Técnica

```
Framework:        Next.js 15 (App Router)
Linguagem:        TypeScript
Estilização:      Tailwind CSS v4
Componentes UI:   shadcn/ui
Gerenc. estado:   useState / Context API (leve, sem Redux)
Requisições HTTP: TanStack Query (React Query) + fetch nativo
Roteamento:       Next.js App Router
Mapas:            Google Maps JavaScript API (@vis.gl/react-google-maps)
Animações:        Tailwind transitions + Framer Motion (sutil)
Formulários:      React Hook Form + Zod
Bundler:          Next.js (Turbopack)
Tema:             next-themes (dark/light toggle)
Ícones:           Lucide React
Notificações:     sonner (toast)
```

---

## 3. Design System

### Paleta de cores

```
Primária:         #1A5276  (azul Lagoinha — botões principais, links, destaques)
Primária clara:   #2E86C1  (hover states, elementos secundários)
Primária suave:   #D6EAF8  (backgrounds sutis, badges, tags)
Acento cálido:    #E67E22  (CTAs de destaque, ícones de ação — laranja acolhedor)
Background:       #FFFFFF  (light) / #0F172A (dark)
Superfície:       #F8FAFC  (light) / #1E293B (dark) — cards, modais
Borda:            #E2E8F0  (light) / #334155 (dark)
Texto principal:  #1E293B  (light) / #F1F5F9 (dark)
Texto secundário: #64748B  (light) / #94A3B8 (dark)
Erro:             #DC2626
Sucesso:          #16A34A
Aviso:            #D97706
```

### Tipografia

```
Fonte display:    Inter — títulos e headings (peso 600–700)
Fonte corpo:      Inter — textos corridos (peso 400–500)
```

> Tom: acolhedor, legível, sem serifa — transmite modernidade com calor humano

### Tema
- [x] Light
- [x] Dark
- [x] Ambos com toggle (persistido via next-themes + localStorage)

### Tom visual geral
Acolhedor, comunitário, limpo. Sem excessos visuais. Transmite confiança e pertencimento — como uma comunidade que abraça quem chega. Uso moderado de cor, boa hierarquia tipográfica, ícones amigáveis.

### Espaçamento e bordas
```
Border radius:  médio (8px padrão, 12px em cards, pill em badges)
Densidade:      normal
Sombras:        sutis (shadow-sm em cards, shadow-md em modais)
```

---

## 4. Estrutura de Páginas e Rotas

```
/                        → Home — mapa com pins de todos os GCs + busca por CEP
/gcs/[id]               → Detalhe de um GC específico
/interesse              → Formulário de interesse em participar de um GC
/admin                  → Painel admin — redirect para /admin/gcs se autenticado
/admin/login            → Login do administrador
/admin/gcs              → Lista de GCs (CRUD)
/admin/gcs/novo         → Cadastro de novo GC
/admin/gcs/[id]         → Edição de GC existente
/admin/lideres          → Lista de responsáveis (CRUD)
/admin/lideres/novo     → Cadastro de novo responsável
/admin/lideres/[id]     → Edição de responsável existente
```

---

## 5. Páginas — Detalhamento

### Página: Home
**Rota:** `/`
**Propósito:** Ponto de entrada principal. O usuário vê o mapa com os pins de todos os GCs e pode buscar pelo CEP para encontrar o mais próximo.

**Layout:**
```
+------------------------------------------+
|           HEADER (logo + tema toggle)    |
+------------------------------------------+
|   HERO — título + campo de busca CEP     |
|   [Digite seu CEP] [Buscar]              |
+------------------------------------------+
|                                          |
|        MAPA GOOGLE (pins dos GCs)        |
|   Ao clicar num pin → card lateral/popup |
|   com detalhes do GC                    |
|                                          |
+------------------------------------------+
|   SEÇÃO "Como funciona" (3 passos)       |
+------------------------------------------+
|   SEÇÃO CTA → "Quero participar"         |
+------------------------------------------+
|              FOOTER                      |
+------------------------------------------+
```

**Componentes presentes:**
- Header com logo da Lagoinha Jundiaí, toggle de tema
- Hero com headline acolhedora + campo de input de CEP com botão de busca
- Mapa Google Maps com pins em cada GC ativo
- InfoWindow (popup nativo do Google Maps) ao clicar em um pin — exibe nome, bairro e botão "Ver detalhes"
- Card lateral (drawer no mobile) exibindo o GC mais próximo ao buscar por CEP
- Seção explicativa "Como funciona" com 3 steps ilustrados
- CTA para a página de interesse
- Footer com créditos e link para a Lagoinha Jundiaí

**Estados desta página:**
- Loading: skeleton no lugar do mapa + spinner no botão de busca
- CEP não encontrado: toast de erro "CEP não encontrado. Verifique e tente novamente."
- Nenhum GC na região: mensagem inline amigável com CTA para registrar interesse
- Sucesso na busca: mapa centraliza no GC mais próximo e abre o card com detalhes

---

### Página: Detalhe do GC
**Rota:** `/gcs/[id]`
**Propósito:** Exibir todos os detalhes de um GC: endereço, dias/horários, responsáveis e mídias.

**Layout:**
```
+------------------------------------------+
|           HEADER                         |
+------------------------------------------+
|  Breadcrumb: Home > GCs > [Nome do GC]   |
+------------------------------------------+
|  NOME DO GC + badges (cidade, dia)       |
|                                          |
|  MAPA pequeno (localização do GC)        |
|                                          |
|  ENDEREÇO COMPLETO                       |
|                                          |
|  ENCONTROS (dia da semana + horário)     |
|                                          |
|  RESPONSÁVEIS (foto, nome, contatos)     |
|    WhatsApp | Instagram | Email          |
|                                          |
|  GALERIA DE MÍDIAS (fotos/posts IG)      |
|                                          |
|  CTA: "Quero participar deste GC"        |
+------------------------------------------+
|              FOOTER                      |
+------------------------------------------+
```

**Componentes presentes:**
- Breadcrumb de navegação
- Badge de cidade e dia do encontro
- Mini mapa estático (Google Maps embed) com o pin do GC
- Card de endereço com ícone de localização
- Lista de encontros (dia da semana + horário) com ícone de calendário
- Cards de responsáveis com foto, nome e ícones de contato clicáveis (WhatsApp abre link `wa.me`, Instagram abre perfil)
- Galeria de mídias (grid de imagens ou embeds de posts do Instagram)
- Botão CTA "Quero participar" → redireciona para `/interesse?gc_id=[id]`

**Estados desta página:**
- Loading: skeletons em todos os blocos
- GC não encontrado: página 404 amigável com link para voltar ao mapa
- Sem mídias: seção de galeria oculta

---

### Página: Interesse
**Rota:** `/interesse`
**Propósito:** Formulário para o visitante registrar interesse em participar de um GC. O backend envia os dados ao formulário oficial da Lagoinha.

**Layout:**
```
+------------------------------------------+
|           HEADER                         |
+------------------------------------------+
|  Título: "Quero participar de um GC"     |
|  Subtítulo explicativo                   |
|                                          |
|  FORMULÁRIO:                             |
|    Nome completo *                       |
|    Email *                               |
|    Telefone/WhatsApp *                   |
|    CEP *                                 |
|    Mensagem (opcional)                   |
|    [Enviar interesse]                    |
+------------------------------------------+
|              FOOTER                      |
+------------------------------------------+
```

**Componentes presentes:**
- Formulário com React Hook Form + Zod
- Máscara de CEP e telefone (input mascarado)
- Botão de envio com estado de loading
- Toast de sucesso após envio
- Link para voltar ao mapa

**Estados desta página:**
- Loading no envio: botão desabilitado + spinner
- Sucesso: toast verde "Seu interesse foi registrado! Em breve entraremos em contato." + redirect para home após 3s
- Erro: toast vermelho com mensagem genérica amigável

---

### Página: Admin — Login
**Rota:** `/admin/login`
**Propósito:** Autenticação do administrador com email e senha.

**Layout:**
```
+------------------------------------------+
|  Logo centralizado                       |
|  Card centralizado na tela:              |
|    Email *                               |
|    Senha *                               |
|    [Entrar]                              |
+------------------------------------------+
```

**Componentes presentes:**
- Card centralizado (vertical e horizontal)
- Formulário com React Hook Form + Zod
- Feedback de erro inline ("Email ou senha incorretos")

---

### Página: Admin — Lista de GCs
**Rota:** `/admin/gcs`
**Propósito:** Listar, buscar, ativar/desativar e navegar para criação/edição de GCs.

**Layout:**
```
+------------------------------------------+
|  SIDEBAR (nav admin) | CONTEÚDO          |
|                      |                   |
|  - GCs               | Título + [+ Novo] |
|  - Responsáveis      | Busca/filtro      |
|  - Sair              | Tabela de GCs     |
|                      |   nome, cidade,   |
|                      |   status, ações   |
|                      | Paginação         |
+------------------------------------------+
```

**Componentes presentes:**
- Sidebar de navegação admin (colapsável no mobile)
- Botão "Novo GC"
- Input de busca por nome ou cidade
- Tabela com colunas: Nome, Cidade, Status (badge ativo/inativo), Ações (editar, ativar/desativar)
- Modal de confirmação para desativar GC
- Paginação

---

### Página: Admin — Cadastro/Edição de GC
**Rota:** `/admin/gcs/novo` e `/admin/gcs/[id]`
**Propósito:** Formulário completo para criar ou editar um GC.

**Seções do formulário:**
1. **Dados básicos:** Nome do GC, Descrição
2. **Endereço:** CEP (preenchimento automático dos demais campos via ViaCEP), Número, Complemento
3. **Encontros:** Lista dinâmica — adicionar/remover encontros (dia da semana + horário + observações)
4. **Responsáveis:** Seleção múltipla de líderes já cadastrados + marcar líder principal
5. **Mídias:** Lista dinâmica de URLs (imagem, post do Instagram, vídeo) com caption e ordem

---

## 6. Componentes Globais

### Navegação pública
- Tipo: Topbar simples
- Itens: Logo (link para `/`), toggle de tema (light/dark)
- Comportamento mobile: mesmo topbar, logo centralizado

### Navegação admin
- Tipo: Sidebar fixa no desktop, drawer no mobile
- Itens: GCs, Responsáveis, botão Sair
- Badge de usuário logado no topo da sidebar

### Header público
- Logo da Lagoinha Jundiaí (texto ou imagem SVG) à esquerda
- Toggle de tema à direita

### Footer público
- Texto: "Desenvolvido com ♥ para a comunidade da Lagoinha Jundiaí"
- Link discreto para o site oficial da Lagoinha
- Copyright

### Modais e Drawers
- Confirmação de desativação de GC/responsável (modal com shadcn/ui AlertDialog)
- Card lateral (Sheet do shadcn/ui) com detalhes do GC ao clicar no pin do mapa (mobile)

### Notificações / Toasts
- Biblioteca: sonner
- Posição: canto superior direito
- Tipos: sucesso (verde), erro (vermelho), aviso (amarelo), info (azul)

---

## 7. Funcionalidades e Interações

### Lista de funcionalidades

| Funcionalidade | Descrição | Prioridade |
|---|---|---|
| Mapa com pins dos GCs | Google Maps com marcadores em cada GC ativo | Alta |
| Busca por CEP | Input de CEP → retorna GC mais próximo centralizado no mapa | Alta |
| Detalhe do GC | Página com todos os dados, responsáveis e mídias | Alta |
| Formulário de interesse | Envia dados para o backend repassar ao Google Forms | Alta |
| Login admin | Autenticação JWT com refresh token | Alta |
| CRUD de GCs | Criar, listar, editar, ativar/desativar GCs | Alta |
| CRUD de responsáveis | Criar, listar, editar, ativar/desativar líderes | Alta |
| Toggle dark/light | Persiste preferência do usuário | Média |
| Galeria de mídias do GC | Grid de fotos e embeds de Instagram | Média |
| Preenchimento automático de endereço | Ao digitar CEP no admin, preenche rua/bairro/cidade via ViaCEP | Alta |

### Formulários — campos

**Busca por CEP (Home):**
```
Campo:        cep
Tipo:         text (com máscara 00000-000)
Validação:    obrigatório, exatamente 8 dígitos numéricos
Placeholder:  "Digite seu CEP..."
```

**Formulário de interesse:**
```
Campo:        name         | Tipo: text     | obrigatório, mín. 3 chars
Campo:        email        | Tipo: email    | obrigatório, formato válido
Campo:        phone        | Tipo: text     | obrigatório, máscara de telefone BR
Campo:        zip_code     | Tipo: text     | obrigatório, máscara de CEP
Campo:        message      | Tipo: textarea | opcional
```

**Login admin:**
```
Campo:        email        | Tipo: email    | obrigatório
Campo:        password     | Tipo: password | obrigatório
```

### Autenticação no frontend
- Access token armazenado em memória (variável de módulo ou Context)
- Refresh token armazenado em cookie HttpOnly (preferencialmente) ou localStorage
- Interceptor do fetch renova o access token automaticamente ao receber 401
- Middleware do Next.js protege todas as rotas `/admin/*` exceto `/admin/login`

### Dados e Estado
- Dados vindos da API REST do backend (`gc-finder-api`)
- TanStack Query para cache, loading states e refetch automático
- Variável de ambiente `NEXT_PUBLIC_API_URL` para a URL base da API
- Variável de ambiente `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` para o mapa

---

## 8. Responsividade

```
Mobile:   320px–767px   → mapa ocupa tela cheia, busca por CEP no topo como barra,
                           detalhes do GC em drawer (Sheet), sidebar admin vira drawer
Tablet:   768px–1023px  → layout similar ao desktop com ajustes de padding
Desktop:  1024px+       → layout principal com mapa grande, sidebar admin fixa
```

Comportamentos específicos no mobile:
- Ao clicar em um pin no mapa → abre um Sheet (drawer bottom) com os detalhes do GC
- Sidebar do admin → botão hambúrguer abre drawer lateral
- Tabela do admin → cards empilhados no lugar de tabela
- Galeria de mídias → carrossel horizontal no mobile, grid no desktop

---

## 9. Acessibilidade

- [x] Suporte a navegação por teclado (todos os elementos interativos focáveis)
- [x] Labels em todos os inputs dos formulários
- [x] Contraste mínimo WCAG AA (verificado na paleta de cores escolhida)
- [x] Textos alternativos em imagens (fotos de responsáveis e mídias dos GCs)
- [x] Foco visível nos elementos interativos (ring de foco do Tailwind/shadcn)
- [x] Atributos `aria-label` nos botões de ícone (WhatsApp, Instagram, etc.)

---

## 10. Animações e Microinterações

- [x] Sutil (transições suaves, fades)

Animações específicas:
- Entrada de página: fade-in suave (Framer Motion, 200ms)
- Abertura do card/drawer de GC: slide-up no mobile, fade no desktop
- Hover em cards de GC: elevação sutil (shadow aumenta) + leve scale (1.01)
- Loading de dados: skeleton shimmer (shadcn/ui Skeleton)
- Botões: transição de cor no hover (150ms ease)
- Toast: slide-in da direita (comportamento padrão do sonner)
- Pins do mapa: bounce suave ao carregar (animação nativa do Google Maps)

---

## 11. O que NÃO quero

- Não usar fontes serifadas — manter Inter em todo o projeto
- Não usar gradientes chamativos ou efeitos neon
- Não usar layout de 3 colunas na área pública
- Não usar parallax ou animações excessivas que distraiam
- Não exibir dados técnicos (IDs, slugs, erros de API) para o usuário final
- Não usar `any` no TypeScript — tipagem estrita em todo o projeto
- Não usar `console.log` em produção
- Não commitar `.env.local` real — apenas `.env.local.example`
- Não usar bibliotecas de mapa alternativas ao Google Maps (Leaflet, Mapbox, etc.)
- Não criar página de cadastro pública de usuário — acesso admin é controlado pelo backend

---

## 12. Contexto Adicional

- O repositório do frontend será separado do backend (`gc-finder-web`)
- A API base URL virá de variável de ambiente `NEXT_PUBLIC_API_URL`
- O projeto é open source (MIT) — código bem organizado e comentado para facilitar contribuições
- Inicialmente cobre apenas os GCs da **Lagoinha Jundiaí** e região (Itupeva, Francisco Morato, Campo Limpo Paulista, etc.)
- O `CLAUDE.md` deste repositório define as regras de comportamento do Claude Code para o frontend
- Todo o código deve estar em **inglês** (variáveis, funções, componentes, arquivos)
- Comentários em trechos relevantes devem estar em **português brasileiro** com acentuação correta
- Encoding UTF-8 em todos os arquivos
- Assim que o backend estiver funcional, os dados mockados devem ser substituídos pela API real
