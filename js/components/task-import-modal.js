
import { EVENTS, API_STATUS } from '../shared/constants.js';

class TaskImportModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._apiTasks = [];
        this._importedIds = [];
        this._selectedIds = [];
        this._status = API_STATUS.LOADING;
        this._statusMessage = 'Cargando tareas...';
        this._search = '';
    }

    connectedCallback() {
        this.render();
        this.addEvents();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="./css/task-import-modal.css">
            <div class="overlay" id="overlay" hidden>
                <section class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
                    <header class="modal-header">
                        <div>
                            <h2 id="modalTitle">Importar tareas</h2>
                            <p>Selecciona las tareas que deseas agregar a tu lista.</p>
                        </div>
                        <button id="btnClose" class="btn-close" aria-label="Cerrar">×</button>
                    </header>

                    <div class="modal-content">
                        <input type="search" id="searchInput"
                            placeholder="Buscar tareas..."
                            aria-label="Buscar tareas">

                        <div class="select-all">
                            <label>
                                <input type="checkbox" id="selectAll">
                                Seleccionar todas las disponibles
                            </label>
                        </div>

                        <p id="statusMessage" class="status-message"></p>
                        <div id="taskList" class="task-list"></div>

                        <button id="btnRetry" class="btn-secondary" hidden>
                            Reintentar
                        </button>
                    </div>

                    <footer class="modal-footer">
                        <span id="selectedCount">0 seleccionadas</span>
                        <div>
                            <button id="btnCancel" class="btn-secondary">Cancelar</button>
                            <button id="btnImport" class="btn-primary" disabled>
                                Importar seleccionadas
                            </button>
                        </div>
                    </footer>
                </section>
            </div>
        `;
        this.updateView();
    }

    addEvents() {
        const overlay = this.shadowRoot.querySelector('#overlay');
        const taskList = this.shadowRoot.querySelector('#taskList');
        const searchInput = this.shadowRoot.querySelector('#searchInput');

        this.shadowRoot.querySelector('#btnClose')
            .addEventListener('click', () => this.close());

        this.shadowRoot.querySelector('#btnCancel')
            .addEventListener('click', () => this.close());

        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                this.close();
            }
        });

        // Buscar tareas dentro del banco de la API
        searchInput.addEventListener('input', () => {
            this._search = searchInput.value.trim().toLowerCase();
            this.updateView();
            this.shadowRoot.querySelector('#searchInput').focus();
        });

        // Detectar cambios en los checkbox de las tareas
        taskList.addEventListener('change', (event) => {
            if (event.target.type !== 'checkbox') return;

            const id = Number(event.target.dataset.id);

            if (event.target.checked) {
                if (!this._selectedIds.includes(id)) {
                    this._selectedIds.push(id);
                }
            } else {
                this._selectedIds = this._selectedIds.filter(function (selectedId) {
                    return selectedId !== id;
                });
            }

            this.updateSelectedCount();
        });

        // Seleccionar todas las tareas disponibles que se muestran
        this.shadowRoot.querySelector('#selectAll')
            .addEventListener('change', (event) => {
                const availableTasks = this.getVisibleTasks().filter((task) => {
                    return !this._importedIds.includes(task.id);
                });

                if (event.target.checked) {
                    availableTasks.forEach((task) => {
                        if (!this._selectedIds.includes(task.id)) {
                            this._selectedIds.push(task.id);
                        }
                    });
                } else {
                    const visibleIds = availableTasks.map((task) => task.id);

                    this._selectedIds = this._selectedIds.filter((id) => {
                        return !visibleIds.includes(id);
                    });
                }

                this.updateView();
            });

        // Solicitar al controlador que vuelva a consultar la API
        this.shadowRoot.querySelector('#btnRetry')
            .addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent(EVENTS.API_RETRY, {
                    bubbles: true,
                    composed: true
                }));
            });

        this.shadowRoot.querySelector('#btnImport')
            .addEventListener('click', () => this.importSelected());

        // Cerrar el modal con Escape
        this.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.close();
            }
        });
    }

    open() {
        this._selectedIds = [];
        this.shadowRoot.querySelector('#overlay').hidden = false;
        this.updateView();
        this.shadowRoot.querySelector('#searchInput').focus();
    }

    close() {
        this.shadowRoot.querySelector('#overlay').hidden = true;
    }

    setApiTasks(apiTasks) {
        this._apiTasks = Array.isArray(apiTasks) ? apiTasks : [];
        this._status = API_STATUS.OK;
        this._statusMessage = '';
        this.updateView();
    }

    setImportedIds(sourceIds) {
        this._importedIds = Array.isArray(sourceIds) ? sourceIds : [];
        this._selectedIds = this._selectedIds.filter((id) => {
            return !this._importedIds.includes(id);
        });
        this.updateView();
    }

    setApiStatus(status, message = '') {
        this._status = status;
        this._statusMessage = message;
        this.updateView();
    }

    getVisibleTasks() {
        return this._apiTasks.filter((task) => {
            return task.title.toLowerCase().includes(this._search);
        });
    }

    updateView() {
        const taskList = this.shadowRoot.querySelector('#taskList');
        const statusMessage = this.shadowRoot.querySelector('#statusMessage');
        const btnImport = this.shadowRoot.querySelector('#btnImport');
        const btnRetry = this.shadowRoot.querySelector('#btnRetry');
        const selectAll = this.shadowRoot.querySelector('#selectAll');

        if (!taskList) return;

        taskList.innerHTML = '';
        statusMessage.textContent = this._statusMessage;
        statusMessage.className = 'status-message ' + this._status;

        const selectAllContainer = this.shadowRoot.querySelector('.select-all');
        selectAllContainer.hidden = this._status !== API_STATUS.OK;
        selectAll.checked = false;
        selectAll.disabled = true;
        btnRetry.hidden = this._status !== API_STATUS.ERROR;

        if (this._status === API_STATUS.LOADING) {
            btnImport.disabled = true;
            this.updateSelectedCount();
            return;
        }

        if (this._status === API_STATUS.ERROR) {
            btnImport.disabled = true;
            this.updateSelectedCount();
            return;
        }

        const visibleTasks = this.getVisibleTasks();

        if (visibleTasks.length === 0) {
            statusMessage.textContent = this._search
                ? 'No se encontraron tareas.'
                : 'No hay tareas disponibles.';
            btnImport.disabled = true;
            this.updateSelectedCount();
            return;
        }

        visibleTasks.forEach((task) => {
            const imported = this._importedIds.includes(task.id);
            const selected = this._selectedIds.includes(task.id);

            const item = document.createElement('label');
            item.className = 'task-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = selected;
            checkbox.disabled = imported;
            checkbox.dataset.id = task.id;

            const title = document.createElement('span');
            title.className = 'task-title';
            title.textContent = task.title;

            const status = document.createElement('span');
            status.className = task.completed ? 'badge completed' : 'badge pending';
            status.textContent = task.completed ? 'Completada' : 'Pendiente';

            const importedLabel = document.createElement('span');
            importedLabel.className = 'badge imported';
            importedLabel.textContent = 'Ya importada';
            importedLabel.hidden = !imported;

            item.appendChild(checkbox);
            item.appendChild(title);
            item.appendChild(status);
            item.appendChild(importedLabel);

            taskList.appendChild(item);
        });

        const availableTasks = visibleTasks.filter((task) => {
            return !this._importedIds.includes(task.id);
        });

        selectAll.disabled = availableTasks.length === 0;
        selectAll.checked = availableTasks.length > 0 &&
            availableTasks.every((task) => this._selectedIds.includes(task.id));

        btnImport.disabled = this._selectedIds.length === 0;
        this.updateSelectedCount();
    }

    updateSelectedCount() {
    const count = this.shadowRoot.querySelector('#selectedCount');
    const btnImport = this.shadowRoot.querySelector('#btnImport');

    if (!count || !btnImport) return;

    count.textContent = this._selectedIds.length + ' seleccionadas';

    btnImport.disabled =
        this._selectedIds.length === 0 ||
        this._status !== API_STATUS.OK;
}

    importSelected() {
        if (this._selectedIds.length === 0) return;

        this.dispatchEvent(new CustomEvent(EVENTS.IMPORT, {
            detail: {
                sourceIds: [...this._selectedIds]
            },
            bubbles: true,
            composed: true
        }));

        this._selectedIds = [];
        this.close();
        this.updateView();
    }
}

if (!customElements.get('task-import-modal')) {
    customElements.define('task-import-modal', TaskImportModal);
}
