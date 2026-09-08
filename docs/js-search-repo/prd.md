# PRD — GitHub Repository Search

## Overview

A simple web application where the user searches GitHub repositories by keyword and views the results in a formatted list.

---

## Features

### Search

- The user types a term into the search field.
- The search is triggered **only when ENTER is pressed** (not in real time while typing).
- The application queries the GitHub API and displays the repositories found.

### Information displayed per repository

Each result must show:

| Field | Description |
|-------|-----------|
| Author | Author's name and photo |
| Repository | Repository name |
| Description | Repository description |
| Language | Main language used |
| Stars | Number of stars |
| Link | Direct link to the repository on GitHub |

### Interface states

| State | When to display |
|--------|---------------|
| **Loading** | While the request to the API is in progress |
| **Results** | When the search returns repositories |
| **Empty state** | When the search returns no results |
| **Error** | When the request fails — display a user-friendly message |

### Layout and appearance

- Content centered on the page, with a maximum width of **700px**.
- Page background darker than the cards.
- **Search card**: search field inside a card with rounded corners.
- **Results card**: list of repositories inside a card with rounded corners.

---

## Technical decisions

### GitHub API

- **Endpoint:** `https://api.github.com/search/repositories?q={KEYWORD}&sort=stars&per_page=10`
- `{KEYWORD}` is replaced with the term typed by the user.
- Results sorted by stars (`sort=stars`), limited to 10 per page (`per_page=10`).

### HTTP request

- Use native JavaScript `fetch`.
- Implement with `async/await` inside `try/catch`.
- Check the response `status` before processing the data.

### Events and code structure

- All event listeners must be registered in JavaScript.
- No event (`onclick`, `onkeydown`, etc.) should be defined directly in the HTML.