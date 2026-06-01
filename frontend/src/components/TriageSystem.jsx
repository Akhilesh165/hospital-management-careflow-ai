// src/components/TriageSystem.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Activity, ShieldAlert, Heart, RefreshCw, Layers, Award } from 'lucide-react';

const TriageSystem = ({ patients, refreshData }) => {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  
  // Vitals State
  const [heartRate, setHeartRate] = useState(80);
  const [spo2, setSpo2] = useState(97);
  const [temperature, setTemperature] = useState(98.6);
  const [symptomSeverity, setSymptomSeverity] = useState(3);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const token = localStorage.getItem('careflow_token');
  const headers = { Authorization: `Bearer ${token}` };

  const handleRunTriage = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setError('Please select a patient to assess.');
      return;
    }
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const payload = {
        heart_rate: Number(heartRate),
        spo2: Number(spo2),
        temperature: Number(temperature),
        symptom_severity: Number(symptomSeverity)
      };

      const res = await axios.post(
        `http://127.0.0.1:5000/api/patients/${selectedPatientId}/triage`,
        payload,
        { headers }
      );

      setResult(res.data);
      refreshData();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'Could not evaluate triage. Verify the Python microservice is running on port 8001 and Node backend is running on port 5000.'
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedPatient = patients.find(p => p.patientId === selectedPatientId);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Smart Triage System</h1>
          <p>Mamdani Fuzzy Logic-assisted patient priority scoring and bed allocation</p>
        </div>
      </div>

      <div className="dashboard-grid">
        
        {/* Left Column: Form Controls */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '18px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--primary)" />
            <span>Enter Patient Vitals & Severity</span>
          </h3>

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

          <form onSubmit={handleRunTriage}>
            <div className="form-group">
              <label>Select Patient to Evaluate *</label>
              <select
                className="form-control"
                value={selectedPatientId}
                onChange={(e) => {
                  setSelectedPatientId(e.target.value);
                  setResult(null);
                  setError('');
                }}
                required
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p) => (
                  <option key={p.patientId} value={p.patientId}>
                    {p.name} ({p.patientId} - Age: {p.age} - Ward: {p.admittedStatus})
                  </option>
                ))}
              </select>
            </div>

            {selectedPatient && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '12px 16px',
                border: '1px solid var(--panel-border)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '20px',
                fontSize: '13px',
                color: 'var(--text-secondary)'
              }}>
                📌 <strong>Medical Summary:</strong> Age: {selectedPatient.age} | Sex: {selectedPatient.gender}
                {selectedPatient.comorbidities && selectedPatient.comorbidities.length > 0 && (
                  <div>Comorbidities: {selectedPatient.comorbidities.join(', ')}</div>
                )}
              </div>
            )}

            {/* Heart Rate Slider */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ margin: 0 }}>Heart Rate (BPM)</label>
                <span className="slider-val" style={{ color: heartRate > 100 || heartRate < 55 ? 'var(--status-urgent)' : 'var(--primary)' }}>
                  {heartRate} bpm
                </span>
              </div>
              <div className="slider-container">
                <input
                  type="range"
                  min="40"
                  max="180"
                  step="1"
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>40 (Bradycardia)</span>
                <span>75 (Normal)</span>
                <span>180 (Tachycardia)</span>
              </div>
            </div>

            {/* SpO2 Slider */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ margin: 0 }}>Oxygen Saturation (SpO2 %)</label>
                <span className="slider-val" style={{ color: spo2 < 90 ? 'var(--status-critical)' : spo2 < 94 ? 'var(--status-urgent)' : 'var(--status-stable)' }}>
                  {spo2} %
                </span>
              </div>
              <div className="slider-container">
                <input
                  type="range"
                  min="70"
                  max="100"
                  step="1"
                  value={spo2}
                  onChange={(e) => setSpo2(Number(e.target.value))}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>70 (Hypoxia)</span>
                <span>92 (Borderline)</span>
                <span>100 (Optimal)</span>
              </div>
            </div>

            {/* Temperature Slider */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ margin: 0 }}>Body Temperature (°F)</label>
                <span className="slider-val" style={{ color: temperature > 100.5 || temperature < 96 ? 'var(--status-urgent)' : 'var(--primary)' }}>
                  {temperature} °F
                </span>
              </div>
              <div className="slider-container">
                <input
                  type="range"
                  min="95"
                  max="108"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>95.0 (Hypothermia)</span>
                <span>98.6 (Normal)</span>
                <span>108.0 (Hyperpyrexia)</span>
              </div>
            </div>

            {/* Symptom Severity Slider */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ margin: 0 }}>Subjective Symptom Severity</label>
                <span className="slider-val" style={{ color: symptomSeverity >= 8 ? 'var(--status-critical)' : symptomSeverity >= 5 ? 'var(--status-urgent)' : 'var(--primary)' }}>
                  {symptomSeverity} / 10
                </span>
              </div>
              <div className="slider-container">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={symptomSeverity}
                  onChange={(e) => setSymptomSeverity(Number(e.target.value))}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>1 (Mild discomfort)</span>
                <span>5 (Moderate pain)</span>
                <span>10 (Severe distress)</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '10px', padding: '12px' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="brand-icon" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Computing Fuzzy Inference Engine...</span>
                </>
              ) : 'Run AI Assessment'}
            </button>
          </form>
        </div>

        {/* Right Column: Assessment Result Dashboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {result ? (
            <>
              {/* Primary Score Card */}
              <div className="glass-panel" style={{
                borderLeft: `6px solid ${
                  result.triage.category === 'Critical' ? 'var(--status-critical)' :
                  result.triage.category === 'Urgent' ? 'var(--status-urgent)' :
                  result.triage.category === 'Normal' ? 'var(--status-normal)' : 'var(--status-stable)'
                }`,
                background: 'rgba(255, 255, 255, 0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Assessment Result</span>
                    <h2 style={{ fontSize: '24px', marginTop: '2px' }}>CareFlow Recommendation</h2>
                  </div>
                  <span className={`badge badge-${result.triage.category.toLowerCase()}`} style={{ padding: '6px 12px', fontSize: '13px' }}>
                    {result.triage.category} Status
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                  {/* Gauge visualization (using CSS/SVG) */}
                  <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="100" height="100" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="8" fill="transparent" />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="42" 
                        stroke={
                          result.triage.category === 'Critical' ? 'var(--status-critical)' :
                          result.triage.category === 'Urgent' ? 'var(--status-urgent)' :
                          result.triage.category === 'Normal' ? 'var(--status-normal)' : 'var(--status-stable)'
                        } 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray="264"
                        strokeDashoffset={264 - (264 * result.triage.score) / 100}
                        strokeLinecap="round"
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s ease' }}
                      />
                    </svg>
                    <div style={{ position: 'absolute', textAlign: 'center' }}>
                      <div style={{ fontSize: '22px', fontWeight: '800' }}>{result.triage.score}</div>
                      <div style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Score</div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Clinical Advice:</div>
                    <div style={{ fontSize: '15px', fontWeight: '600', marginTop: '2px', color: '#fff' }}>
                      {result.triage.recommendation}
                    </div>
                  </div>
                </div>

                {/* Bed Recommendation */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--panel-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  marginTop: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldAlert size={14} color="var(--primary)" />
                      <strong>Bed Allocation recommendation:</strong>
                    </span>
                    <strong style={{ color: 'var(--primary)', fontSize: '14px' }}>
                      {result.bed_recommendation.recommended_bed}
                    </strong>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <strong>Risk Index:</strong> {result.bed_recommendation.risk_index}% | <strong>Urgency:</strong> {result.bed_recommendation.urgency_level}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '6px' }}>
                    {result.bed_recommendation.rationale}
                  </p>
                </div>
              </div>

              {/* Explainable AI Membership Degrees Card */}
              <div className="glass-panel">
                <h3 style={{ fontSize: '17px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} color="var(--primary)" />
                  <span>Explainable AI — Fuzzy Rule Membership</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Oxygen Fuzzification */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '500' }}>Oxygen Level (SpO2) Membership</span>
                      <span style={{ color: 'var(--text-muted)' }}>Input Value: {spo2}%</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {Object.entries(result.triage.membership_degrees.inputs.spo2).map(([key, val]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                          <span style={{ minWidth: '70px', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{key}:</span>
                          <div style={{ flexGrow: 1, height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${val * 100}%`, height: '100%', background: 'var(--primary)' }}></div>
                          </div>
                          <span style={{ minWidth: '24px', textAlign: 'right', fontWeight: '600' }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Heart Rate Fuzzification */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '500' }}>Heart Rate Membership</span>
                      <span style={{ color: 'var(--text-muted)' }}>Input Value: {heartRate} bpm</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {Object.entries(result.triage.membership_degrees.inputs.heart_rate).map(([key, val]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                          <span style={{ minWidth: '70px', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{key}:</span>
                          <div style={{ flexGrow: 1, height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${val * 100}%`, height: '100%', background: 'var(--accent)' }}></div>
                          </div>
                          <span style={{ minWidth: '24px', textAlign: 'right', fontWeight: '600' }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Output Priority Aggregation */}
                  <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--primary)' }}>Fired Output Priority Rules</span>
                      <span style={{ color: 'var(--text-muted)' }}>Rule Consequents</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {Object.entries(result.triage.membership_degrees.outputs).map(([key, val]) => (
                        <div key={key} style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--panel-border)', padding: '8px', borderRadius: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', textTransform: 'capitalize', marginBottom: '4px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{key} set:</span>
                            <strong>{val}</strong>
                          </div>
                          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ 
                              width: `${val * 100}%`, 
                              height: '100%', 
                              background: key === 'critical' ? 'var(--status-critical)' : 
                                         key === 'urgent' ? 'var(--status-urgent)' :
                                         key === 'normal' ? 'var(--status-normal)' : 'var(--status-stable)'
                            }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </>
          ) : (
            <div className="glass-panel" style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <Award size={48} color="var(--panel-border)" style={{ marginBottom: '16px' }} />
              <h3>Awaiting Clinical Input</h3>
              <p style={{ fontSize: '14px', marginTop: '6px' }}>
                Select an active patient on the left and submit vitals to run the fuzzy assessment engine.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TriageSystem;
