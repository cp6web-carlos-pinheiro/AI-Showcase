# PRD — Projeto Clima

## 1. Visão geral

O **Clima** é uma aplicação web de página única. O usuário digita o nome de uma cidade e o app exibe as condições climáticas atuais daquela localidade: temperatura, sensação térmica, umidade, vento, probabilidade de precipitação, condição do tempo e se é dia ou noite.

- **Stack:** Vite + Vanilla + TypeScript
- **Testes:** Vitest + jsdom (unitários e integração) e Playwright (E2E), sempre com a rede mockada (ver seção 11)
- **Fonte de dados:** API Open-Meteo (Geocoding + Forecast), sem chave de API
- **Idioma da interface:** Português (PT-BR)
- **Escopo:** clima **atual** de uma cidade por vez. Fora do escopo: previsão por hora/dia, favoritos, histórico, múltiplas cidades, seleção de unidades.

## 2. Requisitos funcionais

### RF-01 — Busca de cidade
- O usuário digita o nome da cidade em um campo de busca e dispara a busca por **Enter** ou pelo **botão de buscar**.
- Não há busca automática ao digitar.
- Campo vazio (ou só espaços) não dispara busca.
- O nome digitado deve passar por `trim()` e `encodeURIComponent` antes de ir para a URL.

### RF-02 — Fluxo de busca (2 requisições, 1 ação para o usuário)
1. O usuário envia o nome da cidade.
2. O app chama o **Geocoding** e obtém `name`, `latitude`, `longitude`, `country_code` e `timezone`.
3. Com esses dados, o app chama o **Forecast** e obtém o clima atual.
4. O app exibe o resultado.

Para o usuário é **uma única busca**, com um único estado de loading cobrindo as duas requisições.

### RF-03 — Casos de falha ("não achou nada")
| Situação | Comportamento |
|---|---|
| Geocoding sem resultados (`results` ausente ou vazio) | Exibir o Empty State |
| Geocoding achou, mas o Forecast falhou (erro de rede, HTTP não-2xx, resposta inválida) | Exibir o Empty State |
| Forecast respondeu sem alguma propriedade obrigatória (ver 5.3) | Exibir o Empty State |

O app não deve mostrar dados parciais nem de buscas anteriores nesses casos.

### RF-04 — Estados da tela
- **Empty State:** estado inicial (nenhuma busca feita) e estado de "não encontrado". Mostra uma mensagem orientando o usuário a buscar uma cidade (pode variar o texto entre "inicial" e "não encontrado").
- **Loading:** exibido enquanto as duas requisições estão em andamento. O campo e o botão de busca ficam desabilitados para evitar buscas concorrentes.
- **Resultado:** card com sidebar e área principal preenchidos.

### RF-05 — Dados exibidos

**Sidebar (esquerda):**
- Temperatura (`temperature_2m`)
- Nome da cidade, código do país (ex.: `Rio de Janeiro, BR`)
- Dia atual (ver 7.4)
- Indicador dia/noite (baseado em `is_day`), com ícone sol/lua
- Weather Code, como texto em PT-BR + ícone SVG

**Área principal:**
- Umidade relativa (`relative_humidity_2m`)
- Temperatura aparente (`apparent_temperature`)
- Probabilidade de precipitação (`precipitation_probability`)
- Velocidade e direção do vento (`wind_speed_10m` e `wind_direction_10m`)

Todos os valores são exibidos com a unidade vinda de `current_units`, sem unidades fixas no código.

## 3. Requisitos de sistema (não funcionais)

- **Navegadores:** versões atuais de Chrome, Firefox, Safari e Edge.
- **Responsividade:** o layout deve funcionar em desktop e mobile (ver 7.5).
- **Sem backend:** todas as requisições partem do navegador. A Open-Meteo suporta CORS.
- **Sem chave de API.**
- **Desempenho:** nenhuma requisição além das duas do fluxo. Sem polling ou atualização automática.
- **Concorrência:** se uma nova busca for iniciada, a anterior deve ser cancelada (`AbortController`) ou ter sua resposta ignorada, para que uma resposta atrasada nunca sobrescreva uma mais nova.
- **Timeout:** requisições com timeout (sugestão: 10 s). Estourar o timeout cai no RF-03.
- **Acessibilidade:** campo com `label`, botão acessível por teclado, ícones com `aria-label`/`title` e contraste adequado nos dois temas da sidebar (dia/noite).
- **Segurança:** texto vindo da API (ex.: nome da cidade) nunca é inserido como HTML sem escape; usar `textContent` ou escapar antes de qualquer `innerHTML`.
- **Testabilidade:** toda regra de negócio e de UI tem teste automatizado. Testes automáticos nunca chamam a Open-Meteo real (ver seção 11).

## 4. Arquitetura e detalhes técnicos

### 4.1 Stack
- Vite + TypeScript (modo `strict`), sem framework de UI. DOM manipulado diretamente.
- CSS puro (arquivos `.css` importados pelo Vite), com variáveis CSS para cores e raios de borda.
- Base de partida: projeto inicial `weather-app-web` (Vite 8, TypeScript 6, template `vanilla-ts`). O código de demonstração do template é removido na T01.
- Testes: Vitest (+ jsdom) e Playwright. Os testes importam `describe`, `it`, `expect` e `vi` de `'vitest'` (sem globals), o que mantém o `tsconfig` com `"types": ["vite/client"]` e deixa o `tsc` do `npm run build` verificando também os arquivos de teste.

### 4.2 Estrutura sugerida
```
src/
  main.ts                 # bootstrap, eventos, orquestração do fluxo de busca
  main.test.ts            # integração do fluxo (fetch mockado)
  services/
    openMeteo.ts          # ÚNICO ponto de acesso à API
    openMeteo.test.ts
    openMeteo.live.test.ts  # contrato com a API real, opt-in (npm run test:live)
    isolation.test.ts     # garante que só openMeteo.ts faz fetch
  types/
    openMeteo.ts          # tipos das respostas e do modelo interno
  utils/
    weatherCode.ts        # WMO code -> { descrição PT-BR, ícone }
    weatherCode.test.ts
    format.ts             # data, vento, números
    format.test.ts
  ui/
    render.ts             # render dos estados (empty, loading, resultado)
    render.test.ts
    searchForm.ts         # campo + botão + evento de envio
    searchForm.test.ts
    icons.ts              # SVGs inline
    icons.test.ts
  styles/
    main.css
  test/
    fixtures/             # respostas reais da Open-Meteo (geocoding-rio.json, forecast-rio.json)
    helpers/              # mockFetch.ts, contrast.ts
e2e/
  *.spec.ts               # Playwright
index.html
vitest.config.ts
vitest.live.config.ts
playwright.config.ts
```

### 4.3 Regra central: isolamento da API
O projeto **não faz requisição direta** à API. Todo acesso passa pelas funções de `services/openMeteo.ts`. O restante do código só conhece essas funções e os tipos que elas retornam.

Funções previstas:

```ts
searchCity(name: string): Promise<City | null>
getCurrentWeather(params: { latitude: number; longitude: number; timezone: string }): Promise<CurrentWeather | null>
```

Regras dessas funções:
- **Validação de parâmetros:** se algum parâmetro obrigatório não vier (vazio, `undefined`, `null`, string só com espaços, ou número inválido/`NaN`), a função age como se não tivesse vindo e retorna `null`, **sem fazer a requisição**.
- Em falha de rede, HTTP não-2xx, JSON inválido, resposta sem os campos necessários ou timeout, a função retorna `null`. Ela não propaga exceção para a UI.
- As funções retornam apenas os campos de que o app precisa (ver 5), não a resposta bruta.
- As URLs-base e a lista de variáveis de `current` ficam como constantes dentro desse arquivo.

### 4.4 Orquestração
```
submit(nome)
  -> estado = loading
  -> city = await searchCity(nome)
  -> se city == null: estado = empty (não encontrado)
  -> weather = await getCurrentWeather(city)
  -> se weather == null: estado = empty (não encontrado)
  -> estado = resultado(city, weather)
```

### 4.5 Tratamento do Weather Code
- `utils/weatherCode.ts` mapeia cada código WMO para `{ descrição em PT-BR, ícone SVG }`.
- Código fora da tabela deve cair em um fallback genérico (ex.: "Condição desconhecida" + ícone neutro), sem quebrar a tela.
- Os ícones variam por dia/noite quando fizer sentido (ex.: céu limpo: sol de dia, lua à noite; parcialmente nublado: sol+nuvem de dia, lua+nuvem à noite).

## 5. Contratos da API

### 5.1 Geocoding — latitude, longitude e timezone a partir do nome

```
GET https://geocoding-api.open-meteo.com/v1/search?name={NOME_DA_CIDADE}&count=1&language=pt&format=json
```

- `{NOME_DA_CIDADE}` = texto digitado pelo usuário (com `trim` e URL-encoded).
- `count=1`: usa-se sempre o primeiro resultado.
- Campos necessários de `results[0]`:

| Campo | Uso |
|---|---|
| `name` | Nome da cidade exibido na sidebar |
| `latitude` | Parâmetro do Forecast |
| `longitude` | Parâmetro do Forecast |
| `country_code` | Código do país exibido na sidebar |
| `timezone` | Parâmetro do Forecast e formatação da data |

- Sem `results` ou com array vazio: equivale a "cidade não encontrada".

### 5.2 Forecast — clima atual

```
GET https://api.open-meteo.com/v1/forecast
  ?latitude={LATITUDE}
  &longitude={LONGITUDE}
  &current=precipitation_probability,temperature_2m,relative_humidity_2m,apparent_temperature,is_day,wind_speed_10m,wind_direction_10m,precipitation,weather_code
  &timezone={TIMEZONE}
```

- `{TIMEZONE}` deve ser URL-encoded (ex.: `America%2FSao_Paulo`).
- A resposta tem dois objetos relevantes:
  - `current_units`: unidades de cada propriedade
  - `current`: valores de cada propriedade

### 5.3 Propriedades obrigatórias de `current`
- `temperature_2m`
- `relative_humidity_2m`
- `apparent_temperature`
- `is_day`
- `wind_speed_10m`
- `wind_direction_10m`
- `precipitation_probability`

`weather_code` é necessário para a sidebar, e `time` para o "dia atual". `precipitation` é solicitada na URL, mas não é exibida (ver 8).

Se alguma propriedade obrigatória estiver ausente ou com tipo inválido, a função retorna `null` (RF-03).

`current_units` também é obrigatório: se estiver ausente, ou sem a unidade de alguma das seis propriedades exibidas (`temperature_2m`, `apparent_temperature`, `relative_humidity_2m`, `precipitation_probability`, `wind_speed_10m`, `wind_direction_10m`), a função retorna `null`, pois o código não tem unidades fixas (RF-05). `precipitation` não é obrigatória.

### 5.4 Modelo interno sugerido
```ts
interface City {
  name: string;
  latitude: number;
  longitude: number;
  countryCode: string;
  timezone: string;
}

interface CurrentWeather {
  time: string;                       // current.time (ISO, no fuso da cidade)
  temperature: number;                // temperature_2m
  apparentTemperature: number;        // apparent_temperature
  humidity: number;                   // relative_humidity_2m
  precipitationProbability: number;   // precipitation_probability
  windSpeed: number;                  // wind_speed_10m
  windDirection: number;              // wind_direction_10m (graus)
  isDay: boolean;                     // is_day === 1
  weatherCode: number;                // weather_code
  units: {
    temperature: string;
    apparentTemperature: string;
    humidity: string;
    precipitationProbability: string;
    windSpeed: string;
    windDirection: string;
  };
}
```

## 6. Tabela de Weather Code (WMO)

A tabela abaixo deve ser transformada em descrições PT-BR e ícones SVG em `weatherCode.ts`.

| Código | Descrição (original) | Sugestão PT-BR |
|---|---|---|
| 0 | Clear sky | Céu limpo |
| 1 | Mainly clear | Predominantemente limpo |
| 2 | Partly cloudy | Parcialmente nublado |
| 3 | Overcast | Nublado |
| 45 | Fog | Neblina |
| 48 | Depositing rime fog | Neblina com geada |
| 51 | Drizzle: light | Garoa fraca |
| 53 | Drizzle: moderate | Garoa moderada |
| 55 | Drizzle: dense | Garoa intensa |
| 56 | Freezing drizzle: light | Garoa congelante fraca |
| 57 | Freezing drizzle: dense | Garoa congelante intensa |
| 61 | Rain: slight | Chuva fraca |
| 63 | Rain: moderate | Chuva moderada |
| 65 | Rain: heavy | Chuva forte |
| 66 | Freezing rain: light | Chuva congelante fraca |
| 67 | Freezing rain: heavy | Chuva congelante forte |
| 71 | Snow fall: slight | Neve fraca |
| 73 | Snow fall: moderate | Neve moderada |
| 75 | Snow fall: heavy | Neve forte |
| 77 | Snow grains | Grãos de neve |
| 80 | Rain showers: slight | Pancadas de chuva fracas |
| 81 | Rain showers: moderate | Pancadas de chuva moderadas |
| 82 | Rain showers: violent | Pancadas de chuva violentas |
| 85 | Snow showers: slight | Pancadas de neve fracas |
| 86 | Snow showers: heavy | Pancadas de neve fortes |
| 95 | Thunderstorm: slight or moderate | Tempestade |
| 96 | Thunderstorm with slight hail | Tempestade com granizo fraco |
| 99 | Thunderstorm with heavy hail | Tempestade com granizo forte |

Sugestão de agrupamento de ícones (para não criar ~28 SVGs): céu limpo, parcialmente nublado, nublado, neblina, garoa, chuva, pancadas, neve, tempestade. A variação dia/noite se aplica a céu limpo e parcialmente nublado.

## 7. Instruções visuais (design e UX)

### 7.1 Layout geral
```
┌──────────────────────────────────────────────┐   fundo cinza escuro (página inteira)
│                                              │
│           [ campo de busca ] [Buscar]        │   área SUPERIOR centralizada, sem background
│                                              │
│        ┌──────────────────────────────┐      │
│        │ SIDEBAR │  ÁREA PRINCIPAL    │      │   card branco, borda bem arredondada,
│        │         │                    │      │   centralizado, largura máx. 800px
│        └──────────────────────────────┘      │
└──────────────────────────────────────────────┘
```

- **Fundo da página:** cinza escuro.
- **Área superior:** centralizada, contém **apenas** o campo de busca (mais o botão de buscar). **Sem background próprio.**
- **Card principal:** fundo branco, borda **bem arredondada** (sugestão: 24–32 px), centralizado horizontalmente, `max-width: 800px`, contendo a sidebar à esquerda e a área principal à direita.

### 7.2 Sidebar (esquerda)
Ordem dos itens, de cima para baixo:
1. Temperatura (destaque tipográfico, maior elemento da sidebar)
2. Nome da cidade, código do país
3. Dia atual
4. Indicador dia/noite: ícone de sol (dia) ou lua (noite) + texto "Dia"/"Noite"
5. Weather Code: ícone SVG + descrição em PT-BR

**Visual por `is_day`:** a sidebar muda de aparência conforme o período.
- **Dia:** fundo claro e quente (ex.: gradiente azul-céu/amarelo suave) com texto escuro.
- **Noite:** fundo escuro (ex.: gradiente azul-marinho/índigo) com texto claro.
- Cores definidas como variáveis CSS, aplicadas via classe/atributo no elemento (`data-period="day|night"`). O contraste de texto deve ser garantido nos dois modos.

### 7.3 Área principal (direita)
Quatro informações, de preferência em grade 2×2 de cartões/blocos, cada um com rótulo, valor e unidade:
- Umidade relativa
- Temperatura aparente
- Probabilidade de precipitação
- Vento (velocidade + direção)

### 7.4 Formatos
- **Dia atual:** data completa em PT-BR, derivada de `current.time` (já no fuso da cidade), ex.: `quarta-feira, 17 de junho`. Usar `Intl.DateTimeFormat('pt-BR')` sem converter pelo fuso do navegador.
- **Temperaturas:** valor com unidade vinda da API (ex.: `19,3 °C`), formato numérico pt-BR.
- **Vento:** velocidade com unidade + direção em graus e, opcionalmente, ponto cardeal (ex.: `5,8 km/h · 277° (O)`).
- **Umidade e probabilidade de precipitação:** com `%`.
- **Números:** padrão pt-BR (vírgula decimal, ponto de milhar), no máximo 1 casa decimal e sem zeros à direita (`19` → `19`, `19.3` → `19,3`, `1234.5` → `1.234,5`).
- **Ponto cardeal (8 pontos):** N, NE, L, SE, S, SO, O, NO. Cada ponto cobre 45° centrados nele, com limite inferior inclusivo: `[337,5°, 22,5°)` = N, `[22,5°, 67,5°)` = NE, `[67,5°, 112,5°)` = L, e assim por diante. Só o cálculo do ponto cardeal normaliza o ângulo (módulo 360); os graus exibidos são o valor arredondado para inteiro (`360` → `360° (N)`).

### 7.5 Responsividade
- Em telas estreitas (< ~640 px), o card empilha: sidebar em cima e área principal embaixo, ocupando a largura disponível com margens laterais.
- O campo de busca nunca excede a largura da tela.

### 7.6 Estados visuais
- **Empty State (inicial):** dentro do card branco (ou no lugar dele), com ícone/ilustração simples e texto convidando a buscar uma cidade.
- **Empty State (não encontrado):** mesmo componente, com mensagem indicando que não foi possível encontrar informações para a busca.
- **Loading:** indicador (spinner ou skeleton) no lugar do conteúdo do card. Campo e botão desabilitados.
- **Foco/hover:** estados claros em campo e botão.

## 8. Fora do escopo / premissas

- A variável `precipitation` (mm) é pedida na URL, conforme o brain dump, mas **não é exibida**.
- Apenas o primeiro resultado do geocoding é usado (`count=1`). Não há tela de desambiguação de cidades homônimas.
- Sem persistência (a última busca não é guardada).
- Unidades fixas as devolvidas pela API (padrão: °C, km/h, mm).

## 9. Pontos de atenção

1. **`precipitation_probability` em `current`:** o exemplo de resposta do brain dump traz esse campo em `current`, mas na documentação da Open-Meteo essa variável costuma ser listada como `hourly`/`minutely_15`. É preciso confirmar com uma chamada real antes de implementar. Se a API não devolver o campo em `current`, a regra do RF-03 faria toda busca cair no Empty State. Nesse caso, será preciso decidir entre buscar o valor da hora atual em `hourly` ou tornar o campo opcional.
2. **Código 95 (tempestade):** a documentação marca 95, 96 e 99 com asterisco (disponibilidade limitada a certas regiões). O fallback do item 4.5 cobre qualquer caso inesperado.
3. **Divergências do projeto inicial em relação ao PRD:** o `tsconfig.json` do template não declara `"strict": true`; o `index.html` está com `lang="en"` e título `weather-app-web`; existem `counter.ts`, `style.css`, `assets/` e `public/icons.svg` de demonstração, e o CSS fica em `src/style.css` (o PRD prevê `src/styles/main.css`). Tudo isso é ajustado na T01.
4. **Compatibilidade das ferramentas de teste:** o projeto usa Vite 8 e TypeScript 6. Antes de instalar o Vitest, conferir os `peerDependencies` da versão escolhida (o Vitest 5.x declara suporte a Vite 8 em set/2026). Os testes de data dependem de `Intl` com dados de `pt-BR`, presentes no Node com ICU completo (padrão nas versões atuais).

## 10. Critérios de aceite

- [ ] Buscar "Rio de Janeiro" exibe sidebar e área principal preenchidas, com os dados da API.
- [ ] Busca disparada por Enter e pelo botão; campo vazio não dispara nada.
- [ ] Cidade inexistente exibe o Empty State.
- [ ] Falha no Forecast (ou propriedade obrigatória ausente) exibe o Empty State, sem dados parciais.
- [ ] Loading único cobre as duas requisições; campo e botão ficam desabilitados.
- [ ] Nenhum código fora de `services/openMeteo.ts` faz `fetch` para a Open-Meteo.
- [ ] Funções do `openMeteo.ts` retornam `null` sem requisitar quando os parâmetros são inválidos.
- [ ] Sidebar muda de visual entre dia e noite e mostra ícone sol/lua.
- [ ] Todo Weather Code da tabela exibe descrição PT-BR e ícone SVG; código desconhecido usa o fallback.
- [ ] Layout: fundo cinza escuro, busca centralizada sem background, card branco com borda bem arredondada e largura máxima de 800px.
- [ ] Layout empilha corretamente em telas estreitas.
- [ ] Uma resposta atrasada de uma busca antiga nunca sobrescreve a de uma busca mais nova.
- [ ] `npm test` passa (unitários e integração), sem `.skip` nem `.only`.
- [ ] `npm run test:e2e` passa: sucesso, cidade não encontrada, falha do Forecast, corrida entre buscas, responsividade, teclado e acessibilidade.
- [ ] `npm run test:coverage` atinge as metas da seção 11.5.
- [ ] Nenhum teste automático acessa a rede real; `npm run test:live` confirma o contrato da API (incluindo `precipitation_probability` em `current`).
- [ ] Cada critério de aceite desta seção tem pelo menos um teste correspondente, conforme a matriz da seção 11.6.

## 11. Estratégia de testes

### 11.1 Princípios
- **Pirâmide:** muitos testes unitários (services, utils, ícones), alguns de integração em jsdom (UI e orquestração) e poucos E2E em navegador real (layout, teclado, fluxos).
- **Rede sempre mockada** nos testes automáticos. A Open-Meteo real só é chamada na T02 (spike) e no teste de contrato opt-in (`npm run test:live`).
- **O PRD é a fonte da verdade.** Se um teste e o PRD divergirem, o PRD vale. Não se altera um teste só para fazê-lo passar sem confirmar que o PRD mudou.
- Teste escrito junto com a implementação (de preferência antes). Nomes dos casos em PT-BR e prefixados com o requisito, ex.: `it('RF-03: Geocoding sem results retorna null')`.
- Proibido versionar `.only` e `.skip`.

### 11.2 Ferramentas e scripts
| Script | O que faz |
|---|---|
| `npm test` | `vitest run`: unitários e integração (jsdom), sem testes `*.live.test.ts` |
| `npm run test:watch` | `vitest` em modo watch |
| `npm run test:coverage` | `vitest run --coverage` (provider v8) com metas da 11.5 |
| `npm run test:e2e` | Playwright (Chromium; Firefox e WebKit opcionais), com a rede mockada via `page.route` |
| `npm run test:live` | `vitest run --config vitest.live.config.ts`: chama a Open-Meteo real, só roda sob demanda |

### 11.3 Mocks, fixtures e ganchos de teste
- **`mockFetch` (`src/test/helpers/mockFetch.ts`):** substitui `fetch` global (`vi.stubGlobal`), roteia por URL, permite resposta JSON, status HTTP, erro de rede, JSON inválido e resposta **deferred** (resolvida manualmente, para testar corridas). Respeita `AbortSignal` (rejeita com `AbortError`) e registra as chamadas (`calls`), para afirmar "nenhuma requisição foi feita".
- **Fixtures:** `src/test/fixtures/geocoding-rio.json` e `forecast-rio.json`, copiadas das respostas reais capturadas na T02. Cada teste deriva variações por cópia (remover um campo, trocar tipo, trocar unidade), sem editar o arquivo.
- **Timeout:** o código usa `AbortController` + `setTimeout` (não `AbortSignal.timeout`) para que `vi.useFakeTimers()` consiga avançar os 10 s.
- **Fuso:** testes de data usam `vi.stubEnv('TZ', ...)` com fusos extremos (`Pacific/Kiritimati`, +14, e `Pacific/Pago_Pago`, −11). O E2E repete a checagem com `timezoneId` do Playwright.
- **Ganchos (`data-testid`) obrigatórios na UI:**

| `data-testid` | Elemento |
|---|---|
| `search-form`, `search-input`, `search-button` | formulário, campo e botão |
| `card` | card principal; atributo `data-state` = `empty-inicial` \| `empty-nao-encontrado` \| `loading` \| `resultado` |
| `status-region` | região `aria-live="polite"` com o texto do estado atual |
| `sidebar` | sidebar; atributo `data-period` = `day` \| `night` |
| `temperature`, `city`, `day`, `period`, `weather-description` | itens da sidebar (ícones dentro do respectivo item) |
| `main-area` | área principal |
| `humidity`, `apparent-temperature`, `precipitation-probability`, `wind` | blocos da área principal |

Elementos de estados inativos ficam fora do DOM ou com o atributo `hidden`.

### 11.4 Casos de teste por módulo

**`searchCity` (unitário, fetch mockado)**
| Caso | Esperado |
|---|---|
| `"Rio de Janeiro"` com fixture | `City` completo (`name`, `latitude`, `longitude`, `countryCode`, `timezone`) |
| URL chamada | contém base `geocoding-api.open-meteo.com/v1/search`, `count=1`, `language=pt`, `format=json` |
| `"São Paulo"` | `name=S%C3%A3o%20Paulo` (via `encodeURIComponent`) |
| `"  Rio  "` | `trim` aplicado; `name=Rio` |
| `""`, `"   "`, `null`, `undefined` | `null`; `fetch` chamado **0 vezes** |
| `results` ausente ou `[]` | `null` |
| `results[0]` sem um campo necessário (cada um dos 5, um por vez) | `null` |
| `results` com 2+ itens | usa só o primeiro |
| HTTP 404 / 500 | `null`, sem lançar |
| `fetch` rejeita (rede) | `null`, sem lançar |
| `json()` lança | `null`, sem lançar |
| Sem resposta por 10 s (fake timers) | `null` |

**`getCurrentWeather` (unitário, fetch mockado)**
| Caso | Esperado |
|---|---|
| Parâmetros válidos com fixture | `CurrentWeather` completo; `isDay` booleano; `units` vindas de `current_units` |
| `is_day: 1` / `is_day: 0` | `true` / `false` |
| URL chamada | `current=` com as 9 variáveis do PRD 5.2 na ordem; `timezone=America%2FSao_Paulo` |
| `latitude: 0, longitude: 0` | **faz** a requisição (0 é valor válido, não "ausente") |
| `NaN`, `undefined`, `null`, `""` em lat/long; timezone `""`, `"  "`, `undefined` | `null`; `fetch` chamado 0 vezes |
| Cada propriedade obrigatória de `current` ausente (as 7 + `weather_code` + `time`), uma por vez | `null` |
| Propriedade com tipo inválido (ex.: `"19"` no lugar de número) | `null` |
| `current_units` ausente, ou sem uma das 6 unidades | `null` |
| `precipitation` ausente | **não** invalida (retorna `CurrentWeather`) |
| HTTP não-2xx, rede, JSON inválido, timeout | `null`, sem lançar |

**Cancelamento (`AbortSignal`)**
| Caso | Esperado |
|---|---|
| Sinal abortado durante a requisição | `null`; nenhum `console.error`; nenhuma rejeição não tratada |
| Sinal já abortado antes de chamar | `null`; `fetch` chamado 0 vezes |
| Sem sinal | comportamento idêntico ao dos casos acima |
| Sinal + timeout | o que ocorrer primeiro encerra; limpa o timer ao terminar |

**Isolamento da API (`isolation.test.ts`)**
Usa `import.meta.glob('/src/**/*.ts', { query: '?raw', eager: true })`, ignora `*.test.ts` e `src/test/`, e afirma que `fetch(` e `open-meteo` aparecem **somente** em `services/openMeteo.ts`.

**`weatherCode`**
| Caso | Esperado |
|---|---|
| Cada um dos 28 códigos da tabela (6) via `it.each` | descrição PT-BR **exatamente** igual à coluna "Sugestão PT-BR" |
| Todo `iconKey` retornado | existe em `icons.ts` e não é o ícone de fallback |
| `1234`, `-1`, `1.5`, `NaN` | `Condição desconhecida` + ícone neutro, sem lançar |
| Códigos 0 e 2 com `isDay` `true` e `false` | `iconKey` diferentes |
| Demais códigos | mesmo `iconKey` para dia e noite |

**`icons`**
| Caso | Esperado |
|---|---|
| Cada `iconKey` e o fallback | `getIcon` retorna string que começa com `<svg` |
| Chave inexistente | ícone neutro |
| Nenhuma cor fixa (`#hex`, `rgb(`, `hsl(`, nomes de cor) além de `currentColor`, `none` e `var(--...)` | todos os SVGs passam |
| Acessibilidade | cada SVG tem `aria-hidden="true"` ou `aria-label`/`<title>` |

**`format`**
| Caso | Esperado |
|---|---|
| `"2026-06-17T09:45"` | `quarta-feira, 17 de junho`, nos três fusos (UTC, +14, −11) |
| `"2026-12-31T23:59"` e `"2026-01-01T00:00"` | `quinta-feira, 31 de dezembro` e `quinta-feira, 1 de janeiro` (sem virar o dia por fuso) |
| Número com unidade: `19.3`/`°C`, `5.8`/`km/h`, `0`, `-5.5`, `19`, `1234.5` | `19,3 °C`, `5,8 km/h`, `0`, `-5,5`, `19`, `1.234,5` |
| Ponto cardeal: `0`, `360` | N |
| `22.4`, `22.5`, `67.5`, `90`, `112.5`, `157.5`, `180`, `202.5`, `247.5`, `277`, `292.5`, `337.5` | N, NE, L, L, SE, S, S, SO, O, O, NO, N |
| `-10`, `365` | N (normalização) |
| Vento `5.8` km/h, `277` | `5,8 km/h · 277° (O)` |
| Vento `360` | `... 360° (N)` |

**UI: `searchForm` (jsdom)**
| Caso | Esperado |
|---|---|
| É um `<form>` com botão `type="submit"` (Enter nativo) | clique no botão e `form.requestSubmit()` chamam o mesmo callback |
| Texto `"  Rio  "` | callback recebe `"Rio"` |
| Vazio ou só espaços | callback **não** é chamado |
| Digitar (evento `input`) | callback **não** é chamado |
| `label` | campo tem `<label for>` associado (pode ser visualmente oculto) |
| Desabilitar/habilitar | `setDisabled(true/false)` afeta campo e botão |

**UI: `render` (jsdom)**
| Caso | Esperado |
|---|---|
| Estados `empty-inicial`, `empty-nao-encontrado`, `loading`, `resultado` | `card[data-state]` correto e **apenas um** visível por vez |
| Mensagens dos dois empty states | textos diferentes |
| `loading` | `status-region` anuncia o carregamento |
| Resultado: sidebar | cinco itens na ordem do PRD 7.2; `Rio de Janeiro, BR`; ícone de sol + `Dia` ou de lua + `Noite` conforme `isDay` |
| Unidade vem de `units` | com `units.temperature = "°F"` aparece `°F` (prova que não há unidade fixa) |
| Weather code | ícone e descrição corretos para 0, 63 e 95 |
| `data-period` | `day` quando `isDay`, `night` caso contrário |
| Área principal | 4 blocos com rótulo, valor e unidade; `precipitation` (mm) **não** aparece |
| Segurança | cidade `<img src=x onerror=alert(1)>` aparece como texto; nenhum `img` é criado |
| Contraste (`contrast.test.ts`) | lê `main.css` (`?raw`) e verifica razão ≥ 4,5:1 entre `--day-text` e as duas pontas do gradiente do dia, e entre `--night-text` e as duas pontas do da noite |

**Integração: fluxo de busca (`main.test.ts`, jsdom + `mockFetch`)**
| Caso | Esperado |
|---|---|
| Sucesso com fixtures | sequência de `data-state` observada via `MutationObserver` = `loading` → `resultado` (um único loading, sem estado intermediário) |
| Geocoding sem resultado | `empty-nao-encontrado`; Forecast **não** é chamado |
| Forecast com HTTP 500, rede, JSON inválido, campo obrigatório ausente | `empty-nao-encontrado`; nenhum dado da cidade nem de busca anterior na tela |
| Busca com sucesso seguida de busca que falha | tela sem restos da primeira |
| Campo e botão durante `loading` | desabilitados; reabilitados ao final, inclusive em erro |
| Corrida: busca A (deferred) e depois B (rápida); A resolve depois | tela mostra **só B**; sinal da requisição A foi abortado |
| Campo vazio | nenhuma requisição |
| Nenhum `console.error` | em sucesso, não encontrado, falha de rede e abort |

**E2E (Playwright, rede via `page.route`)**
| Caso | Esperado |
|---|---|
| Busca "Rio de Janeiro" por Enter e por clique | sidebar e área principal preenchidas |
| Campo vazio + Enter/clique | nenhuma requisição (contador do `page.route`) |
| Cidade inexistente; Forecast com falha (500, `abort()`, JSON sem campo) | Empty State, sem dados parciais |
| Corrida com `route` atrasando a primeira resposta | só o resultado da última busca fica na tela |
| Fluxo só pelo teclado | Tab: campo → botão; Enter busca; foco visível |
| Larguras 320, 375, 639, 640, 800 e 1920 px | `scrollWidth <= innerWidth`; abaixo de 640 a sidebar fica acima da área principal; ≥ 800 o card tem ≤ 800 px e está centralizado; o campo nunca passa da tela |
| `timezoneId: 'Pacific/Kiritimati'` | dia atual exibido igual ao esperado |
| Dia e noite | `data-period` e ícone corretos para `is_day` 1 e 0 |
| Acessibilidade (`@axe-core/playwright`) | sem violações `serious`/`critical` nos estados inicial, não encontrado e resultado (dia e noite) |
| Cores de fundo/estrutura (PRD 7.1) | fundo da página cinza escuro; área superior sem background; card branco |

**Contrato real (`*.live.test.ts`, opt-in)**
Chama a Open-Meteo de verdade para o Rio: Geocoding devolve `name`, `latitude`, `longitude`, `country_code`, `timezone`; Forecast devolve em `current` todas as propriedades obrigatórias (incluindo `precipitation_probability`), `weather_code`, `time` e `current_units` completo; e `searchCity` + `getCurrentWeather` retornam objetos não nulos.

### 11.5 Metas de cobertura (sugestão)
| Escopo | Linhas | Branches |
|---|---|---|
| `src/services`, `src/utils` | ≥ 95 % | ≥ 90 % |
| `src/ui`, `src/main.ts` | ≥ 85 % | ≥ 80 % |

Cobertura é um piso, não o objetivo: os casos das tabelas acima valem mais que o percentual.

### 11.6 Matriz: critérios de aceite × testes
| Critério (seção 10) | Onde é testado |
|---|---|
| Rio exibe sidebar e área principal | `main.test.ts`, `render.test.ts`, E2E |
| Enter, botão e campo vazio | `searchForm.test.ts`, E2E |
| Cidade inexistente → Empty State | `main.test.ts`, `openMeteo.test.ts`, E2E |
| Falha no Forecast / campo ausente → Empty State | `main.test.ts`, `openMeteo.test.ts`, E2E |
| Loading único; campo e botão desabilitados | `main.test.ts`, `render.test.ts` |
| Só `openMeteo.ts` faz `fetch` | `isolation.test.ts` |
| `null` sem requisitar com parâmetros inválidos | `openMeteo.test.ts` |
| Sidebar dia/noite, sol/lua | `render.test.ts`, `contrast.test.ts`, E2E |
| Weather Codes e fallback | `weatherCode.test.ts`, `icons.test.ts`, `render.test.ts` |
| Layout (fundo, busca, card, 800 px) | E2E |
| Empilha em telas estreitas | E2E |
| Resposta atrasada não sobrescreve | `main.test.ts`, `openMeteo.test.ts` (abort), E2E |
| Contrato real da API | `openMeteo.live.test.ts` |