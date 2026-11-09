
import { API_URL, EVENTS, API_STATUS } from './shared/constants.js';

import './components/task-import-modal.js';
import './components/task-app.js';

import { getApiTasks } from './services/apiService.js';

const app = document.querySelector('task-app');

let apiTasks = [];

// Consultar el banco de tareas
async function loadApiTasks() {
    app.setApiStatus(API_STATUS.LOADING, 'Consultando tareas...');

    const resultado = await getApiTasks();

    if (resultado.ok) {
        apiTasks = resultado.data;

        app.setApiTasks(apiTasks);
        app.setImportedIds([]);

        app.showMessage('Banco de tareas cargado correctamente.', 'success');

        console.log('Tareas disponibles:', apiTasks.length);
    } else {
        app.setApiStatus(API_STATUS.ERROR, resultado.message);
        app.showMessage('No se pudieron cargar las tareas.', 'error');

        console.error(resultado.message);
    }
}

// Recibir los IDs seleccionados desde el modal
app.addEventListener(EVENTS.IMPORT, function (event) {
    console.log('IDs seleccionados para importar:', event.detail.sourceIds);
});

// Permitir volver a consultar la API
app.addEventListener(EVENTS.API_RETRY, function () {
    loadApiTasks();
});

// Iniciar la aplicación
console.log('Gestor de tareas iniciado.');
console.log('API configurada:', API_URL);

loadApiTasks();
