import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    Search, Trash2, PauseCircle, Percent, ShoppingCart, Printer,
    Wifi, PlayCircle, User, Barcode, CheckCircle, X, PlusCircle, MinusCircle
} from 'lucide-react';
import PaymentModal from './PaymentModal';
import DigitalReceipt from './DigitalReceipt';
import { usePOS } from '../../context/POSContext';
import './Billing.css';

const CATEGORIES = [
    { id: 'all', label: 'All', emoji: '🛒' },
    { id: 'Rice', label: 'Rice', emoji: '🌾' },
    { id: 'Veg', label: 'Veg', emoji: '🥦' },
    { id: 'Fruits', label: 'Fruits', emoji: '🍌' },
    { id: 'Dairy', label: 'Dairy', emoji: '🥛' },
    { id: 'Spices', label: 'Spices', emoji: '🌶️' },
    { id: 'Bakery', label: 'Bakery', emoji: '🍞' },
    { id: 'Home', label: 'Home', emoji: '🏠' },
];

const Billing = () => {
    const { products, customers, recordTransaction, getProductByBarcode } = usePOS();

    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [cart, setCart] = useState([]);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [completedTransaction, setCompletedTransaction] = useState(null);
    const [heldBills, setHeldBills] = useState([]);
    const [discount, setDiscount] = useState({ type: 'none', value: 0 });
    const [selectedCustomerId, setSelectedCustomerId] = useState('walk-in');
    const [scanFlash, setScanFlash] = useState(null); // product id that just got scanned

    const searchInputRef = useRef(null);
    const barcodeBuffer = useRef('');
    const barcodeTimeout = useRef(null);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // Barcode scanner + keyboard shortcut listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' && e.target !== searchInputRef.current) return;
            if (e.target.tagName === 'TEXTAREA') return;
            if (e.key === 'F1') { e.preventDefault(); searchInputRef.current?.focus(); return; }
            if (e.key === 'F2') { e.preventDefault(); handleNewBill(); return; }
            if (e.key === 'F8') { e.preventDefault(); if (cart.length > 0) setIsPaymentOpen(true); return; }

            if (e.key === 'Enter') {
                if (barcodeBuffer.current.length > 2) {
                    const product = getProductByBarcode(barcodeBuffer.current);
                    if (product) {
                        addToCart(product);
                        setScanFlash(product.id);
                        setTimeout(() => setScanFlash(null), 700);
                    }
                }
                barcodeBuffer.current = '';
                if (barcodeTimeout.current) clearTimeout(barcodeTimeout.current);
            } else if (e.key.length === 1) {
                barcodeBuffer.current += e.key;
                if (barcodeTimeout.current) clearTimeout(barcodeTimeout.current);
                barcodeTimeout.current = setTimeout(() => { barcodeBuffer.current = ''; }, 100);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart, getProductByBarcode]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const term = searchTerm.toLowerCase();
            const matchesSearch = !term || p.name.toLowerCase().includes(term) || (p.barcode && p.barcode.includes(term)) || (p.sku && p.sku.toLowerCase().includes(term));
            const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, activeCategory, products]);

    const addToCart = (product) => {
        if (product.stock <= 0) return; // prevent adding out-of-stock
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (existing.qty >= product.stock) return prev; // respect stock
                return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const updateQty = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, Math.min(item.qty + delta, item.stock));
                return { ...item, qty: newQty };
            }
            return item;
        }).filter(item => item.qty > 0));
    };

    const handleHoldBill = () => {
        if (cart.length === 0) return;
        setHeldBills(prev => [...prev, { id: Date.now(), cart, customerId: selectedCustomerId, discount }]);
        handleNewBill();
    };

    const retrieveHeldBill = (hb) => {
        setCart(hb.cart);
        setSelectedCustomerId(hb.customerId);
        setDiscount(hb.discount);
        setHeldBills(prev => prev.filter(b => b.id !== hb.id));
    };

    const handleNewBill = () => {
        setCart([]);
        setDiscount({ type: 'none', value: 0 });
        setSelectedCustomerId('walk-in');
    };

    const applyDiscount = () => {
        const input = window.prompt("Enter discount: e.g. '10%' for percentage or '200' for fixed LKR amount");
        if (!input) return;
        if (input.includes('%')) {
            const val = parseFloat(input);
            if (!isNaN(val) && val > 0 && val <= 100) setDiscount({ type: 'percent', value: val });
        } else {
            const val = parseFloat(input);
            if (!isNaN(val) && val > 0) setDiscount({ type: 'amount', value: val });
        }
    };

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    let discountAmount = 0;
    if (discount.type === 'percent') discountAmount = subtotal * (discount.value / 100);
    else if (discount.type === 'amount') discountAmount = Math.min(discount.value, subtotal);
    const discountedSubtotal = subtotal - discountAmount;
    const tax = discountedSubtotal * 0.08;
    const total = discountedSubtotal + tax;

    if (completedTransaction) {
        return (
            <DigitalReceipt
                transaction={completedTransaction}
                customer={customers.find(c => c.id === completedTransaction.customerId)}
                onNewBill={() => { setCompletedTransaction(null); handleNewBill(); }}
                onDashboard={() => { setCompletedTransaction(null); handleNewBill(); }}
            />
        );
    }

    return (
        <div className="billing-page">
            <main className="terminal-main">
                <header className="terminal-header">
                    <div className="terminal-info">
                        <h2>🛒 POS Terminal</h2>
                        <div className="terminal-meta">REGISTER #04 • CASHIER: NUWAN</div>
                    </div>
                    <div className="search-bar">
                        <Search className="search-icon" size={18} />
                        <input
                            ref={searchInputRef}
                            id="billing-search"
                            type="text"
                            placeholder="Search or Scan barcode... (F1)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Barcode size={18} className="barcode-icon" />
                    </div>
                    <div className="header-actions">
                        <div className="status-badge online">
                            <span className="dot-green"></span>
                            ONLINE
                        </div>
                    </div>
                </header>

                <div className="category-bar">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            className={`category-item ${activeCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            <span className="cat-emoji">{cat.emoji}</span>
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>

                <div className="product-grid">
                    {filteredProducts.map(p => (
                        <div
                            key={p.id}
                            className={`product-card ${p.stock === 0 ? 'out-of-stock' : ''} ${scanFlash === p.id ? 'scan-flash' : ''}`}
                            onClick={() => addToCart(p)}
                        >
                            <div className="image-container">
                                <img src={p.img} alt={p.name} loading="lazy" />
                                <div className="price-badge">LKR {p.price}</div>
                                {p.stock === 0 && <div className="out-of-stock-overlay">OUT OF STOCK</div>}
                                {p.stock > 0 && p.stock <= p.minStock && <div className="low-stock-tag">Low Stock: {p.stock}</div>}
                            </div>
                            <div className="product-details">
                                <p className="product-name">{p.name}</p>
                                <p className="product-name-si">{p.nameSi}</p>
                                <div className="product-footer">
                                    <span className="product-unit">{p.unit}</span>
                                    <span className="product-barcode">{p.barcode}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredProducts.length === 0 && (
                        <div className="no-results">
                            <Search size={40} color="#CBD5E1" />
                            <p>No products found</p>
                        </div>
                    )}
                </div>
            </main>

            <aside className="cart-sidebar">
                <div className="cart-header">
                    <div className="cart-title-row">
                        <div>
                            <h3>Current Order</h3>
                            <p className="order-id">#{String(Date.now()).slice(-6)}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="icon-action-btn" onClick={handleNewBill} title="New Bill (F2)">
                                <PlusCircle size={20} color="#10B981" />
                            </button>
                            <button className="icon-action-btn" onClick={() => setCart([])} title="Clear Cart">
                                <Trash2 size={20} color="#EF4444" />
                            </button>
                        </div>
                    </div>

                    <div className="customer-select-row">
                        <User size={16} color="#64748B" />
                        <select
                            value={selectedCustomerId}
                            onChange={(e) => setSelectedCustomerId(e.target.value)}
                        >
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.name}{c.type === 'VIP' ? ' ⭐' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="cart-items">
                    {cart.length === 0 && heldBills.length === 0 && (
                        <div className="cart-empty">
                            <ShoppingCart size={48} color="#E2E8F0" />
                            <p>Cart is empty</p>
                            <small>Click a product or scan a barcode</small>
                        </div>
                    )}

                    {cart.map(item => (
                        <div key={item.id} className="cart-item">
                            <div className="cart-item-info">
                                <h4>{item.name}</h4>
                                <p className="cart-item-details">LKR {item.price.toFixed(2)} ea.</p>
                            </div>
                            <div className="qty-controls">
                                <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>
                                    <MinusCircle size={18} />
                                </button>
                                <span className="qty-val">{item.qty}</span>
                                <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>
                                    <PlusCircle size={18} />
                                </button>
                                <span className="item-total">{(item.price * item.qty).toFixed(2)}</span>
                            </div>
                        </div>
                    ))}

                    {heldBills.length > 0 && (
                        <div className="held-bills-section">
                            <p className="held-bills-label">⏸ Held Bills</p>
                            {heldBills.map(hb => (
                                <button key={hb.id} className="held-bill-btn" onClick={() => retrieveHeldBill(hb)}>
                                    <PlayCircle size={16} />
                                    Retrieve ({hb.cart.length} items)
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="cart-summary">
                    <div className="summary-actions">
                        <button className="summary-btn" onClick={handleHoldBill} disabled={cart.length === 0}>
                            <PauseCircle size={16} />
                            HOLD
                        </button>
                        <button className="summary-btn" onClick={applyDiscount} disabled={cart.length === 0}>
                            <Percent size={16} />
                            DISCOUNT
                        </button>
                    </div>

                    <div className="summary-lines">
                        <div className="line-item">
                            <span>Subtotal</span>
                            <span>LKR {subtotal.toLocaleString('en', { minimumFractionDigits: 2 })}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="line-item discount-line">
                                <span>Discount {discount.type === 'percent' ? `(${discount.value}%)` : '(fixed)'}</span>
                                <span>- LKR {discountAmount.toLocaleString('en', { minimumFractionDigits: 2 })}</span>
                            </div>
                        )}
                        <div className="line-item">
                            <span>Tax (8%)</span>
                            <span>LKR {tax.toLocaleString('en', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="total-row">
                            <span>TOTAL</span>
                            <span className="total-val">LKR {total.toLocaleString('en', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    <button
                        id="pay-now-btn"
                        className="pay-btn"
                        onClick={() => setIsPaymentOpen(true)}
                        disabled={cart.length === 0}
                    >
                        PAY NOW (F8) <ShoppingCart size={22} />
                    </button>
                </div>
            </aside>

            {isPaymentOpen && (
                <PaymentModal
                    total={total}
                    onClose={() => setIsPaymentOpen(false)}
                    onComplete={(paymentMethod) => {
                        const txn = recordTransaction({
                            items: cart,
                            subtotal,
                            discountAmount,
                            tax,
                            total,
                            paymentMethod,
                            customerId: selectedCustomerId,
                            discount,
                        });
                        setIsPaymentOpen(false);
                        setCompletedTransaction(txn);
                    }}
                />
            )}

            <footer className="billing-bottom-bar">
                <div className="shortcuts">
                    <div className="shortcut-item"><span>F1</span> Search</div>
                    <div className="shortcut-item"><span>F2</span> New Bill</div>
                    <div className="shortcut-item"><span>F8</span> Pay</div>
                </div>
                <div className="system-stats">
                    <div className="stat-item"><Printer size={14} color="#10B981" /> Printer Ready</div>
                    <div className="stat-item"><Wifi size={14} color="#10B981" /> Connected</div>
                    <div className="stat-item">{dateStr} • {timeStr}</div>
                </div>
            </footer>
        </div>
    );
};

export default Billing;
