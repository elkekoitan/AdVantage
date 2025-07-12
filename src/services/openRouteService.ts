import axios from 'axios';

// OpenRouteService API configuration
const ORS_API_KEY = process.env.EXPO_PUBLIC_OPENROUTE_API_KEY || 'your_openroute_service_api_key';
const ORS_BASE_URL = 'https://api.openrouteservice.org';

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
    };
  }>;
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
   * Find nearest POIs (Points of Interest)
   */
  async findNearbyPOIs(
    location: Coordinates,
    category: string,
    radius: number = 1000 // meters
  ): Promise<POIResponse> {
    try {
      // This would typically use a POI service or Overpass API
      // For now, we'll use a simple approach with geocoding
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
    } catch (error) {
      console.error('OpenRouteService POI search error:', error);
      throw new Error('Yakındaki yerler bulunamadı');
    }
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