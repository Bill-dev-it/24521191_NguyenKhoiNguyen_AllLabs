import { renderApp } from './reactive-engine.js';
import { TaskApp } from './task-app.js';

const root = document.getElementById('app');

renderApp(TaskApp, root);