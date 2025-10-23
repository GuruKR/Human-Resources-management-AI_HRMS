const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/* ==========================================================
   🧩 EXISTING ROUTES (kept as-is)
========================================================== */

// GET all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch {
    res.status(500).json({ msg: 'Failed to load employees' });
  }
});

// POST new employee
router.post('/', async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.json(employee);
  } catch {
    res.status(500).json({ msg: 'Failed to add employee' });
  }
});

/* ==========================================================
   🧩 NEW ROUTES (added safely below existing ones)
========================================================== */

/* ---------------------------------------------
   📁 Multer Setup for Document Upload
--------------------------------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

/* ---------------------------------------------
   🧩 PUT: Update Employee Profile
--------------------------------------------- */
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const employee = await Employee.findByIdAndUpdate(id, updates, { new: true });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    res.json({
      msg: 'Profile updated successfully',
      user: employee,
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

/* ---------------------------------------------
   📄 POST: Upload Employee Document
--------------------------------------------- */
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ error: 'Employee ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No document uploaded' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // ✅ Add document metadata to employee
    const documentInfo = {
      name: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      uploadedAt: new Date(),
    };

    if (!employee.documents) employee.documents = [];
    employee.documents.push(documentInfo);
    await employee.save();

    res.json({
      msg: 'Document uploaded successfully',
      document: documentInfo,
    });
  } catch (err) {
    console.error('Error uploading document:', err);
    res.status(500).json({ error: 'Server error uploading document' });
  }
});

/* ---------------------------------------------
   🧩 GET /api/employees/:id - Fetch single employee profile with documents
--------------------------------------------- */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    res.json(employee);
  } catch (err) {
    console.error('Error fetching employee:', err);
    res.status(500).json({ msg: 'Server error fetching employee profile' });
  }
});

module.exports = router;
