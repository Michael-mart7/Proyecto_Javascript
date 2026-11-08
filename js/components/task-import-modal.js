
import { EVENTS } from '../shared/constants.js';

class TaskImportModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._apiTasks = [];
        this._importedIds = [];
        this._selectedIds = [];
        this._status = 'loading';
        this._statusMessage = 'Cargando tareas...';
    }

    connectedCallback() {
        this.render();
        this.addEvents();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="./css/task-import-modal.css">
            <div class="overlay" id="overlay" hidden>
                <section class="modal">
                    <header class="modal-header">
                        <div>
                            <h2>Importar tareas</h2>
                            <p>Selecciona las tareas que deseas agregar.</p>
                        </div>
                        <button id="btnClose" class="btn-close" aria-label="Cerrar">×</button>
                    </header>

                    <div class="modal-content">
                        <p id="statusMessage" class="status-message"></p>
                        <div id="taskList" class="task-list"></div>
                    </div>

                    <footer class="modal-footer">
                        <span id="selectedCount">0 seleccionadas</span>
                        <div>
                            <button id="btnCancel" class="btn-secondary">Cancelar</button>
                            <button id="btnImport" class="btn-primary">Importar seleccionadas</button>
                        </div>
                    </footer>
                </section>
            </div>
        `;
        this.updateView();
    }

    addEvents() {
        this.shadowRoot.querySelector('#btnClose')
            .addEventListener('click', () => this.close());

        this.shadowRoot.querySelector('#btnCancel')
            .addEventListener('click', () => this.close());

        this.shadowRoot.querySelector('#overlay')
            .addEventListener('click', (event) => {
                if (event.target.id === 'overlay') {
                    this.close();
                }
            });

        this.shadowRoot.querySelector('#btnImport')
            .addEventListener('click', () => this.importSelected());
    }

    open() {
        this._selectedIds = [];
        this.shadowRoot.querySelector('#overlay').hidden = false;
        this.updateView();
    }

    close() {
        this.shadowRoot.querySelector('#overlay').hidden = true;
    }

    setApiTasks(apiTasks) {
        this._apiTasks = Array.isArray(apiTasks) ? apiTasks : [];
        this._status = 'success';
        this._statusMessage = '';
        this.updateView();
    }

    setImportedIds(sourceIds) {
        this._importedIds = Array.isArray(sourceIds) ? sourceIds : [];
        this.updateView();
    }

    setApiStatus(status, message = '') {
        this._status = status;
        this._statusMessage = message;
        this.updateView();
    }

    updateView() {
        const taskList = this.shadowRoot.querySelector('#taskList');
        const statusMessage = this.shadowRoot.querySelector('#statusMessage');
        const selectedCount = this.shadowRoot.querySelector('#selectedCount');
        const btnImport = this.shadowRoot.querySelector('#btnImport');

        if (!taskList || !statusMessage) return;

        taskList.innerHTML = '';
        statusMessage.textContent = this._statusMessage;
        statusMessage.className = 'status-message ' + this._status;

        if (this._status !== 'success') {
            btnImport.disabled = true;
            selectedCount.textContent = '0 seleccionadas';
            return;
        }

        if (this._apiTasks.length === 0) {
            statusMessage.textContent = 'No hay tareas disponibles.';
            btnImport.disabled = true;
            selectedCount.textContent = '0 seleccionadas';
            return;
        }

        this._apiTasks.forEach((task) => {
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
            title.textContent = task.title;

            const badge = document.createElement('span');
            badge.className = imported ? 'badge imported' : 'badge';
            badge.textContent = imported ? 'Importada' : 'Disponible';

            item.appendChild(checkbox);
            item.appendChild(title);
            item.appendChild(badge);
            taskList.appendChild(item);
        });

        this.updateSelectedCount();
        btnImport.disabled = this._selectedIds.length === 0;
    }

    updateSelectedCount() {
        const selectedCount = this.shadowRoot.querySelector('#selectedCount');
        const btnImport = this.shadowRoot.querySelector('#btnImport');

        selectedCount.textContent = this._selectedIds.length + ' seleccionadas';
        btnImport.disabled = this._selectedIds.length === 0;
    }

    importSelected() {
        if (this._selectedIds.length === 0) return;

        const selectedTasks = this._apiTasks.filter((task) => {
            return this._selectedIds.includes(task.id);
        });

        this.dispatchEvent(new CustomEvent(EVENTS.IMPORT_SELECTED, {
            detail: { tasks: selectedTasks },
            bubbles: true,
            composed: true
        }));

        this.close();
    }
}

if (!customElements.get('task-import-modal')) {
    customElements.define('task-import-modal', TaskImportModal);
}
