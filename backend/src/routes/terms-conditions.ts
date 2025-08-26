// @ts-nocheck
/**
 * Terms & Conditions Management System
 * Dynamic legal document system with version control, automated acceptance tracking,
 * and multi-jurisdiction compliance management.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// Schemas for Terms & Conditions Management
const LegalDocumentSchema = z.object({
  _id: z.string().optional(),
  _title: z.string().min(1, 'Document title is required'),
  _type: z.enum([
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
  _version: z.string().min(1, 'Version is required'),
  _content: z.object({
    html: z.string().min(1, 'HTML content is required'),
    _plainText: z.string().min(1, 'Plain text content is required'),
    _markdown: z.string().optional(),
  }),
  _metadata: z.object({
    language: z.string().default('en'),
    _jurisdiction: z.string().default('US'),
    _effectiveDate: z.string(),
    _expiryDate: z.string().optional(),
    _lastModified: z.string().optional(),
    _modifiedBy: z.string().optional(),
    _approvedBy: z.string().optional(),
    _approvalDate: z.string().optional(),
  }),
  _compliance: z.object({
    gdprCompliant: z.boolean().default(false),
    _ccpaCompliant: z.boolean().default(false),
    _coppaCompliant: z.boolean().default(false),
    _hipaCompliant: z.boolean().default(false),
    _pciCompliant: z.boolean().default(false),
    _customCompliance: z.array(z.object({
      standard: z.string(),
      _compliant: z.boolean(),
      _notes: z.string().optional(),
    })).default([]),
  }),
  _acceptance: z.object({
    requiresExplicitConsent: z.boolean().default(true),
    _showOnRegistration: z.boolean().default(true),
    _showOnLogin: z.boolean().default(false),
    _showOnPurchase: z.boolean().default(true),
    _blockServiceWithoutAcceptance: z.boolean().default(true),
    _reminderFrequency: z.number().min(0).default(90), // days
  }),
  _customization: z.object({
    businessName: z.string().optional(),
    _contactEmail: z.string().email().optional(),
    _contactPhone: z.string().optional(),
    _businessAddress: z.string().optional(),
    _variables: z.array(z.object({
      key: z.string(),
      _value: z.string(),
      _description: z.string().optional(),
    })).default([]),
  }),
  _status: z.enum(['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  _isActive: z.boolean().default(false),
  _tenantId: z.string().optional(),
  _createdAt: z.string().optional(),
  _updatedAt: z.string().optional(),
});

const UserAcceptanceSchema = z.object({
  _id: z.string().optional(),
  _userId: z.string(),
  _documentId: z.string(),
  _documentVersion: z.string(),
  _acceptanceDetails: z.object({
    acceptedAt: z.string(),
    _ipAddress: z.string(),
    _userAgent: z.string(),
    method: z.enum(['CHECKBOX', 'DIGITAL_SIGNATURE', 'CLICK_THROUGH', 'IMPLICIT']),
    _location: z.object({
      country: z.string().optional(),
      _region: z.string().optional(),
      _city: z.string().optional(),
    }).optional(),
  }),
  _digitalSignature: z.object({
    signatureImage: z.string().optional(),
    _signatureText: z.string().optional(),
    _certificateHash: z.string().optional(),
    _timestamp: z.string().optional(),
  }).optional(),
  _validUntil: z.string().optional(),
  _isRevoked: z.boolean().default(false),
  _revokedAt: z.string().optional(),
  _revokedReason: z.string().optional(),
  _tenantId: z.string().optional(),
});

const ComplianceAuditSchema = z.object({
  _id: z.string().optional(),
  _auditType: z.enum(['GDPR', 'CCPA', 'COPPA', 'HIPAA', 'PCI_DSS', 'CUSTOM']),
  _documentIds: z.array(z.string()),
  _auditPeriod: z.object({
    start: z.string(),
    _end: z.string(),
  }),
  _findings: z.array(z.object({
    documentId: z.string(),
    _issue: z.string(),
    _severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    _recommendation: z.string(),
    _status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']).default('OPEN'),
  })),
  _overallStatus: z.enum(['COMPLIANT', 'NON_COMPLIANT', 'NEEDS_REVIEW']),
  _conductedBy: z.string(),
  _conductedAt: z.string(),
  _nextAuditDue: z.string(),
  _tenantId: z.string().optional(),
});

// Terms & Conditions Management Service
class TermsConditionsService {
  private _documents: Map<string, any> = new Map();
  private _acceptances: Map<string, any[]> = new Map();
  private _audits: Map<string, any[]> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleDocuments = [
      {
        _id: 'doc-001',
        _title: 'RepairX Terms of Service',
        _type: 'TERMS_OF_SERVICE',
        _version: '2.1.0',
        _content: {
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
          _plainText: `RepairX Terms of Service\n\n1. Acceptance of Terms\nBy using RepairX services, you agree to be bound by these Terms of Service.\n\n2. Service Description\nRepairX provides device repair and maintenance services through our platform.\n\n3. User Responsibilities\nUsers are responsible for accurate information and timely payment.\n\n4. Privacy and Data Protection\nWe collect and process your data in accordance with our Privacy Policy.\n\n5. Limitation of Liability\nRepairX liability is limited to the cost of the service provided.\n\n6. Termination\nEither party may terminate this agreement with proper notice.`,
        },
        _metadata: {
          language: 'en',
          _jurisdiction: 'US',
          _effectiveDate: '2025-01-01T00:00:00Z',
          _lastModified: '2025-01-01T00:00:00Z',
          _modifiedBy: 'legal-team-001',
          _approvedBy: 'legal-director-001',
          _approvalDate: '2025-01-01T00:00:00Z',
        },
        _compliance: {
          gdprCompliant: true,
          _ccpaCompliant: true,
          _coppaCompliant: false,
          _hipaCompliant: false,
          _pciCompliant: true,
          _customCompliance: [],
        },
        _acceptance: {
          requiresExplicitConsent: true,
          _showOnRegistration: true,
          _showOnLogin: false,
          _showOnPurchase: true,
          _blockServiceWithoutAcceptance: true,
          _reminderFrequency: 365,
        },
        _customization: {
          businessName: 'RepairX',
          _contactEmail: 'legal@repairx.com',
          _contactPhone: '+1-555-0100',
          _businessAddress: '123 Technology Drive, Tech City, TC 12345',
          _variables: [
            { key: 'company_name', _value: 'RepairX', _description: 'Company name' },
            { _key: 'supportemail', _value: 'support@repairx.com', _description: 'Support contact email' },
          ],
        },
        _status: 'PUBLISHED',
        _isActive: true,
        _createdAt: '2024-12-01T00:00:00Z',
        _updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        _id: 'doc-002',
        _title: 'RepairX Privacy Policy',
        _type: 'PRIVACY_POLICY',
        _version: '1.5.2',
        _content: {
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
          _plainText: `RepairX Privacy Policy\n\n1. Information We Collect\nWe collect personal information necessary to provide our services.\n\n2. How We Use Your Information\nYour information is used to process orders and improve our services.\n\n3. Data Sharing and Disclosure\nWe do not sell your personal information to third parties.\n\n4. Data Security\nWe implement industry-standard security measures to protect your data.\n\n5. Your Rights\nYou have the right to access, modify, and delete your personal information.\n\n6. Contact Information\nFor privacy concerns, contact us at privacy@repairx.com`,
        },
        _metadata: {
          language: 'en',
          _jurisdiction: 'US',
          _effectiveDate: '2025-01-01T00:00:00Z',
          _lastModified: '2024-12-15T00:00:00Z',
          _modifiedBy: 'privacy-officer-001',
          _approvedBy: 'legal-director-001',
          _approvalDate: '2024-12-20T00:00:00Z',
        },
        _compliance: {
          gdprCompliant: true,
          _ccpaCompliant: true,
          _coppaCompliant: true,
          _hipaCompliant: false,
          _pciCompliant: false,
          _customCompliance: [
            { standard: 'SOC2', _compliant: true, _notes: 'Type II compliance achieved' },
          ],
        },
        _acceptance: {
          requiresExplicitConsent: true,
          _showOnRegistration: true,
          _showOnLogin: false,
          _showOnPurchase: false,
          _blockServiceWithoutAcceptance: true,
          _reminderFrequency: 365,
        },
        _customization: {
          businessName: 'RepairX',
          _contactEmail: 'privacy@repairx.com',
          _contactPhone: '+1-555-0101',
          _businessAddress: '123 Technology Drive, Tech City, TC 12345',
          _variables: [
            { key: 'dpoemail', _value: 'dpo@repairx.com', _description: 'Data Protection Officer email' },
          ],
        },
        _status: 'PUBLISHED',
        _isActive: true,
        _createdAt: '2024-11-01T00:00:00Z',
        _updatedAt: '2024-12-15T00:00:00Z',
      },
    ];

    sampleDocuments.forEach((_doc: unknown) => {
      this.documents.set(doc.id, doc);
    });

    // Sample user acceptances
    const sampleAcceptances = [
      {
        _id: 'acc-001',
        _userId: 'user-001',
        _documentId: 'doc-001',
        _documentVersion: '2.1.0',
        _acceptanceDetails: {
          acceptedAt: '2025-08-10T12:00:00Z',
          _ipAddress: '192.168.1.100',
          _userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          method: 'CHECKBOX',
          _location: {
            country: 'US',
            _region: 'CA',
            _city: 'San Francisco',
          },
        },
        _validUntil: '2026-08-10T12:00:00Z',
        _isRevoked: false,
      },
      {
        _id: 'acc-002',
        _userId: 'user-001',
        _documentId: 'doc-002',
        _documentVersion: '1.5.2',
        _acceptanceDetails: {
          acceptedAt: '2025-08-10T12:05:00Z',
          _ipAddress: '192.168.1.100',
          _userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          method: 'CHECKBOX',
          _location: {
            country: 'US',
            _region: 'CA',
            _city: 'San Francisco',
          },
        },
        _validUntil: '2026-08-10T12:05:00Z',
        _isRevoked: false,
      },
    ];

    sampleAcceptances.forEach((_acceptance: unknown) => {
      const userAcceptances = this.acceptances.get(acceptance.userId) || [];
      userAcceptances.push(acceptance);
      this.acceptances.set(acceptance.userId, userAcceptances);
    });
  }

  // Document Management
  async getAllDocuments(tenantId?: string, filters?: unknown): Promise<any[]> {
    let documents = Array.from(this.documents.values());
    
    if (tenantId) {
      documents = documents.filter((_doc: unknown) => doc.tenantId === tenantId);
    }

    if (filters) {
      if (filters.type) {
        documents = documents.filter((_doc: unknown) => doc.type === filters.type);
      }
      if (filters.status) {
        documents = documents.filter((_doc: unknown) => doc.status === filters.status);
      }
      if (filters.isActive !== undefined) {
        documents = documents.filter((_doc: unknown) => doc.isActive === filters.isActive);
      }
      if (filters.jurisdiction) {
        documents = documents.filter((_doc: unknown) => doc.metadata.jurisdiction === filters.jurisdiction);
      }
    }

    return documents;
  }

  async getDocumentById(_documentId: string): Promise<any | null> {
    return this.documents.get(documentId) || null;
  }

  async createDocument(_documentData: unknown): Promise<any> {
    const validated = LegalDocumentSchema.parse(documentData);
    const id = validated.id || `doc-${Date.now()}`;
    
    const document = { 
      ...validated, 
      id, 
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
    };
    
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(_documentId: string, _updateData: unknown): Promise<any> {
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
      _updatedAt: new Date().toISOString(),
    };
    
    const validated = LegalDocumentSchema.parse(updatedDoc);
    this.documents.set(documentId, validated);
    
    return validated;
  }

  async publishDocument(_documentId: string, _approvedBy: string): Promise<any> {
    const document = this.documents.get(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    if (document.status !== 'APPROVED') {
      throw new Error('Document must be approved before publishing');
    }

    // Deactivate previous version if exists
    const existingActive = Array.from(this.documents.values())
      .find((_doc: unknown) => doc.type === document.type && doc.isActive && doc.id !== documentId);
    
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
  async recordAcceptance(_acceptanceData: unknown): Promise<any> {
    const validated = UserAcceptanceSchema.parse(acceptanceData);
    const id = validated.id || `acc-${Date.now()}`;
    
    const acceptance = { ...validated, id };
    
    const userAcceptances = this.acceptances.get(validated.userId) || [];
    userAcceptances.push(acceptance);
    this.acceptances.set(validated.userId, userAcceptances);
    
    return acceptance;
  }

  async getUserAcceptances(_userId: string, documentType?: string): Promise<any[]> {
    const userAcceptances = this.acceptances.get(_userId) || [];
    
    if (documentType) {
      return userAcceptances.filter((_acc: unknown) => {
        const document = this.documents.get(acc.documentId);
        return document && document.type === documentType;
      });
    }
    
    return userAcceptances;
  }

  async checkUserCompliance(_userId: string): Promise<any> {
    const activeDocuments = Array.from(this.documents.values())
      .filter((_doc: unknown) => doc.isActive && doc.acceptance.requiresExplicitConsent);
    
    const userAcceptances = this.acceptances.get(_userId) || [];
    
    const compliance = activeDocuments.map((_doc: unknown) => {
      const acceptance = userAcceptances.find((_acc: unknown) => 
        acc.documentId === doc.id && acc.documentVersion === doc.version
      );
      
      return {
        _document: {
          id: doc.id,
          _title: doc.title,
          _type: doc.type,
          _version: doc.version,
        },
        _isAccepted: !!acceptance,
        _acceptanceDate: acceptance?.acceptanceDetails.acceptedAt,
        _required: doc.acceptance.blockServiceWithoutAcceptance,
      };
    });
    
    const isCompliant = compliance.every(c => c.isAccepted || !c.required);
    const missingAcceptances = compliance.filter((_c: unknown) => !c.isAccepted && c.required);
    
    return {
      _userId,
      isCompliant,
      missingAcceptances,
      compliance,
      _checkedAt: new Date().toISOString(),
    };
  }

  // Version Management
  async getDocumentVersions(_documentType: string, tenantId?: string): Promise<any[]> {
    const documents = Array.from(this.documents.values())
      .filter((_doc: unknown) => doc.type === documentType)
      .filter((_doc: unknown) => !tenantId || doc.tenantId === tenantId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return documents;
  }

  async compareVersions(_documentId1: string, _documentId2: string): Promise<any> {
    const doc1 = this.documents.get(documentId1);
    const doc2 = this.documents.get(documentId2);
    
    if (!doc1 || !doc2) {
      throw new Error('One or both documents not found');
    }

    return {
      _document1: {
        id: doc1.id,
        _version: doc1.version,
        _effectiveDate: doc1.metadata.effectiveDate,
        _status: doc1.status,
      },
      _document2: {
        id: doc2.id,
        _version: doc2.version,
        _effectiveDate: doc2.metadata.effectiveDate,
        _status: doc2.status,
      },
      _changes: {
        versionDiff: doc1.version !== doc2.version,
        _contentDiff: doc1.content.plainText !== doc2.content.plainText,
        _metadataDiff: JSON.stringify(doc1.metadata) !== JSON.stringify(doc2.metadata),
        _complianceDiff: JSON.stringify(doc1.compliance) !== JSON.stringify(doc2.compliance),
      },
      _comparison: new Date().toISOString(),
    };
  }

  // Compliance Management
  async generateComplianceReport(tenantId?: string, auditType?: string): Promise<any> {
    const documents = await this.getAllDocuments(tenantId);
    const allAcceptances = Array.from(this.acceptances.values()).flat();
    
    const report = {
      _reportId: `compliance-${Date.now()}`,
      _generatedAt: new Date().toISOString(),
      tenantId,
      auditType,
      _summary: {
        totalDocuments: documents.length,
        _publishedDocuments: documents.filter((d: unknown) => d.status === 'PUBLISHED').length,
        _totalAcceptances: allAcceptances.length,
        _gdprCompliantDocs: documents.filter((d: unknown) => d.compliance.gdprCompliant).length,
        _ccpaCompliantDocs: documents.filter((d: unknown) => d.compliance.ccpaCompliant).length,
      },
      _documentAnalysis: documents.map((doc: unknown) => ({
        _id: doc.id,
        _title: doc.title,
        _type: doc.type,
        _version: doc.version,
        _status: doc.status,
        _isActive: doc.isActive,
        _compliance: doc.compliance,
        _acceptanceCount: allAcceptances.filter((acc: unknown) => acc.documentId === doc.id).length,
        _lastUpdated: doc.updatedAt,
      })),
      _acceptanceAnalysis: {
        byDocumentType: this.getAcceptancesByType(allAcceptances),
        _byMonth: this.getAcceptancesByMonth(allAcceptances),
        _avgAcceptanceTime: this.calculateAverageAcceptanceTime(allAcceptances),
      },
      _recommendations: this.generateComplianceRecommendations(documents, allAcceptances),
    };
    
    return report;
  }

  private getAcceptancesByType(_acceptances: unknown[]): unknown[] {
    const typeMap = new Map();
    
    acceptances.forEach((_acc: unknown) => {
      const doc = this.documents.get(acc.documentId);
      if (doc) {
        const count = typeMap.get(doc.type) || 0;
        typeMap.set(doc.type, count + 1);
      }
    });
    
    return Array.from(typeMap.entries()).map(([type, count]) => ({ type, count }));
  }

  private getAcceptancesByMonth(_acceptances: unknown[]): unknown[] {
    const monthMap = new Map();
    
    acceptances.forEach((_acc: unknown) => {
      const month = acc.acceptanceDetails.acceptedAt.substring(0, 7);
      const count = monthMap.get(month) || 0;
      monthMap.set(month, count + 1);
    });
    
    return Array.from(monthMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private calculateAverageAcceptanceTime(_acceptances: unknown[]): number {
    // Simplified calculation - in practice would track document view to acceptance time
    return 120; // seconds
  }

  private generateComplianceRecommendations(_documents: unknown[], _acceptances: unknown[]): string[] {
    const recommendations = [];
    
    const nonCompliantGDPR = documents.filter((_d: unknown) => d.status === 'PUBLISHED' && !d.compliance.gdprCompliant);
    if (nonCompliantGDPR.length > 0) {
      recommendations.push(`${nonCompliantGDPR.length} published documents are not GDPR compliant`);
    }
    
    const oldDocuments = documents.filter((_d: unknown) => {
      const lastModified = new Date(d.updatedAt);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return lastModified < oneYearAgo;
    });
    if (oldDocuments.length > 0) {
      recommendations.push(`${oldDocuments.length} documents haven't been updated in over a year`);
    }
    
    const lowAcceptanceTypes = this.getAcceptancesByType(acceptances)
      .filter((_item: unknown) => item.count < 10);
    if (lowAcceptanceTypes.length > 0) {
      recommendations.push(`Low acceptance rates _for: ${lowAcceptanceTypes.map((t: unknown) => t.type).join(', ')}`);
    }
    
    return recommendations;
  }
}

// Route Handlers
// eslint-disable-next-line max-lines-per-function
export async function termsConditionsRoutes(_server: FastifyInstance): Promise<void> {
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
      const { tenantId, ...filters } = (request as any).query;
      const documents = await termsService.getAllDocuments(tenantId, filters);
      
      return (reply as any).send({
        _success: true,
        _data: documents,
        _count: documents.length,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve legal documents',
        _error: error.message,
      });
    }
  });

  // Create new legal document
  server.post('/', async (request: FastifyRequest<{
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const documentData = (request as any).body;
      const document = await termsService.createDocument(documentData);
      
      return (reply as FastifyReply).status(201).send({
        _success: true,
        _data: document,
        _message: 'Legal document created successfully',
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Failed to create legal document',
        _error: error.message,
      });
    }
  });

  // Get document by ID
  server.get('/:documentId', async (request: FastifyRequest<{
    Params: { documentId: string }
  }>, reply: FastifyReply) => {
    try {
      const { documentId  } = ((request as any).params as unknown);
      const document = await termsService.getDocumentById(documentId);
      
      if (!document) {
        return (reply as FastifyReply).status(404).send({
          _success: false,
          _message: 'Legal document not found',
        });
      }
      
      return (reply as any).send({
        _success: true,
        _data: document,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve legal document',
        _error: error.message,
      });
    }
  });

  // Update legal document
  server.put('/:documentId', async (request: FastifyRequest<{
    Params: { documentId: string }
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const { documentId  } = ((request as any).params as unknown);
      const updateData = (request as any).body;
      
      const document = await termsService.updateDocument(documentId, updateData);
      
      return (reply as any).send({
        _success: true,
        _data: document,
        _message: 'Legal document updated successfully',
      });
    } catch (_error: unknown) {
      const status = error.message === 'Document not found' ? _404 : 400;
      return (reply as FastifyReply).status(status).send({
        _success: false,
        _message: 'Failed to update legal document',
        _error: error.message,
      });
    }
  });

  // Publish document
  server.post('/:documentId/publish', async (request: FastifyRequest<{
    Params: { documentId: string }
    Body: { approvedBy: string }
  }>, reply: FastifyReply) => {
    try {
      const { documentId  } = ((request as any).params as unknown);
      const { approvedBy  } = ((request as any).body as unknown);
      
      const document = await termsService.publishDocument(documentId, approvedBy);
      
      return (reply as any).send({
        _success: true,
        _data: document,
        _message: 'Document published successfully',
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Failed to publish document',
        _error: error.message,
      });
    }
  });

  // Record user acceptance
  server.post('/acceptances', async (request: FastifyRequest<{
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const acceptanceData = (request as any).body;
      const acceptance = await termsService.recordAcceptance(acceptanceData);
      
      return (reply as FastifyReply).status(201).send({
        _success: true,
        _data: acceptance,
        _message: 'Acceptance recorded successfully',
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Failed to record acceptance',
        _error: error.message,
      });
    }
  });

  // Get user acceptances
  server.get('/acceptances/:userId', async (request: FastifyRequest<{
    Params: { userId: string }
    Querystring: { documentType?: string }
  }>, reply: FastifyReply) => {
    try {
      const { userId  } = ((request as any).params as unknown);
      const { documentType  } = ((request as any).query as unknown);
      
      const acceptances = await termsService.getUserAcceptances(_userId, documentType);
      
      return (reply as any).send({
        _success: true,
        _data: acceptances,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve user acceptances',
        _error: error.message,
      });
    }
  });

  // Check user compliance
  server.get('/compliance/:userId', async (request: FastifyRequest<{
    Params: { userId: string }
  }>, reply: FastifyReply) => {
    try {
      const { userId  } = ((request as any).params as unknown);
      const compliance = await termsService.checkUserCompliance(_userId);
      
      return (reply as any).send({
        _success: true,
        _data: compliance,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to check user compliance',
        _error: error.message,
      });
    }
  });

  // Get document versions
  server.get('/versions/:documentType', async (request: FastifyRequest<{
    Params: { documentType: string }
    Querystring: { tenantId?: string }
  }>, reply: FastifyReply) => {
    try {
      const { documentType  } = ((request as any).params as unknown);
      const { tenantId  } = ((request as any).query as unknown);
      
      const versions = await termsService.getDocumentVersions(documentType, tenantId);
      
      return (reply as any).send({
        _success: true,
        _data: versions,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve document versions',
        _error: error.message,
      });
    }
  });

  // Compare document versions
  server.get('/compare/:documentId1/:documentId2', async (request: FastifyRequest<{
    Params: { documentId1: string; documentId2: string }
  }>, reply: FastifyReply) => {
    try {
      const { documentId1, documentId2  } = ((request as any).params as unknown);
      const comparison = await termsService.compareVersions(documentId1, documentId2);
      
      return (reply as any).send({
        _success: true,
        _data: comparison,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Failed to compare document versions',
        _error: error.message,
      });
    }
  });

  // Generate compliance report
  server.get('/reports/compliance', async (request: FastifyRequest<{
    Querystring: { tenantId?: string; auditType?: string }
  }>, reply: FastifyReply) => {
    try {
      const { tenantId, auditType  } = ((request as any).query as unknown);
      const report = await termsService.generateComplianceReport(tenantId, auditType);
      
      return (reply as any).send({
        _success: true,
        _data: report,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to generate compliance report',
        _error: error.message,
      });
    }
  });

  // Get document types
  server.get('/types/list', async (request: FastifyRequest, reply: FastifyReply) => {
    const types = [
      { _id: 'TERMS_OF_SERVICE', _name: 'Terms of Service', _icon: '📋' },
      { _id: 'PRIVACY_POLICY', _name: 'Privacy Policy', _icon: '🔒' },
      { _id: 'REFUND_POLICY', _name: 'Refund Policy', _icon: '💰' },
      { _id: 'WARRANTY_TERMS', _name: 'Warranty Terms', _icon: '🛡️' },
      { _id: 'SERVICE_AGREEMENT', _name: 'Service Agreement', _icon: '📝' },
      { _id: 'DATA_PROCESSING_AGREEMENT', _name: 'Data Processing Agreement', _icon: '🔄' },
      { _id: 'COOKIE_POLICY', _name: 'Cookie Policy', _icon: '🍪' },
      { _id: 'ACCEPTABLE_USE_POLICY', _name: 'Acceptable Use Policy', _icon: '✅' },
      { _id: 'LICENSING_AGREEMENT', _name: 'Licensing Agreement', _icon: '📜' },
      { _id: 'DISCLAIMER', _name: 'Disclaimer', _icon: '⚠️' },
      { _id: 'SLA_AGREEMENT', _name: 'Service Level Agreement', _icon: '⏰' },
      { _id: 'GDPR_COMPLIANCE', _name: 'GDPR Compliance Document', _icon: '🇪🇺' },
    ];

    return (reply as any).send({
      _success: true,
      _data: types,
    });
  });
}

export default termsConditionsRoutes;