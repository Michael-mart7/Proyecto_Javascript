
import { createImportedTask } from '../shared/utils.js';

// Transformar las tareas seleccionadas de la API
export function mapSelectedApiTasks(selectedTasks) {

    // Verificar que recibimos un arreglo
    if (!Array.isArray(selectedTasks)) {
        throw new Error('Las tareas seleccionadas deben ser un arreglo.');
    }

    // Convertir cada tarea al formato de nuestra aplicación
    const tareasNormalizadas = selectedTasks.map(function (apiTask) {
        return createImportedTask(apiTask);
    });

    // Devolver las tareas transformadas
    return tareasNormalizadas;
}
