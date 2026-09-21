import "@fontsource-variable/instrument-sans";
import "./style.css";
import type { Categoria, Despesa } from "./types";

// ---------------------------------------------------------------------------
// Dados
// ---------------------------------------------------------------------------

// Fonte única das categorias. O tipo Record garante que toda categoria
// de `Categoria` tenha um rótulo (o TypeScript reclama se faltar alguma).
const ROTULOS: Record<Categoria, string> = {
  alimento: "Alimento",
  transporte: "Transporte",
  lazer: "Lazer",
  saúde: "Saúde",
  outros: "Outros",
};

const CATEGORIAS = Object.keys(ROTULOS) as Categoria[];

const formatoMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// Sem persistência: as despesas vivem apenas em memória.
const despesas: Despesa[] = [];

// ---------------------------------------------------------------------------
// Elementos da página
// ---------------------------------------------------------------------------

function obter<T extends HTMLElement>(id: string): T {
  const elemento = document.getElementById(id);
  if (!elemento) {
    throw new Error(`Elemento #${id} não encontrado no HTML.`);
  }
  return elemento as T;
}

const formulario = obter<HTMLFormElement>("form-despesa");
const campoTitulo = obter<HTMLInputElement>("campo-titulo");
const campoValor = obter<HTMLInputElement>("campo-valor");
const campoCategoria = obter<HTMLSelectElement>("campo-categoria");
const mensagemErro = obter<HTMLParagraphElement>("mensagem-erro");

const listaDespesas = obter<HTMLUListElement>("lista-despesas");
const mensagemVazia = obter<HTMLParagraphElement>("mensagem-vazia");

const totalGeral = obter<HTMLParagraphElement>("total-geral");
const barraCategorias = obter<HTMLDivElement>("barra-categorias");
const listaCategorias = obter<HTMLUListElement>("lista-categorias");

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

function criarElemento<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  classe?: string,
  texto?: string,
): HTMLElementTagNameMap[K] {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function calcularTotais() {
  const porCategoria = Object.fromEntries(CATEGORIAS.map((categoria) => [categoria, 0])) as Record<Categoria, number>;

  for (const despesa of despesas) {
    porCategoria[despesa.categoria] += despesa.valor;
  }

  const geral = CATEGORIAS.reduce((soma, categoria) => soma + porCategoria[categoria], 0);
  return { geral, porCategoria };
}

// ---------------------------------------------------------------------------
// Renderização
// ---------------------------------------------------------------------------

function renderizarLista(): void {
  listaDespesas.replaceChildren();
  mensagemVazia.hidden = despesas.length > 0;

  // A despesa mais recente aparece primeiro.
  for (const despesa of [...despesas].reverse()) {
    const item = criarElemento("li", "despesa");
    item.dataset.categoria = despesa.categoria;

    const texto = criarElemento("div", "despesa__texto");
    texto.append(
      criarElemento("span", "despesa__titulo", despesa.titulo),
      criarElemento("span", "despesa__categoria", ROTULOS[despesa.categoria]),
    );

    item.append(texto, criarElemento("span", "despesa__valor", formatoMoeda.format(despesa.valor)));
    listaDespesas.append(item);
  }
}

function renderizarResumo(): void {
  const { geral, porCategoria } = calcularTotais();

  totalGeral.textContent = formatoMoeda.format(geral);

  // Barra segmentada: cada categoria ocupa a sua fatia do total.
  barraCategorias.replaceChildren();
  for (const categoria of CATEGORIAS) {
    if (porCategoria[categoria] === 0) continue;

    const segmento = criarElemento("span", "barra__segmento");
    segmento.dataset.categoria = categoria;
    segmento.style.width = `${(porCategoria[categoria] / geral) * 100}%`;
    barraCategorias.append(segmento);
  }

  // Total de cada categoria.
  listaCategorias.replaceChildren();
  for (const categoria of CATEGORIAS) {
    const item = criarElemento("li", "categoria");
    item.dataset.categoria = categoria;
    item.append(
      criarElemento("span", "categoria__marcador"),
      criarElemento("span", "categoria__nome", ROTULOS[categoria]),
      criarElemento("span", "categoria__valor", formatoMoeda.format(porCategoria[categoria])),
    );
    listaCategorias.append(item);
  }
}

function renderizar(): void {
  renderizarLista();
  renderizarResumo();
}

function preencherCategorias(): void {
  for (const categoria of CATEGORIAS) {
    campoCategoria.append(new Option(ROTULOS[categoria], categoria));
  }
}

// ---------------------------------------------------------------------------
// Ações
// ---------------------------------------------------------------------------

function mostrarErro(mensagem: string, campo: HTMLElement): void {
  mensagemErro.textContent = mensagem;
  campo.focus();
}

function adicionarDespesa(evento: SubmitEvent): void {
  evento.preventDefault();

  const titulo = campoTitulo.value.trim();
  const valor = campoValor.valueAsNumber;

  if (titulo === "") {
    mostrarErro("Informe um título para a despesa.", campoTitulo);
    return;
  }

  if (!Number.isFinite(valor) || valor <= 0) {
    mostrarErro("Informe um valor maior que zero.", campoValor);
    return;
  }

  despesas.push({
    id: crypto.randomUUID(),
    titulo,
    valor,
    categoria: campoCategoria.value as Categoria,
  });

  mensagemErro.textContent = "";
  campoTitulo.value = "";
  campoValor.value = "";
  campoTitulo.focus();

  renderizar();
}

// ---------------------------------------------------------------------------
// Inicialização
// ---------------------------------------------------------------------------

preencherCategorias();
formulario.addEventListener("submit", adicionarDespesa);
renderizar();
