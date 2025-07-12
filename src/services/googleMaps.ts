import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { openRouteService, Coordinates } from './openRouteService';

export interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  price_level?: number;
  photos?: {
    photo_reference: string;
    height: number;
    width: number;
  }[];
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  types: string[];
}

export interface PlaceDetails extends PlaceResult {
  formatted_phone_number?: string;
  website?: string;
  reviews?: {
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }[];
  business_status?: string;
}

export interface RouteInfo {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  steps: {
    distance: { text: string; value: number };
    duration: { text: string; value: number };
    end_location: { lat: number; lng: number };
    html_instructions: string;
    start_location: { lat: number; lng: number };
  }[];
}

class GoogleMapsService {
  constructor() {
    // This service now uses OpenRouteService instead of Google Maps
    // API key is handled by the openRouteService module
  }

  /**
   * Get user's current location
   */
  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Konum İzni Gerekli',
          'Uygulamanın düzgün çalışması için konum izni gereklidir.',
          [{ text: 'Tamam' }]
        );
        return null;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return location;
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Hata', 'Konum alınırken bir hata oluştu.');
      return null;
    }
  }

  /**
   * Search for places using text query
   */
  async searchPlaces(
    query: string,
    location?: { lat: number; lng: number },
    radius: number = 5000
  ): Promise<PlaceResult[]> {
    try {

      const geocodingResponse = await openRouteService.geocodeAddress(query);
      
      // Convert OpenRouteService response to PlaceResult format
      const places: PlaceResult[] = geocodingResponse.features.map((feature, index) => ({
        place_id: feature.properties.gid || `place_${index}`,
        name: feature.properties.name || feature.properties.label,
        formatted_address: feature.properties.label,
        geometry: {
          location: {
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0]
          }
        },
        rating: Math.random() * 2 + 3, // Mock rating between 3-5
        types: [feature.properties.layer || 'establishment']
      }));

      // Filter by radius if location is provided
      if (location) {
        return places.filter(place => {
          const distance = this.calculateDistance(
            location.lat, location.lng,
            place.geometry.location.lat, place.geometry.location.lng
          );
          return distance <= radius;
        });
      }

      return places;
    } catch (error) {
      console.error('Error searching places:', error);
      throw error;
    }
  }

  /**
   * Search for nearby places by type or keyword
   */
  async searchNearbyPlaces(
    location: { lat: number; lng: number },
    typeOrKeyword: string,
    radius: number = 5000
  ): Promise<PlaceResult[]> {
    try {

      const searchLocation: Coordinates = { lat: location.lat, lng: location.lng };
      
      // Use OpenRouteService to find nearby POIs
      const poiResponse = await openRouteService.findNearbyPOIs(searchLocation, typeOrKeyword, radius);
      
      // Convert POI response to PlaceResult format
      const places: PlaceResult[] = poiResponse.features.map((feature, index) => ({
        place_id: feature.properties.id || `poi_${index}`,
        name: feature.properties.name || typeOrKeyword,
        formatted_address: `${feature.geometry.coordinates[1]}, ${feature.geometry.coordinates[0]}`,
        geometry: {
          location: {
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0]
          }
        },
        rating: Math.random() * 2 + 3, // Mock rating between 3-5
        types: [feature.properties.category || typeOrKeyword]
      }));

      return places;
    } catch (error) {
      console.error('Error searching nearby places:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a place
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {

      // For OpenRouteService, we'll return mock detailed data
      // In a real implementation, you might use additional APIs for place details
      const mockDetails: PlaceDetails = {
        place_id: placeId,
        name: 'Detaylı Yer Bilgisi',
        formatted_address: 'Adres bilgisi mevcut değil',
        geometry: {
          location: {
            lat: 41.0082,
            lng: 28.9784
          }
        },
        rating: Math.random() * 2 + 3,
        types: ['establishment'],
        formatted_phone_number: '+90 XXX XXX XX XX',
        website: 'https://example.com',
        business_status: 'OPERATIONAL',
        reviews: [
          {
            author_name: 'Kullanıcı',
            rating: 4,
            text: 'Güzel bir yer',
            time: Date.now()
          }
        ]
      };

      return mockDetails;
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }

  /**
   * Calculate distance between two coordinates in meters
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  /**
   * Get directions between two points
   */
  async getDirections(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
  ): Promise<RouteInfo | null> {
    try {

      // Map Google Maps modes to OpenRouteService profiles
      const profileMap = {
        'driving': 'driving-car' as const,
        'walking': 'foot-walking' as const,
        'bicycling': 'cycling-regular' as const,
        'transit': 'driving-car' as const // Fallback to driving for transit
      };

      const profile = profileMap[mode];
      const start: Coordinates = { lat: origin.lat, lng: origin.lng };
      const end: Coordinates = { lat: destination.lat, lng: destination.lng };

      const routeResponse = await openRouteService.getDirections(start, end, profile);
      
      if (routeResponse.features.length > 0) {
        const route = routeResponse.features[0];
        const properties = route.properties;
        const segment = properties.segments[0];
        
        // Convert OpenRouteService response to RouteInfo format
        const routeInfo: RouteInfo = {
          distance: {
            text: `${(properties.summary.distance / 1000).toFixed(1)} km`,
            value: properties.summary.distance
          },
          duration: {
            text: `${Math.round(properties.summary.duration / 60)} dk`,
            value: properties.summary.duration
          },
          steps: segment.steps.map(step => ({
            distance: {
              text: `${(step.distance / 1000).toFixed(1)} km`,
              value: step.distance
            },
            duration: {
              text: `${Math.round(step.duration / 60)} dk`,
              value: step.duration
            },
            end_location: {
              lat: route.geometry.coordinates[step.way_points[1]][1],
              lng: route.geometry.coordinates[step.way_points[1]][0]
            },
            html_instructions: step.instruction,
            start_location: {
              lat: route.geometry.coordinates[step.way_points[0]][1],
              lng: route.geometry.coordinates[step.way_points[0]][0]
            }
          }))
        };
        
        return routeInfo;
      } else {
        throw new Error('No routes found');
      }
    } catch (error) {
      console.error('Error getting directions:', error);
      return null;
    }
  }

  /**
   * Get photo URL from photo reference
   * Note: Photo functionality not available with OpenRouteService
   */
  getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    // Photo functionality not available with OpenRouteService
    return '';
  }

  /**
   * Geocode an address to coordinates
   */
  async geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const response = await openRouteService.geocodeAddress(address);
      
      if (response.features.length > 0) {
        const feature = response.features[0];
        return {
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0]
        };
      } else {
        throw new Error('Geocoding failed');
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }

  /**
   * Get route coordinates for drawing on map
   */
  async getRouteCoordinates(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
  ): Promise<{ latitude: number; longitude: number }[]> {
    try {

      // Map Google Maps modes to OpenRouteService profiles
      const profileMap = {
        'driving': 'driving-car' as const,
        'walking': 'foot-walking' as const,
        'bicycling': 'cycling-regular' as const,
        'transit': 'driving-car' as const
      };

      const profile = profileMap[mode];
      const start: Coordinates = { lat: origin.lat, lng: origin.lng };
      const end: Coordinates = { lat: destination.lat, lng: destination.lng };

      const routeResponse = await openRouteService.getDirections(start, end, profile);
      
      if (routeResponse.features.length > 0) {
        const route = routeResponse.features[0];
        
        // Convert OpenRouteService coordinates to the expected format
        const coordinates = route.geometry.coordinates.map(coord => ({
          latitude: coord[1],  // OpenRouteService uses [lng, lat] format
          longitude: coord[0]
        }));
        
        return coordinates;
      }

      return [];
    } catch (error) {
      console.error('Error getting route coordinates:', error);
      return [];
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {

      const coordinates: Coordinates = { lat, lng };
      const response = await openRouteService.reverseGeocode(coordinates);
      
      if (response.features.length > 0) {
        const feature = response.features[0];
        const properties = feature.properties;
        
        // Build formatted address from OpenRouteService response
        const addressParts = [];
        if (properties.name) addressParts.push(properties.name);
        if (properties.street) addressParts.push(properties.street);
        if (properties.locality) addressParts.push(properties.locality);
        if (properties.region) addressParts.push(properties.region);
        if (properties.country) addressParts.push(properties.country);
        
        return addressParts.join(', ') || properties.label || 'Bilinmeyen konum';
      } else {
        throw new Error('No address found');
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }
}

export const googleMapsService = new GoogleMapsService();
export default googleMapsService;