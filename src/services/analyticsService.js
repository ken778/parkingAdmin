import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  limit 
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const analyticsService = {
  // Get user growth data (last 30 days)
  getUserGrowthData: async () => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      // For now, we'll simulate growth data since we don't have historical user data
      // In a real app, you'd store user creation dates and query by date ranges
      const last30Days = generateLast30Days();
      const userCounts = simulateUserGrowth(snapshot.size, last30Days);
      
      return {
        labels: last30Days,
        datasets: [
          {
            label: 'Total Users',
            data: userCounts,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      };
    } catch (error) {
      console.error('Error getting user growth data:', error);
      throw error;
    }
  },

  // Get parking spots growth data
  getParkingSpotsGrowthData: async () => {
    try {
      const spotsRef = collection(db, 'parkingLocations');
      const q = query(spotsRef, orderBy('createdAt', 'asc'));
      const snapshot = await getDocs(q);
      
      // Group spots by date
      const spotsByDate = {};
      snapshot.docs.forEach(doc => {
        const spot = doc.data();
        if (spot.createdAt) {
          const date = spot.createdAt.toDate ? spot.createdAt.toDate() : new Date(spot.createdAt);
          const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
          
          if (!spotsByDate[dateKey]) {
            spotsByDate[dateKey] = 0;
          }
          spotsByDate[dateKey]++;
        }
      });

      // Generate last 30 days with actual data
      const last30Days = generateLast30Days();
      const spotCounts = last30Days.map(date => {
        const dateKey = new Date(date).toISOString().split('T')[0];
        return spotsByDate[dateKey] || 0;
      });

      // Calculate cumulative totals
      const cumulativeSpots = [];
      let total = 0;
      spotCounts.forEach(count => {
        total += count;
        cumulativeSpots.push(total);
      });

      return {
        labels: last30Days,
        datasets: [
          {
            label: 'New Spots Daily',
            data: spotCounts,
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Total Spots',
            data: cumulativeSpots,
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      };
    } catch (error) {
      console.error('Error getting parking spots growth data:', error);
      throw error;
    }
  },

  // Get usage statistics (available vs occupied)
  getUsageStatistics: async () => {
    try {
      const spotsRef = collection(db, 'parkingLocations');
      const snapshot = await getDocs(spotsRef);
      
      const statusCounts = {
        available: 0,
        occupied: 0,
        reserved: 0
      };

      snapshot.docs.forEach(doc => {
        const spot = doc.data();
        const status = spot.status || 'available';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      return {
        labels: ['Available', 'Occupied', 'Reserved'],
        datasets: [
          {
            data: [statusCounts.available, statusCounts.occupied, statusCounts.reserved],
            backgroundColor: [
              'rgb(34, 197, 94)', // Green for available
              'rgb(239, 68, 68)', // Red for occupied
              'rgb(245, 158, 11)' // Yellow for reserved
            ],
            borderColor: [
              'rgb(34, 197, 94)',
              'rgb(239, 68, 68)',
              'rgb(245, 158, 11)'
            ],
            borderWidth: 2
          }
        ]
      };
    } catch (error) {
      console.error('Error getting usage statistics:', error);
      throw error;
    }
  },

  // Get reporting activity (spots reported per user)
  getReportingActivity: async () => {
    try {
      const spotsRef = collection(db, 'parkingLocations');
      const snapshot = await getDocs(spotsRef);
      
      const userActivity = {};
      snapshot.docs.forEach(doc => {
        const spot = doc.data();
        const user = spot.reportedBy || 'anonymous';
        userActivity[user] = (userActivity[user] || 0) + 1;
      });

      // Get top 5 most active users
      const topUsers = Object.entries(userActivity)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

      return {
        labels: topUsers.map(([user]) => user),
        datasets: [
          {
            label: 'Spots Reported',
            data: topUsers.map(([,count]) => count),
            backgroundColor: 'rgba(139, 92, 246, 0.8)',
            borderColor: 'rgb(139, 92, 246)',
            borderWidth: 2
          }
        ]
      };
    } catch (error) {
      console.error('Error getting reporting activity:', error);
      throw error;
    }
  }
};

// Helper functions
function generateLast30Days() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  return days;
}

function simulateUserGrowth(currentUsers, days) {
  // Simulate realistic user growth starting from 0 to current users
  const growth = [];
  let users = 0;
  
  for (let i = 0; i < days.length; i++) {
    // More growth at the beginning, slowing down as we approach current count
    const progress = i / days.length;
    const dailyGrowth = Math.max(1, Math.floor((currentUsers - users) * (0.1 + Math.random() * 0.2)));
    
    users = Math.min(currentUsers, users + dailyGrowth);
    growth.push(users);
  }
  
  return growth;
}