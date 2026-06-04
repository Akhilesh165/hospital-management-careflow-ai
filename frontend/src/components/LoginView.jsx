// src/components/LoginView.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Activity, Shield, User as UserIcon, Lock } from 'lucide-react';
import { NODE_API } from '../config/api';

const LoginView = ({ setAuthData }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('receptionist');
  const [specialization, setSpecialization] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = `${NODE_API}/api/auth`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await axios.post(`${API_URL}/login`, { username, password });
        localStorage.setItem('careflow_token', res.data.token);
        localStorage.setItem('careflow_user', JSON.stringify(res.data.user));
        setAuthData({ token: res.data.token, user: res.data.user });
      } else {
        const payload = { username, password, role, name };
        if (role === 'doctor') payload.specialization = specialization;
        
        const res = await axios.post(`${API_URL}/register`, payload);
        localStorage.setItem('careflow_token', res.data.token);
        localStorage.setItem('careflow_user', JSON.stringify(res.data.user));
        setAuthData({ token: res.data.token, user: res.data.user });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Authentication failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel">
        <div className="login-logo">
          <Activity size={48} color="var(--primary)" className="brand-icon" />
          <h1>CareFlow AI</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Intelligent Triage & Resource Coordinator
          </p>
        </div>

        {error && (
          <div style={{
            background: 'var(--status-critical-glow)',
            color: 'var(--status-critical)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: '38px' }}
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>System Role</label>
                <select
                  className="form-control"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="receptionist">Receptionist</option>
                  <option value="doctor">Medical Practitioner (Doctor)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {role === 'doctor' && (
                <div className="form-group">
                  <label>Specialization</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Cardiology, Pediatrics, ICU"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    required
                  />
                </div>
              )}
            </>
          )}

          <div className="form-group">
            <label>Username</label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '38px' }}
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '38px' }}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '10px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : isLogin ? 'Access System' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontSize: '13px',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? "Need a new account? Register here" : "Already have an account? Sign in"}
          </button>
        </div>

        <div style={{
          marginTop: '32px',
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px dashed var(--panel-border)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: '600', marginBottom: '8px' }}>
            <Shield size={14} />
            <span>Pre-seeded Demo Accounts</span>
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>
            <div>🔑 <strong>Admin:</strong> admin / admin123</div>
            <div>🔑 <strong>Doctor:</strong> doctor / doctor123</div>
            <div>🔑 <strong>Receptionist:</strong> reception / reception123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
