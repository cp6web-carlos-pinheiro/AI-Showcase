# PRD: Expense Dashboard (Painel de Despesas)

## 1. Overview

A simple, single-page expense dashboard where the user can add expenses and see them listed, along with the overall total and a per-category breakdown. The project prioritizes simple, easy-to-maintain code over feature depth.

## 2. Tech Stack

- **Build tool:** Vite
- **Language:** Vanilla TypeScript (no UI framework)
- **Markup and styling:** Plain HTML and CSS

## 3. Layout

The page is split into two areas:

**Sidebar (left)**
- Total sum of all expenses
- Total for each category

**Main area**
- A card with a form to add a new expense
- A list of all added expenses, displayed below the add-expense card

## 4. Data Model

### Expense

| Field       | Type        | Description                     |
|-------------|-------------|---------------------------------|
| `id`        | `string`    | Unique identifier of the expense |
| `titulo`    | `string`    | Title / description of the expense |
| `valor`     | `number`    | Amount of the expense           |
| `categoria` | `Categoria` | Category of the expense         |

### Categories

Categories are fixed and cannot be created or edited by the user:

- `"alimento"` (food)
- `"transporte"` (transport)
- `"lazer"` (leisure)
- `"saúde"` (health)
- `"outros"` (other)

## 5. Functional Requirements

1. The user can add a new expense through the card at the top of the main area, providing a title, an amount, and one of the fixed categories.
2. Every added expense appears in the expense list below the card.
3. The sidebar shows the total sum of all expenses.
4. The sidebar shows the total for each category.
5. Sidebar totals reflect the current list of expenses.

## 6. Technical Requirements

- **Event handling:** All events must be attached in TypeScript. No inline event handlers in the HTML (e.g., no `onclick="..."`).
- **Types:** All types must live in `src/types.ts`.
- **Code style:** Keep the code simple and easy to maintain.
- **Persistence:** None. Data lives in memory only and is lost on page reload.

## 7. Out of Scope

- Data persistence (localStorage, backend, or any database)
- User-defined categories
- Any UI framework or state management library