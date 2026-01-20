import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Users Collection
// Users Collection
export const usersService = {
  // Get all users
// Get all users
getUsers: async () => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const users = snapshot.docs.map(doc => {
      const userData = doc.data();
      
      // Helper function to safely convert Firestore Timestamps
      const convertTimestamp = (timestamp) => {
        if (!timestamp) return null;
        if (timestamp.toDate && typeof timestamp.toDate === 'function') {
          return timestamp.toDate().toLocaleDateString();
        }
        // If it's already a string or other format, return as is
        return timestamp;
      };
      
      return {
        id: doc.id,
        name: userData.name || userData.email?.split('@')[0] || 'Unknown User',
        email: userData.email || 'No email',
        joinDate: convertTimestamp(userData.createdAt) || new Date().toLocaleDateString(),
        status: userData.status || 'active',
        parkingSpots: userData.parkingSpotsCount || 0,
        role: userData.role || 'user',
        lastLogin: convertTimestamp(userData.lastLogin) || 'Never',
        // Don't spread userData to avoid timestamp conflicts
      };
    });
    
    console.log('Processed users:', users);
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
},

  // Get user by ID
  getUser: async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const snapshot = await getDoc(userRef);
      return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  // Update user status (activate/deactivate)
// Update user status (activate/deactivate)
updateUserStatus: async (userId, status) => {
  try {
    console.log('🛠️ SERVICE CALLED ======================');
    console.log('👤 User ID:', userId);
    console.log('🎯 Target Status:', status);
    
    const userRef = doc(db, 'users', userId);
    
    // Create the update data
    const updateData = {
      status: status,
      updatedAt: new Date()
    };
    
    console.log('📝 Base update data:', updateData);
    
    // Add deactivatedAt only when deactivating
    if (status === 'deactivated') {
      updateData.deactivatedAt = new Date();
      console.log('🔴 Added deactivatedAt timestamp');
    } else if (status === 'active') {
      // Clear deactivatedAt when reactivating
      updateData.deactivatedAt = null;
      console.log('🟢 Cleared deactivatedAt field');
    }
    
    console.log('📝 Final update data:', updateData);
    
    // Perform the update
    console.log('🚀 Sending update to Firestore...');
    await updateDoc(userRef, updateData);
    console.log('✅ Firestore update successful!');
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ SERVICE ERROR:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
},

  // Update user (general)
  updateUser: async (userId, data) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Create or update user
  createOrUpdateUser: async (userId, userData) => {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...userData,
        status: userData.status || 'active', // Default to active
        updatedAt: new Date()
      }, { merge: true });
      return { success: true };
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    }
  }
};

// Parking Spots Collection - UPDATED to use parkingLocations
export const parkingSpotsService = {
  // Get all parking spots
  getParkingSpots: async () => {
    try {
      const spotsRef = collection(db, 'parkingLocations');
      const q = query(spotsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      console.log('Parking spots found:', snapshot.size);
      const spots = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`Spot ${doc.id}:`, data);
        return {
          id: doc.id,
          ...data
        };
      });
      
      return spots;
    } catch (error) {
      console.error('Error getting parking spots:', error);
      
      // If ordering fails, try without order
      if (error.code === 'failed-precondition') {
        console.log('Retrying without orderBy...');
        const spotsRef = collection(db, 'parkingLocations');
        const snapshot = await getDocs(spotsRef);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }
      
      throw error;
    }
  },

  // Get parking spot by ID
  getParkingSpot: async (spotId) => {
    try {
      const spotRef = doc(db, 'parkingLocations', spotId);
      const snapshot = await getDoc(spotRef);
      return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
    } catch (error) {
      console.error('Error getting parking spot:', error);
      throw error;
    }
  },

  // Update parking spot
  updateParkingSpot: async (spotId, data) => {
    try {
      const spotRef = doc(db, 'parkingLocations', spotId);
      await updateDoc(spotRef, data);
      return { success: true };
    } catch (error) {
      console.error('Error updating parking spot:', error);
      throw error;
    }
  },

  // Delete parking spot
  deleteParkingSpot: async (spotId) => {
    try {
      const spotRef = doc(db, 'parkingLocations', spotId);
      await deleteDoc(spotRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting parking spot:', error);
      throw error;
    }
  },

  // Get real-time updates
  subscribeToParkingSpots: (callback) => {
    try {
      const spotsRef = collection(db, 'parkingLocations');
      const q = query(spotsRef, orderBy('createdAt', 'desc'));
      
      return onSnapshot(q, (snapshot) => {
        const spots = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(spots);
      }, (error) => {
        console.error('Real-time subscription error:', error);
      });
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
      // Fallback without ordering
      const spotsRef = collection(db, 'parkingLocations');
      return onSnapshot(spotsRef, (snapshot) => {
        const spots = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(spots);
      });
    }
  },

  //get fraud data
    getFraudReportedLocations: async () => {
    try {
      const spotsRef = collection(db, 'fraudReports');
      const q = query(spotsRef, orderBy('timestamp'));
      const snapshot = await getDocs(q);
      
      console.log('fraudReportsParking spots found:', snapshot.size);
      const spots = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`fraudReports ${doc.id}:`, data);
        return {
          id: doc.id,
          ...data
        };
      });
      
      return spots;
    } catch (error) {
      console.error('Error getting fraudReports spots:', error);
      
      // If ordering fails, try without order
      if (error.code === 'failed-precondition') {
        console.log('Retrying without orderBy...');
        const spotsRef = collection(db, 'fraudReports');
        const snapshot = await getDocs(spotsRef);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }
      
      throw error;
    }
  }

};

// Analytics/Stats - UPDATED to be consistent
export const statsService = {
  getDashboardStats: async () => {
    try {
      const [usersSnapshot, spotsSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'parkingLocations')) // Changed to parkingLocations
      ]);

      const totalUsers = usersSnapshot.size;
      const totalSpots = spotsSnapshot.size;
      
      // Count available spots
      const availableSpots = spotsSnapshot.docs.filter(
        doc => doc.data().status === 'available'
      ).length;

      // Count spots with reports
      const reportedSpots = spotsSnapshot.docs.filter(
        doc => doc.data().reports && doc.data().reports > 0
      ).length;

      return {
        totalUsers,
        totalParkingSpots: totalSpots,
        activeSpots: availableSpots,
        reportedIssues: reportedSpots
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }
};