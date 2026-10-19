const mongoose = require('mongoose');
const StudentSchema = new mongoose.Schema({
  regNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, required: true },
  year: { type: Number, required: true },
  section: { type: String, required: true },
  semester: { type: Number, required: true },
});
StudentSchema.index({ department: 1, section: 1 });
module.exports = mongoose.model('Student', StudentSchema);