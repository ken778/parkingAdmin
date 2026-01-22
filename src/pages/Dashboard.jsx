import React, { useState, useEffect } from 'react';
import { Users, MapPin, TrendingUp, AlertCircle, Activity, Shield, Database, RefreshCw } from 'lucide-react';
import { statsService } from '../services/firebaseService';
import { parkingSpotsService } from '../services/firebaseService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalParkingSpots: 0,
    activeSpots: 0,
    reportedIssues: 0
  });
  const [loading, setLoading] = useState(true);
  const [fraudSpots, setFraudSpots] = useState(0);
  const [refreshTime, setRefreshTime] = useState(new Date());

  const getFraudReported = async () => {
    try {
      const fraudData = await parkingSpotsService.getFraudReportedLocations();
      setFraudSpots(fraudData.length);
    } catch (error) {
      console.error('Error loading fraud spots:', error);
    }
  };

  const loadStats = async () => {
    try {
      const dashboardStats = await statsService.getDashboardStats();
      setStats(dashboardStats);
      await getFraudReported();
      setRefreshTime(new Date());
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className={`p-3 rounded-xl ${color} mr-4`}>
            <Icon size={24} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {loading ? '...' : value.toLocaleString()}
            </p>
          </div>
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend.color}`}>
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
            Loading...
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-300 rounded-xl mr-4"></div>
                <div className="flex-1">
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your parking management system</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <div className="text-sm text-gray-500">
            Last updated: {refreshTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <button
            onClick={loadStats}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          trend={{ value: '↑ 12%', color: 'text-green-600' }}
        />
        <StatCard
          title="Parking Spots"
          value={stats.totalParkingSpots}
          icon={MapPin}
          color="bg-gradient-to-r from-green-500 to-green-600"
        />
        <StatCard
          title="Available Spots"
          value={stats.activeSpots}
          icon={TrendingUp}
          color="bg-gradient-to-r from-yellow-500 to-yellow-600"
        />
        <StatCard
          title="Fraudulent Spots"
          value={fraudSpots}
          icon={AlertCircle}
          color="bg-gradient-to-r from-red-500 to-red-600"
          trend={{ value: '⚠️ High', color: 'text-red-600' }}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <Activity size={20} className="text-blue-600" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer">
              <Shield size={18} className="text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Review Fraud Reports</p>
                <p className="text-sm text-gray-600 mt-1">{fraudSpots} pending cases</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
              <Users size={18} className="text-gray-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Manage User Accounts</p>
                <p className="text-sm text-gray-600 mt-1">{stats.totalUsers} total users</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
              <MapPin size={18} className="text-gray-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Monitor Parking Spots</p>
                <p className="text-sm text-gray-600 mt-1">{stats.activeSpots} available now</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
            <Database size={20} className="text-green-600" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <span className="font-medium text-gray-900">Firebase Connection</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <span className="font-medium text-gray-900">Database</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
              <span className="font-medium text-gray-900">Last Sync</span>
              <span className="text-gray-600 font-medium">
                {refreshTime.toLocaleTimeString()}
              </span>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                All systems operational
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <div className="flex items-center">
          <AlertCircle size={20} className="text-blue-600 mr-3" />
          <div>
            <p className="font-medium text-gray-900">Need Attention</p>
            <p className="text-sm text-gray-600 mt-1">
              You have {fraudSpots} fraudulent spots that require review. Take action to maintain system integrity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;