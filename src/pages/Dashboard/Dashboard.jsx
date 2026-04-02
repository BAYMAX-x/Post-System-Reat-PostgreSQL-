import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingCart, Package, FileText, Bell, TrendingUp, ArrowUpRight,
    CreditCard, QrCode, Wallet, AlertTriangle, Users
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { usePOS } from '../../context/POSContext';
import './Dashboard.css';

const chartData = [
    { time: '8 AM', value: 8400 },
    { time: '10 AM', value: 13200 },
    { time: '12 PM', value: 19800 },
    { time: '2 PM', value: 25600 },
    { time: '4 PM', value: 21400 },
    { time: '6 PM', value: 14200 },
    { time: '8 PM', value: 8100 },
];

const Dashboard = () => {
    const navigate = useNavigate();
    const { products, customers, transactions, lowStockProducts, outOfStockProducts } = usePOS();

    const todayRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
    const totalBills = transactions.length;
    const avgBill = totalBills > 0 ? todayRevenue / totalBills : 0;

    const paymentBreakdown = {
        cash: transactions.filter(t => t.paymentMethod === 'cash').reduce((s, t) => s + t.total, 0),
        card: transactions.filter(t => t.paymentMethod === 'card').reduce((s, t) => s + t.total, 0),
        qr: transactions.filter(t => t.paymentMethod === 'qr').reduce((s, t) => s + t.total, 0),
    };

    const topProducts = products
        .map(p => {
            const sold = transactions.reduce((sum, t) => {
                const item = t.items?.find(i => i.id === p.id);
                return sum + (item ? item.qty : 0);
            }, 0);
            const revenue = sold * p.price;
            return { ...p, sold, revenue };
        })
        .filter(p => p.sold > 0)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 4);

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-info">
                    <h1>Dashboard Overview</h1>
                    <p>{dateStr}</p>
                </div>
                <div className="header-actions">
                    {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
                        <button className="alert-btn" onClick={() => navigate('/inventory')}>
                            <AlertTriangle size={16} />
                            {lowStockProducts.length + outOfStockProducts.length} Stock Alerts
                        </button>
                    )}
                    <div className="status-badge">
                        <span className="dot-green"></span>
                        System Online
                    </div>
                    <button className="notification-btn" title="Notifications">
                        <Bell size={20} />
                    </button>
                </div>
            </header>

            <section className="quick-actions">
                <div className="action-card primary" onClick={() => navigate('/billing')}>
                    <div className="icon-box"><ShoppingCart size={24} /></div>
                    <span>New Bill</span>
                </div>
                <div className="action-card" onClick={() => navigate('/inventory')}>
                    <div className="icon-box"><Package size={24} /></div>
                    <span>Add Stock</span>
                </div>
                <div className="action-card" onClick={() => navigate('/customers')}>
                    <div className="icon-box"><Users size={24} /></div>
                    <span>Customers</span>
                </div>
                <div className="action-card" onClick={() => navigate('/reports')}>
                    <div className="icon-box"><FileText size={24} /></div>
                    <span>Reports</span>
                </div>
            </section>

            <section className="stats-grid">
                <div className="stat-card">
                    <p className="stat-label">TODAY'S REVENUE</p>
                    <p className="stat-value">
                        <span>Rs.</span>{' '}
                        {todayRevenue > 0 ? todayRevenue.toLocaleString('en', { minimumFractionDigits: 2 }) : '—'}
                    </p>
                    {todayRevenue > 0 && (
                        <div className="stat-change up">
                            <TrendingUp size={14} />
                            {totalBills} transactions today
                        </div>
                    )}
                    {todayRevenue === 0 && <p className="stat-subtext">No sales yet today</p>}
                </div>
                <div className="stat-card">
                    <p className="stat-label">TOTAL BILLS</p>
                    <p className="stat-value">{totalBills}</p>
                    <p className="stat-subtext">
                        {avgBill > 0 ? `Avg. Rs. ${avgBill.toFixed(0)} / bill` : 'No bills yet'}
                    </p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">TOTAL PRODUCTS</p>
                    <p className="stat-value">{products.length}</p>
                    {(outOfStockProducts.length > 0 || lowStockProducts.length > 0) ? (
                        <div className="stat-change" style={{ color: '#F59E0B' }}>
                            <AlertTriangle size={14} />
                            {outOfStockProducts.length} out • {lowStockProducts.length} low
                        </div>
                    ) : (
                        <p className="stat-subtext" style={{ color: '#10B981' }}>All stock levels OK</p>
                    )}
                </div>
            </section>

            <div className="main-grid">
                <div className="chart-card">
                    <div className="card-title">
                        <h3>Today's Sales Trend</h3>
                        <select className="time-select">
                            <option>Last 24 Hours</option>
                        </select>
                    </div>
                    <div style={{ width: '100%', height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: '#F8FAFC' }}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}
                                    formatter={v => [`Rs. ${v.toLocaleString()}`, 'Sales']}
                                />
                                <Bar dataKey="value" fill="#00E640" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="top-items-card">
                    <div className="card-title">
                        <h3>Top Selling Items</h3>
                    </div>
                    <div className="items-list">
                        {topProducts.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#94A3B8', padding: '30px' }}>
                                <ShoppingCart size={32} color="#CBD5E1" />
                                <p style={{ marginTop: 10, fontSize: '0.85rem' }}>No sales recorded yet</p>
                            </div>
                        )}
                        {topProducts.map((item, index) => (
                            <div key={index} className="item-row">
                                <div className="item-img">
                                    <img src={item.img} alt={item.name} />
                                </div>
                                <div className="item-info">
                                    <p className="item-name">{item.name}</p>
                                    <p className="item-sales">{item.sold} units sold</p>
                                </div>
                                <div className="item-price">
                                    <span>Rs.</span>
                                    {item.revenue.toLocaleString('en', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <section className="payment-methods">
                <div className="payment-card">
                    <div className="payment-icon"><Wallet size={20} /></div>
                    <div className="payment-info">
                        <p>Cash</p>
                        <p>Rs. {paymentBreakdown.cash.toLocaleString('en', { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>
                <div className="payment-card">
                    <div className="payment-icon" style={{ color: '#6366F1', background: '#EEF2FF' }}>
                        <CreditCard size={20} />
                    </div>
                    <div className="payment-info">
                        <p>Card</p>
                        <p>Rs. {paymentBreakdown.card.toLocaleString('en', { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>
                <div className="payment-card">
                    <div className="payment-icon" style={{ color: '#10B981', background: '#ECFDF5' }}>
                        <QrCode size={20} />
                    </div>
                    <div className="payment-info">
                        <p>LankaQR / Digital</p>
                        <p>Rs. {paymentBreakdown.qr.toLocaleString('en', { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
