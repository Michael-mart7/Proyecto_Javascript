// Componente <task-detail-modal>: muestra los detalles de una tarea.
// Método público: modal.open(task)
// No modifica ni guarda información.

import { TASK_ORIGIN } from '../shared/constants.js';

const CSS_URL = new URL('../../css/task-detail-modal.css', import.meta.url).href;

const CLOSE_ICON =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M18 6 6 18M6 6l12 12"/></svg>';

// Convertir la fecha a formato día/mes/año
function formatDate(iso) {
    const date = new Date(iso);

    if (Number.isNaN(date.getTime())) return 'Fecha no disponible';

    return date.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Obtener el elemento que tenía el foco, incluso dentro del Shadow DOM
function deepActiveElement() {
    let element = document.activeElement;

    while (element && element.shadowRoot && element.shadowRoot.activeElement) {
        element = element.shadowRoot.activeElement;
    }

    return element;
}

class TaskDetailModal extends HTMLElement {

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        this._task = null;
        this._opener = null;
    }

    connectedCallback() {
        if (this.shadowRoot.childElementCount === 0) {
            this.build();
        }
    }

    // Construir la ventana de detalles
    build() {

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="${CSS_URL}">

            <dialog aria-labelledby="titulo-modal">

                <header class="encabezado">

                    <div>
                        <h2 id="titulo-modal">Detalles de la tarea</h2>
                        <p class="subtitulo">Información completa de tu tarea.</p>
                    </div>

                    <button
                        type="button"
                        class="cerrar"
                        aria-label="Cerrar detalles"
                    >
                        ${CLOSE_ICON}
                    </button>

                </header>

                <section class="contenido">

                    <div class="campo">
                        <span class="etiqueta">Título</span>
                        <p id="titulo-tarea"></p>
                    </div>

                    <div class="campo">
                        <span class="etiqueta">Descripción</span>
                        <p id="descripcion-tarea"></p>
                    </div>

                    <div class="campo">
                        <span class="etiqueta">Fecha de registro</span>
                        <p id="fecha-tarea"></p>
                    </div>

                    <div class="campo">
                        <span class="etiqueta">Estado</span>
                        <span id="estado-tarea" class="badge"></span>
                    </div>

                    <div class="campo">
                        <span class="etiqueta">Origen</span>
                        <span id="origen-tarea" class="badge"></span>
                    </div>

                </section>

                <footer class="pie">
                    <button type="button" class="boton cerrar-final">
                        Cerrar
                    </button>
                </footer>

            </dialog>
        `;

        const root = this.shadowRoot;
        const dialog = root.querySelector('dialog');

        // Cerrar desde los botones
        root.querySelector('.cerrar').addEventListener('click', () => {
            dialog.close();
        });

        root.querySelector('.cerrar-final').addEventListener('click', () => {
            dialog.close();
        });

        // Cerrar al pulsar fuera de la ventana
        dialog.addEventListener('click', (event) => {
            if (event.target === dialog) {
                dialog.close();
            }
        });

        // Devolver el foco al elemento que abrió el modal
        dialog.addEventListener('close', () => {
            this._opener?.focus?.();
            this._opener = null;
        });

    }

    // Abrir la ventana con la información de una tarea
    open(task) {

        if (this.shadowRoot.childElementCount === 0) {
            this.build();
        }

        if (!task) return;

        const root = this.shadowRoot;
        const dialog = root.querySelector('dialog');

        if (dialog.open) return;

        this._task = task;
        this._opener = deepActiveElement();

        // Mostrar el título
        root.getElementById('titulo-tarea').textContent = task.title;

        // Mostrar la descripción
        const description = root.getElementById('descripcion-tarea');

        if (task.description && task.description.trim() !== '') {
            description.textContent = task.description;
        } else if (task.origin === TASK_ORIGIN.API) {
            description.textContent =
                'La API JSONPlaceholder no proporciona una descripción para esta tarea.';
        } else {
            description.textContent = 'No se agregó una descripción.';
        }

        // Mostrar la fecha
        root.getElementById('fecha-tarea').textContent =
            formatDate(task.createdAt);

        // Mostrar el estado
        const status = root.getElementById('estado-tarea');

        status.textContent = task.completed ? 'Completada' : 'Pendiente';
        status.className = task.completed
            ? 'badge completada'
            : 'badge pendiente';

        // Mostrar el origen
        const origin = root.getElementById('origen-tarea');

        origin.textContent = task.origin === TASK_ORIGIN.API
            ? 'Importada desde API'
            : 'Tarea local';

        origin.className = task.origin === TASK_ORIGIN.API
            ? 'badge api'
            : 'badge local';

        // Mostrar la ventana
        dialog.showModal();

        root.querySelector('.cerrar').focus();

    }

}

// Registrar el componente
if (!customElements.get('task-detail-modal')) {
    customElements.define('task-detail-modal', TaskDetailModal);
}