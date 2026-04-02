import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, ShoppingCart, Package, BarChart3, Users, LogOut
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import './Sidebar.css';

const Sidebar = () => {
    const { lowStockProducts, outOfStockProducts, transactions } = usePOS();
    const navigate = useNavigate();

    const alertCount = lowStockProducts.length + outOfStockProducts.length;

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
        { icon: <ShoppingCart size={20} />, label: 'Sales / POS', path: '/billing', badge: transactions.length || null },
        { icon: <Package size={20} />, label: 'Inventory', path: '/inventory', badge: alertCount || null, badgeType: alertCount > 0 ? 'warning' : null },
        { icon: <BarChart3 size={20} />, label: 'Reports', path: '/reports' },
        { icon: <Users size={20} />, label: 'Customers', path: '/customers' },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon">LF</div>
                <div>
                    <span className="logo-name">LankaFresh</span>
                    <span className="logo-sub">POS System</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                        {item.badge && (
                            <span className={`nav-badge ${item.badgeType || 'default'}`}>
                                {item.badge}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kasun" alt="User" />
                    <div className="user-info">
                        <p className="user-name">Kasun Perera</p>
                        <p className="user-role">Manager</p>
                    </div>
                </div>
                <button className="logout-btn" onClick={() => navigate('/login')}>
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
