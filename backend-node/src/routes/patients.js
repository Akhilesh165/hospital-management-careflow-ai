// src/routes/patients.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const Patient = require('../models/Patient');
const { auth, authorize } = require('../middleware/auth');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8001';

// Get all patients
router.get('/', auth, async (req, res) => {
  try {
    if (global.useMemoryDb) {
      return res.json(global.memoryDb.patients);
    } else {
      const patients = await Patient.find().sort({ updatedAt: -1 });
      return res.json(patients);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single patient by patientId
router.get('/:id', auth, async (req, res) => {
  try {
    const patientId = req.params.id;
    if (global.useMemoryDb) {
      const patient = global.memoryDb.patients.find(p => p.patientId === patientId);
      if (!patient) return res.status(404).json({ message: 'Patient not found' });
      return res.json(patient);
    } else {
      const patient = await Patient.findOne({ patientId });
      if (!patient) return res.status(404).json({ message: 'Patient not found' });
      return res.json(patient);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create patient
router.post('/', auth, async (req, res) => {
  try {
    const { name, age, gender, phone, email, bloodGroup, address, comorbidities, allergies, emergencyContact } = req.body;
    
    if (!name || !age || !gender || !phone) {
      return res.status(400).json({ message: 'Required fields: name, age, gender, phone' });
    }

    const patientId = 'PAT-' + Math.floor(1000 + Math.random() * 9000);

    const comorbiditiesArr = Array.isArray(comorbidities) ? comorbidities : (comorbidities ? comorbidities.split(',').map(s => s.trim()) : []);
    const allergiesArr = Array.isArray(allergies) ? allergies : (allergies ? allergies.split(',').map(s => s.trim()) : []);

    const newPatientData = {
      patientId,
      name,
      age: Number(age),
      gender,
      phone,
      email,
      bloodGroup,
      address,
      comorbidities: comorbiditiesArr,
      allergies: allergiesArr,
      emergencyContact: emergencyContact || { name: '', relation: '', phone: '' },
      triageHistory: [],
      admittedStatus: 'Outpatient'
    };

    if (global.useMemoryDb) {
      const newPatient = {
        _id: 'pat_' + Date.now(),
        ...newPatientData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      global.memoryDb.patients.push(newPatient);
      return res.status(201).json(newPatient);
    } else {
      const newPatient = new Patient(newPatientData);
      await newPatient.save();
      return res.status(201).json(newPatient);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update patient
router.put('/:id', auth, async (req, res) => {
  try {
    const patientId = req.params.id;
    const updateFields = req.body;

    if (updateFields.comorbidities && typeof updateFields.comorbidities === 'string') {
      updateFields.comorbidities = updateFields.comorbidities.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (updateFields.allergies && typeof updateFields.allergies === 'string') {
      updateFields.allergies = updateFields.allergies.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (global.useMemoryDb) {
      const idx = global.memoryDb.patients.findIndex(p => p.patientId === patientId);
      if (idx === -1) return res.status(404).json({ message: 'Patient not found' });
      
      const updated = {
        ...global.memoryDb.patients[idx],
        ...updateFields,
        updatedAt: new Date()
      };
      global.memoryDb.patients[idx] = updated;
      return res.json(updated);
    } else {
      const patient = await Patient.findOneAndUpdate({ patientId }, { $set: updateFields }, { new: true });
      if (!patient) return res.status(404).json({ message: 'Patient not found' });
      return res.json(patient);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete patient
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const patientId = req.params.id;
    if (global.useMemoryDb) {
      const idx = global.memoryDb.patients.findIndex(p => p.patientId === patientId);
      if (idx === -1) return res.status(404).json({ message: 'Patient not found' });
      global.memoryDb.patients.splice(idx, 1);
      
      // Also clean up appointments
      global.memoryDb.appointments = global.memoryDb.appointments.filter(a => a.patientId !== patientId);
      
      return res.json({ message: 'Patient deleted successfully' });
    } else {
      const patient = await Patient.findOneAndDelete({ patientId });
      if (!patient) return res.status(404).json({ message: 'Patient not found' });
      
      // Delete their appointments too
      const Appointment = require('../models/Appointment');
      await Appointment.deleteMany({ patientId });

      return res.json({ message: 'Patient deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Smart Triage: Evaluate Patient Vitals with Python service, save to history, and decide ICU/Bed recommendation
router.post('/:id/triage', auth, async (req, res) => {
  try {
    const patientId = req.params.id;
    const { heart_rate, spo2, temperature, symptom_severity } = req.body;

    if (!heart_rate || !spo2 || !temperature || !symptom_severity) {
      return res.status(400).json({ message: 'Required fields: heart_rate, spo2, temperature, symptom_severity' });
    }

    let patient;
    if (global.useMemoryDb) {
      patient = global.memoryDb.patients.find(p => p.patientId === patientId);
    } else {
      patient = await Patient.findOne({ patientId });
    }

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Call Python FastAPI service for Mamdani Fuzzy Triage Score
    console.log(`Calling Python triage engine at ${PYTHON_SERVICE_URL}/api/triage...`);
    const triageResponse = await axios.post(`${PYTHON_SERVICE_URL}/api/triage`, {
      heart_rate: Number(heart_rate),
      spo2: Number(spo2),
      temperature: Number(temperature),
      symptom_severity: Number(symptom_severity)
    });

    const triageData = triageResponse.data;

    // Call Python FastAPI for bed recommendation based on vitals, age, and comorbidities
    console.log(`Calling Python bed recommendation at ${PYTHON_SERVICE_URL}/api/bed-recommendation...`);
    const bedResponse = await axios.post(`${PYTHON_SERVICE_URL}/api/bed-recommendation`, {
      triage_score: triageData.score,
      age: patient.age,
      comorbidities_count: patient.comorbidities ? patient.comorbidities.length : 0,
      spo2: Number(spo2),
      heart_rate: Number(heart_rate)
    });

    const bedData = bedResponse.data;

    // Update patient record
    const newTriageEntry = {
      _id: 'tri_' + Date.now(),
      date: new Date(),
      heart_rate: Number(heart_rate),
      spo2: Number(spo2),
      temperature: Number(temperature),
      symptom_severity: Number(symptom_severity),
      triage_score: triageData.score,
      category: triageData.category,
      recommendation: triageData.recommendation
    };

    let updatedAdmittedStatus = 'Outpatient';
    if (bedData.recommended_bed.includes('ICU')) updatedAdmittedStatus = 'ICU';
    else if (bedData.recommended_bed.includes('HDU')) updatedAdmittedStatus = 'HDU';
    else if (bedData.recommended_bed.includes('General Ward')) updatedAdmittedStatus = 'General Ward';

    if (global.useMemoryDb) {
      patient.triageHistory.unshift(newTriageEntry);
      patient.admittedStatus = updatedAdmittedStatus;
      patient.updatedAt = new Date();
    } else {
      await Patient.findOneAndUpdate(
        { patientId },
        { 
          $push: { triageHistory: { $each: [newTriageEntry], $position: 0 } },
          $set: { admittedStatus: updatedAdmittedStatus }
        }
      );
      // Fetch updated patient record for response
      patient = await Patient.findOne({ patientId });
    }

    res.json({
      triage: triageData,
      bed_recommendation: bedData,
      patient
    });

  } catch (error) {
    console.error('Triage/Bed service connection error:', error.message);
    res.status(500).json({ 
      message: 'Failed to communicate with AI microservice. Ensure Python backend is running on port 8001.', 
      error: error.message 
    });
  }
});

module.exports = router;
