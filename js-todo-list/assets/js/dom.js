// Centralized DOM references.
// Keeping every element lookup here means the rest of the app
// never touches document.querySelector directly.

export const taskForm = document.getElementById("task-form");
export const taskInput = document.getElementById("task-input");
export const taskList = document.getElementById("task-list");
export const taskProgress = document.getElementById("task-progress");
export const emptyState = document.getElementById("empty-state");