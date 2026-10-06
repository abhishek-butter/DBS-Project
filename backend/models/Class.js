const mongoose = require('mongoose');
const ClassSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  room: { type: String, required: true },
});
module.exports = mongoose.model('Class', ClassSchema);