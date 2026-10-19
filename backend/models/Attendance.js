const mongoose = require('mongoose');
const AttendanceSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent'], required: true },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});
AttendanceSchema.index({ studentId: 1, subjectId: 1, date: 1 });
AttendanceSchema.index({ date: 1 });
AttendanceSchema.index({ subjectId: 1, date: 1 });
module.exports = mongoose.model('Attendance', AttendanceSchema);