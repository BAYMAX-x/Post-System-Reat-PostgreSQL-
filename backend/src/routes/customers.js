import { prisma } from '../server.js';

export default async function customerRoutes(fastify) {
    // GET all customers
    fastify.get('/', async () => {
        return prisma.customer.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
    });

    // GET single customer
    fastify.get('/:id', async (req, reply) => {
        const customer = await prisma.customer.findUnique({
            where: { id: req.params.id },
            include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } },
        });
        if (!customer) return reply.code(404).send({ error: 'Customer not found' });
        return customer;
    });

    // POST create customer
    fastify.post('/', async (req, reply) => {
        const { name, phone, email, type } = req.body;
        const customer = await prisma.customer.create({
            data: { name, phone: phone || null, email: email || null, type: type || 'Regular' },
        });
        return reply.code(201).send(customer);
    });

    // PUT update customer
    fastify.put('/:id', async (req, reply) => {
        const { name, phone, email, type } = req.body;
        const customer = await prisma.customer.update({
            where: { id: req.params.id },
            data: { name, phone, email, type },
        });
        return customer;
    });
}
