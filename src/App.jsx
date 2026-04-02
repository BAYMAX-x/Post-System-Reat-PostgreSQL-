import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { POSProvider } from './context/POSContext';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Billing from './pages/Billing/Billing';
import Inventory from './pages/Inventory/Inventory';
import Reports from './pages/Reports/Reports';
import Customers from './pages/Customers/Customers';
import './App.css';

import MainLayout from './components/MainLayout';

function App() {
    return (
        <POSProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route element={<MainLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/billing" element={<Billing />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/customers" element={<Customers />} />
                    </Route>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </POSProvider>
    );
}

export default App;
