
import { API_URL } from '../shared/constants.js';

// Consultar las tareas de JSONPlaceholder
export async function getApiTasks() {

    try {

        // Realizar la petición a la API
        const respuesta = await fetch(API_URL);

        // Verificar si la respuesta HTTP fue exitosa
        if (!respuesta.ok) {
            throw new Error(
                'Error al consultar las tareas. Código HTTP: ' +
                respuesta.status
            );
        }

        // Convertir la respuesta a JSON
        const tareas = await respuesta.json();

        // Comprobar que recibimos un arreglo
        if (!Array.isArray(tareas)) {
            throw new Error('La respuesta de la API no contiene una lista válida.');
        }

        // Devolver los datos obtenidos
        return {
            ok: true,
            data: tareas
        };

    } catch (error) {

        // Devolver el error
        return {
            ok: false,
            message: error.message
        };

    }
}
