import { prisma } from '../server.js';
import { randomUUID } from 'crypto';

export default async function transactionRoutes(fastify) {
    // GET all transactions  
    fastify.get('/', async (req) => {
        const { date, limit = 50 } = req.query;
        
        const where = {};
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            where.createdAt = { gte: start, lte: end };
        }

        return prisma.transaction.findMany({
            where,
            include: { items: true, customer: true },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit),
        });
    });

    // GET single transaction
    fastify.get('/:id', async (req, reply) => {
        const txn = await prisma.transaction.findUnique({
            where: { id: req.params.id },
            include: { items: { include: { product: true } }, customer: true },
        });
        if (!txn) return reply.code(404).send({ error: 'Transaction not found' });
        return txn;
    });

    // POST create transaction (a completed sale)
    fastify.post('/', async (req, reply) => {
        const {
            items, customerId, subtotal, discountType, discountValue, discountAmount,
            taxRate, taxAmount, total, paymentMethod, cashReceived, changeGiven, registerId
        } = req.body;

        // Generate bill number: LF-YYYYMMDD-XXXX
        const now = new Date();
        const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
        const randomPart = Math.floor(1000 + Math.random() * 9000);
        const billNo = `LF-${datePart}-${randomPart}`;

        // Run everything as a database transaction for safety
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the Transaction record
            const transaction = await tx.transaction.create({
                data: {
                    billNo,
                    customerId: customerId !== 'walk-in' ? customerId : null,
                    subtotal: parseFloat(subtotal),
                    discountType: discountType || null,
                    discountValue: discountValue ? parseFloat(discountValue) : null,
                    discountAmount: parseFloat(discountAmount || 0),
                    taxRate: parseFloat(taxRate || 0.08),
                    taxAmount: parseFloat(taxAmount),
                    total: parseFloat(total),
                    paymentMethod,
                    cashReceived: cashReceived ? parseFloat(cashReceived) : null,
                    changeGiven: changeGiven ? parseFloat(changeGiven) : null,
                    registerId: registerId || 'REG-01',
                    items: {
                        create: items.map(item => ({
                            productId: item.id,
                            productName: item.name,
                            price: parseFloat(item.price),
                            quantity: item.qty,
                            subtotal: parseFloat(item.price) * item.qty,
                        })),
                    },
                },
                include: { items: true },
            });

            // 2. Deduct stock for each item
            for (const item of items) {
                await tx.product.update({
                    where: { id: item.id },
                    data: { stock: { decrement: item.qty } },
                });
            }

            // 3. Update customer loyalty points & total spent
            if (customerId && customerId !== 'walk-in') {
                const pointsEarned = Math.floor(parseFloat(total) / 10);
                await tx.customer.update({
                    where: { id: customerId },
                    data: {
                        loyaltyPoints: { increment: pointsEarned },
                        totalSpent: { increment: parseFloat(total) },
                    },
                });
            }

            return transaction;
        });

        return reply.code(201).send(result);
    });
}
