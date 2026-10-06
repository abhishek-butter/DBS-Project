# Student Attendance Management System

This is a production-ready Web Application based on the BCSE302P Database Systems Lab Project Rubric.

## Tech Stack
- **Frontend**: React.js, Tailwind CSS, Recharts (for analytics), React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure
- \`backend/\`: Contains the Node.js/Express API, MongoDB Mongoose models, and authentication logic.
- \`frontend/\`: Contains the React.js application with Tailwind CSS.

## Prerequisites
1. **Node.js** installed on your system.
2. **MongoDB** installed and running locally on port \`27017\`, OR a MongoDB Atlas cluster. 
*(If using MongoDB Atlas, update the \`MONGO_URI\` in \`backend/.env\`)*

## How to Setup and Run

### 1. Database Seeding
To meet the rubric requirements of having 100+ documents, a seed script is provided. Ensure your MongoDB instance is running, then execute:
\`\`\`bash
cd backend
node seed.js
\`\`\`
*This will create the Admin user, 100 Students, 5 Faculty members, a Subject, a Class, and 100 Attendance records.*

### 2. Start the Backend Server
\`\`\`bash
cd backend
npm run start # or node server.js
\`\`\`
The backend will run on \`http://localhost:5000\`.

### 3. Start the Frontend Development Server
\`\`\`bash
cd frontend
npm run dev
\`\`\`
The frontend will start (usually on \`http://localhost:5173\`).

## Default Credentials (After Seeding)
- **Email**: admin@example.com
- **Password**: password123

## Features Implemented from Rubric
- **Minimum 5 Collections**: Users, Students, Faculty, Subjects, Classes, Attendance (6 implemented).
- **100+ Sample Documents**: Automated via \`seed.js\`.
- **CRUD Operations**: Handled via Express Routes and React UI.
- **5 Aggregation Queries**: 
  - Student attendance percentage
  - Subject-wise percentage
  - Daily stats
  - Available via \`/api/analytics\` endpoints and visualized with Recharts on the Dashboard.
- **Indexes**: Implemented on `regNo` (Unique) and Compound indexes on `studentId, subjectId, date`.
- **Authentication**: JWT Based Auth implemented.
- **Responsive UI**: Built with Tailwind CSS.

Enjoy your production-ready project!
