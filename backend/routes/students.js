const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const auth = require('../middlewares/auth');
const { resolveScope } = require('../utils/scope');

// READ ALL - with search, filter, pagination, and RBAC scoping
router.get('/', auth, async (req, res) => {
  try {
    const scope = await resolveScope(req);
    const { search, section, department, page, limit } = req.query;
    let query = {};

    // If student, restrict strictly to their own student profile
    if (scope.isStudent) {
      query._id = scope.studentId;
    } else {
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { regNo: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      if (section && section !== 'All') {
        query.section = section;
      }
      if (department && department !== 'All') {
        query.department = department;
      }
    }

    if (page && limit) {
      const p = parseInt(page) || 1;
      const l = parseInt(limit) || 20;
      const total = await Student.countDocuments(query);
      const students = await Student.find(query)
        .sort({ regNo: 1 })
        .skip((p - 1) * l)
        .limit(l);

      return res.json({
        total,
        page: p,
        pages: Math.ceil(total / l),
        students
      });
    }

    const students = await Student.find(query).sort({ regNo: 1 });
    res.json(students);
  } catch (err) {
    console.error('Students fetch error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// READ ONE - with attendance history & student isolation check
router.get('/:id', auth, async (req, res) => {
  try {
    const scope = await resolveScope(req);
    if (scope.isStudent && req.params.id !== scope.studentId?.toString()) {
      return res.status(403).json({ error: 'Access Denied: Students can only view their own profile and attendance records.' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const attendance = await Attendance.find({ studentId: student._id })
      .populate('subjectId')
      .sort({ date: -1 });

    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'Present').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    res.json({
      student,
      summary: { total, present, absent: total - present, percentage },
      attendance
    });
  } catch (err) {
    console.error('Student detail error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// CREATE - Restricted to Admin and Faculty only
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
    return res.status(403).json({ 
      error: 'Access Denied: Only administrators and faculty can register new students.',
      userRole: req.user.role 
    });
  }

  try {
    const { regNo, name, email, department, year, section, semester } = req.body;
    if (!regNo || !name || !email) {
      return res.status(400).json({ error: 'Please provide regNo, name, and email' });
    }

    const existing = await Student.findOne({ regNo });
    if (existing) {
      return res.status(400).json({ error: 'Student with this Register Number already exists' });
    }

    const newStudent = new Student({
      regNo,
      name,
      email,
      department: department || 'Computer Science',
      year: year || 3,
      section: section || 'D2',
      semester: semester || 5
    });

    const student = await newStudent.save();
    res.status(201).json(student);
  } catch (err) {
    console.error('Student create error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// UPDATE - Restricted to Admin and Faculty only
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
    return res.status(403).json({ 
      error: 'Access Denied: Only administrators and faculty can update student profiles.',
      userRole: req.user.role 
    });
  }

  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    console.error('Student update error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// DELETE - Restricted to Admin only
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access Denied: Only administrators can delete student records.',
      userRole: req.user.role 
    });
  }

  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Cascade delete attendance records
    await Attendance.deleteMany({ studentId: req.params.id });

    res.json({ msg: 'Student and associated attendance records deleted successfully' });
  } catch (err) {
    console.error('Student delete error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;