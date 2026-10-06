const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const auth = require('../middlewares/auth');
const mongoose = require('mongoose');

// Aggregation queries based on rubric
router.get('/student-percentage', auth, async (req, res) => {
  try {
    const stats = await Attendance.aggregate([
      {
        $group: {
          _id: "$studentId",
          totalClasses: { $sum: 1 },
          presentClasses: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } }
        }
      },
      {
        $project: {
          studentId: "$_id",
          percentage: { $multiply: [{ $divide: ["$presentClasses", "$totalClasses"] }, 100] }
        }
      },
      {
        $lookup: {
            from: "students",
            localField: "studentId",
            foreignField: "_id",
            as: "studentInfo"
        }
      }
    ]);
    res.json(stats);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.get('/subject-percentage', auth, async (req, res) => {
    try {
      const stats = await Attendance.aggregate([
        {
          $group: {
            _id: "$subjectId",
            totalClasses: { $sum: 1 },
            presentClasses: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } }
          }
        },
        {
          $project: {
            subjectId: "$_id",
            percentage: { $multiply: [{ $divide: ["$presentClasses", "$totalClasses"] }, 100] }
          }
        },
        {
            $lookup: {
                from: "subjects",
                localField: "subjectId",
                foreignField: "_id",
                as: "subjectInfo"
            }
        }
      ]);
      res.json(stats);
    } catch (err) { res.status(500).send('Server Error'); }
  });
  
  router.get('/daily-stats', auth, async (req, res) => {
      try {
        const stats = await Attendance.aggregate([
          {
            $group: {
              _id: "$date",
              totalPresent: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
              totalAbsent: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } }
            }
          },
          { $sort: { "_id": 1 } }
        ]);
        res.json(stats);
      } catch (err) { res.status(500).send('Server Error'); }
  });
module.exports = router;