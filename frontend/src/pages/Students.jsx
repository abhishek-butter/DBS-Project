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