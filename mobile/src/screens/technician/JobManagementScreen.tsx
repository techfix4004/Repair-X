import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../../services/apiService';

interface Job {
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
  customerContact?: string;
}

interface JobManagementProps {
  navigation?: any;
}

const JobManagementScreen: React.FC<JobManagementProps> = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const jobStatuses = [
    { value: 'ACCEPTED', label: 'Accept Job', color: '#4CAF50' },
    { value: 'IN_PROGRESS', label: 'Start Work', color: '#2196F3' },
    { value: 'PARTS_NEEDED', label: 'Parts Needed', color: '#FF9800' },
    { value: 'CUSTOMER_APPROVAL', label: 'Need Approval', color: '#9C27B0' },
    { value: 'TESTING', label: 'Testing', color: '#00BCD4' },
    { value: 'COMPLETED', label: 'Complete Job', color: '#4CAF50' },
    { value: 'CANCELLED', label: 'Cancel Job', color: '#F44336' },
  ];

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const result = await apiService.getTechnicianJobs();
      
      if (result._success && result.data) {
        // Transform API data to match our interface
        const transformedJobs = result.data.map((job: any) => ({
          id: job.id,
          jobNumber: job.jobNumber || `JOB-${job.id.slice(-6).toUpperCase()}`,
          customerName: job.customer?.name || 'Unknown Customer',
          deviceType: job.device?.type || job.deviceType || 'Unknown Device',
          issue: job.issue || 'No issue description',
          priority: job.priority || 'MEDIUM',
          status: job.status,
          assignedAt: job.assignedAt || job.createdAt,
          dueDate: job.dueDate,
          location: job.customer?.address,
          estimatedDuration: job.estimatedDuration,
          customerContact: job.customer?.phone || job.customer?.email,
        }));
        setJobs(transformedJobs);
      } else {
        // Fallback to mock data
        setJobs([
          {
            id: '1',
            jobNumber: 'JOB-001',
            customerName: 'Alice Johnson',
            deviceType: 'iPhone 13',
            issue: 'Cracked screen replacement',
            priority: 'HIGH',
            status: 'ASSIGNED',
            assignedAt: '2025-01-08T10:00:00Z',
            dueDate: '2025-01-10T17:00:00Z',
            location: '123 Main St, City',
            estimatedDuration: 60,
            customerContact: '+1 (555) 123-4567',
          },
          {
            id: '2',
            jobNumber: 'JOB-002',
            customerName: 'Bob Smith',
            deviceType: 'MacBook Pro',
            issue: 'Battery replacement',
            priority: 'MEDIUM',
            status: 'IN_PROGRESS',
            assignedAt: '2025-01-07T14:30:00Z',
            location: '456 Oak Ave, City',
            estimatedDuration: 120,
            customerContact: 'bob.smith@email.com',
          },
          {
            id: '3',
            jobNumber: 'JOB-003',
            customerName: 'Carol Davis',
            deviceType: 'Samsung Galaxy S21',
            issue: 'Water damage repair',
            priority: 'URGENT',
            status: 'ASSIGNED',
            assignedAt: '2025-01-08T09:15:00Z',
            dueDate: '2025-01-08T18:00:00Z',
            location: '789 Pine St, City',
            estimatedDuration: 180,
            customerContact: '+1 (555) 987-6543',
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
      Alert.alert('Error', 'Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'URGENT': return '#F44336';
      case 'HIGH': return '#FF9800';
      case 'MEDIUM': return '#2196F3';
      case 'LOW': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toUpperCase()) {
      case 'ASSIGNED': return '#9C27B0';
      case 'ACCEPTED': return '#4CAF50';
      case 'IN_PROGRESS': return '#2196F3';
      case 'PARTS_NEEDED': return '#FF9800';
      case 'CUSTOMER_APPROVAL': return '#9C27B0';
      case 'TESTING': return '#00BCD4';
      case 'COMPLETED': return '#4CAF50';
      case 'CANCELLED': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const formatStatus = (status: string): string => {
    return status.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openStatusModal = (job: Job) => {
    setSelectedJob(job);
    setNewStatus('');
    setStatusNotes('');
    setShowStatusModal(true);
  };

  const updateJobStatus = async () => {
    if (!selectedJob || !newStatus) return;

    setUpdatingStatus(true);
    try {
      const result = await apiService.updateJobStatus(selectedJob.id, newStatus, statusNotes);
      
      if (result._success) {
        // Update local job state
        setJobs(prev => prev.map(job => 
          job.id === selectedJob.id 
            ? { ...job, status: newStatus }
            : job
        ));
        
        Alert.alert(
          'Status Updated',
          `Job ${selectedJob.jobNumber} status updated to ${formatStatus(newStatus)}`
        );
      } else {
        Alert.alert('Update Failed', result.error || 'Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update job status. Please try again.');
      console.error('Status update error:', error);
    } finally {
      setUpdatingStatus(false);
      setShowStatusModal(false);
    }
  };

  const callCustomer = (phone?: string) => {
    if (phone) {
      // In a real app, this would trigger a phone call
      Alert.alert('Call Customer', `Would call: ${phone}`);
    }
  };

  const navigateToLocation = (location?: string) => {
    if (location) {
      // In a real app, this would open maps navigation
      Alert.alert('Navigate', `Would navigate to: ${location}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading your jobs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B35', '#F7931E']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Job Management</Text>
        <Text style={styles.headerSubtitle}>Your assigned repair jobs</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {jobs.filter(j => j.status === 'ASSIGNED').length}
            </Text>
            <Text style={styles.statLabel}>New</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {jobs.filter(j => j.status === 'IN_PROGRESS').length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {jobs.filter(j => j.status === 'COMPLETED').length}
            </Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.jobsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {jobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No jobs assigned</Text>
            <Text style={styles.emptyMessage}>
              You don't have any assigned jobs at the moment.
            </Text>
          </View>
        ) : (
          jobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              style={styles.jobCard}
              onPress={() => openStatusModal(job)}
            >
              <View style={styles.jobHeader}>
                <View style={styles.jobTitleContainer}>
                  <Text style={styles.jobNumber}>{job.jobNumber}</Text>
                  <Text style={styles.customerName}>{job.customerName}</Text>
                </View>
                <View style={styles.badges}>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(job.priority) },
                    ]}
                  >
                    <Text style={styles.badgeText}>{job.priority}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(job.status) },
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {formatStatus(job.status)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.deviceInfo}>
                <Text style={styles.deviceType}>{job.deviceType}</Text>
                <Text style={styles.issue}>{job.issue}</Text>
              </View>

              <View style={styles.jobDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    Assigned: {formatDate(job.assignedAt)}
                  </Text>
                </View>

                {job.dueDate && (
                  <View style={styles.detailRow}>
                    <Ionicons name="alarm-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      Due: {formatDate(job.dueDate)}
                    </Text>
                  </View>
                )}

                {job.estimatedDuration && (
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      Est. {job.estimatedDuration} mins
                    </Text>
                  </View>
                )}

                {job.location && (
                  <TouchableOpacity 
                    style={styles.detailRow}
                    onPress={() => navigateToLocation(job.location)}
                  >
                    <Ionicons name="location-outline" size={16} color="#2196F3" />
                    <Text style={[styles.detailText, styles.linkText]}>
                      {job.location}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.jobActions}>
                {job.customerContact && (
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => callCustomer(job.customerContact)}
                  >
                    <Ionicons name="call-outline" size={16} color="#2196F3" />
                    <Text style={styles.actionButtonText}>Call</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={[styles.actionButton, styles.primaryActionButton]}
                  onPress={() => openStatusModal(job)}
                >
                  <Ionicons name="settings-outline" size={16} color="white" />
                  <Text style={[styles.actionButtonText, styles.primaryActionButtonText]}>
                    Update
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Status Update Modal */}
      <Modal
        visible={showStatusModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Update Job Status - {selectedJob?.jobNumber}
              </Text>
              <TouchableOpacity
                onPress={() => setShowStatusModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalSubtitle}>Select new status:</Text>
              
              {jobStatuses.map((status) => (
                <TouchableOpacity
                  key={status.value}
                  style={[
                    styles.statusOption,
                    newStatus === status.value && styles.statusOptionSelected,
                  ]}
                  onPress={() => setNewStatus(status.value)}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: status.color },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusOptionText,
                      newStatus === status.value && styles.statusOptionTextSelected,
                    ]}
                  >
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}

              <Text style={styles.modalSubtitle}>Notes (optional):</Text>
              <TextInput
                style={styles.notesInput}
                value={statusNotes}
                onChangeText={setStatusNotes}
                placeholder="Add notes about this status update..."
                multiline
                numberOfLines={3}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={() => setShowStatusModal(false)}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.updateButton,
                  (!newStatus || updatingStatus) && styles.updateButtonDisabled,
                ]}
                onPress={updateJobStatus}
                disabled={!newStatus || updatingStatus}
              >
                {updatingStatus ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.updateButtonText}>Update Status</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  jobsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  jobCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  jobNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  customerName: {
    fontSize: 14,
    color: '#666',
  },
  badges: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  deviceInfo: {
    marginBottom: 12,
  },
  deviceType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  issue: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  jobDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  linkText: {
    color: '#2196F3',
  },
  jobActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginLeft: 8,
  },
  primaryActionButton: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginLeft: 4,
  },
  primaryActionButtonText: {
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
    maxHeight: 400,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  statusOptionSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusOptionText: {
    fontSize: 14,
    color: '#333',
  },
  statusOptionTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#f8f9fa',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelModalButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 10,
  },
  cancelModalButtonText: {
    fontSize: 16,
    color: '#666',
  },
  updateButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#FF6B35',
    marginLeft: 10,
  },
  updateButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default JobManagementScreen;