// GitHub Repository Search
// All event and rendering logic lives here — no onclick/onkeydown in the HTML.

const GITHUB_SEARCH_URL = "https://api.github.com/search/repositories";
const RESULTS_PER_PAGE = 10;

// Approximate colors per language, used only for the visual indicator (dot).
// If the language isn't in the map, a neutral color is used.
const LANGUAGE_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
};
const DEFAULT_LANGUAGE_COLOR = "#9099a8";

const searchInput = document.getElementById("search-input");
const resultsContent = document.getElementById("results-content");

function init() {
  searchInput.addEventListener("keydown", handleSearchKeydown);
}

function handleSearchKeydown(event) {
  if (event.key !== "Enter") {
    return;
  }

  const term = searchInput.value.trim();
  if (term === "") {
    return;
  }

  searchRepositories(term);
}

async function searchRepositories(term) {
  renderLoading();

  const url = `${GITHUB_SEARCH_URL}?q=${encodeURIComponent(term)}&sort=stars&per_page=${RESULTS_PER_PAGE}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Request failed: status ${response.status}`);
    }

    const data = await response.json();
    const repositories = data.items || [];

    if (repositories.length === 0) {
      renderEmpty();
    } else {
      renderResults(repositories);
    }
  } catch (error) {
    console.error("Failed to fetch repositories:", error);
    renderError();
  }
}

function renderLoading() {
  resultsContent.innerHTML = `
    <p class="loading-message">
      <span class="spinner" aria-hidden="true"></span>
      Searching repositories…
    </p>
  `;
}

function renderEmpty() {
  resultsContent.innerHTML = `
    <p class="empty-message">No repositories found for this search.</p>
  `;
}

function renderError() {
  resultsContent.innerHTML = `
    <p class="error-message">Couldn't fetch repositories right now. Please try again shortly.</p>
  `;
}

function renderResults(repositories) {
  resultsContent.innerHTML = "";

  repositories.forEach((repo) => {
    resultsContent.appendChild(createRepositoryItem(repo));
  });
}

function createRepositoryItem(repo) {
  const item = document.createElement("article");
  item.className = "repo-item";

  const author = repo.owner ? repo.owner.login : "unknown";
  const avatarUrl = repo.owner ? repo.owner.avatar_url : "";
  const language = repo.language || "Not specified";
  const languageColor = LANGUAGE_COLORS[repo.language] || DEFAULT_LANGUAGE_COLOR;
  const description = repo.description || "No description.";
  const stars = formatNumber(repo.stargazers_count);

  item.innerHTML = `
    <img class="repo-avatar" src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(author)}'s avatar" />
    <div class="repo-main">
      <div class="repo-header">
        <span class="repo-author">${escapeHtml(author)} /</span>
        <a class="repo-name" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(repo.name)}
        </a>
      </div>
      <p class="repo-description">${escapeHtml(description)}</p>
      <div class="repo-meta">
        <span class="repo-language">
          <span class="language-dot" style="background:${languageColor}"></span>
          ${escapeHtml(language)}
        </span>
        <span class="repo-stars">★ ${stars}</span>
      </div>
    </div>
  `;

  return item;
}

function formatNumber(number) {
  return new Intl.NumberFormat("en-US").format(number);
}

// Prevents data coming from the API from breaking the HTML or injecting unwanted content.
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

init();