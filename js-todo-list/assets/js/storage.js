// Persistence layer: the only module that talks to localStorage.
// Keeping this isolated means the storage mechanism could be swapped
// (e.g. for an API) without touching the store or the UI.

const STORAGE_KEY = "todo-list.tasks";

export const loadTasks = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Could not load tasks from localStorage:", error);
    return [];
  }
};

export const saveTasks = (tasks) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Could not save tasks to localStorage:", error);
  }
};