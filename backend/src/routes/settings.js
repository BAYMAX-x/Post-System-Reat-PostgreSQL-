import { prisma } from '../server.js';

export default async function settingsRoutes(fastify) {
    // GET settings
    fastify.get('/', async () => {
        let settings = await prisma.storeSettings.findUnique({ where: { id: 1 } });
        if (!settings) {
            settings = await prisma.storeSettings.create({
                data: {
                    id: 1,
                    storeName: process.env.STORE_NAME || 'Lanka Fresh Market',
                    storeAddress: process.env.STORE_ADDRESS || '',
                    storeTel: process.env.STORE_TEL || '',
                    vatRegNo: process.env.STORE_VAT_REG || '',
                    taxRate: 0.08,
                }
            });
        }
        return settings;
    });

    // PUT update settings
    fastify.put('/', async (req) => {
        return prisma.storeSettings.upsert({
            where: { id: 1 },
            update: req.body,
            create: { id: 1, ...req.body },
        });
    });
}
