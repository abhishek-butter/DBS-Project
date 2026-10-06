const fs = require('fs');
const path = require('path');

const backendPath = path.join(__dirname, 'backend');

const dirs = [
  'models',
  'routes',
  'controllers',
  'middlewares',
  'config'
];

dirs.forEach(dir => fs.mkdirSync(path.join(backendPath, dir), { recursive: true }));

const files = {
  '.env': `PORT=5000\nMONGO_URI=mongodb://127.0.0.1:27017/attendance_db\nJWT_SECRET=supersecretjwt`,
  'server.js': `
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/analytics', require('./routes/analytics'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
  `,
  'config/db.js': `
const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
module.exports = connectDB;
  `,
  'middlewares/auth.js': `
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
  `,
  'models/User.js': `
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'faculty', 'student'], default: 'student' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('User', UserSchema);
  `,
  'models/Student.js': `
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
StudentSchema.index({ regNo: 1 }, { unique: true });
module.exports = mongoose.model('Student', StudentSchema);
  `,
  'models/Faculty.js': `
const mongoose = require('mongoose');
const FacultySchema = new mongoose.Schema({
  facultyId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, required: true },
});
module.exports = mongoose.model('Faculty', FacultySchema);
  `,
  'models/Subject.js': `
const mongoose = require('mongoose');
const SubjectSchema = new mongoose.Schema({
  subjectCode: { type: String, required: true, unique: true },
  subjectName: { type: String, required: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  semester: { type: Number, required: true },
  credits: { type: Number, required: true },
});
module.exports = mongoose.model('Subject', SubjectSchema);
  `,
  'models/Class.js': `
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
  `,
  'models/Attendance.js': `
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
module.exports = mongoose.model('Attendance', AttendanceSchema);
  `,
  'routes/auth.js': `
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5 days' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });
    user = new User({ name, email, password, role });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    res.json({ msg: 'User registered' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});
module.exports = router;
  `,
  'routes/students.js': `
const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const auth = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/', auth, async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    const student = await newStudent.save();
    res.json(student);
  } catch (err) { res.status(500).send('Server Error'); }
});
module.exports = router;
  `,
  'routes/faculty.js': `
const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');
const auth = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
  try {
    const faculty = await Faculty.find();
    res.json(faculty);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/', auth, async (req, res) => {
  try {
    const newFaculty = new Faculty(req.body);
    const faculty = await newFaculty.save();
    res.json(faculty);
  } catch (err) { res.status(500).send('Server Error'); }
});
module.exports = router;
  `,
  'routes/subjects.js': `
const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const auth = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
  try {
    const subjects = await Subject.find().populate('facultyId');
    res.json(subjects);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/', auth, async (req, res) => {
  try {
    const newSubject = new Subject(req.body);
    const subject = await newSubject.save();
    res.json(subject);
  } catch (err) { res.status(500).send('Server Error'); }
});
module.exports = router;
  `,
  'routes/classes.js': `
const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const auth = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
  try {
    const classes = await Class.find().populate('subjectId facultyId');
    res.json(classes);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/', auth, async (req, res) => {
  try {
    const newClass = new Class(req.body);
    const savedClass = await newClass.save();
    res.json(savedClass);
  } catch (err) { res.status(500).send('Server Error'); }
});
module.exports = router;
  `,
  'routes/attendance.js': `
const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const auth = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
  try {
    const records = await Attendance.find().populate('classId studentId subjectId');
    res.json(records);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/', auth, async (req, res) => {
  try {
    // Array of records or single record
    const records = req.body;
    if (Array.isArray(records)) {
        const saved = await Attendance.insertMany(records.map(r => ({...r, markedBy: req.user.id})));
        return res.json(saved);
    }
    const newAttendance = new Attendance({...req.body, markedBy: req.user.id});
    const saved = await newAttendance.save();
    res.json(saved);
  } catch (err) { res.status(500).send('Server Error'); }
});
module.exports = router;
  `,
  'routes/analytics.js': `
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
  `
};

for (const [filepath, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(backendPath, filepath), content.trim());
}
console.log('Backend scaffolding complete.');
