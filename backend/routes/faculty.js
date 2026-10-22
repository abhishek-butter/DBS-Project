const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');
const auth = require('../middlewares/auth');

// READ ALL
router.get('/', auth, async (req, res) => {
  try {
    const faculty = await Faculty.find().sort({ facultyId: 1 });
    res.json(faculty);
  } catch (err) {
    console.error('Faculty fetch error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// READ ONE
router.get('/:id', auth, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ error: 'Faculty not found' });
    res.json(faculty);
  } catch (err) {
    console.error('Faculty fetch one error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// CREATE
router.post('/', auth, async (req, res) => {
  try {
    const { facultyId, name, email, department } = req.body;
    if (!facultyId || !name || !email) {
      return res.status(400).json({ error: 'Please provide facultyId, name, and email' });
    }
    const existing = await Faculty.findOne({ facultyId });
    if (existing) {
      return res.status(400).json({ error: 'Faculty ID already exists' });
    }
    const newFaculty = new Faculty({
      facultyId,
      name,
      email,
      department: department || 'Computer Science'
    });
    const faculty = await newFaculty.save();
    res.status(201).json(faculty);
  } catch (err) {
    console.error('Faculty create error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// UPDATE
router.put('/:id', auth, async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );
    if (!faculty) return res.status(404).json({ error: 'Faculty not found' });
    res.json(faculty);
  } catch (err) {
    console.error('Faculty update error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// DELETE
router.delete('/:id', auth, async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);
    if (!faculty) return res.status(404).json({ error: 'Faculty not found' });
    res.json({ msg: 'Faculty deleted successfully' });
  } catch (err) {
    console.error('Faculty delete error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;