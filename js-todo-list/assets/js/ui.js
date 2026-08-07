// Rendering layer: turns task data into DOM elements.
// Nothing here mutates state directly — it only calls the
// handlers it's given, keeping rendering and state decoupled.

import { taskList, taskProgress, emptyState } from "./dom.js";

const TRASH_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
`;

const createTaskElement = (task, { onToggle, onDelete }) => {
  const item = document.createElement("li");
  item.className = "task-item";
  item.dataset.id = task.id;

  const checkbox = document.createElement("button");
  checkbox.type = "button";
  checkbox.className = `task-checkbox${task.completed ? " is-checked" : ""}`;
  checkbox.setAttribute("aria-pressed", String(task.completed));
  checkbox.setAttribute(
    "aria-label",
    task.completed ? "Mark task as not done" : "Mark task as done"
  );
  checkbox.addEventListener("click", () => onToggle(task.id));

  const text = document.createElement("span");
  text.className = `task-title task-text${task.completed ? " is-completed" : ""}`;
  text.textContent = task.text;
  text.addEventListener("click", () => onToggle(task.id));

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "btn btn-icon";
  deleteButton.setAttribute("aria-label", `Delete task: ${task.text}`);
  deleteButton.innerHTML = TRASH_ICON;
  deleteButton.addEventListener("click", () => onDelete(task.id));

  item.append(checkbox, text, deleteButton);
  return item;
};

export const renderTasks = (tasks, handlers) => {
  taskList.innerHTML = "";

  const fragment = document.createDocumentFragment();
  tasks.forEach((task) => fragment.appendChild(createTaskElement(task, handlers)));
  taskList.appendChild(fragment);

  const hasTasks = tasks.length > 0;
  taskList.hidden = !hasTasks;
  emptyState.hidden = hasTasks;

  const completedCount = tasks.filter((task) => task.completed).length;
  taskProgress.textContent = hasTasks
    ? `${completedCount} of ${tasks.length} complete`
    : "";
};