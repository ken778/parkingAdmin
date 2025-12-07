import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, CheckCircle, XCircle, Clock, Eye, Trash2, AlertCircle, RefreshCw, User, Calendar, Navigation } from 'lucide-react';
import { parkingSpotsService } from '../services/firebaseService';

const ParkingSpots = () => {
  const [spots, setSpots] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
      }
    };

    loadParkingSpots();

    // Set up real-time listener
    const unsubscribe = parkingSpotsService.subscribeToParkingSpots((realTimeSpots) => {
      console.log('Real-time update received:', realTimeSpots.length, 'spots');
      setSpots(realTimeSpots);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Helper function to format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    try {
      if (timestamp.toDate) {
        // Firestore timestamp
        const date = timestamp.toDate();
        return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
      } else if (timestamp instanceof Date) {
        // JavaScript Date object
        return timestamp.toLocaleDateString() + ' at ' + timestamp.toLocaleTimeString();
      } else {
        // String or other format
        return new Date(timestamp).toLocaleDateString();
      }
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid date';
    }
  };

  // Helper function to get display values from spot data
  const getSpotDisplayData = (spot) => {
    return {
      id: spot.id,
      title: spot.title || 'Available Parking',
      description: spot.description || 'Tap for directions',
      status: spot.status || 'available',
      reportedBy: spot.reportedBy || 'anonymous',
      reportedDate: formatTimestamp(spot.createdAt),
      latitude: spot.latitude || -25.9501,
      longitude: spot.longitude || 28.1036,
      // Include all original data
      ...spot
    };
  };

  const refreshSpots = async () => {
    try {
      setLoading(true);
      const spotsData = await parkingSpotsService.getParkingSpots();
      setSpots(spotsData);
    } catch (error) {
      setError('Error refreshing spots: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const displaySpots = spots.map(getSpotDisplayData);
  
  const filteredSpots = displaySpots.filter(spot => {
    const matchesSearch = spot.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spot.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spot.reportedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || spot.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'occupied':
        return <XCircle size={16} className="text-red-500" />;
      case 'reserved':
        return <Clock size={16} className="text-yellow-500" />;
      default:
        return <MapPin size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (loading && spots.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Parking Locations</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <RefreshCw className="mx-auto h-12 w-12 text-gray-400 mb-4 animate-spin" />
          <p className="text-gray-600">Loading parking locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parking Locations</h1>
          <p className="text-gray-600 mt-1">
            {displaySpots.length} location{displaySpots.length !== 1 ? 's' : ''} found
            {loading && ' (updating...)'}
          </p>
        </div>
        <button
          onClick={refreshSpots}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <MapPin className="text-blue-500 mr-3" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Locations</p>
              <p className="text-2xl font-bold text-gray-900">
                {displaySpots.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <CheckCircle className="text-green-500 mr-3" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">
                {displaySpots.filter(s => s.status === 'available').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <User className="text-purple-500 mr-3" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Reported By</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(displaySpots.map(s => s.reportedBy)).size}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Calendar className="text-orange-500 mr-3" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {displaySpots.filter(s => {
                  const spotDate = s.createdAt?.toDate ? s.createdAt.toDate() : new Date(s.reportedDate);
                  const today = new Date();
                  return spotDate.toDateString() === today.toDateString();
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by title, description, or reporter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
          </select>
        </div>
      </div>

      {/* Parking Locations Grid */}
      {displaySpots.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Parking Locations Found</h3>
          <p className="text-gray-600 mb-4">
            There are no parking locations in the database yet.
          </p>
          <div className="text-sm text-gray-500">
            <p>Parking locations will appear here when users report them in the mobile app.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpots.map((spot) => (
              <div key={spot.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header with Title and Status */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{spot.title}</h3>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(spot.status)}
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(spot.status)}`}>
                        {spot.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4">{spot.description}</p>
                  
                  {/* Location Details */}
                  <div className="space-y-3 text-sm text-gray-500 mb-4">
                    <div className="flex items-start">
                      <Navigation size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-mono text-xs">
                          {spot.latitude.toFixed(6)}, {spot.longitude.toFixed(6)}
                        </div>
                        <button
                          onClick={() => openInGoogleMaps(spot.latitude, spot.longitude)}
                          className="text-blue-600 hover:text-blue-800 text-xs mt-1"
                        >
                          View on Google Maps
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <User size={16} className="mr-2 flex-shrink-0" />
                      <span>Reported by: <strong>{spot.reportedBy}</strong></span>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2 flex-shrink-0" />
                      <span>Reported on: {spot.reportedDate}</span>
                    </div>
                  </div>

                  {/* Status Management */}
                  <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-600 font-medium w-full mb-2">Update Status:</span>
                    <button
                      onClick={() => handleUpdateStatus(spot.id, 'available')}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        spot.status === 'available' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      Available
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(spot.id, 'occupied')}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        spot.status === 'occupied' 
                          ? 'bg-red-600 text-white' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      Occupied
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(spot.id, 'reserved')}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        spot.status === 'reserved' 
                          ? 'bg-yellow-600 text-white' 
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      }`}
                    >
                      Reserved
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => openInGoogleMaps(spot.latitude, spot.longitude)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Navigation size={16} className="mr-1" />
                      View Map
                    </button>
                    <button 
                      onClick={() => handleDeleteSpot(spot.id)}
                      className="bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm font-medium hover:bg-gray-300 transition-colors flex items-center justify-center"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty Search State */}
          {filteredSpots.length === 0 && displaySpots.length > 0 && (
            <div className="text-center py-8">
              <Search size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No matching locations found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ParkingSpots;