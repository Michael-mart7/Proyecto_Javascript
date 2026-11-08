
import { API_URL } from './shared/constants.js';
import { generateId } from './shared/utils.js';

import { getApiTasks } from './services/apiService.js';
import { mapSelectedApiTasks } from './services/importService.js';

console.log('Gestor de tareas iniciado correctamente');
console.log('API configurada:', API_URL);
console.log('Generador de IDs disponible:', typeof generateId === 'function');

// Probar consulta y transformación de tareas
async function probarImportacion() {

    console.log('Consultando tareas de JSONPlaceholder...');

    // Obtener tareas de la API
    const resultado = await getApiTasks();

    if (resultado.ok) {

        console.log('Tareas obtenidas correctamente:', resultado.data.length);

        // Seleccionar las primeras tres tareas como ejemplo
        const tareasSeleccionadas = resultado.data.slice(0, 3);

        // Transformar las tareas seleccionadas
        const tareasNormalizadas = mapSelectedApiTasks(tareasSeleccionadas);

        // Mostrar los resultados
        console.log('Tareas originales:', tareasSeleccionadas);

        console.log('Tareas normalizadas:', tareasNormalizadas);

        console.log('Cantidad de tareas transformadas:', tareasNormalizadas.length);

    } else {

        console.error('Error al consultar la API:', resultado.message);

    }
}

// Ejecutar la prueba
probarImportacion();
