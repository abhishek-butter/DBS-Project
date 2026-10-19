import React, { useEffect, useState } from 'react';
import api from '../api';
import { 
  Users, Search, Plus, Filter, Edit2, Trash2, 
  Eye, CheckCircle2, XCircle, AlertCircle, X, ChevronLeft, ChevronRight 
} from 'lucide-react';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    regNo: '',
    name: '',
    email: '',
    department: 'Computer Science',
    year: 3,
    section: 'D2',
    semester: 5
  });

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [page, sectionFilter]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchStudents = async (customSearch = search) => {
    setLoading(true);
    try {
      const url = `/students?page=${page}&limit=12&search=${encodeURIComponent(customSearch)}&section=${sectionFilter}`;
      const res = await api.get(url);
      if (res.data.students) {
        setStudents(res.data.students);
        setTotalStudents(res.data.total);
        setTotalPages(res.data.pages);
      } else {
        setStudents(res.data);
      }
    } catch (err) {
      console.error(err);
      showNotification('error', 'Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents(search);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/students', formData);
      setIsAddModalOpen(false);
      showNotification('success', `Student ${formData.name} added successfully!`);
      setFormData({
        regNo: '',
        name: '',
        email: '',
        department: 'Computer Science',
        year: 3,
        section: 'D2',
        semester: 5
      });
      fetchStudents();
    } catch (err) {
      showNotification('error', err.response?.data?.error || 'Failed to add student');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/students/${selectedStudent._id}`, formData);
      setIsEditModalOpen(false);
      showNotification('success', `Student ${formData.name} updated successfully!`);
      fetchStudents();
    } catch (err) {
      showNotification('error', err.response?.data?.error || 'Failed to update student');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete student ${name}? All linked attendance records will also be removed.`)) {
      try {
        await api.delete(`/students/${id}`);
        showNotification('success', `Student ${name} deleted.`);
        fetchStudents();
      } catch (err) {
        showNotification('error', 'Failed to delete student');
      }
    }
  };

  const handleViewDetail = async (student) => {
    setSelectedStudent(student);
    try {
      const res = await api.get(`/students/${student._id}`);
      setStudentDetail(res.data);
      setIsDetailModalOpen(true);
    } catch (err) {
      showNotification('error', 'Could not load student attendance history');
    }
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      regNo: student.regNo,
      name: student.name,
      email: student.email,
      department: student.department,
      year: student.year,
      section: student.section,
      semester: student.semester
    });
    setIsEditModalOpen(true);
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
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              CRUD Operations
            </span>
            <span className="text-xs text-gray-500">Total Enrolled: {totalStudents}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Student Directory</h1>
        </div>

        <button
          onClick={() => {
            setFormData({
              regNo: '24BCE' + Math.floor(1000 + Math.random() * 9000),
              name: '',
              email: '',
              department: 'Computer Science',
              year: 3,
              section: 'D2',
              semester: 5
            });
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-200 transition"
        >
          <Plus size={18} />
          Add New Student
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full md:max-w-md relative">
          <input
            type="text"
            placeholder="Search by name, reg number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <Filter size={14} /> Section:
          </span>
          {['All', 'D1', 'D2'].map((sec) => (
            <button
              key={sec}
              onClick={() => {
                setSectionFilter(sec);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
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

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-semibold text-gray-500">
                <th className="py-4 px-6">Reg No</th>
                <th className="py-4 px-6">Student Name</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6 text-center">Section</th>
                <th className="py-4 px-6 text-center">Year / Sem</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400">Loading student records...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400">No students found matching your criteria.</td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-mono font-semibold text-gray-900">{student.regNo}</td>
                    <td className="py-4 px-6 font-medium text-gray-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {student.name.charAt(0)}
                      </div>
                      {student.name}
                    </td>
                    <td className="py-4 px-6 text-gray-500">{student.email}</td>
                    <td className="py-4 px-6 text-gray-600">{student.department}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-50 text-blue-700">
                        {student.section}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-gray-500">
                      Year {student.year} / Sem {student.semester}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetail(student)}
                          title="View Attendance Breakdown"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openEditModal(student)}
                          title="Edit Details"
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(student._id, student.name)}
                          title="Delete Student"
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing Page <span className="font-bold text-gray-700">{page}</span> of <span className="font-bold text-gray-700">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ADD STUDENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Add New Student (Create CRUD)</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Registration No</label>
                  <input
                    type="text"
                    required
                    value={formData.regNo}
                    onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                    className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="student@vitstudent.ac.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="D1">D1</option>
                    <option value="D2">D2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Semester</label>
                  <input
                    type="number"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                    className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-200"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Edit Student Details (Update CRUD)</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Registration No</label>
                  <input
                    type="text"
                    disabled
                    value={formData.regNo}
                    className="w-full border border-gray-200 bg-gray-50 p-2.5 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="D1">D1</option>
                    <option value="D2">D2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Semester</label>
                  <input
                    type="number"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                    className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-200"
                >
                  Update Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT DETAIL / ATTENDANCE MODAL */}
      {isDetailModalOpen && studentDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-fade-in max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-start pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{studentDetail.student.name}</h3>
                <p className="text-xs text-gray-500">
                  {studentDetail.student.regNo} &bull; {studentDetail.student.department} &bull; Section {studentDetail.student.section}
                </p>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Attendance Summary Cards */}
            <div className="grid grid-cols-4 gap-3 my-4">
              <div className="bg-slate-50 p-3 rounded-xl text-center">
                <span className="text-xs text-gray-500 block">Total Classes</span>
                <span className="text-lg font-bold text-gray-900">{studentDetail.summary.total}</span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl text-center">
                <span className="text-xs text-emerald-700 block">Attended</span>
                <span className="text-lg font-bold text-emerald-700">{studentDetail.summary.present}</span>
              </div>
              <div className="bg-red-50 p-3 rounded-xl text-center">
                <span className="text-xs text-red-700 block">Absent</span>
                <span className="text-lg font-bold text-red-700">{studentDetail.summary.absent}</span>
              </div>
              <div className={`p-3 rounded-xl text-center ${
                studentDetail.summary.percentage >= 75 ? 'bg-blue-50 text-blue-700' : 'bg-red-100 text-red-800'
              }`}>
                <span className="text-xs block">Percentage</span>
                <span className="text-lg font-extrabold">{studentDetail.summary.percentage}%</span>
              </div>
            </div>

            {/* Attendance Session History */}
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Class History Logs</h4>
            <div className="flex-1 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-100">
              {studentDetail.attendance.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No attendance records logged for this student yet.</div>
              ) : (
                studentDetail.attendance.map((rec, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50 text-sm">
                    <div>
                      <span className="font-semibold text-gray-800">
                        {rec.subjectId?.subjectName || 'Database Systems Lab'}
                      </span>
                      <span className="text-xs text-gray-400 block">
                        {new Date(rec.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      rec.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {rec.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;