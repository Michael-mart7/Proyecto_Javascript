// Búsqueda por texto y filtro por estado
// Es una función pura: recibe tareas y devuelve un arreglo nuevo, sin modificar nada.

import { TASK_STATUS } from '../shared/constants.js';

// Pasa a minúsculas y quita tildes, para que "reunion" encuentre "Reunión"
function normalize(text) {
    return String(text ?? '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '');
}

export function filterTasks(tasks, status = TASK_STATUS.ALL, query = '') {
    const search = normalize(query);

    return tasks.filter((task) => {
        let matchesStatus = true;
        if (status === TASK_STATUS.PENDING) matchesStatus = !task.completed;
        if (status === TASK_STATUS.COMPLETED) matchesStatus = task.completed;

        const matchesQuery = search === '' || normalize(task.title).includes(search);

        return matchesStatus && matchesQuery;
    });
}
