import React, { useState } from 'react';
import {
    Users, Plus, Search, Phone, Mail, Star, Edit2, Trash2, X, Award
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import './Customers.css';

const CustomerModal = ({ customer, onSave, onClose }) => {
    const [form, setForm] = useState(customer || { name: '', phone: '', email: '', type: 'Regular' });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Name is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) onSave(form);
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="customer-modal">
                <div className="modal-header">
                    <h2>{customer ? '✏️ Edit Customer' : '➕ Add Customer'}</h2>
                    <button className="close-btn" onClick={onClose}><X size={22} /></button>
                </div>
                <form onSubmit={handleSubmit} className="customer-form">
                    <div className="form-group">
                        <label>Full Name <span className="required">*</span></label>
                        <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Nihal Perera" className={errors.name ? 'error' : ''} autoFocus />
                        {errors.name && <span className="error-msg">{errors.name}</span>}
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="077-XXXXXXX" />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
                    </div>
                    <div className="form-group">
                        <label>Customer Type</label>
                        <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                            <option value="Regular">Regular</option>
                            <option value="VIP">VIP</option>
                            <option value="Wholesale">Wholesale</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-save">{customer ? '✓ Save Changes' : '+ Add Customer'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Customers = () => {
    const { customers, addCustomer, updateCustomer, transactions } = usePOS();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const filtered = customers.filter(c => {
        if (c.id === 'walk-in') return false;
        const t = searchTerm.toLowerCase();
        return !t || c.name.toLowerCase().includes(t) || c.phone?.includes(t) || c.email?.toLowerCase().includes(t);
    });

    const handleSave = (form) => {
        if (editingCustomer) updateCustomer(editingCustomer.id, form);
        else addCustomer(form);
        setShowModal(false);
        setEditingCustomer(null);
    };

    const getCustomerTransactions = (customerId) =>
        transactions.filter(t => t.customerId === customerId);

    const getTypeColor = (type) => ({
        VIP: '#F59E0B', Wholesale: '#6366F1', Regular: '#10B981'
    })[type] || '#64748B';

    return (
        <div className="customers-container">
            <header className="customers-header">
                <div>
                    <h1>Customer Management</h1>
                    <p className="sub">{filtered.length} registered customers</p>
                </div>
                <button className="btn-primary" onClick={() => { setEditingCustomer(null); setShowModal(true); }}>
                    <Plus size={18} /> Add Customer
                </button>
            </header>

            <div className="customer-search">
                <Search size={18} className="search-ico" />
                <input
                    type="text"
                    placeholder="Search by name, phone, or email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="customers-grid">
                {filtered.map(c => {
                    const txns = getCustomerTransactions(c.id);
                    const totalSpent = txns.reduce((sum, t) => sum + t.total, 0) + (c.totalSpent || 0);
                    return (
                        <div
                            key={c.id}
                            className={`customer-card ${selectedCustomer?.id === c.id ? 'selected' : ''}`}
                            onClick={() => setSelectedCustomer(selectedCustomer?.id === c.id ? null : c)}
                        >
                            <div className="customer-avatar">
                                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.name}`} alt={c.name} />
                                {c.type === 'VIP' && <div className="vip-badge"><Star size={10} /></div>}
                            </div>
                            <div className="customer-info">
                                <h3>{c.name}</h3>
                                <div className="customer-meta">
                                    {c.phone && <span><Phone size={12} /> {c.phone}</span>}
                                    {c.email && <span><Mail size={12} /> {c.email}</span>}
                                </div>
                                <div className="customer-stats-row">
                                    <span className="customer-type" style={{ background: `${getTypeColor(c.type)}22`, color: getTypeColor(c.type) }}>
                                        {c.type}
                                    </span>
                                    <span className="customer-points"><Award size={12} /> {(c.loyaltyPoints || 0) + txns.reduce((s, t) => s + Math.floor(t.total / 10), 0)} pts</span>
                                    <span className="customer-spent">LKR {totalSpent.toLocaleString('en', { minimumFractionDigits: 0 })}</span>
                                </div>
                            </div>
                            <div className="customer-actions">
                                <button className="icon-btn edit" title="Edit" onClick={e => { e.stopPropagation(); setEditingCustomer(c); setShowModal(true); }}>
                                    <Edit2 size={15} />
                                </button>
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="no-customers">
                        <Users size={48} color="#CBD5E1" />
                        <p>No customers found</p>
                    </div>
                )}
            </div>

            {selectedCustomer && (
                <div className="customer-detail-panel">
                    <div className="panel-header">
                        <h3>Transaction History — {selectedCustomer.name}</h3>
                        <button className="close-btn" onClick={() => setSelectedCustomer(null)}><X size={20} /></button>
                    </div>
                    <div className="transactions-list">
                        {getCustomerTransactions(selectedCustomer.id).length === 0 && (
                            <p className="no-txn">No transactions yet in this session.</p>
                        )}
                        {getCustomerTransactions(selectedCustomer.id).map(t => (
                            <div key={t.id} className="txn-row">
                                <div>
                                    <p className="txn-id">{t.id}</p>
                                    <p className="txn-date">{new Date(t.timestamp).toLocaleString()}</p>
                                </div>
                                <div className="txn-right">
                                    <span className="txn-method">{t.paymentMethod}</span>
                                    <span className="txn-total">LKR {t.total.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showModal && (
                <CustomerModal
                    customer={editingCustomer}
                    onSave={handleSave}
                    onClose={() => { setShowModal(false); setEditingCustomer(null); }}
                />
            )}
        </div>
    );
};

export default Customers;
