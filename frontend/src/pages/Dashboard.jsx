import React, { useEffect, useState } from 'react';
import api from '../api';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Users, TrendingUp, BookOpen, GraduationCap, 
  AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck, Database, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const PIE_COLORS = ['#10b981', '#ef4444'];

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [summary, setSummary] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalSubjects: 0,
    totalClasses: 0,
    totalRecords: 0,
    overallPercentage: 0
  });
  const [dailyStats, setDailyStats] = useState([]);
  const [subjectStats, setSubjectStats] = useState([]);
  const [defaultersCount, setDefaultersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryRes, dailyRes, subjectRes, defaultersRes] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/analytics/daily-stats'),
          api.get('/analytics/subject-percentage'),
          api.get('/analytics/low-attendance?threshold=75')
        ]);

        setSummary(summaryRes.data);

        // Daily trend data format
        const formattedDaily = dailyRes.data.map((d) => ({
          date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          Present: d.totalPresent,
          Absent: d.totalAbsent,
          Rate: d.attendanceRate
        }));
        setDailyStats(formattedDaily);

        // Subject stats
        const formattedSubjects = subjectRes.data.map((d) => ({
          code: d.subjectInfo?.subjectCode || 'N/A',
          name: d.subjectInfo?.subjectName || 'Unknown Subject',
          percentage: d.percentage
        }));
        setSubjectStats(formattedSubjects);

        setDefaultersCount(defaultersRes.data.count || 0);
      } catch (err) {
        console.error('Dashboard data error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const pieData = [
    { name: 'Overall Present', value: summary.overallPercentage },
    { name: 'Overall Absent', value: 100 - summary.overallPercentage }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner / Slot & Project Identification */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full uppercase tracking-wider">
              BCSE302P &bull; Slot D2
            </span>
            <span className="px-3 py-1 bg-emerald-500/30 text-emerald-200 text-xs font-semibold rounded-full flex items-center gap-1">
              <Database size={12} /> MongoDB Document Store
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Student Attendance Management System</h1>
          <p className="text-sm text-blue-100 mt-1 max-w-xl">
            Designed & Developed by <strong className="text-white">Abhishek VS (24BCE0404)</strong> & <strong className="text-white">Ayush Naugariya (24BDS0076)</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/attendance"
            className="px-5 py-3 bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm rounded-xl shadow-lg transition"
          >
            {user.role === 'student' ? 'View Attendance Records' : 'Mark Attendance'}
          </Link>
          {user.role !== 'student' && (
            <Link
              to="/analytics"
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl backdrop-blur-md border border-white/20 transition flex items-center gap-2"
            >
              Aggregation Analytics <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>

      {/* Schoollog-Inspired "From Register to Intelligence" Early-Warning Signal */}
      {user.role === 'student' ? (
        <div className={`border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm transition ${
          summary.overallPercentage >= 75
            ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-200/60'
            : 'bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-200/60'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-md shrink-0 ${
              summary.overallPercentage >= 75 ? 'bg-emerald-500 shadow-emerald-200' : 'bg-red-500 shadow-red-200'
            }`}>
              {summary.overallPercentage >= 75 ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                  summary.overallPercentage >= 75
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-red-100 text-red-800 border-red-300'
                }`}>
                  Early Signal Intelligence
                </span>
                <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Personal Ledger Verified
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">
                {summary.overallPercentage >= 75 ? (
                  <>Good Standing: Your attendance is <strong className="text-emerald-700">{summary.overallPercentage}%</strong>, comfortably above the 75% exam qualification threshold.</>
                ) : (
                  <>Academic Debarment Alert: Your attendance is <strong className="text-red-700">{summary.overallPercentage}%</strong> (below 75%). Prioritize upcoming lectures.</>
                )}
              </p>
              <p className="text-xs text-gray-500">
                "Know who's present. Know who needs you." &bull; Real-time MongoDB Pipeline Analytics
              </p>
            </div>
          </div>
          <Link
            to="/attendance"
            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm self-start sm:self-auto shrink-0"
          >
            View My Lecture Ledger <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-emerald-500/10 border border-amber-200/70 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-200 shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-300">
                  Early-Warning Intelligence Signal
                </span>
                <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Pipeline 4 Active
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">
                {defaultersCount > 0 ? (
                  <>
                    <strong className="text-amber-800">{defaultersCount} students</strong> require an attendance check-in this week (below mandatory 75% examination threshold).
                  </>
                ) : (
                  <>All students currently maintain safe attendance standing (&ge; 75%).</>
                )}
              </p>
              <p className="text-xs text-gray-500">
                From Register to Intelligence: Proactively intervene before students slip into semester debarment.
              </p>
            </div>
          </div>
          <Link
            to="/analytics"
            className="px-4 py-2 bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm self-start sm:self-auto shrink-0"
          >
            Inspect Defaulters List <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {user.role === 'student' ? 'My Profile' : user.role === 'faculty' ? 'Enrolled Students' : 'Students'}
            </p>
            <h3 className="text-xl font-black text-gray-900 truncate max-w-[130px]">
              {user.role === 'student' ? '24BCE0404' : summary.totalStudents}
            </h3>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl">
            <GraduationCap size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {user.role === 'student' ? 'Instructors' : user.role === 'faculty' ? 'Faculty ID' : 'Faculty'}
            </p>
            <h3 className="text-xl font-black text-gray-900">
              {user.role === 'faculty' ? 'FAC001' : summary.totalFaculty}
            </h3>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {user.role === 'faculty' ? 'My Courses' : 'Subjects'}
            </p>
            <h3 className="text-2xl font-black text-gray-900">{summary.totalSubjects}</h3>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {user.role === 'student' ? 'My Turnout' : 'Avg Attendance'}
            </p>
            <h3 className="text-2xl font-black text-emerald-600">{summary.overallPercentage}%</h3>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className={`p-3.5 rounded-2xl ${
            defaultersCount > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
          }`}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {user.role === 'student' ? 'Status' : 'Below 75%'}
            </p>
            <h3 className="text-lg font-black text-gray-900 truncate">
              {user.role === 'student' 
                ? (summary.overallPercentage >= 75 ? 'Safe ≥75%' : 'Alert <75%') 
                : defaultersCount}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Attendance Trend (Line Chart) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Daily Attendance Trends (Past 25 Days)</h2>
              <p className="text-xs text-gray-500">Aggregated daily presence and absence volumes</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              Dynamic Date Aggregation
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" />
                <Line 
                  type="monotone" 
                  dataKey="Present" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  dot={{ r: 3, fill: '#10b981' }} 
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="Absent" 
                  stroke="#ef4444" 
                  strokeWidth={2.5} 
                  dot={{ r: 3, fill: '#ef4444' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overall Distribution Donut */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Cumulative Ratio</h2>
            <p className="text-xs text-gray-500">Total verified sessions: {summary.totalRecords}</p>
          </div>

          <div className="h-64 flex flex-col justify-center items-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={pieData} 
                  cx="50%" cy="50%" 
                  innerRadius={65} outerRadius={95} 
                  paddingAngle={6} dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val) => [`${val}%`, '']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                />
                <Legend iconType="circle" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center pointer-events-none mt-[-24px]">
              <span className="text-3xl font-black text-gray-900">{summary.overallPercentage}%</span>
              <span className="text-xs font-semibold text-gray-400 block">Attended</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl flex items-center justify-between text-xs text-emerald-800">
            <span className="font-semibold flex items-center gap-1.5">
              <ShieldCheck size={16} /> Institute Benchmark Met
            </span>
            <span>&gt; 75% target</span>
          </div>
        </div>
      </div>

      {/* Subject-Wise Performance Bar Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Subject-wise Average Attendance Percentage</h2>
            <p className="text-xs text-gray-500">Calculated via MongoDB pipeline grouping by subjectId and joining Subjects</p>
          </div>
          {user.role !== 'student' && (
            <Link
              to="/analytics"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Detailed Analytics <ArrowRight size={14} />
            </Link>
          )}
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subjectStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="code" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip 
                formatter={(val, name, props) => [`${val}%`, props.payload.name]}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} 
              />
              <Bar dataKey="percentage" name="Attendance %" radius={[8, 8, 0, 0]}>
                {subjectStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;