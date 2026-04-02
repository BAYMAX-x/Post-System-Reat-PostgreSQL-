import React, { createContext, useContext, useState, useCallback } from 'react';

// --- Initial Data ---
const INITIAL_PRODUCTS = [
    { id: 1, barcode: '47920001', sku: 'LF-RIC-001', name: 'Keeri Samba Rice', nameSi: 'කීරි සම්බා', price: 240, costPrice: 180, unit: '1kg Unit', category: 'Rice', stock: 450, minStock: 50, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200' },
    { id: 2, barcode: '47920002', sku: 'LF-VEG-012', name: 'Fresh Tomatoes', nameSi: 'තක්කාලි', price: 120, costPrice: 80, unit: '500g Pack', category: 'Veg', stock: 42, minStock: 30, img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200' },
    { id: 3, barcode: '47920003', sku: 'LF-SPI-034', name: 'Chilli Powder', nameSi: 'මිරිස් කුඩු', price: 350, costPrice: 250, unit: '250g Pouch', category: 'Spices', stock: 85, minStock: 20, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200' },
    { id: 4, barcode: '47920004', sku: 'LF-DAI-005', name: 'Pelwatte Fresh Milk', nameSi: 'නැවුම් කිරි', price: 480, costPrice: 380, unit: '1L Bottle', category: 'Dairy', stock: 120, minStock: 40, img: 'https://images.unsplash.com/photo-1563636619-e910f64ff1cf?w=200' },
    { id: 5, barcode: '47920005', sku: 'LF-FRU-021', name: 'Bananas - Ambul', nameSi: 'ඇඹුල් කෙසෙල්', price: 180, costPrice: 120, unit: '1kg', category: 'Fruits', stock: 60, minStock: 20, img: 'https://images.unsplash.com/photo-1571771894821-ad9b58a36946?w=200' },
    { id: 6, barcode: '47920006', sku: 'LF-BAK-088', name: 'White Bread', nameSi: 'සුදු පාන්', price: 160, costPrice: 110, unit: '450g Loaf', category: 'Bakery', stock: 0, minStock: 15, img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200' },
    { id: 7, barcode: '47920007', sku: 'LF-SPI-042', name: 'Dilmah Ceylon Tea', nameSi: 'ලංකා තේ', price: 850, costPrice: 650, unit: '500g Pack', category: 'Spices', stock: 30, minStock: 10, img: 'https://images.unsplash.com/photo-1544787210-2213d84ad960?w=200' },
];

const INITIAL_CUSTOMERS = [
    { id: 'walk-in', name: 'Walk-in Customer', phone: '', email: '', loyaltyPoints: 0, totalSpent: 0 },
    { id: 'C001', name: 'Nihal Perera', phone: '077-1234567', email: 'nihal@email.com', loyaltyPoints: 1250, totalSpent: 45800, type: 'VIP' },
    { id: 'C002', name: 'Saman Silva', phone: '071-9876543', email: 'saman@email.com', loyaltyPoints: 320, totalSpent: 12400, type: 'Regular' },
    { id: 'C003', name: 'Kumari Jayasinghe', phone: '076-5551234', email: '', loyaltyPoints: 80, totalSpent: 3200, type: 'Regular' },
];

// --- Context ---
const POSContext = createContext(null);

export const POSProvider = ({ children }) => {
    const [products, setProducts] = useState(INITIAL_PRODUCTS);
    const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
    const [transactions, setTransactions] = useState([]);

    // --- Product Actions ---
    const addProduct = useCallback((product) => {
        const newProduct = {
            ...product,
            id: Date.now(),
            stock: parseInt(product.stock) || 0,
            minStock: parseInt(product.minStock) || 10,
            price: parseFloat(product.price) || 0,
            costPrice: parseFloat(product.costPrice) || 0,
        };
        setProducts(prev => [...prev, newProduct]);
        return newProduct;
    }, []);

    const updateProduct = useCallback((id, updates) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }, []);

    const deleteProduct = useCallback((id) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    }, []);

    const updateStock = useCallback((id, quantityChange) => {
        setProducts(prev => prev.map(p =>
            p.id === id ? { ...p, stock: Math.max(0, p.stock + quantityChange) } : p
        ));
    }, []);

    const getProductByBarcode = useCallback((barcode) => {
        return products.find(p => p.barcode === barcode);
    }, [products]);

    // --- Customer Actions ---
    const addCustomer = useCallback((customer) => {
        const newCustomer = {
            ...customer,
            id: `C${String(Date.now()).slice(-4)}`,
            loyaltyPoints: 0,
            totalSpent: 0,
            type: 'Regular',
        };
        setCustomers(prev => [...prev, newCustomer]);
        return newCustomer;
    }, []);

    const updateCustomer = useCallback((id, updates) => {
        setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    }, []);

    // --- Transaction Actions ---
    const recordTransaction = useCallback((transaction) => {
        const newTransaction = {
            ...transaction,
            id: `TXN-${Date.now()}`,
            timestamp: new Date().toISOString(),
        };
        setTransactions(prev => [newTransaction, ...prev]);

        // Deduct stock
        transaction.items.forEach(item => {
            updateStock(item.id, -item.qty);
        });

        // Update customer spend & loyalty
        if (transaction.customerId && transaction.customerId !== 'walk-in') {
            updateCustomer(transaction.customerId, prev => ({
                totalSpent: (prev?.totalSpent || 0) + transaction.total,
                loyaltyPoints: (prev?.loyaltyPoints || 0) + Math.floor(transaction.total / 10),
            }));
        }

        return newTransaction;
    }, [updateStock, updateCustomer]);

    // --- Computed Values ---
    const lowStockProducts = products.filter(p => p.stock <= p.minStock && p.stock > 0);
    const outOfStockProducts = products.filter(p => p.stock === 0);

    const value = {
        products,
        customers,
        transactions,
        lowStockProducts,
        outOfStockProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        getProductByBarcode,
        addCustomer,
        updateCustomer,
        recordTransaction,
    };

    return <POSContext.Provider value={value}>{children}</POSContext.Provider>;
};

export const usePOS = () => {
    const context = useContext(POSContext);
    if (!context) throw new Error('usePOS must be used within a POSProvider');
    return context;
};
