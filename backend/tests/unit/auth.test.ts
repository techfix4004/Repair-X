import { build } from '../helpers/build';

describe('Authentication Routes', () => {
  let app: unknown;

  beforeAll(async () => {
    app = await build();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new customer successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CUSTOMER',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: userData,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('User registered successfully');
      expect(body.(user as any).email).toBe((userData as any).email);
      expect(body.token).toBeDefined();
    });

    it('should return validation error for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: userData,
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: loginData,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Login successful');
      expect(body.token).toBeDefined();
    });
  });
});