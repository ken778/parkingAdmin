import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  LogOut,
  Menu,
  X,
  BarChart3,
  Search,
  Bell
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Parking Spots', href: '/parking-spots', icon: MapPin },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-100"> {/* Changed back from red-100 */}
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-0 lg:flex-shrink-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex items-center justify-between h-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center">
            <div className="">
                <img
              src="../logo.png"
              alt="fndParking Logo"
              className="logo-image"
              width="40"
              height="40"
              borderRadius="200"
              aria-hidden="true"
            />
            </div>
            <h1 className="text-xl font-bold">FndParking</h1>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg mb-6">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-600">Administrator</p>
          </div>
        </div>

        <nav className="mt-2 px-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 mb-1 ${
                  active 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <Icon size={20} className="mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
          <button
            onClick={logout}
            className="flex items-center justify-center w-full px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="bg-white shadow-sm z-30 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 mr-4"
              >
                <Menu size={20} />
              </button>
              
              {/* Breadcrumb */}
              <div className="hidden md:flex items-center text-sm text-gray-600">
                {navigation.find(nav => isActive(nav.href)) && (
                  <>
                    <span className="font-medium text-gray-900">Admin</span>
                    <span className="mx-2">/</span>
                    <span>{navigation.find(nav => isActive(nav.href))?.name}</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Search */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48 lg:w-64"
                />
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* User profile */}
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT - Fixed to ensure children display properly */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="h-full w-full p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
};

export default Layout;