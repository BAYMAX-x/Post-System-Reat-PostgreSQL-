import { prisma } from '../server.js';

export default async function productRoutes(fastify) {
    // GET all products
    fastify.get('/', async (req, reply) => {
        const products = await prisma.product.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
        return products;
    });

    // GET product by barcode
    fastify.get('/barcode/:barcode', async (req, reply) => {
        const product = await prisma.product.findUnique({
            where: { barcode: req.params.barcode },
        });
        if (!product) return reply.code(404).send({ error: 'Product not found' });
        return product;
    });

    // GET single product
    fastify.get('/:id', async (req, reply) => {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        if (!product) return reply.code(404).send({ error: 'Product not found' });
        return product;
    });

    // POST create product
    fastify.post('/', async (req, reply) => {
        const { name, nameSi, barcode, sku, category, unit, price, costPrice, stock, minStock, imageUrl } = req.body;
        
        // Check barcode uniqueness
        const exists = await prisma.product.findUnique({ where: { barcode } });
        if (exists) return reply.code(409).send({ error: 'Barcode already exists' });

        const product = await prisma.product.create({
            data: {
                name, nameSi, barcode, sku: sku || `LF-${category.substring(0,3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
                category, unit: unit || 'Unit',
                price: parseFloat(price),
                costPrice: costPrice ? parseFloat(costPrice) : null,
                stock: parseInt(stock) || 0,
                minStock: parseInt(minStock) || 10,
                imageUrl,
            },
        });
        return reply.code(201).send(product);
    });

    // PUT update product
    fastify.put('/:id', async (req, reply) => {
        const id = parseInt(req.params.id);
        const { name, nameSi, sku, category, unit, price, costPrice, minStock, imageUrl } = req.body;
        
        const product = await prisma.product.update({
            where: { id },
            data: {
                name, nameSi, sku, category, unit,
                price: parseFloat(price),
                costPrice: costPrice ? parseFloat(costPrice) : null,
                minStock: parseInt(minStock) || 10,
                imageUrl,
            },
        });
        return product;
    });

    // PATCH adjust stock
    fastify.patch('/:id/stock', async (req, reply) => {
        const id = parseInt(req.params.id);
        const { delta } = req.body; // positive = add, negative = deduct
        
        const product = await prisma.product.update({
            where: { id },
            data: { stock: { increment: parseInt(delta) } },
        });
        return product;
    });

    // DELETE (soft delete)
    fastify.delete('/:id', async (req, reply) => {
        await prisma.product.update({
            where: { id: parseInt(req.params.id) },
            data: { isActive: false },
        });
        return { success: true };
    });
}
