import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Users as UsersIcon, 
  Plus, 
  AlertCircle, 
  Shield,
  UserCheck,
  UserX,
  Download,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Mail,
  Calendar,
  Flag,
  X,
  Eye,
  FileText,
  Clock,
  MapPin,
  MessageSquare,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { usersService } from '../services/firebaseService';
import { parkingSpotsService } from '../services/firebaseService';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [fraudReports, setFraudReports] = useState([]); // Store all fraud reports
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingUser, setUpdatingUser] = useState(null);
  const [reportedUsers, setReportedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportedPage, setReportedPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [userReports, setUserReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadUsers();
    loadFraudReports();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const usersData = await usersService.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      setError(`Failed to load users: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadFraudReports = async () => {
    try {
      const fraudData = await parkingSpotsService.getFraudReportedLocations();
      setFraudReports(fraudData);
      
      // Get all users
      const allUsers = await usersService.getUsers();
      
      // Extract reported user IDs
      const reportedUserIds = fraudData.map(report => report.reportedUser.userId);
      
      // Filter users to get only reported ones
      const reportedUsersOnly = allUsers.filter(user => 
        reportedUserIds.includes(user.id)
      );
      setReportedUsers(reportedUsersOnly);
      
    } catch (error) {
      console.error('Error loading fraud reports:', error);
    }
  };

  const handleViewDetails = async (user) => {
    try {
      setModalLoading(true);
      setSelectedUser(user);
      
      // Get all reports for this specific user
      const userSpecificReports = fraudReports.filter(report => 
        report.reportedUser.userId === user.id
      );
      
      setUserReports(userSpecificReports);
      setShowModal(true);
    } catch (error) {
      console.error('Error loading user details:', error);
      setError('Failed to load user report details');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setUserReports([]);
  };

  const handleResolveReport = async (reportId) => {
    try {
      // Here you would implement the logic to mark a report as resolved
      // For now, we'll just update the UI state
      setUserReports(prev => prev.filter(report => report.id !== reportId));
      
      // You can also update the main fraudReports state if needed
      setFraudReports(prev => prev.filter(report => report.id !== reportId));
      
      // If this was the last report for the user, remove them from reported users
      const remainingReportsForUser = userReports.filter(report => 
        report.reportedUser.userId === selectedUser.id && report.id !== reportId
      );
      
      if (remainingReportsForUser.length === 0) {
        setReportedUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      }
      
    } catch (error) {
      console.error('Error resolving report:', error);
      setError('Failed to resolve report');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    await loadFraudReports();
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      setUpdatingUser(userId);
      const newStatus = currentStatus === 'active' ? 'deactivated' : 'active';
      
      await usersService.updateUserStatus(userId, newStatus);
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      
      setReportedUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      
      // Update selected user in modal if open
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev => ({ ...prev, status: newStatus }));
      }
      
    } catch (error) {
      console.error('Toggle error:', error);
      setError(`Failed to update user status: ${error.message}`);
    } finally {
      setUpdatingUser(null);
    }
  };

  const createSampleUsers = async () => {
    try {
      setLoading(true);
      const sampleUsers = [
        {
          id: 'user1',
          email: 'john@example.com',
          name: 'John Doe',
          role: 'user',
          status: 'active',
          createdAt: new Date().toISOString(),
          parkingSpots: 5
        },
        {
          id: 'user2',
          email: 'jane@example.com',
          name: 'Jane Smith',
          role: 'user',
          status: 'active',
          createdAt: new Date().toISOString(),
          parkingSpots: 3
        },
        {
          id: 'user3',
          email: 'mike@example.com',
          name: 'Mike Johnson',
          role: 'user',
          status: 'active',
          createdAt: new Date().toISOString(),
          parkingSpots: 7
        }
      ];

      for (const user of sampleUsers) {
        await usersService.createOrUpdateUser(user.id, user);
      }

      await loadUsers();
    } catch (error) {
      setError('Error creating sample users: ' + error.message);
    }
  };

  // Filter all users based on search term
  const filteredAllUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter reported users based on search term
  const filteredReportedUsers = reportedUsers.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const activeUsers = users.filter(user => user.status === 'active').length;
  const deactivatedUsers = users.filter(user => user.status === 'deactivated').length;
  const totalUsers = users.length;
  const reportedCount = reportedUsers.length;

  // Pagination for all users
  const allIndexOfLastItem = currentPage * itemsPerPage;
  const allIndexOfFirstItem = allIndexOfLastItem - itemsPerPage;
  const allCurrentItems = filteredAllUsers.slice(allIndexOfFirstItem, allIndexOfLastItem);
  const allTotalPages = Math.ceil(filteredAllUsers.length / itemsPerPage);

  // Pagination for reported users
  const reportedIndexOfLastItem = reportedPage * itemsPerPage;
  const reportedIndexOfFirstItem = reportedIndexOfLastItem - itemsPerPage;
  const reportedCurrentItems = filteredReportedUsers.slice(reportedIndexOfFirstItem, reportedIndexOfLastItem);
  const reportedTotalPages = Math.ceil(filteredReportedUsers.length / itemsPerPage);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center">
        <div className={`p-3 rounded-xl ${color} mr-4`}>
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );

  if (loading && !refreshing) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <div className="h-4 bg-gray-200 rounded w-48 mt-2 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-300 rounded-xl mr-4"></div>
                <div>
                  <div className="h-4 bg-gray-300 rounded w-24 mb-3"></div>
                  <div className="h-8 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all user accounts in the system</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          {users.length === 0 && (
            <button
              onClick={createSampleUsers}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus size={16} className="mr-2" />
              Add Sample Users
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <div className="flex items-center">
            <AlertCircle size={20} className="text-red-500 mr-3" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={UsersIcon}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatCard
          title="Active Users"
          value={activeUsers}
          icon={UserCheck}
          color="bg-gradient-to-r from-green-500 to-green-600"
        />
        <StatCard
          title="Deactivated"
          value={deactivatedUsers}
          icon={UserX}
          color="bg-gradient-to-r from-red-500 to-red-600"
        />
        <StatCard
          title="Reported Users"
          value={reportedCount}
          icon={Flag}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
        />
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter size={18} className="mr-2" />
              Filter
            </button>
            <button className="flex items-center px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <Download size={18} className="mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* ALL USERS TABLE */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">All Users</h2>
            <p className="text-gray-600 mt-1">
              {totalUsers} total users • {activeUsers} active • {deactivatedUsers} deactivated
            </p>
          </div>
          {users.length === 0 && (
            <button
              onClick={createSampleUsers}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus size={16} className="mr-2" />
              Add Sample Users
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">User Status Legend:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Active</p>
                <p className="text-xs text-gray-600">Can login and use the app</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Deactivated</p>
                <p className="text-xs text-gray-600">Cannot login or use the app</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Admin</p>
                <p className="text-xs text-gray-600">Full access to admin panel</p>
              </div>
            </div>
          </div>
        </div>

        {/* All Users Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Role
                  </th>
               
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allCurrentItems.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold mr-4">
                          {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{user.name || 'No Name'}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail size={14} className="mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                 
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={14} className="mr-2" />
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          user.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className={`text-sm font-medium ${
                          user.status === 'active' ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                       
                        {reportedUsers.find(ru => ru.id === user.id) && (
                          <button
                            onClick={() => handleViewDetails(user)}
                            className="flex items-center px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors"
                            title="View fraud reports"
                          >
                            <Eye size={14} className="mr-1" />
                            View Reports
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination for All Users */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                Showing <span className="font-semibold">{allIndexOfFirstItem + 1}</span> to{' '}
                <span className="font-semibold">{Math.min(allIndexOfLastItem, filteredAllUsers.length)}</span> of{' '}
                <span className="font-semibold">{filteredAllUsers.length}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(5, allTotalPages) }, (_, i) => {
                  let pageNumber;
                  if (allTotalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= allTotalPages - 2) {
                    pageNumber = allTotalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        currentPage === pageNumber
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, allTotalPages))}
                  disabled={currentPage === allTotalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REPORTED USERS TABLE */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Reported Users</h2>
            <p className="text-gray-600 mt-1">
              {reportedCount} users reported for suspicious activity • Requires attention
            </p>
          </div>
          {reportedCount > 0 && (
            <button className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
              <AlertCircle size={16} className="mr-2" />
              Review All Reports
            </button>
          )}
        </div>

        {/* Reported Users Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Reports
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportedCurrentItems.map((user) => (
                  <tr key={user.id} className="hover:bg-orange-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-semibold mr-4">
                          {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{user.name || 'No Name'}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail size={14} className="mr-1" />
                            {user.email}
                          </div>
                          <div className="text-xs text-orange-600 mt-1 flex items-center">
                            <Flag size={12} className="mr-1" />
                            {fraudReports.filter(report => report.reportedUser.userId === user.id).length} reports
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {fraudReports.filter(report => report.reportedUser.userId === user.id).length || 0}
                      </div>
                      <div className="text-xs text-gray-500">fraud reports</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          user.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className={`text-sm font-medium ${
                          user.status === 'active' ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleViewDetails(user)}
                          className="flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors"
                        >
                          <Eye size={16} className="mr-2" />
                          View Details
                        </button>
                        <button
                          onClick={() => handleStatusToggle(user.id, user.status)}
                          disabled={updatingUser === user.id || user.role === 'admin'}
                          className={`relative inline-flex items-center h-6 rounded-full w-12 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                            user.status === 'active' 
                              ? 'bg-green-500' 
                              : 'bg-gray-300'
                          } ${(updatingUser === user.id || user.role === 'admin') ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={user.role === 'admin' ? 'Cannot deactivate admin users' : `Click to ${user.status === 'active' ? 'deactivate' : 'activate'}`}
                        >
                          <span
                            className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform shadow-sm ${
                              user.status === 'active' ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination for Reported Users */}
          <div className="px-6 py-4 border-t border-gray-200 bg-orange-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                Showing <span className="font-semibold">{reportedIndexOfFirstItem + 1}</span> to{' '}
                <span className="font-semibold">{Math.min(reportedIndexOfLastItem, filteredReportedUsers.length)}</span> of{' '}
                <span className="font-semibold">{filteredReportedUsers.length}</span> reported users
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setReportedPage(prev => Math.max(prev - 1, 1))}
                  disabled={reportedPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(5, reportedTotalPages) }, (_, i) => {
                  let pageNumber;
                  if (reportedTotalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (reportedPage <= 3) {
                    pageNumber = i + 1;
                  } else if (reportedPage >= reportedTotalPages - 2) {
                    pageNumber = reportedTotalPages - 4 + i;
                  } else {
                    pageNumber = reportedPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setReportedPage(pageNumber)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        reportedPage === pageNumber
                          ? 'bg-orange-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  onClick={() => setReportedPage(prev => Math.min(prev + 1, reportedTotalPages))}
                  disabled={reportedPage === reportedTotalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty States */}
      {filteredAllUsers.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <UsersIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm 
              ? `No users match "${searchTerm}". Try a different search term.`
              : "There are no users in the system yet. Add sample users to get started."}
          </p>
          {users.length === 0 && !searchTerm && (
            <button
              onClick={createSampleUsers}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={18} className="mr-2" />
              Add Sample Users
            </button>
          )}
        </div>
      )}

      {reportedCount === 0 && filteredAllUsers.length > 0 && (
        <div className="bg-green-50 rounded-xl border border-green-200 p-8 text-center mt-6">
          <Shield className="mx-auto h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reported Users</h3>
          <p className="text-gray-600">
            Great news! There are no users reported for suspicious activity at this time.
          </p>
        </div>
      )}

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">User Report Details</h2>
                  <p className="text-gray-600 mt-1">Review all fraud reports for this user</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {modalLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading report details...</p>
                </div>
              ) : (
                <>
                  {/* User Summary */}
                  <div className="bg-gray-50 rounded-xl p-6 mb-8">
                    <div className="flex items-center">
                      <div className="h-16 w-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold mr-6">
                        {selectedUser.name?.charAt(0) || selectedUser.email?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{selectedUser.name || 'No Name'}</h3>
                            <div className="flex items-center text-gray-600 mt-1">
                              <Mail size={16} className="mr-2" />
                              {selectedUser.email}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${
                              selectedUser.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {selectedUser.status}
                            </span>
                            <button
                              onClick={() => handleStatusToggle(selectedUser.id, selectedUser.status)}
                              disabled={updatingUser === selectedUser.id || selectedUser.role === 'admin'}
                              className={`relative inline-flex items-center h-8 rounded-full w-16 transition-colors ${
                                selectedUser.status === 'active' 
                                  ? 'bg-green-500' 
                                  : 'bg-gray-300'
                              } ${(updatingUser === selectedUser.id || selectedUser.role === 'admin') ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <span
                                className={`inline-block w-6 h-6 transform bg-white rounded-full transition-transform ${
                                  selectedUser.status === 'active' ? 'translate-x-9' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reports List */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Fraud Reports ({userReports.length})
                    </h3>
                    
                    {userReports.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                        <p className="text-gray-600">No active fraud reports for this user.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userReports.map((report, index) => (
                          <div key={report.id || index} className="border border-orange-200 rounded-xl p-6 bg-orange-50">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-semibold text-gray-900 flex items-center">
                                  <AlertCircle size={18} className="text-orange-600 mr-2" />
                                  Report #{index + 1}
                                </h4>
                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                  <Clock size={14} className="mr-1" />
                                  Reported on: {new Date(report.reportedAt || report.timestamp).toLocaleString()}
                                </div>
                              </div>
                              <button
                                onClick={() => handleResolveReport(report.id || index)}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                              >
                                <CheckCircle size={16} className="mr-2" />
                                Mark as Resolved
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h5 className="text-sm font-medium text-gray-900 mb-2">Report Details</h5>
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <span className="text-sm text-gray-600 w-24">Reason:</span>
                                    <span className="text-sm font-medium text-gray-900">{report.reason || 'Suspicious activity'}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="text-sm text-gray-600 w-24">Marker ID:</span>
                                    <span className="text-sm font-medium text-gray-900">{report.reportedMarkerId || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="text-sm text-gray-600 w-24">Reporter:</span>
                                    <span className="text-sm font-medium text-gray-900">{report.reporterId || 'Anonymous'}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h5 className="text-sm font-medium text-gray-900 mb-2">Location Details</h5>
                                <div className="space-y-2">
                                  {report.coordinates && (
                                    <div className="flex items-center">
                                      <MapPin size={14} className="text-gray-400 mr-2" />
                                      <span className="text-sm text-gray-600">
                                        Coordinates: {report.coordinates.latitude?.toFixed(6)}, {report.coordinates.longitude?.toFixed(6)}
                                      </span>
                                    </div>
                                  )}
                                  {report.address && (
                                    <div className="flex items-center">
                                      <MapPin size={14} className="text-gray-400 mr-2" />
                                      <span className="text-sm text-gray-600">{report.address}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {report.description && (
                              <div className="mt-4 pt-4 border-t border-orange-200">
                                <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                                  <MessageSquare size={14} className="mr-2" />
                                  Additional Notes
                                </h5>
                                <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                                  {report.description}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleCloseModal}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleStatusToggle(selectedUser.id, selectedUser.status)}
                      disabled={updatingUser === selectedUser.id || selectedUser.role === 'admin'}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        selectedUser.status === 'active'
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      } ${(updatingUser === selectedUser.id || selectedUser.role === 'admin') ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {selectedUser.status === 'active' ? 'Deactivate User' : 'Activate User'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;