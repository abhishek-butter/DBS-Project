import React, { useEffect, useState } from 'react';
import api from '../api';
import { 
  Save, CheckCheck, XCircle, Search, Filter, 
  CheckCircle2, AlertCircle, Calendar, BookOpen, Clock,
  Lock, ShieldAlert, UserCheck, Eye, GraduationCap, Check, X
} from 'lucide-react';

const Attendance = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isStudent = user.role === 'student';
  const isFaculty = user.role === 'faculty';
  const isAdmin = user.role === 'admin';

  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [statusMap, setStatusMap] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Student-specific state for personal attendance ledger
  const [studentHistory, setStudentHistory] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // For faculty/admin: When subject or date changes, load the existing attendance status from MongoDB
  useEffect(() => {
    if (!isStudent && selectedSubject && date && students.length > 0) {
      fetchExistingSessionAttendance();
    }
  }, [selectedSubject, date, students, isStudent]);

  // For student: When subject selection changes, fetch personal attendance history
  useEffect(() => {
    if (isStudent) {
      fetchStudentPersonalHistory();
    }
  }, [selectedSubject, isStudent]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [studentsRes, subjectsRes] = await Promise.all([
        api.get('/students'),
        api.get('/subjects')
      ]);

      const studentData = studentsRes.data.students || studentsRes.data;
      setStudents(studentData);
      setSubjects(subjectsRes.data);

      if (subjectsRes.data.length > 0) {
        setSelectedSubject(subjectsRes.data[0]._id);
      }
    } catch (err) {
      console.error('Attendance initial data fetch error:', err);
      if (err.response?.status === 401) {
        showNotification('error', 'Session expired. Please sign in again.');
      } else {
        showNotification('error', 'Failed to load class and student data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentPersonalHistory = async () => {
    try {
      setLoading(true);
      const url = selectedSubject 
        ? `/attendance?subjectId=${selectedSubject}&limit=500` 
        : `/attendance?limit=500`;
      const res = await api.get(url);
      setStudentHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch student personal attendance history:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingSessionAttendance = async () => {
    try {
      const res = await api.get(`/attendance?subjectId=${selectedSubject}&date=${date}&limit=500`);
      const existingRecords = res.data;

      const newMap = {};
      // Default all to Present
      students.forEach((s) => {
        newMap[s._id] = 'Present';
      });

      // Override with actual recorded statuses in MongoDB
      if (Array.isArray(existingRecords) && existingRecords.length > 0) {
        existingRecords.forEach((rec) => {
          const sId = rec.studentId?._id || rec.studentId;
          if (sId) {
            newMap[sId] = rec.status;
          }
        });
      }

      setStatusMap(newMap);
    } catch (err) {
      console.error('Failed to fetch existing session attendance:', err);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSection = sectionFilter === 'All' || s.section === sectionFilter;
    const matchesSearch = 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.regNo.toLowerCase().includes(search.toLowerCase());
    return matchesSection && matchesSearch;
  });

  const markAll = (newStatus) => {
    if (isStudent) {
      showNotification('error', 'Access Denied: Students are not permitted to mark attendance.');
      return;
    }
    const updated = { ...statusMap };
    filteredStudents.forEach((s) => {
      updated[s._id] = newStatus;
    });
    setStatusMap(updated);
    showNotification('success', `Marked all visible students as ${newStatus}`);
  };

  const toggleStatus = (id) => {
    if (isStudent) {
      showNotification('error', 'Access Denied: Only faculty and administrators can modify attendance.');
      return;
    }
    setStatusMap((prev) => ({
      ...prev,
      [id]: prev[id] === 'Present' ? 'Absent' : 'Present'
    }));
  };

  // Faculty/Admin counts for current session
  const presentCount = filteredStudents.filter((s) => statusMap[s._id] === 'Present').length;
  const absentCount = filteredStudents.length - presentCount;
  const percentage = filteredStudents.length > 0 
    ? Math.round((presentCount / filteredStudents.length) * 100) 
    : 0;

  // Student Personal Summary counts across all sessions
  const studentTotalSessions = studentHistory.length;
  const studentPresentCount = studentHistory.filter((r) => r.status === 'Present').length;
  const studentAbsentCount = studentTotalSessions - studentPresentCount;
  const studentPercentage = studentTotalSessions > 0
    ? Math.round((studentPresentCount / studentTotalSessions) * 100)
    : 0;

  const handleSubmit = async () => {
    if (isStudent) {
      showNotification('error', 'Access Denied: Students cannot mark or submit attendance.');
      return;
    }

    if (!selectedSubject) {
      showNotification('error', 'Please select a subject first!');
      return;
    }

    try {
      setSaving(true);
      const records = filteredStudents.map((s) => ({
        studentId: s._id,
        subjectId: selectedSubject,
        date: date,
        status: statusMap[s._id] || 'Present'
      }));

      await api.post('/attendance', records);
      showNotification('success', `Successfully saved attendance for ${records.length} students!`);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        showNotification('error', err.response?.data?.error || 'Forbidden: Access Denied.');
      } else {
        showNotification('error', 'Failed to save attendance records.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white font-medium transition-all ${
          notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Role Scoping Banner */}
      {isStudent ? (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md border border-blue-800">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-blue-700/60 rounded-xl text-blue-200 shadow-inner">
              <ShieldAlert size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white tracking-wide">STUDENT PORTAL &bull; PERSONAL ATTENDANCE ACCESS ONLY</h4>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase rounded-md border border-emerald-500/30">
                  Isolated Scope
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-1 max-w-2xl">
                Multi-Tenant Data Isolation Active: You can only view your own attendance records. You cannot view other students' records, and marking permissions are locked to authorized faculty.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white/10 rounded-xl text-xs font-bold text-blue-200 backdrop-blur-sm border border-white/10 self-start md:self-auto">
            <Lock size={14} /> My Records Only
          </div>
        </div>
      ) : isFaculty ? (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-md border border-purple-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-700/60 rounded-xl text-purple-200">
              <GraduationCap size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">FACULTY PORTAL &bull; COURSE-SCOPED ATTENDANCE</h4>
              <p className="text-xs text-purple-200">
                You have authorized access to mark and view attendance for your assigned courses only.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-200 text-xs font-bold rounded-lg border border-purple-400/30">
            Role: Faculty
          </span>
        </div>
      ) : null}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isStudent ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {isStudent ? 'Personal Attendance Ledger' : 'Bulk Roll Call'}
            </span>
            <span className="text-xs text-gray-500">
              {isStudent ? 'Query Scoped to Your Student ID' : 'Atomic MongoDB BulkWrite ($upsert)'}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {isStudent ? 'My Attendance Ledger' : 'Mark Attendance'}
          </h1>
        </div>

        {/* Action Button / Role Status */}
        {isStudent ? (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-sm">
            <Eye size={16} className="text-blue-600" />
            <span>Personal View (Read-Only)</span>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={saving || filteredStudents.length === 0}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-200 transition"
          >
            <Save size={18} />
            {saving ? 'Saving Records...' : 'Save Attendance'}
          </button>
        )}
      </div>

      {/* Control Panel Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* Subject Select */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
            <BookOpen size={14} className="text-blue-600" />
            {isFaculty ? 'My Assigned Course' : isStudent ? 'Filter by Course' : 'Subject / Course'}
          </label>
          <select
            className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            {isStudent && <option value="">All Enrolled Courses</option>}
            {subjects.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.subjectName} ({sub.subjectCode})
              </option>
            ))}
          </select>
        </div>

        {/* Session Date (For Faculty / Admin) */}
        {!isStudent && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
              <Calendar size={14} className="text-blue-600" />
              Session Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}

        {/* Section Filter (For Faculty / Admin) */}
        {!isStudent && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
              <Filter size={14} className="text-blue-600" />
              Filter Section
            </label>
            <div className="flex gap-2">
              {['All', 'D1', 'D2'].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSectionFilter(sec)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                    sectionFilter === sec
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Student View Summary Tag */}
        {isStudent && (
          <div className="md:col-span-2 flex items-center justify-end">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center gap-4 text-xs">
              <span className="text-gray-500">Student Identity:</span>
              <span className="font-bold text-gray-900">{user.name}</span>
              <span className="font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">24BCE0404</span>
            </div>
          </div>
        )}
      </div>

      {/* STATS BAR */}
      {isStudent ? (
        /* Student Personal Stats Bar */
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Sessions</p>
            <h3 className="text-2xl font-black text-white">{studentTotalSessions}</h3>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Attended</p>
            <h3 className="text-2xl font-black text-emerald-400">{studentPresentCount}</h3>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Missed</p>
            <h3 className="text-2xl font-black text-red-400">{studentAbsentCount}</h3>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">My Attendance</p>
            <h3 className={`text-2xl font-black ${
              studentPercentage >= 75 ? 'text-blue-400' : 'text-amber-400'
            }`}>
              {studentPercentage}%
              <span className="text-xs font-normal text-slate-300 ml-2">
                {studentPercentage >= 75 ? '(Safe ≥ 75%)' : '(Defaulter Alert)'}
              </span>
            </h3>
          </div>
        </div>
      ) : (
        /* Faculty / Admin Session Stats Bar */
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live Roll-Call
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
              <span className="text-sm font-medium">Present: <strong className="text-emerald-400 font-bold">{presentCount}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400"></span>
              <span className="text-sm font-medium">Absent: <strong className="text-red-400 font-bold">{absentCount}</strong></span>
            </div>
            <div className="pl-4 border-l border-slate-700">
              <span className="text-xs text-slate-400">Session Turnout: </span>
              <strong className="text-blue-400 text-base">{percentage}%</strong>
            </div>
          </div>

          {/* Quick Batch Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-56">
              <input
                type="text"
                placeholder="Search student or Reg No..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800 text-xs text-white pl-8 pr-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
            </div>

            <button
              onClick={() => markAll('Present')}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition border border-emerald-500/30"
            >
              <CheckCheck size={14} />
              All Present
            </button>
            <button
              onClick={() => markAll('Absent')}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-red-500/20 text-red-300 hover:bg-red-500/30 transition border border-red-500/30"
            >
              <XCircle size={14} />
              All Absent
            </button>
          </div>
        </div>
      )}

      {/* TABLE RENDERING */}
      {isStudent ? (
        /* STUDENT PERSONAL ATTENDANCE HISTORY TABLE */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm">Personal Attendance History Logs</h3>
            <span className="text-xs text-gray-500 font-medium">Showing {studentHistory.length} recorded session(s)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase font-semibold text-gray-500">
                  <th className="py-3.5 px-6">Lecture Date</th>
                  <th className="py-3.5 px-6">Course / Subject</th>
                  <th className="py-3.5 px-6 text-center">Room / Venue</th>
                  <th className="py-3.5 px-6 text-center">Attendance Status</th>
                  <th className="py-3.5 px-6 text-center">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {studentHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-gray-400">
                      No attendance records found for this course selection.
                    </td>
                  </tr>
                ) : (
                  studentHistory.map((rec) => {
                    const isPresent = rec.status === 'Present';
                    return (
                      <tr key={rec._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-6 font-mono font-medium text-gray-900">
                          {new Date(rec.date).toLocaleDateString(undefined, { 
                            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
                          })}
                        </td>
                        <td className="py-3 px-6">
                          <p className="font-bold text-gray-900">{rec.subjectId?.subjectName || 'Database Systems Lab'}</p>
                          <p className="text-xs text-gray-500 font-mono">{rec.subjectId?.subjectCode || 'BCSE302P'}</p>
                        </td>
                        <td className="py-3 px-6 text-center">
                          <span className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-slate-100 text-slate-700">
                            {rec.classId?.room || 'SJT-G01'}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            isPresent 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {isPresent ? <Check size={12} /> : <X size={12} />}
                            {rec.status}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-center">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                            <CheckCircle2 size={13} /> Official Record
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* FACULTY & ADMIN CLASS ROSTER MARKING TABLE */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-semibold text-gray-500">
                  <th className="py-4 px-6">Reg No</th>
                  <th className="py-4 px-6">Student Name</th>
                  <th className="py-4 px-6 text-center">Section</th>
                  <th className="py-4 px-6 text-center">Attendance Status</th>
                  <th className="py-4 px-6 text-center">Quick Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-gray-400">
                      No students match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => {
                    const isPresent = statusMap[s._id] === 'Present';
                    return (
                      <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-6 font-mono font-medium text-gray-900">{s.regNo}</td>
                        <td className="py-3 px-6 font-medium text-gray-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                              {s.name ? s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'ST'}
                            </div>
                            <span>{s.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-6 text-center">
                          <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-slate-100 text-slate-700">
                            {s.section}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-center">
                          <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold transition-all ${
                            isPresent 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {statusMap[s._id] || 'Present'}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-center">
                          <button
                            onClick={() => toggleStatus(s._id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                              isPresent
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}
                          >
                            Mark as {isPresent ? 'Absent' : 'Present'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;