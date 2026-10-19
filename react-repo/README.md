# CP6 Web — Carlos Pinheiro

Dashboard em React 19 + TypeScript + Tailwind CSS v4 (Vite).

## Scripts

```bash
npm install
npm run dev      # servidor de desenvolvimento
npm run build    # type-check + build de produção
npm run lint     # oxlint
```

## Estrutura

```
src/
├── app/                 # composição da aplicação (layout, providers, rotas futuras)
├── components/
│   ├── icons/           # ícones customizados no padrão Lucide
│   └── ui/              # componentes genéricos (Button, Card, StatCard)
├── features/            # módulos por domínio
│   └── customers/
│       ├── api/
│       │   ├── *.dto.ts      # contrato cru da API (snake_case)
│       │   ├── *.mapper.ts   # DTO → modelo de domínio
│       │   ├── *.mock.ts     # mock no formato DTO
│       │   └── *.service.ts  # ponto de entrada (mock ou HTTP)
│       ├── components/  # componentes específicos da feature
│       ├── config/      # mapeamentos de UI (ex.: ícone por métrica)
│       ├── hooks/       # hooks de dados/estado da feature
│       └── index.ts     # API pública da feature
├── config/              # env tipado
├── lib/                 # utilitários (cn, formatadores, cliente HTTP)
├── styles/              # CSS global e design tokens (@theme)
└── types/               # tipos compartilhados
```

Imports usam o alias `@/` → `src/`.

## Dados: mock x API real

Copie `.env.example` para `.env` e ajuste:

```bash
VITE_API_BASE_URL=https://api.example.com
VITE_USE_MOCKS=false
```

A UI consome apenas o modelo de domínio (`src/types`). Se o contrato do backend mudar, só os arquivos `*.dto.ts` e `*.mapper.ts` precisam de ajuste.
