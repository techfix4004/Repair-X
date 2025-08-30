// @ts-nocheck
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/database';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

// Organization invitation management routes
const inviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['TECHNICIAN', 'ORGANIZATION_MANAGER', 'ADMIN']),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const createOrganizationSchema = z.object({
  name: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  domain: z.string().optional(),
  ownerFirstName: z.string().min(2),
  ownerLastName: z.string().min(2),
  ownerPassword: z.string().min(8),
});

const provisionCustomerSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  password: z.string().min(8),
  deviceBrand: z.string().optional(),
  deviceModel: z.string().optional(),
  serviceType: z.string().optional(),
});

export async function organizationManagementRoutes(server: FastifyInstance): Promise<void> {
  
  // Create new organization (for SaaS admin only)
  server.post('/organizations', {
    preHandler: async (request, reply) => {
      // Only SaaS admins can create organizations
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return reply.code(401).send({ message: 'No token provided' });
      }

      try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as any;
        if (decoded.type !== 'SAAS_ADMIN' || decoded.role !== 'SAAS_ADMIN') {
          return reply.code(403).send({ message: 'Only SaaS admins can create organizations' });
        }
        request.userId = decoded.userId;
      } catch (error) {
        return reply.code(401).send({ message: 'Invalid token' });
      }
    },
    schema: {
      description: 'Create new organization (SaaS admin only)',
      tags: ['Organizations'],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2 },
          contactEmail: { type: 'string', format: 'email' },
          contactPhone: { type: 'string' },
          address: { type: 'string' },
          domain: { type: 'string' },
          ownerFirstName: { type: 'string', minLength: 2 },
          ownerLastName: { type: 'string', minLength: 2 },
          ownerPassword: { type: 'string', minLength: 8 },
        },
        required: ['name', 'contactEmail', 'ownerFirstName', 'ownerLastName', 'ownerPassword'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const orgData = createOrganizationSchema.parse(request.body);

      // Generate unique slug from organization name
      const baseSlug = orgData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      let slug = baseSlug;
      let counter = 1;

      // Ensure slug is unique
      while (await prisma.organization.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Check if owner email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: orgData.contactEmail },
      });

      if (existingUser) {
        return reply.code(409).send({
          code: 'EMAIL_EXISTS',
          message: 'User with this email already exists',
        });
      }

      // Create organization and owner in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create organization with enhanced subdomain and domain features
        const organization = await tx.organization.create({
          data: {
            name: orgData.name,
            slug,
            contactEmail: orgData.contactEmail,
            contactPhone: orgData.contactPhone,
            address: orgData.address,
            domain: orgData.domain,
            isActive: true,
            subscriptionTier: 'BASIC',
            settings: {
              subdomain: {
                enabled: true,
                url: `${slug}.repairx.com`,
                verified: true,
                createdAt: new Date().toISOString()
              },
              customDomain: orgData.domain ? {
                enabled: false,
                domain: orgData.domain,
                verified: false,
                dnsRecords: await this.generateDNSRecords(orgData.domain),
                verificationStatus: 'pending',
                sslEnabled: false
              } : null,
              branding: {
                logo: null,
                primaryColor: '#2563eb',
                secondaryColor: '#64748b',
                companyName: orgData.name,
                customCss: null
              },
              features: {
                whiteLabel: orgData.domain ? true : false,
                customEmails: false,
                advancedReporting: false,
                apiAccess: false
              },
              compliance: {
                gdprEnabled: true,
                ccpaEnabled: true,
                pciDssEnabled: false,
                sox2Enabled: false
              },
              encryption: {
                enabled: true,
                keyId: await this.generateEncryptionKey(slug),
                algorithm: 'AES-256-GCM'
              }
            }
          },
        });

        // Auto-provision subdomain DNS and SSL
        await this.provisionSubdomain(organization.slug);

        // If custom domain provided, initiate verification process
        if (orgData.domain) {
          await this.initiateDomainVerification(organization.id, orgData.domain);
        }

        // Hash owner password
        const hashedPassword = await bcrypt.hash(orgData.ownerPassword, 12);

        // Create organization owner
        const owner = await tx.user.create({
          data: {
            email: orgData.contactEmail,
            password: hashedPassword,
            firstName: orgData.ownerFirstName,
            lastName: orgData.ownerLastName,
            role: 'ORGANIZATION_OWNER',
            organizationId: organization.id,
            status: 'ACTIVE',
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        });

        return { organization, owner };
      });

      return reply.code(201).send({
        message: 'Organization created successfully',
        organization: result.organization,
        owner: result.owner,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          errors: error.issues,
        });
      }
      
      server.log.error(error);
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      });
    }
  });

  // Invite user to organization (owners and managers only)
  server.post('/organizations/:orgId/invite', {
    preHandler: async (request, reply) => {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return reply.code(401).send({ message: 'No token provided' });
      }

      try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as any;
        if (decoded.type === 'SAAS_ADMIN') {
          return reply.code(403).send({ message: 'Use organization management interface' });
        }

        const user = await prisma.user.findFirst({
          where: {
            id: decoded.userId,
            organizationId: (request.params as any).orgId,
            role: { in: ['ORGANIZATION_OWNER', 'ORGANIZATION_MANAGER', 'ADMIN'] },
          },
        });

        if (!user) {
          return reply.code(403).send({ message: 'Insufficient permissions' });
        }

        request.userId = decoded.userId;
        request.organizationId = decoded.organizationId;
      } catch (error) {
        return reply.code(401).send({ message: 'Invalid token' });
      }
    },
    schema: {
      description: 'Invite user to organization',
      tags: ['Organizations'],
      params: {
        type: 'object',
        properties: {
          orgId: { type: 'string' },
        },
        required: ['orgId'],
      },
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['TECHNICIAN', 'ORGANIZATION_MANAGER', 'ADMIN'] },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
        },
        required: ['email', 'role'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { orgId } = request.params as any;
      const inviteData = inviteUserSchema.parse(request.body);

      // Check if user already exists in the organization
      const existingUser = await prisma.user.findFirst({
        where: {
          email: inviteData.email,
          organizationId: orgId,
        },
      });

      if (existingUser) {
        return reply.code(409).send({
          code: 'USER_EXISTS',
          message: 'User already exists in this organization',
        });
      }

      // Check if there's already a pending invitation
      const existingInvitation = await prisma.organizationInvitation.findFirst({
        where: {
          organizationId: orgId,
          email: inviteData.email,
          acceptedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      if (existingInvitation) {
        return reply.code(409).send({
          code: 'INVITATION_EXISTS',
          message: 'Pending invitation already exists for this email',
        });
      }

      // Create invitation
      const invitationToken = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const invitation = await prisma.organizationInvitation.create({
        data: {
          organizationId: orgId,
          email: inviteData.email,
          role: inviteData.role,
          invitedBy: (request as any).userId,
          token: invitationToken,
          expiresAt,
        },
        include: {
          organization: {
            select: {
              name: true,
              slug: true,
            },
          },
          inviter: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // In a real implementation, you'd send an email here
      // await sendInvitationEmail(invitation);

      return reply.code(201).send({
        message: 'Invitation sent successfully',
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          expiresAt: invitation.expiresAt,
          organizationName: invitation.organization.name,
          inviteLink: `${process.env.FRONTEND_URL}/auth/accept-invitation?token=${invitationToken}`,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          errors: error.issues,
        });
      }
      
      server.log.error(error);
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      });
    }
  });

  // Provision customer access (organization members only)
  server.post('/organizations/:orgId/customers', {
    preHandler: async (request, reply) => {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return reply.code(401).send({ message: 'No token provided' });
      }

      try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as any;
        if (decoded.type === 'SAAS_ADMIN') {
          return reply.code(403).send({ message: 'Use organization interface' });
        }

        const user = await prisma.user.findFirst({
          where: {
            id: decoded.userId,
            organizationId: (request.params as any).orgId,
            role: { in: ['ORGANIZATION_OWNER', 'ORGANIZATION_MANAGER', 'ADMIN', 'TECHNICIAN'] },
          },
        });

        if (!user) {
          return reply.code(403).send({ message: 'Insufficient permissions' });
        }

        request.userId = decoded.userId;
        request.organizationId = decoded.organizationId;
      } catch (error) {
        return reply.code(401).send({ message: 'Invalid token' });
      }
    },
    schema: {
      description: 'Provision customer access after job/device submission',
      tags: ['Organizations'],
      params: {
        type: 'object',
        properties: {
          orgId: { type: 'string' },
        },
        required: ['orgId'],
      },
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          firstName: { type: 'string', minLength: 2 },
          lastName: { type: 'string', minLength: 2 },
          password: { type: 'string', minLength: 8 },
          deviceBrand: { type: 'string' },
          deviceModel: { type: 'string' },
          serviceType: { type: 'string' },
        },
        required: ['email', 'firstName', 'lastName', 'password'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { orgId } = request.params as any;
      const customerData = provisionCustomerSchema.parse(request.body);

      // Check if customer already exists
      const existingCustomer = await prisma.user.findFirst({
        where: {
          email: customerData.email,
          organizationId: orgId,
        },
      });

      if (existingCustomer) {
        return reply.code(409).send({
          code: 'CUSTOMER_EXISTS',
          message: 'Customer already exists in this organization',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(customerData.password, 12);

      // Create customer with organization binding and active job status
      const customer = await prisma.user.create({
        data: {
          email: customerData.email,
          password: hashedPassword,
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          phone: customerData.phone,
          role: 'CUSTOMER',
          organizationId: orgId,
          hasActiveJobs: true, // Mark as having active service
          status: 'ACTIVE',
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      // Optionally create a device if provided
      if (customerData.deviceBrand && customerData.deviceModel) {
        await prisma.device.create({
          data: {
            brand: customerData.deviceBrand,
            model: customerData.deviceModel,
            category: customerData.serviceType || 'Electronics',
            condition: 'FAIR',
            customerId: customer.id,
          },
        });
      }

      return reply.code(201).send({
        message: 'Customer access provisioned successfully',
        customer: {
          id: customer.id,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
          organization: customer.organization,
          loginUrl: `${process.env.FRONTEND_URL}/auth/customer/login`,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          errors: error.issues,
        });
      }
      
      server.log.error(error);
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      });
    }
  });

  // Get organization invitations (owners and managers only)
  server.get('/organizations/:orgId/invitations', {
    preHandler: async (request, reply) => {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return reply.code(401).send({ message: 'No token provided' });
      }

      try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as any;
        const user = await prisma.user.findFirst({
          where: {
            id: decoded.userId,
            organizationId: (request.params as any).orgId,
            role: { in: ['ORGANIZATION_OWNER', 'ORGANIZATION_MANAGER', 'ADMIN'] },
          },
        });

        if (!user) {
          return reply.code(403).send({ message: 'Insufficient permissions' });
        }

        request.userId = decoded.userId;
      } catch (error) {
        return reply.code(401).send({ message: 'Invalid token' });
      }
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { orgId } = request.params as any;

      const invitations = await prisma.organizationInvitation.findMany({
        where: {
          organizationId: orgId,
        },
        include: {
          inviter: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return reply.send({
        invitations: invitations.map(inv => ({
          id: inv.id,
          email: inv.email,
          role: inv.role,
          status: inv.acceptedAt ? 'ACCEPTED' : (new Date() > inv.expiresAt ? 'EXPIRED' : 'PENDING'),
          expiresAt: inv.expiresAt,
          acceptedAt: inv.acceptedAt,
          invitedBy: inv.inviter,
          createdAt: inv.createdAt,
        })),
      });
    } catch (error) {
      server.log.error(error);
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      });
    }
  });

  // Enhanced Custom Domain Management Routes
  
  // Add custom domain to organization
  server.post('/organizations/:orgId/domains', {
    schema: {
      description: 'Add custom domain to organization',
      tags: ['Organization Management'],
      params: {
        type: 'object',
        properties: {
          orgId: { type: 'string' }
        },
        required: ['orgId']
      },
      body: {
        type: 'object',
        properties: {
          domain: { type: 'string', pattern: '^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\\.[a-zA-Z]{2,}$' },
          enableWhiteLabel: { type: 'boolean', default: true }
        },
        required: ['domain']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { orgId } = request.params as { orgId: string };
      const { domain, enableWhiteLabel = true } = request.body as { domain: string; enableWhiteLabel?: boolean };

      // Verify organization exists and user has permission
      const organization = await prisma.organization.findUnique({
        where: { id: orgId },
        include: { 
          users: { 
            where: { id: (request as any).userId, role: { in: ['ORGANIZATION_OWNER', 'ADMIN'] } } 
          } 
        }
      });

      if (!organization || organization.users.length === 0) {
        return reply.code(403).send({
          code: 'ACCESS_DENIED',
          message: 'Access denied to organization or insufficient permissions'
        });
      }

      // Check if domain is already in use
      const existingDomain = await prisma.organization.findFirst({
        where: { domain, id: { not: orgId } }
      });

      if (existingDomain) {
        return reply.code(409).send({
          code: 'DOMAIN_EXISTS',
          message: 'Domain is already in use by another organization'
        });
      }

      // Generate DNS records for verification
      const dnsRecords = await generateDNSRecords(domain);
      const verificationToken = await generateVerificationToken();

      // Update organization with custom domain settings
      const updatedOrg = await prisma.organization.update({
        where: { id: orgId },
        data: {
          domain,
          settings: {
            ...organization.settings as any,
            customDomain: {
              enabled: false, // Will be enabled after verification
              domain,
              verified: false,
              dnsRecords,
              verificationToken,
              verificationStatus: 'pending',
              sslEnabled: false,
              enableWhiteLabel,
              createdAt: new Date().toISOString()
            }
          }
        }
      });

      // Initiate domain verification process
      await initiateDomainVerification(orgId, domain);

      return reply.send({
        message: 'Custom domain added successfully. Please configure DNS records for verification.',
        domain,
        dnsRecords,
        verificationToken,
        verificationInstructions: generateVerificationInstructions(domain, dnsRecords),
        estimatedVerificationTime: '24-48 hours'
      });

    } catch (error) {
      server.log.error(error);
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to add custom domain'
      });
    }
  });

  // Verify custom domain
  server.post('/organizations/:orgId/domains/:domain/verify', {
    schema: {
      description: 'Verify custom domain DNS configuration',
      tags: ['Organization Management'],
      params: {
        type: 'object',
        properties: {
          orgId: { type: 'string' },
          domain: { type: 'string' }
        },
        required: ['orgId', 'domain']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { orgId, domain } = request.params as { orgId: string; domain: string };

      const organization = await prisma.organization.findUnique({
        where: { id: orgId, domain }
      });

      if (!organization) {
        return reply.code(404).send({
          code: 'ORGANIZATION_NOT_FOUND',
          message: 'Organization with specified domain not found'
        });
      }

      // Verify DNS records
      const verificationResult = await verifyDNSRecords(domain, organization.settings);

      if (verificationResult.verified) {
        // Enable domain and provision SSL
        const updatedSettings = {
          ...organization.settings as any,
          customDomain: {
            ...organization.settings?.customDomain,
            verified: true,
            enabled: true,
            verificationStatus: 'verified',
            verifiedAt: new Date().toISOString(),
            sslEnabled: false // Will be enabled after SSL provision
          }
        };

        await prisma.organization.update({
          where: { id: orgId },
          data: { settings: updatedSettings }
        });

        // Provision SSL certificate
        const sslResult = await provisionSSLCertificate(domain);

        if (sslResult.success) {
          updatedSettings.customDomain.sslEnabled = true;
          updatedSettings.customDomain.sslCertificate = sslResult.certificate;
          
          await prisma.organization.update({
            where: { id: orgId },
            data: { settings: updatedSettings }
          });
        }

        return reply.send({
          message: 'Domain verified and activated successfully',
          domain,
          verified: true,
          sslEnabled: sslResult.success,
          accessUrl: `https://${domain}`,
          fallbackUrl: `https://${organization.slug}.repairx.com`
        });
      } else {
        return reply.code(400).send({
          code: 'VERIFICATION_FAILED',
          message: 'Domain verification failed',
          domain,
          issues: verificationResult.issues,
          recommendedActions: verificationResult.recommendations
        });
      }

    } catch (error) {
      server.log.error(error);
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to verify domain'
      });
    }
  });

  // Get organization domain status
  server.get('/organizations/:orgId/domains/status', {
    schema: {
      description: 'Get domain and subdomain status for organization',
      tags: ['Organization Management'],
      params: {
        type: 'object',
        properties: {
          orgId: { type: 'string' }
        },
        required: ['orgId']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { orgId } = request.params as { orgId: string };

      const organization = await prisma.organization.findUnique({
        where: { id: orgId }
      });

      if (!organization) {
        return reply.code(404).send({
          code: 'ORGANIZATION_NOT_FOUND',
          message: 'Organization not found'
        });
      }

      const settings = organization.settings as any;
      
      return reply.send({
        subdomain: {
          url: `https://${organization.slug}.repairx.com`,
          enabled: true,
          verified: true,
          sslEnabled: true
        },
        customDomain: settings?.customDomain || null,
        branding: settings?.branding || null,
        features: settings?.features || null
      });

    } catch (error) {
      server.log.error(error);
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to get domain status'
      });
    }
  });
}

// Enhanced Domain Management Helper Functions

async function generateDNSRecords(domain: string) {
  return [
    {
      type: 'CNAME',
      name: domain,
      value: 'repairx.com',
      ttl: 300,
      required: true
    },
    {
      type: 'TXT',
      name: domain,
      value: `repairx-verification=${await generateVerificationToken()}`,
      ttl: 300,
      required: true
    }
  ];
}

async function generateVerificationToken(): Promise<string> {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

async function generateEncryptionKey(slug: string): Promise<string> {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

async function provisionSubdomain(slug: string): Promise<void> {
  // In production, this would configure DNS and SSL for subdomain
  console.log(`Provisioning subdomain: ${slug}.repairx.com`);
  
  // Simulate DNS configuration
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Simulate SSL certificate provisioning
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function initiateDomainVerification(orgId: string, domain: string): Promise<void> {
  // In production, this would start background verification process
  console.log(`Initiating verification for domain: ${domain} (org: ${orgId})`);
  
  // Schedule verification check
  setTimeout(async () => {
    try {
      // This would run in a background job
      await checkDomainVerification(orgId, domain);
    } catch (error) {
      console.error('Domain verification check failed:', error);
    }
  }, 60000); // Check after 1 minute
}

async function verifyDNSRecords(domain: string, settings: any): Promise<{ verified: boolean; issues?: string[]; recommendations?: string[] }> {
  const dns = require('dns').promises;
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  try {
    // Check CNAME record
    try {
      const cnameRecords = await dns.resolveCname(domain);
      if (!cnameRecords.includes('repairx.com')) {
        issues.push('CNAME record not pointing to repairx.com');
        recommendations.push('Add CNAME record pointing to repairx.com');
      }
    } catch (error) {
      issues.push('CNAME record not found');
      recommendations.push('Add CNAME record pointing to repairx.com');
    }

    // Check TXT record for verification
    try {
      const txtRecords = await dns.resolveTxt(domain);
      const verificationToken = settings?.customDomain?.verificationToken;
      const hasVerificationRecord = txtRecords.some(record => 
        record.some(txt => txt.includes(`repairx-verification=${verificationToken}`))
      );
      
      if (!hasVerificationRecord) {
        issues.push('Verification TXT record not found');
        recommendations.push(`Add TXT record: repairx-verification=${verificationToken}`);
      }
    } catch (error) {
      issues.push('TXT verification record not found');
      recommendations.push('Add required TXT verification record');
    }

    return {
      verified: issues.length === 0,
      issues: issues.length > 0 ? issues : undefined,
      recommendations: recommendations.length > 0 ? recommendations : undefined
    };

  } catch (error) {
    return {
      verified: false,
      issues: ['DNS resolution failed'],
      recommendations: ['Check domain configuration and try again']
    };
  }
}

async function provisionSSLCertificate(domain: string): Promise<{ success: boolean; certificate?: any }> {
  // In production, this would use Let's Encrypt or similar
  console.log(`Provisioning SSL certificate for: ${domain}`);
  
  // Simulate SSL certificate generation
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return {
    success: true,
    certificate: {
      issuer: 'Let\'s Encrypt',
      validFrom: new Date().toISOString(),
      validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
      fingerprint: 'abc123...'
    }
  };
}

async function checkDomainVerification(orgId: string, domain: string): Promise<void> {
  // Background job to check domain verification status
  console.log(`Checking verification status for: ${domain}`);
}

function generateVerificationInstructions(domain: string, dnsRecords: any[]): string[] {
  return [
    '1. Log in to your domain registrar or DNS provider',
    '2. Navigate to DNS management for your domain',
    `3. Add the following DNS records for ${domain}:`,
    ...dnsRecords.map(record => `   - ${record.type}: ${record.name} → ${record.value}`),
    '4. Save the DNS configuration',
    '5. Wait 5-15 minutes for DNS propagation',
    '6. Click "Verify Domain" to complete setup'
  ];
}