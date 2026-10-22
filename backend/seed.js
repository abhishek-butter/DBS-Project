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
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const firstNames = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Riya", "Diya", "Isha", "Neha", 
  "Maya", "Karan", "Rohan", "Rahul", "Aisha", "Priya", "Ananya", "Kavya", "Sneha", "Aditi", 
  "Amit", "Manish", "Vikram", "Suresh", "Ramesh", "Pooja", "Swati", "Nisha", "Anita", "Sunita",
  "Dev", "Kunal", "Tanvi", "Meera", "Varun", "Simran", "Gaurav", "Naveen", "Shreya", "Deepak"
];
const lastNames = [
  "Sharma", "Patel", "Singh", "Kumar", "Gupta", "Deshmukh", "Joshi", "Verma", "Reddy", "Rao", 
  "Nair", "Iyer", "Pillai", "Das", "Bose", "Chowdhury", "Sen", "Yadav", "Pandey", "Mishra", 
  "Bhat", "Menon", "Kapoor", "Malhotra", "Saxena"
];

const generateName = () => {
  return firstNames[Math.floor(Math.random() * firstNames.length)] + " " + lastNames[Math.floor(Math.random() * lastNames.length)];
};

const seedData = async () => {
  await connectDB();

  console.log('Clearing old data collections...');
  await User.deleteMany();
  await Student.deleteMany();
  await Faculty.deleteMany();
  await Subject.deleteMany();
  await Class.deleteMany();
  await Attendance.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('password123', salt);

  console.log('Seeding faculty members...');
  const facultyMembers = [
    { facultyId: 'FAC001', name: 'Prof. Rajesh Sharma', email: 'faculty@example.com', department: 'Computer Science' },
    { facultyId: 'FAC002', name: 'Prof. Sunita Rao', email: 'sunita.rao@vit.ac.in', department: 'Computer Science' },
    { facultyId: 'FAC003', name: 'Prof. Vikram Singh', email: 'vikram.singh@vit.ac.in', department: 'Computer Science' },
    { facultyId: 'FAC004', name: 'Prof. Ananya Iyer', email: 'ananya.iyer@vit.ac.in', department: 'Computer Science' },
    { facultyId: 'FAC005', name: 'Prof. Manish Patel', email: 'manish.patel@vit.ac.in', department: 'Computer Science' }
  ];
  const insertedFaculties = await Faculty.insertMany(facultyMembers);

  console.log('Seeding subjects...');
  const subjectList = [
    { code: 'BCSE302P', name: 'Database Systems Lab', credits: 2, facultyId: insertedFaculties[0]._id },
    { code: 'BCSE302', name: 'Database Management Systems', credits: 4, facultyId: insertedFaculties[1]._id },
    { code: 'BCSE303', name: 'Operating Systems', credits: 4, facultyId: insertedFaculties[2]._id },
    { code: 'BCSE304', name: 'Computer Networks', credits: 3, facultyId: insertedFaculties[3]._id },
    { code: 'BCSE305', name: 'Software Engineering', credits: 3, facultyId: insertedFaculties[4]._id }
  ];
  const insertedSubjects = await Subject.insertMany(
    subjectList.map(s => ({
      subjectCode: s.code,
      subjectName: s.name,
      facultyId: s.facultyId,
      semester: 5,
      credits: s.credits
    }))
  );

  console.log('Seeding students (including team members Abhishek VS and Ayush Naugariya)...');
  const studentList = [
    {
      regNo: '24BCE0404',
      name: 'Abhishek VS',
      email: 'student@example.com',
      department: 'Computer Science',
      year: 3,
      section: 'D2',
      semester: 5
    },
    {
      regNo: '24BDS0076',
      name: 'Ayush Naugariya',
      email: 'ayush.naugariya2024@vitstudent.ac.in',
      department: 'Computer Science',
      year: 3,
      section: 'D2',
      semester: 5
    }
  ];

  // Add 58 more students for a realistic cohort of 60 students
  for (let i = 1; i <= 58; i++) {
    const isD1 = i % 2 === 0;
    studentList.push({
      regNo: '24BCE' + (1000 + i).toString(),
      name: generateName(),
      email: `student${i}@vitstudent.ac.in`,
      department: 'Computer Science',
      year: 3,
      section: isD1 ? 'D1' : 'D2',
      semester: 5
    });
  }

  const insertedStudents = await Student.insertMany(studentList);

  console.log('Seeding authentication users with role entity links...');
  const users = await User.insertMany([
    { 
      name: 'System Administrator', 
      email: 'admin@example.com', 
      password, 
      role: 'admin' 
    },
    { 
      name: 'Prof. Rajesh Sharma', 
      email: 'faculty@example.com', 
      password, 
      role: 'faculty',
      facultyId: insertedFaculties[0]._id 
    },
    { 
      name: 'Abhishek VS', 
      email: 'student@example.com', 
      password, 
      role: 'student',
      studentId: insertedStudents[0]._id 
    }
  ]);
  const adminUser = users[0];

  console.log('Generating classes and attendance for past 25 days...');
  const classesToInsert = [];
  const attendancesToInsert = [];

  const today = new Date();
  const pastDays = 25;

  // We assign a realistic profile to each student:
  // - top attendees: 90-95%
  // - average: 75-88%
  // - defaulters (<75%): ~15% of students so low-attendance aggregation has rich demonstration
  const studentProfiles = insertedStudents.map((s, idx) => {
    if (s.regNo === '24BCE0404' || s.regNo === '24BDS0076') {
      return { student: s, rate: 0.92 }; // high attendance for project creators!
    }
    if (idx % 6 === 0) return { student: s, rate: 0.62 }; // defaulter (<75%)
    if (idx % 8 === 0) return { student: s, rate: 0.70 }; // defaulter (<75%)
    if (idx % 3 === 0) return { student: s, rate: 0.88 };
    return { student: s, rate: 0.82 };
  });

  for (let dOffset = pastDays; dOffset >= 0; dOffset--) {
    const day = new Date(today);
    day.setDate(today.getDate() - dOffset);
    if (day.getDay() === 0) continue; // Skip Sunday

    // Normalize date to UTC midnight
    const sessionDate = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()));

    // Schedule 2 classes each working day
    const daySubjects = [insertedSubjects[dOffset % insertedSubjects.length], insertedSubjects[(dOffset + 2) % insertedSubjects.length]];

    for (let sIdx = 0; sIdx < daySubjects.length; sIdx++) {
      const subject = daySubjects[sIdx];
      const classSession = {
        _id: new mongoose.Types.ObjectId(),
        subjectId: subject._id,
        facultyId: subject.facultyId,
        date: sessionDate,
        startTime: sIdx === 0 ? '09:00' : '11:00',
        endTime: sIdx === 0 ? '10:50' : '12:50',
        room: `SJT-${301 + (sIdx * 3)}`
      };
      classesToInsert.push(classSession);

      for (const profile of studentProfiles) {
        const isPresent = Math.random() < profile.rate;
        attendancesToInsert.push({
          classId: classSession._id,
          studentId: profile.student._id,
          subjectId: subject._id,
          date: sessionDate,
          status: isPresent ? 'Present' : 'Absent',
          markedBy: adminUser._id
        });
      }
    }
  }

  await Class.insertMany(classesToInsert);

  // Insert attendance in batches
  const batchSize = 1000;
  for (let i = 0; i < attendancesToInsert.length; i += batchSize) {
    await Attendance.insertMany(attendancesToInsert.slice(i, i + batchSize));
  }

  console.log('Database seeded successfully!');
  console.log(`- Users: ${users.length}`);
  console.log(`- Faculty: ${insertedFaculties.length}`);
  console.log(`- Subjects: ${insertedSubjects.length}`);
  console.log(`- Students: ${insertedStudents.length}`);
  console.log(`- Classes: ${classesToInsert.length}`);
  console.log(`- Attendance Records: ${attendancesToInsert.length}`);
  console.log('\nDefault Admin Credentials: admin@example.com / password123');
  process.exit(0);
};

seedData();
