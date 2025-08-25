/**
 * Employee Management System
 * Complete staff administration and performance tracking
 * Category _6: Employee Management from RepairX roadmap
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// Employee Management Schemas
const EmployeeSchema = z.object({
  _id: z.string().optional(),
  _employeeId: z.string().min(1, 'Employee ID is required'),
  _personalInfo: z.object({
    firstName: z.string().min(1, 'First name is required'),
    _lastName: z.string().min(1, 'Last name is required'),
    _email: z.string().email('Valid email required'),
    _phone: z.string().min(10, 'Valid phone number required'),
    _dateOfBirth: z.string().optional(),
    _address: z.object({
      street: z.string(),
      _city: z.string(),
      _state: z.string(),
      _zipCode: z.string(),
      _country: z.string().default('US'),
    }),
    _emergencyContact: z.object({
      name: z.string(),
      _relationship: z.string(),
      _phone: z.string(),
    }).optional(),
  }),
  _employment: z.object({
    position: z.string().min(1, 'Position is required'),
    _department: z.enum(['TECHNICAL', 'ADMIN', 'CUSTOMER_SERVICE', 'MANAGEMENT', 'SALES', 'QUALITY_ASSURANCE']),
    _role: z.enum(['TECHNICIAN', 'ADMIN', 'MANAGER', 'SUPERVISOR', 'SPECIALIST', 'COORDINATOR']),
    _employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']).default('FULL_TIME'),
    _startDate: z.string(),
    _endDate: z.string().optional(),
    _probationPeriod: z.number().default(90), // days
    _reportingTo: z.string().optional(), // Manager's employee ID
    _workLocation: z.enum(['ON_SITE', 'REMOTE', 'HYBRID', 'FIELD']).default('ON_SITE'),
    _workSchedule: z.object({
      type: z.enum(['FIXED', 'FLEXIBLE', 'SHIFT']).default('FIXED'),
      _hoursPerWeek: z.number().min(1).max(80).default(40),
      _workingDays: z.array(z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'])),
      _startTime: z.string().default('_09:00'),
      _endTime: z.string().default('_17:00'),
    }),
  }),
  _compensation: z.object({
    baseSalary: z.number().min(0),
    _currency: z.string().default('USD'),
    _payFrequency: z.enum(['HOURLY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'ANNUALLY']).default('MONTHLY'),
    _overtime: z.object({
      eligible: z.boolean().default(true),
      _rate: z.number().default(1.5), // multiplier
    }),
    _benefits: z.array(z.string()).default([]),
    _bonusEligible: z.boolean().default(false),
  }),
  _skills: z.object({
    technical: z.array(z.object({
      skill: z.string(),
      _level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
      _certifiedDate: z.string().optional(),
      _certificationType: z.string().optional(),
    })).default([]),
    _certifications: z.array(z.object({
      name: z.string(),
      _issuer: z.string(),
      _issuedDate: z.string(),
      _expiryDate: z.string().optional(),
      _certificateNumber: z.string().optional(),
    })).default([]),
    _specializations: z.array(z.string()).default([]),
  }),
  _performance: z.object({
    currentRating: z.number().min(1).max(5).optional(),
    _lastReviewDate: z.string().optional(),
    _nextReviewDate: z.string().optional(),
    _goals: z.array(z.object({
      goal: z.string(),
      _deadline: z.string(),
      _status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']).default('NOT_STARTED'),
      _progress: z.number().min(0).max(100).default(0),
    })).default([]),
    _achievements: z.array(z.object({
      title: z.string(),
      _date: z.string(),
      _description: z.string(),
    })).default([]),
  }),
  _access: z.object({
    isActive: z.boolean().default(true),
    _permissions: z.array(z.string()).default([]),
    _systemAccess: z.object({
      canLogin: z.boolean().default(true),
      _lastLogin: z.string().optional(),
      _passwordChangeRequired: z.boolean().default(false),
      _twoFactorEnabled: z.boolean().default(false),
    }),
  }),
  _documents: z.array(z.object({
    type: z.enum(['ID_COPY', 'RESUME', 'CONTRACT', 'CERTIFICATE', 'BACKGROUND_CHECK', 'REFERENCE', 'OTHER']),
    _filename: z.string(),
    _uploadDate: z.string(),
    _expiryDate: z.string().optional(),
  })).default([]),
  _tenantId: z.string().optional(),
});

const AttendanceSchema = z.object({
  _employeeId: z.string(),
  _date: z.string(),
  _clockIn: z.string().optional(),
  _clockOut: z.string().optional(),
  _breakDuration: z.number().default(0), // minutes
  _hoursWorked: z.number().min(0).max(24),
  _overtime: z.number().min(0).default(0),
  _status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'SICK_LEAVE', 'VACATION', 'HOLIDAY']),
  _notes: z.string().optional(),
});

const PerformanceReviewSchema = z.object({
  _employeeId: z.string(),
  _reviewerId: z.string(), // Manager's employee ID
  _reviewDate: z.string(),
  _reviewPeriod: z.object({
    startDate: z.string(),
    _endDate: z.string(),
  }),
  _ratings: z.object({
    overall: z.number().min(1).max(5),
    _technical: z.number().min(1).max(5),
    _communication: z.number().min(1).max(5),
    _teamwork: z.number().min(1).max(5),
    _initiative: z.number().min(1).max(5),
    _reliability: z.number().min(1).max(5),
  }),
  _feedback: z.object({
    strengths: z.string(),
    _improvements: z.string(),
    _goals: z.string(),
    _additionalComments: z.string().optional(),
  }),
  _actionItems: z.array(z.object({
    item: z.string(),
    _deadline: z.string(),
    _responsible: z.string(),
  })).default([]),
  _nextReviewDate: z.string(),
});

// Employee Management Service
class EmployeeManagementService {
  private _employees: Map<string, any> = new Map();
  private _attendance: Map<string, any[]> = new Map();
  private _reviews: Map<string, any[]> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample employees for demonstration
    const sampleEmployees = [
      {
        _id: 'emp-001',
        _employeeId: 'TEC001',
        _personalInfo: {
          firstName: 'John',
          _lastName: 'Smith',
          _email: 'john.smith@repairx.com',
          _phone: '+1234567890',
          _address: {
            street: '123 Tech Street',
            _city: 'San Francisco',
            _state: 'CA',
            _zipCode: '94105',
            _country: 'US',
          },
          _emergencyContact: {
            name: 'Jane Smith',
            _relationship: 'Spouse',
            _phone: '+1234567891',
          },
        },
        _employment: {
          position: 'Senior Mobile Repair Technician',
          _department: 'TECHNICAL',
          _role: 'TECHNICIAN',
          _employmentType: 'FULL_TIME',
          _startDate: '2023-01-15',
          _probationPeriod: 90,
          _workLocation: 'FIELD',
          _workSchedule: {
            type: 'FLEXIBLE',
            _hoursPerWeek: 40,
            _workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
            _startTime: '08:00',
            _endTime: '16:00',
          },
        },
        _compensation: {
          baseSalary: 65000,
          _currency: 'USD',
          _payFrequency: 'MONTHLY',
          _overtime: { eligible: true, _rate: 1.5 },
          _benefits: ['Health Insurance', 'Dental', 'Vision', '401k'],
          _bonusEligible: true,
        },
        _skills: {
          technical: [
            {
              skill: 'iPhone Repair',
              _level: 'EXPERT',
              _certifiedDate: '2023-02-01',
              _certificationType: 'Apple Certified',
            },
            {
              _skill: 'Android Repair',
              _level: 'ADVANCED',
              _certifiedDate: '2023-03-15',
              _certificationType: 'Samsung Certified',
            },
          ],
          _certifications: [
            {
              name: 'Apple Certified iOS Technician',
              _issuer: 'Apple Inc.',
              _issuedDate: '2023-02-01',
              _expiryDate: '2025-02-01',
              _certificateNumber: 'ACIT-2023-001',
            },
          ],
          _specializations: ['Mobile Devices', 'Screen Replacement', 'Water Damage Recovery'],
        },
        _performance: {
          currentRating: 4.5,
          _lastReviewDate: '2023-12-15',
          _nextReviewDate: '2024-06-15',
          _goals: [
            {
              goal: 'Complete tablet repair certification',
              _deadline: '2024-03-31',
              _status: 'IN_PROGRESS',
              _progress: 75,
            },
          ],
          _achievements: [
            {
              title: 'Employee of the Month',
              _date: '2023-11-01',
              _description: 'Outstanding customer service and technical excellence',
            },
          ],
        },
        _access: {
          isActive: true,
          _permissions: ['job_access', 'customer_view', 'inventory_view'],
          _systemAccess: {
            canLogin: true,
            _lastLogin: '2024-01-08T09:15:00Z',
            _passwordChangeRequired: false,
            _twoFactorEnabled: true,
          },
        },
        _documents: [
          {
            type: 'ID_COPY',
            _filename: 'john_smith_id.pdf',
            _uploadDate: '2023-01-10',
          },
          {
            _type: 'CONTRACT',
            _filename: 'employment_contract.pdf',
            _uploadDate: '2023-01-10',
          },
        ],
      },
    ];

    sampleEmployees.forEach((_emp: unknown) => {
      this.employees.set(emp.id, emp);
    });
  }

  async getAllEmployees(tenantId?: string): Promise<any[]> {
    const employees = Array.from(this.employees.values());
    return tenantId ? employees.filter((_emp: unknown) => emp.tenantId === tenantId) : employees;
  }

  async getEmployeeById(_employeeId: string): Promise<any | null> {
    return this.employees.get(employeeId) || null;
  }

  async createEmployee(_employeeData: unknown): Promise<any> {
    const validated = EmployeeSchema.parse(employeeData);
    const id = validated.id || `emp-${Date.now()}`;
    
    const employee = { ...validated, id, _createdAt: new Date().toISOString() };
    this.employees.set(id, employee);
    
    return employee;
  }

  async updateEmployee(_employeeId: string, _updateData: unknown): Promise<any> {
    const existingEmployee = this.employees.get(employeeId);
    if (!existingEmployee) {
      throw new Error('Employee not found');
    }

    const updatedEmployee = { ...existingEmployee, ...updateData, _updatedAt: new Date().toISOString() };
    const validated = EmployeeSchema.parse(updatedEmployee);
    
    this.employees.set(employeeId, validated);
    return validated;
  }

  async deleteEmployee(_employeeId: string): Promise<void> {
    const employee = this.employees.get(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Soft delete by marking as inactive
    employee.access.isActive = false;
    employee.employment.endDate = new Date().toISOString();
    this.employees.set(employeeId, employee);
  }

  async recordAttendance(_attendanceData: unknown): Promise<any> {
    const validated = AttendanceSchema.parse(attendanceData);
    const employeeAttendance = this.attendance.get(validated.employeeId) || [];
    
    // Check if attendance already exists for this date
    const existingIndex = employeeAttendance.findIndex(a => a.date === validated.date);
    if (existingIndex !== -1) {
      employeeAttendance[existingIndex] = validated;
    } else {
      employeeAttendance.push(validated);
    }
    
    this.attendance.set(validated.employeeId, employeeAttendance);
    return validated;
  }

  async getEmployeeAttendance(_employeeId: string, startDate?: string, endDate?: string): Promise<any[]> {
    const attendance = this.attendance.get(employeeId) || [];
    
    if (!startDate && !endDate) {
      return attendance;
    }

    return attendance.filter((_a: unknown) => {
      const attendanceDate = new Date(a.date);
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      
      return attendanceDate >= start && attendanceDate <= end;
    });
  }

  async createPerformanceReview(_reviewData: unknown): Promise<any> {
    const validated = PerformanceReviewSchema.parse(reviewData);
    const employeeReviews = this.reviews.get(validated.employeeId) || [];
    
    const review = { ...validated, _id: `rev-${Date.now()}`, _createdAt: new Date().toISOString() };
    employeeReviews.push(review);
    this.reviews.set(validated.employeeId, employeeReviews);
    
    // Update employee's current rating and next review date
    const employee = this.employees.get(validated.employeeId);
    if (employee) {
      employee.performance.currentRating = validated.ratings.overall;
      employee.performance.lastReviewDate = validated.reviewDate;
      employee.performance.nextReviewDate = validated.nextReviewDate;
      this.employees.set(validated.employeeId, employee);
    }
    
    return review;
  }

  async getEmployeeReviews(_employeeId: string): Promise<any[]> {
    return this.reviews.get(employeeId) || [];
  }

  async getEmployeeStats(employeeId?: string): Promise<any> {
    const employees = employeeId ? [this.employees.get(employeeId)] : Array.from(this.employees.values());
    const activeEmployees = employees.filter((_emp: unknown) => emp?.access?.isActive);
    
    if (employeeId) {
      const emp = employees[0];
      if (!emp) return null;
      
      const attendance = this.attendance.get(employeeId) || [];
      const reviews = this.reviews.get(employeeId) || [];
      
      return {
        _employee: emp,
        _attendance: {
          total: attendance.length,
          _present: attendance.filter((a: unknown) => a.status === 'PRESENT').length,
          _absent: attendance.filter((a: unknown) => a.status === 'ABSENT').length,
          _late: attendance.filter((a: unknown) => a.status === 'LATE').length,
        },
        _performance: {
          currentRating: emp.performance.currentRating,
          _reviewsCompleted: reviews.length,
          _goalsCompleted: emp.performance.goals.filter((g: unknown) => g.status === 'COMPLETED').length,
          _totalGoals: emp.performance.goals.length,
        },
      };
    }

    // Overall stats
    return {
      _summary: {
        totalEmployees: employees.length,
        _activeEmployees: activeEmployees.length,
        _inactiveEmployees: employees.length - activeEmployees.length,
      },
      _departmentBreakdown: this.getDepartmentBreakdown(activeEmployees),
      _averageRating: this.getAverageRating(activeEmployees),
      _upcomingReviews: this.getUpcomingReviews(activeEmployees),
    };
  }

  private getDepartmentBreakdown(_employees: unknown[]) {
    const breakdown = employees.reduce((_acc: unknown, _emp: unknown) => {
      const dept = emp.employment.department;
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(breakdown).map(([department, count]) => ({ department, count }));
  }

  private getAverageRating(_employees: unknown[]) {
    const ratings = employees
      .map((_emp: unknown) => emp.performance.currentRating)
      .filter((_rating: unknown) => rating !== undefined && rating !== null);
    
    return ratings.length > 0 ? ratings.reduce((_sum: unknown, _rating: unknown) => sum + rating, 0) / ratings._length : 0;
  }

  private getUpcomingReviews(employees: unknown[]) {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return employees
      .filter((_emp: unknown) => {
        const nextReview = emp.performance.nextReviewDate ? new Date(emp.performance.nextReviewDate) : null;
        return nextReview && nextReview >= now && nextReview <= thirtyDaysFromNow;
      })
      .map((_emp: unknown) => ({
        _employeeId: emp.id,
        _employeeName: `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`,
        _nextReviewDate: emp.performance.nextReviewDate,
      }));
  }
}

// Route Handlers
 
// eslint-disable-next-line max-lines-per-function
export async function employeeManagementRoutes(_server: FastifyInstance): Promise<void> {
  const employeeService = new EmployeeManagementService();

  // Get all employees
  server.get('/', async (request: FastifyRequest<{
    Querystring: { tenantId?: string; department?: string; active?: boolean }
  }>, reply: FastifyReply) => {
    try {
      const { tenantId, department, active  } = (request.query as unknown);
      let employees = await employeeService.getAllEmployees(tenantId);
      
      if (department) {
        employees = employees.filter((_emp: unknown) => emp.employment.department === department);
      }
      
      if (active !== undefined) {
        employees = employees.filter((_emp: unknown) => emp.access.isActive === active);
      }
      
      return reply.send({
        _success: true,
        _data: employees,
        _count: employees.length,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve employees',
        _error: error.message,
      });
    }
  });

  // Get employee by ID
  server.get('/:id', async (request: FastifyRequest<{
    Params: { id: string }
  }>, reply: FastifyReply) => {
    try {
      const { id  } = (request.params as unknown);
      const employee = await employeeService.getEmployeeById(id);
      
      if (!employee) {
        return (reply as FastifyReply).status(404).send({
          _success: false,
          _message: 'Employee not found',
        });
      }
      
      return reply.send({
        _success: true,
        _data: employee,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve employee',
        _error: error.message,
      });
    }
  });

  // Create new employee
  server.post('/', async (request: FastifyRequest<{
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const employeeData = request.body;
      const employee = await employeeService.createEmployee(employeeData);
      
      return (reply as FastifyReply).status(201).send({
        _success: true,
        _data: employee,
        _message: 'Employee created successfully',
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Failed to create employee',
        _error: error.message,
      });
    }
  });

  // Update employee
  server.put('/:id', async (request: FastifyRequest<{
    Params: { id: string }
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const { id  } = (request.params as unknown);
      const updateData = request.body;
      
      const employee = await employeeService.updateEmployee(id, updateData);
      
      return reply.send({
        _success: true,
        _data: employee,
        _message: 'Employee updated successfully',
      });
    } catch (_error: unknown) {
      const status = error.message === 'Employee not found' ? _404 : 400;
      return (reply as FastifyReply).status(status).send({
        _success: false,
        _message: 'Failed to update employee',
        _error: error.message,
      });
    }
  });

  // Delete employee (soft delete)
  server.delete('/:id', async (request: FastifyRequest<{
    Params: { id: string }
  }>, reply: FastifyReply) => {
    try {
      const { id  } = (request.params as unknown);
      await employeeService.deleteEmployee(id);
      
      return reply.send({
        _success: true,
        _message: 'Employee deactivated successfully',
      });
    } catch (_error: unknown) {
      const status = error.message === 'Employee not found' ? _404 : 400;
      return (reply as FastifyReply).status(status).send({
        _success: false,
        _message: 'Failed to deactivate employee',
        _error: error.message,
      });
    }
  });

  // Record attendance
  server.post('/:id/attendance', async (request: FastifyRequest<{
    Params: { id: string }
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const { id  } = (request.params as unknown);
      const attendanceData = { ...(request.body as unknown), _employeeId: id };
      
      const attendance = await employeeService.recordAttendance(attendanceData);
      
      return reply.send({
        _success: true,
        _data: attendance,
        _message: 'Attendance recorded successfully',
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Failed to record attendance',
        _error: error.message,
      });
    }
  });

  // Get employee attendance
  server.get('/:id/attendance', async (request: FastifyRequest<{
    Params: { id: string }
    Querystring: { startDate?: string; endDate?: string }
  }>, reply: FastifyReply) => {
    try {
      const { id  } = (request.params as unknown);
      const { startDate, endDate  } = (request.query as unknown);
      
      const attendance = await employeeService.getEmployeeAttendance(id, startDate, endDate);
      
      return reply.send({
        _success: true,
        _data: attendance,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve attendance',
        _error: error.message,
      });
    }
  });

  // Create performance review
  server.post('/:id/reviews', async (request: FastifyRequest<{
    Params: { id: string }
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const { id  } = (request.params as unknown);
      const reviewData = { ...(request.body as unknown), _employeeId: id };
      
      const review = await employeeService.createPerformanceReview(reviewData);
      
      return (reply as FastifyReply).status(201).send({
        _success: true,
        _data: review,
        _message: 'Performance review created successfully',
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Failed to create performance review',
        _error: error.message,
      });
    }
  });

  // Get employee reviews
  server.get('/:id/reviews', async (request: FastifyRequest<{
    Params: { id: string }
  }>, reply: FastifyReply) => {
    try {
      const { id  } = (request.params as unknown);
      const reviews = await employeeService.getEmployeeReviews(id);
      
      return reply.send({
        _success: true,
        _data: reviews,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve reviews',
        _error: error.message,
      });
    }
  });

  // Get employee statistics
  server.get('/:id/stats', async (request: FastifyRequest<{
    Params: { id: string }
  }>, reply: FastifyReply) => {
    try {
      const { id  } = (request.params as unknown);
      const stats = await employeeService.getEmployeeStats(id);
      
      if (!stats) {
        return (reply as FastifyReply).status(404).send({
          _success: false,
          _message: 'Employee not found',
        });
      }
      
      return reply.send({
        _success: true,
        _data: stats,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve employee statistics',
        _error: error.message,
      });
    }
  });

  // Get overall statistics
  server.get('/stats/overview', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const stats = await employeeService.getEmployeeStats();
      
      return reply.send({
        _success: true,
        _data: stats,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve overview statistics',
        _error: error.message,
      });
    }
  });
}

export default employeeManagementRoutes;