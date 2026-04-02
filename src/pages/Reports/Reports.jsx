import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import './Reports.css';

const SALES_DATA = [
    { day: 'Mon', sales: 4000 },
    { day: 'Tue', sales: 3000 },
    { day: 'Wed', sales: 2000 },
    { day: 'Thu', sales: 2780 },
    { day: 'Fri', sales: 1890 },
    { day: 'Sat', sales: 2390 },
    { day: 'Sun', sales: 3490 },
];

const CATEGORY_DATA = [
    { name: 'Rice', value: 400 },
    { name: 'Vegetables', value: 300 },
    { name: 'Dairy', value: 200 },
    { name: 'Spices', value: 278 },
    { name: 'Bakery', value: 189 },
];

const Reports = () => {
    return (
        <div className="reports-container">
            <header className="reports-header">
                <h1>Sales & Performance Reports</h1>
                <div className="header-btns">
                    <select className="time-select" style={{ padding: '10px 16px' }}>
                        <option>This Week</option>
                        <option>Last Week</option>
                        <option>This Month</option>
                    </select>
                </div>
            </header>

            <section className="report-stats-grid">
                <div className="report-stat-card">
                    <p className="report-stat-label">TOTAL SALES</p>
                    <p className="report-stat-value">Rs. 842,500</p>
                </div>
                <div className="report-stat-card">
                    <p className="report-stat-label">TOTAL ORDERS</p>
                    <p className="report-stat-value">1,245</p>
                </div>
                <div className="report-stat-card">
                    <p className="report-stat-label">AVG ORDER VALUE</p>
                    <p className="report-stat-value">Rs. 676.70</p>
                </div>
                <div className="report-stat-card">
                    <p className="report-stat-label">TOTAL CUSTOMERS</p>
                    <p className="report-stat-value">892</p>
                </div>
            </section>

            <div className="report-main-grid">
                <div className="report-card">
                    <h3>Weekly Sales Revenue</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={SALES_DATA}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="sales" stroke="#00E640" strokeWidth={3} dot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="report-card">
                    <h3>Sales by Category</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={CATEGORY_DATA} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={80} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#00E640" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
