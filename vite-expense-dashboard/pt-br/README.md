# Painel de despesas

Painel simples para registrar despesas e acompanhar o total geral e o total por categoria.
Feito com Vite + TypeScript (vanilla), HTML e CSS. Os requisitos estão em [`prd.md`](./prd.md).

## Como rodar

Requisito: Node.js 20.19+ (ou 22.12+).

```bash
npm install
npm run dev
```

Abra o endereço exibido no terminal (normalmente http://localhost:5173).

## Outros comandos

```bash
npm run build     # verifica os tipos e gera a versão de produção em dist/
npm run preview   # serve a versão de produção localmente
```

## Estrutura

```
index.html      estrutura da página (sem eventos inline)
src/types.ts    todos os types (Categoria, Despesa)
src/main.ts     estado, renderização e eventos
src/style.css   estilos
```

Os dados ficam apenas em memória: ao recarregar a página, a lista é zerada.
