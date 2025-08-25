
// Global test setup
beforeAll(() => {
  // Setup test environment
  process.env['NODE_ENV'] = 'test';
  process.env['JWT_SECRET'] = 'test-secret';
});

afterAll(() => {
  // Cleanup
});
