export const STORAGE_KEY = 'proyecto-tareas-v1';
export const API_URL = 'https://jsonplaceholder.typicode.com/todos';
 
export const TASK_ORIGIN = {
    LOCAL: 'local',
    API: 'api'
};
 
export const TASK_STATUS = {
    ALL: 'all',
    PENDING: 'pending',
    COMPLETED: 'completed'
};
 
export const API_STATUS = {
    LOADING: 'loading',
    OK: 'ok',
    ERROR: 'error'
};
 
export const EVENTS = {
    SAVE: 'task:save',
    EDIT: 'task:edit',
    TOGGLE: 'task:toggle',
    DELETE: 'task:delete',
    CLEAR: 'task:clear',
    COMPLETE_ALL: 'task:complete-all',
    IMPORT: 'task:import',
    FILTER: 'task:filter',
    SEARCH: 'task:search'
};