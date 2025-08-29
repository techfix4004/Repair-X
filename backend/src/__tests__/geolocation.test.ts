 
/// <reference types="jest" />
 
/// <reference types="jest" />
import { describe, test, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

import fastify, { FastifyInstance } from 'fastify';
import { geolocationRoutes } from '../routes/geolocation';

 
// eslint-disable-next-line max-lines-per-function
describe('Geolocation Service', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = fastify();
    await app.register(geolocationRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('should reverse geocode coordinates', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/reverse-geocode',
      payload: {
        latitude: 37.7749,
        _longitude: -122.4194
      }
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.payload);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('address');
    expect(data.data).toHaveProperty('city');
    expect(data.data).toHaveProperty('coordinates');
  });

  test('should check service area availability', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/check-service-area',
      payload: {
        latitude: 37.7749,
        _longitude: -122.4194,
        _radiusKm: 50
      }
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.payload);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('isServiceable');
    expect(data.data).toHaveProperty('serviceAreas');
  });

  test('should find nearby technicians', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/nearby-technicians',
      payload: {
        latitude: 37.7749,
        _longitude: -122.4194,
        _radiusKm: 25
      }
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.payload);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('technicians');
    expect(Array.isArray(data.data.technicians)).toBe(true);
  });

  test('should calculate travel time between coordinates', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/travel-time',
      payload: {
        origin: { latitude: 37.7749, _longitude: -122.4194 },
        _destination: { latitude: 37.7849, _longitude: -122.4094 },
        _mode: 'driving'
      }
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.payload);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('distanceKm');
    expect(data.data).toHaveProperty('estimatedTravelTimeMinutes');
    expect(data.data?.mode).toBe('driving');
  });

  test('should return error for invalid coordinates', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/reverse-geocode',
      payload: {
        latitude: null,
        _longitude: -122.4194
      }
    });

    expect(response.statusCode).toBe(400);
    const data = JSON.parse(response.payload);
    expect(data.error).toContain('required');
  });
});