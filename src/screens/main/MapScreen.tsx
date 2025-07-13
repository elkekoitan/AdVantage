import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dimensions,
  Alert,
} from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Pressable,
  ScrollView,
  Icon,
  Spinner,
  useToast,
} from 'native-base';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { openRouteService } from '../../services/openRouteService';
import type { MainStackParamList } from '../../types/navigation';

// Place interface
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



const { height } = Dimensions.get('window');

type MapScreenNavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface MapScreenProps {
  route?: {
    params?: {
      initialLocation?: { latitude: number; longitude: number };
      searchQuery?: string;
      places?: Place[];
    };
  };
}

const MapScreen: React.FC<MapScreenProps> = ({ route }) => {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const mapRef = useRef<MapView>(null);
  const toast = useToast();
  
  const [region, setRegion] = useState<Region>({
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
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
      toast.show({
        title: 'Hata',
        description: 'Konum alınamadı. Lütfen konum izinlerini kontrol edin.',
      });
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
        // Convert GeocodingResponse features to Place format
        const convertedPlaces: Place[] = response.features.map(feature => ({
          properties: {
            id: feature.properties.gid,
            name: feature.properties.name,
            label: feature.properties.label,
            category: feature.properties.layer
          },
          geometry: {
            coordinates: [feature.geometry.coordinates[0], feature.geometry.coordinates[1]] as [number, number]
          }
        }));
        setPlaces(convertedPlaces);
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
        toast.show({
          title: 'Sonuç Bulunamadı',
          description: 'Arama kriterlerinize uygun sonuç bulunamadı.',
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.show({
        title: 'Hata',
        description: 'Arama sırasında bir hata oluştu.',
      });
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

  const handlePlaceSelect = async (place: Place) => {
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
        toast.show({
          title: 'Yol Tarifi',
          description: 'Rota hesaplanamadı. Harici harita uygulamasında açmak istiyor musunuz?',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const renderPlaceItem = (place: Place, index: number) => (
    <Pressable
      key={index}
      px={5}
      py={4}
      borderBottomWidth={1}
      borderBottomColor={colors.border}
      onPress={() => handlePlaceSelect(place)}
    >
      <VStack flex={1}>
        <Text
          fontSize={16}
          fontWeight="600"
          color={colors.text}
          mb={1}
        >
          {place.properties.name || place.properties.label || 'İsimsiz Yer'}
        </Text>
        <Text
          fontSize={14}
          color={colors.textSecondary}
          mb={1}
        >
          {place.properties.label || place.properties.category || 'Detay bilgisi yok'}
        </Text>
        {place.properties.category && (
          <HStack alignItems="center">
            <Icon as={MaterialIcons} name="business" size={4} color={colors.info} />
            <Text
              fontSize={14}
              color={colors.textSecondary}
              ml={1}
            >
              {place.properties.category}
            </Text>
          </HStack>
        )}
      </VStack>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <HStack
        alignItems="center"
        px={4}
        py={3}
        bg={colors.surface}
        borderBottomWidth={1}
        borderBottomColor={colors.border}
      >
        <Pressable
          mr={3}
          onPress={() => navigation.goBack()}
        >
          <Icon as={MaterialIcons} name="arrow-back" size={6} color={colors.text} />
        </Pressable>
        
        <HStack
          flex={1}
          alignItems="center"
          bg={colors.background}
          borderRadius={12}
          px={3}
          h={11}
        >
          <Icon as={MaterialIcons} name="search" size={5} color={colors.textSecondary} mr={2} />
          <Input
            flex={1}
            fontSize={16}
            color={colors.text}
            placeholder="Yer ara..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
            variant="unstyled"
            _focus={{
              borderWidth: 0,
            }}
          />
          {loading && (
            <Spinner size="sm" color={colors.primary} ml={2} />
          )}
        </HStack>
      </HStack>

      {/* Map */}
      <Box flex={1} position="relative">
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
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
        <Pressable
          position="absolute"
          bottom={5}
          right={5}
          bg={colors.surface}
          borderRadius={25}
          w={12}
          h={12}
          justifyContent="center"
          alignItems="center"
          shadow={5}
          onPress={handleMyLocation}
        >
          <Icon as={MaterialIcons} name="my-location" size={6} color={colors.primary} />
        </Pressable>
      </Box>

      {/* Places List */}
      {showPlacesList && places.length > 0 && (
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          bg={colors.surface}
          borderTopLeftRadius={20}
          borderTopRightRadius={20}
          maxH={height * 0.5}
          shadow={5}
        >
          <HStack
            justifyContent="space-between"
            alignItems="center"
            px={5}
            py={4}
            borderBottomWidth={1}
            borderBottomColor={colors.border}
          >
            <Text
              fontSize={18}
              fontWeight="600"
              color={colors.text}
            >
              {places.length} sonuç bulundu
            </Text>
            <Pressable onPress={() => setShowPlacesList(false)}>
              <Icon as={MaterialIcons} name="close" size={6} color={colors.textSecondary} />
            </Pressable>
          </HStack>
          <ScrollView flex={1}>
            {places.map(renderPlaceItem)}
          </ScrollView>
        </Box>
      )}

      {/* Selected Place Details */}
      {selectedPlace && !showPlacesList && (
        <Box
          position="absolute"
          bottom={5}
          left={5}
          right={5}
          bg={colors.surface}
          borderRadius={16}
          p={5}
          shadow={5}
        >
          <HStack
            justifyContent="space-between"
            alignItems="flex-start"
            mb={4}
          >
            <VStack flex={1} mr={3}>
              <Text
                fontSize={18}
                fontWeight="600"
                color={colors.text}
                mb={1}
              >
                {selectedPlace.properties.name || selectedPlace.properties.label || 'İsimsiz Yer'}
              </Text>
              <Text
                fontSize={14}
                color={colors.textSecondary}
                mb={2}
              >
                {selectedPlace.properties.label || selectedPlace.properties.category || 'Detay bilgisi yok'}
              </Text>
              {selectedPlace.properties.category && (
                <HStack alignItems="center">
                  <Icon as={MaterialIcons} name="business" size={4} color={colors.info} />
                  <Text
                    fontSize={14}
                    color={colors.textSecondary}
                    ml={1}
                  >
                    {selectedPlace.properties.category}
                  </Text>
                </HStack>
              )}
            </VStack>
            <Pressable onPress={() => setSelectedPlace(null)}>
              <Icon as={MaterialIcons} name="close" size={6} color={colors.textSecondary} />
            </Pressable>
          </HStack>
          
          {/* Route Info */}
          {showRoute && routeInfo && (
            <HStack
              justifyContent="space-between"
              alignItems="center"
              bg={colors.primaryLight}
              borderRadius={12}
              p={3}
              mb={4}
            >
              <HStack alignItems="center">
                <HStack alignItems="center" mr={4}>
                  <Icon as={MaterialIcons} name="access-time" size={4} color={colors.textSecondary} />
                  <Text
                    fontSize={14}
                    fontWeight="600"
                    color={colors.primary}
                    ml={1}
                  >
                    {routeInfo.duration}
                  </Text>
                </HStack>
                <HStack alignItems="center">
                  <Icon as={MaterialIcons} name="location-on" size={4} color={colors.textSecondary} />
                  <Text
                    fontSize={14}
                    fontWeight="600"
                    color={colors.primary}
                    ml={1}
                  >
                    {routeInfo.distance}
                  </Text>
                </HStack>
              </HStack>
              <Pressable
                p={1}
                onPress={() => {
                  setShowRoute(false);
                  setRouteCoordinates([]);
                  setRouteInfo(null);
                }}
              >
                <Icon as={MaterialIcons} name="close" size={4} color={colors.textSecondary} />
              </Pressable>
            </HStack>
          )}
          
          <HStack justifyContent="space-around">
            <Pressable
              flexDirection="row"
              alignItems="center"
              px={5}
              py={3}
              bg={showRoute ? colors.primary : colors.primaryLight}
              borderRadius={12}
              flex={1}
              mx={1}
              justifyContent="center"
              onPress={handleGetDirections}
              disabled={loading}
            >
              {loading ? (
                <Spinner size="sm" color={colors.primary} />
              ) : (
                <Icon as={MaterialIcons} name="navigation" size={5} color={colors.primary} />
              )}
              <Text
                fontSize={14}
                fontWeight="600"
                color={colors.primary}
                ml={2}
              >
                {showRoute ? 'Rota Gösteriliyor' : 'Yol Tarifi'}
              </Text>
            </Pressable>
            
            <Pressable
              flexDirection="row"
              alignItems="center"
              px={5}
              py={3}
              bg={colors.primaryLight}
              borderRadius={12}
              flex={1}
              mx={1}
              justifyContent="center"
              onPress={() => {
                // Add to program or save location
                toast.show({
                  title: 'Bilgi',
                  description: 'Bu özellik yakında eklenecek.',
                });
              }}
            >
              <Icon as={MaterialIcons} name="bookmark" size={5} color={colors.primary} />
              <Text
                fontSize={14}
                fontWeight="600"
                color={colors.primary}
                ml={2}
              >
                Kaydet
              </Text>
            </Pressable>
          </HStack>
         </Box>
       )}
    </SafeAreaView>
  );
};



export default MapScreen;