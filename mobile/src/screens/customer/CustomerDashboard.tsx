import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

interface Job {
  id: string;
  deviceType: string;
  issue: string;
  status: string;
  createdAt: string;
  estimatedCompletion?: string;
  technician?: string;
  cost?: number;
}

interface CustomerDashboardProps {
  route: {
    params: {
      user: User;
      onLogout: () => void;
    };
  };
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ route }) => {
  const { user, onLogout } = route.params;
  const [jobs, setJobs] = useState<Job[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    activeJobs: 0,
    completedJobs: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock API call - replace with actual API
      const mockJobs: Job[] = [
        {
          id: '1',
          deviceType: 'iPhone 13',
          issue: 'Cracked screen replacement',
          status: 'IN_PROGRESS',
          createdAt: '2025-01-08',
          estimatedCompletion: '2025-01-10',
          technician: 'John Tech',
          cost: 250,
        },
        {
          id: '2',
          deviceType: 'MacBook Pro',
          issue: 'Battery replacement',
          status: 'AWAITING_APPROVAL',
          createdAt: '2025-01-07',
          cost: 180,
        },
        {
          id: '3',
          deviceType: 'Samsung Galaxy S21',
          issue: 'Water damage repair',
          status: 'COMPLETED',
          createdAt: '2025-01-05',
          technician: 'Sarah Repair',
          cost: 320,
        },
      ];

      setJobs(mockJobs);

      // Calculate stats
      const activeJobs = mockJobs.filter(job => 
        ['CREATED', 'IN_PROGRESS', 'AWAITING_APPROVAL', 'IN_DIAGNOSIS'].includes(job.status)
      ).length;
      
      const completedJobs = mockJobs.filter(job => job.status === 'COMPLETED').length;
      
      const totalSpent = mockJobs
        .filter(job => job.status === 'COMPLETED')
        .reduce((sum, job) => sum + (job.cost || 0), 0);

      setStats({ activeJobs, completedJobs, totalSpent });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '#4CAF50';
      case 'IN_PROGRESS':
        return '#2196F3';
      case 'AWAITING_APPROVAL':
        return '#FF9800';
      case 'CANCELLED':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'checkmark-circle';
      case 'IN_PROGRESS':
        return 'build';
      case 'AWAITING_APPROVAL':
        return 'time';
      case 'CANCELLED':
        return 'close-circle';
      default:
        return 'ellipse';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleJobPress = (job: Job) => {
    Alert.alert(
      job.deviceType,
      `Issue: ${job.issue}\nStatus: ${formatStatus(job.status)}${job.technician ? `\nTechnician: ${job.technician}` : ''}${job.cost ? `\nCost: $${job.cost}` : ''}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient colors={['#2196F3', '#21CBF3']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
          <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#2196F3' }]}>
            <Ionicons name="build-outline" size={30} color="white" />
            <Text style={styles.statNumber}>{stats.activeJobs}</Text>
            <Text style={styles.statLabel}>Active Jobs</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#4CAF50' }]}>
            <Ionicons name="checkmark-circle-outline" size={30} color="white" />
            <Text style={styles.statNumber}>{stats.completedJobs}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
        <View style={[styles.statCard, styles.fullWidthCard, { backgroundColor: '#FF9800' }]}>
          <Ionicons name="card-outline" size={30} color="white" />
          <Text style={styles.statNumber}>${stats.totalSpent}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.quickActionButton}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="add-circle" size={30} color="#2196F3" />
            </View>
            <Text style={styles.quickActionText}>New Repair</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="camera" size={30} color="#4CAF50" />
            </View>
            <Text style={styles.quickActionText}>QR Check-in</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="chatbubble" size={30} color="#FF9800" />
            </View>
            <Text style={styles.quickActionText}>Support</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Jobs */}
      <View style={styles.jobsContainer}>
        <Text style={styles.sectionTitle}>Recent Jobs</Text>
        {jobs.map(job => (
          <TouchableOpacity 
            key={job.id} 
            style={styles.jobCard}
            onPress={() => handleJobPress(job)}
          >
            <View style={styles.jobHeader}>
              <View style={styles.jobInfo}>
                <Text style={styles.jobDevice}>{job.deviceType}</Text>
                <Text style={styles.jobIssue}>{job.issue}</Text>
              </View>
              <Ionicons 
                name={getStatusIcon(job.status) as any} 
                size={24} 
                color={getStatusColor(job.status)} 
              />
            </View>
            <View style={styles.jobFooter}>
              <Text style={[styles.jobStatus, { color: getStatusColor(job.status) }]}>
                {formatStatus(job.status)}
              </Text>
              {job.cost && (
                <Text style={styles.jobCost}>${job.cost}</Text>
              )}
            </View>
            <View style={styles.jobMeta}>
              <Text style={styles.jobDate}>Created: {job.createdAt}</Text>
              {job.estimatedCompletion && (
                <Text style={styles.jobEta}>ETA: {job.estimatedCompletion}</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statsContainer: {
    padding: 20,
    marginTop: -30,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fullWidthCard: {
    marginHorizontal: 0,
  },
  statNumber: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 5,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  jobsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  jobCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  jobInfo: {
    flex: 1,
  },
  jobDevice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  jobIssue: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  jobCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  jobMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  jobDate: {
    fontSize: 12,
    color: '#999',
  },
  jobEta: {
    fontSize: 12,
    color: '#999',
  },
});

export default CustomerDashboard;