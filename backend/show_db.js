const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance_db';

async function showDB() {
  console.log('='.repeat(65));
  console.log('  🔍 CONNECTING TO MONGODB...');
  console.log(`  URI: ${MONGO_URI}`);
  console.log('='.repeat(65));

  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;

    // 1. List Databases
    const adminDb = db.admin();
    const dbsInfo = await adminDb.listDatabases();
    console.log('\n📁 [ALL DATABASES ON SERVER]');
    console.table(dbsInfo.databases.map(d => ({
      'Database Name': d.name,
      'Size on Disk': `${(d.sizeOnDisk / 1024).toFixed(1)} KB`,
      'Empty': d.empty
    })));

    // 2. Collections Summary in attendance_db
    const collections = await db.listCollections().toArray();
    const summary = [];

    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      summary.push({
        'Collection Name': col.name,
        'Total Documents': count
      });
    }

    console.log(`\n📊 [COLLECTIONS IN attendance_db]`);
    console.table(summary);

    const target = process.argv[2]?.toLowerCase();

    if (target) {
      // User specified a specific collection to view
      const matched = collections.find(c => c.name.toLowerCase() === target || c.name.toLowerCase().startsWith(target));
      if (!matched) {
        console.log(`\n⚠️ Collection "${target}" not found. Available: ${collections.map(c => c.name).join(', ')}`);
      } else {
        const docs = await db.collection(matched.name).find().limit(20).toArray();
        console.log(`\n📋 [RECORDS IN: ${matched.name}] (Showing up to 20):`);
        console.dir(docs, { depth: null, colors: true });
      }
    } else {
      // 3. Show Quick Previews
      console.log('\n👤 [USERS / LOGINS]');
      const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
      console.table(users.map(u => ({
        ID: u._id.toString(),
        Name: u.name,
        Email: u.email,
        Role: u.role
      })));

      console.log('\n📚 [SUBJECTS]');
      const subjects = await db.collection('subjects').find().toArray();
      console.table(subjects.map(s => ({
        Code: s.subjectCode || s.code,
        Name: s.subjectName || s.name,
        Credits: s.credits,
        Semester: s.semester
      })));

      console.log('\n👨‍🏫 [FACULTIES]');
      const faculties = await db.collection('faculties').find().limit(5).toArray();
      console.table(faculties.map(f => ({
        ID: f.facultyId || f._id.toString(),
        Name: f.name,
        Department: f.department,
        Designation: f.designation || 'Faculty'
      })));

      console.log('\n🎓 [SAMPLE STUDENTS (Top 5)]');
      const students = await db.collection('students').find().limit(5).toArray();
      console.table(students.map(st => ({
        RegNo: st.regNo,
        Name: st.name,
        Department: st.department || st.branch,
        Semester: st.semester,
        Section: st.section
      })));

      console.log('\n📅 [SAMPLE ATTENDANCE RECORDS (Top 5)]');
      const attendances = await db.collection('attendances').find().limit(5).toArray();
      console.table(attendances.map(a => ({
        ID: a._id.toString(),
        ClassId: a.classId ? a.classId.toString() : 'N/A',
        StudentRegNo: a.studentRegNo || 'N/A',
        Status: a.status,
        Date: a.date ? new Date(a.date).toLocaleDateString() : 'N/A'
      })));

      console.log('\n💡 Tip: To view all data in a specific collection, run:');
      console.log('   node show_db.js users');
      console.log('   node show_db.js students');
      console.log('   node show_db.js attendances');
      console.log('   node show_db.js classes\n');
    }

  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

showDB();
