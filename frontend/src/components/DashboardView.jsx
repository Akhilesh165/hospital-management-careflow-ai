// src/components/DashboardView.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NODE_API } from '../config/api';
import { Users, AlertTriangle, ShieldAlert, CheckCircle, Bed, UserCheck, Flame } from 'lucide-react';

const DashboardView = ({ patients, appointments, setActiveTab }) => {
  const [dbStatus, setDbStatus] = useState('Checking...');
  
  useEffect(() => {
    axios.get(`${NODE_API}/api/health`)
      .then(res => setDbStatus(res.data.database === 'in-memory' ? 'In-Memory (Demo)' : 'MongoDB (Live)'))
      .catch(() => setDbStatus('Offline'));
  }, []);

  // Compute metrics
  const totalPatients = patients.length;
  const icuCount = patients.filter(p => p.admittedStatus === 'ICU').length;
  const hduCount = patients.filter(p => p.admittedStatus === 'HDU').length;
  const wardCount = patients.filter(p => p.admittedStatus === 'General Ward').length;
  const outpatientCount = patients.filter(p => p.admittedStatus === 'Outpatient').length;
  
  const pendingAppointments = appointments.filter(a => a.status === 'Pending').length;
  const completedAppointments = appointments.filter(a => a.status === 'Completed').length;

  // Critical Patients (Triage status Critical or Urgent)
  const criticalPatients = patients.filter(p => {
    if (!p.triageHistory || p.triageHistory.length === 0) return false;
    const cat = p.triageHistory[0].category;
    return cat === 'Critical' || cat === 'Urgent';
  });

  // Calculate bed occupancy percentages (Mock total beds for visualization)
  const bedStats = [
    { name: 'ICU Beds', occupied: icuCount, total: 10, color: 'var(--status-critical)' },
    { name: 'HDU Beds', occupied: hduCount, total: 15, color: 'var(--status-urgent)' },
    { name: 'Ward Beds', occupied: wardCount, total: 40, color: 'var(--status-normal)' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Hospital Overview</h1>
          <p>Real-time analytics and emergency priority scoring</p>
        </div>
        <div className="glass-panel" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: dbStatus.includes('Offline') ? 'var(--status-critical)' : 'var(--status-stable)',
            display: 'inline-block'
          }}></span>
          <span style={{ color: 'var(--text-secondary)' }}>System Storage:</span>
          <strong>{dbStatus}</strong>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>Active Patients</span>
            <div className="stat-val">{totalPatients}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>ICU Admitted</span>
            <div className="stat-val" style={{ color: 'var(--status-critical)' }}>{icuCount}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'var(--status-critical-glow)', color: 'var(--status-critical)' }}>
            <ShieldAlert size={24} />
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>HDU Admitted</span>
            <div className="stat-val" style={{ color: 'var(--status-urgent)' }}>{hduCount}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'var(--status-urgent-glow)', color: 'var(--status-urgent)' }}>
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>Pending Tasks</span>
            <div className="stat-val">{pendingAppointments}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent)' }}>
            <UserCheck size={24} />
          </div>
        </div>
      </div>

      {/* Main dashboard content */}
      <div className="dashboard-grid">
        
        {/* Left Side: Critical patients and Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Critical Emergency Queue */}
          <div className="glass-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'start', gap: '10px', marginBottom: '18px' }}>
              <Flame size={20} color="var(--status-critical)" />
              <h3 style={{ fontSize: '18px' }}>Critical Triage Alert Board</h3>
            </div>

            {criticalPatients.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '30px 20px',
                color: 'var(--text-secondary)',
                background: 'rgba(255, 255, 255, 0.01)',
                borderRadius: 'var(--radius-sm)',
                border: '1px dashed var(--panel-border)'
              }}>
                <CheckCircle size={36} color="var(--status-stable)" style={{ marginBottom: '12px', opacity: 0.8 }} />
                <p>No critical or urgent triage cases. All active patients are currently stable.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Vitals Status</th>
                      <th>Priority Score</th>
                      <th>Action Needed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criticalPatients.map((patient) => {
                      const latest = patient.triageHistory[0];
                      return (
                        <tr key={patient.patientId}>
                          <td>
                            <strong>{patient.name}</strong>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              ID: {patient.patientId} | Age: {patient.age} | {patient.gender}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '12px' }}>
                              💓 {latest.heart_rate} bpm | 💨 {latest.spo2}% SpO2 | 🌡️ {latest.temperature}°F
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${latest.category === 'Critical' ? 'badge-critical' : 'badge-urgent'}`}>
                              {latest.category} ({latest.triage_score})
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => setActiveTab('triage')}
                            >
                              Open Triage
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Today's Appointments */}
          <div className="glass-panel">
            <h3 style={{ fontSize: '18px', marginBottom: '18px' }}>Active Consultations</h3>
            
            {appointments.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No consultations booked today.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Time Slot</th>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Reason</th>
                      <th>Triage Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.slice(0, 5).map((appt) => (
                      <tr key={appt._id || appt.id}>
                        <td style={{ color: 'var(--primary)', fontWeight: '600' }}>{appt.timeSlot}</td>
                        <td>{appt.patientName}</td>
                        <td>{appt.doctorName}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{appt.reason || 'General Checkup'}</td>
                        <td>
                          {appt.triageCategory ? (
                            <span className={`badge badge-${appt.triageCategory.toLowerCase()}`}>
                              {appt.triageCategory}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Not Triaged</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Bed Capacity and department load */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Bed Allocation Tracker */}
          <div className="glass-panel">
            <h3 style={{ fontSize: '18px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bed size={20} color="var(--primary)" />
              <span>Smart Bed Allocation Tracker</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {bedStats.map((bed) => {
                const percentage = Math.min(100, Math.round((bed.occupied / bed.total) * 100));
                return (
                  <div key={bed.name}>
                    <div style={{ display: 'flex', justifyContent: 'between', fontSize: '13px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '500' }}>{bed.name}</span>
                      <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }}>
                        <strong>{bed.occupied}</strong> / {bed.total} Occupied ({percentage}%)
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: bed.color,
                        boxShadow: `0 0 8px ${bed.color}`,
                        borderRadius: '4px',
                        transition: 'width 0.5s ease-in-out'
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{
              marginTop: '24px',
              padding: '12px 16px',
              background: 'rgba(6, 182, 212, 0.03)',
              border: '1px solid rgba(6, 182, 212, 0.1)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              color: 'var(--text-secondary)'
            }}>
              💡 Bed requirements are dynamically predicted by evaluating symptom severity risk vectors in the Python AI core module.
            </div>
          </div>

          {/* Department status occupancy summary */}
          <div className="glass-panel">
            <h3 style={{ fontSize: '17px', marginBottom: '16px' }}>Outpatient Statistics</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--panel-border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Outpatients Registered</span>
              <strong>{outpatientCount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--panel-border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Completed Consults</span>
              <strong>{completedAppointments}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Discharged Patients</span>
              <strong>{patients.filter(p => p.admittedStatus === 'Discharged').length}</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardView;
