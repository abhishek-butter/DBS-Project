import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CheckSquare, BarChart3, 
  LogOut, Database, UserCheck, Shield 
} from 'lucide-react';

const Sidebar = ({ setToken }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{"name":"Admin User","role":"admin"}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
  };

  const isStudent = user.role === 'student';

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Students', path: '/students', icon: <Users size={20} /> },
    { 
      name: isStudent ? 'View Attendance' : 'Mark Attendance', 
      path: '/attendance', 
      icon: <CheckSquare size={20} /> 
    },
    ...(!isStudent ? [
      { name: 'Analytics & Reports', path: '/analytics', icon: <BarChart3 size={20} /> }
    ] : []),
  ];

  return (
    <div className="w-72 bg-white border-r border-gray-100 flex flex-col justify-between h-full shadow-sm select-none">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-blue-700 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
            <Database size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Attendance<span className="text-blue-600">DB</span></h1>
            <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">BCSE302P &bull; Slot D2</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4 space-y-1.5">
          <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Management</p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.name}
                to={item.path} 
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-200 ${
                  isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile card & Logout */}
      <div className="p-4 border-t border-gray-100 space-y-3">
        <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 uppercase">
              <Shield size={10} /> {user.role}
            </span>
          </div>
        </div>

        <button 
          onClick={handleLogout} 
          className="flex items-center justify-center gap-2 w-full bg-red-50 hover:bg-red-100 text-red-600 p-2.5 rounded-xl text-xs font-bold transition-colors duration-200"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;