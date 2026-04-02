import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Delete, Clock, Calendar, Signal } from 'lucide-react';
import './Login.css';

const Login = () => {
    const [pin, setPin] = useState('');
    const navigate = useNavigate();

    const handleKeyPress = (num) => {
        if (pin.length < 4) {
            setPin(prev => prev + num);
        }
    };

    const handleClear = () => setPin('');
    const handleBackspace = () => setPin(prev => prev.slice(0, -1));

    const handleStartShift = () => {
        if (pin.length === 4) {
            // In a real app, verify PIN here
            navigate('/dashboard');
        }
    };

    return (
        <div className="login-page">
            <header className="login-header">
                <div className="brand">
                    <div className="brand-icon">
                        <Store size={24} />
                    </div>
                    <div className="brand-text">
                        <h2>LankaFresh</h2>
                        <p>Supermarket POS</p>
                    </div>
                </div>
                <div className="lang-toggle">
                    <button className="lang-btn active">English</button>
                    <button className="lang-btn">සිංහල</button>
                </div>
            </header>

            <main className="login-main">
                <div className="login-card">
                    <div className="cashier-img">
                        {/* Using a placeholder for the cashier avatar */}
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&hair=short" alt="Cashier" />
                    </div>
                    <h1>Cashier Login</h1>
                    <p className="subtitle">අයකැමි පිවිසුම</p>

                    <div className="pin-display">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`pin-dot ${pin.length >= i ? 'filled' : ''}`}></div>
                        ))}
                    </div>
                    <p className="pin-label">ENTER PIN / මුරපදය ඇතුළත් කරන්න</p>

                    <div className="keypad">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button key={num} onClick={() => handleKeyPress(num.toString())} className="key-btn">
                                {num}
                            </button>
                        ))}
                        <button onClick={handleClear} className="key-btn clear">
                            <span>CLEAR</span>
                            <span>මකන්න</span>
                        </button>
                        <button onClick={() => handleKeyPress('0')} className="key-btn">0</button>
                        <button onClick={handleBackspace} className="key-btn back">
                            <Delete size={24} />
                        </button>
                    </div>

                    <button
                        className="start-btn"
                        onClick={handleStartShift}
                        disabled={pin.length !== 4}
                        style={{ opacity: pin.length === 4 ? 1 : 0.7 }}
                    >
                        START SHIFT
                        <p>වැඩ ආරම්භ කරන්න</p>
                    </button>

                    <div className="card-footer">
                        <div className="status-online">
                            <span className="dot-green"></span>
                            SYSTEM ONLINE
                        </div>
                        <div className="term-id">TERM-ID: COL-04-2026</div>
                    </div>
                </div>
            </main>

            <footer className="page-footer">
                <div className="footer-stats">
                    <div className="footer-stat">
                        <Clock size={16} />
                        <span>10:45 AM</span>
                    </div>
                    <div className="footer-stat">
                        <Calendar size={16} />
                        <span>Oct 14, 2026</span>
                    </div>
                    <div className="footer-stat">
                        <Signal size={16} />
                        <span>Signal Stable</span>
                    </div>
                </div>
                <p className="footer-copy">
                    Powered by RetailOS v4.2.1 • Licensed to LankaFresh Supermarkets PLC
                </p>
            </footer>
        </div>
    );
};

export default Login;
