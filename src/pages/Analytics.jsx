import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { analyticsService } from '../services/analyticsService';
import { TrendingUp, Users, MapPin, Activity, RefreshCw, AlertCircle } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const [userGrowthData, setUserGrowthData] = useState(null);
  const [spotsGrowthData, setSpotsGrowthData] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [reportingData, setReportingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');

      const [userGrowth, spotsGrowth, usageStats, reportingActivity] = await Promise.all([
        analyticsService.getUserGrowthData(),
        analyticsService.getParkingSpotsGrowthData(),
        analyticsService.getUsageStatistics(),
        analyticsService.getReportingActivity()
      ]);

      setUserGrowthData(userGrowth);
      setSpotsGrowthData(spotsGrowth);
      setUsageData(usageStats);
      setReportingData(reportingActivity);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setError('Failed to load analytics data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <RefreshCw className="mx-auto h-12 w-12 text-gray-400 mb-4 animate-spin" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track growth and usage patterns</p>
        </div>
        <button
          onClick={loadAnalyticsData}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw size={20} />
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Users className="text-blue-500 mr-2" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">User Growth (Last 30 Days)</h2>
          </div>
          <div className="h-64">
            {userGrowthData ? (
              <Line data={userGrowthData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Parking Spots Growth Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <MapPin className="text-green-500 mr-2" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Parking Spots Growth</h2>
          </div>
          <div className="h-64">
            {spotsGrowthData ? (
              <Line data={spotsGrowthData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Activity className="text-purple-500 mr-2" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Parking Spot Status</h2>
          </div>
          <div className="h-64">
            {usageData ? (
              <Doughnut data={usageData} options={doughnutOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Reporting Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="text-orange-500 mr-2" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Top Reporters</h2>
          </div>
          <div className="h-64">
            {reportingData ? (
              <Bar data={reportingData} options={barOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="text-blue-500 mr-3" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {userGrowthData?.datasets[0]?.data?.slice(-1)[0] || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <MapPin className="text-green-500 mr-3" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spots</p>
              <p className="text-2xl font-bold text-gray-900">
                {spotsGrowthData?.datasets[1]?.data?.slice(-1)[0] || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Activity className="text-purple-500 mr-3" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Available Now</p>
              <p className="text-2xl font-bold text-gray-900">
                {usageData?.datasets[0]?.data[0] || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="text-orange-500 mr-3" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Active Reporters</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportingData?.labels?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;