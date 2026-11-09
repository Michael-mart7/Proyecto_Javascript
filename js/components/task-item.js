// Componente <task-item>: muestra UNA tarea como una fila (Integrante A).
// Uso: elemento.task = { id, title, createdAt, completed, origin, sourceId }
// Emite: task:toggle, task:edit, task:delete

import { EVENTS, TASK_ORIGIN } from '../shared/constants.js';

// Ruta del CSS calculada desde este archivo, para que funcione sin importar dónde se abra la página
const CSS_URL = new URL('../../css/task-item.css', import.meta.url).href;

// Iconos simples en SVG (solo dibujo, sin datos del usuario)
const ICONS = {
    edit: '<path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    cloud: '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    check: '<polyline points="20 6 9 17 4 12"/>'
};

function icon(name) {
    return `<svg class="icono" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
}

// 2026-11-04T18:00:00.000Z -> 04/11/2026
function formatDate(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

class TaskItem extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._task = null;
    }

    connectedCallback() {
        this.setAttribute('role', 'listitem');
        this.render();
    }

    get task() {
        return this._task;
    }

    set task(value) {
        // Si no cambió nada, no se vuelve a dibujar (así no se pierde el foco)
        const unchanged =
            JSON.stringify(value) === JSON.stringify(this._task) && this.shadowRoot.childElementCount > 0;
        this._task = value;
        if (!unchanged) this.render();
    }

    render() {
        const task = this._task;
        if (!task) {
            this.shadowRoot.innerHTML = '';
            return;
        }

        // Recuerda qué botón tenía el foco para devolvérselo después de dibujar
        const focusedAction = this.shadowRoot.activeElement?.dataset?.accion;

        const isApi = task.origin === TASK_ORIGIN.API;

        // Aquí solo va HTML fijo. El texto del usuario se agrega abajo con textContent
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="${CSS_URL}">
            <div class="fila ${task.completed ? 'completada' : ''}">
                <div class="celda tarea">
                    <input type="checkbox" class="check" data-accion="toggle"
                        ${task.completed ? 'checked' : ''} ${isApi ? 'disabled' : ''}>
                    <span class="titulo"></span>
                </div>
                <div class="celda fecha"></div>
                <div class="celda estado">
                    <span class="badge ${task.completed ? 'ok' : 'pendiente'}">
                        ${icon(task.completed ? 'check' : 'clock')}
                        ${task.completed ? 'Completado' : 'Pendiente'}
                    </span>
                </div>
                <div class="celda origen">
                    ${icon(isApi ? 'cloud' : 'monitor')}
                    <span>${isApi ? 'API' : 'Local'}</span>
                </div>
                <div class="celda acciones">
                    <button type="button" class="btn editar" data-accion="editar" ${isApi ? 'disabled' : ''}>
                        ${icon(isApi ? 'lock' : 'edit')}Editar
                    </button>
                    <button type="button" class="btn eliminar" data-accion="eliminar">
                        ${icon('trash')}Eliminar
                    </button>
                </div>
            </div>
        `;

        const root = this.shadowRoot;
        root.querySelector('.titulo').textContent = task.title;
        root.querySelector('.fecha').textContent = formatDate(task.createdAt);

        // Etiquetas accesibles descriptivas
        const checkbox = root.querySelector('.check');
        const editButton = root.querySelector('.editar');
        const deleteButton = root.querySelector('.eliminar');
        checkbox.setAttribute('aria-label', `Marcar como completada: ${task.title}`);
        deleteButton.setAttribute('aria-label', `Eliminar tarea: ${task.title}`);
        editButton.setAttribute(
            'aria-label',
            isApi ? 'Editar no disponible: tarea importada' : `Editar tarea: ${task.title}`
        );
        if (isApi) {
            editButton.title = 'Las tareas importadas no se pueden editar';
            checkbox.title = 'Las tareas importadas no se pueden cambiar de estado';
        }

        // Eventos hacia el controlador (bubbles + composed para salir del Shadow DOM)
        checkbox.addEventListener('change', () => this.emit(EVENTS.TOGGLE, { id: task.id }));
        editButton.addEventListener('click', () => this.emit(EVENTS.EDIT, { id: task.id }));
        deleteButton.addEventListener('click', () => {
            // Ninguna acción destructiva sin aviso
            if (window.confirm(`¿Eliminar la tarea "${task.title}"?`)) {
                this.emit(EVENTS.DELETE, { id: task.id });
            }
        });

        if (focusedAction) root.querySelector(`[data-accion="${focusedAction}"]`)?.focus();
    }

    emit(name, detail) {
        this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
    }
}

customElements.define('task-item', TaskItem);
