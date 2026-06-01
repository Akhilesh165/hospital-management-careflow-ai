// src/routes/appointments.js
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { auth } = require('../middleware/auth');

// Get all appointments
router.get('/', auth, async (req, res) => {
  try {
    if (global.useMemoryDb) {
      return res.json(global.memoryDb.appointments);
    } else {
      const appointments = await Appointment.find().sort({ appointmentDate: 1 });
      return res.json(appointments);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Book an appointment
router.post('/', auth, async (req, res) => {
  try {
    const { patientId, doctorName, appointmentDate, timeSlot, reason } = req.body;

    if (!patientId || !doctorName || !appointmentDate || !timeSlot) {
      return res.status(400).json({ message: 'Required fields: patientId, doctorName, appointmentDate, timeSlot' });
    }

    // Resolve patient details
    let patient;
    if (global.useMemoryDb) {
      patient = global.memoryDb.patients.find(p => p.patientId === patientId);
    } else {
      patient = await Patient.findOne({ patientId });
    }

    if (!patient) {
      return res.status(404).json({ message: `Patient with ID ${patientId} not found` });
    }

    // Cache latest triage information if available
    const latestTriage = patient.triageHistory && patient.triageHistory.length > 0 ? patient.triageHistory[0] : null;

    const newApptData = {
      patientId,
      patientName: patient.name,
      doctorName,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      reason,
      status: 'Pending',
      triageScore: latestTriage ? latestTriage.triage_score : undefined,
      triageCategory: latestTriage ? latestTriage.category : undefined
    };

    if (global.useMemoryDb) {
      const newAppt = {
        _id: 'appt_' + Date.now(),
        ...newApptData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      global.memoryDb.appointments.push(newAppt);
      return res.status(201).json(newAppt);
    } else {
      const newAppt = new Appointment(newApptData);
      await newAppt.save();
      return res.status(201).json(newAppt);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update appointment status
router.put('/:id', auth, async (req, res) => {
  try {
    const apptId = req.params.id;
    const { status } = req.body;

    if (!status || !['Pending', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (global.useMemoryDb) {
      const idx = global.memoryDb.appointments.findIndex(a => a._id === apptId || a.id === apptId);
      if (idx === -1) return res.status(404).json({ message: 'Appointment not found' });
      
      global.memoryDb.appointments[idx].status = status;
      global.memoryDb.appointments[idx].updatedAt = new Date();
      return res.json(global.memoryDb.appointments[idx]);
    } else {
      const appt = await Appointment.findByIdAndUpdate(apptId, { $set: { status } }, { new: true });
      if (!appt) return res.status(404).json({ message: 'Appointment not found' });
      return res.json(appt);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel / Delete appointment
router.delete('/:id', auth, async (req, res) => {
  try {
    const apptId = req.params.id;
    if (global.useMemoryDb) {
      const idx = global.memoryDb.appointments.findIndex(a => a._id === apptId || a.id === apptId);
      if (idx === -1) return res.status(404).json({ message: 'Appointment not found' });
      global.memoryDb.appointments.splice(idx, 1);
      return res.json({ message: 'Appointment cancelled and removed' });
    } else {
      const appt = await Appointment.findByIdAndDelete(apptId);
      if (!appt) return res.status(404).json({ message: 'Appointment not found' });
      return res.json({ message: 'Appointment cancelled and removed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
