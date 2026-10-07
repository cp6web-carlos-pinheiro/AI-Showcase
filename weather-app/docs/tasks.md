# Tasks — Projeto Clima

Divisão da implementação do [prd.md](./prd.md) em tarefas pequenas e sequenciais.
O PRD é a fonte da verdade: cada tarefa aponta as seções relevantes em vez de repetir o conteúdo. Em caso de conflito, vale o PRD (inclusive entre um teste e o PRD).
Os casos de teste detalhados estão no **PRD seção 11.4**; as tarefas dizem *quando* escrevê-los e *o que precisa passar*.

## Como usar (regras para agentes de IA)

1. Execute **uma tarefa por vez**, na ordem. Não comece uma tarefa antes de a anterior estar marcada `[x]`.
2. Antes de começar, leia a tarefa e as seções do PRD que ela referencia.
3. Faça **apenas** o que a tarefa pede. Não antecipe trabalho de tarefas futuras.
4. A tarefa só está concluída quando **todos** os itens do "Critério de aprovação" forem verdadeiros. Verifique de fato (rodando o app, o build e os testes), sem presumir.
5. Ao concluir, marque `[x]` na tarefa e acrescente uma linha curta de observação, se houver algo relevante para as próximas.
6. Se surgir uma dúvida técnica sem opção clara, **pare e pergunte ao usuário** antes de decidir.
7. Verificações mínimas em toda tarefa de código: `npm run build` sem erros de TypeScript **e `npm test` verde** (a partir da T03).
8. **Testes junto com o código:** nas tarefas com bloco "Testes", escreva os testes na mesma tarefa, de preferência antes da implementação. Não altere um teste só para fazê-lo passar sem confirmar que o PRD mudou. Não versione `.only` nem `.skip`.
9. **Rede mockada:** testes automáticos nunca chamam a Open-Meteo real. Só a T02 (spike) e a T22 (contrato opt-in) acessam a API de verdade.
10. Nomes dos casos de teste em PT-BR, prefixados com o requisito (ex.: `RF-03: ...`).

### Mapa de numeração (revisão com testes)
| Antes | Agora | | Antes | Agora |
|---|---|---|---|---|
| T01 | T01 | | T10 | T12 |
| T02 | T02 | | T11 | T13 |
| — | **T03** (infra de testes) | | T12 | T14 |
| T03 | T04 | | T13 | T15 |
| T04 | T05 | | T14 | T16 |
| T05 | T06 | | T15 | T17 |
| T06 | T07 | | T16 | T18 |
| — | **T08** (isolamento da API) | | T17 | T19 |
| T07 | T09 | | — | **T20, T21, T22** (E2E e contrato) |
| T08 | T10 | | T18 | T23 |
| T09 | T11 | | | |

---

## Fase 1 — Fundação

### [x] T01 — Adotar o projeto inicial e adequá-lo ao PRD
**Referência:** PRD 4.1, 4.2 e 9 (item 3)
**O que fazer:** Partir do projeto `weather-app-web` (Vite 8 + TypeScript 6, template `vanilla-ts`, já com `package.json`, `tsconfig.json`, `index.html` e `src/main.ts`). Não recriar o projeto. Ajustar:
- `tsconfig.json`: acrescentar `"strict": true`, mantendo as opções existentes (`noUnusedLocals`, `verbatimModuleSyntax`, `erasableSyntaxOnly` etc.).
- Remover o código de demonstração: `src/counter.ts`, `src/style.css`, `src/assets/` (`hero.png`, `typescript.svg`, `vite.svg`) e `public/icons.svg`. Reduzir `src/main.ts` ao mínimo (bootstrap vazio).
- `index.html`: `lang="pt-BR"` e `<title>Clima</title>`.
- Criar as pastas `src/services`, `src/types`, `src/utils`, `src/ui`, `src/styles` (arquivos vazios ou mínimos onde necessário).
**Critério de aprovação:**
- `npm install` e `npm run dev` sobem o app sem erros.
- `npm run build` conclui sem erros.
- `tsconfig.json` tem `"strict": true`.
- Existem as pastas `src/services`, `src/types`, `src/utils`, `src/ui` e `src/styles`.
- Uma busca por `counter`, `Get started`, `vite.svg`, `typescript.svg`, `hero.png` e `icons.svg` em `src/` e `index.html` não retorna nada.
- `<html>` tem `lang="pt-BR"`.
- Nenhum framework de UI foi instalado.

Observação: base do app limpa e funcionando em Vite 8; `npm run dev` iniciou com sucesso em `localhost:5174` (5173 ocupado).

### [x] T02 — Validar `precipitation_probability` em `current` (spike) e capturar fixtures
**Referência:** PRD 5.1, 5.2, 5.3, 9 (item 1) e 11.3
**O que fazer:** Fazer chamadas reais ao Geocoding (`name=Rio de Janeiro`) e ao Forecast com a URL do PRD 5.2 (coordenadas e timezone devolvidos pelo Geocoding) e verificar se `current.precipitation_probability` vem na resposta. Salvar as duas respostas reais, sem alterar o conteúdo (só formatação), em `src/test/fixtures/geocoding-rio.json` e `src/test/fixtures/forecast-rio.json`. Não escrever código do app nesta tarefa.
**Critério de aprovação:**
- O resultado da chamada (campo presente ou ausente, e o valor/unidade) está registrado em uma nota abaixo desta tarefa.
- Os dois arquivos de fixture existem e são JSON válidos; `forecast-rio.json` tem `current` e `current_units`.
- **Se o campo vier:** nada muda, siga para a T03.
- **Se o campo NÃO vier:** a tarefa fica **bloqueada** e o usuário é consultado (buscar em `hourly` ou tornar o campo opcional) antes de qualquer outra tarefa. A decisão deve ser refletida no `prd.md` (incluindo os casos de teste da seção 11.4) antes de continuar.

> Nota de resultado: o campo `current.precipitation_probability` está presente na resposta real do Open-Meteo para Rio de Janeiro, com valor `61` e unidade `%`. Os JSONs das fixtures foram salvos em `src/test/fixtures/geocoding-rio.json` e `src/test/fixtures/forecast-rio.json`.

### [x] T03 — Infraestrutura de testes unitários (Vitest + jsdom)
**Referência:** PRD 3 (Testabilidade), 4.1, 9 (item 4), 11.1, 11.2 e 11.3
**O que fazer:**
- Instalar como `devDependencies`: `vitest`, `jsdom` e `@vitest/coverage-v8`. Antes, conferir os `peerDependencies` do Vitest escolhido contra o Vite 8 instalado.
- Criar `vitest.config.ts` (`environment: 'jsdom'`, `include: ['src/**/*.test.ts']`, `exclude` dos `*.live.test.ts`, `restoreMocks` e `unstubGlobals` ligados, cobertura v8 com reporters `text` e `html`, ainda sem metas).
- Scripts no `package.json`: `test` (`vitest run`), `test:watch` (`vitest`) e `test:coverage` (`vitest run --coverage`). Adicionar `coverage` ao `.gitignore`.
- Criar `src/test/helpers/mockFetch.ts` conforme PRD 11.3: roteamento por URL, resposta JSON com status, erro de rede, JSON inválido, resposta *deferred* (resolvida manualmente), respeito a `AbortSignal` (rejeita com `AbortError`) e registro das chamadas.
- Criar `src/test/helpers/mockFetch.test.ts` cobrindo cada comportamento do helper.
- Os testes importam `describe`, `it`, `expect`, `vi` de `'vitest'`; **não** habilitar globals nem alterar `types` no `tsconfig`.
**Critério de aprovação:**
- `npm test` passa, com pelo menos um teste para cada comportamento do `mockFetch` (JSON, status, erro de rede, JSON inválido, deferred, abort, registro de chamadas).
- `npm run build` sem erros (o `tsc` verifica os arquivos de teste).
- As fixtures da T02 podem ser importadas com tipos (`import x from '.../forecast-rio.json'`) sem erro de `tsc`.
- `npm run test:coverage` gera o relatório sem erros.

Observação: `vitest@^5.0.3` foi escolhido porque sua peerDependency aceita `vite ^8.0.0`; o helper cobre JSON, status, rede, inválido, abort, deferred e registro de chamadas.

### [x] T04 — Definir os tipos
**Referência:** PRD 5.1, 5.2 e 5.4
**O que fazer:** Criar em `src/types/openMeteo.ts` os tipos do modelo interno (`City`, `CurrentWeather`) e os tipos das respostas brutas da API (geocoding e forecast) usados para validar o JSON recebido.
**Testes:** Criar `src/types/openMeteo.test.ts` que atribui as fixtures da T02 às respostas brutas tipadas (a verificação é de tipo, feita pelo `tsc`) e que monta um `City` e um `CurrentWeather` de exemplo com todos os campos.
**Critério de aprovação:**
- `City` e `CurrentWeather` existem com os campos do PRD 5.4.
- Há tipos para as respostas brutas (`results[0]` do geocoding; `current` e `current_units` do forecast).
- As fixtures reais são atribuíveis aos tipos brutos sem `as`/`any`.
- `npm run build` e `npm test` sem erros.

Observação: os tipos foram validados com `resolveJsonModule` e as fixtures reais são atribuídas diretamente aos contratos da API sem `as`/`any`.

---

## Fase 2 — Camada de API

### [x] T05 — Implementar `searchCity`
**Referência:** PRD 4.3, 5.1, 11.4 (`searchCity`), RF-02 e RF-03
**O que fazer:** Em `src/services/openMeteo.ts`, implementar `searchCity(name)` seguindo o contrato do geocoding. Implementar o timeout (10 s) com `AbortController` + `setTimeout`, **não** com `AbortSignal.timeout`, para ser testável com `vi.useFakeTimers()`.
**Testes:** Criar `src/services/openMeteo.test.ts` com **todos** os casos da tabela `searchCity` do PRD 11.4, usando `mockFetch` e a fixture `geocoding-rio.json`.
**Critério de aprovação:**
- Com `"Rio de Janeiro"`, retorna um `City` com `name`, `latitude`, `longitude`, `countryCode` e `timezone` preenchidos.
- Nome com acento ou espaço (ex.: `"São Paulo"`) é enviado corretamente codificado e funciona.
- Entradas vazias, só com espaços, `null` ou `undefined` retornam `null` **sem disparar requisição** (o teste confere `fetch` chamado 0 vezes).
- Nome sem resultado retorna `null`; `results[0]` sem qualquer um dos 5 campos retorna `null`.
- Erro de rede, HTTP não-2xx, JSON inválido e timeout retornam `null`, sem lançar exceção.
- A URL-base e os parâmetros (`count=1&language=pt&format=json`) estão como constantes no arquivo.
- Todos os casos da tabela `searchCity` (PRD 11.4) têm teste e passam; `npm run build` e `npm test` sem erros.

Observação: a validação ficou verde com `npm test` e `npm run build`; o serviço geocodifica corretamente e a perda de timers no mock foi corrigida antes da aprovação final.

### [x] T06 — Implementar `getCurrentWeather`
**Referência:** PRD 4.3, 5.2, 5.3, 5.4, 11.4 (`getCurrentWeather`), RF-02 e RF-03
**O que fazer:** Em `src/services/openMeteo.ts`, implementar `getCurrentWeather({ latitude, longitude, timezone })` seguindo o contrato do forecast e convertendo para `CurrentWeather` (incluindo `units`). Validar `current_units` conforme PRD 5.3.
**Testes:** Acrescentar em `openMeteo.test.ts` **todos** os casos da tabela `getCurrentWeather` do PRD 11.4, com a fixture `forecast-rio.json`. Atenção especial a `latitude: 0, longitude: 0` (deve requisitar) e a cada propriedade obrigatória removida individualmente (`it.each`).
**Critério de aprovação:**
- Com coordenadas e timezone válidos, retorna um `CurrentWeather` completo, incluindo `time`, `weatherCode`, `isDay` booleano e `units` vindos de `current_units`.
- `timezone` é enviado com URL-encoding (ex.: `America%2FSao_Paulo`) e a URL traz as 9 variáveis de `current` do PRD 5.2.
- Parâmetros ausentes, vazios, `NaN` ou timezone vazio retornam `null` **sem disparar requisição**; coordenadas `0, 0` **disparam** a requisição.
- Resposta sem qualquer propriedade obrigatória (PRD 5.3), sem `current_units` (ou sem uma das 6 unidades) ou com tipo inválido retorna `null`; resposta sem `precipitation` **não** é inválida.
- Erro de rede, HTTP não-2xx, JSON inválido e timeout retornam `null`, sem lançar exceção.
- Todos os casos da tabela `getCurrentWeather` (PRD 11.4) têm teste e passam; `npm run build` e `npm test` sem erros.

Observação: o transformador foi validado com o payload real do Open-Meteo e o retorno interno de `CurrentWeather` está alinhado aos campos e unidades exigidos pelo PRD.

### [x] T07 — Suporte a cancelamento de requisições
**Referência:** PRD 3 (Concorrência e Timeout), 4.4 e 11.4 (Cancelamento)
**O que fazer:** Fazer `searchCity` e `getCurrentWeather` aceitarem um `AbortSignal` opcional, combinado com o timeout interno (combinar com listeners manuais, sem depender de `AbortSignal.any`). Se o sinal já chegar abortado, retornar `null` sem requisitar. Limpar o timer ao terminar a requisição.
**Testes:** Acrescentar em `openMeteo.test.ts` os casos da tabela "Cancelamento" do PRD 11.4, para as duas funções, incluindo um `vi.spyOn(console, 'error')` que não pode ser chamado.
**Critério de aprovação:**
- Abortar o sinal durante a requisição faz a função retornar `null` sem erro não tratado no console.
- Sinal já abortado: `null` e `fetch` chamado 0 vezes.
- Sem o sinal, o comportamento das T05/T06 permanece igual (os testes anteriores continuam passando).
- Os timers do timeout são limpos (nenhum timer pendente ao fim dos testes com fake timers).
- `npm run build` e `npm test` sem erros.

Observação: a correção foi no helper de teste `mockFetch`, que agora limpa o timeout e remove o listener de abort quando a requisição é cancelada; isso resolve o último caso de timers pendentes e deixa a suíte 100% verde.

### [x] T08 — Teste de isolamento da API
**Referência:** PRD 4.3 e 10 (critério de isolamento)
**O que fazer:** Criar `src/services/isolation.test.ts`, que lê o código-fonte com `import.meta.glob('/src/**/*.ts', { query: '?raw', eager: true })`, ignora `*.test.ts` e `src/test/`, e afirma que `fetch(` e `open-meteo` aparecem somente em `src/services/openMeteo.ts`. Provar que o teste funciona: rodá-lo uma vez com um `fetch(` temporário em outro arquivo (deve falhar) e removê-lo.
**Critério de aprovação:**
- O teste passa com o código atual.
- Foi demonstrado que ele falha quando existe `fetch(` ou a string `open-meteo` fora de `services/openMeteo.ts` (registrar na observação da tarefa).
- Nenhum `fetch(` ou `open-meteo` ficou fora de `src/services/openMeteo.ts` no `src/` (exceto arquivos de teste).
- `npm run build` e `npm test` sem erros.

Observação: o teste foi validado com a regra limpa e também com uma violação temporária em `src/ui/temporary-bad.ts`, que provocou falha esperada e foi removida imediatamente; a verificação final ficou verde após a limpeza.

---

## Fase 3 — Utilitários

### [x] T09 — Mapeamento do Weather Code
**Referência:** PRD 4.5, 6 e 11.4 (`weatherCode`)
**O que fazer:** Criar `src/utils/weatherCode.ts` com a função que recebe `(weatherCode, isDay)` e retorna `{ description, iconKey }` para todos os códigos da tabela do PRD 6, com fallback para códigos desconhecidos.
**Testes:** Criar `src/utils/weatherCode.test.ts` com os casos da tabela `weatherCode` do PRD 11.4: `it.each` com os 28 códigos e a descrição PT-BR exata da tabela do PRD 6, fallback (`1234`, `-1`, `1.5`, `NaN`), dia/noite diferentes só nos códigos 0 e 2. O teste "todo `iconKey` existe em `icons.ts`" é escrito na T10.
**Critério de aprovação:**
- Todos os códigos da tabela (0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99) retornam descrição PT-BR e uma `iconKey`.
- Um código fora da tabela (ex.: `1234`) retorna o fallback ("Condição desconhecida" + ícone neutro) sem lançar erro.
- Códigos 0 e 2 retornam `iconKey` diferentes para `isDay` verdadeiro e falso.
- Os testes cobrem cada código da tabela e passam; `npm run build` e `npm test` sem erros.

### [x] T10 — Ícones SVG
**Referência:** PRD 4.5, 6 (agrupamento de ícones), 7.2 e 11.4 (`icons`)
**O que fazer:** Criar `src/ui/icons.ts` com os SVGs inline: sol, lua, céu limpo (dia/noite), parcialmente nublado (dia/noite), nublado, neblina, garoa, chuva, pancadas, neve, tempestade e o ícone neutro de fallback.
**Testes:** Criar `src/ui/icons.test.ts` com os casos da tabela `icons` e acrescentar o teste cruzado: para os 28 códigos × `isDay` `true`/`false`, o `iconKey` de `weatherCode` existe em `icons.ts` e (exceto no fallback) `getIcon` não devolve o ícone neutro.
**Critério de aprovação:**
- Existe um ícone para cada `iconKey` retornada pela T09, incluindo o fallback.
- Uma função (ex.: `getIcon(iconKey)`) retorna a string SVG; chave inexistente retorna o ícone neutro.
- Os SVGs usam `currentColor` ou variáveis CSS, sem cores fixas que quebrem nos temas dia/noite (o teste procura `#hex`, `rgb(`, `hsl(` e nomes de cor).
- Os SVGs têm `aria-hidden="true"` (o texto adjacente carrega o significado) ou um `aria-label`/`title`.
- `npm run build` e `npm test` sem erros.

### [x] T11 — Formatadores
**Referência:** PRD 7.4 e 11.3 (Fuso), 11.4 (`format`)
**O que fazer:** Criar `src/utils/format.ts` com: formatação do dia atual a partir de `current.time` (sem converter pelo fuso do navegador, ou seja, extrair a data da string e formatar com `timeZone: 'UTC'`), número no padrão pt-BR (máx. 1 casa decimal, sem zeros à direita), valor + unidade e direção do vento (graus + ponto cardeal de 8 pontos, regra do PRD 7.4).
**Testes:** Criar `src/utils/format.test.ts` com os casos da tabela `format` do PRD 11.4. Os testes de data rodam em três fusos via `vi.stubEnv('TZ', ...)`: `UTC`, `Pacific/Kiritimati` e `Pacific/Pago_Pago`. Se `vi.stubEnv('TZ')` não mudar o fuso no ambiente (ex.: Windows), rodar a suíte com `TZ` definido externamente e registrar isso na observação da tarefa.
**Critério de aprovação:**
- `"2026-06-17T09:45"` resulta em `quarta-feira, 17 de junho`, independentemente do fuso do navegador (comprovado pelos três fusos); `"2026-12-31T23:59"` e `"2026-01-01T00:00"` não mudam de dia.
- `19.3` com `°C` resulta em `19,3 °C`; `19` resulta em `19 °C`; `1234.5` resulta em `1.234,5`.
- `277` graus resulta em `277° (O)`; casos-limite: `0` e `360` resultam em N, `90` em L, `180` em S; fronteiras `22.4`→N, `22.5`→NE, `337.5`→N; `-10` e `365` normalizam para N.
- Vento completo: `5,8 km/h · 277° (O)`.
- `npm run build` e `npm test` sem erros.

---

## Fase 4 — Interface

### [ ] T12 — Estrutura HTML e layout base
**Referência:** PRD 7.1 e 11.3 (ganchos)
**O que fazer:** Montar o `index.html` e o CSS base (`src/styles/main.css`, importado pelo `main.ts`) com variáveis CSS: fundo cinza escuro, área superior centralizada e container do card (ainda sem conteúdo real). Aplicar os `data-testid` `card`, `sidebar` e `main-area` (PRD 11.3).
**Testes:** Criar um teste em jsdom (ex.: em `src/main.test.ts`) que carrega `index.html` com `?raw` e confere `lang="pt-BR"`, a existência de `card` contendo `sidebar` e `main-area`, e que o markup não contém restos do template. O visual (cores, 800 px, centralização) é verificado no E2E da T21; aqui, conferir manualmente no navegador.
**Critério de aprovação:**
- Fundo da página cinza escuro cobrindo toda a viewport.
- Área superior centralizada, **sem background próprio**.
- Card com fundo branco, borda bem arredondada, centralizado horizontalmente e `max-width: 800px`.
- Dentro do card existem duas regiões: sidebar à esquerda e área principal à direita.
- `lang="pt-BR"` no `<html>`.
- O teste de estrutura passa; `npm run build` e `npm test` sem erros.

### [ ] T13 — Campo de busca e botão
**Referência:** PRD RF-01, 3 (Acessibilidade), 7.1 e 11.4 (`searchForm`)
**O que fazer:** Implementar em `src/ui/searchForm.ts` o formulário de busca (`<form>` com `label` + campo + botão `type="submit"`, ganchos `search-form`, `search-input`, `search-button`) e o evento de envio, ainda sem chamar a API: apenas entrega o texto com `trim` para um callback. Expor `setDisabled(boolean)` para campo e botão.
**Testes:** Criar `src/ui/searchForm.test.ts` com todos os casos da tabela `searchForm` do PRD 11.4. Em jsdom, Enter nativo não é simulável: o teste confere que é um `<form>` com botão de submit e usa `requestSubmit()`; o Enter real é testado no E2E (T21).
**Critério de aprovação:**
- Enter no campo e clique no botão disparam o mesmo callback com o texto limpo.
- Campo vazio ou só com espaços não dispara o callback.
- Não há disparo ao digitar.
- Campo e botão têm estados visíveis de foco e hover e são acessíveis por teclado (verificação manual agora; automática no E2E).
- O campo tem `label` associado (pode ser visualmente oculto).
- A área superior continua contendo **apenas** campo e botão.
- Os testes da tabela `searchForm` passam; `npm run build` e `npm test` sem erros.

### [ ] T14 — Estados: Empty State e Loading
**Referência:** PRD RF-04, 7.6, 11.3 (ganchos) e 11.4 (`render`)
**O que fazer:** Implementar em `src/ui/render.ts` a renderização dos estados `empty-inicial`, `empty-nao-encontrado` e `loading`, e uma função para alternar entre eles (e o futuro `resultado`). O `card` expõe `data-state` com o nome do estado, e a região `status-region` (`aria-live="polite"`) recebe o texto do estado atual. Estados inativos ficam fora do DOM ou com `hidden`.
**Testes:** Criar `src/ui/render.test.ts` com os casos de estados da tabela `render` do PRD 11.4: alternância correta de `data-state`, apenas um estado visível por vez, mensagens distintas nos dois empty states, `status-region` anunciando o loading, e `setDisabled` do formulário acionado ao entrar e sair do loading.
**Critério de aprovação:**
- Ao abrir o app, aparece o Empty State inicial, convidando a buscar uma cidade.
- É possível acionar (por código/console) o Empty State de "não encontrado" com mensagem distinta da inicial.
- O Loading mostra spinner ou skeleton no lugar do conteúdo e desabilita campo e botão; ao sair do loading, voltam a ficar habilitados.
- Apenas um estado é visível por vez.
- Os testes de estados passam; `npm run build` e `npm test` sem erros.

### [ ] T15 — Render do resultado: sidebar (conteúdo)
**Referência:** PRD RF-05, 3 (Segurança), 7.2, 7.4 e 11.4 (`render`)
**O que fazer:** Renderizar a sidebar com os dados de `City` e `CurrentWeather` (use dados de exemplo para validar visualmente): temperatura, `Cidade, PAÍS`, dia atual, indicador dia/noite com ícone sol/lua e Weather Code com ícone SVG + descrição. Ganchos: `temperature`, `city`, `day`, `period`, `weather-description`. Textos vindos de `City` entram com `textContent` (ou escapados), nunca como HTML cru.
**Testes:** Acrescentar em `render.test.ts` os casos da sidebar da tabela `render`: ordem dos 5 itens, `Rio de Janeiro, BR`, sol/`Dia` e lua/`Noite`, unidade vinda de `units` (com `°F`), weather code 0, 63 e 95, e o caso de segurança (cidade com `<img src=x onerror=alert(1)>` aparece como texto e não cria nenhum `img`).
**Critério de aprovação:**
- Os 5 itens aparecem na ordem do PRD 7.2.
- Temperatura exibida com a unidade vinda de `units` e é o maior elemento da sidebar.
- Cidade e código do país no formato `Rio de Janeiro, BR`.
- Dia atual no formato do PRD 7.4.
- `isDay` verdadeiro mostra sol e "Dia"; falso mostra lua e "Noite".
- Weather Code mostra ícone e descrição corretos para pelo menos três códigos diferentes testados (ex.: 0, 63, 95).
- O caso de injeção de HTML passa; `npm run build` e `npm test` sem erros.

### [ ] T16 — Visual da sidebar por dia/noite
**Referência:** PRD 7.2 (Visual por `is_day`) e 11.4 (Contraste)
**O que fazer:** Aplicar `data-period="day|night"` na sidebar e criar os dois temas por variáveis CSS. Definir em `main.css` os tokens `--day-text`, `--day-bg-from`, `--day-bg-to`, `--night-text`, `--night-bg-from` e `--night-bg-to` (usados pelos gradientes e pelo teste de contraste).
**Testes:** Criar `src/test/helpers/contrast.ts` (razão de contraste WCAG entre duas cores hex) com testes próprios (ex.: preto/branco = 21; cores iguais = 1) e `src/ui/contrast.test.ts`, que lê `main.css` com `?raw`, extrai os tokens e exige razão ≥ 4,5:1 entre o texto e **cada ponta** do gradiente, nos dois temas. Acrescentar em `render.test.ts` que `data-period` é `day`/`night` conforme `isDay`.
**Critério de aprovação:**
- Com `isDay` verdadeiro, a sidebar usa o tema claro/quente com texto escuro.
- Com `isDay` falso, a sidebar usa o tema escuro/azulado com texto claro.
- O texto e os ícones são legíveis nos dois temas (contraste ≥ 4.5:1 para texto normal, comprovado pelo teste).
- Trocar entre os dois temas não altera o layout.
- `npm run build` e `npm test` sem erros.

### [ ] T17 — Render do resultado: área principal
**Referência:** PRD RF-05, 7.3, 7.4 e 11.4 (`render`)
**O que fazer:** Renderizar os 4 blocos da área principal (umidade relativa, temperatura aparente, probabilidade de precipitação, vento) em grade 2×2. Ganchos: `humidity`, `apparent-temperature`, `precipitation-probability`, `wind`.
**Testes:** Acrescentar em `render.test.ts` os casos da área principal: 4 blocos com rótulo, valor e unidade; `%` em umidade e probabilidade; formato `5,8 km/h · 277° (O)` no vento; unidades vindas de `units` (testar com unidades alteradas); `precipitation` (mm) ausente.
**Critério de aprovação:**
- Os 4 blocos aparecem, cada um com rótulo, valor e unidade vindos de `units`.
- Umidade e probabilidade de precipitação exibem `%`; temperatura aparente exibe `°C` no formato pt-BR.
- Vento exibe velocidade, unidade, graus e ponto cardeal (ex.: `5,8 km/h · 277° (O)`).
- `precipitation` (mm) **não** é exibida.
- Os testes da área principal passam; `npm run build` e `npm test` sem erros.

---

## Fase 5 — Integração

### [ ] T18 — Orquestrar o fluxo de busca
**Referência:** PRD RF-02, RF-03, RF-04, 3 (Concorrência), 4.4 e 11.4 (Integração)
**O que fazer:** Ligar tudo em `src/main.ts`: o envio do formulário executa `searchCity` e depois `getCurrentWeather`, alternando os estados loading, empty e resultado. Usar `AbortController` para cancelar a busca anterior quando uma nova começar.
**Testes:** Criar/estender `src/main.test.ts` (jsdom + `mockFetch` com as fixtures) com **todos** os casos da tabela "Integração: fluxo de busca" do PRD 11.4. O teste observa a sequência de `data-state` com `MutationObserver` (deve ser exatamente `loading` → `resultado`, sem estado intermediário) e usa respostas *deferred* para a corrida entre buscas. Importar `main.ts` dinamicamente (`vi.resetModules()` + `import('./main')`) após montar o DOM.
**Critério de aprovação:**
- Buscar `"Rio de Janeiro"` mostra loading e depois sidebar e área principal com dados reais.
- Buscar uma cidade inexistente mostra o Empty State de "não encontrado", e o Forecast não é chamado.
- Simular falha do Forecast (HTTP 500, erro de rede, JSON inválido, campo obrigatório ausente) mostra o Empty State, sem dados parciais nem restos da busca anterior.
- Há **um único** loading cobrindo as duas requisições (sem flash de estado intermediário entre elas).
- Duas buscas em sequência rápida: só o resultado da última é exibido, mesmo que a resposta da primeira chegue depois, e o sinal da primeira foi abortado.
- Campo e botão ficam desabilitados durante o loading e voltam ao normal depois, inclusive em caso de erro.
- Nenhum `console.error` nos testes de sucesso, não encontrado, falha de rede e abort.
- Verificação manual no DevTools com throttling de rede da corrida entre buscas e do fluxo real (a T22 confirma o contrato).
- `npm run build` e `npm test` sem erros.

### [ ] T19 — Responsividade
**Referência:** PRD 3 (Responsividade) e 7.5
**O que fazer:** Ajustar o CSS para telas estreitas.
**Testes:** A verificação automática (larguras 320 a 1920 px, empilhamento, ausência de rolagem horizontal) é feita no E2E da T21. Nesta tarefa, conferir manualmente no DevTools e registrar as larguras testadas na observação.
**Critério de aprovação:**
- Abaixo de ~640 px, a sidebar fica acima e a área principal abaixo, e o card ocupa a largura disponível com margens laterais.
- Sem rolagem horizontal em larguras de 320 px a 1920 px.
- Campo de busca nunca excede a largura da tela.
- Em desktop (≥ 800 px), o card continua limitado a 800 px e centralizado.
- `npm run build` e `npm test` sem erros.

---

## Fase 6 — Testes de ponta a ponta e fechamento

### [ ] T20 — Configurar o Playwright (E2E)
**Referência:** PRD 11.2 e 11.3
**O que fazer:**
- Instalar `@playwright/test` e `@axe-core/playwright` como `devDependencies` e baixar o Chromium (`npx playwright install chromium`).
- Criar `playwright.config.ts` com `testDir: 'e2e'`, `webServer` subindo o app (`npm run dev` ou `vite preview` após build) e um projeto Chromium (Firefox e WebKit opcionais).
- Script `test:e2e` (`playwright test`). Adicionar `test-results` e `playwright-report` ao `.gitignore`.
- Criar `e2e/helpers.ts` que mocka a Open-Meteo com `page.route` (geocoding e forecast), a partir das fixtures da T02, permitindo variações (404/500, `abort()`, JSON sem campo, atraso) e contando requisições.
- Criar `e2e/smoke.spec.ts`: abre o app e vê o Empty State inicial; busca "Rio de Janeiro" e vê a sidebar preenchida.
- Garantir que o `vitest` **não** colete `e2e/*.spec.ts` (o `include` do Vitest já restringe a `src/**/*.test.ts`).
**Critério de aprovação:**
- `npm run test:e2e` passa com o smoke test.
- Nenhuma requisição real sai para `open-meteo.com` durante o E2E (o helper falha o teste se uma requisição não mockada passar).
- `npm test` continua verde e não executa os specs do Playwright.
- `npm run build` sem erros.

### [ ] T21 — Cenários E2E
**Referência:** PRD 10, 11.4 (E2E) e 11.6
**O que fazer:** Criar specs em `e2e/` com **todos** os casos da tabela E2E do PRD 11.4: busca por Enter e por clique; campo vazio sem requisição; cidade inexistente; falhas do Forecast (500, `abort()`, JSON sem campo); corrida entre buscas; fluxo só por teclado; larguras 320, 375, 639, 640, 800 e 1920 px; `timezoneId: 'Pacific/Kiritimati'`; dia e noite; axe nos estados inicial, não encontrado e resultado (dia e noite); cores e estrutura do PRD 7.1. Usar os `data-testid` do PRD 11.3.
**Critério de aprovação:**
- Todos os casos da tabela E2E do PRD 11.4 existem e passam.
- Nos testes de largura: `document.documentElement.scrollWidth <= window.innerWidth` em todas as larguras; sidebar acima da área principal abaixo de 640 px; card ≤ 800 px e centralizado em ≥ 800 px.
- axe sem violações `serious` ou `critical`.
- O teste de corrida falha se a resposta atrasada da primeira busca sobrescrever a segunda (verificar invertendo temporariamente o cancelamento, e registrar na observação).
- `npm run test:e2e`, `npm test` e `npm run build` sem erros.

### [ ] T22 — Teste de contrato com a API real (opt-in)
**Referência:** PRD 5, 9 (item 1), 11.2 e 11.4 (Contrato real)
**O que fazer:** Criar `vitest.live.config.ts` (`include: ['src/**/*.live.test.ts']`, ambiente `node`) e o script `test:live` (`vitest run --config vitest.live.config.ts`). Criar `src/services/openMeteo.live.test.ts` conforme a tabela "Contrato real" do PRD 11.4, chamando a Open-Meteo de verdade para o Rio. Este é o único teste automático que acessa a rede.
**Critério de aprovação:**
- `npm run test:live` passa com acesso à internet: Geocoding e Forecast devolvem os campos do contrato (incluindo `precipitation_probability` em `current` e `current_units` completo) e `searchCity` + `getCurrentWeather` retornam objetos não nulos.
- `npm test` **não** executa o teste live.
- Se algum campo do contrato mudou, o teste falha apontando o campo (e o PRD é revisado antes de seguir).
- `npm run build` sem erros.

### [ ] T23 — Acessibilidade, cobertura e revisão geral
**Referência:** PRD 3 (Acessibilidade), 10 (Critérios de aceite), 11.5 e 11.6
**O que fazer:** Revisar acessibilidade, definir as metas de cobertura da PRD 11.5 como `thresholds` no `vitest.config.ts` (falha se não atingir) e percorrer **todos** os critérios de aceite do PRD seção 10 usando a matriz da 11.6, corrigindo o que falhar. Acrescentar o teste que faltar para qualquer critério sem cobertura.
**Critério de aprovação:**
- Todo o fluxo é utilizável apenas pelo teclado (confirmado pelo E2E e por uma passada manual).
- Ícones têm `aria-label`/`title` ou `aria-hidden` conforme o caso; mudanças de estado (loading, não encontrado) são anunciadas (`aria-live="polite"`, conferido nos testes de `status-region`).
- Todos os itens da checklist do PRD seção 10 estão verdadeiros, cada um verificado de fato e com o teste correspondente da matriz 11.6 existindo e passando.
- `npm run test:coverage` passa com as metas de 11.5 (`src/services` e `src/utils` ≥ 95 % linhas e ≥ 90 % branches; `src/ui` e `src/main.ts` ≥ 85 % e ≥ 80 %).
- `npm run build`, `npm test` e `npm run test:e2e` sem erros e sem avisos de TypeScript; `npm run test:live` verde.
- Não há `.only` nem `.skip` no código (busca no repositório).
- Nenhum `console.error` não tratado durante os fluxos de sucesso, cidade inexistente e falha de rede.