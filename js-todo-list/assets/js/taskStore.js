// Task store: single source of truth for task data.
// Exposes a small pub/sub API so any part of the app can react
// to state changes without being coupled to how the state is stored.

import { loadTasks, saveTasks } from "./storage.js";

const tasks = loadTasks();
const listeners = new Set();

const notify = () => {
  const snapshot = getTasks();
  saveTasks(snapshot);
  listeners.forEach((listener) => listener(snapshot));
};

export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getTasks = () => [...tasks];

export const addTask = (text) => {
  const trimmedText = text.trim();
  if (!trimmedText) return;

  tasks.push({
    id: crypto.randomUUID(),
    text: trimmedText,
    completed: false,
  });

  notify();
};

export const toggleTask = (id) => {
  const task = tasks.find((currentTask) => currentTask.id === id);
  if (!task) return;

  task.completed = !task.completed;
  notify();
};

export const deleteTask = (id) => {
  const index = tasks.findIndex((currentTask) => currentTask.id === id);
  if (index === -1) return;

  tasks.splice(index, 1);
  notify();
};