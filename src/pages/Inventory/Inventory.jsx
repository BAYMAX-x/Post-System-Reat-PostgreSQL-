import React, { useState, useRef, useEffect } from 'react';
import {
    Plus, Search, Edit2, Trash2, X, Barcode, Camera,
    AlertTriangle, CheckCircle, Package, ScanLine, ChevronDown
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import './Inventory.css';

const CATEGORIES = ['Rice', 'Veg', 'Fruits', 'Dairy', 'Spices', 'Bakery', 'Home', 'Beverages', 'Snacks', 'Cleaning'];

const emptyForm = {
    name: '', nameSi: '', barcode: '', sku: '', category: 'Veg',
    price: '', costPrice: '', unit: 'Unit', stock: '', minStock: '10',
    img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200',
};

const ProductModal = ({ product, onSave, onClose }) => {
    const [form, setForm] = useState(product ? { ...product } : { ...emptyForm });
    const [barcodeInput, setBarcodeInput] = useState('');
    const [errors, setErrors] = useState({});
    const { products } = usePOS();

    const barcodeBuffer = useRef('');
    const barcodeTimeout = useRef(null);
    const barcodeFieldRef = useRef(null);

    const isEditing = !!product;

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Product name is required';
        if (!form.barcode.trim()) e.barcode = 'Barcode is required';
        else if (!isEditing && products.some(p => p.barcode === form.barcode))
            e.barcode = 'This barcode already exists';
        if (!form.price || isNaN(form.price) || parseFloat(form.price) <= 0) e.price = 'Valid price required';
        if (!form.stock || isNaN(form.stock) || parseInt(form.stock) < 0) e.stock = 'Valid stock required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) onSave(form);
    };

    const generateSKU = () => {
        const cat = form.category.substring(0, 3).toUpperCase();
        const num = String(Math.floor(Math.random() * 900) + 100);
        setForm(f => ({ ...f, sku: `LF-${cat}-${num}` }));
    };

    const generateBarcode = () => {
        const code = '479' + String(Date.now()).slice(-8);
        setForm(f => ({ ...f, barcode: code }));
    };

    // Listen for physical barcode scanner input on the barcode field
    const handleBarcodeKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (barcodeBuffer.current.length > 2) {
                setForm(f => ({ ...f, barcode: barcodeBuffer.current }));
                barcodeBuffer.current = '';
            }
        }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="product-modal">
                <div className="modal-header">
                    <h2>{isEditing ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
                    <button className="close-btn" onClick={onClose}><X size={22} /></button>
                </div>

                <form onSubmit={handleSubmit} className="product-form">
                    <div className="form-grid">
                        {/* Left Column */}
                        <div className="form-column">
                            <div className="section-label">Product Identity</div>

                            <div className="form-group">
                                <label>Barcode <span className="required">*</span></label>
                                <div className="barcode-input-group">
                                    <ScanLine size={18} className="input-icon" />
                                    <input
                                        ref={barcodeFieldRef}
                                        type="text"
                                        value={form.barcode}
                                        onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))}
                                        onKeyDown={handleBarcodeKeyDown}
                                        placeholder="Scan or type barcode..."
                                        className={errors.barcode ? 'error' : ''}
                                        autoFocus
                                    />
                                    <button type="button" className="gen-btn" onClick={generateBarcode} title="Auto-generate barcode">
                                        Auto
                                    </button>
                                </div>
                                {errors.barcode && <span className="error-msg">{errors.barcode}</span>}
                                <small className="hint">Focus this field and scan with barcode scanner</small>
                            </div>

                            <div className="form-group">
                                <label>SKU</label>
                                <div className="input-with-btn">
                                    <input
                                        type="text"
                                        value={form.sku}
                                        onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                                        placeholder="e.g. LF-VEG-012"
                                    />
                                    <button type="button" className="gen-btn" onClick={generateSKU}>Auto</button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Product Name (English) <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. Fresh Tomatoes"
                                    className={errors.name ? 'error' : ''}
                                />
                                {errors.name && <span className="error-msg">{errors.name}</span>}
                            </div>

                            <div className="form-group">
                                <label>Product Name (Sinhala)</label>
                                <input
                                    type="text"
                                    value={form.nameSi}
                                    onChange={e => setForm(f => ({ ...f, nameSi: e.target.value }))}
                                    placeholder="සිංහල නම"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category</label>
                                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Unit</label>
                                    <input
                                        type="text"
                                        value={form.unit}
                                        onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                                        placeholder="kg, pcs, L..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="form-column">
                            <div className="section-label">Pricing & Stock</div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Selling Price (LKR) <span className="required">*</span></label>
                                    <input
                                        type="number"
                                        value={form.price}
                                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className={errors.price ? 'error' : ''}
                                    />
                                    {errors.price && <span className="error-msg">{errors.price}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Cost Price (LKR)</label>
                                    <input
                                        type="number"
                                        value={form.costPrice}
                                        onChange={e => setForm(f => ({ ...f, costPrice: e.target.value }))}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Current Stock <span className="required">*</span></label>
                                    <input
                                        type="number"
                                        value={form.stock}
                                        onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                                        placeholder="0"
                                        min="0"
                                        className={errors.stock ? 'error' : ''}
                                    />
                                    {errors.stock && <span className="error-msg">{errors.stock}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Min Stock Alert</label>
                                    <input
                                        type="number"
                                        value={form.minStock}
                                        onChange={e => setForm(f => ({ ...f, minStock: e.target.value }))}
                                        placeholder="10"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {form.price && form.costPrice && parseFloat(form.costPrice) > 0 && (
                                <div className="margin-preview">
                                    <span>Profit Margin:</span>
                                    <strong style={{ color: '#10B981' }}>
                                        {(((parseFloat(form.price) - parseFloat(form.costPrice)) / parseFloat(form.costPrice)) * 100).toFixed(1)}%
                                    </strong>
                                </div>
                            )}

                            <div className="section-label" style={{ marginTop: 20 }}>Product Image URL</div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    value={form.img}
                                    onChange={e => setForm(f => ({ ...f, img: e.target.value }))}
                                    placeholder="https://..."
                                />
                                {form.img && (
                                    <div className="image-preview">
                                        <img src={form.img} alt="Preview" onError={e => e.target.style.display = 'none'} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-save">
                            {isEditing ? '✓ Save Changes' : '+ Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Inventory = () => {
    const { products, addProduct, updateProduct, deleteProduct, updateStock, lowStockProducts, outOfStockProducts } = usePOS();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [stockAdjustId, setStockAdjustId] = useState(null);
    const [stockAdjustVal, setStockAdjustVal] = useState('');
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const filteredProducts = products.filter(p => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = !term ||
            p.name.toLowerCase().includes(term) ||
            p.barcode?.includes(term) ||
            p.sku?.toLowerCase().includes(term);
        const matchesCat = filterCategory === 'all' || p.category === filterCategory;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'in-stock' && p.stock > p.minStock) ||
            (filterStatus === 'low-stock' && p.stock > 0 && p.stock <= p.minStock) ||
            (filterStatus === 'out-stock' && p.stock === 0);
        return matchesSearch && matchesCat && matchesStatus;
    });

    const handleSave = (form) => {
        if (editingProduct) {
            updateProduct(editingProduct.id, form);
            showToast(`"${form.name}" updated successfully`);
        } else {
            addProduct(form);
            showToast(`"${form.name}" added to inventory`);
        }
        setShowModal(false);
        setEditingProduct(null);
    };

    const handleDelete = (product) => {
        if (window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
            deleteProduct(product.id);
            showToast(`"${product.name}" deleted`, 'error');
        }
    };

    const handleStockAdjust = (product) => {
        const delta = parseInt(stockAdjustVal);
        if (!isNaN(delta) && delta !== 0) {
            updateStock(product.id, delta);
            showToast(`Stock updated: ${delta > 0 ? '+' : ''}${delta} units for "${product.name}"`);
        }
        setStockAdjustId(null);
        setStockAdjustVal('');
    };

    const getStockStatus = (p) => {
        if (p.stock === 0) return { label: 'OUT OF STOCK', cls: 'out-stock' };
        if (p.stock <= p.minStock) return { label: 'LOW STOCK', cls: 'low-stock' };
        return { label: 'IN STOCK', cls: 'in-stock' };
    };

    return (
        <div className="inventory-container">
            {toast && (
                <div className={`toast ${toast.type}`}>
                    {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                    {toast.msg}
                </div>
            )}

            <header className="inventory-header">
                <div>
                    <h1>Product Management</h1>
                    <p className="inv-subtitle">{products.length} products • {lowStockProducts.length} low stock • {outOfStockProducts.length} out of stock</p>
                </div>
                <button className="btn-primary" onClick={() => { setEditingProduct(null); setShowModal(true); }}>
                    <Plus size={18} /> Add New Product
                </button>
            </header>

            {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
                <div className="stock-alerts">
                    {outOfStockProducts.length > 0 && (
                        <div className="alert out">
                            <AlertTriangle size={16} />
                            {outOfStockProducts.length} products out of stock: {outOfStockProducts.map(p => p.name).join(', ')}
                        </div>
                    )}
                    {lowStockProducts.length > 0 && (
                        <div className="alert low">
                            <AlertTriangle size={16} />
                            {lowStockProducts.length} products running low: {lowStockProducts.map(p => `${p.name} (${p.stock})`).join(', ')}
                        </div>
                    )}
                </div>
            )}

            <div className="inventory-filters">
                <div className="search-input-wrapper">
                    <Search className="icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, barcode, or SKU..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="filter-select">
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="filter-select">
                    <option value="all">All Status</option>
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-stock">Out of Stock</option>
                </select>
            </div>

            <div className="inventory-table-container">
                <table className="inventory-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Barcode / SKU</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(item => {
                            const status = getStockStatus(item);
                            return (
                                <tr key={item.id}>
                                    <td>
                                        <div className="product-info-cell">
                                            <div className="product-thumb">
                                                <img src={item.img} alt={item.name} />
                                            </div>
                                            <div>
                                                <p className="prod-name">{item.name}</p>
                                                <p className="prod-sub">{item.nameSi} • {item.unit}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="barcode-cell">
                                            <Barcode size={13} />
                                            <span>{item.barcode}</span>
                                        </div>
                                        <div className="sku-cell">{item.sku}</div>
                                    </td>
                                    <td><span className="category-pill">{item.category}</span></td>
                                    <td>
                                        <div className="price-cell">
                                            <span className="sell-price">LKR {parseFloat(item.price).toFixed(2)}</span>
                                            {item.costPrice && <span className="cost-price">Cost: {parseFloat(item.costPrice).toFixed(2)}</span>}
                                        </div>
                                    </td>
                                    <td>
                                        {stockAdjustId === item.id ? (
                                            <div className="stock-adjust">
                                                <input
                                                    type="number"
                                                    value={stockAdjustVal}
                                                    onChange={e => setStockAdjustVal(e.target.value)}
                                                    placeholder="±qty"
                                                    autoFocus
                                                    onKeyDown={e => e.key === 'Enter' && handleStockAdjust(item)}
                                                />
                                                <button className="adj-ok" onClick={() => handleStockAdjust(item)}>✓</button>
                                                <button className="adj-cancel" onClick={() => setStockAdjustId(null)}>✕</button>
                                            </div>
                                        ) : (
                                            <button className="stock-val-btn" onClick={() => setStockAdjustId(item.id)} title="Click to adjust stock">
                                                <Package size={13} /> {item.stock} units
                                            </button>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`stock-badge ${status.cls}`}>{status.label}</span>
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="icon-btn edit" onClick={() => { setEditingProduct(item); setShowModal(true); }} title="Edit">
                                                <Edit2 size={15} />
                                            </button>
                                            <button className="icon-btn delete" onClick={() => handleDelete(item)} title="Delete">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredProducts.length === 0 && (
                            <tr>
                                <td colSpan="7" className="no-results-row">
                                    <Package size={40} color="#CBD5E1" />
                                    <p>No products found</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <ProductModal
                    product={editingProduct}
                    onSave={handleSave}
                    onClose={() => { setShowModal(false); setEditingProduct(null); }}
                />
            )}
        </div>
    );
};

export default Inventory;
