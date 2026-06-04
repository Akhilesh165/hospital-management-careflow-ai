// src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize global variables
global.useMemoryDb = false;
global.memoryDb = {
  users: [],
  patients: [],
  appointments: []
};

// Database Connection
connectDB().then(() => {
  seedDefaultData();
});

// Import Routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: global.useMemoryDb ? 'in-memory' : 'mongodb',
    uptime: process.uptime()
  });
});

// Default Root Route
app.get('/', (req, res) => {
  res.send('CareFlow AI Backend API is running.');
});

// Seeding Default Data (to ensure instant interactive demo)
async function seedDefaultData() {
  try {
    const User = require('./models/User');
    const Patient = require('./models/Patient');
    const Appointment = require('./models/Appointment');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const doctorPassword = await bcrypt.hash('doctor123', 10);
    const recepPassword = await bcrypt.hash('reception123', 10);

    const defaultUsers = [
      { username: 'admin', password: hashedPassword, role: 'admin', name: 'System Administrator' },
      { username: 'doctor', password: doctorPassword, role: 'doctor', name: 'Dr. Sarah Connor', specialization: 'Cardiology' },
      { username: 'reception', password: recepPassword, role: 'receptionist', name: 'John Doe' }
    ];

    const samplePatients = [
      {
        patientId: 'PAT-8802',
        name: 'Robert Downey',
        age: 55,
        gender: 'Male',
        phone: '9876543210',
        email: 'robert@tony.com',
        bloodGroup: 'O+',
        address: 'Malibu Cliffside Drive',
        comorbidities: ['Diabetes', 'Hypertension'],
        allergies: ['Penicillin'],
        emergencyContact: { name: 'Pepper Potts', relation: 'Spouse', phone: '9876543211' },
        admittedStatus: 'ICU',
        triageHistory: [
          {
            date: new Date(),
            heart_rate: 115,
            spo2: 89,
            temperature: 101.5,
            symptom_severity: 8,
            triage_score: 87.2,
            category: 'Critical',
            recommendation: 'Immediate ICU/Emergency admission needed. Call Code Red.'
          }
        ]
      },
      {
        patientId: 'PAT-4301',
        name: 'Scarlett Johansson',
        age: 34,
        gender: 'Female',
        phone: '8765432109',
        email: 'scarlett@widow.com',
        bloodGroup: 'AB-',
        address: 'Red Room facility',
        comorbidities: ['Asthma'],
        allergies: [],
        emergencyContact: { name: 'Clinton Barton', relation: 'Friend', phone: '8765432110' },
        admittedStatus: 'HDU',
        triageHistory: [
          {
            date: new Date(),
            heart_rate: 98,
            spo2: 92,
            temperature: 99.8,
            symptom_severity: 5,
            triage_score: 56.4,
            category: 'Urgent',
            recommendation: 'Urgent Care Unit. Fast-track doctor examination within 15 minutes.'
          }
        ]
      },
      {
        patientId: 'PAT-1920',
        name: 'Chris Evans',
        age: 42,
        gender: 'Male',
        phone: '7654321098',
        email: 'cap@america.com',
        bloodGroup: 'A+',
        address: 'Brooklyn Plaza',
        comorbidities: [],
        allergies: [],
        emergencyContact: { name: 'Bucky Barnes', relation: 'Brother', phone: '7654321099' },
        admittedStatus: 'Outpatient',
        triageHistory: [
          {
            date: new Date(),
            heart_rate: 68,
            spo2: 99,
            temperature: 98.4,
            symptom_severity: 2,
            triage_score: 12.5,
            category: 'Stable',
            recommendation: 'Outpatient support or home recovery. Routine consultation.'
          }
        ]
      }
    ];

    if (global.useMemoryDb) {
      // Seed memory database
      global.memoryDb.users = defaultUsers.map((u, i) => ({ _id: `u_${i}`, ...u, status: 'active' }));
      global.memoryDb.patients = samplePatients.map((p, i) => ({ _id: `p_${i}`, ...p, createdAt: new Date(), updatedAt: new Date() }));
      
      global.memoryDb.appointments = [
        {
          _id: 'appt_1',
          patientId: 'PAT-8802',
          patientName: 'Robert Downey',
          doctorName: 'Dr. Sarah Connor',
          appointmentDate: new Date(),
          timeSlot: '10:00 AM - 10:30 AM',
          reason: 'Difficulty breathing and chest tightness',
          status: 'Pending',
          triageScore: 87.2,
          triageCategory: 'Critical'
        },
        {
          _id: 'appt_2',
          patientId: 'PAT-4301',
          patientName: 'Scarlett Johansson',
          doctorName: 'Dr. Sarah Connor',
          appointmentDate: new Date(),
          timeSlot: '11:00 AM - 11:30 AM',
          reason: 'Severe asthmatic trigger and mild fever',
          status: 'Pending',
          triageScore: 56.4,
          triageCategory: 'Urgent'
        }
      ];
      console.log('✅ Seeded default users, patients, and appointments in memory.');
    } else {
      // Seed MongoDB
      for (const u of defaultUsers) {
        await User.findOneAndUpdate({ username: u.username }, u, { upsert: true, new: true });
      }
      for (const p of samplePatients) {
        await Patient.findOneAndUpdate({ patientId: p.patientId }, p, { upsert: true, new: true });
      }

      const apptCount = await Appointment.countDocuments();
      if (apptCount === 0) {
        await Appointment.create([
          {
            patientId: 'PAT-8802',
            patientName: 'Robert Downey',
            doctorName: 'Dr. Sarah Connor',
            appointmentDate: new Date(),
            timeSlot: '10:00 AM - 10:30 AM',
            reason: 'Difficulty breathing and chest tightness',
            status: 'Pending',
            triageScore: 87.2,
            triageCategory: 'Critical'
          },
          {
            patientId: 'PAT-4301',
            patientName: 'Scarlett Johansson',
            doctorName: 'Dr. Sarah Connor',
            appointmentDate: new Date(),
            timeSlot: '11:00 AM - 11:30 AM',
            reason: 'Severe asthmatic trigger and mild fever',
            status: 'Pending',
            triageScore: 56.4,
            triageCategory: 'Urgent'
          }
        ]);
      }
      console.log('✅ Seeded default users, patients, and appointments in MongoDB.');
    }
  } catch (err) {
    console.error('❌ Failed to seed default data:', err.message);
  }
}

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 CareFlow Node.js Server listening on port ${PORT}...`);
});
