// src/models/Patient.js
const mongoose = require('mongoose');

const TriageLogSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  heart_rate: { type: Number, required: true },
  spo2: { type: Number, required: true },
  temperature: { type: Number, required: true },
  symptom_severity: { type: Number, required: true },
  triage_score: { type: Number, required: true },
  category: { type: String, required: true },
  recommendation: { type: String, required: true }
});

const PatientSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  phone: { type: String, required: true },
  email: { type: String },
  bloodGroup: { type: String },
  address: { type: String },
  comorbidities: [{ type: String }],
  allergies: [{ type: String }],
  emergencyContact: {
    name: { type: String },
    relation: { type: String },
    phone: { type: String }
  },
  triageHistory: [TriageLogSchema],
  admittedStatus: { type: String, enum: ['Outpatient', 'General Ward', 'HDU', 'ICU', 'Discharged'], default: 'Outpatient' }
}, { timestamps: true });

module.exports = mongoose.model('Patient', PatientSchema);
