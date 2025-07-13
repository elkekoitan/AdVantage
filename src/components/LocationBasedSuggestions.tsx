import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { openRouteService } from '../services/openRouteService';

// Design system
const colors = {
  primary: '#007AFF',
  primaryLight: '#E3F2FD',
  secondary: '#FF6B35',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

const typography = {
  heading: {
    fontFamily: 'System',
    fontWeight: '700' as const,
  },
  subtitle: {
    fontFamily: 'System',
    fontWeight: '600' as const,
  },
  body: {
    fontFamily: 'System',
    fontWeight: '400' as const,
  },
  caption: {
    fontFamily: 'System',
    fontWeight: '500' as const,
  },
  button: {
    fontFamily: 'System',
    fontWeight: '600' as const,
  },
};

interface Place {
  properties: {
    id?: string;
    name?: string;
    label?: string;
    category?: string;
  };
  geometry: {
    coordinates: [number, number]; // [lng, lat]
  };
}

interface LocationBasedSuggestionsProps {
  userLocation?: { latitude: number; longitude: number } | null;
  activityType?: string;
  onPlaceSelect?: (place: Place) => void;
  onNavigateToMap?: (place: Place, routeInfo?: { distance: string; duration: string; coordinates?: number[][] }) => void;
}

const ACTIVITY_TYPES = {
  gym: { type: 'gym', icon: 'fitness', label: 'Spor Salonu' },
  park: { type: 'park', icon: 'leaf', label: 'Park' },
  restaurant: { type: 'restaurant', icon: 'restaurant', label: 'Restoran' },
  cafe: { type: 'cafe', icon: 'cafe', label: 'Kafe' },
  hospital: { type: 'hospital', icon: 'medical', label: 'Hastane' },
  pharmacy: { type: 'pharmacy', icon: 'medical', label: 'Eczane' },
  shopping_mall: { type: 'shopping_mall', icon: 'storefront', label: 'AVM' },
  gas_station: { type: 'gas_station', icon: 'car', label: 'Benzin İstasyonu' },
  bank: { type: 'bank', icon: 'card', label: 'Banka' },
  atm: { type: 'atm', icon: 'card', label: 'ATM' },
};

// Helper function to calculate distance between two coordinates
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): string => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  } else {
    return `${distance.toFixed(1)} km`;
  }
};

const LocationBasedSuggestions: React.FC<LocationBasedSuggestionsProps> = ({
  userLocation,
  activityType,
  onPlaceSelect,
  onNavigateToMap,
}) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedActivityType, setSelectedActivityType] = useState(activityType || 'gym');
  const [error, setError] = useState<string | null>(null);

  const fetchNearbyPlaces = useCallback(async (type: string) => {
    if (!userLocation) return;

    setLoading(true);
    setError(null);
    
    try {
      const results = await openRouteService.findNearbyPOIs(
        { lat: userLocation.latitude, lng: userLocation.longitude },
        type,
        5000 // 5km radius
      );
      const formattedPlaces = results.features?.slice(0, 10).map(feature => ({
        ...feature,
        geometry: {
          ...feature.geometry,
          coordinates: [feature.geometry.coordinates[0], feature.geometry.coordinates[1]] as [number, number]
        }
      })) || [];
      setPlaces(formattedPlaces);
    } catch (err) {
      console.error('Error fetching nearby places:', err);
      setError('Yakındaki yerler yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyPlaces(selectedActivityType);
    }
  }, [userLocation, selectedActivityType, fetchNearbyPlaces]);

  const handleActivityTypeChange = (type: string) => {
    setSelectedActivityType(type);
  };

  const handleGetDirections = async (place: Place) => {
    try {
      // Use OpenRouteService for directions
       const routeResponse = await openRouteService.getDirections(
         { lat: userLocation!.latitude, lng: userLocation!.longitude },
         { lat: place.geometry.coordinates[1], lng: place.geometry.coordinates[0] }
       );
       
       if (routeResponse && routeResponse.features.length > 0) {
         const route = routeResponse.features[0];
         const summary = route.properties.summary;
         
         // Navigate to map with OpenRouteService route information
         onNavigateToMap?.(place, {
           distance: `${(summary.distance / 1000).toFixed(1)} km`,
           duration: `${Math.round(summary.duration / 60)} min`,
           coordinates: route.geometry.coordinates
         });
        return;
      }
    } catch (error) {
      console.error('OpenRouteService error:', error);
    }
    
    // Fallback to external maps app
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.geometry.coordinates[1]},${place.geometry.coordinates[0]}`;
    Linking.openURL(url);
  };

  const handlePlacePress = (place: Place) => {
    if (onPlaceSelect) {
      onPlaceSelect(place);
    } else {
      // Default action: show place details
      Alert.alert(
        place.properties.name || 'İsimsiz Yer',
        place.properties.label || place.properties.category || 'Detay bilgisi yok',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Haritada Göster',
            onPress: () => onNavigateToMap?.(place),
          },
          {
            text: 'Yol Tarifi',
            onPress: () => handleGetDirections(place),
          },
        ]
      );
    }
  };

  const renderActivityTypeButton = (key: string) => {
    const activity = ACTIVITY_TYPES[key as keyof typeof ACTIVITY_TYPES];
    const isSelected = selectedActivityType === activity.type;
    
    return (
      <TouchableOpacity
        key={key}
        style={[
          styles.activityTypeButton,
          isSelected && styles.activityTypeButtonSelected,
        ]}
        onPress={() => handleActivityTypeChange(activity.type)}
      >
        <Ionicons
          name={activity.icon as keyof typeof Ionicons.glyphMap}
          size={20}
          color={isSelected ? colors.surface : colors.primary}
        />
        <Text
          style={[
            styles.activityTypeText,
            isSelected && styles.activityTypeTextSelected,
          ]}
        >
          {activity.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderPlaceCard = (place: Place) => {
    const distance = userLocation
      ? calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          place.geometry.coordinates[1], // lat
          place.geometry.coordinates[0]  // lng
        )
      : null;

    return (
      <TouchableOpacity
        key={place.properties.id || place.properties.name}
        style={styles.placeCard}
        onPress={() => handlePlacePress(place)}
      >
        <View style={styles.placeInfo}>
          <Text style={styles.placeName} numberOfLines={1}>
            {place.properties.name || 'İsimsiz Yer'}
          </Text>
          
          <Text style={styles.placeAddress} numberOfLines={2}>
            {place.properties.label || place.properties.category || 'Adres bilgisi yok'}
          </Text>
          
          <View style={styles.placeMetrics}>
            {place.properties.category && (
              <View style={styles.ratingContainer}>
                <Ionicons name="business" size={14} color={colors.info} />
                <Text style={styles.ratingText}>{place.properties.category}</Text>
              </View>
            )}
            
            {distance && (
              <View style={styles.distanceContainer}>
                <Ionicons name="location" size={14} color={colors.textSecondary} />
                <Text style={styles.distanceText}>{distance}</Text>
              </View>
            )}
          </View>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  if (!userLocation) {
    return (
      <View style={styles.container}>
        <View style={styles.noLocationContainer}>
          <Ionicons name="location-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.noLocationText}>
            Konum bilgisi gerekli
          </Text>
          <Text style={styles.noLocationSubtext}>
            Yakındaki yerleri görmek için konum izni verin
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yakındaki Yerler</Text>
      
      {/* Activity Type Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.activityTypesContainer}
        contentContainerStyle={styles.activityTypesContent}
      >
        {Object.keys(ACTIVITY_TYPES).map(renderActivityTypeButton)}
      </ScrollView>
      
      {/* Places List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Yakındaki yerler yükleniyor...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchNearbyPlaces(selectedActivityType)}
          >
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : places.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyText}>
            Bu kategoride yakında yer bulunamadı
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.placesList} showsVerticalScrollIndicator={false}>
          {places.map(renderPlaceCard)}
        </ScrollView>
      )}
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    color: colors.text,
    marginBottom: 16,
    paddingHorizontal: 16,
    ...typography.heading,
  },
  activityTypesContainer: {
    marginBottom: 16,
  },
  activityTypesContent: {
    paddingHorizontal: 16,
  },
  activityTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  activityTypeButtonSelected: {
    backgroundColor: colors.primary,
  },
  activityTypeText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 6,
    ...typography.button,
  },
  activityTypeTextSelected: {
    color: colors.surface,
  },
  placesList: {
    flex: 1,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  placeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
    ...typography.subtitle,
  },
  placeAddress: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    ...typography.body,
  },
  placeMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  ratingText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 2,
    ...typography.caption,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  distanceText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 2,
    ...typography.caption,
  },
  priceContainer: {
    marginRight: 12,
  },
  priceText: {
    fontSize: 12,
    color: colors.success,
    ...typography.caption,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: colors.textSecondary,
    ...typography.caption,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
    ...typography.body,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
    ...typography.body,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    color: colors.surface,
    ...typography.button,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    ...typography.body,
  },
  noLocationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noLocationText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginTop: 12,
    ...typography.subtitle,
  },
  noLocationSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    ...typography.body,
  },
});

export default LocationBasedSuggestions;