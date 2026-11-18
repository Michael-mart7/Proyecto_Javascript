// Servicio para manejar las categorías de tareas en el almacenamiento local del navegador
// Proporciona funciones para cargar, agregar, actualizar y eliminar categorías, así como para validar nombres y generar identificadores únicos.
// Se asegura de que los cambios se guarden correctamente y maneja errores de persistencia.

import {CATEGORY_ORIGIN} from '../shared/constants.js';
const MAX_NAME_LENGTH = 40;
let categories = [];

function isValidCategory(c) {
    return (
        c !== null &&
        typeof c === 'object' &&
        typeof c.id === 'string' &&
        typeof c.name === 'string' &&
        typeof c.createdAt === 'string'
    );
}

function persist() {
    try {
        localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
        return { ok: true };
    } catch (error) {
        return { ok: false, message: 'No se pudo guardar en el navegador.' };
    }
}

// Aplica el cambio y lo guarda; si el guardado falla, lo revierte
function commit(next, successResult) {
    const previous = categories;
    categories = next;
    const saved = persist();
    if (!saved.ok) {
        categories = previous;
        return saved;
    }
    return successResult;
}

// Normaliza un texto para comparaciones y búsquedas
function normalize(text) {
    return String(text ?? '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function generateCategoryId() {
    const uuid = crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(36) +
          Math.random().toString(36).slice(2, 10);
    return 'cat-' + uuid;      
}

// Valida el nombre de la categoría y devuelve un mensaje de error si no es válido
function validateName(name, ignoreId = null) {
    const clean = typeof name === 'string' ? name.trim() : '';
    if (!clean) return 'EL nombre de la categoría no puede estar vacío.';
    if (clean.length > MAX_NAME_LENGTH){
        return `El nombre de la categoría no puede superar los ${MAX_NAME_LENGTH} caracteres.`;
    }
    const duplicate = categories.some(
        (c) => c.id !== ignoreId && normalize(c.name) === normalize(clean)
    );
    if (duplicate) return 'Ya existe una categoría con ese nombre.';
    return '';
}

// Carga las categorías desde el almacenamiento local y las valida
export function loadCategories() {
    try {
        const saved = localStorage.getItem(CATEGORY_STORAGE_KEY);
        if (saved === null) {
            categories = [];
            return { ok: true, data: [] };
        }
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) throw new Error('Datos de categorías inválidos');
        categories = parsed.filter(isValidCategory);
        return { ok: true, data: getCategories() };
    } catch (error) {
        categories = [];
        return { ok: false, message: 'No se pudieron cargar las categorías del navegador.' }
    }
}

export function getCategories() {
    return categories.map((c) => ({ ...c }));
}

// Agrega una nueva categoría si el nombre es válido y no hay duplicados
export function addCategory(name) {
    const error = validateName(name);
    if (error) return { ok: false, message: error };

    const category = {
        id: generateCategoryId(),
        name: name.trim(),
        createdAt: new Date().toISOString(),
    };
    return commit([...categories, category], { ok: true, data: category });
}

// Actualiza el nombre de una categoría existente si es válido y no hay duplicados
export function updateCategory(id, name) {
    const current = categories.find((c) => c.id === id);
    if (!current) return { ok: false, message: 'Categoría no encontrada.' };

    const error = validateName(name, id);
    if (error) return { ok: false, message: error };

    const updated = { ...current, name: name.trim() };
    return commit(
        categories.map((c) => (c.id === id ? updated : c)),
        { ok: true, data: {...updated} }
    );
}

export function deleteCategory(id) {
    if (!categories.some((c) => c.id === id)) {
        return { ok: false, message: 'Categoría no encontrada.' };
    }
    return commit(
        categories.filter((c) => c.id !== id),
        { ok: true, deletedId: id }
    )
}