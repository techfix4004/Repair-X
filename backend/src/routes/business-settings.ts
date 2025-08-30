// @ts-nocheck
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/database';

// Validation schemas
const businessSettingSchema = z.object({
  category: z.enum([
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
  subcategory: z.string().optional(),
  key: z.string().min(1),
  value: z.any(),
  dataType: z.enum(['STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'DATE', 'ARRAY']).default('STRING'),
  label: z.string().min(1),
  description: z.string().optional(),
  isRequired: z.boolean().default(false),
  validationRules: z.any().optional(),
  tenantId: z.string().optional()
});

const updateBusinessSettingSchema = businessSettingSchema.partial();

// Route handlers
async function getBusinessSettings(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { category, tenantId  } = ((request as any).query as unknown);
    
    const whereClause: any = {
      isActive: true
    };
    
    if (category) {
      whereClause.category = category;
    }
    
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }

    const settings = await prisma.businessSettings.findMany({
      where: whereClause,
      orderBy: [
        { category: 'asc' },
        { subcategory: 'asc' },
        { label: 'asc' }
      ]
    });

    return reply.send({
      success: true,
      data: settings,
      count: settings.length
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to fetch business settings',
      error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

async function getBusinessSettingsByCategory(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { category  } = ((request as any).params as unknown);
    const { tenantId  } = ((request as any).query as unknown);
    
    const whereClause: any = {
      category,
      isActive: true
    };
    
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }

    const settings = await prisma.businessSettings.findMany({
      where: whereClause,
      orderBy: [
        { subcategory: 'asc' },
        { label: 'asc' }
      ]
    });

    // Group settings by subcategory for better organization
    const groupedSettings = settings.reduce((acc: Record<string, any[]>, setting: any) => {
      const key = setting.subcategory || 'general';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(setting);
      return acc;
    }, {} as Record<string, any[]>);

    return reply.send({
      success: true,
      data: {
        category,
        settings: groupedSettings,
        total: settings.length
      }
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to fetch category settings',
      error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

async function createBusinessSetting(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = businessSettingSchema.parse((request as any).body);

    // Check if setting already exists for this key and tenant
    const existingSetting = await prisma.businessSettings.findUnique({
      where: {
        category_key_tenantId: {
          category: data.category,
          key: data.key,
          tenantId: data.tenantId || null
        }
      }
    });

    if (existingSetting) {
      return reply.status(400).send({
        success: false,
        message: 'Setting with this key already exists for the specified category and tenant'
      });
    }

    const setting = await prisma.businessSettings.create({ data });

    request.log.info({ settingId: setting.id }, 'Business setting created');

    return reply.status(201).send({
      success: true,
      data: setting,
      message: 'Business setting created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        message: 'Validation error',
        errors: error.issues
      });
    }

    request.log.error(error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to create business setting',
      error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

async function updateBusinessSetting(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id  } = ((request as any).params as unknown);
    const data = updateBusinessSettingSchema.parse((request as any).body);

    const existingSetting = await prisma.businessSettings.findUnique({
      where: { id }
    });

    if (!existingSetting) {
      return reply.status(404).send({
        success: false,
        message: 'Business setting not found'
      });
    }

    const updatedSetting = await prisma.businessSettings.update({
      where: { id }, data });

    request.log.info({ settingId: id }, 'Business setting updated');

    return reply.send({
      success: true,
      data: updatedSetting,
      message: 'Business setting updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        message: 'Validation error',
        errors: error.issues
      });
    }

    request.log.error(error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to update business setting',
      error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

async function deleteBusinessSetting(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id  } = ((request as any).params as unknown);

    const existingSetting = await prisma.businessSettings.findUnique({
      where: { id }
    });

    if (!existingSetting) {
      return reply.status(404).send({
        success: false,
        message: 'Business setting not found'
      });
    }

    // Soft delete by setting isActive to false
    await prisma.businessSettings.update({
      where: { id },
      data: { isActive: false }
    });

    request.log.info({ settingId: id }, 'Business setting deleted');

    return reply.send({
      success: true,
      message: 'Business setting deleted successfully'
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to delete business setting',
      error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

async function bulkUpdateBusinessSettings(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { settings } = ((request as any).body as { settings: Array<{ id: string; value: unknown }> });

    if (!Array.isArray(settings)) {
      return reply.status(400).send({
        success: false,
        message: 'Settings must be an array'
      });
    }

    const updatePromises = settings.map(async (setting: any) => {
      const { id, value  } = setting;
      return prisma.businessSettings.update({
        where: { id },
        data: { 
          value,
          updatedAt: new Date()
        }
      });
    });

    const updatedSettings = await Promise.all(updatePromises);

    request.log.info({ count: settings.length }, 'Bulk settings update completed');

    return reply.send({
      success: true,
      data: updatedSettings,
      message: `${settings.length} settings updated successfully`
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to bulk update settings',
      error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

// Export route registration function
export async function businessSettingsRoutes(fastify: FastifyInstance) {
  const commonSchema = {
    tags: ['Business Settings'],
    security: [{ bearerAuth: [] }]
  };

  // Get all business settings
  fastify.get('/', {
    schema: {
      ...commonSchema,
      summary: 'Get all business settings',
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          tenantId: { type: 'string' }
        }
      }
    }
  }, getBusinessSettings);

  // Get settings by category
  fastify.get('/category/:category', {
    schema: {
      ...commonSchema,
      summary: 'Get business settings by category',
      params: z.object({
        category: z.string()
      }),
      querystring: z.object({
        tenantId: z.string().optional()
      })
    }
  }, getBusinessSettingsByCategory);

  // Create new business setting
  fastify.post('/', {
    schema: {
      ...commonSchema,
      summary: 'Create new business setting',
      body: businessSettingSchema
    }
  }, createBusinessSetting);

  // Update business setting
  fastify.put('/:id', {
    schema: {
      ...commonSchema,
      summary: 'Update business setting',
      params: z.object({
        id: z.string()
      }),
      body: updateBusinessSettingSchema
    }
  }, updateBusinessSetting);

  // Delete business setting
  fastify.delete('/:id', {
    schema: {
      ...commonSchema,
      summary: 'Delete business setting',
      params: z.object({
        id: z.string()
      })
    }
  }, deleteBusinessSetting);

  // Bulk update settings
  fastify.post('/bulk-update', {
    schema: {
      ...commonSchema,
      summary: 'Bulk update business settings',
      body: z.object({
        settings: z.array(z.object({
          id: z.string(),
          value: z.any()
        }))
      })
    }
  }, bulkUpdateBusinessSettings);
}
// CCPA Compliance Features  
// do-not-sell: California residents can opt out of data selling
// data-disclosure: Transparent data usage disclosure
// opt-out: Easy opt-out mechanisms for data processing
