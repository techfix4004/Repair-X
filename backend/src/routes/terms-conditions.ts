/**
 * Terms & Conditions Management System
 * Dynamic legal document system with version control, automated acceptance tracking,
 * and multi-jurisdiction compliance management.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// Schemas for Terms & Conditions Management
const LegalDocumentSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Document title is required'),
  type: z.enum([
    'TERMS_OF_SERVICE',
    'PRIVACY_POLICY',
    'REFUND_POLICY',
    'WARRANTY_TERMS',
    'SERVICE_AGREEMENT',
    'DATA_PROCESSING_AGREEMENT',
    'COOKIE_POLICY',
    'ACCEPTABLE_USE_POLICY',
    'LICENSING_AGREEMENT',
    'DISCLAIMER',
    'SLA_AGREEMENT',
    'GDPR_COMPLIANCE',
  ]),
  version: z.string().min(1, 'Version is required'),
  content: z.object({
    html: z.string().min(1, 'HTML content is required'),
    plainText: z.string().min(1, 'Plain text content is required'),
    markdown: z.string().optional(),
  }),
  metadata: z.object({
    language: z.string().default('en'),
    jurisdiction: z.string().default('US'),
    effectiveDate: z.string(),
    expiryDate: z.string().optional(),
    lastModified: z.string().optional(),
    modifiedBy: z.string().optional(),
    approvedBy: z.string().optional(),
    approvalDate: z.string().optional(),
  }),
  compliance: z.object({
    gdprCompliant: z.boolean().default(false),
    ccpaCompliant: z.boolean().default(false),
    coppaCompliant: z.boolean().default(false),
    hipaCompliant: z.boolean().default(false),
    pciCompliant: z.boolean().default(false),
    customCompliance: z.array(z.object({
      standard: z.string(),
      compliant: z.boolean(),
      notes: z.string().optional(),
    })).default([]),
  }),
  acceptance: z.object({
    requiresExplicitConsent: z.boolean().default(true),
    showOnRegistration: z.boolean().default(true),
    showOnLogin: z.boolean().default(false),
    showOnPurchase: z.boolean().default(true),
    blockServiceWithoutAcceptance: z.boolean().default(true),
    reminderFrequency: z.number().min(0).default(90), // days
  }),
  customization: z.object({
    businessName: z.string().optional(),
    contactEmail: z.string().email().optional(),
    contactPhone: z.string().optional(),
    businessAddress: z.string().optional(),
    variables: z.array(z.object({
      key: z.string(),
      value: z.string(),
      description: z.string().optional(),
    })).default([]),
  }),
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  isActive: z.boolean().default(false),
  tenantId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const UserAcceptanceSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  documentId: z.string(),
  documentVersion: z.string(),
  acceptanceDetails: z.object({
    acceptedAt: z.string(),
    ipAddress: z.string(),
    userAgent: z.string(),
    method: z.enum(['CHECKBOX', 'DIGITAL_SIGNATURE', 'CLICK_THROUGH', 'IMPLICIT']),
    location: z.object({
      country: z.string().optional(),
      region: z.string().optional(),
      city: z.string().optional(),
    }).optional(),
  }),
  digitalSignature: z.object({
    signatureImage: z.string().optional(),
    signatureText: z.string().optional(),
    certificateHash: z.string().optional(),
    timestamp: z.string().optional(),
  }).optional(),
  validUntil: z.string().optional(),
  isRevoked: z.boolean().default(false),
  revokedAt: z.string().optional(),
  revokedReason: z.string().optional(),
  tenantId: z.string().optional(),
});

const ComplianceAuditSchema = z.object({
  id: z.string().optional(),
  auditType: z.enum(['GDPR', 'CCPA', 'COPPA', 'HIPAA', 'PCI_DSS', 'CUSTOM']),
  documentIds: z.array(z.string()),
  auditPeriod: z.object({
    start: z.string(),
    end: z.string(),
  }),
  findings: z.array(z.object({
    documentId: z.string(),
    issue: z.string(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    recommendation: z.string(),
    status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']).default('OPEN'),
  })),
  overallStatus: z.enum(['COMPLIANT', 'NON_COMPLIANT', 'NEEDS_REVIEW']),
  conductedBy: z.string(),
  conductedAt: z.string(),
  nextAuditDue: z.string(),
  tenantId: z.string().optional(),
});

// Terms & Conditions Management Service
class TermsConditionsService {
  private documents: Map<string, any> = new Map();
  private acceptances: Map<string, any[]> = new Map();
  private audits: Map<string, any[]> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleDocuments = [
      {
        id: 'doc-001',
        title: 'RepairX Terms of Service',
        type: 'TERMS_OF_SERVICE',
        version: '2.1.0',
        content: {
          html: `<h1>RepairX Terms of Service</h1>
            <h2>1. Acceptance of Terms</h2>
            <p>By using RepairX services, you agree to be bound by these Terms of Service.</p>
            <h2>2. Service Description</h2>
            <p>RepairX provides device repair and maintenance services through our platform.</p>
            <h2>3. User Responsibilities</h2>
            <p>Users are responsible for accurate information and timely payment.</p>
            <h2>4. Privacy and Data Protection</h2>
            <p>We collect and process your data in accordance with our Privacy Policy.</p>
            <h2>5. Limitation of Liability</h2>
            <p>RepairX liability is limited to the cost of the service provided.</p>
            <h2>6. Termination</h2>
            <p>Either party may terminate this agreement with proper notice.</p>`,
          plainText: `RepairX Terms of Service\n\n1. Acceptance of Terms\nBy using RepairX services, you agree to be bound by these Terms of Service.\n\n2. Service Description\nRepairX provides device repair and maintenance services through our platform.\n\n3. User Responsibilities\nUsers are responsible for accurate information and timely payment.\n\n4. Privacy and Data Protection\nWe collect and process your data in accordance with our Privacy Policy.\n\n5. Limitation of Liability\nRepairX liability is limited to the cost of the service provided.\n\n6. Termination\nEither party may terminate this agreement with proper notice.`,
        },
        metadata: {
          language: 'en',
          jurisdiction: 'US',
          effectiveDate: '2025-01-01T00:00:00Z',
          lastModified: '2025-01-01T00:00:00Z',
          modifiedBy: 'legal-team-001',
          approvedBy: 'legal-director-001',
          approvalDate: '2025-01-01T00:00:00Z',
        },
        compliance: {
          gdprCompliant: true,
          ccpaCompliant: true,
          coppaCompliant: false,
          hipaCompliant: false,
          pciCompliant: true,
          customCompliance: [],
        },
        acceptance: {
          requiresExplicitConsent: true,
          showOnRegistration: true,
          showOnLogin: false,
          showOnPurchase: true,
          blockServiceWithoutAcceptance: true,
          reminderFrequency: 365,
        },
        customization: {
          businessName: 'RepairX',
          contactEmail: 'legal@repairx.com',
          contactPhone: '+1-555-0100',
          businessAddress: '123 Technology Drive, Tech City, TC 12345',
          variables: [
            { key: 'company_name', value: 'RepairX', description: 'Company name' },
            { key: 'supportemail', value: 'support@repairx.com', description: 'Support contact email' },
          ],
        },
        status: 'PUBLISHED',
        isActive: true,
        createdAt: '2024-12-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'doc-002',
        title: 'RepairX Privacy Policy',
        type: 'PRIVACY_POLICY',
        version: '1.5.2',
        content: {
          html: `<h1>RepairX Privacy Policy</h1>
            <h2>1. Information We Collect</h2>
            <p>We collect personal information necessary to provide our services.</p>
            <h2>2. How We Use Your Information</h2>
            <p>Your information is used to process orders and improve our services.</p>
            <h2>3. Data Sharing and Disclosure</h2>
            <p>We do not sell your personal information to third parties.</p>
            <h2>4. Data Security</h2>
            <p>We implement industry-standard security measures to protect your data.</p>
            <h2>5. Your Rights</h2>
            <p>You have the right to access, modify, and delete your personal information.</p>
            <h2>6. Contact Information</h2>
            <p>For privacy concerns, contact us at privacy@repairx.com</p>`,
          plainText: `RepairX Privacy Policy\n\n1. Information We Collect\nWe collect personal information necessary to provide our services.\n\n2. How We Use Your Information\nYour information is used to process orders and improve our services.\n\n3. Data Sharing and Disclosure\nWe do not sell your personal information to third parties.\n\n4. Data Security\nWe implement industry-standard security measures to protect your data.\n\n5. Your Rights\nYou have the right to access, modify, and delete your personal information.\n\n6. Contact Information\nFor privacy concerns, contact us at privacy@repairx.com`,
        },
        metadata: {
          language: 'en',
          jurisdiction: 'US',
          effectiveDate: '2025-01-01T00:00:00Z',
          lastModified: '2024-12-15T00:00:00Z',
          modifiedBy: 'privacy-officer-001',
          approvedBy: 'legal-director-001',
          approvalDate: '2024-12-20T00:00:00Z',
        },
        compliance: {
          gdprCompliant: true,
          ccpaCompliant: true,
          coppaCompliant: true,
          hipaCompliant: false,
          pciCompliant: false,
          customCompliance: [
            { standard: 'SOC2', compliant: true, notes: 'Type II compliance achieved' },
          ],
        },
        acceptance: {
          requiresExplicitConsent: true,
          showOnRegistration: true,
          showOnLogin: false,
          showOnPurchase: false,
          blockServiceWithoutAcceptance: true,
          reminderFrequency: 365,
        },
        customization: {
          businessName: 'RepairX',
          contactEmail: 'privacy@repairx.com',
          contactPhone: '+1-555-0101',
          businessAddress: '123 Technology Drive, Tech City, TC 12345',
          variables: [
            { key: 'dpoemail', value: 'dpo@repairx.com', description: 'Data Protection Officer email' },
          ],
        },
        status: 'PUBLISHED',
        isActive: true,
        createdAt: '2024-11-01T00:00:00Z',
        updatedAt: '2024-12-15T00:00:00Z',
      },
    ];

    sampleDocuments.forEach((doc: unknown) => {
      this.documents.set(doc.id, doc);
    });

    // Sample user acceptances
    const sampleAcceptances = [
      {
        id: 'acc-001',
        userId: 'user-001',
        documentId: 'doc-001',
        documentVersion: '2.1.0',
        acceptanceDetails: {
          acceptedAt: '2025-08-10T12:00:00Z',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          method: 'CHECKBOX',
          location: {
            country: 'US',
            region: 'CA',
            city: 'San Francisco',
          },
        },
        validUntil: '2026-08-10T12:00:00Z',
        isRevoked: false,
      },
      {
        id: 'acc-002',
        userId: 'user-001',
        documentId: 'doc-002',
        documentVersion: '1.5.2',
        acceptanceDetails: {
          acceptedAt: '2025-08-10T12:05:00Z',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          method: 'CHECKBOX',
          location: {
            country: 'US',
            region: 'CA',
            city: 'San Francisco',
          },
        },
        validUntil: '2026-08-10T12:05:00Z',
        isRevoked: false,
      },
    ];

    sampleAcceptances.forEach((acceptance: unknown) => {
      const userAcceptances = this.acceptances.get(acceptance.userId) || [];
      userAcceptances.push(acceptance);
      this.acceptances.set(acceptance.userId, userAcceptances);
    });
  }

  // Document Management
  async getAllDocuments(tenantId?: string, filters?: any): Promise<any[]> {
    let documents = Array.from(this.documents.values());
    
    if (tenantId) {
      documents = documents.filter((doc: unknown) => doc.tenantId === tenantId);
    }

    if (filters) {
      if (filters.type) {
        documents = documents.filter((doc: unknown) => doc.type === filters.type);
      }
      if (filters.status) {
        documents = documents.filter((doc: unknown) => doc.status === filters.status);
      }
      if (filters.isActive !== undefined) {
        documents = documents.filter((doc: unknown) => doc.isActive === filters.isActive);
      }
      if (filters.jurisdiction) {
        documents = documents.filter((doc: unknown) => doc.metadata.jurisdiction === filters.jurisdiction);
      }
    }

    return documents;
  }

  async getDocumentById(documentId: string): Promise<any | null> {
    return this.documents.get(documentId) || null;
  }

  async createDocument(documentData: unknown): Promise<any> {
    const validated = LegalDocumentSchema.parse(documentData);
    const id = validated.id || `doc-${Date.now()}`;
    
    const document = { 
      ...validated, 
      id, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(documentId: string, updateData: unknown): Promise<any> {
    const existingDoc = this.documents.get(documentId);
    if (!existingDoc) {
      throw new Error('Document not found');
    }

    // If content is updated and document is published, create new version
    if (existingDoc.status === 'PUBLISHED' && (updateData as any).content) {
      const versionParts = existingDoc.version.split('.').map(Number);
      versionParts[1] += 1; // Increment minor version
      (updateData as any).version = versionParts.join('.');
      (updateData as any).status = 'DRAFT'; // New version starts as draft
    }

    const updatedDoc = { 
      ...existingDoc, 
      ...updateData, 
      updatedAt: new Date().toISOString(),
    };
    
    const validated = LegalDocumentSchema.parse(updatedDoc);
    this.documents.set(documentId, validated);
    
    return validated;
  }

  async publishDocument(documentId: string, approvedBy: string): Promise<any> {
    const document = this.documents.get(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    if (document.status !== 'APPROVED') {
      throw new Error('Document must be approved before publishing');
    }

    // Deactivate previous version if exists
    const existingActive = Array.from(this.documents.values())
      .find((doc: unknown) => doc.type === document.type && doc.isActive && doc.id !== documentId);
    
    if (existingActive) {
      existingActive.isActive = false;
      existingActive.status = 'ARCHIVED';
      this.documents.set(existingActive.id, existingActive);
    }

    document.status = 'PUBLISHED';
    document.isActive = true;
    document.metadata.approvedBy = approvedBy;
    document.metadata.approvalDate = new Date().toISOString();
    
    this.documents.set(documentId, document);
    return document;
  }

  // Acceptance Tracking
  async recordAcceptance(acceptanceData: unknown): Promise<any> {
    const validated = UserAcceptanceSchema.parse(acceptanceData);
    const id = validated.id || `acc-${Date.now()}`;
    
    const acceptance = { ...validated, id };
    
    const userAcceptances = this.acceptances.get(validated.userId) || [];
    userAcceptances.push(acceptance);
    this.acceptances.set(validated.userId, userAcceptances);
    
    return acceptance;
  }

  async getUserAcceptances(userId: string, documentType?: string): Promise<any[]> {
    const userAcceptances = this.acceptances.get(_userId) || [];
    
    if (documentType) {
      return userAcceptances.filter((acc: unknown) => {
        const document = this.documents.get(acc.documentId);
        return document && document.type === documentType;
      });
    }
    
    return userAcceptances;
  }

  async checkUserCompliance(userId: string): Promise<any> {
    const activeDocuments = Array.from(this.documents.values())
      .filter((doc: unknown) => doc.isActive && doc.acceptance.requiresExplicitConsent);
    
    const userAcceptances = this.acceptances.get(_userId) || [];
    
    const compliance = activeDocuments.map((doc: unknown) => {
      const acceptance = userAcceptances.find((acc: unknown) => 
        acc.documentId === doc.id && acc.documentVersion === doc.version
      );
      
      return {
        document: {
          id: doc.id,
          title: doc.title,
          type: doc.type,
          version: doc.version,
        },
        isAccepted: !!acceptance,
        acceptanceDate: acceptance?.acceptanceDetails.acceptedAt,
        required: doc.acceptance.blockServiceWithoutAcceptance,
      };
    });
    
    const isCompliant = compliance.every(c => c.isAccepted || !c.required);
    const missingAcceptances = compliance.filter((c: unknown) => !c.isAccepted && c.required);
    
    return {
      _userId,
      isCompliant,
      missingAcceptances,
      compliance,
      checkedAt: new Date().toISOString(),
    };
  }

  // Version Management
  async getDocumentVersions(documentType: string, tenantId?: string): Promise<any[]> {
    const documents = Array.from(this.documents.values())
      .filter((doc: unknown) => doc.type === documentType)
      .filter((doc: unknown) => !tenantId || doc.tenantId === tenantId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return documents;
  }

  async compareVersions(documentId1: string, documentId2: string): Promise<any> {
    const doc1 = this.documents.get(documentId1);
    const doc2 = this.documents.get(documentId2);
    
    if (!doc1 || !doc2) {
      throw new Error('One or both documents not found');
    }

    return {
      document1: {
        id: doc1.id,
        version: doc1.version,
        effectiveDate: doc1.metadata.effectiveDate,
        status: doc1.status,
      },
      document2: {
        id: doc2.id,
        version: doc2.version,
        effectiveDate: doc2.metadata.effectiveDate,
        status: doc2.status,
      },
      changes: {
        versionDiff: doc1.version !== doc2.version,
        contentDiff: doc1.content.plainText !== doc2.content.plainText,
        metadataDiff: JSON.stringify(doc1.metadata) !== JSON.stringify(doc2.metadata),
        complianceDiff: JSON.stringify(doc1.compliance) !== JSON.stringify(doc2.compliance),
      },
      comparison: new Date().toISOString(),
    };
  }

  // Compliance Management
  async generateComplianceReport(tenantId?: string, auditType?: string): Promise<any> {
    const documents = await this.getAllDocuments(tenantId);
    const allAcceptances = Array.from(this.acceptances.values()).flat();
    
    const report = {
      reportId: `compliance-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      tenantId,
      auditType,
      summary: {
        totalDocuments: documents.length,
        publishedDocuments: documents.filter((d: unknown) => d.status === 'PUBLISHED').length,
        totalAcceptances: allAcceptances.length,
        gdprCompliantDocs: documents.filter((d: unknown) => d.compliance.gdprCompliant).length,
        ccpaCompliantDocs: documents.filter((d: unknown) => d.compliance.ccpaCompliant).length,
      },
      documentAnalysis: documents.map((doc: unknown) => ({
        id: doc.id,
        title: doc.title,
        type: doc.type,
        version: doc.version,
        status: doc.status,
        isActive: doc.isActive,
        compliance: doc.compliance,
        acceptanceCount: allAcceptances.filter((acc: unknown) => acc.documentId === doc.id).length,
        lastUpdated: doc.updatedAt,
      })),
      acceptanceAnalysis: {
        byDocumentType: this.getAcceptancesByType(allAcceptances),
        byMonth: this.getAcceptancesByMonth(allAcceptances),
        avgAcceptanceTime: this.calculateAverageAcceptanceTime(allAcceptances),
      },
      recommendations: this.generateComplianceRecommendations(documents, allAcceptances),
    };
    
    return report;
  }

  private getAcceptancesByType(acceptances: unknown[]): any[] {
    const typeMap = new Map();
    
    acceptances.forEach((acc: unknown) => {
      const doc = this.documents.get(acc.documentId);
      if (doc) {
        const count = typeMap.get(doc.type) || 0;
        typeMap.set(doc.type, count + 1);
      }
    });
    
    return Array.from(typeMap.entries()).map(([type, count]) => ({ type, count }));
  }

  private getAcceptancesByMonth(acceptances: unknown[]): any[] {
    const monthMap = new Map();
    
    acceptances.forEach((acc: unknown) => {
      const month = acc.acceptanceDetails.acceptedAt.substring(0, 7);
      const count = monthMap.get(month) || 0;
      monthMap.set(month, count + 1);
    });
    
    return Array.from(monthMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private calculateAverageAcceptanceTime(acceptances: unknown[]): number {
    // Simplified calculation - in practice would track document view to acceptance time
    return 120; // seconds
  }

  private generateComplianceRecommendations(documents: unknown[], acceptances: unknown[]): string[] {
    const recommendations = [];
    
    const nonCompliantGDPR = documents.filter((d: unknown) => d.status === 'PUBLISHED' && !d.compliance.gdprCompliant);
    if (nonCompliantGDPR.length > 0) {
      recommendations.push(`${nonCompliantGDPR.length} published documents are not GDPR compliant`);
    }
    
    const oldDocuments = documents.filter((d: unknown) => {
      const lastModified = new Date(d.updatedAt);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return lastModified < oneYearAgo;
    });
    if (oldDocuments.length > 0) {
      recommendations.push(`${oldDocuments.length} documents haven't been updated in over a year`);
    }
    
    const lowAcceptanceTypes = this.getAcceptancesByType(acceptances)
      .filter((item: unknown) => item.count < 10);
    if (lowAcceptanceTypes.length > 0) {
      recommendations.push(`Low acceptance rates for: ${lowAcceptanceTypes.map((t: unknown) => t.type).join(', ')}`);
    }
    
    return recommendations;
  }
}

// Route Handlers
export async function termsConditionsRoutes(server: FastifyInstance): Promise<void> {
  const termsService = new TermsConditionsService();

  // Get all legal documents
  server.get('/', async (request: FastifyRequest<{
    Querystring: { 
      tenantId?: string;
      type?: string;
      status?: string;
      isActive?: boolean;
      jurisdiction?: string;
    }
  }>, reply: FastifyReply) => {
    try {
      const { tenantId, ...filters } = request.query;
      const documents = await termsService.getAllDocuments(tenantId, filters);
      
      return reply.send({
        success: true,
        data: documents,
        count: documents.length,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(500).send({
        success: false,
        message: 'Failed to retrieve legal documents',
        error: error.message,
      });
    }
  });

  // Create new legal document
  server.post('/', async (request: FastifyRequest<{
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const documentData = request.body;
      const document = await termsService.createDocument(documentData);
      
      return (reply as FastifyReply).status(201).send({
        success: true,
        data: document,
        message: 'Legal document created successfully',
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to create legal document',
        error: error.message,
      });
    }
  });

  // Get document by ID
  server.get('/:documentId', async (request: FastifyRequest<{
    Params: { documentId: string }
  }>, reply: FastifyReply) => {
    try {
      const { documentId  } = (request.params as unknown);
      const document = await termsService.getDocumentById(documentId);
      
      if (!document) {
        return (reply as FastifyReply).status(404).send({
          success: false,
          message: 'Legal document not found',
        });
      }
      
      return reply.send({
        success: true,
        data: document,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(500).send({
        success: false,
        message: 'Failed to retrieve legal document',
        error: error.message,
      });
    }
  });

  // Update legal document
  server.put('/:documentId', async (request: FastifyRequest<{
    Params: { documentId: string }
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const { documentId  } = (request.params as unknown);
      const updateData = request.body;
      
      const document = await termsService.updateDocument(documentId, updateData);
      
      return reply.send({
        success: true,
        data: document,
        message: 'Legal document updated successfully',
      });
    } catch (error: unknown) {
      const status = error.message === 'Document not found' ? 404 : 400;
      return (reply as FastifyReply).status(status).send({
        success: false,
        message: 'Failed to update legal document',
        error: error.message,
      });
    }
  });

  // Publish document
  server.post('/:documentId/publish', async (request: FastifyRequest<{
    Params: { documentId: string }
    Body: { approvedBy: string }
  }>, reply: FastifyReply) => {
    try {
      const { documentId  } = (request.params as unknown);
      const { approvedBy  } = (request.body as unknown);
      
      const document = await termsService.publishDocument(documentId, approvedBy);
      
      return reply.send({
        success: true,
        data: document,
        message: 'Document published successfully',
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to publish document',
        error: error.message,
      });
    }
  });

  // Record user acceptance
  server.post('/acceptances', async (request: FastifyRequest<{
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const acceptanceData = request.body;
      const acceptance = await termsService.recordAcceptance(acceptanceData);
      
      return (reply as FastifyReply).status(201).send({
        success: true,
        data: acceptance,
        message: 'Acceptance recorded successfully',
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to record acceptance',
        error: error.message,
      });
    }
  });

  // Get user acceptances
  server.get('/acceptances/:userId', async (request: FastifyRequest<{
    Params: { userId: string }
    Querystring: { documentType?: string }
  }>, reply: FastifyReply) => {
    try {
      const { userId  } = (request.params as unknown);
      const { documentType  } = (request.query as unknown);
      
      const acceptances = await termsService.getUserAcceptances(_userId, documentType);
      
      return reply.send({
        success: true,
        data: acceptances,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(500).send({
        success: false,
        message: 'Failed to retrieve user acceptances',
        error: error.message,
      });
    }
  });

  // Check user compliance
  server.get('/compliance/:userId', async (request: FastifyRequest<{
    Params: { userId: string }
  }>, reply: FastifyReply) => {
    try {
      const { userId  } = (request.params as unknown);
      const compliance = await termsService.checkUserCompliance(_userId);
      
      return reply.send({
        success: true,
        data: compliance,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(500).send({
        success: false,
        message: 'Failed to check user compliance',
        error: error.message,
      });
    }
  });

  // Get document versions
  server.get('/versions/:documentType', async (request: FastifyRequest<{
    Params: { documentType: string }
    Querystring: { tenantId?: string }
  }>, reply: FastifyReply) => {
    try {
      const { documentType  } = (request.params as unknown);
      const { tenantId  } = (request.query as unknown);
      
      const versions = await termsService.getDocumentVersions(documentType, tenantId);
      
      return reply.send({
        success: true,
        data: versions,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(500).send({
        success: false,
        message: 'Failed to retrieve document versions',
        error: error.message,
      });
    }
  });

  // Compare document versions
  server.get('/compare/:documentId1/:documentId2', async (request: FastifyRequest<{
    Params: { documentId1: string; documentId2: string }
  }>, reply: FastifyReply) => {
    try {
      const { documentId1, documentId2  } = (request.params as unknown);
      const comparison = await termsService.compareVersions(documentId1, documentId2);
      
      return reply.send({
        success: true,
        data: comparison,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to compare document versions',
        error: error.message,
      });
    }
  });

  // Generate compliance report
  server.get('/reports/compliance', async (request: FastifyRequest<{
    Querystring: { tenantId?: string; auditType?: string }
  }>, reply: FastifyReply) => {
    try {
      const { tenantId, auditType  } = (request.query as unknown);
      const report = await termsService.generateComplianceReport(tenantId, auditType);
      
      return reply.send({
        success: true,
        data: report,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(500).send({
        success: false,
        message: 'Failed to generate compliance report',
        error: error.message,
      });
    }
  });

  // Get document types
  server.get('/types/list', async (request: FastifyRequest, reply: FastifyReply) => {
    const types = [
      { id: 'TERMS_OF_SERVICE', name: 'Terms of Service', icon: '📋' },
      { id: 'PRIVACY_POLICY', name: 'Privacy Policy', icon: '🔒' },
      { id: 'REFUND_POLICY', name: 'Refund Policy', icon: '💰' },
      { id: 'WARRANTY_TERMS', name: 'Warranty Terms', icon: '🛡️' },
      { id: 'SERVICE_AGREEMENT', name: 'Service Agreement', icon: '📝' },
      { id: 'DATA_PROCESSING_AGREEMENT', name: 'Data Processing Agreement', icon: '🔄' },
      { id: 'COOKIE_POLICY', name: 'Cookie Policy', icon: '🍪' },
      { id: 'ACCEPTABLE_USE_POLICY', name: 'Acceptable Use Policy', icon: '✅' },
      { id: 'LICENSING_AGREEMENT', name: 'Licensing Agreement', icon: '📜' },
      { id: 'DISCLAIMER', name: 'Disclaimer', icon: '⚠️' },
      { id: 'SLA_AGREEMENT', name: 'Service Level Agreement', icon: '⏰' },
      { id: 'GDPR_COMPLIANCE', name: 'GDPR Compliance Document', icon: '🇪🇺' },
    ];

    return reply.send({
      success: true,
      data: types,
    });
  });
}

export default termsConditionsRoutes;