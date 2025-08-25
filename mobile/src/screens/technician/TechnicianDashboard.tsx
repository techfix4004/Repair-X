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

interface AssignedJob {
  id: string;
  jobNumber: string;
  customerName: string;
  deviceType: string;
  issue: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: string;
  assignedAt: string;
  dueDate?: string;
  location?: string;
  estimatedDuration?: number;
}

interface TechnicianDashboardProps {
  route: {
    params: {
      user: User;
      onLogout: () => void;
    };
  };
}

const TechnicianDashboard: React.FC<TechnicianDashboardProps> = ({ route }) => {
  const { user, onLogout } = route.params;
  const [assignedJobs, setAssignedJobs] = useState<AssignedJob[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    todayJobs: 0,
    pendingJobs: 0,
    completedToday: 0,
    avgRating: 4.8,
  });

  useEffect(() => {
    loadTechnicianData();
  }, []);

  const loadTechnicianData = async () => {
    try {
      // Mock API call - replace with actual API
      const mockJobs: AssignedJob[] = [
        {
          id: '1',
          jobNumber: 'JOB-001',
          customerName: 'Alice Johnson',
          deviceType: 'iPhone 14 Pro',
          issue: 'Screen replacement - Customer dropped phone',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          assignedAt: '2025-01-08T09:00:00Z',
          dueDate: '2025-01-08T17:00:00Z',
          location: 'Downtown Store',
          estimatedDuration: 120, // minutes
        },
        {
          id: '2',
          jobNumber: 'JOB-002',
          customerName: 'Bob Smith',
          deviceType: 'MacBook Air M2',
          issue: 'Keyboard replacement - Several keys not working',
          priority: 'MEDIUM',
          status: 'AWAITING_PARTS',
          assignedAt: '2025-01-08T10:30:00Z',
          dueDate: '2025-01-09T12:00:00Z',
          location: 'Mobile Service',
          estimatedDuration: 180,
        },
        {
          id: '3',
          jobNumber: 'JOB-003',
          customerName: 'Carol Davis',
          deviceType: 'Samsung Galaxy S23',
          issue: 'Battery replacement - Poor battery life',
          priority: 'LOW',
          status: 'SCHEDULED',
          assignedAt: '2025-01-08T11:00:00Z',
          dueDate: '2025-01-08T15:00:00Z',
          location: 'North Branch',
          estimatedDuration: 90,
        },
        {
          id: '4',
          jobNumber: 'JOB-004',
          customerName: 'David Wilson',
          deviceType: 'iPad Pro',
          issue: 'Screen and digitizer replacement - Cracked display',
          priority: 'URGENT',
          status: 'QUALITY_CHECK',
          assignedAt: '2025-01-08T08:00:00Z',
          location: 'Downtown Store',
          estimatedDuration: 150,
        },
      ];

      setAssignedJobs(mockJobs);

      // Calculate stats
      const today = new Date().toDateString();
      const todayJobs = mockJobs.filter(job => 
        new Date(job.assignedAt).toDateString() === today
      ).length;
      
      const pendingJobs = mockJobs.filter(job => 
        ['SCHEDULED', 'IN_PROGRESS', 'AWAITING_PARTS'].includes(job.status)
      ).length;
      
      const completedToday = mockJobs.filter(job => 
        job.status === 'COMPLETED' && 
        new Date(job.assignedAt).toDateString() === today
      ).length;

      setStats({ todayJobs, pendingJobs, completedToday, avgRating: 4.8 });
    } catch (error) {
      console.error('Error loading technician data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTechnicianData();
    setRefreshing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return '#F44336';
      case 'HIGH':
        return '#FF9800';
      case 'MEDIUM':
        return '#2196F3';
      case 'LOW':
        return '#4CAF50';
      default:
        return '#666';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '#4CAF50';
      case 'IN_PROGRESS':
        return '#2196F3';
      case 'QUALITY_CHECK':
        return '#9C27B0';
      case 'AWAITING_PARTS':
        return '#FF9800';
      case 'SCHEDULED':
        return '#607D8B';
      default:
        return '#666';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleJobPress = (job: AssignedJob) => {
    Alert.alert(
      `${job.jobNumber} - ${job.customerName}`,
      `Device: ${job.deviceType}\nIssue: ${job.issue}\nPriority: ${job.priority}\nStatus: ${formatStatus(job.status)}\nLocation: ${job.location}${job.estimatedDuration ? `\nEstimated Duration: ${job.estimatedDuration} min` : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start Work', onPress: () => handleStartWork(job) },
        { text: 'View Details', onPress: () => handleViewDetails(job) },
      ]
    );
  };

  const handleStartWork = (job: AssignedJob) => {
    Alert.alert('Work Started', `Started work on ${job.jobNumber}`);
    // Update job status to IN_PROGRESS
  };

  const handleViewDetails = (job: AssignedJob) => {
    // Navigate to detailed job view
    Alert.alert('Navigation', `Would navigate to detailed view for ${job.jobNumber}`);
  };

  const handleQuickAction = (action: string) => {
    Alert.alert('Quick Action', `${action} functionality would be implemented here`);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient colors={['#4CAF50', '#45A049']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.role}>Field Technician</Text>
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
            <Ionicons name="today-outline" size={24} color="white" />
            <Text style={styles.statNumber}>{stats.todayJobs}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FF9800' }]}>
            <Ionicons name="hourglass-outline" size={24} color="white" />
            <Text style={styles.statNumber}>{stats.pendingJobs}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#4CAF50' }]}>
            <Ionicons name="checkmark-circle-outline" size={24} color="white" />
            <Text style={styles.statNumber}>{stats.completedToday}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#9C27B0' }]}>
            <Ionicons name="star-outline" size={24} color="white" />
            <Text style={styles.statNumber}>{stats.avgRating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => handleQuickAction('GPS Navigation')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#2196F3' }]}>
              <Ionicons name="navigate" size={24} color="white" />
            </View>
            <Text style={styles.quickActionText}>Navigate</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => handleQuickAction('Scan QR Code')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#4CAF50' }]}>
              <Ionicons name="qr-code" size={24} color="white" />
            </View>
            <Text style={styles.quickActionText}>QR Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => handleQuickAction('Take Photo')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FF9800' }]}>
              <Ionicons name="camera" size={24} color="white" />
            </View>
            <Text style={styles.quickActionText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => handleQuickAction('Call Support')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#F44336' }]}>
              <Ionicons name="call" size={24} color="white" />
            </View>
            <Text style={styles.quickActionText}>Support</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Assigned Jobs */}
      <View style={styles.jobsContainer}>
        <Text style={styles.sectionTitle}>Assigned Jobs</Text>
        {assignedJobs.map(job => (
          <TouchableOpacity 
            key={job.id} 
            style={styles.jobCard}
            onPress={() => handleJobPress(job)}
          >
            <View style={styles.jobHeader}>
              <View style={styles.jobNumberContainer}>
                <Text style={styles.jobNumber}>{job.jobNumber}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(job.priority) }]}>
                  <Text style={styles.priorityText}>{job.priority}</Text>
                </View>
              </View>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{job.customerName}</Text>
                <Text style={styles.deviceType}>{job.deviceType}</Text>
              </View>
            </View>
            
            <Text style={styles.jobIssue} numberOfLines={2}>{job.issue}</Text>
            
            <View style={styles.jobFooter}>
              <View style={styles.jobMeta}>
                <Text style={styles.location}>
                  <Ionicons name="location" size={12} color="#666" /> {job.location}
                </Text>
                {job.estimatedDuration && (
                  <Text style={styles.duration}>
                    <Ionicons name="time" size={12} color="#666" /> {job.estimatedDuration}m
                  </Text>
                )}
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
                <Text style={styles.statusText}>{formatStatus(job.status)}</Text>
              </View>
            </View>
            
            {job.dueDate && (
              <Text style={styles.dueDate}>
                Due: {new Date(job.dueDate).toLocaleDateString()} at {new Date(job.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
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
    fontSize: 14,
  },
  userName: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  role: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginTop: 2,
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
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  statNumber: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    marginTop: 2,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 11,
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
    marginBottom: 12,
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
    marginBottom: 10,
  },
  jobNumberContainer: {
    alignItems: 'flex-start',
  },
  jobNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  customerInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  customerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  deviceType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  jobIssue: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 18,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobMeta: {
    flex: 1,
  },
  location: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  duration: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  dueDate: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: 'bold',
  },
});

export default TechnicianDashboard;