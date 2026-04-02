import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma
export const prisma = new PrismaClient();

// Initialize Fastify
const fastify = Fastify({ logger: true });

// Register CORS — allow the React frontend (localhost:5173)
await fastify.register(cors, {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
});

// Routes
const { default: productRoutes } = await import('./routes/products.js');
const { default: customerRoutes } = await import('./routes/customers.js');
const { default: transactionRoutes } = await import('./routes/transactions.js');
const { default: settingsRoutes } = await import('./routes/settings.js');
const { default: dashboardRoutes } = await import('./routes/dashboard.js');

fastify.register(productRoutes, { prefix: '/api/products' });
fastify.register(customerRoutes, { prefix: '/api/customers' });
fastify.register(transactionRoutes, { prefix: '/api/transactions' });
fastify.register(settingsRoutes, { prefix: '/api/settings' });
fastify.register(dashboardRoutes, { prefix: '/api/dashboard' });

// Health check
fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// Start server
const PORT = parseInt(process.env.PORT || '3001');
const HOST = process.env.HOST || '0.0.0.0';

try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`✅ Lanka Fresh POS Backend running at http://localhost:${PORT}`);
} catch (err) {
    fastify.log.error(err);
    process.exit(1);
}
