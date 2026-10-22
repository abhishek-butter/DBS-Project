const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const auth = require('../middlewares/auth');

const { resolveScope } = require('../utils/scope');

// READ ALL - Scoped: Faculty only sees their scheduled classes; Admin sees all
router.get('/', auth, async (req, res) => {
  try {
    const scope = await resolveScope(req);
    let query = {};
    if (scope.isFaculty) {
      query.facultyId = scope.facultyId;
    }
    const classes = await Class.find(query)
      .populate('subjectId facultyId')
      .sort({ date: -1 });
    res.json(classes);
  } catch (err) {
    console.error('Classes fetch error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// READ ONE
router.get('/:id', auth, async (req, res) => {
  try {
    const classSession = await Class.findById(req.params.id).populate('subjectId facultyId');
    if (!classSession) return res.status(404).json({ error: 'Class session not found' });
    res.json(classSession);
  } catch (err) {
    console.error('Class fetch one error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// CREATE - Restricted to Faculty and Admin only
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
    return res.status(403).json({ 
      error: 'Access Denied: Only faculty and administrators can schedule classes.',
      userRole: req.user.role 
    });
  }

  try {
    const { subjectId, facultyId, date, startTime, endTime, room } = req.body;
    const newClass = new Class({
      subjectId,
      facultyId,
      date: date || new Date(),
      startTime: startTime || '10:00',
      endTime: endTime || '11:50',
      room: room || 'SJT-302'
    });
    const savedClass = await newClass.save();
    const populated = await Class.findById(savedClass._id).populate('subjectId facultyId');
    res.status(201).json(populated);
  } catch (err) {
    console.error('Class create error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// UPDATE - Restricted to Faculty and Admin only
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
    return res.status(403).json({ 
      error: 'Access Denied: Only faculty and administrators can modify class sessions.',
      userRole: req.user.role 
    });
  }

  try {
    const updated = await Class.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    ).populate('subjectId facultyId');
    if (!updated) return res.status(404).json({ error: 'Class session not found' });
    res.json(updated);
  } catch (err) {
    console.error('Class update error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// DELETE - Restricted to Faculty and Admin only
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
    return res.status(403).json({ 
      error: 'Access Denied: Only faculty and administrators can delete class sessions.',
      userRole: req.user.role 
    });
  }

  try {
    const deleted = await Class.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Class session not found' });
    res.json({ msg: 'Class session deleted successfully' });
  } catch (err) {
    console.error('Class delete error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;