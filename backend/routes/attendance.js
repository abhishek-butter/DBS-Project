const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const auth = require('../middlewares/auth');
const { resolveScope } = require('../utils/scope');

// READ ALL - with filters and RBAC data scoping
router.get('/', auth, async (req, res) => {
  try {
    const scope = await resolveScope(req);
    const { date, subjectId, studentId, status, limit } = req.query;
    let query = {};

    if (date) {
      const d = new Date(date);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }
    if (status) query.status = status;

    // RBAC MULTI-TENANT DATA SCOPING
    if (scope.isStudent) {
      // Student can ONLY access their own attendance
      query.studentId = scope.studentId;
      if (subjectId) query.subjectId = subjectId;
    } else if (scope.isFaculty) {
      // Faculty can ONLY access attendance of their assigned subjects
      if (subjectId) {
        const isAuthorized = scope.subjectIds.some(id => id.toString() === subjectId.toString());
        if (!isAuthorized) {
          return res.status(403).json({ error: 'Access Denied: You do not teach this subject.' });
        }
        query.subjectId = subjectId;
      } else {
        query.subjectId = { $in: scope.subjectIds };
      }
      if (studentId) query.studentId = studentId;
    } else {
      // Admin can access everything
      if (subjectId) query.subjectId = subjectId;
      if (studentId) query.studentId = studentId;
    }

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

// READ ONE - with scope verification
router.get('/:id', auth, async (req, res) => {
  try {
    const scope = await resolveScope(req);
    const record = await Attendance.findById(req.params.id).populate('classId studentId subjectId');
    if (!record) return res.status(404).json({ error: 'Record not found' });

    if (scope.isStudent && record.studentId?._id?.toString() !== scope.studentId?.toString()) {
      return res.status(403).json({ error: 'Access Denied: You can only view your own attendance record.' });
    }
    if (scope.isFaculty && !scope.subjectIds.some(id => id.toString() === record.subjectId?._id?.toString())) {
      return res.status(403).json({ error: 'Access Denied: This record does not belong to your assigned courses.' });
    }

    res.json(record);
  } catch (err) {
    console.error('Attendance fetch one error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// CREATE / BULK UPSERT - Restricted to Faculty and Admin only with Subject Verification
router.post('/', auth, async (req, res) => {
  const scope = await resolveScope(req);
  // Enforce RBAC: Students are strictly read-only
  if (!scope.isAdmin && !scope.isFaculty) {
    return res.status(403).json({ 
      error: 'Access Denied: Only faculty and administrators are authorized to mark attendance records.',
      userRole: req.user.role 
    });
  }

  try {
    const records = req.body;
    if (Array.isArray(records)) {
      if (records.length === 0) {
        return res.status(400).json({ error: 'No records provided' });
      }

      // Faculty subject authorization verification
      if (scope.isFaculty) {
        const unauthorized = records.some(r => !scope.subjectIds.some(id => id.toString() === r.subjectId?.toString()));
        if (unauthorized) {
          return res.status(403).json({ error: 'Access Denied: You can only mark attendance for courses assigned to you.' });
        }
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
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    res.json(record);
  } catch (err) {
    console.error('Attendance save error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// UPDATE - Restricted to Faculty and Admin only
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
    return res.status(403).json({ 
      error: 'Access Denied: Only faculty and administrators are authorized to modify attendance records.',
      userRole: req.user.role 
    });
  }

  try {
    const updated = await Attendance.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after' }
    );
    if (!updated) return res.status(404).json({ error: 'Record not found' });
    res.json(updated);
  } catch (err) {
    console.error('Attendance update error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// DELETE - Restricted to Admin and Faculty only
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
    return res.status(403).json({ 
      error: 'Access Denied: Only faculty and administrators are authorized to delete attendance records.',
      userRole: req.user.role 
    });
  }

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