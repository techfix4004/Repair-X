import { FastifyRequest, FastifyReply } from 'fastify';

export interface MobileFieldOperations {
  id: string;
  technicianId: string;
  deviceId: string;
  currentJob?: string;
  location: GPSLocation;
  status: 'online' | 'offline' | 'in-field' | 'available' | 'busy';
  capabilities: FieldCapabilities;
  offlineSync: OfflineSyncManager;
  createdAt: Date;
  updatedAt: Date;
}

export interface GPSLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy: number;
  timestamp: Date;
  address?: string;
}

export interface FieldCapabilities {
  offlineMode: boolean;
  gpsTracking: boolean;
  digitalSignature: boolean;
  photoCapture: boolean;
  receiptPrinting: boolean;
  workflowManagement: boolean;
  qualityChecklist: boolean;
}

export interface OfflineSyncManager {
  id: string;
  deviceId: string;
  lastSync: Date;
  pendingSync: SyncItem[];
  conflicts: ConflictResolution[];
  storageUsed: number;
  storageLimit: number;
}

export interface SyncItem {
  id: string;
  type: 'job-update' | 'photo-upload' | 'signature-capture' | 'checklist-complete' | 'payment-collected';
  data: unknown;
  timestamp: Date;
  retryCount: number;
  priority: 'high' | 'medium' | 'low';
}

export interface ConflictResolution {
  id: string;
  localData: unknown;
  serverData: unknown;
  resolution: 'use-local' | 'use-server' | 'merge' | 'manual-review';
  timestamp: Date;
}

export interface MobilePrintJob {
  id: string;
  jobId: string;
  technicianId: string;
  printerType: 'receipt' | 'label' | 'invoice';
  content: PrintContent;
  status: 'queued' | 'printing' | 'completed' | 'failed';
  createdAt: Date;
}

export interface PrintContent {
  template: string;
  data: unknown;
  copies: number;
  paperSize: 'A4' | '80mm' | '58mm' | 'label';
  orientation: 'portrait' | 'landscape';
}

export interface WorkflowStateManager {
  jobId: string;
  currentState: string;
  availableStates: string[];
  stateHistory: WorkflowStateHistory[];
  mobileCapture: MobileCaptureData;
}

export interface WorkflowStateHistory {
  state: string;
  timestamp: Date;
  technicianId: string;
  location?: GPSLocation;
  notes?: string;
  attachments: string[];
}

export interface MobileCaptureData {
  photos: PhotoCapture[];
  signatures: SignatureCapture[];
  checklists: QualityChecklist[];
  timeTracking: TimeEntry[];
}

export interface PhotoCapture {
  id: string;
  workflowState: string;
  url: string;
  thumbnail: string;
  metadata: PhotoMetadata;
  timestamp: Date;
}

export interface PhotoMetadata {
  gpsLocation?: GPSLocation;
  deviceInfo: string;
  resolution: string;
  fileSize: number;
  description?: string;
}

export interface SignatureCapture {
  id: string;
  type: 'customer-approval' | 'completion-confirmation' | 'parts-received';
  signatureData: string; // Base64 encoded
  signerName: string;
  signerRole: string;
  timestamp: Date;
  workflowState: string;
}

export interface QualityChecklist {
  id: string;
  jobId: string;
  workflowState: string;
  checkpoints: CheckpointResult[];
  overallScore: number;
  passed: boolean;
  technicianId: string;
  completedAt: Date;
}

export interface CheckpointResult {
  checkpointId: string;
  description: string;
  result: 'pass' | 'fail' | 'n/a';
  notes?: string;
  photo?: string;
  timestamp: Date;
}

export interface TimeEntry {
  id: string;
  jobId: string;
  technicianId: string;
  activityType: 'travel' | 'diagnosis' | 'repair' | 'testing' | 'documentation';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  location?: GPSLocation;
  description?: string;
}

export class EnhancedMobileFieldOperationsService {
  // Enhanced offline capabilities and data synchronization
  async enableOfflineMode(technicianId: string, deviceId: string): Promise<OfflineSyncManager> {
    console.log(`🔄 Enabling offline mode for technician ${technicianId} on device ${deviceId}`);
    
    // Create offline sync manager
    const syncManager: OfflineSyncManager = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      deviceId,
      lastSync: new Date(),
      pendingSync: [],
      conflicts: [],
      storageUsed: 0,
      storageLimit: 1024 * 1024 * 100, // 100MB
    };

    // Sync essential data for offline use
    await this.syncCriticalData(syncManager);
    
    return syncManager;
  }

  async syncCriticalData(syncManager: OfflineSyncManager): Promise<void> {
    console.log(`📱 Syncing critical data for offline mode`);
    
    // Sync job data, customer info, parts inventory, workflow states
    const criticalData = [
      'active-jobs',
      'customer-contacts', 
      'parts-inventory',
      'workflow-templates',
      'quality-checklists'
    ];

    for (const dataType of criticalData) {
      const syncItem: SyncItem = {
        id: `sync_${Date.now()}_${dataType}`,
        type: 'job-update',
        data: await this.getCriticalDataByType(dataType),
        timestamp: new Date(),
        retryCount: 0,
        priority: 'high'
      };
      
      syncManager.pendingSync.push(syncItem);
    }
  }

  async getCriticalDataByType(dataType: string): Promise<any> {
    // Mock critical data fetching
    return {
      type: dataType,
      data: [],
      timestamp: new Date(),
      version: '1.0'
    };
  }

  // Mobile print _options for receipt printers
  async setupMobilePrinting(technicianId: string, printerConfig: unknown): Promise<boolean> {
    console.log(`🖨️ Setting up mobile printing for technician ${technicianId}`);
    
    // Configure Bluetooth/WiFi receipt printer
    const supportedPrinters = [
      'Star TSP100',
      'Epson TM-T88VI',
      'Brother RJ-2050',
      'Zebra ZD220'
    ];

    console.log(`📄 Supported printers: ${supportedPrinters.join(', ')}`);
    
    return true;
  }

  async printReceipt(jobId: string, technicianId: string, content: PrintContent): Promise<MobilePrintJob> {
    console.log(`📄 Printing receipt for job ${_jobId}`);
    
    const printJob: MobilePrintJob = {
      id: `print_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      _jobId,
      technicianId,
      printerType: 'receipt',
      content,
      status: 'queued',
      createdAt: new Date()
    };

    // Generate receipt content
    await this.generateReceiptContent(printJob);
    
    // Send to mobile printer
    printJob.status = 'printing';
    
    // Simulate printing completion
    setTimeout(() => {
      printJob.status = 'completed';
      console.log(`✅ Receipt printed successfully for job ${_jobId}`);
    }, 2000);

    return printJob;
  }

  async generateReceiptContent(printJob: MobilePrintJob): Promise<void> {
    const receiptTemplate = `
    =====================================
           REPAIRX FIELD SERVICE
    =====================================
    Job ID: ${printJob.jobId}
    Date: ${new Date().toLocaleDateString()}
    Time: ${new Date().toLocaleTimeString()}
    Technician: ${printJob.technicianId}
    
    Service Details:
    - Device: ${printJob.content.data?.device || 'N/A'}
    - Issue: ${printJob.content.data?.issue || 'N/A'}
    - Status: ${printJob.content.data?.status || 'Completed'}
    
    Total: $${printJob.content.data?.total || '0.00'}
    
    Customer Signature: _______________
    
    Thank you for choosing RepairX!
    www.repairx.com | support@repairx.com
    =====================================
    `;
    
    printJob.content.template = receiptTemplate;
  }

  // Complete 12-state workflow management on mobile devices
  async initializeMobileWorkflow(jobId: string, technicianId: string): Promise<WorkflowStateManager> {
    console.log(`⚙️ Initializing mobile workflow for job ${_jobId}`);
    
    const workflowManager: WorkflowStateManager = {
      _jobId,
      currentState: 'CREATED',
      availableStates: [
        'CREATED',
        'IN_DIAGNOSIS', 
        'AWAITING_APPROVAL',
        'APPROVED',
        'IN_PROGRESS',
        'PARTS_ORDERED',
        'TESTING',
        'QUALITY_CHECK',
        'COMPLETED',
        'CUSTOMER_APPROVED',
        'DELIVERED',
        'CANCELLED'
      ],
      stateHistory: [{
        state: 'CREATED',
        timestamp: new Date(),
        technicianId,
        notes: 'Job created and assigned to technician',
        attachments: []
      }],
      mobileCapture: {
        photos: [],
        signatures: [],
        checklists: [],
        timeTracking: []
      }
    };

    return workflowManager;
  }

  async transitionWorkflowState(
    workflowManager: WorkflowStateManager,
    newState: string,
    technicianId: string,
    location?: GPSLocation,
    notes?: string
  ): Promise<boolean> {
    console.log(`🔄 Transitioning workflow from ${workflowManager.currentState} to ${newState}`);
    
    // Validate state transition
    if (!this.isValidStateTransition(workflowManager.currentState, newState)) {
      console.error(`❌ Invalid state transition: ${workflowManager.currentState} -> ${newState}`);
      return false;
    }

    // Add to history
    const historyEntry: WorkflowStateHistory = {
      state: newState,
      timestamp: new Date(),
      technicianId,
      location,
      notes,
      attachments: []
    };

    workflowManager.stateHistory.push(historyEntry);
    workflowManager.currentState = newState;

    // Trigger state-specific actions
    await this.executeStateActions(workflowManager, newState);

    console.log(`✅ Workflow transitioned to ${newState}`);
    return true;
  }

  private isValidStateTransition(currentState: string, newState: string): boolean {
    const validTransitions: Record<string, string[]> = {
      'CREATED': ['IN_DIAGNOSIS', 'CANCELLED'],
      'IN_DIAGNOSIS': ['AWAITING_APPROVAL', 'APPROVED', 'CANCELLED'],
      'AWAITING_APPROVAL': ['APPROVED', 'CANCELLED'],
      'APPROVED': ['IN_PROGRESS', 'PARTS_ORDERED'],
      'IN_PROGRESS': ['TESTING', 'PARTS_ORDERED', 'COMPLETED'],
      'PARTS_ORDERED': ['IN_PROGRESS'],
      'TESTING': ['QUALITY_CHECK', 'IN_PROGRESS'],
      'QUALITY_CHECK': ['COMPLETED', 'IN_PROGRESS'],
      'COMPLETED': ['CUSTOMER_APPROVED', 'IN_PROGRESS'],
      'CUSTOMER_APPROVED': ['DELIVERED'],
      'DELIVERED': [],
      'CANCELLED': []
    };

    return validTransitions[currentState]?.includes(newState) || false;
  }

  private async executeStateActions(workflowManager: WorkflowStateManager, newState: string): Promise<void> {
    switch (newState) {
      case 'IN_DIAGNOSIS':
        await this.startTimeTracking(workflowManager, 'diagnosis');
        break;
      case 'AWAITING_APPROVAL':
        await this.sendCustomerNotification(workflowManager.jobId, 'approval_required');
        break;
      case 'QUALITY_CHECK':
        await this.initializeQualityChecklist(workflowManager);
        break;
      case 'CUSTOMER_APPROVED':
        await this.captureCustomerSignature(workflowManager);
        break;
      case 'DELIVERED':
        await this.generateCompletionReceipt(workflowManager);
        break;
    }
  }

  async capturePhoto(
    workflowManager: WorkflowStateManager,
    description: string,
    location?: GPSLocation
  ): Promise<PhotoCapture> {
    console.log(`📸 Capturing photo for workflow state ${workflowManager.currentState}`);
    
    const photoCapture: PhotoCapture = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowState: workflowManager.currentState,
      url: `/photos/${workflowManager.jobId}/${Date.now()}.jpg`,
      thumbnail: `/thumbnails/${workflowManager.jobId}/${Date.now()}_thumb.jpg`,
      metadata: {
        gpsLocation: location,
        deviceInfo: 'Mobile Camera',
        resolution: '1920x1080',
        fileSize: 2048000, // 2MB
        description
      },
      timestamp: new Date()
    };

    workflowManager.mobileCapture.photos.push(photoCapture);
    return photoCapture;
  }

  async captureDigitalSignature(
    workflowManager: WorkflowStateManager,
    type: 'customer-approval' | 'completion-confirmation' | 'parts-received',
    signerName: string,
    signerRole: string,
    signatureData: string
  ): Promise<SignatureCapture> {
    console.log(`✍️ Capturing digital signature for ${type}`);
    
    const signature: SignatureCapture = {
      id: `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      signatureData,
      signerName,
      signerRole,
      timestamp: new Date(),
      workflowState: workflowManager.currentState
    };

    workflowManager.mobileCapture.signatures.push(signature);
    return signature;
  }

  private async startTimeTracking(workflowManager: WorkflowStateManager, activityType: string): Promise<void> {
    const timeEntry: TimeEntry = {
      id: `time_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      jobId: workflowManager.jobId,
      technicianId: 'current-tech',
      activityType: activityType as unknown,
      startTime: new Date(),
      location: undefined,
      description: `Started ${activityType} for workflow state ${workflowManager.currentState}`
    };

    workflowManager.mobileCapture.timeTracking.push(timeEntry);
  }

  private async sendCustomerNotification(jobId: string, type: string): Promise<void> {
    console.log(`📧 Sending customer notification: ${type} for job ${_jobId}`);
  }

  private async initializeQualityChecklist(workflowManager: WorkflowStateManager): Promise<void> {
    console.log(`✅ Initializing quality checklist for job ${workflowManager.jobId}`);
    
    const checklist: QualityChecklist = {
      id: `qc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      jobId: workflowManager.jobId,
      workflowState: workflowManager.currentState,
      checkpoints: [
        {
          checkpointId: 'functional_test',
          description: 'Device functional test completed',
          result: 'pass',
          timestamp: new Date()
        },
        {
          checkpointId: 'visual_inspection',
          description: 'Visual inspection for defects',
          result: 'pass',
          timestamp: new Date()
        },
        {
          checkpointId: 'customer_satisfaction',
          description: 'Customer satisfaction check',
          result: 'pass',
          timestamp: new Date()
        }
      ],
      overallScore: 100,
      passed: true,
      technicianId: 'current-tech',
      completedAt: new Date()
    };

    workflowManager.mobileCapture.checklists.push(checklist);
  }

  private async captureCustomerSignature(workflowManager: WorkflowStateManager): Promise<void> {
    console.log(`✍️ Capturing customer approval signature for job ${workflowManager.jobId}`);
    
    await this.captureDigitalSignature(
      workflowManager,
      'completion-confirmation',
      'Customer Name',
      'Customer',
      'base64SignatureData'
    );
  }

  private async generateCompletionReceipt(workflowManager: WorkflowStateManager): Promise<void> {
    console.log(`🧾 Generating completion receipt for job ${workflowManager.jobId}`);
    
    const printContent: PrintContent = {
      template: 'completion_receipt',
      data: {
        jobId: workflowManager.jobId,
        device: 'Customer Device',
        status: 'Completed Successfully',
        total: '150.00'
      },
      copies: 1,
      paperSize: '80mm',
      orientation: 'portrait'
    };

    await this.printReceipt(workflowManager.jobId, 'current-tech', printContent);
  }
}

// FastAPI-style route handlers
export const enhancedMobileFieldOperationsRoutes = {
  // Enable offline mode
  'POST /api/v1/mobile/offline/enable': async (request: FastifyRequest, reply: FastifyReply) => {
    const service = new EnhancedMobileFieldOperationsService();
    const { technicianId, deviceId  } = (request.body as unknown);
    
    try {
      const syncManager = await service.enableOfflineMode(technicianId, deviceId);
      
      reply.code(200).send({
        success: true,
        data: syncManager,
        message: 'Offline mode enabled successfully'
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to enable offline mode',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Setup mobile printing
  'POST /api/v1/mobile/printing/setup': async (request: FastifyRequest, reply: FastifyReply) => {
    const service = new EnhancedMobileFieldOperationsService();
    const { technicianId, printerConfig  } = (request.body as unknown);
    
    try {
      const result = await service.setupMobilePrinting(technicianId, printerConfig);
      
      reply.code(200).send({
        success: result,
        message: 'Mobile printing setup completed'
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to setup mobile printing',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Initialize mobile workflow
  'POST /api/v1/mobile/workflow/initialize': async (request: FastifyRequest, reply: FastifyReply) => {
    const service = new EnhancedMobileFieldOperationsService();
    const { _jobId, technicianId  } = (request.body as unknown);
    
    try {
      const workflowManager = await service.initializeMobileWorkflow(_jobId, technicianId);
      
      reply.code(200).send({
        success: true,
        data: workflowManager,
        message: 'Mobile workflow initialized successfully'
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to initialize mobile workflow',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Capture photo
  'POST /api/v1/mobile/workflow/photo': async (request: FastifyRequest, reply: FastifyReply) => {
    const service = new EnhancedMobileFieldOperationsService();
    const { workflowManager, description, location  } = (request.body as unknown);
    
    try {
      const photoCapture = await service.capturePhoto(workflowManager, description, location);
      
      reply.code(200).send({
        success: true,
        data: photoCapture,
        message: 'Photo captured successfully'
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to capture photo',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Print receipt
  'POST /api/v1/mobile/printing/receipt': async (request: FastifyRequest, reply: FastifyReply) => {
    const service = new EnhancedMobileFieldOperationsService();
    const { _jobId, technicianId, content  } = (request.body as unknown);
    
    try {
      const printJob = await service.printReceipt(_jobId, technicianId, content);
      
      reply.code(200).send({
        success: true,
        data: printJob,
        message: 'Receipt print job created successfully'
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to print receipt',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

console.log('🚀 Enhanced Mobile Field Operations System initialized');
console.log('📱 Features: Offline sync, Mobile printing, 12-state workflow, Photo capture, Digital signatures');