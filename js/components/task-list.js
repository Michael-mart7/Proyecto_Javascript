// Componente <task-list>: muestra la colección de tareas.
// Propiedades:
//   lista.tasks    = arreglo de tareas YA filtrado (lo entrega el controlador)
//   lista.filtered = true si hay búsqueda o filtro activo (para elegir el mensaje vacío)
// Emite: task:edit con { id: null } (crear primera tarea), task:search y task:filter (limpiar búsqueda)
// Los task-item emiten sus propios eventos y suben hasta <task-app>.

import { EVENTS, TASK_STATUS } from '../shared/constants.js';

const CSS_URL = new URL('../../css/task-list.css', import.meta.url).href;

const PLUS =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"/></svg>';
const CLOSE =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M18 6 6 18M6 6l12 12"/></svg>';
const CLIPBOARD =
    '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 12h.01M9 16h.01M13 12h3M13 16h3"/></svg>';
const SEARCH_X =
    '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M9 9l4 4M13 9l-4 4"/></svg>';

class TaskList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._tasks = [];
        this._filtered = false;
        this._built = false;
    }

    connectedCallback() {
        this.build();
        this.update();
    }

    get tasks() {
        return this._tasks;
    }

    set tasks(value) {
        this._tasks = Array.isArray(value) ? value : [];
        if (this._built) this.update();
    }

    get filtered() {
        return this._filtered;
    }

    set filtered(value) {
        this._filtered = Boolean(value);
        if (this._built) this.update();
    }

    // Estructura fija: cabecera, filas y los dos estados vacíos
    build() {
        if (this._built) return;
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="${CSS_URL}">

            <div class="cabecera" aria-hidden="true">
                <span>Tarea</span>
                <span>Fecha de registro</span>
                <span>Estado</span>
                <span>Origen</span>
                <span class="der">Acciones</span>
            </div>

            <div class="filas" role="list" aria-label="Lista de tareas"></div>

            <section class="vacio" id="sin-tareas" hidden>
                <div class="icono-caja">${CLIPBOARD}</div>
                <h2>Aún no hay tareas</h2>
                <p>Todo empieza con un primer paso. Crea una tarea o importa tu lista para comenzar a organizarte.</p>
                <button type="button" class="btn principal" id="crear">${PLUS}Crear primera tarea</button>
            </section>

            <section class="vacio" id="sin-resultados" hidden>
                <div class="icono-caja">${SEARCH_X}</div>
                <h2>Sin coincidencias</h2>
                <p>Sin resultados para tu búsqueda. Prueba con otras palabras o borra la búsqueda para ver todas tus tareas.</p>
                <button type="button" class="btn secundario" id="limpiar">${CLOSE}Limpiar búsqueda</button>
            </section>
        `;

        const root = this.shadowRoot;

        // Crear primera tarea: el controlador abre el formulario vacío cuando id es null
        root.getElementById('crear').addEventListener('click', () => {
            this.emit(EVENTS.EDIT, { id: null });
        });

        // Limpiar búsqueda: reinicia el texto y el filtro de estado
        root.getElementById('limpiar').addEventListener('click', () => {
            this.emit(EVENTS.SEARCH, { query: '' });
            this.emit(EVENTS.FILTER, { status: TASK_STATUS.ALL });
        });

        this._built = true;
    }

    update() {
        const root = this.shadowRoot;
        const hasTasks = this._tasks.length > 0;

        root.querySelector('.cabecera').hidden = !hasTasks;
        root.querySelector('.filas').hidden = !hasTasks;
        root.getElementById('sin-tareas').hidden = hasTasks || this._filtered;
        root.getElementById('sin-resultados').hidden = hasTasks || !this._filtered;

        this.renderRows();
    }

    // Reutiliza los task-item que ya existen (así no se pierde el foco al marcar una tarea)
    renderRows() {
        const rows = this.shadowRoot.querySelector('.filas');

        const existing = new Map();
        for (const element of rows.children) existing.set(element.task?.id, element);

        const currentIds = new Set(this._tasks.map((task) => task.id));
        for (const [id, element] of existing) {
            if (!currentIds.has(id)) element.remove();
        }

        this._tasks.forEach((task, index) => {
            let element = existing.get(task.id);
            if (!element) element = document.createElement('task-item');
            element.task = task;
            if (rows.children[index] !== element) {
                rows.insertBefore(element, rows.children[index] || null);
            }
        });
    }

    emit(name, detail) {
        this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
    }
}

customElements.define('task-list', TaskList);
