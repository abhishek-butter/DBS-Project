const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const auth = require('../middlewares/auth');

// READ ALL - with filters
router.get('/', auth, async (req, res) => {
  try {
    const { date, subjectId, studentId, status, limit } = req.query;
    let query = {};

    if (date) {
      const d = new Date(date);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }
    if (subjectId) query.subjectId = subjectId;
    if (studentId) query.studentId = studentId;
    if (status) query.status = status;

    const maxLimit = parseInt(limit) || 100;
    const records = await Attendance.find(query)
      .populate('classId studentId subjectId')
      .sort({ date: -1 })
      .limit(maxLimit);

    res.json(records);
  } catch (err) {
    console.error('Attendance fetch error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// READ ONE
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id).populate('classId studentId subjectId');
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (err) {
    console.error('Attendance fetch one error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// CREATE / BULK UPSERT
router.post('/', auth, async (req, res) => {
  try {
    const records = req.body;
    if (Array.isArray(records)) {
      if (records.length === 0) {
        return res.status(400).json({ error: 'No records provided' });
      }

      const bulkOps = records.map(r => {
        // Standardize date to UTC start of day
        const recDate = new Date(r.date);
        const normalizedDate = new Date(Date.UTC(recDate.getFullYear(), recDate.getMonth(), recDate.getDate()));

        return {
          updateOne: {
            filter: {
              studentId: r.studentId,
              subjectId: r.subjectId,
              date: normalizedDate
            },
            update: {
              $set: {
                status: r.status,
                classId: r.classId || null,
                markedBy: req.user.id
              }
            },
            upsert: true
          }
        };
      });

      const saved = await Attendance.bulkWrite(bulkOps);
      return res.json({ msg: 'Attendance saved successfully', count: records.length, result: saved });
    }

    // Single record
    const { studentId, subjectId, date, status, classId } = req.body;
    const recDate = new Date(date || Date.now());
    const normalizedDate = new Date(Date.UTC(recDate.getFullYear(), recDate.getMonth(), recDate.getDate()));

    const record = await Attendance.findOneAndUpdate(
      { studentId, subjectId, date: normalizedDate },
      {
        $set: {
          status,
          classId: classId || null,
          markedBy: req.user.id
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(record);
  } catch (err) {
    console.error('Attendance save error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// UPDATE
router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Attendance.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Record not found' });
    res.json(updated);
  } catch (err) {
    console.error('Attendance update error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// DELETE
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Attendance.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Record not found' });
    res.json({ msg: 'Attendance record deleted successfully' });
  } catch (err) {
    console.error('Attendance delete error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;