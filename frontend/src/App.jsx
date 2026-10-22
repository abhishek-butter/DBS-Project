import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import Analytics from './pages/Analytics';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  if (!token) {
    return <Login setToken={setToken} />;
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isStudent = user.role === 'student';

  return (
    <Router>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar setToken={setToken} />
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route 
              path="/analytics" 
              element={isStudent ? <Navigate to="/" replace /> : <Analytics />} 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;