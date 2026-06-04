// src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NODE_API } from './config/api';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import PatientManagement from './components/PatientManagement';
import AppointmentBooker from './components/AppointmentBooker';
import TriageSystem from './components/TriageSystem';
import LoginView from './components/LoginView';

const App = () => {
  const [authData, setAuthData] = useState(() => {
    const token = localStorage.getItem('careflow_token');
    const userJson = localStorage.getItem('careflow_user');
    return token && userJson ? { token, user: JSON.parse(userJson) } : null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshData = async () => {
    if (!authData?.token) return;
    setLoading(true);
    setError('');

    try {
      const headers = { Authorization: `Bearer ${authData.token}` };
      
      console.log('Fetching patients and appointments from Node server...');
      const [patientsRes, apptsRes] = await Promise.all([
        axios.get(`${NODE_API}/api/patients`, { headers }),
        axios.get(`${NODE_API}/api/appointments`, { headers })
      ]);

      setPatients(patientsRes.data);
      setAppointments(apptsRes.data);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the API gateway. Ensure Node.js server is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authData?.token) {
      refreshData();
      
      // Auto refresh data every 30 seconds for real-time vibe
      const interval = setInterval(refreshData, 30000);
      return () => clearInterval(interval);
    }
  }, [authData]);

  const handleLogout = () => {
    localStorage.removeItem('careflow_token');
    localStorage.removeItem('careflow_user');
    setAuthData(null);
    setPatients([]);
    setAppointments([]);
  };

  // If user is not logged in, show login panel
  if (!authData) {
    return <LoginView setAuthData={setAuthData} />;
  }

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={authData.user}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {error && (
          <div className="glass-panel" style={{
            background: 'var(--status-critical-glow)',
            color: 'var(--status-critical)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '12px 16px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>⚠️ {error}</span>
            <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={refreshData}>
              Retry Connection
            </button>
          </div>
        )}

        {loading && (patients.length === 0) ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid rgba(255, 255, 255, 0.05)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span style={{ color: 'var(--text-secondary)' }}>Syncing Hospital Roster...</span>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView 
                patients={patients} 
                appointments={appointments} 
                setActiveTab={setActiveTab}
              />
            )}
            {activeTab === 'patients' && (
              <PatientManagement 
                patients={patients} 
                refreshData={refreshData}
                user={authData.user}
              />
            )}
            {activeTab === 'appointments' && (
              <AppointmentBooker 
                appointments={appointments} 
                patients={patients}
                refreshData={refreshData}
              />
            )}
            {activeTab === 'triage' && (
              <TriageSystem 
                patients={patients} 
                refreshData={refreshData}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
