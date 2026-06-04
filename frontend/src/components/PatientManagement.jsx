// src/components/PatientManagement.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { NODE_API } from '../config/api';
import { Search, UserPlus, Heart, Phone, Mail, MapPin, Activity, X, Trash2 } from 'lucide-react';

const PatientManagement = ({ patients, refreshData, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [address, setAddress] = useState('');
  const [comorbidities, setComorbidities] = useState('');
  const [allergies, setAllergies] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('careflow_token');
  const headers = { Authorization: `Bearer ${token}` };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        name,
        age: Number(age),
        gender,
        phone,
        email,
        bloodGroup,
        address,
        comorbidities,
        allergies,
        emergencyContact: {
          name: emergencyName,
          relation: emergencyRelation,
          phone: emergencyPhone
        }
      };

      await axios.post(`${NODE_API}/api/patients`, payload, { headers });
      setIsAddModalOpen(false);
      refreshData();
      
      // Reset form
      setName('');
      setAge('');
      setGender('Male');
      setPhone('');
      setEmail('');
      setAddress('');
      setComorbidities('');
      setAllergies('');
      setEmergencyName('');
      setEmergencyRelation('');
      setEmergencyPhone('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create patient');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (!window.confirm(`Are you sure you want to remove patient record ${patientId}?`)) return;
    
    try {
      await axios.delete(`${NODE_API}/api/patients/${patientId}`, { headers });
      refreshData();
      if (selectedPatient && selectedPatient.patientId === patientId) {
        setSelectedPatient(null);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete patient');
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Patient Directory</h1>
          <p>Register and coordinate patient profiles</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <UserPlus size={18} />
          <span>Register Patient</span>
        </button>
      </div>

      {/* Search and filter toolbar */}
      <div className="glass-panel" style={{ marginBottom: '24px', padding: '16px', display: 'flex', gap: '16px' }}>
        <div style={{ position: 'relative', flexGrow: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '38px' }}
            placeholder="Search patients by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Patient Directory Table */}
      <div className="glass-panel">
        {filteredPatients.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0' }}>No patients found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Age / Sex</th>
                  <th>Comorbidities</th>
                  <th>Triage Status</th>
                  <th>Assigned Ward</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p) => {
                  const latestTriage = p.triageHistory && p.triageHistory.length > 0 ? p.triageHistory[0] : null;
                  return (
                    <tr key={p.patientId}>
                      <td style={{ color: 'var(--primary)', fontWeight: '700' }}>{p.patientId}</td>
                      <td>
                        <strong>{p.name}</strong>
                        {p.phone && <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>📞 {p.phone}</div>}
                      </td>
                      <td>{p.age} yrs / {p.gender}</td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '200px' }}>
                          {p.comorbidities && p.comorbidities.length > 0 ? (
                            p.comorbidities.map((c, i) => (
                              <span key={i} style={{ background: 'rgba(255,255,255,0.05)', fontSize: '10px', padding: '2px 6px', borderRadius: '3px', color: 'var(--text-secondary)' }}>
                                {c}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>None</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {latestTriage ? (
                          <span className={`badge badge-${latestTriage.category.toLowerCase()}`}>
                            {latestTriage.category} ({latestTriage.triage_score})
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No Vitals Taken</span>
                        )}
                      </td>
                      <td>
                        <span style={{
                          color: p.admittedStatus === 'ICU' ? 'var(--status-critical)' :
                                 p.admittedStatus === 'HDU' ? 'var(--status-urgent)' :
                                 p.admittedStatus === 'General Ward' ? 'var(--status-normal)' : 'var(--text-secondary)',
                          fontWeight: p.admittedStatus !== 'Outpatient' ? '600' : 'normal'
                        }}>
                          {p.admittedStatus}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => setSelectedPatient(p)}
                          >
                            Profile
                          </button>
                          {user && user.role === 'admin' && (
                            <button
                              className="btn btn-danger"
                              style={{ padding: '6px 8px' }}
                              onClick={() => handleDeletePatient(p.patientId)}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="modal-overlay" onClick={() => setSelectedPatient(null)}>
          <div className="modal-content glass-panel" style={{ width: '100%', maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Heart color="var(--primary)" size={24} />
                <h2>Patient Medical Record</h2>
              </div>
              <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setSelectedPatient(null)}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '16px', color: 'var(--primary)', marginBottom: '10px' }}>Demographics</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                  <div><strong>ID:</strong> <span style={{ color: 'var(--primary)' }}>{selectedPatient.patientId}</span></div>
                  <div><strong>Full Name:</strong> {selectedPatient.name}</div>
                  <div><strong>Age / Gender:</strong> {selectedPatient.age} years / {selectedPatient.gender}</div>
                  <div><strong>Blood Group:</strong> {selectedPatient.bloodGroup || 'Not Specified'}</div>
                  {selectedPatient.email && <div><Mail size={12} /> {selectedPatient.email}</div>}
                  <div><Phone size={12} /> {selectedPatient.phone}</div>
                  {selectedPatient.address && <div><MapPin size={12} /> {selectedPatient.address}</div>}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', color: 'var(--primary)', marginBottom: '10px' }}>Clinical Profile</h3>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Chronic Illnesses:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {selectedPatient.comorbidities && selectedPatient.comorbidities.length > 0 ? (
                      selectedPatient.comorbidities.map((c, i) => (
                        <span key={i} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--panel-border)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>{c}</span>
                      ))
                    ) : 'No chronic conditions reported.'}
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <strong>Known Allergies:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                      selectedPatient.allergies.map((a, i) => (
                        <span key={i} style={{ background: 'var(--status-critical-glow)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--status-critical)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>{a}</span>
                      ))
                    ) : 'No allergies reported.'}
                  </div>
                </div>

                {selectedPatient.emergencyContact && (
                  <div>
                    <strong>Emergency Contact:</strong>
                    <div style={{ fontSize: '13px', background: 'rgba(255,255,255,0.02)', padding: '8px', border: '1px solid var(--panel-border)', borderRadius: '4px', marginTop: '6px' }}>
                      {selectedPatient.emergencyContact.name} ({selectedPatient.emergencyContact.relation})
                      <div>📞 {selectedPatient.emergencyContact.phone}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Historical Vitals Logs */}
            <div>
              <h3 style={{ fontSize: '16px', color: 'var(--primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={18} />
                <span>Historical Vitals & Triage Computations</span>
              </h3>
              
              {(!selectedPatient.triageHistory || selectedPatient.triageHistory.length === 0) ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontStyle: 'italic' }}>
                  No vital assessments completed yet. Please use the Smart Triage calculator.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto', paddingRight: '6px' }}>
                  {selectedPatient.triageHistory.map((t, index) => (
                    <div key={index} className="glass-panel" style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderLeft: `4px solid ${
                      t.category === 'Critical' ? 'var(--status-critical)' :
                      t.category === 'Urgent' ? 'var(--status-urgent)' :
                      t.category === 'Normal' ? 'var(--status-normal)' : 'var(--status-stable)'
                    }` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          🗓️ {new Date(t.date).toLocaleString()}
                        </span>
                        <span className={`badge badge-${t.category.toLowerCase()}`} style={{ fontSize: '10px' }}>
                          {t.category} ({t.triage_score})
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '8px' }}>
                        <div>💓 HR: <strong>{t.heart_rate} bpm</strong></div>
                        <div>💨 SpO2: <strong>{t.spo2}%</strong></div>
                        <div>🌡️ Temp: <strong>{t.temperature}°F</strong></div>
                        <div>⚠️ Severity: <strong>{t.symptom_severity}/10</strong></div>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', borderTop: '1px solid var(--panel-border)', paddingTop: '6px' }}>
                        <strong>Clinical Instruction:</strong> {t.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>New Patient Enrollment</h2>
              <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setIsAddModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            {error && <div style={{ color: 'var(--status-critical)', marginBottom: '12px' }}>{error}</div>}

            <form onSubmit={handleAddPatient}>
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" className="form-control" placeholder="e.g. John Watson" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Age (years) *</label>
                  <input type="number" className="form-control" placeholder="e.g. 45" value={age} onChange={(e) => setAge(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Gender *</label>
                  <select className="form-control" value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input type="text" className="form-control" placeholder="10-digit number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Blood Group</label>
                  <select className="form-control" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input type="email" className="form-control" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Residential Address</label>
                <input type="text" className="form-control" placeholder="Street, City" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Chronic Illnesses (comma separated)</label>
                <input type="text" className="form-control" placeholder="e.g. Diabetes, Asthma" value={comorbidities} onChange={(e) => setComorbidities(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Drug/Medical Allergies (comma separated)</label>
                <input type="text" className="form-control" placeholder="e.g. Penicillin, Sulfa" value={allergies} onChange={(e) => setAllergies(e.target.value)} />
              </div>

              <h3 style={{ fontSize: '15px', color: 'var(--primary)', margin: '15px 0 10px 0' }}>Emergency Contact</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Name</label>
                  <input type="text" className="form-control" placeholder="Pepper Potts" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Relation</label>
                  <input type="text" className="form-control" placeholder="Spouse / Friend" value={emergencyRelation} onChange={(e) => setEmergencyRelation(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Emergency Phone</label>
                <input type="text" className="form-control" placeholder="Emergency phone" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Add Patient'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;
