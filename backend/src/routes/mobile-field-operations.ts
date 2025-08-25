/**
 * Enhanced Mobile Field Operations System
 * Advanced mobile-first field operations with offline capabilities, GPS tracking,
 * digital signatures, and comprehensive field service management.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// Schemas for Mobile Field Operations
const FieldTechnicianSchema = z.object({
  id: z.string().optional(),
  employeeId: z.string(),
  personalInfo: z.object({
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string(),
    email: z.string().email(),
    emergencyContact: z.object({
      name: z.string(),
      phone: z.string(),
      relationship: z.string(),
    }).optional(),
  }),
  fieldOperations: z.object({
    vehicleInfo: z.object({
      make: z.string(),
      model: z.string(),
      year: z.number(),
      licensePlate: z.string(),
      color: z.string(),
    }).optional(),
    serviceArea: z.object({
      primaryZip: z.string(),
      radiusMiles: z.number(),
      coverageAreas: z.array(z.string()),
    }),
    equipment: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(['TOOL', 'DIAGNOSTIC', 'SAFETY', 'CONSUMABLE']),
      condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR']),
      lastInspected: z.string(),
    })).default([]),
    certifications: z.array(z.object({
      name: z.string(),
      issuedBy: z.string(),
      issuedDate: z.string(),
      expiryDate: z.string(),
      certificateNumber: z.string(),
    })).default([]),
  }),
  mobileCapabilities: z.object({
    hasSmartphone: z.boolean().default(true),
    hasTablet: z.boolean().default(false),
    hasLaptop: z.boolean().default(false),
    gpsEnabled: z.boolean().default(true),
    offlineCapable: z.boolean().default(true),
    digitalSignature: z.boolean().default(true),
    photoCapture: z.boolean().default(true),
  }),
  workSchedule: z.object({
    availability: z.array(z.object({
      dayOfWeek: z.number().min(0).max(6),
      startTime: z.string(),
      endTime: z.string(),
      isAvailable: z.boolean(),
    })),
    maxJobsPerDay: z.number().min(1).max(20).default(8),
    travelTimeBuffer: z.number().min(15).max(120).default(30), // minutes
  }),
  performance: z.object({
    rating: z.number().min(1).max(5).default(5),
    completionRate: z.number().min(0).max(100).default(100),
    customerSatisfaction: z.number().min(1).max(5).default(5),
    onTimeArrival: z.number().min(0).max(100).default(95),
    avgJobDuration: z.number().min(0).default(120), // minutes
  }),
  status: z.enum(['ACTIVE', 'ON_DUTY', 'OFF_DUTY', 'UNAVAILABLE', 'SUSPENDED']).default('ACTIVE'),
  location: z.object({
    current: z.object({
      latitude: z.number(),
      longitude: z.number(),
      accuracy: z.number().optional(),
      timestamp: z.string(),
    }).optional(),
    lastKnown: z.object({
      latitude: z.number(),
      longitude: z.number(),
      timestamp: z.string(),
    }).optional(),
  }),
  tenantId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const MobileJobAssignmentSchema = z.object({
  id: z.string().optional(),
  jobId: z.string(),
  technicianId: z.string(),
  assignmentType: z.enum(['AUTO', 'MANUAL', 'EMERGENCY', 'PREFERRED']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'EMERGENCY']).default('NORMAL'),
  scheduledTime: z.object({
    date: z.string(),
    timeSlot: z.object({
      start: z.string(),
      end: z.string(),
    }),
    estimatedDuration: z.number(), // minutes
  }),
  location: z.object({
    address: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    specialInstructions: z.string().optional(),
    accessCodes: z.string().optional(),
  }),
  jobDetails: z.object({
    customerName: z.string(),
    contactPhone: z.string(),
    deviceType: z.string(),
    issueDescription: z.string(),
    serviceType: z.string(),
    partsRequired: z.array(z.string()).default([]),
    specialSkills: z.array(z.string()).default([]),
  }),
  fieldOperations: z.object({
    allowOffline: z.boolean().default(true),
    requiresSignature: z.boolean().default(true),
    requiresPhotos: z.boolean().default(true),
    maxPhotoCount: z.number().min(1).max(20).default(10),
    qualityChecklist: z.array(z.string()).default([]),
  }),
  tracking: z.object({
    status: z.enum([
      'ASSIGNED',
      'ACCEPTED',
      'DECLINED',
      'EN_ROUTE',
      'ARRIVED',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
    ]).default('ASSIGNED'),
    acceptedAt: z.string().optional(),
    arrivedAt: z.string().optional(),
    startedAt: z.string().optional(),
    completedAt: z.string().optional(),
    travelTime: z.number().optional(), // minutes
    workTime: z.number().optional(), // minutes
  }),
  offline: z.object({
    isOfflineCapable: z.boolean().default(true),
    syncRequired: z.boolean().default(false),
    lastSyncAt: z.string().optional(),
    offlineActions: z.array(z.object({
      action: z.string(),
      timestamp: z.string(),
      data: z.unknown(),
    })).default([]),
  }),
  tenantId: z.string().optional(),
  createdAt: z.string().optional(),
});

const FieldWorkRecordSchema = z.object({
  id: z.string().optional(),
  assignmentId: z.string(),
  jobId: z.string(),
  technicianId: z.string(),
  workLog: z.object({
    arrivalTime: z.string().optional(),
    departureTime: z.string().optional(),
    workDuration: z.number().optional(), // minutes
    travelDistance: z.number().optional(), // miles
    mileage: z.object({
      start: z.number().optional(),
      end: z.number().optional(),
      total: z.number().optional(),
    }).optional(),
  }),
  serviceDetails: z.object({
    diagnosis: z.string().optional(),
    workPerformed: z.string().optional(),
    partsUsed: z.array(z.object({
      partId: z.string(),
      partName: z.string(),
      quantity: z.number(),
      cost: z.number(),
    })).default([]),
    laborHours: z.number().min(0).default(0),
    laborRate: z.number().min(0).default(0),
    totalCost: z.number().min(0).default(0),
  }),
  qualityAssurance: z.object({
    checklist: z.array(z.object({
      item: z.string(),
      completed: z.boolean(),
      notes: z.string().optional(),
    })).default([]),
    testResults: z.array(z.object({
      test: z.string(),
      result: z.enum(['PASS', 'FAIL', 'N/A']),
      notes: z.string().optional(),
    })).default([]),
    finalInspection: z.boolean().default(false),
  }),
  documentation: z.object({
    photos: z.array(z.object({
      id: z.string(),
      filename: z.string(),
      url: z.string(),
      type: z.enum(['BEFORE', 'PROGRESS', 'AFTER', 'PROBLEM', 'SOLUTION']),
      description: z.string().optional(),
      timestamp: z.string(),
      gpsLocation: z.object({
        latitude: z.number(),
        longitude: z.number(),
      }).optional(),
    })).default([]),
    customerSignature: z.object({
      signatureImage: z.string(),
      customerName: z.string(),
      timestamp: z.string(),
      deviceInfo: z.object({
        device: z.string(),
        browser: z.string(),
        ipAddress: z.string(),
      }),
    }).optional(),
    notes: z.string().optional(),
  }),
  customerFeedback: z.object({
    rating: z.number().min(1).max(5).optional(),
    comments: z.string().optional(),
    issues: z.array(z.string()).default([]),
    followUpRequired: z.boolean().default(false),
  }),
  billing: z.object({
    laborCost: z.number().min(0).default(0),
    partsCost: z.number().min(0).default(0),
    travelCost: z.number().min(0).default(0),
    totalCost: z.number().min(0).default(0),
    invoiceGenerated: z.boolean().default(false),
    paymentStatus: z.enum(['PENDING', 'PAID', 'PARTIAL', 'DISPUTED']).default('PENDING'),
  }),
  syncStatus: z.object({
    isOnlineRecord: z.boolean().default(true),
    lastSyncAt: z.string().optional(),
    syncErrors: z.array(z.string()).default([]),
    pendingUploads: z.array(z.string()).default([]), // File URLs pending upload
  }),
  tenantId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const MobileDeviceSchema = z.object({
  id: z.string().optional(),
  technicianId: z.string(),
  deviceInfo: z.object({
    deviceType: z.enum(['SMARTPHONE', 'TABLET', 'LAPTOP']),
    manufacturer: z.string(),
    model: z.string(),
    osVersion: z.string(),
    appVersion: z.string(),
    deviceId: z.string().optional(),
  }),
  capabilities: z.object({
    gps: z.boolean().default(true),
    camera: z.boolean().default(true),
    offline: z.boolean().default(true),
    signature: z.boolean().default(true),
    barcode: z.boolean().default(true),
    nfc: z.boolean().default(false),
    bluetooth: z.boolean().default(true),
  }),
  configuration: z.object({
    offlineMode: z.boolean().default(true),
    autoSync: z.boolean().default(true),
    syncInterval: z.number().min(5).max(60).default(15), // minutes
    photoQuality: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
    gpsAccuracy: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('HIGH'),
  }),
  status: z.object({
    isOnline: z.boolean().default(true),
    lastSeen: z.string().optional(),
    batteryLevel: z.number().min(0).max(100).optional(),
    storageUsed: z.number().min(0).optional(), // MB
    storageAvailable: z.number().min(0).optional(), // MB
  }),
  tenantId: z.string().optional(),
  registeredAt: z.string().optional(),
  lastUpdated: z.string().optional(),
});

// Enhanced Mobile Field Operations Service
class MobileFieldOperationsService {
  private technicians: Map<string, any> = new Map();
  private assignments: Map<string, any> = new Map();
  private workRecords: Map<string, any> = new Map();
  private devices: Map<string, any> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample field technicians
    const sampleTechnicians = [
      {
        id: 'tech-001',
        employeeId: 'EMP-001',
        personalInfo: {
          firstName: 'John',
          lastName: 'Smith',
          phone: '+1-555-0201',
          email: 'john.smith@repairx.com',
          emergencyContact: {
            name: 'Jane Smith',
            phone: '+1-555-0202',
            relationship: 'Spouse',
          },
        },
        fieldOperations: {
          vehicleInfo: {
            make: 'Ford',
            model: 'Transit',
            year: 2023,
            licensePlate: 'RX-001',
            color: 'White',
          },
          serviceArea: {
            primaryZip: '10001',
            radiusMiles: 25,
            coverageAreas: ['10001', '10002', '10003', '10004', '10005'],
          },
          equipment: [
            {
              id: 'eq-001',
              name: 'Digital Multimeter',
              type: 'DIAGNOSTIC',
              condition: 'EXCELLENT',
              lastInspected: '2025-08-01T00:00:00Z',
            },
            {
              id: 'eq-002',
              name: 'Mobile Repair Kit',
              type: 'TOOL',
              condition: 'GOOD',
              lastInspected: '2025-08-01T00:00:00Z',
            },
          ],
          certifications: [
            {
              name: 'Mobile Device Repair Certification',
              issuedBy: 'RepairX Academy',
              issuedDate: '2024-01-15',
              expiryDate: '2026-01-15',
              certificateNumber: 'RXA-2024-001',
            },
          ],
        },
        mobileCapabilities: {
          hasSmartphone: true,
          hasTablet: true,
          hasLaptop: false,
          gpsEnabled: true,
          offlineCapable: true,
          digitalSignature: true,
          photoCapture: true,
        },
        workSchedule: {
          availability: [
            { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', isAvailable: true },
            { dayOfWeek: 2, startTime: '08:00', endTime: '17:00', isAvailable: true },
            { dayOfWeek: 3, startTime: '08:00', endTime: '17:00', isAvailable: true },
            { dayOfWeek: 4, startTime: '08:00', endTime: '17:00', isAvailable: true },
            { dayOfWeek: 5, startTime: '08:00', endTime: '17:00', isAvailable: true },
            { dayOfWeek: 6, startTime: '09:00', endTime: '15:00', isAvailable: true },
            { dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isAvailable: false },
          ],
          maxJobsPerDay: 8,
          travelTimeBuffer: 30,
        },
        performance: {
          rating: 4.8,
          completionRate: 96.5,
          customerSatisfaction: 4.7,
          onTimeArrival: 94.2,
          avgJobDuration: 125,
        },
        status: 'ON_DUTY',
        location: {
          current: {
            latitude: 40.7128,
            longitude: -74.0060,
            accuracy: 5,
            timestamp: new Date().toISOString(),
          },
          lastKnown: {
            latitude: 40.7128,
            longitude: -74.0060,
            timestamp: new Date(Date.now() - 300000).toISOString(),
          },
        },
        createdAt: '2024-01-01T00:00:00Z',
      },
    ];

    sampleTechnicians.forEach((tech: unknown) => {
      this.technicians.set(tech.id, tech);
    });

    // Sample mobile assignments
    const sampleAssignments = [
      {
        id: 'assign-001',
        jobId: 'job-001',
        technicianId: 'tech-001',
        assignmentType: 'AUTO',
        priority: 'HIGH',
        scheduledTime: {
          date: '2025-08-10',
          timeSlot: {
            start: '10:00',
            end: '12:00',
          },
          estimatedDuration: 90,
        },
        location: {
          address: '123 Customer St, New York, NY 10001',
          latitude: 40.7589,
          longitude: -73.9851,
          specialInstructions: 'Ring doorbell twice',
        },
        jobDetails: {
          customerName: 'Alice Johnson',
          contactPhone: '+1-555-0301',
          deviceType: 'iPhone 14',
          issueDescription: 'Cracked screen replacement needed',
          serviceType: 'Screen Repair',
          partsRequired: ['iPhone 14 Screen Assembly'],
          specialSkills: ['Mobile Repair'],
        },
        fieldOperations: {
          allowOffline: true,
          requiresSignature: true,
          requiresPhotos: true,
          maxPhotoCount: 10,
          qualityChecklist: [
            'Screen functionality test',
            'Touch responsiveness check',
            'Camera alignment verification',
            'Customer satisfaction confirmation',
          ],
        },
        tracking: {
          status: 'ACCEPTED',
          acceptedAt: '2025-08-10T08:30:00Z',
        },
        offline: {
          isOfflineCapable: true,
          syncRequired: false,
        },
        createdAt: '2025-08-10T08:00:00Z',
      },
    ];

    sampleAssignments.forEach((assignment: unknown) => {
      this.assignments.set(assignment.id, assignment);
    });

    // Sample mobile devices
    const sampleDevices = [
      {
        id: 'device-001',
        technicianId: 'tech-001',
        deviceInfo: {
          deviceType: 'SMARTPHONE',
          manufacturer: 'Apple',
          model: 'iPhone 13',
          osVersion: 'iOS 16.5',
          appVersion: '2.1.0',
          deviceId: 'ABC123DEF456',
        },
        capabilities: {
          gps: true,
          camera: true,
          offline: true,
          signature: true,
          barcode: true,
          nfc: true,
          bluetooth: true,
        },
        configuration: {
          offlineMode: true,
          autoSync: true,
          syncInterval: 15,
          photoQuality: 'HIGH',
          gpsAccuracy: 'HIGH',
        },
        status: {
          isOnline: true,
          lastSeen: new Date().toISOString(),
          batteryLevel: 78,
          storageUsed: 2048,
          storageAvailable: 30720,
        },
        registeredAt: '2024-01-01T00:00:00Z',
      },
    ];

    sampleDevices.forEach((device: unknown) => {
      this.devices.set(device.id, device);
    });
  }

  // Technician Management
  async getAllFieldTechnicians(tenantId?: string, filters?: any): Promise<any[]> {
    let technicians = Array.from(this.technicians.values());
    
    if (tenantId) {
      technicians = technicians.filter((tech: unknown) => tech.tenantId === tenantId);
    }

    if (filters) {
      if (filters.status) {
        technicians = technicians.filter((tech: unknown) => tech.status === filters.status);
      }
      if (filters.serviceArea) {
        technicians = technicians.filter((tech: unknown) => 
          tech.fieldOperations.serviceArea.coverageAreas.includes(filters.serviceArea)
        );
      }
      if (filters.available) {
        technicians = technicians.filter((tech: unknown) => tech.status === 'ON_DUTY');
      }
    }

    return technicians;
  }

  async createFieldTechnician(technicianData: unknown): Promise<any> {
    const validated = FieldTechnicianSchema.parse(technicianData);
    const id = validated.id || `tech-${Date.now()}`;
    
    const technician = { 
      ...validated, 
      id, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.technicians.set(id, technician);
    return technician;
  }

  async updateTechnicianLocation(technicianId: string, location: unknown): Promise<void> {
    const technician = this.technicians.get(technicianId);
    if (!technician) {
      throw new Error('Technician not found');
    }

    technician.location.lastKnown = technician.location.current || technician.location?.lastKnown;
    technician.location.current = {
      ...location,
      timestamp: new Date().toISOString(),
    };

    this.technicians.set(technicianId, technician);
  }

  // Job Assignment Management
  async createMobileJobAssignment(assignmentData: unknown): Promise<any> {
    const validated = MobileJobAssignmentSchema.parse({
      ...assignmentData,
      createdAt: new Date().toISOString(),
    });
    
    const id = validated.id || `assign-${Date.now()}`;
    const assignment = { ...validated, id };
    
    this.assignments.set(id, assignment);
    return assignment;
  }

  async getJobAssignments(technicianId?: string, status?: string): Promise<any[]> {
    let assignments = Array.from(this.assignments.values());
    
    if (technicianId) {
      assignments = assignments.filter((assign: unknown) => assign.technicianId === technicianId);
    }

    if (status) {
      assignments = assignments.filter((assign: unknown) => assign.tracking.status === status);
    }

    return assignments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateAssignmentStatus(assignmentId: string, status: string, additionalData?: any): Promise<any> {
    const assignment = this.assignments.get(assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    assignment.tracking.status = status;
    
    // Update status-specific timestamps
    switch (status) {
      case 'ACCEPTED':
        assignment.tracking.acceptedAt = new Date().toISOString();
        break;
      case 'ARRIVED':
        assignment.tracking.arrivedAt = new Date().toISOString();
        break;
      case 'IN_PROGRESS':
        assignment.tracking.startedAt = new Date().toISOString();
        break;
      case 'COMPLETED':
        assignment.tracking.completedAt = new Date().toISOString();
        if (assignment.tracking.startedAt) {
          const startTime = new Date(assignment.tracking.startedAt).getTime();
          const endTime = new Date(assignment.tracking.completedAt).getTime();
          assignment.tracking.workTime = Math.round((endTime - startTime) / (1000 * 60));
        }
        break;
    }

    if (additionalData) {
      Object.assign(assignment, additionalData);
    }

    this.assignments.set(assignmentId, assignment);
    return assignment;
  }

  // Field Work Records
  async createFieldWorkRecord(recordData: unknown): Promise<any> {
    const validated = FieldWorkRecordSchema.parse({
      ...recordData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    const id = validated.id || `record-${Date.now()}`;
    const record = { ...validated, id };
    
    this.workRecords.set(id, record);
    return record;
  }

  async updateFieldWorkRecord(recordId: string, updateData: unknown): Promise<any> {
    const existingRecord = this.workRecords.get(recordId);
    if (!existingRecord) {
      throw new Error('Work record not found');
    }

    const updatedRecord = { 
      ...existingRecord, 
      ...updateData, 
      updatedAt: new Date().toISOString(),
    };
    
    const validated = FieldWorkRecordSchema.parse(updatedRecord);
    this.workRecords.set(recordId, validated);
    
    return validated;
  }

  async getFieldWorkRecords(technicianId?: string, _jobId?: string): Promise<any[]> {
    let records = Array.from(this.workRecords.values());
    
    if (technicianId) {
      records = records.filter((record: unknown) => record.technicianId === technicianId);
    }

    if (_jobId) {
      records = records.filter((record: unknown) => record.jobId === _jobId);
    }

    return records.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Mobile Device Management
  async registerMobileDevice(deviceData: unknown): Promise<any> {
    const validated = MobileDeviceSchema.parse({
      ...deviceData,
      registeredAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    });
    
    const id = validated.id || `device-${Date.now()}`;
    const device = { ...validated, id };
    
    this.devices.set(id, device);
    return device;
  }

  async updateDeviceStatus(deviceId: string, statusData: unknown): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error('Device not found');
    }

    device.status = { ...device.status, ...statusData, lastSeen: new Date().toISOString() };
    device.lastUpdated = new Date().toISOString();
    
    this.devices.set(deviceId, device);
  }

  // Offline Operations Support
  async syncOfflineData(technicianId: string, offlineData: unknown): Promise<any> {
    const syncResults = {
      successful: 0,
      failed: 0,
      errors: [] as string[],
      syncedItems: [] as unknown[],
    };

    try {
      // Process offline assignments updates
      if ((offlineData as any).assignments) {
        for (const assignmentUpdate of (offlineData as any).assignments) {
          try {
            await this.updateAssignmentStatus(
              assignmentUpdate.assignmentId, 
              assignmentUpdate.status, 
              assignmentUpdate.data
            );
            syncResults.successful++;
            syncResults.syncedItems.push({
              type: 'assignment',
              id: assignmentUpdate.assignmentId,
              action: 'update',
            });
          } catch (error: unknown) {
            syncResults.failed++;
            syncResults.errors.push(`Assignment ${assignmentUpdate.assignmentId}: ${error.message}`);
          }
        }
      }

      // Process offline work records
      if ((offlineData as any).workRecords) {
        for (const recordData of (offlineData as any).workRecords) {
          try {
            if ((recordData as any).id && this.workRecords.has((recordData as any).id)) {
              await this.updateFieldWorkRecord((recordData as any).id, recordData);
              syncResults.syncedItems.push({
                type: 'workRecord',
                id: (recordData as any).id,
                action: 'update',
              });
            } else {
              const newRecord = await this.createFieldWorkRecord(recordData);
              syncResults.syncedItems.push({
                type: 'workRecord',
                id: newRecord.id,
                action: 'create',
              });
            }
            syncResults.successful++;
          } catch (error: unknown) {
            syncResults.failed++;
            syncResults.errors.push(`Work record: ${error.message}`);
          }
        }
      }

      // Update technician sync status
      const technician = this.technicians.get(technicianId);
      if (technician) {
        technician.lastSyncAt = new Date().toISOString();
        this.technicians.set(technicianId, technician);
      }

    } catch (error: unknown) {
      syncResults.errors.push(`Sync process error: ${error.message}`);
    }

    return {
      syncId: `sync-${Date.now()}`,
      technicianId,
      syncedAt: new Date().toISOString(),
      results: syncResults,
    };
  }

  // Route Optimization
  async optimizeRoute(technicianId: string, assignmentIds: string[]): Promise<any> {
    const assignments = assignmentIds.map((id: unknown) => this.assignments.get(id)).filter(Boolean);
    const technician = this.technicians.get(technicianId);
    
    if (!technician || !technician.location.current) {
      throw new Error('Technician location not available');
    }

    // Simple distance-based optimization (in production, would use advanced routing algorithms)
    const optimized = assignments.map((assignment, index) => {
      const distance = this.calculateDistance(
        technician.location.current,
        assignment.location
      );
      
      return {
        assignmentId: assignment.id,
        sequence: index + 1,
        location: assignment.location,
        estimatedTravelTime: Math.round(distance * 2.5), // Rough estimate: 2.5 min per mile
        estimatedArrival: this.calculateArrivalTime(index, distance, assignments),
        distance: Math.round(distance * 100) / 100,
      };
    }).sort((a, b) => a.distance - b.distance);

    // Reassign sequence numbers
    optimized.forEach((item, index) => {
      item.sequence = index + 1;
    });

    return {
      technicianId,
      optimizedRoute: optimized,
      totalDistance: optimized.reduce((sum: unknown, item: unknown) => sum + item.distance, 0),
      totalTravelTime: optimized.reduce((sum: unknown, item: unknown) => sum + item.estimatedTravelTime, 0),
      optimizedAt: new Date().toISOString(),
    };
  }

  private calculateDistance(point1: unknown, point2: unknown): number {
    const R = 3959; // Earth radius in miles
    const dLat = this.deg2rad(point2.latitude - point1.latitude);
    const dLon = this.deg2rad(point2.longitude - point1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(point1.latitude)) *
        Math.cos(this.deg2rad(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private calculateArrivalTime(sequence: number, distance: number, assignments: unknown[]): string {
    // Simplified arrival time calculation
    const baseTime = new Date();
    const travelMinutes = sequence * 30 + distance * 2.5;
    baseTime.setMinutes(baseTime.getMinutes() + travelMinutes);
    return baseTime.toISOString();
  }

  // Performance Analytics
  async getTechnicianPerformanceAnalytics(technicianId: string): Promise<any> {
    const technician = this.technicians.get(technicianId);
    if (!technician) {
      throw new Error('Technician not found');
    }

    const assignments = Array.from(this.assignments.values())
      .filter((a: unknown) => a.technicianId === technicianId);
    const workRecords = Array.from(this.workRecords.values())
      .filter((r: unknown) => r.technicianId === technicianId);

    return {
      technicianId,
      period: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
      metrics: {
        totalJobs: assignments.length,
        completedJobs: assignments.filter((a: unknown) => a.tracking.status === 'COMPLETED').length,
        averageJobDuration: this.calculateAverageJobDuration(workRecords),
        onTimePerformance: this.calculateOnTimePerformance(assignments),
        customerSatisfaction: this.calculateAverageCustomerRating(workRecords),
        firstTimeFixRate: this.calculateFirstTimeFixRate(workRecords),
      },
      trends: {
        dailyJobs: this.calculateDailyJobTrends(assignments),
        qualityScores: this.calculateQualityTrends(workRecords),
      },
      recommendations: this.generatePerformanceRecommendations(technician, assignments, workRecords),
    };
  }

  private calculateAverageJobDuration(workRecords: unknown[]): number {
    const completedRecords = workRecords.filter((r: unknown) => r.workLog.workDuration);
    if (completedRecords.length === 0) return 0;
    
    const totalDuration = completedRecords.reduce((sum: unknown, record: unknown) => sum + record.workLog.workDuration, 0);
    return Math.round(totalDuration / completedRecords.length);
  }

  private calculateOnTimePerformance(assignments: unknown[]): number {
    const completedAssignments = assignments.filter((a: unknown) => a.tracking.completedAt);
    if (completedAssignments.length === 0) return 100;
    
    const onTimeJobs = completedAssignments.filter((a: unknown) => {
      const scheduledEnd = new Date(`${a.scheduledTime.date}T${a.scheduledTime.timeSlot.end}:00Z`);
      const actualCompletion = new Date(a.tracking.completedAt);
      return actualCompletion <= scheduledEnd;
    }).length;
    
    return Math.round((onTimeJobs / completedAssignments.length) * 100);
  }

  private calculateAverageCustomerRating(workRecords: unknown[]): number {
    const ratedRecords = workRecords.filter((r: unknown) => r.customerFeedback.rating);
    if (ratedRecords.length === 0) return 5;
    
    const totalRating = ratedRecords.reduce((sum: unknown, record: unknown) => sum + record.customerFeedback.rating, 0);
    return Math.round((totalRating / ratedRecords.length) * 10) / 10;
  }

  private calculateFirstTimeFixRate(workRecords: unknown[]): number {
    const completedRecords = workRecords.filter((r: unknown) => r.qualityAssurance.finalInspection);
    if (completedRecords.length === 0) return 100;
    
    const firstTimeFixes = completedRecords.filter((r: unknown) => {
      return r.qualityAssurance.testResults.every((test: unknown) => test.result === 'PASS');
    }).length;
    
    return Math.round((firstTimeFixes / completedRecords.length) * 100);
  }

  private calculateDailyJobTrends(assignments: unknown[]): any[] {
    const dailyJobs = new Map();
    
    assignments.forEach((assignment: unknown) => {
      const date = assignment.scheduledTime.date;
      dailyJobs.set(date, (dailyJobs.get(date) || 0) + 1);
    });
    
    return Array.from(dailyJobs.entries())
      .map(([date, count]) => ({ date, jobs: count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private calculateQualityTrends(workRecords: unknown[]): any[] {
    return workRecords.map((record: unknown) => ({
      date: record.createdAt.split('T')[0],
      qualityScore: this.calculateRecordQualityScore(record),
    }));
  }

  private calculateRecordQualityScore(record: unknown): number {
    let score = 100;
    
    // Deduct for failed quality checks
    const failedChecks = record.qualityAssurance.checklist.filter((item: unknown) => !item.completed).length;
    score -= failedChecks * 10;
    
    // Deduct for failed tests
    const failedTests = record.qualityAssurance.testResults.filter((test: unknown) => test.result === 'FAIL').length;
    score -= failedTests * 15;
    
    // Add for customer satisfaction
    if (record.customerFeedback.rating) {
      score += (record.customerFeedback.rating - 3) * 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private generatePerformanceRecommendations(technician: unknown, assignments: unknown[], workRecords: unknown[]): string[] {
    const recommendations = [];
    
    // Check on-time performance
    const onTime = this.calculateOnTimePerformance(assignments);
    if (onTime < 90) {
      recommendations.push('Improve time management and scheduling adherence');
    }
    
    // Check customer satisfaction
    const satisfaction = this.calculateAverageCustomerRating(workRecords);
    if (satisfaction < 4.5) {
      recommendations.push('Focus on customer communication and service quality');
    }
    
    // Check job duration
    const avgDuration = this.calculateAverageJobDuration(workRecords);
    if (avgDuration > technician.performance.avgJobDuration * 1.2) {
      recommendations.push('Consider efficiency training or process optimization');
    }
    
    // Check first-time fix rate
    const firstTimeFix = this.calculateFirstTimeFixRate(workRecords);
    if (firstTimeFix < 85) {
      recommendations.push('Review diagnostic procedures and part preparation');
    }
    
    return recommendations;
  }
}

// Route Handlers
export async function mobileFieldOperationsRoutes(server: FastifyInstance): Promise<void> {
  const fieldService = new MobileFieldOperationsService();

  // Get all field technicians
  server.get('/technicians', async (request: FastifyRequest<{
    Querystring: { 
      tenantId?: string;
      status?: string;
      serviceArea?: string;
      available?: boolean;
    }
  }>, reply: FastifyReply) => {
    try {
      const { tenantId, ...filters } = request.query;
      const technicians = await fieldService.getAllFieldTechnicians(tenantId, filters);
      
      return reply.send({
        success: true,
        data: technicians,
        count: technicians.length,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(500).send({
        success: false,
        message: 'Failed to retrieve field technicians',
        error: error.message,
      });
    }
  });

  // Create field technician
  server.post('/technicians', async (request: FastifyRequest<{
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const technicianData = request.body;
      const technician = await fieldService.createFieldTechnician(technicianData);
      
      return (reply as FastifyReply).status(201).send({
        success: true,
        data: technician,
        message: 'Field technician created successfully',
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to create field technician',
        error: error.message,
      });
    }
  });

  // Update technician location
  server.post('/technicians/:technicianId/location', async (request: FastifyRequest<{
    Params: { technicianId: string }
    Body: { latitude: number; longitude: number; accuracy?: number }
  }>, reply: FastifyReply) => {
    try {
      const { technicianId  } = (request.params as unknown);
      const location = request.body;
      
      await fieldService.updateTechnicianLocation(technicianId, location);
      
      return reply.send({
        success: true,
        message: 'Location updated successfully',
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to update technician location',
        error: error.message,
      });
    }
  });

  // Create job assignment
  server.post('/assignments', async (request: FastifyRequest<{
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const assignmentData = request.body;
      const assignment = await fieldService.createMobileJobAssignment(assignmentData);
      
      return (reply as FastifyReply).status(201).send({
        success: true,
        data: assignment,
        message: 'Job assignment created successfully',
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to create job assignment',
        error: error.message,
      });
    }
  });

  // Get job assignments
  server.get('/assignments', async (request: FastifyRequest<{
    Querystring: { technicianId?: string; status?: string }
  }>, reply: FastifyReply) => {
    try {
      const { technicianId, status  } = (request.query as unknown);
      const assignments = await fieldService.getJobAssignments(technicianId, status);
      
      return reply.send({
        success: true,
        data: assignments,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(500).send({
        success: false,
        message: 'Failed to retrieve job assignments',
        error: error.message,
      });
    }
  });

  // Update assignment status
  server.put('/assignments/:assignmentId/status', async (request: FastifyRequest<{
    Params: { assignmentId: string }
    Body: { status: string; additionalData?: any }
  }>, reply: FastifyReply) => {
    try {
      const { assignmentId  } = (request.params as unknown);
      const { status, additionalData  } = (request.body as unknown);
      
      const assignment = await fieldService.updateAssignmentStatus(assignmentId, status, additionalData);
      
      return reply.send({
        success: true,
        data: assignment,
        message: 'Assignment status updated successfully',
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to update assignment status',
        error: error.message,
      });
    }
  });

  // Create field work record
  server.post('/work-records', async (request: FastifyRequest<{
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const recordData = request.body;
      const record = await fieldService.createFieldWorkRecord(recordData);
      
      return (reply as FastifyReply).status(201).send({
        success: true,
        data: record,
        message: 'Field work record created successfully',
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to create field work record',
        error: error.message,
      });
    }
  });

  // Update field work record
  server.put('/work-records/:recordId', async (request: FastifyRequest<{
    Params: { recordId: string }
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const { recordId  } = (request.params as unknown);
      const updateData = request.body;
      
      const record = await fieldService.updateFieldWorkRecord(recordId, updateData);
      
      return reply.send({
        success: true,
        data: record,
        message: 'Field work record updated successfully',
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to update field work record',
        error: error.message,
      });
    }
  });

  // Get field work records
  server.get('/work-records', async (request: FastifyRequest<{
    Querystring: { technicianId?: string; _jobId?: string }
  }>, reply: FastifyReply) => {
    try {
      const { technicianId, _jobId  } = (request.query as unknown);
      const records = await fieldService.getFieldWorkRecords(technicianId, _jobId);
      
      return reply.send({
        success: true,
        data: records,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(500).send({
        success: false,
        message: 'Failed to retrieve field work records',
        error: error.message,
      });
    }
  });

  // Register mobile device
  server.post('/devices', async (request: FastifyRequest<{
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const deviceData = request.body;
      const device = await fieldService.registerMobileDevice(deviceData);
      
      return (reply as FastifyReply).status(201).send({
        success: true,
        data: device,
        message: 'Mobile device registered successfully',
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to register mobile device',
        error: error.message,
      });
    }
  });

  // Update device status
  server.put('/devices/:deviceId/status', async (request: FastifyRequest<{
    Params: { deviceId: string }
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const { deviceId  } = (request.params as unknown);
      const statusData = request.body;
      
      await fieldService.updateDeviceStatus(deviceId, statusData);
      
      return reply.send({
        success: true,
        message: 'Device status updated successfully',
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to update device status',
        error: error.message,
      });
    }
  });

  // Sync offline data
  server.post('/sync/:technicianId', async (request: FastifyRequest<{
    Params: { technicianId: string }
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const { technicianId  } = (request.params as unknown);
      const offlineData = request.body;
      
      const syncResult = await fieldService.syncOfflineData(technicianId, offlineData);
      
      return reply.send({
        success: true,
        data: syncResult,
        message: 'Offline data synchronized successfully',
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to sync offline data',
        error: error.message,
      });
    }
  });

  // Optimize route
  server.post('/route-optimization/:technicianId', async (request: FastifyRequest<{
    Params: { technicianId: string }
    Body: { assignmentIds: string[] }
  }>, reply: FastifyReply) => {
    try {
      const { technicianId  } = (request.params as unknown);
      const { assignmentIds  } = (request.body as unknown);
      
      const optimizedRoute = await fieldService.optimizeRoute(technicianId, assignmentIds);
      
      return reply.send({
        success: true,
        data: optimizedRoute,
        message: 'Route optimized successfully',
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to optimize route',
        error: error.message,
      });
    }
  });

  // Get technician performance analytics
  server.get('/analytics/performance/:technicianId', async (request: FastifyRequest<{
    Params: { technicianId: string }
  }>, reply: FastifyReply) => {
    try {
      const { technicianId  } = (request.params as unknown);
      const analytics = await fieldService.getTechnicianPerformanceAnalytics(technicianId);
      
      return reply.send({
        success: true,
        data: analytics,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to retrieve performance analytics',
        error: error.message,
      });
    }
  });
}

export default mobileFieldOperationsRoutes;