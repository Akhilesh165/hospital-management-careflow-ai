// src/models/Appointment.js
const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  doctorName: { type: String, required: true },
  doctorId: { type: String }, // optional link to a Doctor User profile
  appointmentDate: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  reason: { type: String },
  status: { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Pending' },
  triageScore: { type: Number },
  triageCategory: { type: String },
  bedRecommendation: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
