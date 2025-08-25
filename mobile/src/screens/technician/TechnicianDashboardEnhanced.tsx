/**
 * Enhanced Technician Mobile Dashboard with Offline Capabilities
 * Mobile-First Field Operations from RepairX roadmap
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  customer?: {
    phone: string;
    address: string;
  };
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
  const [assignedJobs, setAssignedJobs] = useState<AssignedJob[]>([
    {
      id: '1',
      jobNumber: 'JOB-2024-001',
      customerName: 'John Smith',
      deviceType: 'iPhone 14',
      issue: 'Screen replacement needed',
      priority: 'HIGH',
      status: 'ASSIGNED',
      assignedAt: '2024-01-08T09:00:00Z',
      location: '123 Main St, City, State',
      estimatedDuration: 2,
      customer: {
        phone: '+1234567890',
        address: '123 Main St, City, State'
      }
    },
    {
      id: '2',
      jobNumber: 'JOB-2024-002',
      customerName: 'Sarah Johnson',
      deviceType: 'Samsung Galaxy S23',
      issue: 'Battery replacement required',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      assignedAt: '2024-01-08T10:30:00Z',
      location: '456 Oak Ave, City, State',
      estimatedDuration: 1.5,
      customer: {
        phone: '+1234567891',
        address: '456 Oak Ave, City, State'
      }
    }
  ]);

  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    todayJobs: 5,
    pendingJobs: 2,
    completedJobs: 3,
    averageRating: 4.8,
    totalEarnings: 285,
    hoursWorked: 6.5
  });

  const [isOnline] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedTab, setSelectedTab] = useState('today');
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [selectedJob, setSelectedJob] = useState<AssignedJob | null>(null);

  const mockApiCall = () => {
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await mockApiCall();
    setRefreshing(false);
  };

  const updateJobStatus = (jobId: string, newStatus: string) => {
    setAssignedJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );
    Alert.alert('Success', `Job status updated to ${newStatus}`);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.technicianName}>{user.name}</Text>
      </View>
      <View style={styles.headerActions}>
        <View style={styles.availabilityToggle}>
          <Text style={styles.toggleLabel}>Available</Text>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ false: '#d1d5db', true: '#10b981' }}
          />
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: isOnline ? '#10b981' : '#ef4444' }]}>
          <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.todayJobs}</Text>
          <Text style={styles.statLabel}>Today's Jobs</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.completedJobs}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.averageRating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>${stats.totalEarnings}</Text>
          <Text style={styles.statLabel}>Earnings</Text>
        </View>
      </View>
    </View>
  );

  const renderJob = (job: AssignedJob) => {
    const priorityColor = {
      LOW: '#10b981',
      MEDIUM: '#f59e0b', 
      HIGH: '#ef4444',
      URGENT: '#dc2626',
    }[job.priority];

    const statusColor = {
      'ASSIGNED': '#3b82f6',
      'IN_PROGRESS': '#f59e0b',
      'COMPLETED': '#10b981',
      'ON_HOLD': '#6b7280',
    }[job.status] || '#6b7280';

    return (
      <TouchableOpacity
        key={job.id}
        style={styles.jobCard}
        onPress={() => {
          setSelectedJob(job);
          setShowJobDetails(true);
        }}
      >
        <View style={styles.jobHeader}>
          <View>
            <Text style={styles.jobNumber}>{job.jobNumber}</Text>
            <Text style={styles.customerName}>{job.customerName}</Text>
          </View>
          <View>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
              <Text style={styles.priorityText}>{job.priority}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{job.status}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.deviceInfo}>{job.deviceType}</Text>
        <Text style={styles.issueDescription} numberOfLines={2}>
          {job.issue}
        </Text>

        <View style={styles.jobFooter}>
          <View style={styles.jobMeta}>
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <Text style={styles.metaText}>{job.location}</Text>
          </View>
          {job.estimatedDuration && (
            <View style={styles.jobMeta}>
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text style={styles.metaText}>{job.estimatedDuration}h</Text>
            </View>
          )}
        </View>

        <View style={styles.jobActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="navigate-outline" size={20} color="#2563eb" />
            <Text style={styles.actionButtonText}>Navigate</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => updateJobStatus(job.id, 'IN_PROGRESS')}
          >
            <Ionicons name="play-outline" size={20} color="#059669" />
            <Text style={styles.actionButtonText}>Start</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="camera-outline" size={20} color="#7c3aed" />
            <Text style={styles.actionButtonText}>Photo</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderJobDetailsModal = () => {
    if (!selectedJob) return null;

    return (
      <Modal visible={showJobDetails} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowJobDetails(false)}>
              <Ionicons name="close" size={28} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Job Details</Text>
            <TouchableOpacity>
              <Ionicons name="ellipsis-horizontal" size={28} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.jobDetailSection}>
              <Text style={styles.sectionTitle}>Job Information</Text>
              <Text style={styles.detailText}>Job Number: {selectedJob.jobNumber}</Text>
              <Text style={styles.detailText}>Status: {selectedJob.status}</Text>
              <Text style={styles.detailText}>Priority: {selectedJob.priority}</Text>
              <Text style={styles.detailText}>Estimated Duration: {selectedJob.estimatedDuration || 'N/A'}h</Text>
            </View>

            <View style={styles.jobDetailSection}>
              <Text style={styles.sectionTitle}>Customer Information</Text>
              <Text style={styles.detailText}>{selectedJob.customerName}</Text>
              <Text style={styles.detailText}>{selectedJob.customer?.phone || 'No phone'}</Text>
              <Text style={styles.detailText}>{selectedJob.customer?.address || selectedJob.location}</Text>
            </View>

            <View style={styles.jobDetailSection}>
              <Text style={styles.sectionTitle}>Device & Issue</Text>
              <Text style={styles.detailText}>{selectedJob.deviceType}</Text>
              <Text style={styles.detailText}>Issue: {selectedJob.issue}</Text>
            </View>

            {/* Status update buttons */}
            <View style={styles.statusButtons}>
              <TouchableOpacity
                style={[styles.statusButton, { backgroundColor: '#f59e0b' }]}
                onPress={() => {
                  updateJobStatus(selectedJob.id, 'IN_PROGRESS');
                  setShowJobDetails(false);
                }}
              >
                <Text style={styles.statusButtonText}>Start Job</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statusButton, { backgroundColor: '#8b5cf6' }]}
                onPress={() => {
                  updateJobStatus(selectedJob.id, 'ON_HOLD');
                  setShowJobDetails(false);
                }}
              >
                <Text style={styles.statusButtonText}>Put On Hold</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statusButton, { backgroundColor: '#059669' }]}
                onPress={() => {
                  updateJobStatus(selectedJob.id, 'COMPLETED');
                  setShowJobDetails(false);
                }}
              >
                <Text style={styles.statusButtonText}>Mark Complete</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderStats()}

      {/* Job Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'today' && styles.activeTab]}
          onPress={() => setSelectedTab('today')}
        >
          <Text style={[styles.tabText, selectedTab === 'today' && styles.activeTabText]}>
            Today ({assignedJobs.filter(job => job.status !== 'COMPLETED').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'completed' && styles.activeTab]}
          onPress={() => setSelectedTab('completed')}
        >
          <Text style={[styles.tabText, selectedTab === 'completed' && styles.activeTabText]}>
            Completed ({assignedJobs.filter(job => job.status === 'COMPLETED').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Job List */}
      <ScrollView
        style={styles.jobList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {assignedJobs
          .filter(job => 
            selectedTab === 'today' 
              ? job.status !== 'COMPLETED' 
              : job.status === 'COMPLETED'
          )
          .map(renderJob)}

        {assignedJobs.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No jobs assigned yet</Text>
          </View>
        )}
      </ScrollView>

      {renderJobDetailsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  welcomeText: {
    fontSize: 16,
    color: '#6b7280',
  },
  technicianName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerActions: {
    alignItems: 'flex-end',
  },
  availabilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleLabel: {
    marginRight: 8,
    fontSize: 16,
    color: '#374151',
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    padding: 4,
  },
  statsContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  jobList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  jobCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  customerName: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  deviceInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  issueDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  jobActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  jobDetailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
    lineHeight: 24,
  },
  statusButtons: {
    marginTop: 20,
  },
  statusButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  statusButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TechnicianDashboard;