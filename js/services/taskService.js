// Es el único que toca el arreglo de tareas y localStorage.
// Las funciones que modifican datos devuelven { ok: true, ... } o { ok: false, message }.
// Nunca lanzan errores por reglas de negocio.

import { STORAGE_KEY, TASK_ORIGIN } from '../shared/constants.js';
import { createLocalTask } from '../shared/utils.js';

// Único arreglo de tareas en memoria (locales e importadas juntas)
let tasks = [];

/* ---------- Persistencia ---------- */

// Comprueba que un objeto tenga la forma del contrato
function isValidTask(t) {
    return (
        t !== null &&
        typeof t === 'object' &&
        typeof t.id === 'string' &&
        typeof t.title === 'string' &&
        typeof t.createdAt === 'string' &&
        typeof t.completed === 'boolean' &&
        (t.origin === TASK_ORIGIN.LOCAL || t.origin === TASK_ORIGIN.API) &&
        (t.sourceId === null || typeof t.sourceId === 'number')
    );
}

function persist() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        return { ok: true };
    } catch (error) {
        return { ok: false, message: 'No se pudo guardar en el navegador.' };
    }
}

// Aplica el cambio y lo guarda; si el guardado falla, lo revierte
function commit(nextTasks, successResult) {
    const previous = tasks;
    tasks = nextTasks;
    const saved = persist();
    if (!saved.ok) {
        tasks = previous;
        return saved;
    }
    return successResult;
}

/* ---------- Lectura ---------- */

export function loadTasks() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === null) {
            tasks = [];
            return { ok: true, data: [] };
        }
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) throw new Error('Formato inválido');
        tasks = parsed.filter(isValidTask);
        return { ok: true, data: getTasks() };
    } catch (error) {
        // JSON dañado o localStorage no disponible: se empieza vacío
        tasks = [];
        return { ok: false, message: 'No se pudieron leer las tareas guardadas.' };
    }
}

// Devuelve copias para que nadie modifique el arreglo interno por error
export function getTasks() {
    return tasks.map((task) => ({ ...task }));
}

/* ---------- Escritura ---------- */

function cleanTitle(title) {
    return typeof title === 'string' ? title.trim() : '';
}

export function addTask({ title, completed } = {}) {
    const clean = cleanTitle(title);
    if (!clean) return { ok: false, message: 'El título no puede estar vacío.' };

    const task = createLocalTask({ title: clean, completed: Boolean(completed) });
    return commit([...tasks, task], { ok: true, data: { ...task } });
}

export function updateTask(id, { title, completed } = {}) {
    const current = tasks.find((t) => t.id === id);
    if (!current) return { ok: false, message: 'La tarea no existe.' };
    if (current.origin === TASK_ORIGIN.API) {
        return { ok: false, message: 'Las tareas importadas no se pueden editar.' };
    }

    const clean = cleanTitle(title);
    if (!clean) return { ok: false, message: 'El título no puede estar vacío.' };

    // createdAt, origin y sourceId se conservan al editar
    const updated = { ...current, title: clean, completed: Boolean(completed) };
    return commit(
        tasks.map((t) => (t.id === id ? updated : t)),
        { ok: true, data: { ...updated } }
    );
}

export function toggleTask(id) {
    const current = tasks.find((t) => t.id === id);
    if (!current) return { ok: false, message: 'La tarea no existe.' };
    if (current.origin === TASK_ORIGIN.API) {
        return {
            ok: false,
            message: 'Las tareas importadas no se pueden marcar como completadas o pendientes.'
        };
    }

    const updated = { ...current, completed: !current.completed };
    return commit(
        tasks.map((t) => (t.id === id ? updated : t)),
        { ok: true, data: { ...updated } }
    );
}

export function deleteTask(id) {
    if (!tasks.some((t) => t.id === id)) {
        return { ok: false, message: 'La tarea no existe.' };
    }
    return commit(
        tasks.filter((t) => t.id !== id),
        { ok: true, deleted: 1 }
    );
}

// Solo afecta a las tareas locales; informa cuántas cambiaron
export function completeAll() {
    let updatedCount = 0;
    const next = tasks.map((t) => {
        if (t.origin === TASK_ORIGIN.LOCAL && !t.completed) {
            updatedCount += 1;
            return { ...t, completed: true };
        }
        return t;
    });

    if (updatedCount === 0) return { ok: true, updated: 0 };
    return commit(next, { ok: true, updated: updatedCount });
}

// Elimina locales e importadas (la confirmación la pide el controlador)
export function clearTasks() {
    const total = tasks.length;
    return commit([], { ok: true, deleted: total });
}

// Recibe objetos ya normalizados por B (createImportedTask). No borra tareas existentes.
export function importTasks(normalizedTasks) {
    if (!Array.isArray(normalizedTasks)) {
        return { ok: false, message: 'No hay tareas para importar.' };
    }

    const knownSourceIds = new Set(
        tasks.filter((t) => t.origin === TASK_ORIGIN.API).map((t) => t.sourceId)
    );
    const toAdd = [];
    let skipped = 0;

    for (const candidate of normalizedTasks) {
        const valid =
            isValidTask(candidate) &&
            candidate.origin === TASK_ORIGIN.API &&
            typeof candidate.sourceId === 'number';

        if (!valid || knownSourceIds.has(candidate.sourceId)) {
            skipped += 1;
            continue;
        }
        knownSourceIds.add(candidate.sourceId); // evita duplicados dentro del mismo lote
        toAdd.push({ ...candidate });
    }

    if (toAdd.length === 0) return { ok: true, added: 0, skipped };
    return commit([...tasks, ...toAdd], { ok: true, added: toAdd.length, skipped });
}
