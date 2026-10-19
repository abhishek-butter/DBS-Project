const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const auth = require('../middlewares/auth');

// 1. Overall System Summary (KPIs)
router.get('/summary', auth, async (req, res) => {
  try {
    const [totalStudents, totalFaculty, totalSubjects, totalClasses, attendanceAgg] = await Promise.all([
      Student.countDocuments(),
      Faculty.countDocuments(),
      Subject.countDocuments(),
      Class.countDocuments(),
      Attendance.aggregate([
        {
          $group: {
            _id: null,
            totalRecords: { $sum: 1 },
            presentRecords: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } }
          }
        }
      ])
    ]);

    const totalRecords = attendanceAgg[0]?.totalRecords || 0;
    const presentRecords = attendanceAgg[0]?.presentRecords || 0;
    const overallPercentage = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

    res.json({
      totalStudents,
      totalFaculty,
      totalSubjects,
      totalClasses,
      totalRecords,
      presentRecords,
      absentRecords: totalRecords - presentRecords,
      overallPercentage
    });
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 2. Aggregation 1: Student Attendance Percentage
router.get('/student-percentage', auth, async (req, res) => {
  try {
    const stats = await Attendance.aggregate([
      {
        $group: {
          _id: "$studentId",
          totalClasses: { $sum: 1 },
          presentClasses: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
          absentClasses: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } }
        }
      },
      {
        $project: {
          studentId: "$_id",
          totalClasses: 1,
          presentClasses: 1,
          absentClasses: 1,
          percentage: {
            $round: [
              { $multiply: [{ $divide: ["$presentClasses", "$totalClasses"] }, 100] },
              1
            ]
          }
        }
      },
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "studentInfo"
        }
      },
      { $unwind: { path: "$studentInfo", preserveNullAndEmptyArrays: true } },
      { $sort: { percentage: -1 } }
    ]);
    res.json(stats);
  } catch (err) {
    console.error('Student-percentage error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 3. Aggregation 2: Subject-wise Attendance Percentage
router.get('/subject-percentage', auth, async (req, res) => {
  try {
    const stats = await Attendance.aggregate([
      {
        $group: {
          _id: "$subjectId",
          totalClasses: { $sum: 1 },
          presentClasses: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
          absentClasses: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } }
        }
      },
      {
        $project: {
          subjectId: "$_id",
          totalClasses: 1,
          presentClasses: 1,
          absentClasses: 1,
          percentage: {
            $round: [
              { $multiply: [{ $divide: ["$presentClasses", "$totalClasses"] }, 100] },
              1
            ]
          }
        }
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subjectId",
          foreignField: "_id",
          as: "subjectInfo"
        }
      },
      { $unwind: { path: "$subjectInfo", preserveNullAndEmptyArrays: true } },
      { $sort: { percentage: -1 } }
    ]);
    res.json(stats);
  } catch (err) {
    console.error('Subject-percentage error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 4. Aggregation 3: Daily Attendance Statistics & Trends
router.get('/daily-stats', auth, async (req, res) => {
  try {
    const stats = await Attendance.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalPresent: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
          totalAbsent: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } },
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          date: "$_id",
          totalPresent: 1,
          totalAbsent: 1,
          total: 1,
          attendanceRate: {
            $round: [
              { $multiply: [{ $divide: ["$totalPresent", "$total"] }, 100] },
              1
            ]
          }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    res.json(stats);
  } catch (err) {
    console.error('Daily-stats error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 5. Aggregation 4: Students Below Attendance Threshold (Defaulters List < 75%)
router.get('/low-attendance', auth, async (req, res) => {
  try {
    const threshold = parseFloat(req.query.threshold) || 75.0;
    const defaulters = await Attendance.aggregate([
      {
        $group: {
          _id: "$studentId",
          totalClasses: { $sum: 1 },
          presentClasses: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
          absentClasses: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } }
        }
      },
      {
        $project: {
          studentId: "$_id",
          totalClasses: 1,
          presentClasses: 1,
          absentClasses: 1,
          percentage: {
            $round: [
              { $multiply: [{ $divide: ["$presentClasses", "$totalClasses"] }, 100] },
              1
            ]
          }
        }
      },
      {
        $match: {
          percentage: { $lt: threshold }
        }
      },
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "studentInfo"
        }
      },
      { $unwind: { path: "$studentInfo", preserveNullAndEmptyArrays: true } },
      { $sort: { percentage: 1 } }
    ]);
    res.json({
      threshold,
      count: defaulters.length,
      defaulters
    });
  } catch (err) {
    console.error('Low-attendance error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 6. Aggregation 5: Monthly Attendance Report
router.get('/monthly-report', auth, async (req, res) => {
  try {
    const stats = await Attendance.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          totalRecords: { $sum: 1 },
          presentRecords: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
          absentRecords: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } }
        }
      },
      {
        $project: {
          year: "$_id.year",
          month: "$_id.month",
          totalRecords: 1,
          presentRecords: 1,
          absentRecords: 1,
          percentage: {
            $round: [
              { $multiply: [{ $divide: ["$presentRecords", "$totalRecords"] }, 100] },
              1
            ]
          }
        }
      },
      { $sort: { "year": 1, "month": 1 } }
    ]);
    res.json(stats);
  } catch (err) {
    console.error('Monthly-report error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 7. Aggregation 6: Section-Wise Attendance Comparison
router.get('/section-stats', auth, async (req, res) => {
  try {
    const stats = await Attendance.aggregate([
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },
      {
        $group: {
          _id: "$student.section",
          totalRecords: { $sum: 1 },
          presentRecords: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
          absentRecords: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } }
        }
      },
      {
        $project: {
          section: "$_id",
          totalRecords: 1,
          presentRecords: 1,
          absentRecords: 1,
          percentage: {
            $round: [
              { $multiply: [{ $divide: ["$presentRecords", "$totalRecords"] }, 100] },
              1
            ]
          }
        }
      },
      { $sort: { section: 1 } }
    ]);
    res.json(stats);
  } catch (err) {
    console.error('Section-stats error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;