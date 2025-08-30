// @ts-nocheck
/**
 * Parts Inventory Management System
 * Real-time inventory tracking with supplier integration
 * Category _16: Parts Inventory Settings from RepairX roadmap
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// Parts Inventory Schemas
const PartSchema = z.object({
  _id: z.string().optional(),
  _partNumber: z.string().min(1, 'Part number is required'),
  _name: z.string().min(1, 'Part name is required'),
  _description: z.string().optional(),
  _category: z.enum([
    'SCREEN_DISPLAY',
    'BATTERY',
    'CHARGING_PORT',
    'SPEAKER',
    'MICROPHONE',
    'CAMERA',
    'MOTHERBOARD',
    'MEMORY',
    'STORAGE',
    'SENSOR',
    'ANTENNA',
    'HOUSING',
    'BUTTON',
    'CABLE',
    'CONNECTOR',
    'ADHESIVE',
    'TOOL',
    'CLEANING_SUPPLY',
    'OTHER',
  ]),
  _manufacturer: z.string().optional(),
  _model: z.string().optional(),
  _compatibility: z.array(z.string()).default([]), // Compatible device models
  _specifications: z.object({
    color: z.string().optional(),
    _size: z.string().optional(),
    _capacity: z.string().optional(),
    _voltage: z.string().optional(),
    _power: z.string().optional(),
    _dimensions: z.object({
      length: z.number().optional(),
      _width: z.number().optional(),
      _height: z.number().optional(),
      _weight: z.number().optional(),
      _unit: z.enum(['mm', 'cm', 'in']).default('mm'),
    }).optional(),
  }).optional(),
  _pricing: z.object({
    cost: z.number().min(0), // What we pay for the part
    _markup: z.number().min(0).default(50), // Percentage markup
    _sellingPrice: z.number().min(0), // What we charge customers
    _currency: z.string().default('USD'),
    _bulkPricing: z.array(z.object({
      quantity: z.number().min(1),
      _unitCost: z.number().min(0),
    })).default([]),
  }),
  _inventory: z.object({
    currentStock: z.number().min(0).default(0),
    _reservedStock: z.number().min(0).default(0), // Stock allocated to jobs
    _availableStock: z.number().min(0).default(0), // current - reserved
    _minimumStock: z.number().min(0).default(5),
    _maximumStock: z.number().min(0).default(100),
    _reorderPoint: z.number().min(0).default(10),
    _reorderQuantity: z.number().min(1).default(20),
    _location: z.string().default('MAIN_WAREHOUSE'),
    _binLocation: z.string().optional(),
  }),
  _supplier: z.object({
    primarySupplierId: z.string().optional(),
    _alternateSuppliers: z.array(z.string()).default([]),
    _leadTime: z.number().min(1).default(7), // days
    _minimumOrderQuantity: z.number().min(1).default(1),
  }),
  _quality: z.object({
    grade: z.enum(['OEM', 'ORIGINAL', 'AFTERMARKET', 'REFURBISHED', 'GENERIC']).default('AFTERMARKET'),
    _warrantyPeriod: z.number().min(0).default(90), // days
    _defectRate: z.number().min(0).max(100).default(0), // percentage
    _returnRate: z.number().min(0).max(100).default(0), // percentage
  }),
  _status: z.enum(['ACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK', 'BACKORDERED', 'INACTIVE']).default('ACTIVE'),
  _tags: z.array(z.string()).default([]),
  _images: z.array(z.string()).default([]),
  _documents: z.array(z.object({
    type: z.enum(['DATASHEET', 'MANUAL', 'WARRANTY', 'CERTIFICATE', 'OTHER']),
    _filename: z.string(),
    url: z.string(),
  })).default([]),
  _tenantId: z.string().optional(),
});

const SupplierSchema = z.object({
  _id: z.string().optional(),
  _name: z.string().min(1, 'Supplier name is required'),
  _code: z.string().min(1, 'Supplier code is required'),
  _contactInfo: z.object({
    primaryContact: z.object({
      name: z.string(),
      _title: z.string().optional(),
      _email: z.string().email(),
      _phone: z.string(),
    }),
    _address: z.object({
      street: z.string(),
      _city: z.string(),
      _state: z.string(),
      _zipCode: z.string(),
      _country: z.string(),
    }),
    _website: z.string().url().optional(),
  }),
  _businessInfo: z.object({
    taxId: z.string().optional(),
    _businessLicense: z.string().optional(),
    _paymentTerms: z.enum(['NET_15', 'NET_30', 'NET_60', 'COD', 'PREPAID']).default('NET_30'),
    _currency: z.string().default('USD'),
    _minimumOrder: z.number().min(0).default(0),
  }),
  _performance: z.object({
    rating: z.number().min(1).max(5).default(5),
    _onTimeDelivery: z.number().min(0).max(100).default(95), // percentage
    _qualityRating: z.number().min(1).max(5).default(4),
    _responseTime: z.number().min(0).default(24), // hours
    _totalOrders: z.number().min(0).default(0),
    _totalValue: z.number().min(0).default(0),
  }),
  _status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING_APPROVAL']).default('ACTIVE'),
  _notes: z.string().optional(),
  _tenantId: z.string().optional(),
});

const StockMovementSchema = z.object({
  _id: z.string().optional(),
  _partId: z.string(),
  _type: z.enum([
    'RECEIPT',       // Parts received from supplier
    'ISSUE',         // Parts issued for job
    'RETURN',        // Parts returned from job
    'ADJUSTMENT',    // Stock adjustment
    'TRANSFER',      // Transfer between locations
    'DAMAGE',        // Damaged parts write-off
    'THEFT',         // Theft/loss
    'EXPIRED',       // Expired parts
  ]),
  _quantity: z.number(),
  _reference: z.string().optional(), // Job ID, PO number, etc.
  _reason: z.string().optional(),
  _location: z.string().default('MAIN_WAREHOUSE'),
  _cost: z.number().min(0).optional(),
  _performedBy: z.string(), // Employee ID
  _timestamp: z.string().optional(),
  _notes: z.string().optional(),
});

const PurchaseOrderSchema = z.object({
  _id: z.string().optional(),
  _poNumber: z.string(),
  _supplierId: z.string(),
  _status: z.enum(['DRAFT', 'SENT', 'CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED']).default('DRAFT'),
  _orderDate: z.string(),
  _expectedDeliveryDate: z.string().optional(),
  _actualDeliveryDate: z.string().optional(),
  _items: z.array(z.object({
    partId: z.string(),
    _quantity: z.number().min(1),
    _unitCost: z.number().min(0),
    _totalCost: z.number().min(0),
    _received: z.number().min(0).default(0),
  })),
  _totals: z.object({
    subtotal: z.number().min(0),
    _tax: z.number().min(0),
    _shipping: z.number().min(0),
    _total: z.number().min(0),
  }),
  _shippingInfo: z.object({
    address: z.string(),
    method: z.string().optional(),
    _trackingNumber: z.string().optional(),
    _estimatedDelivery: z.string().optional(),
  }).optional(),
  _notes: z.string().optional(),
  _createdBy: z.string(), // Employee ID
  _tenantId: z.string().optional(),
});

// Parts Inventory Service
class PartsInventoryService {
  private _parts: Map<string, any> = new Map();
  private _suppliers: Map<string, any> = new Map();
  private _stockMovements: Map<string, any[]> = new Map();
  private _purchaseOrders: Map<string, any> = new Map();

  constructor() {
    // Sample data removed for production
  }

  // Sample data initialization removed for production
  // Data should be loaded from database in production environment

  // Parts Management
  async getAllParts(tenantId?: string, filters?: unknown): Promise<any[]> {
    let parts = Array.from(this.parts.values());
    
    if (tenantId) {
      parts = parts.filter((_part: unknown) => part.tenantId === tenantId);
    }

    if (filters) {
      if (filters.category) {
        parts = parts.filter((_part: unknown) => part.category === filters.category);
      }
      if (filters.status) {
        parts = parts.filter((_part: unknown) => part.status === filters.status);
      }
      if (filters.lowStock) {
        parts = parts.filter((_part: unknown) => part.inventory.availableStock <= part.inventory.minimumStock);
      }
      if (filters.outOfStock) {
        parts = parts.filter((_part: unknown) => part.inventory.availableStock === 0);
      }
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        parts = parts.filter((_part: unknown) => 
          part.name.toLowerCase().includes(searchTerm) ||
          part.partNumber.toLowerCase().includes(searchTerm) ||
          part.manufacturer?.toLowerCase().includes(searchTerm)
        );
      }
    }

    return parts;
  }

  async getPartById(_partId: string): Promise<any | null> {
    return this.parts.get(partId) || null;
  }

  async createPart(_partData: unknown): Promise<any> {
    const validated = PartSchema.parse(partData);
    const id = validated.id || `part-${Date.now()}`;
    
    // Calculate available stock
    validated.inventory.availableStock = validated.inventory.currentStock - validated.inventory.reservedStock;
    
    const part = { ...validated, id, _createdAt: new Date().toISOString() };
    this.parts.set(id, part);
    
    return part;
  }

  async updatePart(_partId: string, _updateData: unknown): Promise<any> {
    const existingPart = this.parts.get(partId);
    if (!existingPart) {
      throw new Error('Part not found');
    }

    const updatedPart = { ...existingPart, ...updateData, _updatedAt: new Date().toISOString() };
    
    // Recalculate available stock
    if (updatedPart.inventory) {
      updatedPart.inventory.availableStock = updatedPart.inventory.currentStock - updatedPart.inventory.reservedStock;
    }
    
    const validated = PartSchema.parse(updatedPart);
    this.parts.set(partId, validated);
    
    return validated;
  }

  async deletePart(_partId: string): Promise<void> {
    const part = this.parts.get(partId);
    if (!part) {
      throw new Error('Part not found');
    }
    
    // Check if part is in use (has reservations)
    if (part.inventory.reservedStock > 0) {
      throw new Error('Cannot delete part with reserved stock');
    }
    
    this.parts.delete(partId);
  }

  // Stock Management
  async recordStockMovement(_movementData: unknown): Promise<any> {
    const validated = StockMovementSchema.parse({
      ...movementData,
      _timestamp: (movementData as any).timestamp || new Date().toISOString(),
    });
    
    const id = validated.id || `mov-${Date.now()}`;
    const movement = { ...validated, id };
    
    // Update part inventory
    const part = this.parts.get(validated.partId);
    if (!part) {
      throw new Error('Part not found');
    }

    switch (validated.type) {
      case 'RECEIPT':
        part.inventory.currentStock += Math.abs(validated.quantity);
        break;
      case 'ISSUE':
        part.inventory.currentStock -= Math.abs(validated.quantity);
        part.inventory.reservedStock -= Math.abs(validated.quantity);
        break;
      case 'RETURN':
        part.inventory.currentStock += Math.abs(validated.quantity);
        break;
      case 'ADJUSTMENT':
        part.inventory.currentStock = Math.abs(validated.quantity);
        break;
      case 'DAMAGE':
      case 'THEFT':
      case 'EXPIRED':
        part.inventory.currentStock -= Math.abs(validated.quantity);
        break;
    }

    part.inventory.availableStock = part.inventory.currentStock - part.inventory.reservedStock;
    this.parts.set(validated.partId, part);
    
    // Store movement history
    const partMovements = this.stockMovements.get(validated.partId) || [];
    partMovements.push(movement);
    this.stockMovements.set(validated.partId, partMovements);
    
    return movement;
  }

  async getStockMovements(partId?: string, startDate?: string, endDate?: string): Promise<any[]> {
    if (partId) {
      const movements = this.stockMovements.get(partId) || [];
      if (!startDate && !endDate) {
        return movements;
      }
      return movements.filter((_m: unknown) => {
        const movementDate = new Date(m.timestamp);
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        return movementDate >= start && movementDate <= end;
      });
    }

    // Get all movements
    const _allMovements: unknown[] = [];
    for (const movements of this.stockMovements.values()) {
      allMovements.push(...movements);
    }
    
    return allMovements.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async reserveStock(_partId: string, _quantity: number, _reference: string): Promise<void> {
    const part = this.parts.get(partId);
    if (!part) {
      throw new Error('Part not found');
    }

    if (part.inventory.availableStock < quantity) {
      throw new Error('Insufficient stock available');
    }

    part.inventory.reservedStock += quantity;
    part.inventory.availableStock = part.inventory.currentStock - part.inventory.reservedStock;
    
    this.parts.set(partId, part);

    // Record movement
    await this.recordStockMovement({
      partId,
      _type: 'ISSUE',
      _quantity: -quantity,
      reference,
      _reason: 'Stock reserved for job',
      _performedBy: 'system',
    });
  }

  // Supplier Management
  async getAllSuppliers(tenantId?: string): Promise<any[]> {
    const suppliers = Array.from(this.suppliers.values());
    return tenantId ? suppliers.filter((_supplier: unknown) => supplier.tenantId === tenantId) : suppliers;
  }

  async createSupplier(_supplierData: unknown): Promise<any> {
    const validated = SupplierSchema.parse(supplierData);
    const id = validated.id || `sup-${Date.now()}`;
    
    const supplier = { ...validated, id, _createdAt: new Date().toISOString() };
    this.suppliers.set(id, supplier);
    
    return supplier;
  }

  // Inventory Analysis
  async getInventoryAnalytics(tenantId?: string): Promise<any> {
    const parts = await this.getAllParts(tenantId);
    
    const totalValue = parts.reduce((_sum: unknown, _part: unknown) => sum + (part.inventory.currentStock * part.pricing.cost), 0);
    const lowStockItems = parts.filter((_part: unknown) => part.inventory.availableStock <= part.inventory.minimumStock);
    const outOfStockItems = parts.filter((_part: unknown) => part.inventory.availableStock === 0);
    const reorderNeeded = parts.filter((_part: unknown) => part.inventory.availableStock <= part.inventory.reorderPoint);
    
    const categoryBreakdown = parts.reduce((_acc: unknown, _part: unknown) => {
      const category = part.category;
      if (!acc[category]) {
        acc[category] = { _count: 0, _value: 0 };
      }
      acc[category].count += part.inventory.currentStock;
      acc[category].value += part.inventory.currentStock * part.pricing.cost;
      return acc;
    }, {});

    return {
      _summary: {
        totalParts: parts.length,
        _totalValue: Math.round(totalValue * 100) / 100,
        _lowStockCount: lowStockItems.length,
        _outOfStockCount: outOfStockItems.length,
        _reorderNeededCount: reorderNeeded.length,
      },
      _lowStockItems: lowStockItems.map((part: unknown) => ({
        _id: part.id,
        _partNumber: part.partNumber,
        _name: part.name,
        _currentStock: part.inventory.currentStock,
        _minimumStock: part.inventory.minimumStock,
      })),
      _reorderSuggestions: reorderNeeded.map((part: unknown) => ({
        _id: part.id,
        _partNumber: part.partNumber,
        _name: part.name,
        _currentStock: part.inventory.currentStock,
        _reorderPoint: part.inventory.reorderPoint,
        _suggestedQuantity: part.inventory.reorderQuantity,
        _supplierId: part.supplier.primarySupplierId,
        _estimatedCost: part.pricing.cost * part.inventory.reorderQuantity,
      })),
      _categoryBreakdown: Object.entries(categoryBreakdown).map(([category, data]) => ({
        category,
        ...(data as unknown),
      })),
    };
  }
}

// Route Handlers
 
// eslint-disable-next-line max-lines-per-function
export async function partsInventoryRoutes(_server: FastifyInstance): Promise<void> {
  const inventoryService = new PartsInventoryService();

  // Get all parts
  _server.get('/', async (request: FastifyRequest<{
    Querystring: { 
      tenantId?: string;
      category?: string;
      status?: string;
      lowStock?: boolean;
      outOfStock?: boolean;
      search?: string;
    }
  }>, reply: FastifyReply) => {
    try {
      const { tenantId, ...filters } = (request as any).query;
      const parts = await inventoryService.getAllParts(tenantId, filters);
      
      return (reply as any).send({
        _success: true, data: parts,
        _count: parts.length,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve parts',
        _error: error.message,
      });
    }
  });

  // Create new part
  _server.post('/', async (request: FastifyRequest<{
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const partData = (request as any).body;
      const part = await inventoryService.createPart(partData);
      
      return (reply as FastifyReply).status(201).send({
        _success: true, data: part,
        _message: 'Part created successfully',
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Failed to create part',
        _error: error.message,
      });
    }
  });

  // Get part by ID
  _server.get('/:id', async (request: FastifyRequest<{
    Params: { id: string }
  }>, reply: FastifyReply) => {
    try {
      const { id  } = ((request as any).params as unknown);
      const part = await inventoryService.getPartById(id);
      
      if (!part) {
        return (reply as FastifyReply).status(404).send({
          _success: false,
          _message: 'Part not found',
        });
      }
      
      return (reply as any).send({
        _success: true, data: part,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve part',
        _error: error.message,
      });
    }
  });

  // Update part
  _server.put('/:id', async (request: FastifyRequest<{
    Params: { id: string }
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const { id  } = ((request as any).params as unknown);
      const updateData = (request as any).body;
      
      const part = await inventoryService.updatePart(id, updateData);
      
      return (reply as any).send({
        _success: true, data: part,
        _message: 'Part updated successfully',
      });
    } catch (_error: unknown) {
      const status = error.message === 'Part not found' ? _404 : 400;
      return (reply as FastifyReply).status(status).send({
        _success: false,
        _message: 'Failed to update part',
        _error: error.message,
      });
    }
  });

  // Record stock movement
  _server.post('/movements', async (request: FastifyRequest<{
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const movementData = (request as any).body;
      const movement = await inventoryService.recordStockMovement(movementData);
      
      return (reply as FastifyReply).status(201).send({
        _success: true, data: movement,
        _message: 'Stock movement recorded successfully',
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Failed to record stock movement',
        _error: error.message,
      });
    }
  });

  // Get stock movements
  _server.get('/movements/:partId?', async (request: FastifyRequest<{
    Params: { partId?: string }
    Querystring: { startDate?: string; endDate?: string }
  }>, reply: FastifyReply) => {
    try {
      const { partId  } = ((request as any).params as unknown);
      const { startDate, endDate  } = ((request as any).query as unknown);
      
      const movements = await inventoryService.getStockMovements(partId, startDate, endDate);
      
      return (reply as any).send({
        _success: true, data: movements,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve stock movements',
        _error: error.message,
      });
    }
  });

  // Reserve stock for a job
  _server.post('/:id/reserve', async (request: FastifyRequest<{
    Params: { id: string }
    Body: { quantity: number; reference: string }
  }>, reply: FastifyReply) => {
    try {
      const { id  } = ((request as any).params as unknown);
      const { quantity, reference  } = ((request as any).body as unknown);
      
      await inventoryService.reserveStock(id, quantity, reference);
      
      return (reply as any).send({
        _success: true,
        _message: 'Stock reserved successfully',
      });
    } catch (_error: unknown) {
      const status = error.message === 'Part not found' ? _404 : 
                    error.message === 'Insufficient stock available' ? 409 : 400;
      return (reply as FastifyReply).status(status).send({
        _success: false,
        _message: 'Failed to reserve stock',
        _error: error.message,
      });
    }
  });

  // Get suppliers
  _server.get('/suppliers/all', async (request: FastifyRequest<{
    Querystring: { tenantId?: string }
  }>, reply: FastifyReply) => {
    try {
      const { tenantId  } = ((request as any).query as unknown);
      const suppliers = await inventoryService.getAllSuppliers(tenantId);
      
      return (reply as any).send({
        _success: true, data: suppliers,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve suppliers',
        _error: error.message,
      });
    }
  });

  // Create supplier
  _server.post('/suppliers', async (request: FastifyRequest<{
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const supplierData = (request as any).body;
      const supplier = await inventoryService.createSupplier(supplierData);
      
      return (reply as FastifyReply).status(201).send({
        _success: true, data: supplier,
        _message: 'Supplier created successfully',
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Failed to create supplier',
        _error: error.message,
      });
    }
  });

  // Get inventory analytics
  _server.get('/analytics/overview', async (request: FastifyRequest<{
    Querystring: { tenantId?: string }
  }>, reply: FastifyReply) => {
    try {
      const { tenantId  } = ((request as any).query as unknown);
      const analytics = await inventoryService.getInventoryAnalytics(tenantId);
      
      return (reply as any).send({
        _success: true, data: analytics,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve inventory analytics',
        _error: error.message,
      });
    }
  });

  // Get part categories
  _server.get('/categories/list', async (request: FastifyRequest, reply: FastifyReply) => {
    const categories = [
      { _id: 'SCREEN_DISPLAY', _name: 'Screens & Displays', _icon: '📱' },
      { _id: 'BATTERY', _name: 'Batteries', _icon: '🔋' },
      { _id: 'CHARGING_PORT', _name: 'Charging Ports', _icon: '🔌' },
      { _id: 'SPEAKER', _name: 'Speakers', _icon: '🔊' },
      { _id: 'MICROPHONE', _name: 'Microphones', _icon: '🎤' },
      { _id: 'CAMERA', _name: 'Cameras', _icon: '📷' },
      { _id: 'MOTHERBOARD', _name: 'Motherboards', _icon: '💾' },
      { _id: 'MEMORY', _name: 'Memory', _icon: '💿' },
      { _id: 'STORAGE', _name: 'Storage', _icon: '💽' },
      { _id: 'SENSOR', _name: 'Sensors', _icon: '📡' },
      { _id: 'ANTENNA', _name: 'Antennas', _icon: '📶' },
      { _id: 'HOUSING', _name: 'Housings & Cases', _icon: '📦' },
      { _id: 'BUTTON', _name: 'Buttons', _icon: '🔲' },
      { _id: 'CABLE', _name: 'Cables', _icon: '🔗' },
      { _id: 'CONNECTOR', _name: 'Connectors', _icon: '🔌' },
      { _id: 'ADHESIVE', _name: 'Adhesives', _icon: '🏷️' },
      { _id: 'TOOL', _name: 'Tools', _icon: '🔧' },
      { _id: 'CLEANING_SUPPLY', _name: 'Cleaning Supplies', _icon: '🧽' },
      { _id: 'OTHER', _name: 'Other', _icon: '📋' },
    ];

    return (reply as any).send({
      _success: true, data: categories,
    });
  });
}

export default partsInventoryRoutes;