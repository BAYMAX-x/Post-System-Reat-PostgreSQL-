import { prisma } from '../server.js';

export default async function dashboardRoutes(fastify) {
    // GET today's stats
    fastify.get('/today', async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [transactions, products, lowStockProducts] = await Promise.all([
            prisma.transaction.findMany({
                where: { createdAt: { gte: today, lt: tomorrow } },
                include: { items: true },
            }),
            prisma.product.findMany({ where: { isActive: true } }),
            prisma.product.findMany({
                where: { isActive: true, stock: { lte: prisma.product.fields.minStock } }
            }).catch(() => []), // fallback
        ]);

        const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.total), 0);
        const totalBills = transactions.length;
        const avgBill = totalBills > 0 ? totalRevenue / totalBills : 0;

        // Payment breakdown
        const paymentBreakdown = {
            cash: 0, card: 0, qr: 0, mobile: 0,
        };
        transactions.forEach(t => {
            paymentBreakdown[t.paymentMethod] = (paymentBreakdown[t.paymentMethod] || 0) + Number(t.total);
        });

        // Product stock alerts
        const stockAlerts = products.filter(p => p.stock <= p.minStock);

        return {
            totalRevenue,
            totalBills,
            avgBill,
            paymentBreakdown,
            totalProducts: products.length,
            stockAlerts: stockAlerts.length,
            recentTransactions: transactions.slice(0, 5),
        };
    });
}
