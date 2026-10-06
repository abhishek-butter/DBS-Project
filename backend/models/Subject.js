const mongoose = require('mongoose');
const SubjectSchema = new mongoose.Schema({
  subjectCode: { type: String, required: true, unique: true },
  subjectName: { type: String, required: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  semester: { type: Number, required: true },
  credits: { type: Number, required: true },
});
module.exports = mongoose.model('Subject', SubjectSchema);