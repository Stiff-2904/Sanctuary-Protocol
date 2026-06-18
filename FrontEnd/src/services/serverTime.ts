import api from './api';

/**
 * Obtiene la hora actual del servidor (TiDB NOW()).
 * Usar en lugar de `new Date()` para operaciones críticas
 * que dependen de consistencia temporal entre campamentos.
 */
export const getServerTime = async (): Promise<Date> => {
    try {
    const res = await api.get('/time');
    return new Date(res.data.server_time);
    } catch {
    // Fallback al navegador si el endpoint falla
    console.warn('No se pudo obtener la hora del servidor, usando hora local');
    return new Date();
    }
};