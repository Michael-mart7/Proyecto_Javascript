import { EVENTS } from "../shared/constants";
const CSS_URL = new URL('../styles/category-manager-modal.css', import.meta.url).href;
const CLOSE_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M18 6 6 18M6 6l12 12"/></svg>';

// Elemento con foco real, atravesando los Shadow DOM (para devolver el foco al cerrar)
function deepActiveElement() {
    let element = document.activeElement;
    while (element && element.shadowRoot && element.shadowRoot.activeElement) {
        element = element.shadowRoot.activeElement;
    }
    return element;
}

class CategoryManagerModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._categories = [];
        this._editingId = null; // id de la categoría que se está renombrando
        this._opener = null;
    }

    connectedCallback() {
        if (this.shadowRoot.childElementCount === 0) this.build();
    }

    build() {
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="${CSS_URL}">
            <dialog aria-labelledby="titulo-categorias">
                <header class="encabezado">
                    <div>
                        <h2 id="titulo-categorias">Categorías</h2>
                        <p class="subtitulo">Crea, renombra o elimina las categorías de tus tareas.</p>
                    </div>
                    <button type="button" class="cerrar" aria-label="Cerrar categorías">${CLOSE_ICON}</button>
                </header>

                <form class="nueva" novalidate>
                    <label for="nombre-nueva">Nueva categoría</label>
                    <div class="fila-nueva">
                        <input type="text" id="nombre-nueva" maxlength="40" autocomplete="off"
                            placeholder="Ej.: Estudio">
                        <button type="submit" class="boton guardar">Agregar</button>
                    </div>
                    <p class="error" id="error-categoria" role="alert" hidden></p>
                </form>

                <ul class="lista" id="lista-categorias" aria-label="Categorías existentes"></ul>
                <p class="vacio" id="sin-categorias" hidden>Aún no hay categorías. Crea la primera arriba.</p>

                <footer class="pie">
                    <button type="button" class="boton cerrar-final">Cerrar</button>
                </footer>
            </dialog>
        `;

        const root = this.shadowRoot;
        const dialog = root.querySelector('dialog');

        root.querySelector('.cerrar').addEventListener('click', () => dialog.close());
        root.querySelector('.cerrar-final').addEventListener('click', () => dialog.close());
        dialog.addEventListener('click', (event) => {
            if (event.target === dialog) dialog.close();
        });
        dialog.addEventListener('close', () => {
            this._editingId = null;
            this._opener?.focus?.();
            this._opener = null;
        });

        // Crear
        root.querySelector('form.nueva').addEventListener('submit', (event) => {
            event.preventDefault();
            const input = root.getElementById('nombre-nueva');
            this.emit(EVENTS.CATEGORY_SAVE, { id: null, name: input.value });
        });
        root.getElementById('nombre-nueva').addEventListener('input', () => this.showError(''));

        // Renombrar y eliminar (un solo oyente para toda la lista)
        root.getElementById('lista-categorias').addEventListener('click', (event) => {
            const button = event.target.closest('button[data-accion]');
            if (!button) return;
            const id = button.dataset.id;

            if (button.dataset.accion === 'editar') {
                this._editingId = id;
                this.renderList();
                root.getElementById('nombre-edicion')?.focus();
            }
            if (button.dataset.accion === 'cancelar') {
                this._editingId = null;
                this.showError('');
                this.renderList();
            }
            if (button.dataset.accion === 'eliminar') {
                const category = this._categories.find((c) => c.id === id);
                const ok = window.confirm(
                    `¿Eliminar la categoría "${category ? category.name : ''}"? Las tareas que la usan quedarán sin categoría.`
                );
                if (ok) this.emit(EVENTS.CATEGORY_DELETE, { id });
            }
        });

        // Guardar el renombrado (formulario de edición dentro de la lista)
        root.getElementById('lista-categorias').addEventListener('submit', (event) => {
            event.preventDefault();
            const input = event.target.querySelector('input');
            this.emit(EVENTS.CATEGORY_SAVE, { id: this._editingId, name: input.value });
        });
    }

    open() {
        if (this.shadowRoot.childElementCount === 0) this.build();
        const dialog = this.shadowRoot.querySelector('dialog');
        if (dialog.open) return;

        this._opener = deepActiveElement();
        this._editingId = null;
        this.showError('');
        this.shadowRoot.getElementById('nombre-nueva').value = '';
        this.renderList();
        dialog.showModal();
        this.shadowRoot.getElementById('nombre-nueva').focus();
    }

    // El controlador llama aquí después de cada cambio
    setCategories(categories) {
        this._categories = Array.isArray(categories) ? categories : [];
        if (this.shadowRoot.childElementCount === 0) this.build();

        // Si se guardó bien, se cierra la edición y se limpia el campo de crear
        this._editingId = null;
        this.shadowRoot.getElementById('nombre-nueva').value = '';
        this.showError('');
        this.renderList();
    }

    showError(message) {
        const error = this.shadowRoot.getElementById('error-categoria');
        if (!error) return;
        error.textContent = message;
        error.hidden = !message;
    }

    renderList() {
        const root = this.shadowRoot;
        const list = root.getElementById('lista-categorias');
        list.innerHTML = '';
        root.getElementById('sin-categorias').hidden = this._categories.length > 0;

        for (const category of this._categories) {
            const item = document.createElement('li');
            item.className = 'categoria';

            if (category.id === this._editingId) {
                // Modo edición: campo con el nombre actual
                const form = document.createElement('form');
                form.className = 'edicion';
                form.noValidate = true;

                const input = document.createElement('input');
                input.type = 'text';
                input.id = 'nombre-edicion';
                input.maxLength = 40;
                input.value = category.name;
                input.setAttribute('aria-label', 'Nuevo nombre de la categoría');
                input.addEventListener('input', () => this.showError(''));

                form.appendChild(input);
                form.appendChild(this.makeButton('Guardar', 'guardar-edicion', null, category.id, 'submit'));
                form.appendChild(this.makeButton('Cancelar', 'cancelar', 'cancelar', category.id));
                item.appendChild(form);
            } else {
                const name = document.createElement('span');
                name.className = 'nombre';
                name.textContent = category.name; // textContent: nunca se interpreta como HTML

                const edit = this.makeButton('Renombrar', 'editar', 'editar', category.id);
                edit.setAttribute('aria-label', `Renombrar categoría: ${category.name}`);
                const del = this.makeButton('Eliminar', 'eliminar', 'eliminar', category.id);
                del.setAttribute('aria-label', `Eliminar categoría: ${category.name}`);

                item.appendChild(name);
                item.appendChild(edit);
                item.appendChild(del);
            }
            list.appendChild(item);
        }
    }

    makeButton(text, className, action, id, type = 'button') {
        const button = document.createElement('button');
        button.type = type;
        button.className = 'accion ' + className;
        button.textContent = text;
        if (action) {
            button.dataset.accion = action;
            button.dataset.id = id;
        }
        return button;
    }

    emit(name, detail) {
        this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
    }
}

customElements.define('category-manager-modal', CategoryManagerModal);