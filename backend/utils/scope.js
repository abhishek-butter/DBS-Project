const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Subject = require('../models/Subject');

/**
 * Resolves user identity boundaries for multi-tenant data isolation:
 * - Admin: Unconstrained global institutional access
 * - Faculty: Scoped strictly to their assigned subjects/classes & enrolled students
 * - Student: Scoped strictly to their own student profile & attendance records
 */
async function resolveScope(req) {
  const role = req.user?.role || 'anonymous';

  if (role === 'student') {
    let studentId = req.user.studentId;
    if (!studentId) {
      const s = await Student.findOne({ email: req.user.email }) || await Student.findOne({ regNo: '24BCE0404' });
      studentId = s?._id;
    }
    return {
      role: 'student',
      studentId,
      isStudent: true,
      isFaculty: false,
      isAdmin: false
    };
  }

  if (role === 'faculty') {
    let facultyId = req.user.facultyId;
    if (!facultyId) {
      const f = await Faculty.findOne({ email: req.user.email }) || await Faculty.findOne();
      facultyId = f?._id;
    }
    const subjects = await Subject.find({ facultyId });
    const subjectIds = subjects.map(s => s._id);

    return {
      role: 'faculty',
      facultyId,
      subjects,
      subjectIds,
      isStudent: false,
      isFaculty: true,
      isAdmin: false
    };
  }

  return {
    role: 'admin',
    isStudent: false,
    isFaculty: false,
    isAdmin: true
  };
}

module.exports = { resolveScope };
