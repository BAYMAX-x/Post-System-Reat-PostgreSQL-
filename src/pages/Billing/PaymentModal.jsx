import React, { useState } from 'react';
import { X, CreditCard, Wallet, QrCode, Smartphone } from 'lucide-react';
import './PaymentModal.css';

const PaymentModal = ({ total, onClose, onComplete }) => {
    const [method, setMethod] = useState('cash');
    const [cashReceived, setCashReceived] = useState('');

    const change = method === 'cash' ? (parseFloat(cashReceived) || 0) - total : 0;

    const quickAmounts = [
        Math.ceil(total / 50) * 50,
        Math.ceil(total / 100) * 100,
        Math.ceil(total / 500) * 500,
        Math.ceil(total / 1000) * 1000,
    ].filter((v, i, arr) => arr.indexOf(v) === i);

    const handleComplete = () => {
        if (method === 'cash' && parseFloat(cashReceived) < total) return;
        onComplete(method);
    };

    const methods = [
        { id: 'cash', label: 'Cash', icon: <Wallet size={22} /> },
        { id: 'card', label: 'Card', icon: <CreditCard size={22} /> },
        { id: 'qr', label: 'LankaQR', icon: <QrCode size={22} /> },
        { id: 'mobile', label: 'Mobile', icon: <Smartphone size={22} /> },
    ];

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="payment-modal">
                <div className="modal-header">
                    <h2>Process Payment</h2>
                    <button className="close-btn" onClick={onClose}><X size={22} /></button>
                </div>

                <div className="amount-due">
                    <p>Amount Due</p>
                    <h1>LKR {total.toLocaleString('en', { minimumFractionDigits: 2 })}</h1>
                </div>

                <div className="payment-methods">
                    {methods.map(m => (
                        <button
                            key={m.id}
                            className={`method-btn ${method === m.id ? 'active' : ''}`}
                            onClick={() => { setMethod(m.id); setCashReceived(''); }}
                        >
                            {m.icon}
                            <span>{m.label}</span>
                        </button>
                    ))}
                </div>

                {method === 'cash' && (
                    <div className="cash-section">
                        <label>Cash Received (LKR)</label>
                        <input
                            type="number"
                            value={cashReceived}
                            onChange={(e) => setCashReceived(e.target.value)}
                            placeholder="0.00"
                            autoFocus
                        />
                        <div className="quick-amounts">
                            {quickAmounts.map(amt => (
                                <button key={amt} className="quick-btn" onClick={() => setCashReceived(String(amt))}>
                                    {amt.toLocaleString()}
                                </button>
                            ))}
                        </div>
                        {change > 0 && (
                            <div className="change-display">
                                Change: <strong>LKR {change.toFixed(2)}</strong>
                            </div>
                        )}
                    </div>
                )}

                {method !== 'cash' && (
                    <div className="digital-section">
                        <div className="digital-info">
                            {method === 'qr' && <QrCode size={80} color="#10B981" />}
                            {method === 'card' && <CreditCard size={80} color="#6366F1" />}
                            {method === 'mobile' && <Smartphone size={80} color="#F59E0B" />}
                            <p>Process payment on {method === 'card' ? 'card terminal' : 'device'}, then confirm below.</p>
                        </div>
                    </div>
                )}

                <button
                    className="confirm-pay-btn"
                    onClick={handleComplete}
                    disabled={method === 'cash' && parseFloat(cashReceived) < total}
                >
                    Confirm Payment
                </button>
            </div>
        </div>
    );
};

export default PaymentModal;
