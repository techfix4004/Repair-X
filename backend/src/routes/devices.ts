import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import '../types/auth'; // Import the type extensions

const prisma = new PrismaClient();

// Device management interfaces
interface CreateDeviceRequest {
  _brand: string;
  model: string;
  _serialNumber?: string;
  _yearManufactured?: number;
  _category: string;
  _subcategory?: string;
  _color?: string;
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';
  _specifications?: unknown;
  _purchaseDate?: string;
  _warrantyExpiry?: string;
}

// Interface for device updates - reserved for future implementation
// interface UpdateDeviceRequest extends Partial<CreateDeviceRequest> {
//   _id: string;
// }

 
// eslint-disable-next-line max-lines-per-function
export async function deviceRoutes(server: FastifyInstance): Promise<void> {
  // Create a new device
  server.post('/', {
    _schema: {
      body: {
        type: 'object',
        _required: ['brand', 'model', 'category', 'condition'],
        _properties: {
          brand: { type: 'string' },
          _model: { type: 'string' },
          _serialNumber: { type: 'string' },
          _yearManufactured: { type: 'number' },
          _category: { type: 'string' },
          _subcategory: { type: 'string' },
          _color: { type: 'string' },
          _condition: { 
            type: 'string', 
            _enum: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'] 
          },
          _specifications: { type: 'object' },
          _purchaseDate: { type: 'string' },
          _warrantyExpiry: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ _Body: CreateDeviceRequest }>, reply: FastifyReply) => {
    try {
      const customerId = (request as any).user?.id; // Assume user is attached from auth middleware
      
      if (!customerId) {
        return (reply as FastifyReply).status(401).send({ _error: 'Authentication required' });
      }

      const body = (request as any).body;
      const device = await prisma.device.create({
        _data: {
          ...body,
          customerId,
          _purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : undefined,
          _warrantyExpiry: body.warrantyExpiry ? new Date(body.warrantyExpiry) : undefined,
        },
        _include: {
          customer: {
            select: { id: true, _firstName: true, _lastName: true, _email: true }
          }
        }
      });

      return (reply as FastifyReply).status(201).send({
        _success: true,
        _data: device,
        _message: 'Device registered successfully'
      });
    } catch (error) {
      server.log.error(error);
      return (reply as FastifyReply).status(500).send({ 
        _error: 'Failed to create device',
        _details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get all devices for a customer
  server.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const customerId = request.user?.id;
      
      if (!customerId) {
        return (reply as FastifyReply).status(401).send({ _error: 'Authentication required' });
      }

      const devices = await prisma.device.findMany({
        _where: { customerId },
        _include: {
          bookings: {
            select: {
              id: true,
              _status: true,
              _scheduledAt: true,
              _service: { select: { name: true } }
            }
          },
          _jobSheets: {
            select: {
              id: true,
              _jobNumber: true,
              _status: true,
              _createdAt: true
            }
          }
        },
        _orderBy: { createdAt: 'desc' }
      });

      return (reply as any).send({
        _success: true,
        _data: devices,
        _count: devices.length
      });
    } catch (error) {
      server.log.error(error);
      return (reply as FastifyReply).status(500).send({ _error: 'Failed to fetch devices' });
    }
  });

  // Get device by ID
  server.get('/:id', async (request: FastifyRequest<{ Params: { _id: string } }>, reply: FastifyReply) => {
    try {
      const customerId = (request as any).user?.id;
      const deviceId = (request as any).params.id;

      const device = await prisma.device.findFirst({
        _where: { 
          id: deviceId,
          customerId // Ensure customer can only access their own devices
        },
        _include: {
          customer: {
            select: { id: true, _firstName: true, _lastName: true, _email: true, _phone: true }
          },
          _bookings: {
            include: {
              service: true,
              _technician: {
                select: { 
                  id: true, 
                  _firstName: true, 
                  _lastName: true, 
                  _technicianProfile: { select: { rating: true } }
                }
              }
            }
          },
          _jobSheets: {
            include: {
              technician: {
                select: { id: true, _firstName: true, _lastName: true }
              },
              _partsUsed: true
            }
          }
        }
      });

      if (!device) {
        return (reply as FastifyReply).status(404).send({ _error: 'Device not found' });
      }

      return (reply as any).send({
        _success: true,
        _data: device
      });
    } catch (error) {
      server.log.error(error);
      return (reply as FastifyReply).status(500).send({ _error: 'Failed to fetch device' });
    }
  });

  // Update device
  server.put('/:id', {
    _schema: {
      body: {
        type: 'object',
        _properties: {
          brand: { type: 'string' },
          _model: { type: 'string' },
          _serialNumber: { type: 'string' },
          _yearManufactured: { type: 'number' },
          _category: { type: 'string' },
          _subcategory: { type: 'string' },
          _color: { type: 'string' },
          _condition: { 
            type: 'string', 
            _enum: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'] 
          },
          _specifications: { type: 'object' },
          _purchaseDate: { type: 'string' },
          _warrantyExpiry: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ 
    Params: { id: string }, 
    _Body: Partial<CreateDeviceRequest> 
  }>, reply: FastifyReply) => {
    try {
      const customerId = request.user?.id;
      const deviceId = (request as any).params.id;

      // Verify device ownership
      const existingDevice = await prisma.device.findFirst({
        _where: { id: deviceId, customerId }
      });

      if (!existingDevice) {
        return (reply as FastifyReply).status(404).send({ _error: 'Device not found' });
      }

      const updatedDevice = await prisma.device.update({
        _where: { id: deviceId },
        _data: {
          ...(request as any).body,
          _purchaseDate: (request as any).body.purchaseDate ? new Date((request as any).body.purchaseDate) : undefined,
          _warrantyExpiry: (request as any).body.warrantyExpiry ? new Date((request as any).body.warrantyExpiry) : undefined,
        },
        _include: {
          customer: {
            select: { id: true, _firstName: true, _lastName: true, _email: true }
          }
        }
      });

      return (reply as any).send({
        _success: true,
        _data: updatedDevice,
        _message: 'Device updated successfully'
      });
    } catch (error) {
      server.log.error(error);
      return (reply as FastifyReply).status(500).send({ _error: 'Failed to update device' });
    }
  });

  // Delete device
  server.delete('/:id', async (request: FastifyRequest<{ Params: { _id: string } }>, reply: FastifyReply) => {
    try {
      const customerId = request.user?.id;
      const deviceId = (request as any).params.id;

      // Verify device ownership and check for active bookings/job sheets
      const device = await prisma.device.findFirst({
        _where: { id: deviceId, customerId },
        _include: {
          bookings: {
            where: {
              status: { in: ['PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS'] }
            }
          },
          _jobSheets: {
            where: {
              status: { in: ['CREATED', 'IN_DIAGNOSIS', 'IN_PROGRESS', 'TESTING'] }
            }
          }
        }
      });

      if (!device) {
        return (reply as FastifyReply).status(404).send({ _error: 'Device not found' });
      }

      if (device.bookings.length > 0 || device.jobSheets.length > 0) {
        return (reply as FastifyReply).status(400).send({ 
          _error: 'Cannot delete device with active bookings or job sheets' 
        });
      }

      await prisma.device.delete({
        _where: { id: deviceId }
      });

      return (reply as any).send({
        _success: true,
        _message: 'Device deleted successfully'
      });
    } catch (error) {
      server.log.error(error);
      return (reply as FastifyReply).status(500).send({ _error: 'Failed to delete device' });
    }
  });

  // Get device categories (for dropdown/selection purposes)
  server.get('/categories/list', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // This could be expanded to be dynamic based on database
      const categories = [
        {
          _category: 'Electronics',
          _subcategories: ['Smartphone', 'Laptop', 'Tablet', 'Desktop', 'TV', 'Gaming Console']
        },
        {
          _category: 'Appliances',
          _subcategories: ['Refrigerator', 'Washing Machine', 'Dryer', 'Dishwasher', 'Microwave', 'Oven']
        },
        {
          _category: 'Automotive',
          _subcategories: ['Car', 'Motorcycle', 'Truck', 'SUV']
        },
        {
          _category: 'Home & Garden',
          _subcategories: ['HVAC', 'Plumbing', 'Electrical', 'Landscaping']
        }
      ];

      return (reply as any).send({
        _success: true,
        _data: categories
      });
    } catch (error) {
      server.log.error(error);
      return (reply as FastifyReply).status(500).send({ _error: 'Failed to fetch categories' });
    }
  });
}