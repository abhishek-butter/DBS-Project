import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CheckSquare, LogOut, Database } from 'lucide-react';

const Sidebar = ({ setToken }) => {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Students', path: '/students', icon: <Users size={20} /> },
    { name: 'Mark Attendance', path: '/attendance', icon: <CheckSquare size={20} /> },
  ];

  return (
    <div className="w-72 bg-white border-r border-gray-100 flex flex-col justify-between h-full shadow-sm">
      <div>
        <div className="p-8 flex items-center gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
            <Database size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Attendance<span className="text-blue-600">DB</span></h1>
            <p className="text-xs text-gray-500 font-medium">Management System</p>
          </div>
        </div>
        
        <nav className="mt-4 px-4 space-y-2">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Main Menu</p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.name}
                to={item.path} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive 
                  ? 'bg-blue-50 text-blue-700 shadow-sm' 
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
      
      <div className="p-6">
        <button 
          onClick={handleLogout} 
          className="flex items-center justify-center gap-2 w-full bg-red-50 hover:bg-red-100 text-red-600 p-3 rounded-xl font-medium transition-colors duration-200"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;