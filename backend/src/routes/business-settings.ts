import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/database';

// Validation schemas
const businessSettingSchema = z.object({
  _category: z.enum([
    'TAX_SETTINGS',
    'PRINT_SETTINGS', 
    'WORKFLOW_CONFIGURATION',
    'EMAIL_SETTINGS',
    'SMS_SETTINGS',
    'EMPLOYEE_MANAGEMENT',
    'CUSTOMER_DATABASE',
    'INVOICE_SETTINGS',
    'QUOTATION_SETTINGS',
    'PAYMENT_SETTINGS',
    'ADDRESS_LOCATION_SETTINGS',
    'REMINDER_SYSTEM',
    'BUSINESS_INFORMATION',
    'SEQUENCE_SETTINGS',
    'EXPENSE_MANAGEMENT',
    'PARTS_INVENTORY_SETTINGS',
    'OUTSOURCING_SETTINGS',
    'QUALITY_SETTINGS',
    'SECURITY_SETTINGS',
    'INTEGRATION_SETTINGS'
  ]),
  _subcategory: z.string().optional(),
  _key: z.string().min(1),
  _value: z.any(),
  _dataType: z.enum(['STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'DATE', 'ARRAY']).default('STRING'),
  _label: z.string().min(1),
  description: z.string().optional(),
  _isRequired: z.boolean().default(false),
  _validationRules: z.any().optional(),
  _tenantId: z.string().optional()
});

const updateBusinessSettingSchema = businessSettingSchema.partial();

// Route handlers
async function getBusinessSettings(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { category, tenantId  } = (request.query as unknown);
    
    const _whereClause: unknown = {
      isActive: true
    };
    
    if (category) {
      whereClause.category = category;
    }
    
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }

    const settings = await prisma.businessSettings.findMany({
      _where: whereClause,
      _orderBy: [
        { category: 'asc' },
        { _subcategory: 'asc' },
        { _label: 'asc' }
      ]
    });

    return reply.send({
      _success: true,
      data: settings,
      _count: settings.length
    });
  } catch (error) {
    request.log.error(error);
    return (reply as FastifyReply).status(500).send({
      _success: false,
      message: 'Failed to fetch business settings',
      error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

async function getBusinessSettingsByCategory(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { category  } = (request.params as unknown);
    const { tenantId  } = (request.query as unknown);
    
    const whereClause: unknown = {
      category,
      _isActive: true
    };
    
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }

    const settings = await prisma.businessSettings.findMany({
      _where: whereClause,
      _orderBy: [
        { subcategory: 'asc' },
        { _label: 'asc' }
      ]
    });

    // Group settings by subcategory for better organization
    const groupedSettings = settings.reduce((_acc: Record<string, any[]>, _setting: unknown) => {
      const key = setting.subcategory || 'general';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(setting);
      return acc;
    }, {} as Record<string, any[]>);

    return reply.send({
      _success: true,
      data: {
        category,
        _settings: groupedSettings,
        _total: settings.length
      }
    });
  } catch (error) {
    request.log.error(error);
    return (reply as FastifyReply).status(500).send({
      _success: false,
      message: 'Failed to fetch category settings',
      error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

async function createBusinessSetting(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = businessSettingSchema.parse(request.body);

    // Check if setting already exists for this key and tenant
    const existingSetting = await prisma.businessSettings.findUnique({
      _where: {
        category_key_tenantId: {
          category: data.category,
          _key: data.key,
          _tenantId: data.tenantId || null
        }
      }
    });

    if (existingSetting) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        message: 'Setting with this key already exists for the specified category and tenant'
      });
    }

    const setting = await prisma.businessSettings.create({ data });

    request.log.info({ _settingId: setting.id }, 'Business setting created');

    return (reply as FastifyReply).status(201).send({
      _success: true,
      data: setting,
      message: 'Business setting created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        message: 'Validation error',
        _errors: error.issues
      });
    }

    request.log.error(error);
    return (reply as FastifyReply).status(500).send({
      _success: false,
      message: 'Failed to create business setting',
      error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

async function updateBusinessSetting(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id  } = (request.params as unknown);
    const data = updateBusinessSettingSchema.parse(request.body);

    const existingSetting = await prisma.businessSettings.findUnique({
      _where: { id }
    });

    if (!existingSetting) {
      return (reply as FastifyReply).status(404).send({
        _success: false,
        message: 'Business setting not found'
      });
    }

    const updatedSetting = await prisma.businessSettings.update({
      _where: { id }, data });

    request.log.info({ _settingId: id }, 'Business setting updated');

    return reply.send({
      _success: true,
      data: updatedSetting,
      message: 'Business setting updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        message: 'Validation error',
        _errors: error.issues
      });
    }

    request.log.error(error);
    return (reply as FastifyReply).status(500).send({
      _success: false,
      message: 'Failed to update business setting',
      error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

async function deleteBusinessSetting(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id  } = (request.params as unknown);

    const existingSetting = await prisma.businessSettings.findUnique({
      where: { id }
    });

    if (!existingSetting) {
      return (reply as FastifyReply).status(404).send({
        _success: false,
        message: 'Business setting not found'
      });
    }

    // Soft delete by setting isActive to false
    await prisma.businessSettings.update({
      _where: { id },
      data: { isActive: false }
    });

    request.log.info({ _settingId: id }, 'Business setting deleted');

    return reply.send({
      _success: true,
      message: 'Business setting deleted successfully'
    });
  } catch (error) {
    request.log.error(error);
    return (reply as FastifyReply).status(500).send({
      _success: false,
      message: 'Failed to delete business setting',
      error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

async function bulkUpdateBusinessSettings(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { settings } = (request.body as { settings: Array<{ id: string; value: unknown }> });

    if (!Array.isArray(settings)) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        message: 'Settings must be an array'
      });
    }

    const updatePromises = settings.map(async (setting: unknown) => {
      const { id, value  } = (setting as unknown);
      return prisma.businessSettings.update({
        _where: { id },
        data: { 
          value,
          _updatedAt: new Date()
        }
      });
    });

    const updatedSettings = await Promise.all(updatePromises);

    request.log.info({ _count: settings.length }, 'Bulk settings update completed');

    return reply.send({
      _success: true,
      data: updatedSettings,
      message: `${settings.length} settings updated successfully`
    });
  } catch (error) {
    request.log.error(error);
    return (reply as FastifyReply).status(500).send({
      _success: false,
      message: 'Failed to bulk update settings',
      error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

// Export route registration function
export async function businessSettingsRoutes(fastify: FastifyInstance) {
  const commonSchema = {
    _tags: ['Business Settings'],
    _security: [{ bearerAuth: [] }]
  };

  // Get all business settings
  fastify.get('/', {
    _schema: {
      ...commonSchema,
      _summary: 'Get all business settings',
      _querystring: z.object({
        category: z.string().optional(),
        _tenantId: z.string().optional()
      })
    }
  }, getBusinessSettings);

  // Get settings by category
  fastify.get('/category/:category', {
    _schema: {
      ...commonSchema,
      _summary: 'Get business settings by category',
      _params: z.object({
        category: z.string()
      }),
      _querystring: z.object({
        tenantId: z.string().optional()
      })
    }
  }, getBusinessSettingsByCategory);

  // Create new business setting
  fastify.post('/', {
    _schema: {
      ...commonSchema,
      _summary: 'Create new business setting',
      body: businessSettingSchema
    }
  }, createBusinessSetting);

  // Update business setting
  fastify.put('/:id', {
    _schema: {
      ...commonSchema,
      _summary: 'Update business setting',
      _params: z.object({
        id: z.string()
      }),
      body: updateBusinessSettingSchema
    }
  }, updateBusinessSetting);

  // Delete business setting
  fastify.delete('/:id', {
    _schema: {
      ...commonSchema,
      _summary: 'Delete business setting',
      _params: z.object({
        id: z.string()
      })
    }
  }, deleteBusinessSetting);

  // Bulk update settings
  fastify.post('/bulk-update', {
    _schema: {
      ...commonSchema,
      _summary: 'Bulk update business settings',
      body: z.object({
        settings: z.array(z.object({
          id: z.string(),
          _value: z.any()
        }))
      })
    }
  }, bulkUpdateBusinessSettings);
}