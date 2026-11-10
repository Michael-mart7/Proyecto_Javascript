// Componente <task-form-modal>: formulario para crear o editar una tarea.
// Método público: modal.open(task)  -> task = objeto para editar, o null/undefined para una tarea nueva
// Emite: task:save con { id: null | string, title, description, completed }
// No guarda nada: solo avisa. El controlador llama a addTask() o updateTask().

import { EVENTS, TASK_ORIGIN } from '../shared/constants.js';

const CSS_URL = new URL('../../css/task-form-modal.css', import.meta.url).href;

const CLOSE_ICON =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M18 6 6 18M6 6l12 12"/></svg>';
const CALENDAR_ICON =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>';

function formatDate(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Elemento con foco real, atravesando los Shadow DOM (para devolver el foco al cerrar)
function deepActiveElement() {
    let element = document.activeElement;
    while (element && element.shadowRoot && element.shadowRoot.activeElement) {
        element = element.shadowRoot.activeElement;
    }
    return element;
}

class TaskFormModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._task = null;
        this._opener = null;
    }

    connectedCallback() {
        if (this.shadowRoot.childElementCount === 0) this.build();
    }

    build() {
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="${CSS_URL}">
            <dialog aria-labelledby="titulo-modal">
                <form novalidate>
                    <header class="encabezado">
                        <div>
                            <h2 id="titulo-modal"></h2>
                            <p class="subtitulo"></p>
                        </div>
                        <button type="button" class="cerrar" aria-label="Cerrar formulario">${CLOSE_ICON}</button>
                    </header>

                    <div class="campo">
                        <label for="titulo">Título</label>
                        <input type="text" id="titulo" name="titulo" maxlength="120" autocomplete="off"
                            placeholder="Ej.: Preparar el proyecto final">
                        <p class="error" id="error-titulo" hidden></p>
                    </div>

                    <div class="campo">
                        <label for="descripcion">Descripción</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            maxlength="1000"
                            rows="4"
                            placeholder="Agrega información sobre esta tarea..."></textarea>
                        <p class="ayuda">Describe brevemente qué debes realizar (máximo 1000 caracteres).</p>
                    </div>

                    <div class="campo">
                        <label for="fecha">Fecha de registro</label>
                        <div class="con-icono">
                            <input type="text" id="fecha" readonly aria-describedby="ayuda-fecha">
                            ${CALENDAR_ICON}
                        </div>
                        <p class="ayuda" id="ayuda-fecha">Se genera automáticamente y no cambia al editar.</p>
                    </div>

                    <div class="campo" role="group" aria-labelledby="etiqueta-estado">
                        <span class="etiqueta" id="etiqueta-estado">Estado</span>
                        <label class="opcion" for="completada">
                            <input type="checkbox" id="completada" name="completada">
                            Marcar como completada
                        </label>
                    </div>

                    <p class="nota">Se guardará como una tarea local.</p>

                    <footer class="pie">
                        <button type="button" class="boton cancelar">Cancelar</button>
                        <button type="submit" class="boton guardar">Guardar tarea</button>
                    </footer>
                </form>
            </dialog>
        `;

        const root = this.shadowRoot;
        const dialog = root.querySelector('dialog');
        const form = root.querySelector('form');

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.submit();
        });

        root.querySelector('.cancelar').addEventListener('click', () => dialog.close());
        root.querySelector('.cerrar').addEventListener('click', () => dialog.close());

        // Clic en el fondo oscuro cierra (el form ocupa todo el cuadro, el fondo es el propio dialog)
        dialog.addEventListener('click', (event) => {
            if (event.target === dialog) dialog.close();
        });

        // Al cerrar (Esc, Cancelar, Guardar o clic fuera) el foco vuelve al botón que lo abrió
        dialog.addEventListener('close', () => {
            this._opener?.focus?.();
            this._opener = null;
        });

        // Al escribir, se quita el mensaje de error
        root.getElementById('titulo').addEventListener('input', () => this.showError(''));
    }

    // Abre el formulario vacío (tarea nueva) o con los datos de la tarea (edición)
    open(task = null) {
        if (this.shadowRoot.childElementCount === 0) this.build();

        // Las tareas importadas no se editan (el servicio también las rechaza)
        if (task && task.origin === TASK_ORIGIN.API) return;

        const root = this.shadowRoot;
        const dialog = root.querySelector('dialog');
        if (dialog.open) return;

        this._task = task;
        this._opener = deepActiveElement();

        root.getElementById('titulo-modal').textContent = task ? 'Editar tarea' : 'Nueva tarea';
        root.querySelector('.subtitulo').textContent = task
            ? 'Actualiza los datos de tu tarea.'
            : 'Un paso más hacia lo que importa.';
        root.getElementById('titulo').value = task ? task.title : '';
        root.getElementById('descripcion').value = task ? (task.description || '') : '';
        root.getElementById('completada').checked = task ? task.completed : false;
        root.getElementById('fecha').value = formatDate(task ? task.createdAt : new Date().toISOString());
        this.showError('');

        dialog.showModal();
        root.getElementById('titulo').focus(); // el foco pasa al primer campo
    }

    showError(message) {
        const root = this.shadowRoot;
        const input = root.getElementById('titulo');
        const error = root.getElementById('error-titulo');

        error.textContent = message;
        error.hidden = !message;

        if (message) {
            input.setAttribute('aria-invalid', 'true');
            input.setAttribute('aria-describedby', 'error-titulo');
        } else {
            input.removeAttribute('aria-invalid');
            input.removeAttribute('aria-describedby');
        }
    }

    submit() {
        const root = this.shadowRoot;
        const input = root.getElementById('titulo');
        const title = input.value.trim();
        const description = root.getElementById('descripcion').value.trim();

        if (!title) {
            this.showError('El título no puede estar vacío.');
            input.focus();
            return;
        }

        this.dispatchEvent(
            new CustomEvent(EVENTS.SAVE, {
                detail: {
                    id: this._task ? this._task.id : null,
                    title,
                    description,
                    completed: root.getElementById('completada').checked
                },
                bubbles: true,
                composed: true
            })
        );

        root.querySelector('dialog').close();
    }
}

customElements.define('task-form-modal', TaskFormModal);
