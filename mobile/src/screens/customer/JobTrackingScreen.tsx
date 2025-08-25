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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService, Job } from '../../services/apiService';

interface JobTrackingProps {
  navigation?: any;
}

const JobTrackingScreen: React.FC<JobTrackingProps> = ({ navigation }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const result = await apiService.getCustomerJobs();
      
      if (result._success && result.data) {
        setJobs(result.data);
      } else {
        // Fallback to mock data if API fails
        setJobs([
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
            cost: 320,
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

  const getStatusColor = (status: string): string => {
    switch (status.toUpperCase()) {
      case 'CREATED':
      case 'AWAITING_APPROVAL':
        return '#FF9800';
      case 'IN_PROGRESS':
      case 'IN_DIAGNOSIS':
        return '#2196F3';
      case 'COMPLETED':
      case 'DELIVERED':
        return '#4CAF50';
      case 'CANCELLED':
        return '#F44336';
      default:
        return '#9E9E9E';
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
      year: 'numeric',
    });
  };

  const filteredJobs = selectedStatus === 'ALL' 
    ? jobs 
    : jobs.filter(job => job.status === selectedStatus);

  const statusFilters = [
    { label: 'All', value: 'ALL' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Awaiting Approval', value: 'AWAITING_APPROVAL' },
    { label: 'Completed', value: 'COMPLETED' },
  ];

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
        colors={['#2196F3', '#21CBF3']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Job Tracking</Text>
        <Text style={styles.headerSubtitle}>Track your repair progress</Text>
      </LinearGradient>

      {/* Status Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {statusFilters.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterTab,
              selectedStatus === filter.value && styles.filterTabActive,
            ]}
            onPress={() => setSelectedStatus(filter.value)}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedStatus === filter.value && styles.filterTabTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.jobsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {filteredJobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No jobs found</Text>
            <Text style={styles.emptyMessage}>
              {selectedStatus === 'ALL' 
                ? "You don't have any repair jobs yet." 
                : `No jobs with status "${formatStatus(selectedStatus)}" found.`
              }
            </Text>
          </View>
        ) : (
          filteredJobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              style={styles.jobCard}
              onPress={() => {
                // Navigate to job details screen
                Alert.alert('Job Details', `View details for ${job.deviceType}`);
              }}
            >
              <View style={styles.jobHeader}>
                <View style={styles.jobTitleContainer}>
                  <Text style={styles.jobTitle}>{job.deviceType}</Text>
                  <Text style={styles.jobIssue}>{job.issue}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(job.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {formatStatus(job.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.jobDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    Created: {formatDate(job.createdAt)}
                  </Text>
                </View>

                {job.estimatedCompletion && (
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      Est. completion: {formatDate(job.estimatedCompletion)}
                    </Text>
                  </View>
                )}

                {job.technician && (
                  <View style={styles.detailRow}>
                    <Ionicons name="person-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      Technician: {job.technician}
                    </Text>
                  </View>
                )}

                {job.cost && (
                  <View style={styles.detailRow}>
                    <Ionicons name="cash-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      Cost: ${job.cost}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.jobActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>View Details</Text>
                </TouchableOpacity>
                {job.status === 'AWAITING_APPROVAL' && (
                  <TouchableOpacity style={[styles.actionButton, styles.primaryActionButton]}>
                    <Text style={[styles.actionButtonText, styles.primaryActionButtonText]}>
                      Approve
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterTabActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: 'white',
  },
  jobsList: {
    flex: 1,
    paddingHorizontal: 20,
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  jobIssue: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  jobDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  jobActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginLeft: 10,
  },
  primaryActionButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  primaryActionButtonText: {
    color: 'white',
  },
});

export default JobTrackingScreen;