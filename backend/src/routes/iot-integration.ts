/**
 * IoT Device Integration System
 * Smart device connectivity for repair tracking and diagnostics
 * Advanced Features from RepairX roadmap
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// IoT Device Schemas
const IoTDeviceSchema = z.object({
  _id: z.string().optional(),
  _deviceId: z.string().min(1, 'Device ID is required'),
  _name: z.string().min(1, 'Device name is required'),
  _type: z.enum([
    'SMART_SCALE',        // For weighing devices/components
    'DIAGNOSTIC_TOOL',    // For device diagnostics
    'ENVIRONMENT_SENSOR', // Temperature/humidity monitoring
    'POWER_MONITOR',      // Power consumption monitoring
    'RFID_READER',        // For inventory tracking
    'BARCODE_SCANNER',    // For quick device identification
    'MULTIMETER',         // For electrical testing
    'OSCILLOSCOPE',       // For signal analysis
    'THERMAL_CAMERA',     // For heat signature analysis
    'VIBRATION_SENSOR',   // For mechanical issue detection
    'SOUND_ANALYZER',     // For audio diagnostics
    'LOCATION_BEACON',    // For technician/device tracking
  ]),
  _manufacturer: z.string().optional(),
  _model: z.string().optional(),
  _serialNumber: z.string().optional(),
  _firmwareVersion: z.string().optional(),
  _connectionType: z.enum(['WIFI', 'BLUETOOTH', 'ETHERNET', 'USB', 'SERIAL']),
  _capabilities: z.array(z.string()).default([]),
  _location: z.string().default('MAIN_WORKSHOP'),
  _assignedTechnician: z.string().optional(),
  _status: z.enum(['ONLINE', 'OFFLINE', 'MAINTENANCE', 'ERROR', 'CALIBRATING']).default('OFFLINE'),
  _lastSeen: z.string().optional(),
  _batteryLevel: z.number().min(0).max(100).optional(),
  _configuration: z.record(z.string(), z.any()).default({}),
  _calibrationDate: z.string().optional(),
  _nextCalibrationDue: z.string().optional(),
  _tenantId: z.string().optional(),
});

const IoTDataSchema = z.object({
  _id: z.string().optional(),
  _deviceId: z.string(),
  _timestamp: z.string().default(() => new Date().toISOString()),
  _dataType: z.enum([
    'DIAGNOSTIC_RESULT',
    'SENSOR_READING',
    'MEASUREMENT',
    'STATUS_UPDATE',
    'ALERT',
    'CALIBRATION_DATA',
    'USAGE_LOG',
  ]),
  _data: z.record(z.string(), z.any()),
  _metadata: z.object({
    jobId: z.string().optional(),
    _technicianId: z.string().optional(),
    _location: z.string().optional(),
    _accuracy: z.number().min(0).max(100).optional(),
    _units: z.string().optional(),
  }).optional(),
  _processed: z.boolean().default(false),
});

const IoTAlertSchema = z.object({
  _id: z.string().optional(),
  _deviceId: z.string(),
  _alertType: z.enum([
    'DEVICE_OFFLINE',
    'LOW_BATTERY',
    'CALIBRATION_DUE',
    'MEASUREMENT_OUT_OF_RANGE',
    'DEVICE_ERROR',
    'MAINTENANCE_REQUIRED',
    'SECURITY_BREACH',
  ]),
  _severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  _message: z.string(),
  _timestamp: z.string().default(() => new Date().toISOString()),
  _acknowledged: z.boolean().default(false),
  _acknowledgedBy: z.string().optional(),
  _acknowledgedAt: z.string().optional(),
  _resolved: z.boolean().default(false),
  _resolvedAt: z.string().optional(),
  _resolution: z.string().optional(),
});

// IoT Integration Service
class IoTIntegrationService {
  private _devices: Map<string, any> = new Map();
  private _dataPoints: Map<string, any[]> = new Map();
  private _alerts: Map<string, any> = new Map();
  private _connectedDevices: Set<string> = new Set();

  constructor() {
    this.initializeSampleDevices();
    this.startDeviceMonitoring();
  }

  private initializeSampleDevices() {
    const sampleDevices = [
      {
        _id: 'iot-001',
        _deviceId: 'SCALE-WS-001',
        _name: 'Workshop Digital Scale',
        _type: 'SMART_SCALE',
        _manufacturer: 'PrecisionTech',
        _model: 'PT-5000',
        _serialNumber: 'PT5000-2024-001',
        _firmwareVersion: '2.1.3',
        _connectionType: 'WIFI',
        _capabilities: ['weight_measurement', 'component_analysis', 'batch_processing'],
        _location: 'MAIN_WORKSHOP',
        _status: 'ONLINE',
        _lastSeen: new Date().toISOString(),
        _batteryLevel: 85,
        _configuration: {
          max_weight: 5000, // grams
          _precision: 0.1,
          _auto_zero: true,
          _units: 'grams',
        },
        _calibrationDate: '2024-01-01T00:00:00Z',
        _nextCalibrationDue: '2024-07-01T00:00:00Z',
      },
      {
        _id: 'iot-002',
        _deviceId: 'DIAG-TOOL-001',
        _name: 'Smart Diagnostic Scanner',
        _type: 'DIAGNOSTIC_TOOL',
        _manufacturer: 'TechDiag',
        _model: 'TD-Pro-X1',
        _serialNumber: 'TDPX1-2024-002',
        _firmwareVersion: '1.8.2',
        _connectionType: 'BLUETOOTH',
        _capabilities: ['battery_test', 'screen_test', 'connectivity_test', 'performance_benchmark'],
        _location: 'MOBILE_UNIT_1',
        _assignedTechnician: 'tech-001',
        _status: 'ONLINE',
        _lastSeen: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        _batteryLevel: 92,
        _configuration: {
          test_timeout: 30000, // 30 seconds
          _auto_report: true,
          _detailed_logs: true,
        },
        _calibrationDate: '2024-01-15T00:00:00Z',
        _nextCalibrationDue: '2024-04-15T00:00:00Z',
      },
      {
        _id: 'iot-003',
        _deviceId: 'ENV-SENS-001',
        _name: 'Workshop Environment Monitor',
        _type: 'ENVIRONMENT_SENSOR',
        _manufacturer: 'EnviroTech',
        _model: 'ET-Multi-Sens',
        _serialNumber: 'ETMS-2024-003',
        _firmwareVersion: '3.2.1',
        _connectionType: 'WIFI',
        _capabilities: ['temperature', 'humidity', 'air_quality', 'dust_levels'],
        _location: 'MAIN_WORKSHOP',
        _status: 'ONLINE',
        _lastSeen: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
        _configuration: {
          sampling_interval: 60000, // 1 minute
          _alert_thresholds: {
            temperaturemax: 30, // Celsius
            _humiditymax: 70, // Percentage
            _dust_levelmax: 50, // μg/m³
          },
        },
        _calibrationDate: '2024-01-10T00:00:00Z',
        _nextCalibrationDue: '2024-07-10T00:00:00Z',
      },
      {
        _id: 'iot-004',
        _deviceId: 'THERM-CAM-001',
        _name: 'Thermal Imaging Camera',
        _type: 'THERMAL_CAMERA',
        _manufacturer: 'ThermalVision',
        _model: 'TV-IR-500',
        _serialNumber: 'TVIR500-2024-004',
        _firmwareVersion: '4.1.0',
        _connectionType: 'USB',
        _capabilities: ['thermal_imaging', 'temperature_measurement', 'hotspot_detection', 'thermal_analysis'],
        _location: 'ADVANCED_DIAGNOSTICS',
        _status: 'OFFLINE',
        _lastSeen: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        _batteryLevel: 45,
        _configuration: {
          resolution: '640x480',
          _temperature_range: '-20_to_150_celsius',
          _emissivity: 0.95,
          _auto_focus: true,
        },
        _calibrationDate: '2024-01-05T00:00:00Z',
        _nextCalibrationDue: '2024-04-05T00:00:00Z',
      },
    ];

    sampleDevices.forEach((_device: unknown) => {
      this.devices.set(device.id, device);
      if (device.status === 'ONLINE') {
        this.connectedDevices.add(device.id);
      }
    });

    // Generate some sample data points
    this.generateSampleData();
  }

  private generateSampleData() {
    const now = new Date();
    
    // Scale measurements
    const scaleData = [
      {
        _id: 'data-001',
        _deviceId: 'SCALE-WS-001',
        _timestamp: new Date(now.getTime() - 1800000).toISOString(), // 30 min ago
        _dataType: 'MEASUREMENT',
        _data: {
          weight: 125.3,
          _stability: 'stable',
          _temperature: 22.5,
        },
        _metadata: {
          jobId: 'job-001',
          _technicianId: 'tech-001',
          _location: 'MAIN_WORKSHOP',
          _accuracy: 99.8,
          _units: 'grams',
        },
      },
      {
        _id: 'data-002',
        _deviceId: 'DIAG-TOOL-001',
        _timestamp: new Date(now.getTime() - 900000).toISOString(), // 15 min ago
        _dataType: 'DIAGNOSTIC_RESULT',
        _data: {
          battery_health: 87,
          _battery_cycles: 342,
          _screen_test: 'PASS',
          _connectivity_wifi: 'PASS',
          _connectivity_bluetooth: 'PASS',
          _performance_score: 94,
        },
        _metadata: {
          jobId: 'job-002',
          _technicianId: 'tech-001',
          _accuracy: 95.2,
        },
      },
    ];

    (scaleData as any).forEach((_data: unknown) => {
      const deviceData = this.dataPoints.get(data.deviceId) || [];
      (deviceData as any).push(data);
      this.dataPoints.set(data.deviceId, deviceData);
    });
  }

  private startDeviceMonitoring() {
    // Simulate device monitoring
    setInterval(() => {
      this.updateDeviceStatus();
      this.checkForAlerts();
    }, 30000); // Every 30 seconds
  }

  private updateDeviceStatus() {
    for (const [deviceId, device] of this.devices) {
      if (device.status === 'ONLINE') {
        // Simulate occasional disconnections
        if (Math.random() < 0.05) { // 5% chance
          device.status = 'OFFLINE';
          device.lastSeen = new Date().toISOString();
          this.connectedDevices.delete(deviceId);
          
          // Create alert for device going offline
          this.createAlert({
            _deviceId: device.deviceId,
            _alertType: 'DEVICE_OFFLINE',
            _severity: 'MEDIUM',
            _message: `Device ${device.name} has gone offline`,
          });
        } else {
          device.lastSeen = new Date().toISOString();
          
          // Simulate battery drain
          if (device.batteryLevel > 0) {
            device.batteryLevel = Math.max(0, device.batteryLevel - Math.random() * 2);
            
            if (device.batteryLevel < 20) {
              this.createAlert({
                _deviceId: device.deviceId,
                _alertType: 'LOW_BATTERY',
                _severity: 'HIGH',
                _message: `Device ${device.name} has low battery: ${device.batteryLevel.toFixed(1)}%`,
              });
            }
          }
        }
      } else if (device.status === 'OFFLINE') {
        // Simulate devices coming back online
        if (Math.random() < 0.1) { // 10% chance
          device.status = 'ONLINE';
          device.lastSeen = new Date().toISOString();
          this.connectedDevices.add(deviceId);
        }
      }
    }
  }

  private checkForAlerts() {
    for (const device of this.devices.values()) {
      // Check calibration due dates
      if (device.nextCalibrationDue) {
        const dueDate = new Date(device.nextCalibrationDue);
        const now = new Date();
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue <= 7 && daysUntilDue > 0) {
          this.createAlert({
            _deviceId: device.deviceId,
            _alertType: 'CALIBRATION_DUE',
            _severity: 'MEDIUM',
            _message: `Device ${device.name} calibration due in ${daysUntilDue} days`,
          });
        } else if (daysUntilDue <= 0) {
          this.createAlert({
            _deviceId: device.deviceId,
            _alertType: 'CALIBRATION_DUE',
            _severity: 'HIGH',
            _message: `Device ${device.name} calibration is overdue`,
          });
        }
      }
    }
  }

  private createAlert(_alertData: unknown) {
    const existingAlert = Array.from(this.alerts.values()).find((_alert: unknown) => 
      alert.deviceId === (alertData as any).deviceId && 
      alert.alertType === (alertData as any).alertType && 
      !alert.resolved
    );

    if (!existingAlert) {
      const alert = {
        ...alertData,
        _id: `alert-${Date.now()}`,
        _timestamp: new Date().toISOString(),
        _acknowledged: false,
        _resolved: false,
      };
      
      this.alerts.set(alert.id, alert);
    }
  }

  // Device Management
  async getAllDevices(filters?: { status?: string; type?: string; location?: string }): Promise<any[]> {
    let devices = Array.from(this.devices.values());

    if (filters) {
      if (filters.status) {
        devices = devices.filter((_device: unknown) => device.status === filters.status);
      }
      if (filters.type) {
        devices = devices.filter((_device: unknown) => device.type === filters.type);
      }
      if (filters.location) {
        devices = devices.filter((_device: unknown) => device.location === filters.location);
      }
    }

    return devices;
  }

  async getDevice(_deviceId: string): Promise<any | null> {
    return Array.from(this.devices.values()).find((_device: unknown) => device.deviceId === deviceId) || null;
  }

  async registerDevice(_deviceData: unknown): Promise<any> {
    const validated = IoTDeviceSchema.parse(deviceData);
    const id = validated.id || `iot-${Date.now()}`;
    
    const device = { ...validated, id, _createdAt: new Date().toISOString() };
    this.devices.set(id, device);
    
    return device;
  }

  async updateDevice(_deviceId: string, _updateData: unknown): Promise<any> {
    const device = Array.from(this.devices.entries()).find(([_, device]) => device.deviceId === deviceId);
    if (!device) {
      throw new Error('Device not found');
    }

    const [id, deviceData] = device;
    const updated = { ...deviceData, ...updateData, _updatedAt: new Date().toISOString() };
    const validated = IoTDeviceSchema.parse(updated);
    
    this.devices.set(id, validated);
    return validated;
  }

  async deleteDevice(_deviceId: string): Promise<void> {
    const deviceEntry = Array.from(this.devices.entries()).find(([_, device]) => device.deviceId === deviceId);
    if (!deviceEntry) {
      throw new Error('Device not found');
    }

    const [id] = deviceEntry;
    this.devices.delete(id);
    this.dataPoints.delete(deviceId);
    this.connectedDevices.delete(id);
  }

  // Data Management
  async recordData(_dataRecord: unknown): Promise<any> {
    const validated = IoTDataSchema.parse(dataRecord);
    const id = validated.id || `data-${Date.now()}`;
    
    const data = { ...validated, id };
    
    const deviceData = this.dataPoints.get(validated.deviceId) || [];
    (deviceData as any).push(data);
    
    // Keep only last 1000 records per device
    if ((deviceData as any).length > 1000) {
      (deviceData as any).splice(0, (deviceData as any).length - 1000);
    }
    
    this.dataPoints.set(validated.deviceId, deviceData);
    
    // Process data for alerts
    this.processDataForAlerts(data);
    
    return data;
  }

  private processDataForAlerts(_data: unknown) {
    const device = Array.from(this.devices.values()).find((_d: unknown) => d.deviceId === data.deviceId);
    if (!device) return;

    // Check for out-of-range measurements
    if (data.dataType === 'SENSOR_READING' && device.type === 'ENVIRONMENT_SENSOR') {
      const { temperature, humidity, dust_level  } = (data.data as unknown);
      const thresholds = device.configuration.alert_thresholds;

      if (temperature > thresholds?.temperaturemax) {
        this.createAlert({
          _deviceId: data.deviceId,
          _alertType: 'MEASUREMENT_OUT_OF_RANGE',
          _severity: 'HIGH',
          _message: `Temperature reading ${temperature}°C exceeds maximum threshold`,
        });
      }

      if (humidity > thresholds?.humiditymax) {
        this.createAlert({
          _deviceId: data.deviceId,
          _alertType: 'MEASUREMENT_OUT_OF_RANGE',
          _severity: 'MEDIUM',
          _message: `Humidity reading ${humidity}% exceeds maximum threshold`,
        });
      }
    }
  }

  async getDeviceData(_deviceId: string, _filters?: { 
    _startDate?: string; 
    _endDate?: string; 
    _dataType?: string;
    _limit?: number;
  }): Promise<any[]> {
    const deviceData = this.dataPoints.get(deviceId) || [];
    let filtered = [...deviceData];

    if (filters) {
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        filtered = filtered.filter((_data: unknown) => new Date(data.timestamp) >= startDate);
      }

      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        filtered = filtered.filter((_data: unknown) => new Date(data.timestamp) <= endDate);
      }

      if (filters.dataType) {
        filtered = filtered.filter((_data: unknown) => data.dataType === filters.dataType);
      }

      if (filters.limit) {
        filtered = filtered.slice(-filters.limit);
      }
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Alert Management
  async getAlerts(filters?: { deviceId?: string; severity?: string; acknowledged?: boolean }): Promise<any[]> {
    let alerts = Array.from(this.alerts.values());

    if (filters) {
      if (filters.deviceId) {
        alerts = alerts.filter((_alert: unknown) => alert.deviceId === filters.deviceId);
      }
      if (filters.severity) {
        alerts = alerts.filter((_alert: unknown) => alert.severity === filters.severity);
      }
      if (filters.acknowledged !== undefined) {
        alerts = alerts.filter((_alert: unknown) => alert.acknowledged === filters.acknowledged);
      }
    }

    return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async acknowledgeAlert(_alertId: string, _acknowledgedBy: string): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.acknowledged = true;
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date().toISOString();
    
    this.alerts.set(alertId, alert);
  }

  async resolveAlert(_alertId: string, _resolution: string): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.resolved = true;
    alert.resolvedAt = new Date().toISOString();
    alert.resolution = resolution;
    
    this.alerts.set(alertId, alert);
  }

  // Analytics
  async getDeviceAnalytics(): Promise<any> {
    const devices = Array.from(this.devices.values());
    const alerts = Array.from(this.alerts.values());
    
    const analytics = {
      _deviceStats: {
        total: devices.length,
        _online: devices.filter((d: unknown) => d.status === 'ONLINE').length,
        _offline: devices.filter((d: unknown) => d.status === 'OFFLINE').length,
        _maintenance: devices.filter((d: unknown) => d.status === 'MAINTENANCE').length,
        _error: devices.filter((d: unknown) => d.status === 'ERROR').length,
      },
      _typeBreakdown: devices.reduce((acc: unknown, _device: unknown) => {
        acc[device.type] = (acc[device.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      _alertStats: {
        total: alerts.length,
        _unacknowledged: alerts.filter((a: unknown) => !a.acknowledged).length,
        _unresolved: alerts.filter((a: unknown) => !a.resolved).length,
        _critical: alerts.filter((a: unknown) => a.severity === 'CRITICAL').length,
        _high: alerts.filter((a: unknown) => a.severity === 'HIGH').length,
      },
      _batteryLevels: devices
        .filter((d: unknown) => d.batteryLevel !== undefined)
        .map((_d: unknown) => ({ _deviceId: d.deviceId, _name: d.name, _batteryLevel: d.batteryLevel })),
      _calibrationDue: devices
        .filter((d: unknown) => d.nextCalibrationDue)
        .map((_d: unknown) => {
          const daysUntilDue = Math.ceil(
            (new Date(d.nextCalibrationDue).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          return { _deviceId: d.deviceId, _name: d.name, daysUntilDue };
        })
        .filter((_d: unknown) => d.daysUntilDue <= 30),
    };

    return analytics;
  }
}

// Route Handlers
 
// eslint-disable-next-line max-lines-per-function
export async function iotIntegrationRoutes(_server: FastifyInstance): Promise<void> {
  const iotService = new IoTIntegrationService();

  // Device management routes
  server.get('/devices', async (request: FastifyRequest<{
    Querystring: { status?: string; type?: string; location?: string }
  }>, reply: FastifyReply) => {
    try {
      const filters = request.query;
      const devices = await iotService.getAllDevices(filters);
      
      return reply.send({
        _success: true,
        _data: devices,
        _count: devices.length,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve devices',
        _error: error.message,
      });
    }
  });

  server.get('/devices/:deviceId', async (request: FastifyRequest<{
    Params: { deviceId: string }
  }>, reply: FastifyReply) => {
    try {
      const { deviceId  } = (request.params as unknown);
      const device = await iotService.getDevice(deviceId);
      
      if (!device) {
        return (reply as FastifyReply).status(404).send({
          _success: false,
          _message: 'Device not found',
        });
      }
      
      return reply.send({
        _success: true,
        _data: device,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve device',
        _error: error.message,
      });
    }
  });

  server.post('/devices', async (request: FastifyRequest<{
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const deviceData = request.body;
      const device = await iotService.registerDevice(deviceData);
      
      return (reply as FastifyReply).status(201).send({
        _success: true,
        _data: device,
        _message: 'Device registered successfully',
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Failed to register device',
        _error: error.message,
      });
    }
  });

  server.put('/devices/:deviceId', async (request: FastifyRequest<{
    Params: { deviceId: string }
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const { deviceId  } = (request.params as unknown);
      const updateData = request.body;
      
      const device = await iotService.updateDevice(deviceId, updateData);
      
      return reply.send({
        _success: true,
        _data: device,
        _message: 'Device updated successfully',
      });
    } catch (_error: unknown) {
      const status = error.message === 'Device not found' ? _404 : 400;
      return (reply as FastifyReply).status(status).send({
        _success: false,
        _message: 'Failed to update device',
        _error: error.message,
      });
    }
  });

  // Data recording and retrieval routes
  server.post('/data', async (request: FastifyRequest<{
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const dataRecord = request.body;
      const result = await iotService.recordData(dataRecord);
      
      return (reply as FastifyReply).status(201).send({
        _success: true,
        _data: result,
        _message: 'Data recorded successfully',
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Failed to record data',
        _error: error.message,
      });
    }
  });

  server.get('/devices/:deviceId/data', async (request: FastifyRequest<{
    Params: { deviceId: string }
    Querystring: { 
      startDate?: string; 
      endDate?: string; 
      dataType?: string;
      limit?: number;
    }
  }>, reply: FastifyReply) => {
    try {
      const { deviceId  } = (request.params as unknown);
      const filters = request.query;
      
      const data = await iotService.getDeviceData(deviceId, filters);
      
      return reply.send({
        _success: true,
        data,
        _count: data.length,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve device data',
        _error: error.message,
      });
    }
  });

  // Alert management routes
  server.get('/alerts', async (request: FastifyRequest<{
    Querystring: { deviceId?: string; severity?: string; acknowledged?: boolean }
  }>, reply: FastifyReply) => {
    try {
      const filters = request.query;
      const alerts = await iotService.getAlerts(filters);
      
      return reply.send({
        _success: true,
        _data: alerts,
        _count: alerts.length,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve alerts',
        _error: error.message,
      });
    }
  });

  server.post('/alerts/:alertId/acknowledge', async (request: FastifyRequest<{
    Params: { alertId: string }
    Body: { acknowledgedBy: string }
  }>, reply: FastifyReply) => {
    try {
      const { alertId  } = (request.params as unknown);
      const { acknowledgedBy  } = (request.body as unknown);
      
      await iotService.acknowledgeAlert(alertId, acknowledgedBy);
      
      return reply.send({
        _success: true,
        _message: 'Alert acknowledged successfully',
      });
    } catch (_error: unknown) {
      const status = error.message === 'Alert not found' ? _404 : 400;
      return (reply as FastifyReply).status(status).send({
        _success: false,
        _message: 'Failed to acknowledge alert',
        _error: error.message,
      });
    }
  });

  server.post('/alerts/:alertId/resolve', async (request: FastifyRequest<{
    Params: { alertId: string }
    Body: { resolution: string }
  }>, reply: FastifyReply) => {
    try {
      const { alertId  } = (request.params as unknown);
      const { resolution  } = (request.body as unknown);
      
      await iotService.resolveAlert(alertId, resolution);
      
      return reply.send({
        _success: true,
        _message: 'Alert resolved successfully',
      });
    } catch (_error: unknown) {
      const status = error.message === 'Alert not found' ? _404 : 400;
      return (reply as FastifyReply).status(status).send({
        _success: false,
        _message: 'Failed to resolve alert',
        _error: error.message,
      });
    }
  });

  // Analytics routes
  server.get('/analytics', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const analytics = await iotService.getDeviceAnalytics();
      
      return reply.send({
        _success: true,
        _data: analytics,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve analytics',
        _error: error.message,
      });
    }
  });

  // Device types reference
  server.get('/device-types', async (request: FastifyRequest, reply: FastifyReply) => {
    const deviceTypes = [
      { _id: 'SMART_SCALE', _name: 'Smart Scale', _description: 'Digital scale for component weighing', _icon: '⚖️' },
      { _id: 'DIAGNOSTIC_TOOL', _name: 'Diagnostic Tool', _description: 'Automated device diagnostics', _icon: '🔍' },
      { _id: 'ENVIRONMENT_SENSOR', _name: 'Environment Sensor', _description: 'Temperature, humidity monitoring', _icon: '🌡️' },
      { _id: 'POWER_MONITOR', _name: 'Power Monitor', _description: 'Power consumption analysis', _icon: '⚡' },
      { _id: 'RFID_READER', _name: 'RFID Reader', _description: 'Inventory tracking via RFID', _icon: '📡' },
      { _id: 'BARCODE_SCANNER', _name: 'Barcode Scanner', _description: 'Quick device identification', _icon: '🔯' },
      { _id: 'MULTIMETER', _name: 'Digital Multimeter', _description: 'Electrical testing and measurement', _icon: '🔌' },
      { _id: 'OSCILLOSCOPE', _name: 'Oscilloscope', _description: 'Signal analysis and testing', _icon: '📊' },
      { _id: 'THERMAL_CAMERA', _name: 'Thermal Camera', _description: 'Heat signature analysis', _icon: '🔥' },
      { _id: 'VIBRATION_SENSOR', _name: 'Vibration Sensor', _description: 'Mechanical issue detection', _icon: '📳' },
      { _id: 'SOUND_ANALYZER', _name: 'Sound Analyzer', _description: 'Audio diagnostics and analysis', _icon: '🎵' },
      { _id: 'LOCATION_BEACON', _name: 'Location Beacon', _description: 'Technician and asset tracking', _icon: '📍' },
    ];

    return reply.send({
      _success: true,
      _data: deviceTypes,
    });
  });
}

export default iotIntegrationRoutes;