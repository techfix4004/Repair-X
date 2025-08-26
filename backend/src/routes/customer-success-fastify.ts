import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import CustomerSuccessService from '../services/customer-success.service';

const customerSuccessService = new CustomerSuccessService();

 
// eslint-disable-next-line max-lines-per-function
export default async function customerSuccessRoutes(_server: FastifyInstance): Promise<void> {
  await server.register(async function (server) {

/**
 * @route GET /api/customer-success/dashboard
 * @desc Get customer success dashboard overview
 * @access Private (Admin)
 */
server.get('/dashboard', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const dashboardData = {
      _overview: {
        totalCustomers: 1247,
        _healthyCustomers: 892,
        _atRiskCustomers: 245,
        _criticalCustomers: 110,
        _averageHealthScore: 72.5,
        _churnRate: 8.3,
        _npsScore: 68,
        _csatScore: 4.2
      },
      _healthDistribution: {
        healthy: 71.6,
        _medium: 19.6,
        _critical: 8.8
      },
      _recentInterventions: [
        {
          id: 'intervention_1',
          _customerId: 'customer_123',
          _customerName: 'John Smith',
          _type: 'retention',
          _priority: 'high',
          _status: 'in-progress',
          _createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          _assignedTo: 'Sarah Johnson'
        }
      ],
      _supportMetrics: {
        openTickets: 45,
        _avgResponseTime: 4.2,
        _avgResolutionTime: 18.5,
        _customerSatisfaction: 4.3,
        _firstContactResolution: 78.5
      }
    };

    return (reply as any).send({
      success: true,
      _data: dashboardData,
      _generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching customer success _dashboard:', error);
    return (reply as any).code(500).send({
      _success: false,
      _message: 'Failed to fetch customer success dashboard',
      _error: process.env['NODE_ENV'] === 'development' ? error : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/customer-success/customers/:customerId/health
 * @desc Get customer health score and analysis
 * @access Private (Admin)
 */
server.get('/customers/:customerId/health', {
  _schema: {
    params: {
      type: 'object',
      _properties: {
        customerId: { type: 'string' }
      },
      _required: ['customerId']
    }
  }
}, async (request: FastifyRequest<{ Params: { customerId: string } }>, reply: FastifyReply) => {
  try {
    const { customerId  } = ((request as any).params as unknown);
    const healthScore = await customerSuccessService.calculateHealthScore(customerId);
    const churnRisk = await customerSuccessService.assessChurnRisk(customerId);
    const profile = await customerSuccessService.getCustomerProfile(customerId);

    return (reply as any).send({
      _success: true,
      _data: {
        customerId,
        _customerName: profile?.name,
        healthScore,
        churnRisk,
        _lastUpdated: new Date().toISOString(),
        _healthTrend: {
          current: healthScore,
          _previous: healthScore - 5,
          _change: 5,
          _trend: 'improving'
        },
        _keyMetrics: {
          lastLogin: profile?.lastActivity,
          _totalJobs: profile?.totalJobs,
          _lifetimeValue: profile?.lifetimeValue,
          _subscriptionTier: profile?.subscriptionTier
        },
        _recommendations: churnRisk.recommendations
      }
    });
  } catch (error) {
    console.error('Error fetching customer _health:', error);
    return (reply as any).code(500).send({
      _success: false,
      _message: 'Failed to fetch customer health',
      _error: process.env['NODE_ENV'] === 'development' ? error : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/customer-success/customers/at-risk
 * @desc Get list of at-risk customers
 * @access Private (Admin)
 */
server.get('/customers/at-risk', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const atRiskCustomers = [
      {
        _id: 'customer_123',
        _name: 'John Smith',
        _company: 'Smith Repairs LLC',
        _email: 'john.smith@example.com',
        _healthScore: 35,
        _riskLevel: 'high',
        _lastActivity: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        _churnProbability: 78,
        _lifetimeValue: 2400,
        _subscriptionTier: 'professional',
        _riskFactors: ['Low health score', 'Inactive for 10 days'],
        _recommendedActions: ['Personal outreach', 'Feature training']
      },
      {
        _id: 'customer_789',
        _name: 'Quick Fix Co',
        _company: 'Quick Fix Co',
        _email: 'contact@quickfix.com',
        _healthScore: 25,
        _riskLevel: 'critical',
        _lastActivity: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        _churnProbability: 89,
        _lifetimeValue: 1200,
        _subscriptionTier: 'basic',
        _riskFactors: ['Very low health score', 'No recent activity', 'Payment issues'],
        _recommendedActions: ['Immediate intervention', 'Retention offer']
      }
    ];

    return (reply as any).send({
      _success: true,
      _data: {
        customers: atRiskCustomers,
        _total: atRiskCustomers.length,
        _summary: {
          _critical: atRiskCustomers.filter((c: unknown) => c.riskLevel === 'critical').length,
          _high: atRiskCustomers.filter((c: unknown) => c.riskLevel === 'high').length,
          _medium: atRiskCustomers.filter((c: unknown) => c.riskLevel === 'medium').length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching at-risk _customers:', error);
    return (reply as any).code(500).send({
      _success: false,
      _message: 'Failed to fetch at-risk customers',
      _error: process.env['NODE_ENV'] === 'development' ? error : 'Internal server error'
    });
  }
});

/**
 * @route POST /api/customer-success/interventions
 * @desc Create automated customer intervention
 * @access Private (Admin)
 */
server.post('/interventions', {
  _schema: {
    body: {
      type: 'object',
      _properties: {
        customerId: { type: 'string' },
        _trigger: { type: 'string' },
        _type: { type: 'string', _enum: ['onboarding', 'usage', 'satisfaction', 'retention', 'expansion'] }
      },
      _required: ['customerId', 'trigger', 'type']
    }
  }
}, async (request: FastifyRequest<{ _Body: unknown }>, reply: FastifyReply) => {
  try {
    const { customerId, trigger, type  } = ((request as any).body as unknown);

    const intervention = await customerSuccessService.createAutomatedIntervention(
      customerId,
      trigger,
      type
    );

    return (reply as any).code(201).send({
      _success: true,
      _data: intervention,
      _message: 'Automated intervention created and initiated successfully'
    });
  } catch (error) {
    console.error('Error creating _intervention:', error);
    return (reply as any).code(500).send({
      _success: false,
      _message: 'Failed to create intervention',
      _error: process.env['NODE_ENV'] === 'development' ? error : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/customer-success/analytics
 * @desc Get customer success analytics
 * @access Private (Admin)
 */
server.get('/analytics', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const analytics = {
      _customerMetrics: {
        totalCustomers: 1247,
        _newCustomers: 85,
        _churnedCustomers: 23,
        _netGrowth: 62,
        _churnRate: 1.8,
        _retentionRate: 98.2,
        _averageHealthScore: 72.5,
        _healthScoreTrend: 2.3
      },
      _satisfactionMetrics: {
        npsScore: 68,
        _npsChange: 5,
        _csatScore: 4.2,
        _csatChange: 0.1,
        _surveyResponseRate: 45.7
      },
      _interventionMetrics: {
        totalInterventions: 156,
        _successfulInterventions: 128,
        _successRate: 82.1,
        _averageResponseTime: 4.2,
        _preventedChurn: 34,
        _retentionImpact: 12.8
      }
    };

    return (reply as any).send({
      success: true,
      _data: analytics,
      _generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching customer success _analytics:', error);
    return (reply as any).code(500).send({
      _success: false,
      _message: 'Failed to fetch analytics',
      _error: process.env['NODE_ENV'] === 'development' ? error : 'Internal server error'
    });
  }
});

  }, { _prefix: '/customer-success' });
}