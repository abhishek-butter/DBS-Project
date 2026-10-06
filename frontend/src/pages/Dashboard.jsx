import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Users, TrendingUp, BookOpen, Activity } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = () => {
  const [dailyStats, setDailyStats] = useState([]);
  const [subjectStats, setSubjectStats] = useState([]);
  const [overallPercentage, setOverallPercentage] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalSubjects, setTotalSubjects] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'x-auth-token': token };
        
        const [dailyRes, subjectRes, studentsRes, subjectsListRes] = await Promise.all([
          axios.get('http://localhost:5000/api/analytics/daily-stats', { headers }),
          axios.get('http://localhost:5000/api/analytics/subject-percentage', { headers }),
          axios.get('http://localhost:5000/api/students', { headers }),
          axios.get('http://localhost:5000/api/subjects', { headers })
        ]);

        // Process daily stats
        let totalPresent = 0;
        let totalClasses = 0;
        const formattedDaily = dailyRes.data.map(d => {
          totalPresent += d.totalPresent;
          totalClasses += (d.totalPresent + d.totalAbsent);
          return {
            date: new Date(d._id).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            Present: d.totalPresent,
            Absent: d.totalAbsent
          };
        });
        setDailyStats(formattedDaily);
        setOverallPercentage(totalClasses === 0 ? 0 : Math.round((totalPresent / totalClasses) * 100));

        // Process subject stats
        const formattedSubjects = subjectRes.data.map(d => ({
          name: d.subjectInfo[0]?.subjectName || 'Unknown',
          percentage: Math.round(d.percentage)
        }));
        setSubjectStats(formattedSubjects);

        setTotalStudents(studentsRes.data.length);
        setTotalSubjects(subjectsListRes.data.length);

      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const pieData = [
    { name: 'Overall Present', value: overallPercentage },
    { name: 'Overall Absent', value: 100 - overallPercentage }
  ];
  const PIE_COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Overview Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Students</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalStudents}</h3>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Avg Attendance</p>
            <h3 className="text-2xl font-bold text-gray-800">{overallPercentage}%</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-full">
            <BookOpen size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Subjects</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalSubjects}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-full">
            <Activity size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <h3 className="text-2xl font-bold text-green-500">Healthy</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Daily Attendance Trends</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="Present" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="Absent" stroke="#ef4444" strokeWidth={3} dot={{r: 4, fill: '#ef4444'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Overall Distribution</h2>
          <div className="h-72 flex flex-col justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={pieData} 
                  cx="50%" cy="50%" 
                  innerRadius={60} outerRadius={90} 
                  paddingAngle={5} dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-[-100px] pointer-events-none">
              <span className="text-3xl font-bold text-gray-800">{overallPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Bar Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Subject-wise Attendance (%)</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subjectStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
              <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="percentage" name="Attendance %" radius={[6, 6, 0, 0]}>
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