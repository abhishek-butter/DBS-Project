const axios = require('./frontend/node_modules/axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('STARTING FULL SYSTEM END-TO-END TEST SUITE');
  console.log('Project: Student Attendance Management System (BCSE302P)');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.response?.data || err.message);
      failed++;
    }
  }

  let adminToken = '';
  let studentToken = '';
  let facultyToken = '';
  let testStudentId = '';
  let testSubjectId = '';
  let testFacultyId = '';
  let testClassId = '';
  let testAttendanceId = '';

  // 1. AUTHENTICATION TESTS
  console.log('--- 1. AUTHENTICATION MODULE ---');
  await test('POST /api/auth/login - Admin Login', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    if (!res.data.token) throw new Error('No token returned');
    adminToken = res.data.token;
  });

  await test('POST /api/auth/login - Faculty Login', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'faculty@example.com',
      password: 'password123'
    });
    if (!res.data.token) throw new Error('No token returned');
    facultyToken = res.data.token;
  });

  await test('POST /api/auth/login - Student Login (Read-Only Role)', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student@example.com',
      password: 'password123'
    });
    if (!res.data.token) throw new Error('No token returned');
    if (res.data.user.role !== 'student') throw new Error('Role is not student');
    studentToken = res.data.token;
  });

  await test('POST /api/auth/login - Invalid Credentials Rejection', async () => {
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@example.com',
        password: 'wrongpassword'
      });
      throw new Error('Should have rejected bad password');
    } catch (err) {
      if (err.response?.status !== 400) throw err;
    }
  });

  const headers = { 'x-auth-token': adminToken };

  // 2. STUDENTS CRUD TESTS
  console.log('\n--- 2. STUDENTS CRUD OPERATIONS ---');
  await test('GET /api/students - Read all students with pagination & search', async () => {
    const res = await axios.get(`${BASE_URL}/students?page=1&limit=10&search=Abhishek`, { headers });
    if (!res.data.students || res.data.students.length === 0) throw new Error('Search failed');
    if (res.data.students[0].regNo !== '24BCE0404') throw new Error('Did not find Abhishek VS (24BCE0404)');
  });

  await test('POST /api/students - Create new student', async () => {
    const res = await axios.post(`${BASE_URL}/students`, {
      regNo: '24BCE9999',
      name: 'Test Student Automated',
      email: 'test.student@example.com',
      department: 'Computer Science',
      year: 3,
      section: 'D2',
      semester: 5
    }, { headers });
    if (!res.data._id) throw new Error('Failed to create student');
    testStudentId = res.data._id;
  });

  await test('GET /api/students/:id - Read single student with attendance profile', async () => {
    const res = await axios.get(`${BASE_URL}/students/${testStudentId}`, { headers });
    if (res.data.student.regNo !== '24BCE9999') throw new Error('Student mismatch');
    if (typeof res.data.summary?.percentage !== 'number') throw new Error('Summary missing');
  });

  await test('PUT /api/students/:id - Update student details', async () => {
    const res = await axios.put(`${BASE_URL}/students/${testStudentId}`, {
      name: 'Test Student Renamed'
    }, { headers });
    if (res.data.name !== 'Test Student Renamed') throw new Error('Student not updated');
  });

  // 3. FACULTY CRUD TESTS
  console.log('\n--- 3. FACULTY CRUD OPERATIONS ---');
  await test('GET /api/faculty - Read all faculty', async () => {
    const res = await axios.get(`${BASE_URL}/faculty`, { headers });
    if (!Array.isArray(res.data) || res.data.length === 0) throw new Error('No faculty found');
  });

  await test('POST /api/faculty - Create new faculty', async () => {
    const res = await axios.post(`${BASE_URL}/faculty`, {
      facultyId: 'FAC999',
      name: 'Prof. Test Evaluator',
      email: 'evaluator@vit.ac.in',
      department: 'Computer Science'
    }, { headers });
    if (!res.data._id) throw new Error('Faculty creation failed');
    testFacultyId = res.data._id;
  });

  // 4. SUBJECTS CRUD TESTS
  console.log('\n--- 4. SUBJECTS CRUD OPERATIONS ---');
  await test('GET /api/subjects - Read all subjects', async () => {
    const res = await axios.get(`${BASE_URL}/subjects`, { headers });
    if (!Array.isArray(res.data) || res.data.length === 0) throw new Error('No subjects found');
  });

  await test('POST /api/subjects - Create new subject', async () => {
    const res = await axios.post(`${BASE_URL}/subjects`, {
      subjectCode: 'BCSE999',
      subjectName: 'Advanced Distributed NoSQL',
      facultyId: testFacultyId,
      semester: 5,
      credits: 4
    }, { headers });
    if (!res.data._id) throw new Error('Subject creation failed');
    testSubjectId = res.data._id;
  });

  // 5. CLASSES CRUD TESTS
  console.log('\n--- 5. CLASSES CRUD OPERATIONS ---');
  await test('GET /api/classes - Read all classes', async () => {
    const res = await axios.get(`${BASE_URL}/classes`, { headers });
    if (!Array.isArray(res.data) || res.data.length === 0) throw new Error('No classes found');
  });

  await test('POST /api/classes - Create new class session', async () => {
    const res = await axios.post(`${BASE_URL}/classes`, {
      subjectId: testSubjectId,
      facultyId: testFacultyId,
      date: new Date(),
      startTime: '14:00',
      endTime: '15:50',
      room: 'SJT-401'
    }, { headers });
    if (!res.data._id) throw new Error('Class creation failed');
    testClassId = res.data._id;
  });

  // 6. ATTENDANCE CRUD & BULK OPERATIONS
  console.log('\n--- 6. ATTENDANCE OPERATIONS ---');
  await test('POST /api/attendance - Bulk Upsert Attendance', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await axios.post(`${BASE_URL}/attendance`, [
      {
        studentId: testStudentId,
        subjectId: testSubjectId,
        date: today,
        status: 'Present',
        classId: testClassId
      }
    ], { headers });
    if (!res.data.result) throw new Error('BulkWrite failed');
  });

  await test('GET /api/attendance - Read filtered attendance records', async () => {
    const res = await axios.get(`${BASE_URL}/attendance?studentId=${testStudentId}`, { headers });
    if (!Array.isArray(res.data) || res.data.length === 0) throw new Error('No attendance found');
    testAttendanceId = res.data[0]._id;
  });

  await test('PUT /api/attendance/:id - Update attendance record', async () => {
    const res = await axios.put(`${BASE_URL}/attendance/${testAttendanceId}`, {
      status: 'Absent'
    }, { headers });
    if (res.data.status !== 'Absent') throw new Error('Status not updated to Absent');
  });

  await test('RBAC Security: Student Forbidden from Marking Attendance (HTTP 403)', async () => {
    try {
      await axios.post(`${BASE_URL}/attendance`, [
        {
          studentId: testStudentId,
          subjectId: testSubjectId,
          date: new Date().toISOString().split('T')[0],
          status: 'Present',
          classId: testClassId
        }
      ], { headers: { 'x-auth-token': studentToken } });
      throw new Error('Student should NOT be able to mark attendance!');
    } catch (err) {
      if (err.response?.status !== 403) throw err;
      console.log('    [VERIFIED RBAC] Student write rejected with HTTP 403 Forbidden');
    }
  });

  // 7. ALL 6 RUBRIC AGGREGATION PIPELINES
  console.log('\n--- 7. ADVANCED MONGODB AGGREGATION PIPELINES ---');
  await test('Aggregation 1: GET /api/analytics/summary', async () => {
    const res = await axios.get(`${BASE_URL}/analytics/summary`, { headers });
    if (res.data.totalStudents < 50) throw new Error('Total students below expectation');
    if (res.data.totalRecords < 1000) throw new Error('Total records below 1000');
    console.log(`    Total Records: ${res.data.totalRecords}, Avg Attendance: ${res.data.overallPercentage}%`);
  });

  await test('Aggregation 2: GET /api/analytics/student-percentage', async () => {
    const res = await axios.get(`${BASE_URL}/analytics/student-percentage`, { headers });
    if (!Array.isArray(res.data) || res.data.length === 0) throw new Error('Empty student-percentage');
    console.log(`    Aggregated ${res.data.length} student attendance percentages`);
  });

  await test('Aggregation 3: GET /api/analytics/subject-percentage', async () => {
    const res = await axios.get(`${BASE_URL}/analytics/subject-percentage`, { headers });
    if (!Array.isArray(res.data) || res.data.length === 0) throw new Error('Empty subject-percentage');
    console.log(`    Aggregated ${res.data.length} subject percentages`);
  });

  await test('Aggregation 4: GET /api/analytics/daily-stats', async () => {
    const res = await axios.get(`${BASE_URL}/analytics/daily-stats`, { headers });
    if (!Array.isArray(res.data) || res.data.length === 0) throw new Error('Empty daily stats');
    console.log(`    Aggregated ${res.data.length} daily time-series intervals`);
  });

  await test('Aggregation 5: GET /api/analytics/low-attendance?threshold=75', async () => {
    const res = await axios.get(`${BASE_URL}/analytics/low-attendance?threshold=75`, { headers });
    if (typeof res.data.count !== 'number') throw new Error('Low attendance count missing');
    console.log(`    Found ${res.data.count} students below 75% attendance threshold`);
  });

  await test('Aggregation 6: GET /api/analytics/monthly-report', async () => {
    const res = await axios.get(`${BASE_URL}/analytics/monthly-report`, { headers });
    if (!Array.isArray(res.data) || res.data.length === 0) throw new Error('Monthly report empty');
    console.log(`    Aggregated ${res.data.length} calendar month periods`);
  });

  await test('Aggregation 7: GET /api/analytics/section-stats', async () => {
    const res = await axios.get(`${BASE_URL}/analytics/section-stats`, { headers });
    if (!Array.isArray(res.data) || res.data.length === 0) throw new Error('Section stats empty');
    console.log(`    Aggregated sections: ${res.data.map(s => `Sec ${s.section}: ${s.percentage}%`).join(', ')}`);
  });

  // 7.5. MULTI-TENANT ROLE DATA ISOLATION TESTS
  console.log('\n--- 7.5. MULTI-TENANT ROLE DATA ISOLATION (RBAC SCOPING) ---');
  await test('Student Data Isolation: GET /api/attendance returns ONLY own records', async () => {
    const res = await axios.get(`${BASE_URL}/attendance`, {
      headers: { 'x-auth-token': studentToken }
    });
    if (!Array.isArray(res.data) || res.data.length === 0) throw new Error('No attendance returned for student');
    const foreignLeak = res.data.some(r => r.studentId?.regNo && r.studentId.regNo !== '24BCE0404');
    if (foreignLeak) throw new Error('DATA LEAK: Student received attendance of another student!');
    console.log(`    [VERIFIED] Student accessed ${res.data.length} personal records; zero foreign student records leaked`);
  });

  await test('Student Directory Isolation: GET /api/students returns ONLY own profile', async () => {
    const res = await axios.get(`${BASE_URL}/students`, {
      headers: { 'x-auth-token': studentToken }
    });
    if (!Array.isArray(res.data)) throw new Error('Invalid response');
    if (res.data.length !== 1 || res.data[0].regNo !== '24BCE0404') {
      throw new Error(`Expected exactly 1 student record for 24BCE0404, got ${res.data.length}`);
    }
    console.log(`    [VERIFIED] Student directory strictly restricted to self (24BCE0404)`);
  });

  await test('Faculty Course Scoping: GET /api/subjects returns ONLY assigned courses', async () => {
    const res = await axios.get(`${BASE_URL}/subjects`, {
      headers: { 'x-auth-token': facultyToken }
    });
    if (!Array.isArray(res.data) || res.data.length === 0) throw new Error('No subjects for faculty');
    const unauthorizedCourse = res.data.some(s => s.facultyId?.email && s.facultyId.email !== 'faculty@example.com');
    if (unauthorizedCourse) throw new Error('Faculty received courses taught by another faculty!');
    console.log(`    [VERIFIED] Faculty only accessed their assigned course(s): ${res.data.map(s => s.subjectCode).join(', ')}`);
  });

  await test('Admin Global Access: Admin retrieves unconstrained institutional data', async () => {
    const [studentsRes, subjectsRes] = await Promise.all([
      axios.get(`${BASE_URL}/students`, { headers }),
      axios.get(`${BASE_URL}/subjects`, { headers })
    ]);
    if (studentsRes.data.length < 50) throw new Error('Admin did not receive full cohort');
    if (subjectsRes.data.length < 5) throw new Error('Admin did not receive all courses');
    console.log(`    [VERIFIED] Admin accessed global state: ${studentsRes.data.length} students & ${subjectsRes.data.length} courses`);
  });

  await test('Student Analytics Lockout: GET /api/analytics/monthly-report rejected with HTTP 403', async () => {
    try {
      await axios.get(`${BASE_URL}/analytics/monthly-report`, {
        headers: { 'x-auth-token': studentToken }
      });
      throw new Error('SECURITY BREACH: Student was able to access institutional monthly reports!');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('    [VERIFIED RBAC] Student access to institutional analytics rejected with HTTP 403 Forbidden');
        return;
      }
      throw err;
    }
  });

  // 8. CLEANUP TEST DATA (DELETE CRUD)
  console.log('\n--- 8. CLEANUP / DELETE CRUD OPERATIONS ---');
  await test('DELETE /api/attendance/:id - Delete test attendance', async () => {
    await axios.delete(`${BASE_URL}/attendance/${testAttendanceId}`, { headers });
  });

  await test('DELETE /api/students/:id - Delete test student & cascade delete', async () => {
    await axios.delete(`${BASE_URL}/students/${testStudentId}`, { headers });
  });

  await test('DELETE /api/classes/:id - Delete test class session', async () => {
    await axios.delete(`${BASE_URL}/classes/${testClassId}`, { headers });
  });

  await test('DELETE /api/subjects/:id - Delete test subject', async () => {
    await axios.delete(`${BASE_URL}/subjects/${testSubjectId}`, { headers });
  });

  await test('DELETE /api/faculty/:id - Delete test faculty', async () => {
    await axios.delete(`${BASE_URL}/faculty/${testFacultyId}`, { headers });
  });

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
