 
import { TASK_ORIGIN } from './constants.js';

// Generar identificador único
export function generateId() {
    const uuid = crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(36) +
          Math.random().toString(36).slice(2, 10);

    return 'task-' + uuid;
}

// Crear tarea local
export function createLocalTask({ title, completed = false }) {
    return {
        id: generateId(),
        title: title.trim(),
        createdAt: new Date().toISOString(),
        completed: completed,
        origin: TASK_ORIGIN.LOCAL,
        sourceId: null
    };
}

// Crear tarea importada
export function createImportedTask(apiTask) {
    return {
        id: generateId(),
        title: apiTask.title,
        createdAt: new Date().toISOString(),
        completed: apiTask.completed,
        origin: TASK_ORIGIN.API,
        sourceId: apiTask.id
    };
}
