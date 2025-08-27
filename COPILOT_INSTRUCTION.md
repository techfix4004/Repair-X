# RepairX Copilot Development Instructions

## 🎯 Project Vision & Objectives

RepairX is being transformed into an industry-leading SaaS repair management platform that exceeds competitor capabilities. The goal is to create a comprehensive enterprise-grade solution with advanced AI capabilities, modern professional UI/UX, and complete business automation.

### Core Principles
1. **Production-First Development**: Every feature must be production-ready, no mock data or placeholders
2. **Industry Leadership**: Exceed capabilities of competitors like Bytephase.com
3. **User Experience Excellence**: Professional, futuristic, and intuitive interfaces
4. **Quality Assurance**: Six Sigma standards with automated testing and quality gates
5. **Comprehensive Documentation**: Complete guides, workflows, and visual confirmation

---

## 🔐 Authentication System Requirements

### Consolidated Login Architecture
**CRITICAL**: Implement exactly 3 login types as specified:

#### 1. User/Client Login
- **Purpose**: Self-service customer portal
- **Features**: Email/phone login, device registration, service tracking, payment history
- **Route**: `/customer/dashboard`
- **Backend**: Main API (`http://localhost:3001/api/v1`)

#### 2. Organization Login  
- **Purpose**: Multi-tenant business management with branch support
- **Features**: Multi-branch operations, team management, analytics dashboard, workflow automation
- **Route**: `/admin/dashboard`
- **Backend**: Main API (`http://localhost:3001/api/v1`)

#### 3. SaaS Admin Login
- **Purpose**: Platform administration and multi-tenant management
- **Features**: Tenant management, platform analytics, white-label config, system monitoring
- **Route**: `/saas-admin/dashboard`
- **Backend**: **SEPARATE** Admin API (`http://localhost:3002/api/v1`)

### Implementation Standards
- Modern Material-UI design with professional aesthetics
- TypeScript with comprehensive type safety
- Zustand state management for performance
- Role-based routing and permissions
- Advanced form validation and error handling

---

## 🎨 UI/UX Design Standards

### Professional Design System
- **Framework**: Material-UI 6 with custom theming
- **Typography**: Professional hierarchy with consistent font weights
- **Color Palette**: Enterprise-grade color schemes with accessibility compliance
- **Animations**: Advanced transitions using hardware acceleration
- **Responsiveness**: Mobile-first design with perfect cross-device experience

### Component Standards
- Reusable component library with consistent API
- Professional shadows and gradient backgrounds
- Interactive elements with hover states and feedback
- Loading states and skeleton screens for optimal UX
- Error boundaries and graceful error handling

### Accessibility Requirements
- WCAG 2.1 AAA compliance
- Screen reader optimization
- Keyboard navigation support
- High contrast mode compatibility
- Internationalization support (i18n)

---

## 🏢 Business Logic Architecture

### Centralized Workflow Management
All business processes must be unified into a cohesive system:

#### Job Management (12-State Workflow)
1. **CREATED** - Initial job creation with automated technician assignment
2. **IN_DIAGNOSIS** - Technician evaluation with photo documentation
3. **AWAITING_APPROVAL** - Customer approval workflow with digital signatures
4. **APPROVED** - Work authorization with parts ordering
5. **IN_PROGRESS** - Active repair with real-time updates
6. **PARTS_ORDERED** - Automated supplier integration
7. **TESTING** - Quality validation with automated protocols
8. **QUALITY_CHECK** - Six Sigma quality checkpoint
9. **COMPLETED** - Automated completion workflow
10. **CUSTOMER_APPROVED** - Final approval with satisfaction surveys
11. **DELIVERED** - Delivery confirmation with warranty documentation
12. **CANCELLED** - Cancellation workflow with refund processing

#### Financial Management
- **Quotation System**: Multi-approval workflows with revision tracking
- **Invoice Management**: GST-compliant automated invoicing
- **Payment Processing**: Multi-gateway integration with automated tax calculations
- **Expense Management**: OCR receipt processing with approval workflows

#### Inventory & Operations
- **Parts Management**: AI-powered ordering with stock optimization
- **Technician Operations**: Mobile-first field interface with offline capabilities
- **Customer Management**: 360-degree customer view with service history
- **Multi-Tenant Support**: White-label platform with tenant isolation

---

## 🤖 AI Integration Requirements

### Self-Learning Systems (No External APIs)
All AI features must be implemented internally without external dependencies:

#### Intelligent Diagnosis System
- NLP-powered device analysis using historical data
- Pattern recognition for common issues
- Automated recommendation engine
- Self-improving accuracy through machine learning

#### Predictive Analytics
- Failure prediction based on usage patterns
- Maintenance scheduling optimization
- Parts demand forecasting
- Customer behavior analysis

#### Business Intelligence
- Churn prediction and retention strategies
- Performance optimization recommendations
- Dynamic pricing based on market factors
- Workflow automation with continuous improvement

### Technical Implementation
- TensorFlow.js for client-side machine learning
- Natural language processing using transformers
- Statistical analysis for pattern recognition
- Historical data analysis for predictions

---

## ✅ Quality Assurance Standards

### Six Sigma Methodology
- **Defect Rate**: Target < 3.4 DPMO (Defects Per Million Opportunities)
- **Process Capability**: Cp > 1.33, Cpk > 1.33
- **Continuous Monitoring**: Automated quality metrics tracking
- **Root Cause Analysis**: Systematic issue resolution

### Testing Strategy
- **Unit Testing**: 95%+ code coverage requirement
- **Integration Testing**: All API endpoints and workflows
- **End-to-End Testing**: Complete user journey validation
- **Performance Testing**: Load testing and optimization
- **Security Testing**: Penetration testing and vulnerability scanning
- **Visual Regression Testing**: Automated UI screenshot comparison

### Automation Requirements
- Automated build and deployment pipelines
- Continuous integration with quality gates
- Automated performance monitoring
- Real-time error tracking and alerting

---

## 📱 Mobile-First Development

### Responsive Design Requirements
- Perfect experience across all device types
- Touch-optimized interfaces with gesture support
- Offline capabilities for field operations
- Progressive Web App (PWA) functionality

### Technician Mobile Interface
- Field-optimized job management
- Offline mode with data synchronization
- Photo capture and documentation tools
- GPS tracking and route optimization
- Digital signature collection

### Customer Mobile Experience
- QR code device registration
- Real-time job tracking
- Direct communication with technicians
- Mobile payment processing
- Service history access

---

## 🔧 Technical Architecture

### Frontend Stack
- **Framework**: Next.js 15 with TypeScript
- **UI Library**: Material-UI 6 with custom theming
- **State Management**: Zustand for performance optimization
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Icons**: Material-UI Icons with custom additions

### Backend Requirements
- **Framework**: Fastify with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with role-based permissions
- **File Storage**: Cloud storage with CDN integration
- **Real-time**: WebSocket for live updates

### Infrastructure
- **Containerization**: Docker with production configuration
- **Monitoring**: Prometheus, Grafana, Jaeger, AlertManager
- **CI/CD**: Automated deployment pipelines
- **Security**: Enterprise-grade security measures

---

## 📊 Performance Standards

### Loading Performance
- Initial page load: < 2 seconds
- Subsequent navigation: < 500ms
- API response times: < 200ms (95th percentile)
- Image optimization: WebP format with lazy loading

### User Experience Metrics
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms

### Scalability Requirements
- Support 1000+ concurrent users
- Handle 10,000+ API requests per minute
- Database optimization for large datasets
- Auto-scaling infrastructure configuration

---

## 📚 Documentation Requirements

### Complete Documentation Set
- **Feature Documentation**: Detailed guides for every feature
- **Workflow Guides**: Step-by-step process documentation
- **API Documentation**: Interactive API explorer
- **User Training**: Video tutorials and certification programs
- **Developer Onboarding**: Technical setup and contribution guides

### Visual Confirmation
- Screenshots of every page and component
- Before/after comparisons for UI improvements
- Workflow demonstration videos
- Mobile responsiveness showcase
- Accessibility compliance evidence

### Maintenance Documentation
- Deployment procedures and rollback plans
- Monitoring and alerting configuration
- Troubleshooting guides and common issues
- Performance optimization procedures

---

## 🚀 Deployment & Operations

### Production Readiness Checklist
- [ ] Zero mock data or placeholder content
- [ ] Comprehensive error handling and validation
- [ ] Security compliance and audit completion
- [ ] Performance optimization and load testing
- [ ] Documentation completion and review
- [ ] User acceptance testing across all roles
- [ ] Monitoring and alerting configuration
- [ ] Backup and disaster recovery procedures

### Monitoring Requirements
- Real-time system health monitoring
- Business metrics tracking and visualization
- User behavior analytics
- Error tracking and alerting
- Performance monitoring and optimization

### Security Standards
- OWASP compliance for web application security
- Data encryption at rest and in transit
- Regular security audits and penetration testing
- Compliance with GDPR, CCPA, and industry standards
- Automated vulnerability scanning

---

## 📋 Development Workflow

### Feature Development Process
1. **Design Phase**: Technical design document and UI mockups
2. **Implementation**: TDD approach with comprehensive testing
3. **Code Review**: Peer review with quality standards validation
4. **Testing**: Automated and manual testing completion
5. **Documentation**: Feature documentation and visual confirmation
6. **Deployment**: Staging validation and production release

### Quality Gates
- All automated tests must pass (100%)
- Code coverage meets minimum thresholds (95%)
- Security scans show no critical issues
- Performance benchmarks are satisfied
- Accessibility standards are validated
- Documentation is complete and reviewed

### Continuous Improvement
- Weekly retrospectives for process optimization
- Monthly architecture reviews and technology updates
- Quarterly competitive analysis and feature gap assessment
- Annual technology stack evaluation and migration planning

---

## 🎯 Success Metrics

### Technical Excellence
- **Performance**: Sub-2-second load times across all pages
- **Quality**: Six Sigma defect rates with zero critical bugs
- **Coverage**: 95%+ test coverage with comprehensive validation
- **Security**: Zero critical vulnerabilities with regular audits

### Business Impact
- **User Satisfaction**: 95%+ customer satisfaction scores
- **Efficiency**: 60% reduction in manual processes through automation
- **Scalability**: Support for enterprise-level usage patterns
- **Competitive Advantage**: Industry-leading feature completeness

### Innovation Goals
- **AI Capabilities**: Self-learning systems with measurable accuracy improvements
- **Patent Potential**: 5+ patent-worthy innovations in repair management
- **Market Leadership**: Recognition as top-tier repair management platform
- **Customer Success**: Demonstrable ROI for platform adopters

---

*These instructions serve as the authoritative guide for all development activities. Any deviations must be documented and approved through the established review process.*