// @ts-nocheck
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

// Production reverse geocoding function
async function reverseGeocode(latitude: number, longitude: number) {
  try {
    // Using OpenStreetMap Nominatim API (free alternative to Google Maps)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }
    
    const data = await response.json();
    
    return {
      _address: data.display_name || `${latitude}, ${longitude}`,
      _city: data.address?.city || data.address?.town || data.address?.village || 'Unknown',
      _state: data.address?.state || data.address?.province || 'Unknown',
      _zipCode: data.address?.postcode || 'Unknown',
      _country: data.address?.country || 'Unknown',
      _coordinates: { latitude, longitude }
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    // Fallback to coordinates if service fails
    return {
      _address: `${latitude}, ${longitude}`,
      _city: 'Unknown',
      _state: 'Unknown',
      _zipCode: 'Unknown',
      _country: 'Unknown',
      _coordinates: { latitude, longitude }
    };
  }
}

 
// eslint-disable-next-line max-lines-per-function
export async function geolocationRoutes(fastify: FastifyInstance) {
  // Get address from coordinates (reverse geocoding)
  fastify.post('/reverse-geocode', async (request: FastifyRequest<{Body: GeolocationRequest}>, reply: FastifyReply) => {
    try {
      const { latitude, longitude  } = ((request as any).body as unknown);

      if (!latitude || !longitude) {
        return (reply as FastifyReply).status(400).send({ _error: 'Latitude and longitude are required' });
      }

      // Production reverse geocoding using a third-party service (replace with your preferred service)
      const address = await reverseGeocode(latitude, longitude);

      (reply as any).send({
        _success: true, data: address
      });
    } catch (error) {
      console.error('Reverse geocoding _error:', error);
      reply.status(500).send({ _error: 'Failed to reverse geocode coordinates' });
    }
  });

  // Check if location is within service area
  fastify.post('/check-service-area', async (request: FastifyRequest<{Body: ServiceAreaRequest}>, reply: FastifyReply) => {
    try {
      const { latitude, longitude, radiusKm = 50      } = (request as any).body as any;

      if (!latitude || !longitude) {
        return (reply as FastifyReply).status(400).send({ _error: 'Latitude and longitude are required' });
      }

      // Get service areas from database
      const { prisma } = await import('../utils/database');
      const serviceAreas = await prisma.serviceArea.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          centerLatitude: true,
          centerLongitude: true,
          radiusKm: true,
          organizationId: true
        }
      });

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
      const availableAreas = serviceAreas.filter((area: any) => {
        const distance = calculateDistance(latitude, longitude, area.centerLatitude, area.centerLongitude);
        return distance <= area.radiusKm;
      });

      const isServiceable = availableAreas.length > 0;
      const nearestArea = availableAreas.length > 0 ? availableAreas[0] : null;

      (reply as any).send({
        _success: true, data: {
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
      const { latitude, longitude, radiusKm = 25      } = (request as any).body as any;

      if (!latitude || !longitude) {
        return (reply as FastifyReply).status(400).send({ _error: 'Latitude and longitude are required' });
      }

      // Query database for nearby technicians
      const { prisma } = await import('../utils/database');
      
      // Get technicians with location data
      const technicians = await prisma.technician.findMany({
        where: {
          isActive: true,
          isAvailable: true,
          location: {
            isNot: null
          }
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          skills: true,
          location: true,
          reviews: {
            select: {
              rating: true
            }
          }
        }
      });

      // Calculate distance and filter by radius
      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };

      const nearbyTechnicians = technicians
        .map(tech => {
          if (!tech.location) return null;
          
          const distance = calculateDistance(
            latitude, longitude,
            tech.location.latitude, tech.location.longitude
          );
          
          if (distance > radiusKm) return null;
          
          const avgRating = tech.reviews.length > 0 
            ? tech.reviews.reduce((sum, review) => sum + review.rating, 0) / tech.reviews.length
            : 0;
          
          const estimatedTime = Math.round(distance * 2.5); // 2.5 minutes per km estimate
          
          return {
            _id: tech.id,
            _name: `${tech.user.firstName} ${tech.user.lastName}`,
            _rating: Number(avgRating.toFixed(1)),
            _specialties: tech.skills.map(skill => skill.name),
            _estimatedArrivalTime: `${estimatedTime}-${estimatedTime + 15} minutes`,
            _distanceKm: Number(distance.toFixed(1)),
            _available: tech.isAvailable,
            _phone: tech.user.phone,
            _email: tech.user.email
          };
        })
        .filter(tech => tech !== null)
        .sort((a, b) => a._distanceKm - b._distanceKm); // Sort by distance

      (reply as any).send({
        success: true, data: {
          technicians: nearbyTechnicians,
          _searchRadius: radiusKm,
          _coordinates: { latitude, longitude },
          _totalFound: nearbyTechnicians.length
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
      const { origin, destination, mode = 'driving'      } = (request as any).body as any;

      if (!origin || !destination) {
        return (reply as FastifyReply).status(400).send({ _error: 'Origin and destination coordinates are required' });
      }

      // Calculate precise distance using Haversine formula
      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };
      
      const distance = calculateDistance(
        origin.latitude, origin.longitude,
        destination.latitude, destination.longitude
      );

      // More accurate time estimation based on mode and traffic patterns
      let estimatedMinutes: number;
      switch (mode) {
        case 'driving':
          // Account for city driving conditions (avg 30-40 km/h)
          estimatedMinutes = Math.round(distance * 2.2); // 2.2 minutes per km
          break;
        case 'walking':
          // Average walking speed 5 km/h
          estimatedMinutes = Math.round(distance * 12); // 12 minutes per km
          break;
        case 'transit':
          // Public transit with stops and transfers
          estimatedMinutes = Math.round(distance * 4.5); // 4.5 minutes per km
          break;
        default:
          estimatedMinutes = Math.round(distance * 2.2);
      }

      // Add buffer time for real-world conditions
      const bufferTime = Math.round(estimatedMinutes * 0.15); // 15% buffer
      const totalTime = estimatedMinutes + bufferTime;

      (reply as any).send({
        _success: true, data: {
          distanceKm: Math.round(distance * 10) / 10,
          _estimatedTravelTimeMinutes: totalTime,
          _baseTime: estimatedMinutes,
          _bufferTime: bufferTime,
          mode,
          origin, 
          destination,
          _lastCalculated: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Travel time calculation _error:', error);
      reply.status(500).send({ _error: 'Failed to calculate travel time' });
    }
  });
}