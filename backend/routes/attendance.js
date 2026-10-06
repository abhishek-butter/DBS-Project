const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const auth = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
  try {
    const records = await Attendance.find().populate('classId studentId subjectId');
    res.json(records);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/', auth, async (req, res) => {
  try {
    // Array of records or single record
    const records = req.body;
    if (Array.isArray(records)) {
        const bulkOps = records.map(r => ({
            updateOne: {
                filter: { studentId: r.studentId, subjectId: r.subjectId, date: new Date(r.date) },
                update: { $set: { status: r.status, markedBy: req.user.id } },
                upsert: true
            }
        }));
        const saved = await Attendance.bulkWrite(bulkOps);
        return res.json(saved);
    }
    const newAttendance = new Attendance({...req.body, markedBy: req.user.id});
    const saved = await newAttendance.save();
    res.json(saved);
  } catch (err) { res.status(500).send('Server Error'); }
});
module.exports = router;