import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Save } from 'lucide-react';

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [status, setStatus] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'x-auth-token': token };

        const [studentsRes, subjectsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/students', { headers }),
          axios.get('http://localhost:5000/api/subjects', { headers })
        ]);

        setStudents(studentsRes.data);
        setSubjects(subjectsRes.data);

        if (subjectsRes.data.length > 0) {
            setSelectedSubject(subjectsRes.data[0]._id);
        }

        const initialStatus = {};
        studentsRes.data.forEach(s => { initialStatus[s._id] = 'Present'; });
        setStatus(initialStatus);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!selectedSubject) {
        alert("Please select a subject first!");
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const records = students.map(s => ({
            studentId: s._id,
            subjectId: selectedSubject,
            date: date,
            status: status[s._id]
        }));
        await axios.post('http://localhost:5000/api/attendance', records, {
            headers: { 'x-auth-token': token }
        });
        alert('Attendance marked successfully! Overlapping/duplicate submissions on the same day for this subject are automatically overwritten.');
    } catch (err) {
        alert('Error saving attendance');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Mark Attendance</h1>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-6 items-end">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-600 mb-2">Subject</label>
          <select 
            className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
          >
            {subjects.map(sub => (
                <option key={sub._id} value={sub._id}>{sub.subjectName} ({sub.subjectCode})</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-600 mb-2">Date</label>
          <input 
            type="date" 
            value={date} 
            onChange={e=>setDate(e.target.value)} 
            className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" 
          />
        </div>

        <button 
            onClick={handleSubmit} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-md shadow-blue-200 h-12"
        >
            <Save size={20} />
            Save Attendance
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-6 py-4 border-b border-gray-100 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Reg No</th>
              <th className="px-6 py-4 border-b border-gray-100 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 border-b border-gray-100 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 border-b border-gray-100 text-sm font-medium text-gray-900">{s.regNo}</td>
                <td className="px-6 py-4 border-b border-gray-100 text-sm text-gray-600">{s.name}</td>
                <td className="px-6 py-4 border-b border-gray-100 text-sm">
                  <select 
                    className={`border p-2 rounded-lg font-medium outline-none ${
                        status[s._id] === 'Present' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
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
    </div>
  );
};
export default Attendance;