import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShieldIcon } from '../components/common/Icons';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      const loggedUser = await login(username, password);
      showSuccess(`Welcome, ${loggedUser.fullName}! Operational access granted.`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid credentials';
      setErrorMessage(msg);
      showError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-brand-icon">
            <ShieldIcon className="w-8 h-8" />
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px' }}>
            DEFENSE ASSET OPS
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            Multi-Base Operational Equipment Management System
          </p>
        </div>

        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            padding: '0.75rem',
            borderRadius: '6px',
            fontSize: '0.82rem',
            marginBottom: '1.25rem',
            textAlign: 'center'
          }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div className="form-group">
            <label className="form-label">Operator ID / Username</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. admin or commander_alpha"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Access Code / Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Verifying Credentials...' : 'Authenticate & Sign In'}
          </button>
        </form>

        {/* 1-Click Quick Login Sample Accounts */}
        <div className="sample-accounts-box">
          <div style={{ fontWeight: 700, color: '#93c5fd', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Quick-Fill Role Credentials
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'space-between', fontSize: '0.72rem' }}
              onClick={() => handleQuickLogin('admin', 'admin123')}
            >
              <span><strong>ADMIN</strong> (Global Access)</span>
              <span style={{ color: '#94a3b8' }}>admin / admin123</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'space-between', fontSize: '0.72rem' }}
              onClick={() => handleQuickLogin('commander_alpha', 'commander123')}
            >
              <span><strong>BASE COMMANDER</strong> (FOB Alpha)</span>
              <span style={{ color: '#94a3b8' }}>commander_alpha / commander123</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'space-between', fontSize: '0.72rem' }}
              onClick={() => handleQuickLogin('logistics_officer', 'logistics123')}
            >
              <span><strong>LOGISTICS OFFICER</strong> (Purchases & Transfers)</span>
              <span style={{ color: '#94a3b8' }}>logistics_officer / logistics123</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
