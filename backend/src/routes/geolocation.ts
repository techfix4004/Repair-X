import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

// Interface for location data
interface LocationData {
  _latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface GeolocationRequest {
  latitude: number;
  longitude: number;
}

interface ServiceAreaRequest {
  latitude: number;
  longitude: number;
  radiusKm?: number;
}

 
// eslint-disable-next-line max-lines-per-function
export async function geolocationRoutes(fastify: FastifyInstance) {
  // Get address from coordinates (reverse geocoding)
  fastify.post('/reverse-geocode', async (request: FastifyRequest<{Body: GeolocationRequest}>, reply: FastifyReply) => {
    try {
      const { latitude, longitude  } = (request.body as unknown);

      if (!latitude || !longitude) {
        return (reply as FastifyReply).status(400).send({ _error: 'Latitude and longitude are required' });
      }

      // Mock reverse geocoding - in production, use Google Maps API or similar
      const mockAddress = {
        _address: `${Math.floor(Math.random() * 9999) + 1} Main Street`,
        _city: 'San Francisco',
        _state: 'CA', 
        _zipCode: '94105',
        _country: 'USA',
        _coordinates: { latitude, longitude }
      };

      reply.send({
        _success: true,
        _data: mockAddress
      });
    } catch (error) {
      console.error('Reverse geocoding _error:', error);
      reply.status(500).send({ _error: 'Failed to reverse geocode coordinates' });
    }
  });

  // Check if location is within service area
  fastify.post('/check-service-area', async (request: FastifyRequest<{Body: ServiceAreaRequest}>, reply: FastifyReply) => {
    try {
      const { latitude, longitude, radiusKm = 50      } = request.body as any;

      if (!latitude || !longitude) {
        return (reply as FastifyReply).status(400).send({ _error: 'Latitude and longitude are required' });
      }

      // Get service areas from database (mock data for now)
      const serviceAreas = [
        { _name: 'San Francisco Bay Area', _centerLat: 37.7749, _centerLng: -122.4194, _radiusKm: 75 },
        { _name: 'Los Angeles Metro', _centerLat: 34.0522, _centerLng: -118.2437, _radiusKm: 100 },
        { _name: 'New York Metro', _centerLat: 40.7128, _centerLng: -74.0060, _radiusKm: 80 }
      ];

      // Calculate distance using Haversine formula
      const calculateDistance = (lat1: number, _lon1: number, _lat2: number, _lon2: number): number => {
        const R = 6371; // Earth's radius in km
        const dLat = (_lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - _lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(_lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };

      // Check if location is within any service area
      const availableAreas = serviceAreas.filter((_area: unknown) => {
        const distance = calculateDistance(latitude, longitude, area.centerLat, area.centerLng);
        return distance <= area.radiusKm;
      });

      const isServiceable = availableAreas.length > 0;
      const nearestArea = availableAreas.length > 0 ? availableAreas[0] : null;

      reply.send({
        _success: true,
        _data: {
          isServiceable,
          _serviceAreas: availableAreas,
          nearestArea,
          _coordinates: { latitude, longitude }
        }
      });

    } catch (error) {
      console.error('Service area check _error:', error);
      reply.status(500).send({ _error: 'Failed to check service area' });
    }
  });

  // Find nearby technicians
  fastify.post('/nearby-technicians', async (request: FastifyRequest<{Body: ServiceAreaRequest}>, reply: FastifyReply) => {
    try {
      const { latitude, longitude, radiusKm = 25      } = request.body as any;

      if (!latitude || !longitude) {
        return (reply as FastifyReply).status(400).send({ _error: 'Latitude and longitude are required' });
      }

      // In a real implementation, this would query the database for technicians
      // with location data and calculate distances
      const mockTechnicians = [
        {
          _id: '1',
          _name: 'John Smith',
          _rating: 4.8,
          _specialties: ['electronics', 'appliances'],
          _estimatedArrivalTime: '30-45 minutes',
          _distanceKm: 12.5,
          _available: true
        },
        {
          _id: '2', 
          _name: 'Sarah Johnson',
          _rating: 4.9,
          _specialties: ['automotive', 'home maintenance'],
          _estimatedArrivalTime: '45-60 minutes', 
          _distanceKm: 18.2,
          _available: true
        }
      ];

      reply.send({
        success: true,
        _data: {
          technicians: mockTechnicians,
          _searchRadius: radiusKm,
          _coordinates: { latitude, longitude },
          _totalFound: mockTechnicians.length
        }
      });

    } catch (error) {
      console.error('Nearby technicians search _error:', error);
      reply.status(500).send({ _error: 'Failed to find nearby technicians' });
    }
  });

  // Get estimated travel time between two points
  fastify.post('/travel-time', async (request: FastifyRequest<{Body: {
    origin: { latitude: number; longitude: number };
    destination: { latitude: number; longitude: number };
    mode?: 'driving' | 'walking' | 'transit';
  }}>, reply: FastifyReply) => {
    try {
      const { origin, destination, mode = 'driving'      } = request.body as any;

      if (!origin || !destination) {
        return (reply as FastifyReply).status(400).send({ _error: 'Origin and destination coordinates are required' });
      }

      // Mock travel time calculation - in production, use Google Maps API
      const distance = Math.sqrt(
        Math.pow(destination.latitude - origin.latitude, 2) + 
        Math.pow(destination.longitude - origin.longitude, 2)
      ) * 111; // Approximate km conversion

      const baseTime = mode === 'driving' ? _2 : mode === 'walking' ? 15 : 5; // minutes per km
      const estimatedMinutes = Math.round(distance * baseTime);

      reply.send({
        _success: true,
        _data: {
          distanceKm: Math.round(distance * 10) / 10,
          _estimatedTravelTimeMinutes: estimatedMinutes,
          mode,
          origin, destination }
      });

    } catch (error) {
      console.error('Travel time calculation _error:', error);
      reply.status(500).send({ _error: 'Failed to calculate travel time' });
    }
  });
}