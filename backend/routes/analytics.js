const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const auth = require('../middlewares/auth');
const { resolveScope } = require('../utils/scope');

// 1. Overall System Summary (KPIs) - Multi-tenant Scoped
router.get('/summary', auth, async (req, res) => {
  try {
    const scope = await resolveScope(req);

    if (scope.isStudent) {
      // Student View: Personal Academic Profile KPIs
      const myAttendance = await Attendance.find({ studentId: scope.studentId });
      const totalRecords = myAttendance.length;
      const presentRecords = myAttendance.filter(a => a.status === 'Present').length;
      const overallPercentage = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

      return res.json({
        totalStudents: 1,
        totalFaculty: 5,
        totalSubjects: 5,
        totalClasses: totalRecords,
        totalRecords,
        presentRecords,
        absentRecords: totalRecords - presentRecords,
        overallPercentage,
        scope: 'student'
      });
    }

    if (scope.isFaculty) {
      // Faculty View: Scoped to subjects taught by this faculty member
      const facultyClasses = await Class.countDocuments({ facultyId: scope.facultyId });
      const attendanceAgg = await Attendance.aggregate([
        { $match: { subjectId: { $in: scope.subjectIds } } },
        {
          $group: {
            _id: null,
            totalRecords: { $sum: 1 },
            presentRecords: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } }
          }
        }
      ]);

      const totalRecords = attendanceAgg[0]?.totalRecords || 0;
      const presentRecords = attendanceAgg[0]?.presentRecords || 0;
      const overallPercentage = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

      return res.json({
        totalStudents: 60,
        totalFaculty: 1,
        totalSubjects: scope.subjectIds.length,
        totalClasses: facultyClasses,
        totalRecords,
        presentRecords,
        absentRecords: totalRecords - presentRecords,
        overallPercentage,
        scope: 'faculty'
      });
    }

    // Admin View: System-wide metrics
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
      overallPercentage,
      scope: 'admin'
    });
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 2. Aggregation 1: Student Attendance Percentage - Scoped
router.get('/student-percentage', auth, async (req, res) => {
  try {
    const scope = await resolveScope(req);
    const pipeline = [];

    // Data Scoping
    if (scope.isStudent) {
      pipeline.push({ $match: { studentId: scope.studentId } });
    } else if (scope.isFaculty) {
      pipeline.push({ $match: { subjectId: { $in: scope.subjectIds } } });
    }

    pipeline.push(
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
    );

    const stats = await Attendance.aggregate(pipeline);
    res.json(stats);
  } catch (err) {
    console.error('Student-percentage error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 3. Aggregation 2: Subject-wise Attendance Percentage - Scoped
router.get('/subject-percentage', auth, async (req, res) => {
  try {
    const scope = await resolveScope(req);
    const pipeline = [];

    if (scope.isFaculty) {
      pipeline.push({ $match: { subjectId: { $in: scope.subjectIds } } });
    }

    pipeline.push(
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
    );

    const stats = await Attendance.aggregate(pipeline);
    res.json(stats);
  } catch (err) {
    console.error('Subject-percentage error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 4. Aggregation 3: Daily Attendance Statistics & Trends - Scoped
router.get('/daily-stats', auth, async (req, res) => {
  try {
    const scope = await resolveScope(req);
    const pipeline = [];

    if (scope.isStudent) {
      pipeline.push({ $match: { studentId: scope.studentId } });
    } else if (scope.isFaculty) {
      pipeline.push({ $match: { subjectId: { $in: scope.subjectIds } } });
    }

    pipeline.push(
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
    );

    const stats = await Attendance.aggregate(pipeline);
    res.json(stats);
  } catch (err) {
    console.error('Daily-stats error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 5. Aggregation 4: Students Below Attendance Threshold (Defaulters List < 75%) - Scoped
router.get('/low-attendance', auth, async (req, res) => {
  try {
    const scope = await resolveScope(req);
    const threshold = parseFloat(req.query.threshold) || 75.0;
    const pipeline = [];

    if (scope.isStudent) {
      pipeline.push({ $match: { studentId: scope.studentId } });
    } else if (scope.isFaculty) {
      pipeline.push({ $match: { subjectId: { $in: scope.subjectIds } } });
    }

    pipeline.push(
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
    );

    const defaulters = await Attendance.aggregate(pipeline);
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

// 6. Aggregation 5: Monthly Attendance Report - Scoped
router.get('/monthly-report', auth, async (req, res) => {
  try {
    const scope = await resolveScope(req);

    if (scope.isStudent) {
      return res.status(403).json({ 
        error: 'Forbidden: Institutional analytics reports are restricted to faculty and administrators.' 
      });
    }

    const pipeline = [];

    if (scope.isFaculty) {
      pipeline.push({ $match: { subjectId: { $in: scope.subjectIds } } });
    }

    pipeline.push(
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
    );

    const stats = await Attendance.aggregate(pipeline);
    res.json(stats);
  } catch (err) {
    console.error('Monthly-report error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 7. Aggregation 6: Section-Wise Attendance Comparison - Scoped
router.get('/section-stats', auth, async (req, res) => {
  try {
    const scope = await resolveScope(req);

    if (scope.isStudent) {
      return res.status(403).json({ 
        error: 'Forbidden: Section comparison analytics are restricted to faculty and administrators.' 
      });
    }

    const pipeline = [];

    if (scope.isFaculty) {
      pipeline.push({ $match: { subjectId: { $in: scope.subjectIds } } });
    }

    pipeline.push(
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
    );

    const stats = await Attendance.aggregate(pipeline);
    res.json(stats);
  } catch (err) {
    console.error('Section-stats error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;