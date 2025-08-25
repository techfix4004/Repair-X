# RepairX Development Instructions

> **🎯 PRIORITY IMPLEMENTATION REQUIREMENTS**
> 
> Based on the comprehensive project roadmap analysis, copilot should prioritize building the complete RepairX business management ecosystem:
> 
> 1. **Business Settings Dashboard**: Complete 20+ setting categories system with professional UI/UX
>    - Visual configuration interface with real-time preview and advanced animations
>    - Settings validation and business rule enforcement with Six Sigma quality standards
>    - Template management for documents and communications with brand consistency
>    - Professional design matching modern SaaS platforms with enterprise-grade aesthetics
> 
> 2. **12-State Job Sheet Lifecycle**: Enhanced workflow management with complete state definitions
>    - Implement all 12 states: CREATED → IN_DIAGNOSIS → AWAITING_APPROVAL → APPROVED → IN_PROGRESS → PARTS_ORDERED → TESTING → QUALITY_CHECK → COMPLETED → CUSTOMER_APPROVED → DELIVERED → CANCELLED
>    - Automated state transitions with role-based triggers and time-based escalations
>    - SMS/email notifications for all stakeholders with delivery tracking
>    - Photo documentation requirements at each major workflow stage
>    - Digital signature collection for quotes and completion confirmation
>    - Complete audit trails with timestamps and reason tracking
> 
> 3. **Multi-Role Dashboard Architecture**: Professional role separation with advanced features
>    - **Customer Portal**: Self-service device registration with QR code check-in, real-time 12-state tracking, digital approvals, payment history
>    - **Technician Mobile Dashboard**: Field-optimized interface with offline capabilities, job assignment, photo documentation, signature collection, parts management
>    - **Admin Business Management**: Comprehensive dashboard with workflow configuration, reporting, employee management, financial controls
>    - **SaaS Admin Panel**: SEPARATE multi-tenant interface at /saas-admin/ for subscription management, cross-tenant analytics, platform configuration
> 
> 4. **Advanced Financial Management Suite**: Enterprise-grade financial operations
>    - **Quotation System**: Multi-approval workflows with revision tracking and digital signatures
>    - **GST-Compliant Invoicing**: Automated tax calculations, GSTIN validation, multi-jurisdiction support (GST/VAT/HST)
>    - **Payment Collection**: Automated reminder systems with SMS/email integration
>    - **Expense Management**: Multi-category tracking with receipt OCR and approval workflows
> 
> 5. **Communication Automation Center**: Comprehensive messaging and notification system
>    - **SMS Management**: Credit-based system with delivery tracking, automated top-ups, multiple gateway integration
>    - **Email Automation**: SMTP configuration, template management, bounce handling, automated triggers
>    - **Notification System**: Real-time updates throughout job lifecycle with customer preference management

## Core Development Principles

### 1. Production-First Approach
- **NO MOCKUPS**: Every UI component must be fully functional
- **NO PLACEHOLDERS**: All data must be real or realistically generated
- **NO TEMPORARY CODE**: Every line of code must be production-ready
- **ZERO TECHNICAL DEBT**: Address issues immediately, don't defer

### 2. Six Sigma Quality Standards
- Implement automated quality gates at every stage
- Measure and report all quality metrics continuously
- Maintain defect rates below 3.4 DPMO
- Conduct root cause analysis for any quality issues
- Document all quality improvements and lessons learned

### 3. Automation Requirements
- **Scaffolding**: Use automated tools for project structure creation
- **Testing**: Implement comprehensive automated testing (unit, integration, e2e)
- **Compliance**: Automate legal and regulatory compliance checks
- **Documentation**: Auto-generate documentation from code and comments
- **CI/CD**: Fully automated build, test, and deployment pipelines
- **Monitoring**: Automated performance and health monitoring
- **Reporting**: Automated generation of metrics and reports

#### AI-Powered Business Automation
- **Intelligent Job Assignment**: Machine learning algorithms for optimal technician matching
- **Predictive Analytics**: Automated repair time estimation and parts failure prediction
- **Smart Workflow Automation**: Self-optimizing business processes with continuous improvement
- **Quality Prediction**: AI models for risk assessment and defect prevention
- **Dynamic Pricing**: Market-based pricing optimization with demand forecasting
- **Advanced Business Management**: Comprehensive workflow automation for quotations, invoices, and job lifecycle
- **SMS Management Automation**: Intelligent SMS credit management and delivery optimization
- **Expense Management Intelligence**: Automated categorization and budget optimization

### 4. Patent-Worthy Innovation Requirements
- **Proprietary Algorithms**: Develop unique IP for job optimization, quality prediction, and resource allocation
- **Novel User Experience**: Create breakthrough UX patterns that competitors cannot easily replicate
- **Advanced Integration**: Build innovative connections between repair ecosystem components
- **Competitive Differentiation**: Implement features that provide significant market advantages
- **Technical Innovation**: Use cutting-edge technologies in novel ways specific to repair services

### 5. Technology Stack Standards
- Choose technologies based on scalability, maintainability, and community support
- Prefer established, production-proven technologies over bleeding-edge options
- Ensure all dependencies are actively maintained and security-patched
- Document technology choices and rationale
- Plan for technology evolution and migration paths

### 6. Security and Compliance
- Implement security-by-design principles
- Follow OWASP guidelines for web application security
- Ensure GDPR, CCPA, and other privacy regulation compliance
- **GST/VAT Compliance**: Automated tax calculations, invoice generation, and regulatory filing
- **Multi-jurisdiction Tax Support**: Comprehensive tax compliance for GST, VAT, HST, and Sales Tax
- Implement proper data encryption at rest and in transit
- Regular security audits and penetration testing
- Automated vulnerability scanning in CI/CD pipeline

### 7. Code Quality Standards
- Follow established coding conventions for each language
- Maintain minimum 90% code coverage
- Use static analysis tools and linters
- Implement automated code review processes
- Document all public APIs and complex business logic
- Regular refactoring to maintain code quality

### 8. Multi-Role Architecture Requirements
- **Customer Interface**: Professional self-service portal with advanced functionality
  - Device QR code check-in with photo documentation and instant receipt generation
  - Real-time job status tracking with 12-state workflow visibility and progress animations
  - Digital signature capture for quotes and completion approvals with legal compliance
  - Direct technician communication through in-app messaging with file attachments
  - Payment processing with receipt generation, history, and automated reminders
  - Service history timeline with photos, documents, and warranty information
- **Technician Dashboard**: Mobile-first field operations with enterprise capabilities
  - Field-optimized job assignment with GPS routing and traffic optimization
  - Offline mode for poor connectivity areas with data synchronization
  - Photo capture and documentation at each workflow stage with timestamp and GPS
  - Digital forms for customer signatures and approvals with legal compliance
  - Parts inventory management with barcode scanning and automated ordering
  - Time tracking with automatic labor cost calculation and overtime management
  - Route optimization with multiple job handling and customer notifications
- **Admin Business Management**: Comprehensive enterprise dashboard with advanced analytics
  - 20+ business setting categories with visual configuration interface and real-time preview
  - Workflow designer with drag-and-drop business rule creation and conditional logic
  - Real-time KPI dashboards with Six Sigma quality metrics and performance indicators
  - Employee management with role-based permissions and performance tracking
  - Financial reporting with tax compliance, GST/VAT calculations, and profit analysis
  - Customer relationship management with segmentation and communication history
  - Inventory management with automated reordering and supplier integration
- **SaaS Admin Panel**: Multi-tenant management platform (COMPLETELY SEPARATE from customer interfaces)
  - Dedicated admin interface at /saas-admin/ route (NOT /customer/admin/ or any customer path)
  - Multi-tenant subscription management with billing automation and tier-based features
  - Platform-wide analytics and cross-tenant reporting with business intelligence
  - White-label configuration and branding management for enterprise clients
  - System-wide compliance and security audit tools with automated reporting
  - Performance monitoring across all tenants with resource allocation management
- **Role-Based Security**: Enterprise-grade security with comprehensive audit trails
  - JWT-based authentication with role-specific token claims and automatic refresh
  - Route-level permissions with middleware validation and real-time authorization
  - Audit logging for all sensitive operations with tamper-proof storage
  - Session management with automatic timeout and concurrent session control
  - Multi-factor authentication for sensitive operations and admin access
- **Advanced Business Settings**: 20+ comprehensive business configuration categories
  - **Tax Settings**: Multi-jurisdiction tax configuration (GST/VAT/HST/Sales Tax) with automated calculations
  - **Print Settings & Templates**: Customizable job sheets, invoices, quotations, receipts with brand consistency
  - **Workflow Configuration**: Visual business process designer with conditional logic and automation
  - **Email Settings**: SMTP configuration, automated templates, delivery tracking, bounce handling
  - **SMS Settings**: Credit management, gateway integration, delivery tracking, automated notifications
  - **Employee Management**: Staff onboarding, role assignments, performance tracking, payroll integration
  - **Customer Database**: CRM configuration, profile fields, segmentation, communication preferences
  - **Invoice Settings**: Automated generation, compliance rules, numbering sequences, payment terms
  - **Quotation Settings**: Multi-approval workflows, terms, conversion rules, digital signatures
  - **Payment Settings**: Gateway configuration, collection rules, reminder schedules, refund processing
  - **Address/Location Settings**: Service areas, territory management, geo-restrictions, travel calculations
  - **Reminder System**: Automated follow-ups, escalation rules, communication schedules, effectiveness tracking
  - **Business Information**: Company profiles, contact details, branding settings, multi-location management
  - **Sequence Settings**: Automated numbering for jobs/quotes/invoices with custom formats and reset schedules
  - **Expense Management**: Category configuration, budget controls, approval workflows, OCR settings
  - **Parts Inventory Settings**: Stock management, supplier integration, reorder automation, barcode systems
  - **Outsourcing Settings**: External provider network, commission rates, performance metrics, quality standards
  - **Quality Settings**: Six Sigma checkpoints, quality standards, audit configurations, training requirements
  - **Security Settings**: Access controls, audit trails, compliance configurations, password policies
  - **Integration Settings**: Third-party APIs, marketplace connections, data synchronization, webhook management
- **Document Management System**: Professional template system with advanced capabilities
  - Template designer with drag-and-drop components and real-time preview
  - Dynamic content insertion with business data and conditional logic
  - Multi-format export (PDF, HTML, print-ready, thermal receipt)
  - Digital signature integration with legal compliance and certificate management
  - Version control with approval workflows and automated distribution
- **SMS Management Dashboard**: Enterprise-grade communication system
  - SMS gateway integration with multiple providers and failover support
  - Credit-based billing with automatic top-up alerts and cost optimization
  - Delivery status tracking with failed message retry and escalation
  - Template management for automated notifications with personalization
  - Opt-in/opt-out management with compliance tracking and reporting
- **Expense Management Interface**: Comprehensive financial tracking system
  - Receipt photo capture with OCR text extraction and automatic categorization
  - Multi-category expense classification with custom categories and rules
  - Budget tracking with overspend alerts and approval requirements
  - Approval workflows for expense reimbursement with multi-level authorization
  - Integration with accounting systems and tax preparation software
- **Outsourcing Marketplace**: External service provider network with performance management
  - Provider onboarding with verification workflows and skill assessments
  - Commission-based payment calculation with automated payouts
  - Performance metrics and rating system with customer feedback integration
  - Service area mapping and capacity planning with demand forecasting
  - Quality assurance and SLA management with automated monitoring

### 9. Mobile-First Professional Design System
- **Native App Experience**: PWA capabilities with offline functionality for comprehensive field operations
- **Responsive Excellence**: Flawless experience across all devices with consistent branding and professional aesthetics
- **Accessibility Leadership**: WCAG 2.1 AAA compliance with screen reader optimization and keyboard navigation
- **Performance Optimization**: < 2s load times with optimized asset delivery and progressive loading
- **Professional UI/UX**: Advanced animations and interactions using modern frameworks with enterprise-grade design
- **Enterprise Design Standards**: Professional color schemes, typography hierarchy, and component libraries
- **Advanced Visual Design**: Gradient backgrounds, professional shadows, sophisticated animations with hardware acceleration
- **Touch-Optimized Interface**: Mobile-first approach with gesture support and haptic feedback
- **Offline-First Architecture**: Progressive enhancement with data synchronization and conflict resolution

### 10. Testing Strategy
- Unit tests for all business logic (min 95% coverage)
- Integration tests for all API endpoints
- End-to-end tests for all user journeys
- Performance tests for all critical paths
- Security tests for all authentication and authorization
- Accessibility tests for all UI components
- Cross-browser and cross-platform testing
- **Visual regression testing**: Automated UI screenshots at all breakpoints for every major screen
- **Mobile app store compliance testing**: Automated checks for Android/iOS store requirements
- **Screenshot generation**: Auto-generate and attach screenshots to PRs for stakeholder review

### 11. Documentation Requirements
- API documentation with interactive examples
- User documentation with step-by-step guides
- Administrator documentation for system management
- Developer documentation for maintenance and extension
- Architecture documentation with diagrams and decision records
- Deployment and operational runbooks
- **Legal documentation**: Separate terms & conditions for Android/iOS app stores
- **UI/UX changelog**: Document all UI/UX and logic changes with screenshots
- **Brand guidelines**: Unique RepairX logo and icon usage documentation

### 12. Performance Standards
- Page load times under 2 seconds
- API response times under 200ms for 95th percentile
- Mobile app launch time under 3 seconds
- Database query optimization for all endpoints
- CDN implementation for static assets
- Progressive loading and caching strategies

### 13. Monitoring and Observability
- Comprehensive logging for all system events
- Application performance monitoring (APM)
- Real-time error tracking and alerting
- Business metrics tracking and visualization
- User behavior analytics
- Infrastructure monitoring and alerting

### 14. Enterprise SaaS Requirements
- **Multi-Tenant Architecture**: Scalable infrastructure supporting thousands of businesses with enterprise-grade security
  - Database-level tenant isolation with encrypted data and row-level security
  - Tenant-specific configuration and customization with white-label capabilities
  - Resource allocation and usage monitoring per tenant with cost optimization
  - Auto-scaling infrastructure with load balancing and global CDN distribution
- **Subscription Management**: 15-day free trial with comprehensive tier-based feature access and automated billing
  - Automated billing with proration, usage-based pricing, and dunning management
  - Feature gating based on subscription tier with real-time access control
  - Trial-to-paid conversion automation with reminder workflows and analytics
  - Subscription analytics with churn prediction and retention strategies
- **Professional Landing Page**: Enterprise-grade marketing site with comprehensive feature showcase
  - SEO-optimized content with schema markup and performance optimization
  - Interactive feature demonstrations with video tutorials and live demos
  - Pricing calculator with ROI projections and cost comparison tools
  - Customer testimonials and case studies with social proof integration
  - Lead capture forms with automated nurturing campaigns
- **Advanced Business Management**: Comprehensive settings and workflow configuration with enterprise features
  - 20+ business setting categories with visual configuration and real-time preview
  - Workflow designer with conditional logic, automation, and performance analytics
  - Executive dashboards with real-time KPI monitoring and business intelligence
  - Advanced reporting with custom metrics and automated insights
- **Document Management System**: Professional template system with enterprise capabilities
  - Template library with industry-specific options and customization tools
  - Custom branding and logo integration with white-label support
  - Digital signature workflows with legal compliance and audit trails
  - Automated document generation with version control and approval workflows
- **Marketplace Integration**: Third-party service provider network with comprehensive management
  - Provider API integration with performance SLAs and monitoring
  - Automated commission calculation and payout with tax compliance
  - Quality assurance and rating management with customer feedback loops
  - Service capacity planning with demand forecasting and optimization
- **Compliance Framework**: Enterprise-grade compliance with comprehensive audit capabilities
  - SOC 2 Type II, GDPR, CCPA compliance with automated audit trails
  - Automated compliance reporting with real-time monitoring
  - Data retention and deletion policies with automated enforcement
  - Security incident response procedures with escalation workflows
- **Job Sheet Lifecycle**: 12-state workflow management with comprehensive automation
  - **State Definitions with Enhanced Automation**:
    1. **CREATED** - Initial job creation with automated technician assignment and customer notifications
    2. **IN_DIAGNOSIS** - Technician evaluation with photo documentation and time tracking
    3. **AWAITING_APPROVAL** - Customer approval workflow with digital signatures and automated reminders
    4. **APPROVED** - Work authorization with parts ordering and timeline updates
    5. **IN_PROGRESS** - Active repair with real-time updates and progress tracking
    6. **PARTS_ORDERED** - Automated supplier integration with delivery tracking
    7. **TESTING** - Quality validation with automated test protocols
    8. **QUALITY_CHECK** - Six Sigma quality checkpoint with documentation requirements
    9. **COMPLETED** - Automated completion workflow with customer notifications
    10. **CUSTOMER_APPROVED** - Final approval with satisfaction surveys and feedback collection
    11. **DELIVERED** - Delivery confirmation with warranty documentation and follow-up scheduling
    12. **CANCELLED** - Cancellation workflow with refund processing and inventory management
  - **Advanced Automation**: AI-powered state transitions, predictive analytics, and optimization algorithms
- **Quotation System**: Professional multi-approval workflow with comprehensive revision management
  - Multi-level approval based on quote amount, complexity, and risk assessment
  - Comprehensive revision history with change tracking, notifications, and analytics
  - Digital signature capture with legal compliance and certificate management
  - One-click conversion from quote to job sheet with automated workflow triggers
- **Invoice Management**: Enterprise-grade GST-compliant automated invoice system
  - Automated tax calculations for GST, VAT, HST, and Sales Tax with real-time rates
  - GSTIN validation and compliance reporting with automated filing
  - Multi-currency support with real-time exchange rates and hedging options
  - Integration with accounting systems and ERP platforms
- **SMS Management System**: Enterprise communication platform with comprehensive features
  - Multi-gateway SMS provider integration with failover and load balancing
  - Credit-based pricing with automatic top-up alerts and cost optimization
  - Delivery status tracking with retry mechanisms and escalation procedures
  - Template-based automated notifications with personalization and A/B testing
- **Expense Management**: Comprehensive financial tracking with advanced automation
  - Receipt OCR with automatic expense categorization using machine learning
  - Multi-level approval workflows with role-based permissions
  - Budget tracking with real-time alerts and predictive analytics
  - Integration with accounting systems and tax preparation software
- **Customer Database**: Advanced CRM with comprehensive relationship management
  - 360-degree customer view with complete service timeline and interaction history
  - Automated customer segmentation and targeting with behavioral analytics
  - Communication history and preference tracking with opt-out management
  - Customer lifetime value calculation with retention analytics
- **Print Management**: Enterprise document management with comprehensive capabilities
  - Professional template library with custom branding and white-label options
  - Automated document generation based on workflow triggers and business rules
  - Multi-format support (PDF, thermal receipt, label printing, mobile printing)
  - Document version control with approval workflows and distribution tracking
- **Business Configuration**: 20+ comprehensive setting categories with enterprise features
  - Visual configuration interface with real-time preview and validation
  - Settings validation and conflict resolution with automated recommendations
  - Backup and restore functionality for configurations with version history
  - Multi-environment support (development, staging, production) with automated deployment

## Implementation Workflow

### For Each Feature/Component:
1. **Design Phase**
   - Create technical design document
   - Review with stakeholders
   - Update roadmap with specific tasks
   - Generate UI mockups with RepairX branding

2. **Development Phase**
   - Write tests first (TDD approach)
   - Implement production-ready code
   - Use shared business logic between web and mobile
   - Generate unique RepairX logo and icon assets as needed
   - Conduct code review
   - Run automated quality checks

3. **Testing Phase**
   - Execute comprehensive test suite
   - Perform manual testing
   - Conduct security testing
   - Validate compliance requirements
   - **Generate automated screenshots for all breakpoints**
   - **Run visual regression tests**

4. **Documentation Phase**
   - Update technical documentation
   - Create/update user documentation
   - Document any configuration changes
   - Update deployment procedures
   - **Attach screenshots to PRs for stakeholder review**

5. **Deployment Phase**
   - Deploy to staging environment
   - Run full test suite in staging
   - Conduct user acceptance testing
   - Deploy to production with rollback plan
   - **Verify mobile app store compliance if applicable**

6. **Monitoring Phase**
   - Monitor system performance
   - Track business metrics
   - Collect user feedback
   - Document lessons learned

## Quality Gates
- All automated tests must pass (100%)
- Code coverage must meet minimum thresholds
- Security scans must show no high/critical issues
- Performance benchmarks must be met
- Accessibility standards must be satisfied (WCAG 2.1 AA)
- Legal and compliance checks must pass

## Escalation Procedures
- Technical blockers: Escalate to lead developer within 2 hours
- Compliance issues: Escalate to legal team immediately
- Security concerns: Escalate to security team immediately
- Performance issues: Escalate to architecture team within 4 hours
- User experience concerns: Escalate to UX team within 1 day

## Continuous Improvement
- Weekly retrospectives to identify improvement opportunities
- Monthly architecture reviews
- Quarterly security assessments
- Annual technology stack reviews
- Continuous monitoring of industry best practices