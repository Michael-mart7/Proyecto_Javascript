// Importar constantes compartidas
import {
    API_URL,
    EVENTS,
    API_STATUS,
    TASK_ORIGIN,
    TASK_STATUS
} from './shared/constants.js';

// Registrar los componentes de la aplicación
import './components/task-item.js';
import './components/task-list.js';
import './components/task-form-modal.js';
import './components/task-import-modal.js';
import './components/task-app.js';

// Importar servicios
import {
    loadTasks as loadSavedTasks,
    getTasks,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    completeAll,
    clearTasks,
    importTasks
} from './services/taskService.js';

import { filterTasks } from './services/filterService.js';
import { getApiTasks } from './services/apiService.js';
import { mapSelectedApiTasks } from './services/importService.js';

// Obtener el componente principal
const app = document.querySelector('task-app');

// Variables de control
let apiTasks = [];
let currentFilter = TASK_STATUS.ALL;
let currentSearch = '';

// Obtener los identificadores de las tareas que ya fueron importadas
function getImportedSourceIds(tasks) {

    return tasks
        .filter(function (task) {
            return task.origin === TASK_ORIGIN.API;
        })
        .map(function (task) {
            return task.sourceId;
        });

}

// Actualizar la lista, el progreso y las tareas importadas
function refreshView() {

    const allTasks = getTasks();

    const filteredTasks = filterTasks(
        allTasks,
        currentFilter,
        currentSearch
    );

    const isFiltered =
    currentFilter !== TASK_STATUS.ALL ||
    currentSearch.trim() !== '';

    app.setTasks(filteredTasks, isFiltered);
    app.setSummary(allTasks);
    app.setImportedIds(getImportedSourceIds(allTasks));

}

// Mostrar el resultado de una operación
function showResult(result, successMessage) {

    if (!result.ok) {
        app.showMessage(result.message, 'error');
        return false;
    }

    refreshView();

    if (successMessage) {
        app.showMessage(successMessage, 'success');
    }

    return true;

}

// Consultar las tareas disponibles en la API
async function loadApiTasks() {

    app.setApiStatus(
        API_STATUS.LOADING,
        'Consultando tareas...'
    );

    const resultado = await getApiTasks();

    if (!resultado.ok) {
        app.setApiStatus(
            API_STATUS.ERROR,
            resultado.message
        );

        return;
    }

    apiTasks = resultado.data;

    app.setApiTasks(apiTasks);
    refreshView();

    console.log('Tareas disponibles en la API:', apiTasks.length);

}

// Crear o actualizar una tarea
app.addEventListener(EVENTS.SAVE, function (event) {

    const { id, title, completed } = event.detail;

    let resultado;

    if (id === null || id === undefined) {

        resultado = addTask({
            title: title,
            completed: completed
        });

        showResult(resultado, 'Tarea creada correctamente.');

    } else {

        resultado = updateTask(id, {
            title: title,
            completed: completed
        });

        showResult(resultado, 'Tarea actualizada correctamente.');

    }

});

// Abrir el formulario para crear o editar
app.addEventListener(EVENTS.EDIT, function (event) {

    const id = event.detail.id;

    // Si no hay identificador, se abrirá un formulario vacío
    if (id === null || id === undefined) {
        app.openForm(null);
        return;
    }

    const task = getTasks().find(function (item) {
        return item.id === id;
    });

    if (!task) {
        app.showMessage('No se encontró la tarea.', 'error');
        return;
    }

    app.openForm(task);

});

// Cambiar el estado de una tarea
app.addEventListener(EVENTS.TOGGLE, function (event) {

    const resultado = toggleTask(event.detail.id);

    showResult(resultado, 'Estado de la tarea actualizado.');

});

// Eliminar una tarea
app.addEventListener(EVENTS.DELETE, function (event) {

    const resultado = deleteTask(event.detail.id);

    showResult(resultado, 'Tarea eliminada correctamente.');

});

// Completar todas las tareas locales pendientes
app.addEventListener(EVENTS.COMPLETE_ALL, function () {

    const resultado = completeAll();

    if (!resultado.ok) {
        app.showMessage(resultado.message, 'error');
        return;
    }

    refreshView();

    if (resultado.updated === 0) {
        app.showMessage(
            'No hay tareas locales pendientes por completar.',
            'error'
        );
    } else {
        app.showMessage(
            'Se completaron ' + resultado.updated + ' tareas.',
            'success'
        );
    }

});

// Vaciar toda la lista
app.addEventListener(EVENTS.CLEAR, function () {

    if (getTasks().length === 0) {
        app.showMessage('La lista ya está vacía.', 'error');
        return;
    }

    const confirmed = window.confirm(
        '¿Estás seguro de que deseas eliminar todas las tareas?'
    );

    if (!confirmed) return;

    const resultado = clearTasks();

    showResult(resultado, 'La lista se vació correctamente.');

});

// Filtrar tareas por estado
app.addEventListener(EVENTS.FILTER, function (event) {

    currentFilter = event.detail.status || TASK_STATUS.ALL;

    app.setSearchAndFilter(currentSearch, currentFilter);

    refreshView();

});

// Buscar tareas por título
app.addEventListener(EVENTS.SEARCH, function (event) {

    currentSearch = event.detail.query || '';

    app.setSearchAndFilter(currentSearch, currentFilter);

    refreshView();

});

// Importar las tareas seleccionadas del banco de la API
app.addEventListener(EVENTS.IMPORT, function (event) {

    try {

        const sourceIds = event.detail.sourceIds;

        if (!Array.isArray(sourceIds) || sourceIds.length === 0) {
            return;
        }

        // Buscar las tareas originales seleccionadas
        const selectedTasks = apiTasks.filter(function (task) {
            return sourceIds.includes(task.id);
        });

        if (selectedTasks.length === 0) {
            app.showMessage(
                'No se encontraron las tareas seleccionadas.',
                'error'
            );
            return;
        }

        // Convertirlas al formato de nuestra aplicación
        const normalizedTasks = mapSelectedApiTasks(selectedTasks);

        // Enviar las tareas convertidas al servicio de almacenamiento
        const resultado = importTasks(normalizedTasks);

        if (!resultado.ok) {
            app.showMessage(resultado.message, 'error');
            return;
        }

        refreshView();

        if (resultado.added === 0) {

            app.showMessage(
                'Las tareas seleccionadas ya estaban importadas.',
                'error'
            );

        } else {

            let message = 'Se importaron ' + resultado.added + ' tareas.';

            if (resultado.skipped > 0) {
                message += ' Se omitieron ' + resultado.skipped + ' tareas duplicadas o inválidas.';
            }

            app.showMessage(message, 'success');

        }

    } catch (error) {

        console.error('Error al importar tareas:', error);

        app.showMessage(
            'Ocurrió un error al importar las tareas.',
            'error'
        );

    }

});

// Reintentar la consulta de la API
app.addEventListener(EVENTS.API_RETRY, function () {

    loadApiTasks();

});

// Iniciar la aplicación
console.log('Gestor de tareas iniciado correctamente');
console.log('API configurada:', API_URL);

// Recuperar las tareas guardadas
const loadResult = loadSavedTasks();

refreshView();

if (!loadResult.ok) {
    app.showMessage(loadResult.message, 'error');
}

// Consultar el banco de tareas
loadApiTasks();