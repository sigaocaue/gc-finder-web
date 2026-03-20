# Setup técnico

## Pré-requisitos
- **Node.js 20.x** ou superior (necessário para compatibilidade com Next.js 16.1 e React 19). O projeto usa `npm` como gerenciador.
- **Backend `gc-finder-api`** rodando localmente ou em ambiente acessível, pois todas as rotas públicas e administrativas consumem `NEXT_PUBLIC_API_URL`.
- **Google Maps JavaScript API Key** com acesso ao Maps JavaScript (e opcionalmente Places) para renderizar o mapa público.
- **Ambiente compatível com fetch/ESM** (Next.js já exige isso). Não é necessário instalar ferramentas adicionais além das listadas.

## Instalação
1. Copie o arquivo de exemplo de variáveis de ambiente (ver seção abaixo):
   ```bash
   cp .env.example .env.local
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```

## Variáveis de ambiente
| Variável | Descrição | Exemplo |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | URL base da API REST do backend (`/api/v1`). | `http://localhost:3001` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Chave da Google Maps JavaScript API usada pelos componentes de mapa. | `AIza...` |
| `NEXT_PUBLIC_SITE_URL` | URL pública usada pelo metadata (opcional, mas recomendado). | `https://gc-finder.local` |

O projeto lê esses valores em tempo de build/dev. **Não versionar** arquivos com credenciais reais (`.env.local`, cookies etc.).

## Execução
- `npm run dev` → abre o servidor dev (rota principal em `http://localhost:3000`).
- `npm run build` → gera o build de produção.
- `npm run start` → inicia o servidor Next.js a partir do build.
- `npm run lint` → valida regras de lint (ESLint + plugins Next/React).
- `npm run format:check` → verifica formatação com Prettier.

## Testes
Apesar de não haver suíte automatizada, use os comandos abaixo para garantir qualidade antes de subir mudanças:
1. `npm run lint`
2. `npm run format:check`

## Observações adicionais
- A rota `/admin/*` depende do middleware (`middleware.ts`) que exige o cookie `refresh_token`. Faça login em `/admin/login` para gerar o cookie antes de acessar o painel.
- A página de importação (`/admin/gcs/importar`) depende de SSE e do backend para extrair dados da imagem. Garanta que o endpoint `/gcs/import/image` esteja disponível.
- O mapa usa a chave do Google Maps e o backend (`/public/gcs`) para carregar os marcadores — sem elas, os componentes renderizam esqueleto.
- Para rodar em HTTPS ou domínios customizados, ajuste `NEXT_PUBLIC_SITE_URL` e `next.config.ts` (`allowedDevOrigins`).
