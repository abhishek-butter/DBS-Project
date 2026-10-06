const fs = require('fs');
const path = require('path');

const frontendPath = path.join(__dirname, 'frontend');

const files = {
  'tailwind.config.js': `
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
  `,
  'postcss.config.js': `
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
  `,
  'src/index.css': `
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f3f4f6;
}
  `,
  'src/App.jsx': `
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';
import Students from './pages/Students';
import Attendance from './pages/Attendance';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar setToken={setToken} />
        <div className="flex-1 overflow-auto p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
export default App;
  `,
  'src/components/Sidebar.jsx': `
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ setToken }) => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
  };

  return (
    <div className="w-64 bg-white shadow-md flex flex-col justify-between h-full">
      <div>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">Attendance DB</h1>
        </div>
        <nav className="mt-6 flex flex-col gap-2 px-4">
          <Link to="/" className="p-2 rounded hover:bg-gray-100 font-medium">Dashboard</Link>
          <Link to="/students" className="p-2 rounded hover:bg-gray-100 font-medium">Students</Link>
          <Link to="/attendance" className="p-2 rounded hover:bg-gray-100 font-medium">Mark Attendance</Link>
        </nav>
      </div>
      <div className="p-4 border-t">
        <button onClick={handleLogout} className="w-full bg-red-500 text-white p-2 rounded">Logout</button>
      </div>
    </div>
  );
};
export default Sidebar;
  `,
  'src/pages/Login.jsx': `
import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
    } catch (err) {
      alert('Login failed. Run the seed script and try with admin@example.com / password123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl mb-4 font-bold text-center">Login</h2>
        <input className="w-full mb-3 p-2 border rounded" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="w-full mb-4 p-2 border rounded" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="w-full bg-blue-500 text-white p-2 rounded" type="submit">Sign In</button>
      </form>
    </div>
  );
};
export default Login;
  `,
  'src/pages/Dashboard.jsx': `
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/analytics/daily-stats', {
          headers: { 'x-auth-token': token }
        });
        const formatted = res.data.map(d => ({
            date: new Date(d._id).toLocaleDateString(),
            Present: d.totalPresent,
            Absent: d.totalAbsent
        }));
        setStats(formatted);
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="bg-white p-6 rounded shadow-md h-96">
        <h2 className="text-xl mb-4 font-semibold">Daily Attendance Stats</h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Present" fill="#10B981" />
            <Bar dataKey="Absent" fill="#EF4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default Dashboard;
  `,
  'src/pages/Students.jsx': `
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Students = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/students', {
          headers: { 'x-auth-token': token }
        });
        setStudents(res.data);
      } catch (err) { console.error(err); }
    };
    fetchStudents();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Students List</h1>
      <div className="bg-white rounded shadow-md overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reg No</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dept</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s._id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{s.regNo}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{s.name}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{s.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Students;
  `,
  'src/pages/Attendance.jsx': `
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [status, setStatus] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/students', {
          headers: { 'x-auth-token': token }
        });
        setStudents(res.data);
        const initialStatus = {};
        res.data.forEach(s => { initialStatus[s._id] = 'Present'; });
        setStatus(initialStatus);
      } catch (err) { console.error(err); }
    };
    fetchStudents();
  }, []);

  const handleSubmit = async () => {
    try {
        const token = localStorage.getItem('token');
        const records = students.map(s => ({
            studentId: s._id,
            date: date,
            status: status[s._id]
        }));
        await axios.post('http://localhost:5000/api/attendance', records, {
            headers: { 'x-auth-token': token }
        });
        alert('Attendance marked successfully!');
    } catch (err) {
        alert('Error saving attendance');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Mark Attendance</h1>
      <div className="mb-4">
        <label className="font-semibold mr-2">Date:</label>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="border p-2 rounded" />
      </div>
      <div className="bg-white rounded shadow-md overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reg No</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s._id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{s.regNo}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{s.name}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <select 
                    className="border p-1 rounded"
                    value={status[s._id]}
                    onChange={(e) => setStatus({...status, [s._id]: e.target.value})}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={handleSubmit} className="mt-4 bg-blue-500 text-white px-6 py-2 rounded">Save Attendance</button>
    </div>
  );
};
export default Attendance;
  `
};

// Create dirs
['src/pages', 'src/components'].forEach(dir => {
    fs.mkdirSync(path.join(frontendPath, dir), { recursive: true });
});

for (const [filepath, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(frontendPath, filepath), content.trim());
}
console.log('Frontend scaffolding complete.');
