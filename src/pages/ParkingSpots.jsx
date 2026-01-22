import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Trash2, 
  AlertCircle, 
  RefreshCw, 
  User, 
  Calendar, 
  Navigation,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Download,
  Layers,
  TrendingUp,
  Shield,
  Plus,
  Star,
  Target,
  Globe,
  Building,
  ParkingSquare
} from 'lucide-react';
import { parkingSpotsService } from '../services/firebaseService';

const ParkingSpots = () => {
  const [spots, setSpots] = useState([]);
  const [fraudReports, setFraudReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    loadParkingSpots();
    loadFraudReports();
    
    // Set up real-time listener
    const unsubscribe = parkingSpotsService.subscribeToParkingSpots((realTimeSpots) => {
      console.log('Real-time update received:', realTimeSpots.length, 'spots');
      setSpots(realTimeSpots);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadParkingSpots = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading parking spots from parkingLocations...');
      
      const spotsData = await parkingSpotsService.getParkingSpots();
      console.log('Loaded spots:', spotsData);
      setSpots(spotsData);
    } catch (error) {
      console.error('Error loading parking spots:', error);
      setError(`Failed to load parking spots: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadFraudReports = async () => {
    try {
      const reports = await parkingSpotsService.getFraudReportedLocations();
      setFraudReports(reports);
    } catch (error) {
      console.error('Error loading fraud reports:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadParkingSpots();
    await loadFraudReports();
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    try {
      if (timestamp.toDate) {
        const date = timestamp.toDate();
        return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
      } else if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString() + ' at ' + timestamp.toLocaleTimeString();
      } else {
        return new Date(timestamp).toLocaleDateString();
      }
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid date';
    }
  };

  const getSpotDisplayData = (spot) => {
    const isReported = fraudReports.some(report => report.reportedMarkerId === spot.id);
    const spotReports = fraudReports.filter(report => report.reportedMarkerId === spot.id);
    
    return {
      id: spot.id,
      title: spot.title || 'Available Parking',
      description: spot.description || 'Tap for directions',
      status: spot.status || 'available',
      reportedBy: spot.reportedBy || 'anonymous',
      reportedDate: formatTimestamp(spot.createdAt),
      latitude: spot.latitude || -25.9501,
      longitude: spot.longitude || 28.1036,
      isFraudReported: isReported,
      fraudReports: spotReports,
      fraudReportCount: spotReports.length,
      address: spot.address || 'No address provided',
      price: spot.price || 'Free',
      capacity: spot.capacity || 1,
      ...spot
    };
  };

  const displaySpots = spots.map(getSpotDisplayData);
  
  const filteredSpots = displaySpots.filter(spot => {
    const matchesSearch = spot.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spot.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spot.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spot.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    switch (filter) {
      case 'available':
        matchesFilter = spot.status === 'available';
        break;
      case 'occupied':
        matchesFilter = spot.status === 'occupied';
        break;
      case 'reserved':
        matchesFilter = spot.status === 'reserved';
        break;
      case 'reported':
        matchesFilter = spot.isFraudReported;
        break;
      default:
        matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSpots = filteredSpots.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSpots.length / itemsPerPage);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'occupied':
        return <XCircle size={18} className="text-red-500" />;
      case 'reserved':
        return <Clock size={18} className="text-yellow-500" />;
      default:
        return <MapPin size={18} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'occupied':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const handleDeleteSpot = async (spotId) => {
    if (window.confirm('Are you sure you want to delete this parking location?')) {
      try {
        await parkingSpotsService.deleteParkingSpot(spotId);
      } catch (error) {
        console.error('Error deleting spot:', error);
        alert('Error deleting parking location: ' + error.message);
      }
    }
  };

  const handleUpdateStatus = async (spotId, newStatus) => {
    try {
      await parkingSpotsService.updateParkingSpot(spotId, { status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status: ' + error.message);
    }
  };

  const openInGoogleMaps = (lat, lng) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const handleViewDetails = (spot) => {
    setSelectedSpot(spot);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedSpot(null);
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center">
        <div className={`p-3 rounded-xl ${color} mr-4`}>
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
          {trend && (
            <div className={`text-xs font-medium ${trend.color} mt-1`}>
              {trend.icon} {trend.value}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading && !refreshing) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Parking Management</h1>
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

  const totalSpots = displaySpots.length;
  const availableSpots = displaySpots.filter(s => s.status === 'available').length;
  const occupiedSpots = displaySpots.filter(s => s.status === 'occupied').length;
  const reportedSpots = displaySpots.filter(s => s.isFraudReported).length;
  const uniqueReporters = new Set(displaySpots.map(s => s.reportedBy)).size;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parking Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all parking locations in real-time</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
            >
              <Layers size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
            >
              <Eye size={18} />
            </button>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
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
          title="Total Locations"
          value={totalSpots}
          icon={ParkingSquare}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          trend={{ icon: '📍', value: `${totalSpots} spots`, color: 'text-blue-600' }}
        />
        <StatCard
          title="Available"
          value={availableSpots}
          icon={CheckCircle}
          color="bg-gradient-to-r from-green-500 to-green-600"
          trend={{ icon: '✅', value: `${Math.round((availableSpots / totalSpots) * 100)}% available`, color: 'text-green-600' }}
        />
        <StatCard
          title="Reported"
          value={reportedSpots}
          icon={Shield}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
          trend={{ icon: '⚠️', value: `${reportedSpots} flagged`, color: 'text-orange-600' }}
        />
        <StatCard
          title="Active Reporters"
          value={uniqueReporters}
          icon={TrendingUp}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          trend={{ icon: '👤', value: `${uniqueReporters} users`, color: 'text-purple-600' }}
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by title, description, reporter, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="reported">Reported Spots</option>
            </select>
            <button className="flex items-center px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter size={18} className="mr-2" />
              Advanced Filter
            </button>
            <button className="flex items-center px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <Download size={18} className="mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Parking Spots Content */}
      {displaySpots.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <MapPin className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Parking Locations Found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            There are no parking locations in the database yet.
            Parking locations will appear here when users report them in the mobile app.
          </p>
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentSpots.map((spot) => (
                <div key={spot.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(spot.status)}`}>
                      {getStatusIcon(spot.status)}
                      <span className="ml-2">{spot.status}</span>
                    </div>
                    {spot.isFraudReported && (
                      <div className="mt-2 inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 border border-orange-200 rounded-full text-xs font-semibold">
                        <AlertCircle size={12} className="mr-1" />
                        {spot.fraudReportCount} reports
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    {/* Title and Rating */}
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{spot.title}</h3>
                      <div className="flex items-center">
                        <Star size={16} className="text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-gray-700 ml-1">4.8</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{spot.description}</p>

                    {/* Quick Info */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Building size={14} className="mr-2" />
                        <span className="truncate">{spot.address.split(',')[0]}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <User size={14} className="mr-2" />
                        <span>By: {spot.reportedBy}</span>
                      </div>
                    </div>

                    {/* Coordinates */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Globe size={14} className="text-gray-400 mr-2" />
                          <div className="text-xs">
                            <div className="font-mono text-gray-600">{spot.latitude.toFixed(6)}, {spot.longitude.toFixed(6)}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => openInGoogleMaps(spot.latitude, spot.longitude)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          <Navigation size={14} className="inline mr-1" />
                          Map
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleViewDetails(spot)}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <Eye size={16} className="mr-2" />
                        Details
                      </button>
                      <button
                        onClick={() => handleDeleteSpot(spot.id)}
                        className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Delete location"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Location Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Reporter
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Coordinates
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentSpots.map((spot) => (
                      <tr key={spot.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold mr-4">
                              <MapPin size={18} />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{spot.title}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{spot.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${
                              spot.status === 'available' ? 'bg-green-500' : 
                              spot.status === 'occupied' ? 'bg-red-500' : 'bg-yellow-500'
                            }`}></div>
                            <span className={`text-sm font-medium ${
                              spot.status === 'available' ? 'text-green-700' : 
                              spot.status === 'occupied' ? 'text-red-700' : 'text-yellow-700'
                            }`}>
                              {spot.status}
                            </span>
                            {spot.isFraudReported && (
                              <AlertCircle size={14} className="text-orange-500 ml-2" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <User size={14} className="text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{spot.reportedBy}</div>
                              <div className="text-xs text-gray-500">{spot.reportedDate}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-mono text-gray-600">
                            {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewDetails(spot)}
                              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => openInGoogleMaps(spot.latitude, spot.longitude)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Open in Google Maps"
                            >
                              <Navigation size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteSpot(spot.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              title="Delete location"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-semibold">{Math.min(indexOfLastItem, filteredSpots.length)}</span> of{' '}
                <span className="font-semibold">{filteredSpots.length}</span> parking spots
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
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
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Empty Search State */}
          {filteredSpots.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Matching Locations Found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </>
      )}

      {/* Spot Details Modal */}
      {showDetails && selectedSpot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedSpot.title}</h2>
                  <p className="text-gray-600 mt-1">Parking Location Details</p>
                </div>
                <div className="flex items-center space-x-3">
                  {selectedSpot.isFraudReported && (
                    <div className="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg border border-orange-200 flex items-center">
                      <AlertCircle size={16} className="mr-2" />
                      {selectedSpot.fraudReportCount} fraud reports
                    </div>
                  )}
                  <button
                    onClick={handleCloseDetails}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={24} />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center">
                    <MapPin className="text-blue-600 mr-4" size={24} />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Location Status</p>
                      <div className="flex items-center mt-2">
                        <div className={`w-4 h-4 rounded-full mr-2 ${
                          selectedSpot.status === 'available' ? 'bg-green-500' : 
                          selectedSpot.status === 'occupied' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></div>
                        <p className="text-lg font-bold text-gray-900 capitalize">{selectedSpot.status}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center">
                    <User className="text-green-600 mr-4" size={24} />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Reported By</p>
                      <p className="text-lg font-bold text-gray-900 mt-2">{selectedSpot.reportedBy}</p>
                      <p className="text-sm text-gray-600 mt-1">{selectedSpot.reportedDate}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center">
                    <Target className="text-purple-600 mr-4" size={24} />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Coordinates</p>
                      <p className="text-sm font-mono text-gray-900 mt-2">
                        {selectedSpot.latitude.toFixed(6)}, {selectedSpot.longitude.toFixed(6)}
                      </p>
                      <button
                        onClick={() => openInGoogleMaps(selectedSpot.latitude, selectedSpot.longitude)}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium mt-2 flex items-center"
                      >
                        <Navigation size={14} className="mr-1" />
                        View on Google Maps
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-600">{selectedSpot.description}</p>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <button
                    onClick={() => handleUpdateStatus(selectedSpot.id, 'available')}
                    className={`p-4 rounded-xl border transition-colors ${
                      selectedSpot.status === 'available' 
                        ? 'bg-green-600 text-white border-green-600' 
                        : 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <CheckCircle size={20} className="mr-2" />
                      Mark as Available
                    </div>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedSpot.id, 'occupied')}
                    className={`p-4 rounded-xl border transition-colors ${
                      selectedSpot.status === 'occupied' 
                        ? 'bg-red-600 text-white border-red-600' 
                        : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <XCircle size={20} className="mr-2" />
                      Mark as Occupied
                    </div>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedSpot.id, 'reserved')}
                    className={`p-4 rounded-xl border transition-colors ${
                      selectedSpot.status === 'reserved' 
                        ? 'bg-yellow-600 text-white border-yellow-600' 
                        : 'bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <Clock size={20} className="mr-2" />
                      Mark as Reserved
                    </div>
                  </button>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleCloseDetails}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleDeleteSpot(selectedSpot.id)}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <Trash2 size={18} className="inline mr-2" />
                    Delete Location
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingSpots;