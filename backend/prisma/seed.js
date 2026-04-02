// Prisma Seed Script — Run with: node prisma/seed.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create store settings
    await prisma.storeSettings.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            storeName: 'Lanka Fresh Market',
            storeAddress: 'No. 45, Galle Road, Colombo 03',
            storeTel: '+94 11 2345 678',
            vatRegNo: '123456789-7000',
            taxRate: 0.08,
            receiptFooter: 'Thank you for shopping with us!\nPlease retain this receipt for any returns within 7 days.',
        },
    });

    // Seed products
    const products = [
        { barcode: '47920001', sku: 'LF-RIC-001', name: 'Keeri Samba Rice', nameSi: 'කීරි සම්බා', price: 240, costPrice: 180, unit: '1kg Unit', category: 'Rice', stock: 450, minStock: 50, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200' },
        { barcode: '47920002', sku: 'LF-VEG-012', name: 'Fresh Tomatoes', nameSi: 'තක්කාලි', price: 120, costPrice: 80, unit: '500g Pack', category: 'Veg', stock: 42, minStock: 30, imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200' },
        { barcode: '47920003', sku: 'LF-SPI-034', name: 'Chilli Powder', nameSi: 'මිරිස් කුඩු', price: 350, costPrice: 250, unit: '250g Pouch', category: 'Spices', stock: 85, minStock: 20, imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200' },
        { barcode: '47920004', sku: 'LF-DAI-005', name: 'Pelwatte Fresh Milk', nameSi: 'නැවුම් කිරි', price: 480, costPrice: 380, unit: '1L Bottle', category: 'Dairy', stock: 120, minStock: 40, imageUrl: 'https://images.unsplash.com/photo-1563636619-e910f64ff1cf?w=200' },
        { barcode: '47920005', sku: 'LF-FRU-021', name: 'Bananas - Ambul', nameSi: 'ඇඹුල් කෙසෙල්', price: 180, costPrice: 120, unit: '1kg', category: 'Fruits', stock: 60, minStock: 20, imageUrl: 'https://images.unsplash.com/photo-1571771894821-ad9b58a36946?w=200' },
        { barcode: '47920006', sku: 'LF-BAK-088', name: 'White Bread', nameSi: 'සුදු පාන්', price: 160, costPrice: 110, unit: '450g Loaf', category: 'Bakery', stock: 25, minStock: 15, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200' },
        { barcode: '47920007', sku: 'LF-SPI-042', name: 'Dilmah Ceylon Tea', nameSi: 'ලංකා තේ', price: 850, costPrice: 650, unit: '500g Pack', category: 'Spices', stock: 30, minStock: 10, imageUrl: 'https://images.unsplash.com/photo-1544787210-2213d84ad960?w=200' },
        { barcode: '47920008', sku: 'LF-DAI-009', name: 'Anchor Milk Powder', nameSi: 'ඇංකර් කිරිපිටි', price: 1080, costPrice: 900, unit: '400g Pack', category: 'Dairy', stock: 56, minStock: 15, imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200' },
    ];

    for (const product of products) {
        await prisma.product.upsert({
            where: { barcode: product.barcode },
            update: {},
            create: product,
        });
    }

    // Seed default customers
    await prisma.customer.upsert({
        where: { id: 'C001' },
        update: {},
        create: { id: 'C001', name: 'Nihal Perera', phone: '077-1234567', email: 'nihal@email.com', type: 'VIP', loyaltyPoints: 1250, totalSpent: 45800 },
    });

    await prisma.customer.upsert({
        where: { id: 'C002' },
        update: {},
        create: { id: 'C002', name: 'Saman Silva', phone: '071-9876543', type: 'Regular', loyaltyPoints: 320, totalSpent: 12400 },
    });

    console.log('✅ Seeding complete!');
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(() => prisma.$disconnect());
