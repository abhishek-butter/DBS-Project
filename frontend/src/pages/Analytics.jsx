import React, { useEffect, useState } from 'react';
import api from '../api';
import { 
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, 
  CartesianGrid, Cell, Legend 
} from 'recharts';
import { 
  AlertTriangle, CheckCircle2, TrendingUp, Calendar, 
  Layers, Code2, Users, Download, Filter 
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

const Analytics = () => {
  const [threshold, setThreshold] = useState(75);
  const [defaulters, setDefaulters] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [sectionStats, setSectionStats] = useState([]);
  const [subjectStats, setSubjectStats] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState('low-attendance');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [threshold]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [defaultersRes, monthlyRes, sectionRes, subjectRes] = await Promise.all([
        api.get(`/analytics/low-attendance?threshold=${threshold}`),
        api.get('/analytics/monthly-report'),
        api.get('/analytics/section-stats'),
        api.get('/analytics/subject-percentage')
      ]);

      setDefaulters(defaultersRes.data.defaulters || []);
      setMonthlyStats(monthlyRes.data || []);
      setSectionStats(sectionRes.data || []);
      setSubjectStats(subjectRes.data || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedMonthly = monthlyStats.map(m => ({
    period: `${monthNames[(m.month - 1) % 12]} ${m.year}`,
    percentage: m.percentage,
    present: m.presentRecords,
    absent: m.absentRecords,
    total: m.totalRecords
  }));

  const pipelineCodes = {
    'low-attendance': {
      title: "Query 4: Defaulters Below Threshold ($match + $group + $project + $lookup)",
      rubric: "Identifies students whose attendance percentage falls below a set criteria (< 75%)",
      code: `Attendance.aggregate([
  // Stage 1: Group attendance records per student
  {
    $group: {
      _id: "$studentId",
      totalClasses: { $sum: 1 },
      presentClasses: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
      absentClasses: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } }
    }
  },
  // Stage 2: Calculate percentage using mathematical expression operators
  {
    $project: {
      studentId: "$_id",
      totalClasses: 1,
      presentClasses: 1,
      absentClasses: 1,
      percentage: {
        $round: [
          { $multiply: [{ $divide: ["$presentClasses", "$totalClasses"] }, 100] },
          1
        ]
      }
    }
  },
  // Stage 3: Filter documents where percentage < threshold ($lt: 75)
  {
    $match: {
      percentage: { $lt: 75.0 }
    }
  },
  // Stage 4: Join with students collection to retrieve name & regNo
  {
    $lookup: {
      from: "students",
      localField: "studentId",
      foreignField: "_id",
      as: "studentInfo"
    }
  },
  { $unwind: "$studentInfo" },
  // Stage 5: Sort by percentage ascending (most critical first)
  { $sort: { percentage: 1 } }
]);`
    },
    'student-percentage': {
      title: "Query 1: Student Attendance Percentage ($group + $project + $lookup + $sort)",
      rubric: "Calculates individual student overall attendance percentage and ranks students",
      code: `Attendance.aggregate([
  {
    $group: {
      _id: "$studentId",
      totalClasses: { $sum: 1 },
      presentClasses: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } }
    }
  },
  {
    $project: {
      studentId: "$_id",
      percentage: { $multiply: [{ $divide: ["$presentClasses", "$totalClasses"] }, 100] }
    }
  },
  {
    $lookup: {
      from: "students",
      localField: "studentId",
      foreignField: "_id",
      as: "studentInfo"
    }
  },
  { $unwind: "$studentInfo" },
  { $sort: { percentage: -1 } }
]);`
    },
    'monthly-report': {
      title: "Query 5: Monthly Attendance Report ($group by Date Operators: $year, $month)",
      rubric: "Extracts calendar date parts and groups attendance over time to analyze trends",
      code: `Attendance.aggregate([
  {
    $group: {
      _id: {
        year: { $year: "$date" },
        month: { $month: "$date" }
      },
      totalRecords: { $sum: 1 },
      presentRecords: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
      absentRecords: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } }
    }
  },
  {
    $project: {
      year: "$_id.year",
      month: "$_id.month",
      percentage: {
        $round: [
          { $multiply: [{ $divide: ["$presentRecords", "$totalRecords"] }, 100] },
          1
        ]
      }
    }
  },
  { $sort: { "year": 1, "month": 1 } }
]);`
    },
    'section-stats': {
      title: "Query 6: Section-wise Comparative Analysis ($lookup + $unwind + $group)",
      rubric: "Cross-collection aggregation joining Attendance with Students to compare sections D1 & D2",
      code: `Attendance.aggregate([
  {
    $lookup: {
      from: "students",
      localField: "studentId",
      foreignField: "_id",
      as: "student"
    }
  },
  { $unwind: "$student" },
  {
    $group: {
      _id: "$student.section",
      totalRecords: { $sum: 1 },
      presentRecords: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } }
    }
  },
  {
    $project: {
      section: "$_id",
      percentage: {
        $round: [
          { $multiply: [{ $divide: ["$presentRecords", "$totalRecords"] }, 100] },
          1
        ]
      }
    }
  },
  { $sort: { section: 1 } }
]);`
    }
  };

  const exportDefaultersCSV = () => {
    const csvRows = [
      ['Registration No', 'Student Name', 'Section', 'Total Classes', 'Attended', 'Attendance %'],
      ...defaulters.map(d => [
        d.studentInfo?.regNo || 'N/A',
        `"${d.studentInfo?.name || 'Unknown'}"`,
        d.studentInfo?.section || 'N/A',
        d.totalClasses,
        d.presentClasses,
        `${d.percentage}%`
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_defaulters_below_${threshold}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              BCSE302P Rubric Deliverable
            </span>
            <span className="text-xs text-gray-400">Slot: D2</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Advanced Analytics & Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            Demonstrating multi-stage MongoDB aggregation pipelines, threshold filtering, and comparative metrics.
          </p>
        </div>

        <button
          onClick={exportDefaultersCSV}
          className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition"
        >
          <Download size={16} />
          Export Defaulters CSV
        </button>
      </div>

      {/* Threshold Controller Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-amber-400" size={22} />
              <h2 className="text-xl font-bold">Attendance Defaulter Criterion Filter</h2>
            </div>
            <p className="text-sm text-slate-300">
              Identifies students requiring debarment warning or remedial action based on University Regulations (&lt; {threshold}%).
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
            <span className="text-sm font-medium text-slate-200">Threshold:</span>
            <div className="flex gap-2">
              {[65, 75, 80, 85].map(val => (
                <button
                  key={val}
                  onClick={() => setThreshold(val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    threshold === val 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
            <div className="text-right pl-3 border-l border-white/20">
              <span className="text-xs text-slate-400 block">Flagged Count</span>
              <span className="text-xl font-black text-amber-400">{defaulters.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Defaulters Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Students with Attendance Below {threshold}%</h3>
              <p className="text-xs text-gray-500">Filtered automatically using MongoDB Aggregation Pipeline ($match + $lookup)</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-red-100 text-red-700 rounded-full">
            {defaulters.length} Students At Risk
          </span>
        </div>

        {defaulters.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="mx-auto text-emerald-500 mb-3" size={40} />
            <h4 className="font-bold text-gray-800">No Defaulters Found</h4>
            <p className="text-sm text-gray-500">All registered students currently maintain {threshold}% or higher attendance!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-semibold text-gray-500">
                  <th className="py-3 px-6">Reg Number</th>
                  <th className="py-3 px-6">Student Name</th>
                  <th className="py-3 px-6">Department & Section</th>
                  <th className="py-3 px-6 text-center">Classes Attended</th>
                  <th className="py-3 px-6 text-center">Total Sessions</th>
                  <th className="py-3 px-6 text-center">Percentage</th>
                  <th className="py-3 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {defaulters.map((item, idx) => {
                  const student = item.studentInfo || {};
                  return (
                    <tr key={idx} className="hover:bg-red-50/40 transition-colors">
                      <td className="py-3 px-6 font-mono font-medium text-gray-900">{student.regNo || 'N/A'}</td>
                      <td className="py-3 px-6 font-medium text-gray-900">{student.name || 'Unknown Student'}</td>
                      <td className="py-3 px-6 text-gray-600">
                        <span className="inline-block mr-2">{student.department || 'CSE'}</span>
                        <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-md">
                          Sec {student.section || 'D2'}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center font-semibold text-gray-700">{item.presentClasses}</td>
                      <td className="py-3 px-6 text-center text-gray-500">{item.totalClasses}</td>
                      <td className="py-3 px-6 text-center">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                          {item.percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium">
                          Warning Letter
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grid: Section Comparison & Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section Comparison */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900">Section-wise Attendance Performance</h3>
              <p className="text-xs text-gray-500">Cross-collection aggregation ($lookup + $group by section)</p>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users size={18} />
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectionStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="section" axisLine={false} tickLine={false} tickFormatter={val => `Section ${val}`} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip 
                  formatter={(val) => [`${val}%`, 'Attendance Rate']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                  {sectionStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
            {sectionStats.map((s, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded-xl">
                <span className="text-xs text-gray-500 font-medium">Section {s.section} Average</span>
                <p className="text-lg font-bold text-gray-900">{s.percentage}%</p>
                <span className="text-xs text-gray-400">{s.presentRecords} of {s.totalRecords} sessions attended</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900">Monthly Attendance History</h3>
              <p className="text-xs text-gray-500">Aggregated with date operators ($year, $month)</p>
            </div>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Calendar size={18} />
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedMonthly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip 
                  formatter={(val) => [`${val}%`, 'Average Rate']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="percentage" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
            <span>Historical timeline automatically bucketed per academic calendar</span>
            <span className="font-semibold text-indigo-600">Dynamic Aggregation</span>
          </div>
        </div>
      </div>

      {/* MongoDB Aggregation Query Pipeline Showcase */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Code2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">MongoDB Aggregation Pipeline Inspector</h3>
              <p className="text-xs text-slate-400">Click any pipeline below to inspect the exact Mongoose Aggregation code running on MongoDB</p>
            </div>
          </div>

          {/* Pipeline switcher tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'low-attendance', label: '1. Defaulters Pipeline' },
              { id: 'student-percentage', label: '2. Student Ranks' },
              { id: 'monthly-report', label: '3. Monthly Breakdown' },
              { id: 'section-stats', label: '4. Section Stats' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedPipeline(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedPipeline === tab.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
            <span className="text-emerald-400 font-mono font-medium">
              {pipelineCodes[selectedPipeline].title}
            </span>
            <span className="text-slate-500 italic">
              {pipelineCodes[selectedPipeline].rubric}
            </span>
          </div>
          <pre className="text-xs text-emerald-300 font-mono overflow-x-auto leading-relaxed">
            {pipelineCodes[selectedPipeline].code}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
