// Frontend API wrapper — connects React to the Fastify backend
// In development, this calls http://localhost:3001/api
// Simply swap BASE_URL for production/cloud deployment

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request(method, path, body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${BASE_URL}${path}`, options);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `Request failed: ${response.status}`);
    }
    return response.json();
}

// --- Products ---
export const api = {
    products: {
        getAll: () => request('GET', '/products'),
        getByBarcode: (barcode) => request('GET', `/products/barcode/${barcode}`),
        create: (data) => request('POST', '/products', data),
        update: (id, data) => request('PUT', `/products/${id}`, data),
        adjustStock: (id, delta) => request('PATCH', `/products/${id}/stock`, { delta }),
        delete: (id) => request('DELETE', `/products/${id}`),
    },
    customers: {
        getAll: () => request('GET', '/customers'),
        getById: (id) => request('GET', `/customers/${id}`),
        create: (data) => request('POST', '/customers', data),
        update: (id, data) => request('PUT', `/customers/${id}`, data),
    },
    transactions: {
        getAll: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return request('GET', `/transactions${query ? `?${query}` : ''}`);
        },
        getById: (id) => request('GET', `/transactions/${id}`),
        create: (data) => request('POST', '/transactions', data),
    },
    dashboard: {
        getToday: () => request('GET', '/dashboard/today'),
    },
    settings: {
        get: () => request('GET', '/settings'),
        update: (data) => request('PUT', '/settings', data),
    },
};
