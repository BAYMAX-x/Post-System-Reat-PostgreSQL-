import React, { useState } from 'react';
import { Printer, Share2, MessageCircle, ArrowLeft, LayoutDashboard, CheckCircle } from 'lucide-react';
import './DigitalReceipt.css';

const DigitalReceipt = ({ transaction, customer, onNewBill, onDashboard }) => {
    const [whatsappNumber, setWhatsappNumber] = useState('');

    if (!transaction) return null;

    const date = new Date(transaction.timestamp || transaction.createdAt);
    const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const billNo = transaction.billNo || transaction.id;

    const paymentLabels = { cash: 'CASH', card: 'CARD', qr: 'LANKAقR', mobile: 'MOBILE' };
    const loyaltyEarned = Math.floor(transaction.total / 10);

    const handleWhatsApp = () => {
        const num = whatsappNumber.replace(/[^0-9]/g, '');
        if (num.length < 9) return;
        const intl = num.startsWith('0') ? '94' + num.slice(1) : num;
        const msg = encodeURIComponent(
            `*Lanka Fresh Market - Receipt*\nBill: #${billNo}\nDate: ${dateStr} ${timeStr}\nTotal: LKR ${transaction.total.toFixed(2)}\nPayment: ${paymentLabels[transaction.paymentMethod]}\nThank you for shopping!`
        );
        window.open(`https://wa.me/${intl}?text=${msg}`, '_blank');
    };

    return (
        <div className="receipt-page">
            <div className="receipt-container">

                {/* LEFT: Paper Receipt */}
                <div className="receipt-paper">
                    <div className="receipt-logo">
                        <div className="logo-icon-sm">LF</div>
                    </div>
                    <h2 className="receipt-store-name">LANKA FRESH MARKET</h2>
                    <p className="receipt-store-addr">No. 45, Galle Road, Colombo 03</p>
                    <p className="receipt-store-addr">Tel: +94 11 2345 678</p>
                    <p className="receipt-vat">VAT REG NO: 123456789-7000</p>

                    <div className="receipt-divider-dotted"></div>

                    <div className="receipt-bill-meta">
                        <div>
                            <span className="meta-label">Bill No:</span>
                            <span className="meta-value bold">#{billNo}</span>
                        </div>
                        <div>
                            <span className="meta-label">Time:</span>
                            <span className="meta-value">{timeStr}</span>
                        </div>
                        <div>
                            <span className="meta-label">Date:</span>
                            <span className="meta-value">{dateStr}</span>
                        </div>
                        <div>
                            <span className="meta-label">Mode:</span>
                            <span className="meta-value bold">{paymentLabels[transaction.paymentMethod]}</span>
                        </div>
                    </div>

                    <div className="receipt-divider-dotted"></div>

                    <div className="receipt-items-header">
                        <span>ITEM</span>
                        <span>QTY</span>
                        <span>PRICE</span>
                        <span>TOTAL</span>
                    </div>
                    {transaction.items.map((item, i) => (
                        <div key={i} className="receipt-item-row">
                            <span className="ri-name">{item.name || item.productName}</span>
                            <span className="ri-qty">{item.qty || item.quantity}</span>
                            <span className="ri-price">{parseFloat(item.price).toFixed(2)}</span>
                            <span className="ri-total">{(parseFloat(item.price) * (item.qty || item.quantity)).toFixed(2)}</span>
                        </div>
                    ))}

                    <div className="receipt-divider-dotted"></div>

                    <div className="receipt-totals">
                        <div className="total-line">
                            <span>Sub Total</span>
                            <span>{parseFloat(transaction.subtotal).toFixed(2)}</span>
                        </div>
                        {transaction.discountAmount > 0 && (
                            <div className="total-line">
                                <span>Discount ({transaction.discount?.type === 'percent' ? `${transaction.discount.value}%` : 'fixed'})</span>
                                <span>-{parseFloat(transaction.discountAmount).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="total-line">
                            <span>VAT (8%)</span>
                            <span>{parseFloat(transaction.tax || transaction.taxAmount).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="receipt-grand-total">
                        <span>NET TOTAL</span>
                        <span>LKR {parseFloat(transaction.total).toFixed(2)}</span>
                    </div>

                    <div className="paid-stamp">PAID</div>

                    <div className="receipt-divider-dotted"></div>

                    <div className="receipt-thank-you">
                        <p>THANK YOU!</p>
                        <p className="si-text">ඔබට ස්තූතියි!</p>
                        <p className="receipt-note">Please retain this receipt for any returns within 7 days.</p>
                    </div>
                </div>

                {/* RIGHT: Payment Success Panel */}
                <div className="receipt-right">
                    <div className="success-header">
                        <CheckCircle size={32} color="#10B981" />
                        <div>
                            <h2>Payment Successful</h2>
                            <p>Transaction completed via {paymentLabels[transaction.paymentMethod]}. The receipt is ready to be shared or printed.</p>
                        </div>
                    </div>

                    <div className="share-options">
                        <button className="share-btn print" onClick={() => window.print()}>
                            <Printer size={28} />
                            <span className="share-label">Print Receipt</span>
                            <span className="share-sub">Default Printer: Thermal 80mm</span>
                        </button>
                        <button className="share-btn digital active-share">
                            <Share2 size={28} />
                            <span className="share-label">Digital Receipt</span>
                            <span className="share-sub">Send via E-mail or App</span>
                        </button>
                    </div>

                    <div className="whatsapp-section">
                        <p className="wa-label">WhatsApp Receipt (Sri Lanka)</p>
                        <div className="wa-input-row">
                            <div className="wa-input-wrap">
                                <span className="wa-prefix">+94</span>
                                <input
                                    type="tel"
                                    placeholder="7x xxx xxxx"
                                    value={whatsappNumber}
                                    onChange={e => setWhatsappNumber(e.target.value)}
                                />
                            </div>
                            <button className="wa-btn" onClick={handleWhatsApp}>
                                <MessageCircle size={18} />
                                WhatsApp
                            </button>
                        </div>
                    </div>

                    <div className="receipt-cta-row">
                        <button className="cta-new-sale" onClick={onNewBill}>
                            🛒 START NEW SALE
                        </button>
                        <button className="cta-dashboard" onClick={onDashboard}>
                            <LayoutDashboard size={16} />
                            Back to Dashboard
                        </button>
                    </div>

                    <div className="receipt-chips">
                        <div className="chip stock">
                            <span className="chip-dot green"></span>
                            <span className="chip-label">STOCK STATUS</span>
                            <span className="chip-val">Updated</span>
                        </div>
                        <div className="chip loyalty">
                            <span className="chip-dot green"></span>
                            <span className="chip-label">LOYALTY POINTS</span>
                            <span className="chip-val">+{loyaltyEarned} pts</span>
                        </div>
                        <div className="chip sync">
                            <span className="chip-dot blue"></span>
                            <span className="chip-label">DATABASE</span>
                            <span className="chip-val">Saved ✓</span>
                        </div>
                    </div>

                    <div className="receipt-footer">
                        © 2026 Lanka Fresh Retail Systems. Licensed to Lanka Fresh Market.<br />
                        POS Terminal ID: {transaction.registerId || 'REG-01'} • System Version 4.2.0-stable
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DigitalReceipt;
