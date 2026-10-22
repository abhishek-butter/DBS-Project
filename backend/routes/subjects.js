const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const auth = require('../middlewares/auth');

const { resolveScope } = require('../utils/scope');

// READ ALL - Scoped: Faculty only sees their assigned courses; Admin sees all
router.get('/', auth, async (req, res) => {
  try {
    const scope = await resolveScope(req);
    let query = {};
    if (scope.isFaculty) {
      query.facultyId = scope.facultyId;
    }
    const subjects = await Subject.find(query).populate('facultyId').sort({ subjectCode: 1 });
    res.json(subjects);
  } catch (err) {
    console.error('Subjects fetch error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// READ ONE
router.get('/:id', auth, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id).populate('facultyId');
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.json(subject);
  } catch (err) {
    console.error('Subject fetch one error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// CREATE
router.post('/', auth, async (req, res) => {
  try {
    const { subjectCode, subjectName, facultyId, semester, credits } = req.body;
    if (!subjectCode || !subjectName) {
      return res.status(400).json({ error: 'Please provide subjectCode and subjectName' });
    }
    const existing = await Subject.findOne({ subjectCode });
    if (existing) {
      return res.status(400).json({ error: 'Subject code already exists' });
    }
    const newSubject = new Subject({
      subjectCode,
      subjectName,
      facultyId: facultyId || null,
      semester: semester || 5,
      credits: credits || 3
    });
    const subject = await newSubject.save();
    res.status(201).json(subject);
  } catch (err) {
    console.error('Subject create error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// UPDATE
router.put('/:id', auth, async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.json(subject);
  } catch (err) {
    console.error('Subject update error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// DELETE
router.delete('/:id', auth, async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.json({ msg: 'Subject deleted successfully' });
  } catch (err) {
    console.error('Subject delete error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;