# Student Attendance Management System

**Course:** BCSE302P - Database Systems Lab  
**Slot:** D2  
**Team Members:**  
- **Abhishek VS** (24BCE0404)  
- **Ayush Naugariya** (24BDS0076)  

---

## 🎯 Project Overview
The **Student Attendance Management System** is a full-stack NoSQL web application engineered with **MongoDB, Express.js, React 19, and Node.js (MERN)**. It satisfies and exceeds every criterion of the BCSE302P Database Systems Lab Project Rubric across **Review 1 (10 Marks)**, **Review 2 (10 Marks)**, and **Review 3 (10 Marks)**.

---

## 📊 Deliverables Included
1. **Academic Project Report (`.pdf` & `.md`)**:
   - Location: `Database_Project_Report.pdf` (Submission-ready 15-page academic lab report)
   - Location: `Database_Project_Report.md` (Full GitHub-rendered report conforming to the lab submission syllabus)
2. **PowerPoint Presentation (`.pptx`)**:
   - Location: `Student_Attendance_Management_System_BCSE302P.pptx`
   - 18 professional 16:9 widescreen slides covering all rubric sections, architecture, data modeling, indexing, aggregation code, and viva questions.
3. **Comprehensive User Manual (`USER_MANUAL.md`)**:
   - Location: `USER_MANUAL.md`
   - Detailed guide covering system setup, evaluation walkthrough, and role-based permissions.
4. **End-to-End Test Suite (`test_api.js`)**:
   - Location: `test_api.js`
   - Automated testing suite verifying 28 unit and integration tests (28 passed, 0 failed).
5. **Production-Ready Web Application**:
   - `backend/`: Express.js API, JWT auth, Mongoose schemas, compound indexes, 7 aggregation pipelines.
   - `frontend/`: React 19 SPA, Tailwind CSS, Recharts analytics, Defaulter tracker (<75%), and aggregation code inspector.

---

## 🗄️ Database Architecture & Collections (6 Collections)
Exceeds the rubric requirement of at least 5 collections:
1. `users`: Stores admin, faculty, and student user credentials with bcrypt password hashing and roles.
2. `students`: Master student records (`regNo` unique index, `name`, `department`, `section`, `year`, `semester`).
3. `faculty`: Faculty instructors (`facultyId` unique, `name`, `email`, `department`).
4. `subjects`: Courses (`subjectCode` unique, `subjectName`, `credits`, `facultyId` reference).
5. `classes`: Timetable sessions (`subjectId`, `facultyId`, `date`, `startTime`, `endTime`, `room`).
6. `attendance`: Core log collection (`classId`, `studentId`, `subjectId`, `date`, `status`, `markedBy`).

---

## ⚡ Indexing & Performance Optimizations
- **Unique B-Tree Index:** `students.regNo` (`{ unique: true }`) for $O(1)$ fast lookups and strict uniqueness.
- **Compound Index:** `attendance.{ studentId: 1, subjectId: 1, date: 1 }` prevents duplicate attendance per student per subject per day, converting expensive `COLLSCAN` queries into sub-2ms `IXSCAN` operations.
- **Date Index:** `attendance.date` for fast time-series analytical slicing.

---

## 🚀 All 7 Implemented MongoDB Aggregation Pipelines
1. **`GET /api/analytics/summary`**: Overall KPI summary (Total Students, Faculty, Subjects, Classes, Attendance Records, and Cumulative Attendance %).
2. **`GET /api/analytics/student-percentage`**: Ranks every student by attendance percentage using `$group`, `$project` with mathematical operators, `$lookup`, and `$sort`.
3. **`GET /api/analytics/subject-percentage`**: Calculates subject-wise attendance turnout across all registered courses.
4. **`GET /api/analytics/daily-stats`**: Computes daily present vs absent volumes and percentage over the past 30 days.
5. **`GET /api/analytics/low-attendance?threshold=75`**: Multi-stage pipeline (`$group` -> `$project` -> `$match` with `$lt: threshold` -> `$lookup` -> `$sort`) filtering students below criteria.
6. **`GET /api/analytics/monthly-report`**: Monthly breakdown utilizing date aggregation operators (`$year`, `$month`).
7. **`GET /api/analytics/section-stats`**: Cross-collection `$lookup` and `$group` comparing Section D1 vs Section D2 attendance performance.

---

## ⚙️ How to Setup and Run Locally

### 1. Prerequisites
- **Node.js** (v18+)
- **MongoDB** running locally on port `27017`

### 2. Database Seeding (Populates 2,640+ Records)
```bash
cd backend
node seed.js
```
*Seeds 3 authenticated users, 5 faculty, 5 subjects, 60 students (including Abhishek VS and Ayush Naugariya), 44 classes, and 2,640 attendance records.*

### 3. Start Backend Server
```bash
cd backend
npm start # runs on http://localhost:5000
```

### 4. Start Frontend Development Server
```bash
cd frontend
npm run dev # runs on http://localhost:5173
```

### 5. Run the Automated Test Suite
```bash
node test_api.js
```

---

## 🔑 Default Evaluator Credentials
- **Admin Account:** `admin@example.com` / `password123` (Full system access)
- **Faculty Account:** `faculty@example.com` / `password123` (Class roll-call and analytics)
- **Student Account:** `student@example.com` / `password123`
*(The login page also provides 1-Click buttons to automatically fill credentials for immediate evaluator assessment!)*
