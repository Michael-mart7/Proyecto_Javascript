// Importar las constantes compartidas
import { API_URL } from './shared/constants.js';

// Importar funciones compartidas
import { generateId } from './shared/utils.js';

// Comprobar que la aplicación se inició correctamente
console.log('Gestor de tareas iniciado correctamente');

// Comprobar la dirección de la API
console.log('API configurada:', API_URL);

// Comprobar el generador de identificadores
console.log('Generador de IDs disponible:', typeof generateId === 'function');
