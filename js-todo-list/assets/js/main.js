// App entry point: wires DOM events to the store and
// keeps the UI subscribed to state changes.

import { taskForm, taskInput } from "./dom.js";
import { subscribe, getTasks, addTask, toggleTask, deleteTask } from "./taskStore.js";
import { renderTasks } from "./ui.js";

const taskHandlers = { onToggle: toggleTask, onDelete: deleteTask };

const handleTaskSubmit = (event) => {
  event.preventDefault();
  addTask(taskInput.value);
  taskInput.value = "";
  taskInput.focus();
};

const init = () => {
  taskForm.addEventListener("submit", handleTaskSubmit);
  subscribe((tasks) => renderTasks(tasks, taskHandlers));
  renderTasks(getTasks(), taskHandlers);
};

init();