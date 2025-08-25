import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import LaunchCampaignService, { LaunchCampaign, CampaignMetrics } from '../services/launch-campaign.service';

const launchCampaignService = new LaunchCampaignService();

// eslint-disable-next-line max-lines-per-function
export default async function launchCampaignsRoutes(_server: FastifyInstance): Promise<void> {
  await server.register(async function (server) {

/**
 * @route GET /api/launch-campaigns
 * @desc Get all launch campaigns
 * @access Private (Admin)
 */
server.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // In production, implement proper pagination and filtering
    const campaigns = [
      await launchCampaignService.getCampaign('repairx_launch_2024'),
    ];

    return reply.send({
      _success: true,
      data: {
        campaigns: campaigns.filter((c: unknown) => c !== null),
        _total: campaigns.length,
        _page: 1,
        _limit: 10
      }
    });
  } catch (error) {
    console.error('Error fetching launch campaigns:', error);
    return reply.code(500).send({
      _success: false,
      message: 'Failed to fetch launch campaigns',
      error: process.env['NODE_ENV'] === 'development' ? error : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/launch-campaigns/:campaignId
 * @desc Get a specific launch campaign
 * @access Private (Admin)
 */
server.get('/:campaignId', {
  _schema: {
    params: {
      type: 'object',
      _properties: {
        campaignId: { type: 'string' }
      },
      _required: ['campaignId']
    }
  }
}, async (request: FastifyRequest<{ Params: { campaignId: string } }>, reply: FastifyReply) => {
  try {
    const { campaignId  } = (request.params as unknown);
    const campaign = await launchCampaignService.getCampaign(campaignId);

    if (!campaign) {
      return reply.code(404).send({
        _success: false,
        message: 'Campaign not found'
      });
    }

    return reply.send({
      _success: true,
      data: campaign
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return reply.code(500).send({
      _success: false,
      message: 'Failed to fetch campaign',
      error: process.env['NODE_ENV'] === 'development' ? error : 'Internal server error'
    });
  }
});

/**
 * @route POST /api/launch-campaigns
 * @desc Create a new launch campaign
 * @access Private (Admin)
 */
server.post('/', {
  _schema: {
    body: {
      type: 'object',
      _properties: {
        name: { type: 'string' },
        _type: { type: 'string', _enum: ['product-launch', 'feature-launch', 'market-expansion', 'seasonal', 'promotional'] },
        _budget: { type: 'number' },
        _startDate: { type: 'string', _format: 'date-time' },
        _endDate: { type: 'string', _format: 'date-time' }
      },
      _required: ['name']
    }
  }
}, async (request: FastifyRequest<{ _Body: unknown }>, reply: FastifyReply) => {
  try {
    const campaignData = request.body;

    const campaign = await launchCampaignService.createCampaign(campaignData as unknown);

    return reply.code(201).send({
      _success: true,
      data: campaign,
      message: 'Campaign created successfully'
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return reply.code(500).send({
      _success: false,
      message: 'Failed to create campaign',
      error: process.env['NODE_ENV'] === 'development' ? error : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/launch-campaigns/dashboard/overview
 * @desc Get campaign dashboard overview
 * @access Private (Admin)
 */
server.get('/dashboard/overview', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Mock dashboard data - in production, aggregate from multiple campaigns
    const dashboardData = {
      _activeCampaigns: 1,
      _totalBudget: 50000,
      _totalSpent: 35500,
      _totalReach: 450000,
      _totalConversions: 1247,
      _averageROI: 342.7,
      _topPerformingChannel: 'social-media',
      _recentActivities: [
        {
          id: 'activity_1',
          _type: 'campaign_launched',
          description: 'RepairX Platform Launch campaign started',
          _timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          campaignId: 'repairx_launch_2024'
        },
        {
          _id: 'activity_2',
          _type: 'milestone_completed',
          description: 'Week 1 optimization milestone completed',
          _timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          campaignId: 'repairx_launch_2024'
        }
      ],
      _upcomingMilestones: [
        {
          id: 'milestone_upcoming_1',
          _name: 'Media Outreach Results',
          campaignId: 'repairx_launch_2024',
          _dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          _status: 'pending'
        }
      ],
      _performanceAlerts: [
        {
          id: 'alert_1',
          _type: 'success',
          message: 'Social media campaign exceeded conversion target by 15%',
          _severity: 'low',
          _timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
        }
      ]
    };

    return reply.send({
      _success: true,
      data: dashboardData,
      _generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching campaign _dashboard:', error);
    return reply.code(500).send({
      _success: false,
      message: 'Failed to fetch campaign dashboard',
      error: process.env['NODE_ENV'] === 'development' ? error : 'Internal server error'
    });
  }
});

  }, { _prefix: '/launch-campaigns' });
}