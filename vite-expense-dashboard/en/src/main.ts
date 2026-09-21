import "@fontsource-variable/instrument-sans";
import "./style.css";
import type { Category, Expense } from "./types";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

// Single source of truth for categories. The Record type guarantees that every
// `Category` has a label (TypeScript complains if one is missing).
const LABELS: Record<Category, string> = {
  food: "Food",
  transport: "Transport",
  leisure: "Leisure",
  health: "Health",
  other: "Other",
};

const CATEGORIES = Object.keys(LABELS) as Category[];

const currencyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// No persistence: expenses only live in memory.
const expenses: Expense[] = [];

// ---------------------------------------------------------------------------
// Page elements
// ---------------------------------------------------------------------------

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element #${id} not found in the HTML.`);
  }
  return element as T;
}

const form = getElement<HTMLFormElement>("expense-form");
const titleField = getElement<HTMLInputElement>("title-field");
const amountField = getElement<HTMLInputElement>("amount-field");
const categoryField = getElement<HTMLSelectElement>("category-field");
const errorMessage = getElement<HTMLParagraphElement>("error-message");

const expenseList = getElement<HTMLUListElement>("expense-list");
const emptyMessage = getElement<HTMLParagraphElement>("empty-message");

const totalAmount = getElement<HTMLParagraphElement>("total-amount");
const categoryBar = getElement<HTMLDivElement>("category-bar");
const categoryList = getElement<HTMLUListElement>("category-list");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function calculateTotals() {
  const byCategory = Object.fromEntries(CATEGORIES.map((category) => [category, 0])) as Record<Category, number>;

  for (const expense of expenses) {
    byCategory[expense.category] += expense.amount;
  }

  const overall = CATEGORIES.reduce((sum, category) => sum + byCategory[category], 0);
  return { overall, byCategory };
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function renderList(): void {
  expenseList.replaceChildren();
  emptyMessage.hidden = expenses.length > 0;

  // The most recent expense comes first.
  for (const expense of [...expenses].reverse()) {
    const item = createElement("li", "expense");
    item.dataset.category = expense.category;

    const text = createElement("div", "expense__text");
    text.append(
      createElement("span", "expense__title", expense.title),
      createElement("span", "expense__category", LABELS[expense.category]),
    );

    item.append(text, createElement("span", "expense__amount", currencyFormat.format(expense.amount)));
    expenseList.append(item);
  }
}

function renderSummary(): void {
  const { overall, byCategory } = calculateTotals();

  totalAmount.textContent = currencyFormat.format(overall);

  // Segmented bar: each category takes its share of the total.
  categoryBar.replaceChildren();
  for (const category of CATEGORIES) {
    if (byCategory[category] === 0) continue;

    const segment = createElement("span", "bar__segment");
    segment.dataset.category = category;
    segment.style.width = `${(byCategory[category] / overall) * 100}%`;
    categoryBar.append(segment);
  }

  // Total for each category.
  categoryList.replaceChildren();
  for (const category of CATEGORIES) {
    const item = createElement("li", "category");
    item.dataset.category = category;
    item.append(
      createElement("span", "category__marker"),
      createElement("span", "category__name", LABELS[category]),
      createElement("span", "category__amount", currencyFormat.format(byCategory[category])),
    );
    categoryList.append(item);
  }
}

function render(): void {
  renderList();
  renderSummary();
}

function fillCategories(): void {
  for (const category of CATEGORIES) {
    categoryField.append(new Option(LABELS[category], category));
  }
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function showError(message: string, field: HTMLElement): void {
  errorMessage.textContent = message;
  field.focus();
}

function addExpense(event: SubmitEvent): void {
  event.preventDefault();

  const title = titleField.value.trim();
  const amount = amountField.valueAsNumber;

  if (title === "") {
    showError("Enter a title for the expense.", titleField);
    return;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    showError("Enter an amount greater than zero.", amountField);
    return;
  }

  expenses.push({
    id: crypto.randomUUID(),
    title,
    amount,
    category: categoryField.value as Category,
  });

  errorMessage.textContent = "";
  titleField.value = "";
  amountField.value = "";
  titleField.focus();

  render();
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

fillCategories();
form.addEventListener("submit", addExpense);
render();