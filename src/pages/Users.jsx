import React, { useState, useEffect } from 'react';
import { Search, Filter, Users as UsersIcon, Plus, AlertCircle } from 'lucide-react'; // Renamed import
import { usersService } from '../services/firebaseService';
import { parkingSpotsService } from '../services/firebaseService';

const Users = () => { // This is your component name
  const [users, setUsers] = useState([]);
  const [fraudSpots, setfraudSpots] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingUser, setUpdatingUser] = useState(null);
  const [reportedUsers, setReportedUsers] = useState([])

  useEffect(() => {
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
         
      }
    };

    loadUsers();
    // getFraudReported()
    getReportedUsersWithDetails();
  }, []);


  const getFraudReported = async()=>{
    const fraudData = await parkingSpotsService.getFraudReportedLocations();
    
     console.log('reported users ',fraudData)
     // Extract only user-related data from each report
    const reportedUsers = fraudData.map(report => ({
      userId: report.reportedUser.userId,
      userEmail: report.reportedUser.userEmail,
      reportedAt: report.reportedUser.reportedAt,
      reportedMarkerId: report.reportedMarkerId,
      reason: report.reason
    }));

   console.log('Reported users only:', reportedUsers);
    setfraudSpots(reportedUsers)
   
  }

  //get filtered users that they reported 

 async function getReportedUsersWithDetails() {
  // Get all users
 const allUsers = await usersService.getUsers();

console.log('I AM HERE EEEEEEE', allUsers);
 // Get reported users data (your extracted array)
 const fraudData = await parkingSpotsService.getFraudReportedLocations();

const reportedUsersData = fraudData.map(report => ({
   userId: report.reportedUser.userId,
      userEmail: report.reportedUser.userEmail,
      reportedAt: report.reportedUser.reportedAt,
      reportedMarkerId: report.reportedMarkerId,
      reason: report.reason
}));
 
// Extract just the IDs from reported users
 const reportedUserIds = reportedUsersData.map(report => report.userId);
console.log('Filtered reported users:',reportedUserIds);
// Filter all users to keep only those who are in the reported list
 const reportedUsersOnly = allUsers.filter(user => 
 reportedUserIds.includes(user.id)

);
setReportedUsers(reportedUsersOnly)

 console.log('Filtered reported users:',reportedUsersOnly);
}




  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

const handleStatusToggle = async (userId, currentStatus) => {
  try {
    setUpdatingUser(userId);
    const newStatus = currentStatus === 'active' ? 'deactivated' : 'active';
    
    console.log('🔘 TOGGLE CLICKED ======================');
    
    // Call the service function
    const result = await usersService.updateUserStatus(userId, newStatus);
    console.log('✅ Service call result:', result);
    
    // Update ALL relevant states
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: newStatus }
        : user
    ));
    
    // ALSO update your filtered/reported users array if it exists separately
    if (setReportedUsers) { // If you have a separate state for reported users
      setReportedUsers(prev => prev.map(user =>
        user.id === userId
          ? { ...user, status: newStatus }
          : user
      ));
    }
    
    console.log('🔄 Local state updated');
    console.log('✅ TOGGLE COMPLETED ======================');
    
  } catch (error) {
    console.error('❌ TOGGLE ERROR:', error);
    setError(`Failed to update user status: ${error.message}`);
  } finally {
    setUpdatingUser(null);
  }
};

  const createSampleUsers = async () => {
    try {
      setLoading(true);
      // Create some sample users for testing
      const sampleUsers = [
        {
          id: 'user1',
          email: 'john@example.com',
          name: 'John Doe',
          role: 'user',
          parkingSpots: 5,
          status: 'active'
        },
        {
          id: 'user2',
          email: 'jane@example.com', 
          name: 'Jane Smith',
          role: 'user',
          parkingSpots: 3,
          status: 'active'
        },
        {
          id: 'user3',
          email: 'mike@example.com',
          name: 'Mike Johnson',
          role: 'user', 
          parkingSpots: 7,
          status: 'active'
        }
      ];

      // Save sample users to Firestore
      for (const user of sampleUsers) {
        await usersService.createOrUpdateUser(user.id, user);
      }

      // Reload users
      const usersData = await usersService.getUsers();
      setUsers(usersData);
    } catch (error) {
      setError('Error creating sample users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Stats for the header
  const activeUsers = users.filter(user => user.status === 'active').length;
  const deactivatedUsers = users.filter(user => user.status === 'deactivated').length;

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" /> {/* Updated here */}
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <>
     <div>
      
      <div className="flex justify-between items-center mb-6">
        
        <div>
            {/* Legend */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">User Status Legend:</h4>
            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Active - Can login and use the app</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span>Deactivated - Cannot login or use the app</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span>Admin - Full access to admin panel</span>
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            {users.length} total users • {activeUsers} active • {deactivatedUsers} deactivated
          </p>
        </div>
        {users.length === 0 && (
          <button
            onClick={createSampleUsers}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Create Sample Users</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        </div>
      )}

      {users.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <UsersIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" /> {/* Updated here */}
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
          <p className="text-gray-600 mb-6">
            The users collection doesn't exist yet or is empty.
            {!error && " Click the button above to create sample users for testing."}
          </p>
          <div className="text-sm text-gray-500">
            <p>In a real app, users would be created when they:</p>
            <ul className="mt-2 space-y-1">
              <li>• Register in the mobile app</li>
              <li>• Sign up via the web portal</li>
              <li>• Are imported from another system</li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter size={20} />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parking Spots
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report Flagging
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.parkingSpots || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogin || 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                         {'reported'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-4">
                          {/* Status Toggle */}
                          {/* <button
                            onClick={() => handleStatusToggle(user.id, user.status)}
                            disabled={updatingUser === user.id || user.role === 'admin'}
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                              user.status === 'active' 
                                ? 'bg-green-500' 
                                : 'bg-gray-200'
                            } ${updatingUser === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={user.role === 'admin' ? 'Cannot deactivate admin users' : `Click to ${user.status === 'active' ? 'deactivate' : 'activate'}`}
                          >
                            <span
                              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                user.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>  */}
                          
                           <span className="text-xs text-gray-500">
                            {user.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                          
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => {/* Add edit functionality */}}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(10, filteredUsers.length)}</span> of{' '}
                    <span className="font-medium">{filteredUsers.length}</span> results
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

        
        </>
      )}
    </div>

     {/* //reported users  */}
      <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reported Users</h1>
          <p className="text-gray-600 mt-1">
            {users.length} total users • {activeUsers} active • {deactivatedUsers} deactivated
          </p>
        </div>
        {users.length === 0 && (
          <button
            onClick={createSampleUsers}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Create Sample Users</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        </div>
      )}

      {users.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <UsersIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" /> {/* Updated here */}
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Reported Users Found</h3>
          <p className="text-gray-600 mb-6">
            The users collection doesn't exist yet or is empty.
            {!error && " Click the button above to create sample users for testing."}
          </p>
          <div className="text-sm text-gray-500">
            <p>In a real app, users would be created when they:</p>
            <ul className="mt-2 space-y-1">
              <li>• Register in the mobile app</li>
              <li>• Sign up via the web portal</li>
              <li>• Are imported from another system</li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter size={20} />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                  
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report Flagging
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.
email

}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                   
                    
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                         {'reported'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-4">
                          {/* Status Toggle */}
                           <button
                            onClick={() => handleStatusToggle(user.id, user.status)}
                            disabled={updatingUser === user.id || user.role === 'admin'}
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                              user.status === 'active' 
                                ? 'bg-green-500' 
                                : 'bg-gray-200'
                            } ${updatingUser === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={user.role === 'admin' ? 'Cannot deactivate admin users' : `Click to ${user.status === 'active' ? 'deactivate' : 'activate'}`}
                          >
                            <span
                              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                user.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button> 
                          
                          <span className="text-xs text-gray-500">
                            {user.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                          
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => {/* Add edit functionality */}}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(10, filteredUsers.length)}</span> of{' '}
                    <span className="font-medium">{filteredUsers.length}</span> results
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

        
        </>
      )}
    </div>
    </>
   



 
  
  );
};

export default Users;