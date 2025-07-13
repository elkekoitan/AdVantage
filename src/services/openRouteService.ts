import axios from 'axios';
import * as Location from 'expo-location';

// OpenRouteService API configuration
const ORS_API_KEY = process.env.EXPO_PUBLIC_OPENROUTE_API_KEY || 'your_openroute_service_api_key';
const ORS_BASE_URL = 'https://api.openrouteservice.org';

// Overpass API for POI data
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

// Create axios instance with default config
const orsApi = axios.create({
  baseURL: ORS_BASE_URL,
  headers: {
    'Authorization': ORS_API_KEY,
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Types for OpenRouteService
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationPermissionResult {
  granted: boolean;
  canAskAgain?: boolean;
  status: Location.PermissionStatus;
}

export interface PlaceDetails {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  category: string;
  rating?: number;
  reviews?: PlaceReview[];
  photos?: string[];
  openingHours?: OpeningHours;
  contact?: ContactInfo;
  website?: string;
  description?: string;
}

export interface PlaceReview {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export interface OpeningHours {
  isOpen: boolean;
  periods: Array<{
    day: number; // 0-6 (Sunday-Saturday)
    open: string; // HH:MM format
    close: string; // HH:MM format
  }>;
  weekdayText: string[];
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
}

export interface SearchFilters {
  category?: string;
  radius?: number;
  minRating?: number;
  priceLevel?: 'free' | 'inexpensive' | 'moderate' | 'expensive' | 'very_expensive';
  openNow?: boolean;
  hasWifi?: boolean;
  hasParking?: boolean;
  isAccessible?: boolean;
  maxResults?: number;
}

export interface RouteResponse {
  features: Array<{
    geometry: {
      coordinates: number[][];
      type: string;
    };
    properties: {
      segments: Array<{
        distance: number;
        duration: number;
        steps: Array<{
          distance: number;
          duration: number;
          instruction: string;
          name: string;
          type: number;
          way_points: number[];
        }>;
      }>;
      summary: {
        distance: number;
        duration: number;
      };
    };
  }>;
}

export interface GeocodingResponse {
  features: Array<{
    geometry: {
      coordinates: number[];
      type: string;
    };
    properties: {
      id: string;
      gid: string;
      layer: string;
      source: string;
      source_id: string;
      name: string;
      housenumber?: string;
      street?: string;
      postalcode?: string;
      confidence: number;
      match_type: string;
      accuracy: string;
      country: string;
      country_gid: string;
      country_a: string;
      region: string;
      region_gid: string;
      region_a: string;
      county: string;
      county_gid: string;
      locality: string;
      locality_gid: string;
      continent: string;
      continent_gid: string;
      label: string;
    };
  }>;
}

export interface IsochroneResponse {
  features: Array<{
    geometry: {
      coordinates: number[][][];
      type: string;
    };
    properties: {
      group_index: number;
      value: number;
      center: number[];
    };
  }>;
}

export interface MatrixResponse {
  distances?: number[][];
  durations?: number[][];
  destinations: Array<{
    location: number[];
    snapped_distance: number;
  }>;
  sources: Array<{
    location: number[];
    snapped_distance: number;
  }>;
}

export interface POIResponse {
  type?: string;
  features: Array<{
    geometry: {
      coordinates: number[];
      type: string;
    };
    properties: {
      id: string;
      name: string;
      category: string;
      osm_id?: string;
      osm_type?: string;
      extent?: number[];
      rating?: number;
      address?: string;
      phone?: string;
      website?: string;
      opening_hours?: string;
      amenity?: string;
      cuisine?: string;
      price_level?: string;
      distance?: number;
    };
  }>;
  bbox?: string;
}

export interface EnhancedPOIResponse {
  places: PlaceDetails[];
  totalCount: number;
  hasMore: boolean;
  nextPageToken?: string;
}

export interface OptimizationResponse {
  code: number;
  summary: {
    cost: number;
    routes: number;
    unassigned: number;
  };
  unassigned: Array<{
    id: number;
    location: number[];
  }>;
  routes: Array<{
    vehicle: number;
    cost: number;
    steps: Array<{
      type: string;
      location: number[];
      id?: number;
      service?: number;
      waiting_time?: number;
      job?: number;
    }>;
  }>;
}

export interface ElevationResponse {
  geometry: {
    coordinates: Array<[number, number, number]>; // [lng, lat, elevation]
    type: string;
  };
  properties: {
    summary: {
      distance: number;
      ascent: number;
      descent: number;
    };
  };
}

class OpenRouteService {
  /**
   * Request location permissions
   */
  async requestLocationPermission(): Promise<LocationPermissionResult> {
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      
      return {
        granted: status === Location.PermissionStatus.GRANTED,
        canAskAgain,
        status
      };
    } catch (error) {
      console.error('Location permission error:', error);
      return {
        granted: false,
        status: Location.PermissionStatus.DENIED
      };
    }
  }

  /**
   * Get current user location
   */
  async getCurrentLocation(): Promise<Coordinates> {
    try {
      const permission = await this.requestLocationPermission();
      if (!permission.granted) {
        throw new Error('Konum izni verilmedi');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10
      });

      return {
        lat: location.coords.latitude,
        lng: location.coords.longitude
      };
    } catch (error) {
      console.error('Get current location error:', error);
      throw new Error('Mevcut konum alınamadı');
    }
  }

  /**
   * Watch user location changes
   */
  async watchLocation(
    callback: (location: Coordinates) => void,
    errorCallback?: (error: Error) => void
  ): Promise<{ remove: () => void }> {
    try {
      const permission = await this.requestLocationPermission();
      if (!permission.granted) {
        throw new Error('Konum izni verilmedi');
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10
        },
        (location) => {
          callback({
            lat: location.coords.latitude,
            lng: location.coords.longitude
          });
        }
      );

      return subscription;
    } catch (error) {
      console.error('Watch location error:', error);
      if (errorCallback) {
        errorCallback(new Error('Konum takibi başlatılamadı'));
      }
      return { remove: () => {} };
    }
  }

  /**
   * Get directions between two points
   */
  async getDirections(
    start: Coordinates,
    end: Coordinates,
    profile: 'driving-car' | 'foot-walking' | 'cycling-regular' = 'driving-car'
  ): Promise<RouteResponse> {
    try {
      const response = await orsApi.post('/v2/directions/' + profile, {
        coordinates: [
          [start.lng, start.lat],
          [end.lng, end.lat]
        ],
        format: 'geojson',
        instructions: true,
        language: 'tr'
      });

      return response.data;
    } catch (error) {
      console.error('OpenRouteService directions error:', error);
      throw new Error('Yol tarifi alınamadı');
    }
  }

  /**
   * Get multiple route options
   */
  async getAlternativeRoutes(
    start: Coordinates,
    end: Coordinates,
    profile: 'driving-car' | 'foot-walking' | 'cycling-regular' = 'driving-car'
  ): Promise<RouteResponse> {
    try {
      const response = await orsApi.post('/v2/directions/' + profile, {
        coordinates: [
          [start.lng, start.lat],
          [end.lng, end.lat]
        ],
        format: 'geojson',
        instructions: true,
        language: 'tr',
        alternative_routes: {
          target_count: 3,
          weight_factor: 1.4,
          share_factor: 0.6
        }
      });

      return response.data;
    } catch (error) {
      console.error('OpenRouteService alternative routes error:', error);
      throw new Error('Alternatif rotalar alınamadı');
    }
  }

  /**
   * Geocode an address to coordinates
   */
  async geocodeAddress(address: string): Promise<GeocodingResponse> {
    try {
      const response = await orsApi.get('/geocode/search', {
        params: {
          text: address,
          size: 5,
          layers: 'venue,address,street,locality',
          'boundary.country': 'TR' // Focus on Turkey
        }
      });

      return response.data;
    } catch (error) {
      console.error('OpenRouteService geocoding error:', error);
      throw new Error('Adres bulunamadı');
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(coordinates: Coordinates): Promise<GeocodingResponse> {
    try {
      const response = await orsApi.get('/geocode/reverse', {
        params: {
          'point.lat': coordinates.lat,
          'point.lon': coordinates.lng,
          size: 1,
          layers: 'venue,address,street,locality'
        }
      });

      return response.data;
    } catch (error) {
      console.error('OpenRouteService reverse geocoding error:', error);
      throw new Error('Konum bilgisi alınamadı');
    }
  }

  /**
   * Get isochrone (reachable area within time/distance)
   */
  async getIsochrone(
    location: Coordinates,
    range: number[], // in seconds for time, meters for distance
    rangeType: 'time' | 'distance' = 'time',
    profile: 'driving-car' | 'foot-walking' | 'cycling-regular' = 'driving-car'
  ): Promise<IsochroneResponse> {
    try {
      const response = await orsApi.post('/v2/isochrones/' + profile, {
        locations: [[location.lng, location.lat]],
        range: range,
        range_type: rangeType,
        format: 'geojson'
      });

      return response.data;
    } catch (error) {
      console.error('OpenRouteService isochrone error:', error);
      throw new Error('Erişilebilir alan hesaplanamadı');
    }
  }

  /**
   * Get matrix of distances/durations between multiple points
   */
  async getMatrix(
    locations: Coordinates[],
    profile: 'driving-car' | 'foot-walking' | 'cycling-regular' = 'driving-car',
    metrics: ('distance' | 'duration')[] = ['duration', 'distance']
  ): Promise<MatrixResponse> {
    try {
      const coordinates = locations.map(loc => [loc.lng, loc.lat]);
      
      const response = await orsApi.post('/v2/matrix/' + profile, {
        locations: coordinates,
        metrics: metrics,
        resolve_locations: true
      });

      return response.data;
    } catch (error) {
      console.error('OpenRouteService matrix error:', error);
      throw new Error('Mesafe matrisi hesaplanamadı');
    }
  }

  /**
   * Find nearest POIs (Points of Interest) - Enhanced version with Overpass API
   */
  async findNearbyPOIs(
    location: Coordinates,
    category: string,
    radius: number = 1000 // meters
  ): Promise<POIResponse> {
    try {
      // Use Overpass API for better POI data
      const overpassQuery = this.buildOverpassQuery(location, category, radius);
      
      const response = await axios.post(OVERPASS_API_URL, overpassQuery, {
        headers: {
          'Content-Type': 'text/plain'
        },
        timeout: 15000
      });

      const places = this.parseOverpassResponse(response.data);
      
      // Convert to POIResponse format
      const features = places.map(place => ({
        type: 'Feature' as const,
        properties: {
          id: place.id,
          name: place.name,
          label: place.address,
          category: place.category,
          osm_id: place.id,
          osm_type: 'node'
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [place.coordinates.lng, place.coordinates.lat]
        }
      }));

      return {
        type: 'FeatureCollection',
        features,
        bbox: this.calculateBoundingBox(location, radius)
      };
    } catch (error) {
      console.error('OpenRouteService POI search error:', error);
      
      // Fallback to geocoding API
      try {
        const response = await orsApi.get('/geocode/search', {
          params: {
            text: category,
            'focus.point.lat': location.lat,
            'focus.point.lon': location.lng,
            'boundary.circle.lat': location.lat,
            'boundary.circle.lon': location.lng,
            'boundary.circle.radius': radius / 1000, // convert to km
            size: 20,
            layers: 'venue'
          }
        });

        return response.data;
      } catch (fallbackError) {
        console.error('Fallback geocoding error:', fallbackError);
        throw new Error('Yakındaki yerler bulunamadı');
      }
    }
  }

  /**
   * Enhanced POI search with filters and caching
   */
  async searchPlaces(
    location: Coordinates,
    query: string,
    filters: SearchFilters = {}
  ): Promise<EnhancedPOIResponse> {
    try {
      const radius = filters.radius || 5000;
      const maxResults = filters.maxResults || 20;
      
      // Build Overpass query for more detailed POI data
      const overpassQuery = this.buildOverpassQuery(location, query, radius, maxResults);
      
      const response = await axios.post(OVERPASS_API_URL, overpassQuery, {
        headers: {
          'Content-Type': 'text/plain'
        },
        timeout: 15000
      });

      const places = this.parseOverpassResponse(response.data);
      
      // Sort by distance if location is provided
      const sortedPlaces = places.sort((a, b) => {
        const distA = this.calculateDistanceKm(
          location.lat, location.lng,
          a.coordinates.lat, a.coordinates.lng
        );
        const distB = this.calculateDistanceKm(
          location.lat, location.lng,
          b.coordinates.lat, b.coordinates.lng
        );
        return distA - distB;
      });
      
      return {
        places: sortedPlaces.slice(0, maxResults),
        totalCount: sortedPlaces.length,
        hasMore: sortedPlaces.length > maxResults,
        nextPageToken: sortedPlaces.length > maxResults ? 'next_page_token' : undefined
      };
    } catch (error) {
      console.error('Enhanced POI search error:', error);
      // Fallback to basic search
      try {
        const basicResult = await this.findNearbyPOIs(location, query, filters.radius);
        return {
          places: this.convertBasicPOIToPlaceDetails(basicResult.features),
          totalCount: basicResult.features.length,
          hasMore: false
        };
      } catch (fallbackError) {
        console.error('Fallback search error:', fallbackError);
        return {
          places: [],
          totalCount: 0,
          hasMore: false
        };
      }
    }
  }

  /**
   * Get detailed information about a specific place
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
      // In a real implementation, this would fetch from a places API
      // For now, we'll simulate place details
      const mockDetails: PlaceDetails = {
        id: placeId,
        name: 'Örnek Mekan',
        address: 'Örnek Adres, İstanbul',
        coordinates: { lat: 41.0082, lng: 28.9784 },
        category: 'restaurant',
        rating: 4.2,
        reviews: [
          {
            id: '1',
            author: 'Kullanıcı 1',
            rating: 5,
            text: 'Harika bir yer!',
            date: '2024-01-15'
          }
        ],
        openingHours: {
          isOpen: true,
          periods: [
            { day: 1, open: '09:00', close: '22:00' },
            { day: 2, open: '09:00', close: '22:00' },
            { day: 3, open: '09:00', close: '22:00' },
            { day: 4, open: '09:00', close: '22:00' },
            { day: 5, open: '09:00', close: '23:00' },
            { day: 6, open: '10:00', close: '23:00' },
            { day: 0, open: '10:00', close: '21:00' }
          ],
          weekdayText: [
            'Pazartesi: 09:00-22:00',
            'Salı: 09:00-22:00',
            'Çarşamba: 09:00-22:00',
            'Perşembe: 09:00-22:00',
            'Cuma: 09:00-23:00',
            'Cumartesi: 10:00-23:00',
            'Pazar: 10:00-21:00'
          ]
        },
        contact: {
          phone: '+90 212 555 0123',
          website: 'https://example.com'
        },
        description: 'Güzel bir restoran deneyimi sunan mekan.'
      };

      return mockDetails;
    } catch (error) {
      console.error('Get place details error:', error);
      return null;
    }
  }

  /**
   * Get reviews for a specific place
   */
  async getPlaceReviews(_placeId: string, limit: number = 10): Promise<PlaceReview[]> {
    try {
      // Mock reviews - in real implementation, this would fetch from a reviews API
      const mockReviews: PlaceReview[] = [
        {
          id: '1',
          author: 'Ahmet Y.',
          rating: 5,
          text: 'Mükemmel hizmet ve lezzetli yemekler. Kesinlikle tavsiye ederim!',
          date: '2024-01-15'
        },
        {
          id: '2',
          author: 'Fatma K.',
          rating: 4,
          text: 'Güzel atmosfer, fiyatlar uygun. Tekrar geleceğim.',
          date: '2024-01-10'
        },
        {
          id: '3',
          author: 'Mehmet S.',
          rating: 5,
          text: 'Harika bir deneyimdi. Personel çok ilgili.',
          date: '2024-01-08'
        }
      ];

      return mockReviews.slice(0, limit);
    } catch (error) {
      console.error('Get place reviews error:', error);
      return [];
    }
  }

  /**
   * Search places by text query
   */
  async searchPlacesByText(
    query: string,
    location?: Coordinates,
    radius: number = 10000
  ): Promise<EnhancedPOIResponse> {
    try {
      const searchParams: Record<string, string | number> = {
        text: query,
        size: 20,
        layers: 'venue,address'
      };

      if (location) {
        searchParams['focus.point.lat'] = location.lat;
        searchParams['focus.point.lon'] = location.lng;
        searchParams['boundary.circle.lat'] = location.lat;
        searchParams['boundary.circle.lon'] = location.lng;
        searchParams['boundary.circle.radius'] = radius / 1000;
      }

      const response = await orsApi.get('/geocode/search', {
        params: searchParams
      });

      const places = this.convertBasicPOIToPlaceDetails(response.data.features);
      
      return {
        places,
        totalCount: places.length,
        hasMore: places.length >= 20
      };
    } catch (error) {
      console.error('Search places by text error:', error);
      throw new Error('Mekan arama başarısız');
    }
  }

  /**
   * Build Overpass API query for POI search
   */
  private buildOverpassQuery(
    location: Coordinates,
    query: string,
    radius: number,
    maxResults: number = 20
  ): string {
    const amenityTypes = this.getCategoryAmenityTypes(query);
    const shopTypes = this.getCategoryShopTypes(query);
    const leisureTypes = this.getCategoryLeisureTypes(query);
    
    return `
      [out:json][timeout:25][maxsize:1073741824];
      (
        node["amenity"~"${amenityTypes.join('|')}"]["name"~"${query}",i](around:${radius},${location.lat},${location.lng});
        way["amenity"~"${amenityTypes.join('|')}"]["name"~"${query}",i](around:${radius},${location.lat},${location.lng});
        relation["amenity"~"${amenityTypes.join('|')}"]["name"~"${query}",i](around:${radius},${location.lat},${location.lng});
        node["shop"~"${shopTypes.join('|')}"]["name"~"${query}",i](around:${radius},${location.lat},${location.lng});
        way["shop"~"${shopTypes.join('|')}"]["name"~"${query}",i](around:${radius},${location.lat},${location.lng});
        node["leisure"~"${leisureTypes.join('|')}"]["name"~"${query}",i](around:${radius},${location.lat},${location.lng});
        way["leisure"~"${leisureTypes.join('|')}"]["name"~"${query}",i](around:${radius},${location.lat},${location.lng});
      );
      out center meta ${maxResults};
    `;
  }

  /**
   * Parse Overpass API response
   */
  private parseOverpassResponse(data: { elements?: Record<string, unknown>[] }): PlaceDetails[] {
    if (!data.elements) return [];

    return data.elements.map((element: Record<string, unknown>): PlaceDetails => {
      const elementTags = element.tags as Record<string, string> | undefined;
      const elementCenter = element.center as { lat: number; lon: number } | undefined;
      
      const coords = element.type === 'node' 
        ? { lat: element.lat as number, lng: element.lon as number }
        : { lat: elementCenter?.lat || 0, lng: elementCenter?.lon || 0 };

      return {
        id: (element.id as string | number).toString(),
        name: elementTags?.name || 'İsimsiz Mekan',
        address: this.buildAddress(elementTags || {}),
        coordinates: coords,
        category: elementTags?.amenity || 'unknown',
        rating: this.generateMockRating(),
        contact: {
          phone: elementTags?.phone,
          website: elementTags?.website
        }
      };
    }).filter(place => place.coordinates.lat !== 0 && place.coordinates.lng !== 0);
  }

  /**
   * Convert basic POI response to PlaceDetails
   */
  private convertBasicPOIToPlaceDetails(features: Record<string, unknown>[]): PlaceDetails[] {
    return features.map((feature: Record<string, unknown>): PlaceDetails => {
      const properties = feature.properties as Record<string, unknown> | undefined;
      const geometry = feature.geometry as { coordinates: [number, number] } | undefined;
      
      return {
        id: (properties?.id as string) || Math.random().toString(),
        name: (properties?.name as string) || 'İsimsiz Mekan',
        address: (properties?.label as string) || 'Adres bilgisi yok',
        coordinates: {
          lat: geometry?.coordinates[1] || 0,
          lng: geometry?.coordinates[0] || 0
        },
        category: (properties?.layer as string) || 'unknown',
        rating: this.generateMockRating()
      };
    });
  }

  /**
   * Calculate bounding box for location and radius
   */
  private calculateBoundingBox(location: Coordinates, radius: number): string {
    const earthRadius = 6371000; // meters
    const latDelta = (radius / earthRadius) * (180 / Math.PI);
    const lngDelta = (radius / earthRadius) * (180 / Math.PI) / Math.cos(location.lat * Math.PI / 180);

    const south = location.lat - latDelta;
    const north = location.lat + latDelta;
    const west = location.lng - lngDelta;
    const east = location.lng + lngDelta;

    return `${south},${west},${north},${east}`;
  }

  /**
   * Build address from OSM tags
   */
  private buildAddress(tags: Record<string, string>): string {
    const parts = [];
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
    if (tags['addr:district']) parts.push(tags['addr:district']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    
    return parts.length > 0 ? parts.join(', ') : 'Adres bilgisi yok';
  }

  /**
   * Generate mock rating for places
   */
  private generateMockRating(): number {
    return Math.round((Math.random() * 2 + 3) * 10) / 10; // 3.0 - 5.0 range
  }

  /**
   * Get amenity types for category
   */
  private getCategoryAmenityTypes(query: string): string[] {
    const categoryMap: Record<string, string[]> = {
      restaurant: ['restaurant', 'fast_food', 'cafe', 'food_court'],
      hotel: ['hotel', 'motel', 'hostel', 'guest_house'],
      hospital: ['hospital', 'clinic', 'pharmacy', 'dentist'],
      bank: ['bank', 'atm', 'bureau_de_change'],
      fuel: ['fuel', 'charging_station'],
      parking: ['parking', 'parking_entrance'],
      school: ['school', 'university', 'college', 'kindergarten'],
      shopping: ['marketplace', 'shopping_centre']
    };
    
    return categoryMap[query.toLowerCase()] || ['restaurant', 'cafe', 'bank', 'hospital', 'school'];
  }

  /**
   * Get shop types for category
   */
  private getCategoryShopTypes(query: string): string[] {
    const shopMap: Record<string, string[]> = {
      shopping: ['supermarket', 'mall', 'department_store', 'convenience'],
      food: ['bakery', 'butcher', 'greengrocer', 'deli'],
      clothes: ['clothes', 'shoes', 'jewelry', 'bag'],
      electronics: ['electronics', 'mobile_phone', 'computer']
    };
    
    return shopMap[query.toLowerCase()] || ['supermarket', 'convenience', 'clothes'];
  }

  /**
   * Get leisure types for category
   */
  private getCategoryLeisureTypes(query: string): string[] {
    const leisureMap: Record<string, string[]> = {
      entertainment: ['cinema', 'theatre', 'nightclub', 'bar'],
      sports: ['fitness_centre', 'sports_centre', 'swimming_pool', 'stadium'],
      park: ['park', 'garden', 'playground', 'nature_reserve']
    };
    
    return leisureMap[query.toLowerCase()] || ['park', 'cinema', 'fitness_centre'];
  }

  /**
   * Calculate distance between two coordinates in kilometers
   */
  private calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Optimize route for multiple waypoints (TSP - Traveling Salesman Problem)
   */
  async optimizeRoute(
    locations: Coordinates[],
    profile: 'driving-car' | 'foot-walking' | 'cycling-regular' = 'driving-car'
  ): Promise<OptimizationResponse> {
    try {
      const coordinates = locations.map(loc => [loc.lng, loc.lat]);
      
      const response = await orsApi.post('/optimization', {
        jobs: coordinates.slice(1).map((coord, index) => ({
          id: index + 1,
          location: coord
        })),
        vehicles: [{
          id: 1,
          start: coordinates[0],
          end: coordinates[0],
          profile: profile
        }]
      });

      return response.data;
    } catch (error) {
      console.error('OpenRouteService optimization error:', error);
      throw new Error('Rota optimizasyonu yapılamadı');
    }
  }

  /**
   * Get elevation profile for a route
   */
  async getElevation(coordinates: Coordinates[]): Promise<ElevationResponse> {
    try {
      const coords = coordinates.map(coord => [coord.lng, coord.lat]);
      
      const response = await orsApi.post('/elevation/line', {
        format_in: 'geojson',
        format_out: 'geojson',
        geometry: {
          coordinates: coords,
          type: 'LineString'
        }
      });

      return response.data;
    } catch (error) {
      console.error('OpenRouteService elevation error:', error);
      throw new Error('Yükseklik profili alınamadı');
    }
  }
}

export const openRouteService = new OpenRouteService();
export default openRouteService;