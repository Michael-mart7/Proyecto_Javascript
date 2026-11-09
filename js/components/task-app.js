
import { EVENTS, TASK_STATUS } from '../shared/constants.js';

class TaskApp extends HTMLElement {

    constructor() {
        super();

        // Crear Shadow DOM
        this.attachShadow({ mode: 'open' });

        // Datos que recibirá la aplicación
        this._tasks = [];
        this._summaryTasks = [];
        this._apiTasks = [];
        this._importedIds = [];

        this._currentFilter = TASK_STATUS.ALL;
        this._currentSearch = '';

        this._searchTimeout = null;
    }

    connectedCallback() {
        this.render();
        this.addEvents();
    }

    // Construir la interfaz
    render() {

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="./css/task-app.css">

            <main class="app-container">

                <header class="header">
                    <div>
                        <h1>Gestor de tareas</h1>
                        <p>Menos ruido. Más foco en lo importante.</p>
                    </div>

                    <div class="progress-container">
                        <div class="progress-info">
                            <span id="progressText">0 de 0 completadas</span>
                            <strong id="progressPercentage">0 %</strong>
                        </div>

                        <div class="progress-bar">
                            <div id="progressFill"></div>
                        </div>
                    </div>
                </header>

                <section class="toolbar">

                    <input
                        type="search"
                        id="searchInput"
                        placeholder="Buscar tareas..."
                        aria-label="Buscar tareas"
                    >

                    <select id="filterSelect" aria-label="Filtrar tareas">
                        <option value="${TASK_STATUS.ALL}">Todas</option>
                        <option value="${TASK_STATUS.PENDING}">Pendientes</option>
                        <option value="${TASK_STATUS.COMPLETED}">Completadas</option>
                    </select>

                    <button id="btnNueva" class="btn-primary">
                        + Nueva tarea
                    </button>

                    <button id="btnImportar" class="btn-secondary">
                        ↓ Importar
                    </button>

                </section>

                <section class="list-actions">
                    <button id="btnCompleteAll" class="btn-text">
                        Marcar todas
                    </button>

                    <button id="btnClear" class="btn-danger">
                        Vaciar lista
                    </button>
                </section>

                <div id="message" class="message" role="status"
                    aria-live="polite"></div>

                <section class="tasks-container">
                    <task-list></task-list>
                </section>

                <task-form-modal></task-form-modal>

                <task-import-modal></task-import-modal>

            </main>
        `;

        this.updateSummary();
    }

    // Escuchar las acciones del usuario
    addEvents() {

        const searchInput = this.shadowRoot.querySelector('#searchInput');
        const filterSelect = this.shadowRoot.querySelector('#filterSelect');

        // Abrir formulario para crear una tarea
        this.shadowRoot.querySelector('#btnNueva')
            .addEventListener('click', () => {
                this.openForm(null);
            });

        // Abrir modal de importación
        this.shadowRoot.querySelector('#btnImportar')
            .addEventListener('click', () => {

                const modal = this.shadowRoot.querySelector('task-import-modal');

                if (modal && typeof modal.open === 'function') {
                    modal.open();
                }
            });

        // Marcar todas las tareas locales como completadas
        this.shadowRoot.querySelector('#btnCompleteAll')
            .addEventListener('click', () => {
                this.emitEvent(EVENTS.COMPLETE_ALL);
            });

        // Vaciar la lista
        this.shadowRoot.querySelector('#btnClear')
            .addEventListener('click', () => {

                this.emitEvent(EVENTS.CLEAR);

            });

        // Buscar tareas con espera de 250 milisegundos
        searchInput.addEventListener('input', () => {

            clearTimeout(this._searchTimeout);

            this._searchTimeout = setTimeout(() => {

                this._currentSearch = searchInput.value.trim();

                this.emitEvent(EVENTS.SEARCH, {
                    query: this._currentSearch
                });

            }, 250);

        });

        // Filtrar tareas por estado
        filterSelect.addEventListener('change', () => {

            this._currentFilter = filterSelect.value;

            this.emitEvent(EVENTS.FILTER, {
                status: this._currentFilter
            });

        });
    }

    // Enviar eventos al controlador
    emitEvent(eventName, detail = {}) {

        this.dispatchEvent(new CustomEvent(eventName, {
            detail: detail,
            bubbles: true,
            composed: true
        }));

    }

    // Recibir las tareas que se mostrarán en la lista
    setTasks(tasks, filtered = false) {

    this._tasks = Array.isArray(tasks) ? tasks : [];

    const lista = this.shadowRoot.querySelector('task-list');

    if (lista) {
        lista.filtered = filtered;
        lista.tasks = this._tasks;
    }
}
// Actualizar los controles de búsqueda y filtro
    setSearchAndFilter(query, status) {

        this._currentSearch = query;
        this._currentFilter = status;
        clearTimeout(this._searchTimeout);
        const searchInput = this.shadowRoot.querySelector('#searchInput');
        const filterSelect = this.shadowRoot.querySelector('#filterSelect');
        if (searchInput) {
            searchInput.value = query;
        }
        if (filterSelect) {
            filterSelect.value = status;
        }
    }

    // Recibir todas las tareas para calcular el progreso
    setSummary(tasks) {

        this._summaryTasks = Array.isArray(tasks) ? tasks : [];

        this.updateSummary();

    }

    // Calcular el progreso de las tareas
    updateSummary() {

        const total = this._summaryTasks.length;

        const completed = this._summaryTasks.filter(function (task) {
            return task.completed === true;
        }).length;

        const percentage = total === 0
            ? 0
            : Math.round((completed / total) * 100);

        const progressText = this.shadowRoot.querySelector('#progressText');
        const progressPercentage = this.shadowRoot.querySelector('#progressPercentage');
        const progressFill = this.shadowRoot.querySelector('#progressFill');

        if (progressText) {
            progressText.textContent = completed + ' de ' + total + ' completadas';
        }

        if (progressPercentage) {
            progressPercentage.textContent = percentage + ' %';
        }

        if (progressFill) {
            progressFill.style.width = percentage + '%';
        }

    }

    // Recibir tareas del banco de la API
    setApiTasks(apiTasks) {

        this._apiTasks = Array.isArray(apiTasks) ? apiTasks : [];

        const modal = this.shadowRoot.querySelector('task-import-modal');

        if (modal && typeof modal.setApiTasks === 'function') {
            modal.setApiTasks(this._apiTasks);
        }

    }

    // Recibir los IDs de las tareas que ya fueron importadas
    setImportedIds(sourceIds) {

        this._importedIds = Array.isArray(sourceIds) ? sourceIds : [];

        const modal = this.shadowRoot.querySelector('task-import-modal');

        if (modal && typeof modal.setImportedIds === 'function') {
            modal.setImportedIds(this._importedIds);
        }

    }

    // Mostrar el estado de la consulta a la API
    setApiStatus(status, message = '') {

        const modal = this.shadowRoot.querySelector('task-import-modal');

        if (modal && typeof modal.setApiStatus === 'function') {
            modal.setApiStatus(status, message);
        }

    }

    // Mostrar mensajes de éxito o error
    showMessage(message, type = 'success') {

        const mensaje = this.shadowRoot.querySelector('#message');

        if (!mensaje) return;

        mensaje.textContent = message;
        mensaje.className = 'message ' + type;

    }

    // Abrir formulario para crear o editar
    openForm(task = null) {

        const modal = this.shadowRoot.querySelector('task-form-modal');

        if (modal && typeof modal.open === 'function') {
            modal.open(task);
        }

    }

}

// Registrar el componente
if (!customElements.get('task-app')) {
    customElements.define('task-app', TaskApp);
}
