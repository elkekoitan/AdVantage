import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { openRouteService } from '../../services/openRouteService';
import type { MainStackParamList } from '../../navigation/MainNavigator';

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

const { height } = Dimensions.get('window');

type MapScreenNavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface MapScreenProps {
  route?: {
    params?: {
      initialLocation?: { latitude: number; longitude: number };
      searchQuery?: string;
      places?: any[];
    };
  };
}

const MapScreen: React.FC<MapScreenProps> = ({ route }) => {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const mapRef = useRef<MapView>(null);
  
  const [region, setRegion] = useState<Region>({
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showPlacesList, setShowPlacesList] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [showRoute, setShowRoute] = useState(false);

  const initializeLocation = useCallback(async () => {
    try {
      // Use Expo Location API directly since we're not using Google Maps service anymore
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Konum izni verilmedi.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      if (location) {
        const { latitude, longitude } = location.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  }, []);

  const handleSearch = useCallback(async (query?: string) => {
    const searchText = query || searchQuery;
    if (!searchText.trim()) return;

    setLoading(true);
    try {
      // Use OpenRouteService geocoding for search
      const response = await openRouteService.geocodeAddress(searchText);
      
      if (response.features.length > 0) {
        setPlaces(response.features);
        setShowPlacesList(true);
        
        if (response.features.length > 0) {
          const firstPlace = response.features[0];
          const newRegion = {
            latitude: firstPlace.geometry.coordinates[1],
            longitude: firstPlace.geometry.coordinates[0],
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setRegion(newRegion);
          mapRef.current?.animateToRegion(newRegion, 1000);
        }
      } else {
        setPlaces([]);
        Alert.alert('Sonuç Bulunamadı', 'Arama kriterlerinize uygun sonuç bulunamadı.');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Hata', 'Arama sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    initializeLocation();
    
    // Handle initial params
    if (route?.params?.initialLocation) {
      const { latitude, longitude } = route.params.initialLocation;
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
    
    if (route?.params?.places) {
      setPlaces(route.params.places);
      setShowPlacesList(true);
    }
    
    if (route && route.params && route.params.searchQuery) {
      setSearchQuery(route.params.searchQuery);
      handleSearch(route.params.searchQuery);
    }
  }, [initializeLocation, handleSearch, route]);

  const handlePlaceSelect = async (place: any) => {
    setSelectedPlace(place);
    setShowPlacesList(false);
    setShowRoute(false);
    setRouteCoordinates([]);
    setRouteInfo(null);
    
    const newRegion = {
      latitude: place.geometry.coordinates[1],
      longitude: place.geometry.coordinates[0],
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 1000);
  };

  const handleMyLocation = () => {
    if (userLocation) {
      const newRegion = {
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
    } else {
      initializeLocation();
    }
  };

  const handleGetDirections = async () => {
    if (selectedPlace && userLocation) {
      try {
        setLoading(true);
        const route = await openRouteService.getDirections(
          { lat: userLocation.lat, lng: userLocation.lng },
          { lat: selectedPlace.geometry.coordinates[1], lng: selectedPlace.geometry.coordinates[0] },
          'driving-car'
        );
        
        if (route && route.features && route.features.length > 0) {
          const coordinates = route.features[0].geometry.coordinates.map(
            (coord: number[]) => ({
              latitude: coord[1],
              longitude: coord[0],
            })
          );
          
          const properties = route.features[0].properties;
          const distance = (properties.summary.distance / 1000).toFixed(1) + ' km';
          const duration = Math.round(properties.summary.duration / 60) + ' dk';
          
          setRouteCoordinates(coordinates);
          setRouteInfo({ distance, duration });
          setShowRoute(true);
          
          // Adjust map to show the route
          const allCoordinates = [
            { latitude: userLocation.lat, longitude: userLocation.lng },
            ...coordinates,
            { latitude: selectedPlace.geometry.coordinates[1], longitude: selectedPlace.geometry.coordinates[0] }
          ];
          
          mapRef.current?.fitToCoordinates(allCoordinates, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }
      } catch (error) {
        console.error('Route error:', error);
        // Fallback to external maps
        const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${selectedPlace.geometry.coordinates[1]},${selectedPlace.geometry.coordinates[0]}`;
        Alert.alert(
          'Yol Tarifi',
          'Rota hesaplanamadı. Harici harita uygulamasında açmak istiyor musunuz?',
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Aç', onPress: () => console.log('Open external maps:', url) },
          ]
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const renderPlaceItem = (place: any) => (
    <TouchableOpacity
      key={place.properties.id || place.properties.name}
      style={styles.placeItem}
      onPress={() => handlePlaceSelect(place)}
    >
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{place.properties.name || place.properties.label || 'İsimsiz Yer'}</Text>
        <Text style={styles.placeAddress}>{place.properties.label || place.properties.category || 'Adres bilgisi yok'}</Text>
        {place.properties.category && (
          <View style={styles.ratingContainer}>
            <Ionicons name="business" size={14} color={colors.info} />
            <Text style={styles.ratingText}>{place.properties.category}</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Konum ara..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
          />
          {loading && (
            <ActivityIndicator size="small" color={colors.primary} style={styles.loadingIcon} />
          )}
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
        >
          {/* User location marker */}
          {userLocation && (
            <Marker
              coordinate={{
                latitude: userLocation.lat,
                longitude: userLocation.lng,
              }}
              title="Konumunuz"
              pinColor={colors.primary}
            />
          )}
          
          {/* Place markers */}
          {places.map((place) => (
            <Marker
              key={place.properties.id || place.properties.name}
              coordinate={{
                latitude: place.geometry.coordinates[1],
                longitude: place.geometry.coordinates[0],
              }}
              title={place.properties.name || place.properties.label || 'İsimsiz Yer'}
              description={place.properties.label || place.properties.category || 'Detay bilgisi yok'}
              onPress={() => handlePlaceSelect(place)}
            />
          ))}
          
          {/* Route polyline */}
          {showRoute && routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={colors.primary}
              strokeWidth={4}
              lineDashPattern={[0]}
            />
          )}
        </MapView>

        {/* My Location Button */}
        <TouchableOpacity
          style={styles.myLocationButton}
          onPress={handleMyLocation}
        >
          <Ionicons name="locate" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Places List */}
      {showPlacesList && places.length > 0 && (
        <View style={styles.placesListContainer}>
          <View style={styles.placesListHeader}>
            <Text style={styles.placesListTitle}>
              {places.length} sonuç bulundu
            </Text>
            <TouchableOpacity onPress={() => setShowPlacesList(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.placesList}>
            {places.map(renderPlaceItem)}
          </ScrollView>
        </View>
      )}

      {/* Selected Place Details */}
      {selectedPlace && !showPlacesList && (
        <View style={styles.selectedPlaceContainer}>
          <View style={styles.selectedPlaceHeader}>
            <View style={styles.selectedPlaceInfo}>
              <Text style={styles.selectedPlaceName}>{selectedPlace.properties.name || selectedPlace.properties.label || 'İsimsiz Yer'}</Text>
              <Text style={styles.selectedPlaceAddress}>
                {selectedPlace.properties.label || selectedPlace.properties.category || 'Detay bilgisi yok'}
              </Text>
              {selectedPlace.properties.category && (
                <View style={styles.ratingContainer}>
                  <Ionicons name="business" size={16} color={colors.info} />
                  <Text style={styles.ratingText}>{selectedPlace.properties.category}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={() => setSelectedPlace(null)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          {/* Route Info */}
          {showRoute && routeInfo && (
            <View style={styles.routeInfoContainer}>
              <View style={styles.routeInfo}>
                <View style={styles.routeInfoItem}>
                  <Ionicons name="time" size={16} color={colors.textSecondary} />
                  <Text style={styles.routeInfoText}>{routeInfo.duration}</Text>
                </View>
                <View style={styles.routeInfoItem}>
                  <Ionicons name="location" size={16} color={colors.textSecondary} />
                  <Text style={styles.routeInfoText}>{routeInfo.distance}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.clearRouteButton}
                onPress={() => {
                  setShowRoute(false);
                  setRouteCoordinates([]);
                  setRouteInfo(null);
                }}
              >
                <Ionicons name="close" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.selectedPlaceActions}>
            <TouchableOpacity
              style={[styles.actionButton, showRoute && styles.actionButtonActive]}
              onPress={handleGetDirections}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="navigate" size={20} color={colors.primary} />
              )}
              <Text style={styles.actionButtonText}>
                {showRoute ? 'Rota Gösteriliyor' : 'Yol Tarifi'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                // Add to program or save location
                Alert.alert('Bilgi', 'Bu özellik yakında eklenecek.');
              }}
            >
              <Ionicons name="bookmark" size={20} color={colors.primary} />
              <Text style={styles.actionButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    ...typography.body,
  },
  loadingIcon: {
    marginLeft: 8,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.surface,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  placesListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  placesListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  placesListTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  placesList: {
    flex: 1,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    ...typography.body,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
    ...typography.body,
  },
  selectedPlaceContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedPlaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  selectedPlaceInfo: {
    flex: 1,
    marginRight: 12,
  },
  selectedPlaceName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  selectedPlaceAddress: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    ...typography.body,
  },
  selectedPlaceActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  actionButtonActive: {
    backgroundColor: colors.primary,
  },
  routeInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  routeInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  clearRouteButton: {
    padding: 4,
  },
});

export default MapScreen;