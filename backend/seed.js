const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const Subject = require('./models/Subject');
const Class = require('./models/Class');
const Attendance = require('./models/Attendance');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/attendance_db');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Riya", "Diya", "Isha", "Neha", "Maya", "Karan", "Rohan", "Rahul", "Aisha", "Priya", "Ananya", "Kavya", "Sneha", "Aditi", "Amit", "Manish", "Vikram", "Suresh", "Ramesh", "Pooja", "Swati", "Nisha", "Anita", "Sunita", "John", "Emma", "Michael", "Sophia", "William", "Olivia", "James", "Ava", "Alexander", "Isabella"];
const lastNames = ["Sharma", "Patel", "Singh", "Kumar", "Gupta", "Deshmukh", "Joshi", "Verma", "Reddy", "Rao", "Nair", "Iyer", "Pillai", "Das", "Bose", "Chowdhury", "Sen", "Yadav", "Pandey", "Mishra", "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];

const generateName = () => {
    return firstNames[Math.floor(Math.random() * firstNames.length)] + " " + lastNames[Math.floor(Math.random() * lastNames.length)];
};

const seedData = async () => {
  await connectDB();
  
  console.log('Clearing old data...');
  await User.deleteMany();
  await Student.deleteMany();
  await Faculty.deleteMany();
  await Subject.deleteMany();
  await Class.deleteMany();
  await Attendance.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('password123', salt);

  const admin = new User({ name: 'Admin User', email: 'admin@example.com', password, role: 'admin' });
  await admin.save();

  console.log('Generating students...');
  const students = [];
  for(let i=1; i<=1000; i++) {
      students.push({
          regNo: '24BCE' + i.toString().padStart(4, '0'),
          name: generateName(),
          email: 'student' + i + '@example.com',
          department: 'Computer Science',
          year: 3,
          section: i % 2 === 0 ? 'D1' : 'D2',
          semester: 5
      });
  }
  const insertedStudents = await Student.insertMany(students);

  console.log('Generating faculty...');
  const faculties = [];
  for(let i=1; i<=5; i++) {
      faculties.push({
          facultyId: 'FAC' + i.toString().padStart(3, '0'),
          name: 'Prof. ' + generateName(),
          email: 'faculty' + i + '@example.com',
          department: 'Computer Science'
      });
  }
  const insertedFaculties = await Faculty.insertMany(faculties);

  console.log('Generating subjects...');
  const subjectList = [
    { code: 'BCSE302', name: 'Database Systems', credits: 4 },
    { code: 'BCSE303', name: 'Operating Systems', credits: 4 },
    { code: 'BCSE304', name: 'Computer Networks', credits: 3 },
    { code: 'BCSE305', name: 'Software Engineering', credits: 3 },
    { code: 'BCSE306', name: 'Machine Learning', credits: 4 }
  ];
  const subjectsToInsert = subjectList.map((s, index) => ({
      subjectCode: s.code,
      subjectName: s.name,
      facultyId: insertedFaculties[index]._id,
      semester: 5,
      credits: s.credits
  }));
  const insertedSubjects = await Subject.insertMany(subjectsToInsert);

  console.log('Generating classes and attendance for the last 30 days...');
  const classesToInsert = [];
  const attendancesToInsert = [];
  
  // Date setup
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  // For each day in the last 30 days
  for(let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
      // Skip Sundays (0)
      if (d.getDay() === 0) continue; 
      
      const currentDateStr = new Date(d); // clone

      // Each day has 2 random subjects
      const shuffledSubjects = [...insertedSubjects].sort(() => 0.5 - Math.random());
      const dailySubjects = shuffledSubjects.slice(0, 2);

      for (let sIdx = 0; sIdx < dailySubjects.length; sIdx++) {
          const subject = dailySubjects[sIdx];
          const classSession = {
              _id: new mongoose.Types.ObjectId(),
              subjectId: subject._id,
              facultyId: subject.facultyId,
              date: currentDateStr,
              startTime: sIdx === 0 ? '10:00' : '14:00',
              endTime: sIdx === 0 ? '11:50' : '15:50',
              room: 'SJT-' + (300 + Math.floor(Math.random()*20))
          };
          classesToInsert.push(classSession);

          // Mark attendance for all students for this class
          // Add a slight trend - maybe attendance drops slightly on Fridays (5)
          let baseAttendanceRate = 0.85; // 85% normal
          if (d.getDay() === 5) baseAttendanceRate = 0.75; // Fridays are lower
          if (d.getDay() === 1) baseAttendanceRate = 0.90; // Mondays are high

          for(let student of insertedStudents) {
              const isPresent = Math.random() < baseAttendanceRate;
              attendancesToInsert.push({
                  classId: classSession._id,
                  studentId: student._id,
                  subjectId: subject._id,
                  date: currentDateStr,
                  status: isPresent ? 'Present' : 'Absent',
                  markedBy: admin._id
              });
          }
      }
  }

  await Class.insertMany(classesToInsert);
  
  // Insert attendance in batches because 15,000 records might be large for a single insert
  const batchSize = 2000;
  for (let i = 0; i < attendancesToInsert.length; i += batchSize) {
      await Attendance.insertMany(attendancesToInsert.slice(i, i + batchSize));
  }

  console.log('Database seeded successfully!');
  console.log('Inserted ' + insertedStudents.length + ' students, ' + insertedSubjects.length + ' subjects, ' + classesToInsert.length + ' classes, and ' + attendancesToInsert.length + ' attendance records.');
  process.exit();
};

seedData();
