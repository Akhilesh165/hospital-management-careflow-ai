// src/components/AppointmentBooker.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Calendar, Plus, User, Clock, Check, X as CancelIcon, Trash2 } from 'lucide-react';
import { NODE_API } from '../config/api';

const AppointmentBooker = ({ appointments, patients, refreshData }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [doctorName, setDoctorName] = useState('Dr. Sarah Connor');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 09:30 AM');
  const [reason, setReason] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('careflow_token');
  const headers = { Authorization: `Bearer ${token}` };

  const timeSlots = [
    '09:00 AM - 09:30 AM',
    '09:30 AM - 10:00 AM',
    '10:00 AM - 10:30 AM',
    '10:30 AM - 11:00 AM',
    '11:00 AM - 11:30 AM',
    '11:30 AM - 12:00 PM',
    '02:00 PM - 02:30 PM',
    '02:30 PM - 03:00 PM',
    '03:00 PM - 03:30 PM',
    '03:30 PM - 04:00 PM',
  ];

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!patientId) {
      setError('Please select a patient.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        patientId,
        doctorName,
        appointmentDate,
        timeSlot,
        reason
      };

      await axios.post(`${NODE_API}/api/appointments`, payload, { headers });
      setIsAddModalOpen(false);
      refreshData();
      
      // Reset form
      setPatientId('');
      setReason('');
      setAppointmentDate('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (apptId, status) => {
    try {
      await axios.put(`${NODE_API}/api/appointments/${apptId}`, { status }, { headers });
      refreshData();
    } catch (err) {
      console.error(err);
      alert('Failed to update appointment status.');
    }
  };

  const handleDeleteAppointment = async (apptId) => {
    if (!window.confirm('Remove this appointment record?')) return;
    try {
      await axios.delete(`${NODE_API}/api/appointments/${apptId}`, { headers });
      refreshData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete appointment.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Appointment Scheduler</h1>
          <p>Book and manage doctor consultations</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} />
          <span>Book Appointment</span>
        </button>
      </div>

      <div className="glass-panel">
        <h3 style={{ fontSize: '18px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={20} color="var(--primary)" />
          <span>Roster & Appointment Queue</span>
        </h3>

        {appointments.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px 0' }}>
            No appointments scheduled. Click "Book Appointment" to schedule.
          </p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Patient</th>
                  <th>Assigned Practitioner</th>
                  <th>Triage level</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => {
                  const dateStr = new Date(appt.appointmentDate).toLocaleDateString();
                  return (
                    <tr key={appt._id || appt.id}>
                      <td><strong>{dateStr}</strong></td>
                      <td style={{ color: 'var(--primary)', fontWeight: '600' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={13} />
                          <span>{appt.timeSlot}</span>
                        </div>
                      </td>
                      <td>
                        <strong>{appt.patientName}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ID: {appt.patientId}</div>
                      </td>
                      <td>{appt.doctorName}</td>
                      <td>
                        {appt.triageCategory ? (
                          <span className={`badge badge-${appt.triageCategory.toLowerCase()}`}>
                            {appt.triageCategory}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Not Triaged</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {appt.reason || 'General Followup'}
                      </td>
                      <td>
                        <span style={{
                          color: appt.status === 'Completed' ? 'var(--status-stable)' :
                                 appt.status === 'Cancelled' ? 'var(--status-critical)' : 'var(--status-urgent)',
                          fontWeight: '600',
                          fontSize: '13px'
                        }}>
                          {appt.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {appt.status === 'Pending' && (
                            <>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '6px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-stable)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                                onClick={() => handleUpdateStatus(appt._id || appt.id, 'Completed')}
                                title="Complete consultation"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '6px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-critical)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                                onClick={() => handleUpdateStatus(appt._id || appt.id, 'Cancelled')}
                                title="Cancel appointment"
                              >
                                <CancelIcon size={14} />
                              </button>
                            </>
                          )}
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px', color: 'var(--text-muted)' }}
                            onClick={() => handleDeleteAppointment(appt._id || appt.id)}
                            title="Remove record"
                          >
                            <Trash2 size={14} />
                          </button>
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

      {/* Book Appointment Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Schedule Consultation Session</h2>
              <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setIsAddModalOpen(false)}>
                <CancelIcon size={24} />
              </button>
            </div>

            {error && <div style={{ color: 'var(--status-critical)', marginBottom: '12px' }}>{error}</div>}

            <form onSubmit={handleBookAppointment}>
              <div className="form-group">
                <label>Select Registered Patient *</label>
                <select
                  className="form-control"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.patientId} value={p.patientId}>
                      {p.name} ({p.patientId} - {p.admittedStatus})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Assigned Doctor *</label>
                <select
                  className="form-control"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                >
                  <option value="Dr. Sarah Connor">Dr. Sarah Connor (Cardiology)</option>
                  <option value="Dr. Stephen Strange">Dr. Stephen Strange (Neurology)</option>
                  <option value="Dr. Bruce Banner">Dr. Bruce Banner (Radiology)</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Appointment Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Preferred Time Slot *</label>
                  <select
                    className="form-control"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Reason / Chief Complaint</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="e.g. Follow-up post ECG scan or severe asthma symptoms"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Booking...' : 'Confirm Appointment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentBooker;
