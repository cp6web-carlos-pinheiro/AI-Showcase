# Clima

Aplicação web para consultar o clima atual de uma cidade. A busca localiza a cidade e exibe as condições meteorológicas usando as APIs públicas do [Open-Meteo](https://open-meteo.com/).

## Funcionalidades

- Busca de cidades.
- Exibição das condições atuais, incluindo temperatura, sensação térmica, umidade, probabilidade de precipitação e vento.
- Interface em português.
- Layout adaptável a diferentes tamanhos de tela.

## Tecnologias

- TypeScript
- Vite
- Vitest
- Open-Meteo Geocoding API e Forecast API

## Requisitos

- Node.js 22 ou superior.
- npm.

## Desenvolvimento local

Na pasta `weather-app/weather-app-web`, instale as dependências e inicie o servidor de desenvolvimento:

```bash
npm ci
npm run dev
```

O Vite exibirá no terminal o endereço local para abrir no navegador.

## Testes e build

```bash
# Executar os testes unitários
npm test

# Iniciar os testes em modo de observação
npm run test:watch

# Gerar o build de produção
npm run build

# Visualizar localmente o build de produção
npm run preview
```

O build de produção é gerado na pasta `dist/`.

## Deploy no GitHub Pages

O workflow [deploy-weather-app.yml](../../.github/workflows/deploy-weather-app.yml) compila e publica o app no GitHub Pages quando há um push na branch `main`. Também é possível iniciá-lo manualmente pela aba **Actions** do repositório.

Para habilitar a publicação:

1. No repositório, acesse **Settings → Pages**.
2. Em **Build and deployment → Source**, selecione **GitHub Actions**.
3. Envie as alterações para a branch `main` ou execute o workflow manualmente pela aba **Actions**.
4. Acompanhe a execução do workflow até os passos de build e deploy concluírem com sucesso.

O site do projeto é publicado em:

<https://cp6web-carlos-pinheiro.github.io/AI-Showcase/>

O Vite usa o caminho-base `/AI-Showcase/` no GitHub Actions para que os recursos estáticos funcionem no endereço do projeto; localmente, o caminho-base permanece `/`.
