import React, { useEffect, useState } from 'react';
import api from '../api';
import { 
  Save, CheckCheck, XCircle, Search, Filter, 
  CheckCircle2, AlertCircle, Calendar, BookOpen, Clock 
} from 'lucide-react';

const Attendance = () => {
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

  useEffect(() => {
    fetchInitialData();
  }, []);

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

      // Initialize all to Present
      const initialMap = {};
      studentData.forEach((s) => {
        initialMap[s._id] = 'Present';
      });
      setStatusMap(initialMap);
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

  const filteredStudents = students.filter((s) => {
    const matchesSection = sectionFilter === 'All' || s.section === sectionFilter;
    const matchesSearch = 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.regNo.toLowerCase().includes(search.toLowerCase());
    return matchesSection && matchesSearch;
  });

  const markAll = (newStatus) => {
    const updated = { ...statusMap };
    filteredStudents.forEach((s) => {
      updated[s._id] = newStatus;
    });
    setStatusMap(updated);
    showNotification('success', `Marked all visible students as ${newStatus}`);
  };

  const toggleStatus = (id) => {
    setStatusMap((prev) => ({
      ...prev,
      [id]: prev[id] === 'Present' ? 'Absent' : 'Present'
    }));
  };

  const presentCount = filteredStudents.filter((s) => statusMap[s._id] === 'Present').length;
  const absentCount = filteredStudents.length - presentCount;
  const percentage = filteredStudents.length > 0 
    ? Math.round((presentCount / filteredStudents.length) * 100) 
    : 0;

  const handleSubmit = async () => {
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
      showNotification('error', 'Failed to save attendance records.');
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Bulk Roll Call
            </span>
            <span className="text-xs text-gray-500">Atomic MongoDB BulkWrite ($upsert)</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mark Attendance</h1>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving || filteredStudents.length === 0}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-200 transition"
        >
          <Save size={18} />
          {saving ? 'Saving Records...' : 'Save Attendance'}
        </button>
      </div>

      {/* Control Panel Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* Subject Select */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
            <BookOpen size={14} className="text-blue-600" />
            Subject / Course
          </label>
          <select
            className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            {subjects.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.subjectName} ({sub.subjectCode})
              </option>
            ))}
          </select>
        </div>

        {/* Date Picker */}
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

        {/* Section Filter & Fast Toggles */}
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
      </div>

      {/* Attendance Stats Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
            <span className="text-sm font-medium">Present: <strong className="text-emerald-400 font-bold">{presentCount}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400"></span>
            <span className="text-sm font-medium">Absent: <strong className="text-red-400 font-bold">{absentCount}</strong></span>
          </div>
          <div className="pl-4 border-l border-slate-700">
            <span className="text-xs text-slate-400">Class Turnout: </span>
            <strong className="text-blue-400 text-base">{percentage}%</strong>
          </div>
        </div>

        {/* Quick Batch Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <input
              type="text"
              placeholder="Quick search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 text-xs text-white pl-8 pr-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none"
            />
            <Search className="absolute left-2.5 top-2 text-slate-400" size={12} />
          </div>

          <button
            onClick={() => markAll('Present')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition border border-emerald-500/30"
          >
            <CheckCheck size={14} />
            All Present
          </button>
          <button
            onClick={() => markAll('Absent')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 text-red-300 hover:bg-red-500/30 transition border border-red-500/30"
          >
            <XCircle size={14} />
            All Absent
          </button>
        </div>
      </div>

      {/* Student List */}
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
                      <td className="py-3 px-6 font-medium text-gray-900">{s.name}</td>
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
    </div>
  );
};

export default Attendance;