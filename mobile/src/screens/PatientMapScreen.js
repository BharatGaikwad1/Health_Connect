import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  ActivityIndicator, 
  TouchableOpacity, 
  TextInput, 
  Platform, 
  Dimensions, 
  ScrollView,
  Linking,
  Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import { MotiView } from '../components/Motion';
import { api } from '../services/api';
import { THEMES, TYPOGRAPHY, SHADOWS, RADIUS } from '../constants/theme';
import { getDistance } from '../utils/distance';
import { AnimatedButton } from '../components/AnimatedButton';
import { 
  BrandLogoSvg, 
  IcuBedSvg, 
  VentilatorSvg, 
  GeneralWardBedSvg, 
  EmergencyCrossSvg, 
  HospitalFacilitySvg,
  LocationPinSvg,
  NavigationArrowSvg,
  CrosshairGpsSvg,
  SearchSvg,
  RefreshSyncSvg,
  CloseCrossSvg,
  CheckmarkSvg,
  PhoneCallSvg,
  AlertTriangleSvg,
  BedRosterGridSvg
} from '../components/icons';

const { width, height } = Dimensions.get('window');

import { 
  DEFAULT_COORDS, 
  DEFAULT_KOLHAPUR_HOSPITALS, 
  NEARBY_OFFSETS, 
  processHospitals 
} from '../constants/kolhapurHospitals';

const BED_FILTERS = [
  { id: 'ALL', label: 'All Hospitals', icon: 'apps' },
  { id: 'ICU', label: 'ICU Beds', icon: 'pulse' },
  { id: 'Emergency', label: 'Emergency', icon: 'medkit' },
  { id: 'Ventilator', label: 'Ventilator', icon: 'fitness' },
  { id: 'General', label: 'General Ward', icon: 'bed' },
];

const initialHospitals = processHospitals(DEFAULT_KOLHAPUR_HOSPITALS, DEFAULT_COORDS.latitude, DEFAULT_COORDS.longitude);

export default function PatientMapScreen({ navigation }) {
  const [hospitals, setHospitals] = useState(initialHospitals);
  const [location, setLocation] = useState(DEFAULT_COORDS);
  const [hasPermission, setHasPermission] = useState(true);
  const [canAskAgain, setCanAskAgain] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBedFilter, setSelectedBedFilter] = useState('ALL'); // 'ALL' | 'ICU' | 'Emergency' | 'Ventilator' | 'General'
  const [selectedHospital, setSelectedHospital] = useState(initialHospitals[0] || null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'list'
  const [activeRouteCoordinates, setActiveRouteCoordinates] = useState([]);
  const [navMeta, setNavMeta] = useState({ distance: '', duration: '', provider: '' });
  const [bedDetailModalHospital, setBedDetailModalHospital] = useState(null);
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const theme = THEMES.patient;

  // Freeze marker bitmap rendering after 600ms to eliminate Android 60 FPS overhead
  useEffect(() => {
    const timer = setTimeout(() => {
      setTracksViewChanges(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Request location and silent background refresh on mount
  useEffect(() => {
    checkAndRequestLocation();
  }, []);

  const checkAndRequestLocation = async () => {
    try {
      let status = 'granted';
      try {
        const checkRes = await Location.getForegroundPermissionsAsync();
        status = checkRes.status;
        setCanAskAgain(checkRes.canAskAgain);

        if (status !== 'granted') {
          const permRes = await Location.requestForegroundPermissionsAsync();
          status = permRes.status;
          setCanAskAgain(permRes.canAskAgain);
        }
      } catch (permErr) {
        console.warn('Foreground permission request error:', permErr);
      }

      if (status === 'granted') {
        setHasPermission(true);

        // Fast path 1: Instant last known GPS location (0ms latency)
        let userCoords = null;
        try {
          const lastLoc = await Location.getLastKnownPositionAsync();
          if (lastLoc?.coords) {
            userCoords = {
              latitude: lastLoc.coords.latitude,
              longitude: lastLoc.coords.longitude
            };
          }
        } catch (lastErr) {
          console.warn('Last known GPS error:', lastErr);
        }

        const activeCoords = userCoords || DEFAULT_COORDS;
        if (userCoords) {
          setLocation(userCoords);
          setHospitals(prev => processHospitals(prev.length > 0 ? prev : DEFAULT_KOLHAPUR_HOSPITALS, activeCoords.latitude, activeCoords.longitude));
        }

        // Concurrently fetch live bed status from backend
        fetchNearbyHospitals(activeCoords.latitude, activeCoords.longitude);

        // Async GPS refinement
        if (!userCoords) {
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low })
            .then(freshLoc => {
              if (freshLoc?.coords) {
                const freshCoords = { latitude: freshLoc.coords.latitude, longitude: freshLoc.coords.longitude };
                setLocation(freshCoords);
                setHospitals(prev => processHospitals(prev.length > 0 ? prev : DEFAULT_KOLHAPUR_HOSPITALS, freshCoords.latitude, freshCoords.longitude));
              }
            })
            .catch(() => {});
        }
      } else {
        fetchNearbyHospitals(DEFAULT_COORDS.latitude, DEFAULT_COORDS.longitude);
      }
    } catch (err) {
      console.warn('Location retrieval error:', err);
    }
  };

  const fetchNearbyHospitals = async (userLat, userLng) => {
    try {
      let rawHospitals = [];
      try {
        const res = await api.get('/hospitals');
        rawHospitals = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        try {
          const res = await api.get('/admin/hospitals');
          rawHospitals = Array.isArray(res.data) ? res.data.filter(h => h.status === 'approved') : [];
        } catch (adminErr) {}
      }

      if (rawHospitals.length === 0) {
        rawHospitals = DEFAULT_KOLHAPUR_HOSPITALS;
      }

      const allNearby = processHospitals(rawHospitals, userLat, userLng);
      setHospitals(allNearby);
      if (!selectedHospital && allNearby.length > 0) {
        setSelectedHospital(allNearby[0]);
      }

      // Smoothly animate map camera to frame user location and all discovered hospitals
      if (mapRef.current && allNearby.length > 0) {
        const isNearKolhapur = getDistance(userLat, userLng, DEFAULT_COORDS.latitude, DEFAULT_COORDS.longitude) <= 50;
        const coordsToFit = isNearKolhapur 
          ? [{ latitude: userLat, longitude: userLng }, ...allNearby.map(h => ({ latitude: h.lat, longitude: h.lng }))]
          : allNearby.map(h => ({ latitude: h.lat, longitude: h.lng }));
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(
            coordsToFit,
            {
              edgePadding: { top: 130, right: 60, bottom: 380, left: 60 },
              animated: true,
            }
          );
        }, 500);
      }
    } catch (err) {
      console.error('Error fetching hospitals:', err);
    }
  };

  const handleSelectHospital = (hospital) => {
    setSelectedHospital(hospital);
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: hospital.lat,
        longitude: hospital.lng,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      }, 400);
    }
  };

  const handleStartInAppNavigation = async (hospitalToNav) => {
    const target = hospitalToNav || selectedHospital;
    if (!target) return;
    
    setSelectedHospital(target);
    setIsNavigating(true);
    setViewMode('map');

    // 1. Immediate visual feedback: generate preliminary route
    if (location) {
      const immediatePoints = generateRouteCoordinates(location, target);
      setActiveRouteCoordinates(immediatePoints);
      setNavMeta({
        distance: `${target.distance} km`,
        duration: `~${Math.max(2, Math.round(target.distance * 3.5))} mins`,
        provider: 'Routing Engine'
      });
    }

    // 2. Query backend for real turn-by-turn road route via OpenStreetMap (OSRM)
    if (location && target.lat && target.lng) {
      try {
        const res = await api.get('/navigation/directions', {
          params: {
            originLat: location.latitude,
            originLng: location.longitude,
            destLat: target.lat,
            destLng: target.lng,
          }
        });

        if (res.data?.status === 'OK' && res.data.coordinates?.length > 0) {
          setActiveRouteCoordinates(res.data.coordinates);
          setNavMeta({
            distance: res.data.distance || `${target.distance} km`,
            duration: res.data.duration || `~${Math.max(2, Math.round(target.distance * 3.5))} mins`,
            provider: res.data.provider || 'OpenStreetMap (OSRM)'
          });
        }
      } catch (err) {
        console.warn('Navigation directions query failed, keeping local route:', err.message);
      }
    }

    if (mapRef.current && location) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: location.latitude, longitude: location.longitude },
          { latitude: target.lat, longitude: target.lng }
        ],
        {
          edgePadding: { top: 140, right: 60, bottom: 280, left: 60 },
          animated: true,
        }
      );
    }
  };

  const handleExitNavigation = () => {
    setIsNavigating(false);
    setActiveRouteCoordinates([]);
    setNavMeta({ distance: '', duration: '', provider: '' });
  };

  const handleOpenGoogleMapsDirections = (hospital) => {
    const target = hospital || selectedHospital;
    if (!target) return;

    setSelectedHospital(target);

    const destLat = target.lat;
    const destLng = target.lng;
    const destName = encodeURIComponent(target.name || 'Hospital');

    // Patient current GPS location as starting point
    const userLat = location?.latitude;
    const userLng = location?.longitude;

    // Google Maps universal web directions URL with origin and destination
    const webDirectionsUrl = (userLat && userLng)
      ? `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destLat},${destLng}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;

    if (Platform.OS === 'android') {
      // Direct turn-by-turn driving navigation in Google Maps app on Android
      const googleNavUri = `google.navigation:q=${destLat},${destLng}&mode=d`;
      Linking.canOpenURL(googleNavUri)
        .then((supported) => {
          if (supported) {
            Linking.openURL(googleNavUri);
          } else {
            Linking.openURL(webDirectionsUrl);
          }
        })
        .catch(() => {
          Linking.openURL(webDirectionsUrl);
        });
    } else if (Platform.OS === 'ios') {
      const googleMapsIos = `comgooglemaps://?saddr=${userLat},${userLng}&daddr=${destLat},${destLng}&directionsmode=driving`;
      Linking.canOpenURL(googleMapsIos)
        .then((supported) => {
          if (supported) {
            Linking.openURL(googleMapsIos);
          } else {
            Linking.openURL(webDirectionsUrl);
          }
        })
        .catch(() => {
          Linking.openURL(webDirectionsUrl);
        });
    } else {
      Linking.openURL(webDirectionsUrl);
    }
  };

  const handleOpenTurnByTurnNavigation = handleOpenGoogleMapsDirections;

  // Generate smooth street-like polyline coordinates from patient to hospital
  const generateRouteCoordinates = (start, end) => {
    if (!start || !end) return [];
    const points = [];
    const segments = 6;
    const dLat = (end.lat - start.latitude) / segments;
    const dLng = (end.lng - start.longitude) / segments;

    points.push({ latitude: start.latitude, longitude: start.longitude });

    for (let i = 1; i < segments; i++) {
      const deviation = Math.sin((i / segments) * Math.PI) * 0.0016 * (i % 2 === 0 ? 1 : -0.8);
      points.push({
        latitude: start.latitude + dLat * i + deviation,
        longitude: start.longitude + dLng * i - deviation * 0.5,
      });
    }

    points.push({ latitude: end.lat, longitude: end.lng });
    return points;
  };

  // Filter hospitals using bed names/categories for currently available beds
  const filteredHospitals = hospitals.filter(h => {
    // 1. Bed quick-filter chip constraint
    if (selectedBedFilter !== 'ALL') {
      if (selectedBedFilter === 'ICU' && !(h.icuAvailable > 0)) return false;
      if (selectedBedFilter === 'Emergency' && !(h.emergencyAvailable > 0)) return false;
      if (selectedBedFilter === 'Ventilator' && !(h.ventilatorAvailable > 0)) return false;
      if (selectedBedFilter === 'General' && !(h.generalAvailable > 0)) return false;
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    // 2. Intelligent bed name search in query string:
    // When a patient searches for a bed (e.g. 'icu', 'ventilator', 'emergency', 'general'),
    // it MUST ONLY match hospitals having that bed AVAILABLE at this time!
    const isIcuQuery = q.includes('icu') || q.includes('intensive');
    const isVentQuery = q.includes('vent') || q.includes('respirator');
    const isEmergencyQuery = q.includes('emerg') || q.includes('er') || q.includes('trauma') || q.includes('casualty');
    const isGeneralQuery = q.includes('general') || q.includes('ward') || q.includes('normal');
    const isGenericBedQuery = q === 'bed' || q === 'beds' || q.includes('available bed');

    if (isIcuQuery) {
      return (h.icuAvailable > 0);
    }
    if (isVentQuery) {
      return (h.ventilatorAvailable > 0);
    }
    if (isEmergencyQuery) {
      return (h.emergencyAvailable > 0);
    }
    if (isGeneralQuery) {
      return (h.generalAvailable > 0);
    }
    if (isGenericBedQuery) {
      return (h.totalAvailable > 0);
    }

    // Check specific custom categories in bed records
    if (Array.isArray(h.beds)) {
      const matchInBeds = h.beds.find(b => b.category.toLowerCase().includes(q) && b.available > 0);
      if (matchInBeds) return true;
    }

    // Default search matches hospital name or address
    return (
      h.name.toLowerCase().includes(q) ||
      h.address?.toLowerCase().includes(q)
    );
  });

  // Ensure selected hospital stays in sync with current filtered results
  useEffect(() => {
    if (filteredHospitals.length > 0) {
      const exists = filteredHospitals.some(h => h._id === selectedHospital?._id);
      if (!exists) {
        setSelectedHospital(filteredHospitals[0]);
      }
    }
  }, [filteredHospitals, selectedHospital]);

  // Identify active bed match to render badge
  const getActiveBedMatch = (hospital) => {
    const q = searchQuery.toLowerCase().trim();
    if (selectedBedFilter === 'ICU' || q.includes('icu') || q.includes('intensive')) {
      return { label: `${hospital.icuAvailable} ICU Beds Available`, color: '#EF4444', bg: '#FEE2E2', type: 'ICU' };
    }
    if (selectedBedFilter === 'Emergency' || q.includes('emerg') || q.includes('er')) {
      return { label: `${hospital.emergencyAvailable} Emergency Beds Ready`, color: '#F59E0B', bg: '#FEF3C7', type: 'Emergency' };
    }
    if (selectedBedFilter === 'Ventilator' || q.includes('vent')) {
      return { label: `${hospital.ventilatorAvailable} Ventilators Ready`, color: '#6366F1', bg: '#E0E7FF', type: 'Ventilator' };
    }
    if (selectedBedFilter === 'General' || q.includes('general')) {
      return { label: `${hospital.generalAvailable} General Beds Free`, color: '#3B82F6', bg: '#DBEAFE', type: 'General' };
    }
    return null;
  };

  // Render comprehensive 4-ward bed availability grid
  const renderBedBreakdown = (hospital, isModal = false) => {
    if (!hospital) return null;
    const match = getActiveBedMatch(hospital);

    const renderMatchBedIcon = (type, color) => {
      if (type === 'ICU') return <IcuBedSvg size={14} color={color} style={{ marginRight: 6 }} />;
      if (type === 'Emergency') return <EmergencyCrossSvg size={14} color={color} style={{ marginRight: 6 }} />;
      if (type === 'Ventilator') return <VentilatorSvg size={14} color={color} style={{ marginRight: 6 }} />;
      return <GeneralWardBedSvg size={14} color={color} style={{ marginRight: 6 }} />;
    };

    const getRatio = (avail, tot) => {
      if (!tot || tot <= 0) return 0;
      return Math.min(1, Math.max(0, avail / tot));
    };

    const getOccupancyColor = (avail, tot) => {
      const ratio = getRatio(avail, tot);
      if (ratio === 0) return '#EF4444';
      if (ratio < 0.25) return '#F59E0B';
      return '#10B981';
    };

    const wards = [
      {
        id: 'ICU',
        name: 'ICU',
        avail: hospital.icuAvailable ?? 0,
        total: hospital.icuTotal ?? 20,
        icon: (c) => <IcuBedSvg size={13} color={c} />,
        active: selectedBedFilter === 'ICU' || searchQuery.toLowerCase().includes('icu'),
        bg: '#FEE2E2',
        color: '#EF4444',
      },
      {
        id: 'Emergency',
        name: 'ER',
        avail: hospital.emergencyAvailable ?? 0,
        total: hospital.emergencyTotal ?? 25,
        icon: (c) => <EmergencyCrossSvg size={13} color={c} />,
        active: selectedBedFilter === 'Emergency' || searchQuery.toLowerCase().includes('emerg'),
        bg: '#FEF3C7',
        color: '#F59E0B',
      },
      {
        id: 'General',
        name: 'General',
        avail: hospital.generalAvailable ?? 0,
        total: hospital.generalTotal ?? 50,
        icon: (c) => <GeneralWardBedSvg size={13} color={c} />,
        active: selectedBedFilter === 'General' || searchQuery.toLowerCase().includes('general'),
        bg: '#DBEAFE',
        color: '#3B82F6',
      },
      {
        id: 'Ventilator',
        name: 'Vent',
        avail: hospital.ventilatorAvailable ?? 0,
        total: hospital.ventilatorTotal ?? 10,
        icon: (c) => <VentilatorSvg size={13} color={c} />,
        active: selectedBedFilter === 'Ventilator' || searchQuery.toLowerCase().includes('vent'),
        bg: '#E0E7FF',
        color: '#6366F1',
      },
    ];

    return (
      <View style={styles.bedSectionWrapper}>
        <View style={styles.bedSectionHeader}>
          <View style={styles.liveBedStatusRow}>
            <View style={styles.radarDotPulse} />
            <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, letterSpacing: 0.4 }]} numberOfLines={1}>
              REAL-TIME BEDS
            </Text>
          </View>
          <View style={[styles.totalBedPill, { backgroundColor: theme.successLight, flexShrink: 0 }]}>
            <Text style={[TYPOGRAPHY.captionBold, { color: theme.success, fontSize: 11 }]}>
              {hospital.totalAvailable} / {hospital.totalCapacity} FREE
            </Text>
          </View>
        </View>

        {/* Highlight Searched Bed Type if user searched by bed name */}
        {match && (
          <View style={[styles.searchedBedMatchPill, { backgroundColor: match.bg, borderColor: match.color }]}>
            {renderMatchBedIcon(match.type, match.color)}
            <Text style={[TYPOGRAPHY.captionBold, { color: match.color, fontSize: 11 }]} numberOfLines={1}>
              MATCHED: {match.label.toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.bedGrid}>
          {wards.map((w) => {
            const barColor = getOccupancyColor(w.avail, w.total);
            const ratio = getRatio(w.avail, w.total);
            return (
              <View 
                key={w.id}
                style={[
                  styles.bedCard, 
                  { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                  w.active && { borderColor: w.color, borderWidth: 1.5, backgroundColor: w.bg }
                ]}
              >
                <View style={styles.bedCardTop}>
                  <View style={[styles.bedIconBadge, { backgroundColor: w.bg }]}>
                    {w.icon(w.color)}
                  </View>
                  <Text style={[TYPOGRAPHY.micro, { color: theme.textMuted, fontSize: 9.5 }]} numberOfLines={1}>
                    {w.name}
                  </Text>
                </View>

                <Text style={[TYPOGRAPHY.h3, { color: theme.text, marginTop: 2, fontSize: 14 }]} numberOfLines={1}>
                  {w.avail}
                  <Text style={[TYPOGRAPHY.caption, { color: theme.textMuted, fontSize: 10 }]}>/{w.total}</Text>
                </Text>

                {/* Mini Occupancy Meter Bar */}
                <View style={styles.miniBarTrack}>
                  <View style={[styles.miniBarFill, { width: `${Math.round(ratio * 100)}%`, backgroundColor: barColor }]} />
                </View>

                <Text style={[TYPOGRAPHY.micro, { color: barColor, fontSize: 9, fontWeight: '700', marginTop: 3 }]}>
                  {w.avail > 0 ? `${w.avail} Free` : 'Full'}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Action to view full detailed breakdown */}
        {!isModal && (
          <TouchableOpacity 
            style={styles.viewBedDetailLink}
            onPress={() => setBedDetailModalHospital(hospital)}
            activeOpacity={0.7}
          >
            <BedRosterGridSvg size={12} color={theme.primary} style={{ marginRight: 4 }} />
            <Text style={[TYPOGRAPHY.micro, { color: theme.primary, fontWeight: '700' }]}>
              TAP TO VIEW ALL BED DETAILS →
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // 1. Mandatory Location Access Gate (Application will not open without permission)
  if (!hasPermission && !loading) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: theme.background }]}>
        <MotiView 
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 16 }}
          style={[styles.permissionCard, SHADOWS.large, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <View style={[styles.permissionIconBadge, { backgroundColor: theme.accentLight }]}>
            <LocationPinSvg size={42} color={theme.accent} />
          </View>
          
          <Text style={[TYPOGRAPHY.h2, { color: theme.text, textAlign: 'center', marginTop: 18 }]}>
            Location Access Required
          </Text>
          
          <Text style={[TYPOGRAPHY.body, { color: theme.textSecondary, textAlign: 'center', marginTop: 10, lineHeight: 22 }]}>
            Health Connect cannot start without location access. Live GPS coordinates are required to locate nearby emergency hospitals, calculate distance, and navigate patients in emergencies.
          </Text>

          <View style={[styles.permissionNoticePill, { backgroundColor: theme.surfaceSubtle }]}>
            <CheckmarkSvg size={16} color={theme.primary} circled={true} style={{ marginRight: 6 }} />
            <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>
              Live GPS Proximity Sorting Active
            </Text>
          </View>

          <View style={{ width: '100%', marginTop: 24, gap: 12 }}>
            <AnimatedButton
              title="Grant Location Access"
              onPress={checkAndRequestLocation}
              theme={theme}
              icon={<NavigationArrowSvg size={18} color="#FFFFFF" />}
            />

            {!canAskAgain && (
              <TouchableOpacity
                style={[styles.skipButton, { backgroundColor: theme.surfaceSubtle, borderWidth: 1, borderColor: theme.border }]}
                onPress={() => Linking.openSettings()}
                activeOpacity={0.7}
              >
                <Text style={[TYPOGRAPHY.captionBold, { color: theme.primary, textAlign: 'center' }]}>
                  Open App Settings ⚙️
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
              activeOpacity={0.7}
            >
              <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary, textAlign: 'center' }]}>
                ← Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        </MotiView>
      </View>
    );
  }

  // 2. Loading State (Non-blocking: only show if no coordinates exist at all)
  if (loading && !location) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[TYPOGRAPHY.bodyMedium, { color: theme.textSecondary, marginTop: 14 }]}>
          Acquiring GPS coordinates & locating all nearby hospitals...
        </Text>
      </View>
    );
  }

  const routePoints = (isNavigating && selectedHospital) 
    ? (activeRouteCoordinates && activeRouteCoordinates.length > 0 
        ? activeRouteCoordinates 
        : generateRouteCoordinates(location, selectedHospital)) 
    : [];

  return (
    <View style={styles.container}>
      {/* Interactive Map (Powered by OpenStreetMap) */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
        mapType="standard"
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {/* OpenStreetMap CartoDB Voyager Layer (100% Free, Zero Google Maps Dependency) */}
        <UrlTile
          urlTemplate="https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
          maximumZ={19}
          tileSize={256}
          flipY={false}
          zIndex={1}
        />

        {/* Hospital Markers: Custom Callout with Universal 'H' & Cross Hospital Sign & Live Bed Count */}
        {filteredHospitals.map((hospital) => {
          const isSelected = selectedHospital?._id === hospital._id;
          const match = getActiveBedMatch(hospital);
          return (
            <Marker
              key={hospital._id}
              tracksViewChanges={tracksViewChanges || isSelected}
              coordinate={{ latitude: hospital.lat, longitude: hospital.lng }}
              title={hospital.name}
              description={`Tap to Navigate in Google Maps • ${hospital.distance} km • ${hospital.totalAvailable} Beds Free`}
              pinColor={isSelected ? "#E11D48" : "#2563EB"}
              onPress={() => handleSelectHospital(hospital)}
              onCalloutPress={() => handleOpenGoogleMapsDirections(hospital)}
            >
              <View style={styles.markerContainer}>
                {/* Distinct Hospital Emergency Sign (H + Medical Cross) */}
                <View style={[
                  styles.customMarker, 
                  { backgroundColor: isSelected ? '#DC2626' : '#2563EB' },
                  SHADOWS.medium
                ]}>
                  <View style={styles.hospitalSignWrapper}>
                    <Text style={styles.hospitalSignText}>H</Text>
                    <EmergencyCrossSvg size={9} color="#FFFFFF" style={styles.hospitalSignCross} />
                  </View>
                </View>
                {/* Pin pointer tip */}
                <View style={[
                  styles.markerPointer,
                  { borderTopColor: isSelected ? '#DC2626' : '#2563EB' }
                ]} />
                <View style={[
                  styles.markerBedBadge, 
                  { backgroundColor: match ? match.color : (isSelected ? '#DC2626' : '#0F172A') }
                ]}>
                  <Text style={styles.markerBedBadgeText}>
                    {match ? `${match.label.split(' ')[0]} ${selectedBedFilter !== 'ALL' ? selectedBedFilter : 'Bed'}` : `${hospital.totalAvailable} Free`}
                  </Text>
                </View>
              </View>
            </Marker>
          );
        })}

        {/* In-App Direct Polyline Route from Patient to Hospital */}
        {isNavigating && selectedHospital && routePoints.length > 0 && (
          <Polyline
            coordinates={routePoints}
            strokeColor="#2563EB"
            strokeWidth={5}
            lineDashPattern={[0]}
          />
        )}
      </MapView>

      {/* OpenStreetMap Attribution Badge */}
      <View style={styles.osmBadge}>
        <LocationPinSvg size={11} color="#475569" style={{ marginRight: 4 }} />
        <Text style={styles.osmBadgeText}>OpenStreetMap & OSRM Engine</Text>
      </View>

      {/* Floating Top Controls (Search & Bed Name Filter Pills + Proximity Status) */}
      {!isNavigating ? (
        <MotiView 
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={[styles.topControls, { top: insets.top + (Platform.OS === 'android' ? 8 : 6) }]}
        >
          {/* Vicinity Header Banner with Mode Toggle */}
          <View style={[styles.proximityBanner, SHADOWS.soft, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.proximityLeft}>
              <View style={[styles.hospitalHeaderBadge, { backgroundColor: theme.primaryLight, borderColor: theme.primaryBorder, borderWidth: 1, paddingHorizontal: 5, paddingVertical: 4 }]}>
                <HospitalFacilitySvg size={18} color={theme.primary} />
              </View>
              <View style={{ marginLeft: 8 }}>
                <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>
                  {filteredHospitals.length} Nearby Hospitals Found
                </Text>
                <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary }]}>
                  OpenStreetMap Live View
                </Text>
              </View>
            </View>

            {/* View Mode Segment Switch: Map vs List */}
            <View style={styles.modeSwitchRow}>
              <TouchableOpacity
                style={[
                  styles.modeTab,
                  viewMode === 'map' && { backgroundColor: theme.primaryLight, borderColor: theme.primary }
                ]}
                onPress={() => setViewMode('map')}
                activeOpacity={0.7}
              >
                <LocationPinSvg size={14} color={viewMode === 'map' ? theme.primary : theme.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeTab,
                  viewMode === 'list' && { backgroundColor: theme.primaryLight, borderColor: theme.primary }
                ]}
                onPress={() => setViewMode('list')}
                activeOpacity={0.7}
              >
                <BedRosterGridSvg size={14} color={viewMode === 'list' ? theme.primary : theme.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => checkAndRequestLocation()}
                style={[styles.refreshChip, { backgroundColor: theme.surfaceSubtle }]}
                activeOpacity={0.7}
              >
                <RefreshSyncSvg size={14} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Search Bar with Bed Name Search Support */}
          <View style={[styles.searchBox, SHADOWS.soft, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <SearchSvg size={18} color={theme.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, TYPOGRAPHY.body, { color: theme.text }]}
              placeholder="Search by hospital name or bed (ICU, Ventilator, ER)..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <CloseCrossSvg size={18} color={theme.textMuted} circled={true} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* 1-Tap Bed Category Filters */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bedFilterChipsScroll}
          >
            {BED_FILTERS.map((f) => {
              const active = selectedBedFilter === f.id;
              const iconColor = active ? '#FFFFFF' : theme.textSecondary;
              const renderChipIcon = () => {
                if (f.id === 'ICU') return <IcuBedSvg size={13} color={iconColor} style={{ marginRight: 5 }} />;
                if (f.id === 'Emergency') return <EmergencyCrossSvg size={13} color={iconColor} style={{ marginRight: 5 }} />;
                if (f.id === 'Ventilator') return <VentilatorSvg size={13} color={iconColor} style={{ marginRight: 5 }} />;
                if (f.id === 'General') return <GeneralWardBedSvg size={13} color={iconColor} style={{ marginRight: 5 }} />;
                return <HospitalFacilitySvg size={13} color={iconColor} crossColor={iconColor} style={{ marginRight: 5 }} />;
              };

              return (
                <TouchableOpacity
                  key={f.id}
                  style={[
                    styles.bedFilterChip,
                    SHADOWS.sm,
                    {
                      backgroundColor: active ? theme.primary : theme.surface,
                      borderColor: active ? theme.primary : theme.border,
                    }
                  ]}
                  onPress={() => setSelectedBedFilter(f.id)}
                  activeOpacity={0.8}
                >
                  {renderChipIcon()}
                  <Text style={[
                    TYPOGRAPHY.captionBold, 
                    { color: active ? '#FFFFFF' : theme.text, fontSize: 11.5 }
                  ]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </MotiView>
      ) : (
        /* In-App Active Navigation HUD */
        <MotiView 
          from={{ opacity: 0, translateY: -30 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={[styles.navigationHUD, { top: insets.top + (Platform.OS === 'android' ? 8 : 6) }]}
        >
          <View style={[styles.navHUDCard, SHADOWS.large, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.navIconBox, { backgroundColor: theme.primary }]}>
              <NavigationArrowSvg size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <Text style={[TYPOGRAPHY.micro, { color: theme.primary, letterSpacing: 0.5 }]}>
                  ACTIVE EMERGENCY ROUTING
                </Text>
                {navMeta?.provider ? (
                  <View style={{ backgroundColor: theme.primaryLight || '#EEF2FF', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, marginLeft: 6 }}>
                    <Text style={{ fontSize: 9, fontWeight: '700', color: theme.primary }}>
                      {navMeta.provider}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text style={[TYPOGRAPHY.h3, { color: theme.text }]} numberOfLines={1}>
                {selectedHospital.name}
              </Text>
              <Text style={[TYPOGRAPHY.captionBold, { color: theme.accent, marginTop: 2 }]}>
                {navMeta?.distance ? `${navMeta.distance} • ${navMeta.duration}` : `${selectedHospital.distance} km away`} • {selectedHospital.totalAvailable} Beds Ready
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.exitNavBtn, { backgroundColor: theme.accentLight }]}
              onPress={handleExitNavigation}
              activeOpacity={0.7}
            >
              <Text style={[TYPOGRAPHY.captionBold, { color: theme.accent }]}>End</Text>
            </TouchableOpacity>
          </View>
        </MotiView>
      )}

      {/* Recenter GPS Button (in Map Mode) */}
      {viewMode === 'map' && (
        <TouchableOpacity 
          style={[styles.recenterBtn, SHADOWS.medium, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => {
            if (mapRef.current && location) {
              mapRef.current.animateToRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }, 300);
            }
          }}
          activeOpacity={0.7}
        >
          <CrosshairGpsSvg size={22} color={theme.primary} />
        </TouchableOpacity>
      )}

      {/* LIST VIEW OVERLAY: Guaranteed full visibility of all nearby hospitals & all beds side-by-side */}
      {viewMode === 'list' && !isNavigating && (
        <View style={[styles.listOverlay, { top: insets.top + 168, backgroundColor: theme.background }]}>
          <ScrollView 
            contentContainerStyle={[styles.listScroll, { paddingBottom: insets.bottom + 90 }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.listHeaderRow}>
              <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, letterSpacing: 0.5 }]}>
                {selectedBedFilter !== 'ALL' 
                  ? `HOSPITALS WITH AVAILABLE ${selectedBedFilter.toUpperCase()} BEDS (${filteredHospitals.length})` 
                  : `ALL NEARBY HOSPITALS & LIVE BED STATUS (${filteredHospitals.length} FOUND)`}
              </Text>
              <View style={[styles.badgePill, { backgroundColor: theme.primaryLight }]}>
                <Text style={[TYPOGRAPHY.micro, { color: theme.primary }]}>NEAREST FIRST</Text>
              </View>
            </View>

            {/* Empty State when no hospital matches the bed search */}
            {filteredHospitals.length === 0 && (
              <View style={[styles.emptyContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <SearchSvg size={40} color={theme.textMuted} />
                <Text style={[TYPOGRAPHY.h3, { color: theme.text, marginTop: 12, textAlign: 'center' }]}>
                  No Hospitals Found With Available Beds
                </Text>
                <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary, marginTop: 6, textAlign: 'center', lineHeight: 18 }]}>
                  No medical facilities currently have available {selectedBedFilter !== 'ALL' ? selectedBedFilter : searchQuery} beds right now.
                </Text>
                <TouchableOpacity
                  style={[styles.resetSearchBtn, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    setSelectedBedFilter('ALL');
                    setSearchQuery('');
                  }}
                >
                  <Text style={[TYPOGRAPHY.captionBold, { color: '#FFFFFF' }]}>Reset Bed Filters</Text>
                </TouchableOpacity>
              </View>
            )}

            {filteredHospitals.map((hospital, idx) => (
              <MotiView
                key={hospital._id}
                from={{ opacity: 0, translateY: 15 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: idx * 60, type: 'timing', duration: 280 }}
                style={[styles.hospitalListCard, SHADOWS.medium, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                {/* Hospital Header & Distance */}
                <View style={styles.cardHeaderRow}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={[TYPOGRAPHY.h2, { color: theme.text, fontSize: 17 }]} numberOfLines={1}>
                      {hospital.name}
                    </Text>
                    <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary, marginTop: 2 }]}>
                      {hospital.address}
                    </Text>
                  </View>
                  <View style={[styles.distancePill, { backgroundColor: theme.primaryLight, borderColor: theme.primaryBorder }]}>
                    <NavigationArrowSvg size={13} color={theme.primary} style={{ marginRight: 4 }} />
                    <Text style={[TYPOGRAPHY.captionBold, { color: theme.primary }]}>
                      {hospital.distance} km
                    </Text>
                  </View>
                </View>

                {/* All Available Beds Breakdown */}
                {renderBedBreakdown(hospital)}

                {/* Hospital Contact Strip with 1-Tap Dial */}
                <View style={[styles.contactStrip, { backgroundColor: theme.surfaceSubtle }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 }}>
                    <PhoneCallSvg size={14} color={theme.primary} style={{ marginRight: 6 }} />
                    <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]} numberOfLines={1}>
                      {hospital.contactNumber || '+91 231 264 1125'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.callBtnPill, { backgroundColor: theme.success }]}
                    onPress={() => Linking.openURL(`tel:${hospital.contactNumber || '+91 231 264 1125'}`)}
                    activeOpacity={0.8}
                  >
                    <PhoneCallSvg size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={[TYPOGRAPHY.micro, { color: '#FFFFFF', fontWeight: '700' }]}>CALL</Text>
                  </TouchableOpacity>
                </View>

                {/* Navigation CTA: Directly opens Google Maps directions */}
                <View style={styles.actionRow}>
                  <View style={{ flex: 1 }}>
                    <AnimatedButton
                      title={`Navigate in Google Maps (${hospital.distance} km)`}
                      onPress={() => handleOpenGoogleMapsDirections(hospital)}
                      theme={theme}
                      icon={<NavigationArrowSvg size={18} color="#FFFFFF" />}
                    />
                  </View>
                  <TouchableOpacity
                    style={[styles.externalMapsBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
                    onPress={() => handleOpenGoogleMapsDirections(hospital)}
                    activeOpacity={0.7}
                  >
                    <LocationPinSvg size={18} color={theme.primary} />
                  </TouchableOpacity>
                </View>
              </MotiView>
            ))}
            <View style={{ height: 120 }} />
          </ScrollView>
        </View>
      )}

      {/* MAP VIEW BOTTOM DOCK: Discovered Hospitals Horizontal Switcher + Selected Hospital Bed Dashboard */}
      {viewMode === 'map' && (
        <View style={[styles.bottomDockContainer, { bottom: Math.max(insets.bottom, 12) }]}>
          {filteredHospitals.length === 0 ? (
            /* Empty Bed Match Notice Card in Map View */
            <View style={[styles.bottomCard, SHADOWS.large, { backgroundColor: theme.surface, borderColor: theme.border, alignItems: 'center', paddingVertical: 20 }]}>
              <AlertTriangleSvg size={32} color={theme.accent} />
              <Text style={[TYPOGRAPHY.h3, { color: theme.text, marginTop: 8 }]}>
                No Hospitals With {selectedBedFilter !== 'ALL' ? selectedBedFilter : 'Matching'} Beds Available
              </Text>
              <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary, marginTop: 4, textAlign: 'center' }]}>
                No facility currently has free beds in this category nearby.
              </Text>
              <TouchableOpacity
                style={[styles.resetSearchBtn, { backgroundColor: theme.primary, marginTop: 12 }]}
                onPress={() => {
                  setSelectedBedFilter('ALL');
                  setSearchQuery('');
                }}
              >
                <Text style={[TYPOGRAPHY.captionBold, { color: '#FFFFFF' }]}>Show All Available Beds</Text>
              </TouchableOpacity>
            </View>
          ) : selectedHospital ? (
            <>
              {/* 1. All Discovered Hospitals Horizontal Switcher (Unblocked & Visible) */}
              {!isNavigating && filteredHospitals.length > 0 && (
                <View style={styles.discoveredRowContainer}>
                  <View style={styles.discoveredHeader}>
                    <Text style={[TYPOGRAPHY.micro, { color: '#0F172A', fontWeight: '800', letterSpacing: 0.5 }]}>
                      {selectedBedFilter !== 'ALL' ? `HOSPITALS WITH ${selectedBedFilter.toUpperCase()} BEDS (${filteredHospitals.length})` : `ALL NEARBY HOSPITALS (${filteredHospitals.length})`}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => selectedHospital && setBedDetailModalHospital(selectedHospital)}
                      activeOpacity={0.7}
                    >
                      <Text style={[TYPOGRAPHY.micro, { color: theme.primary, fontWeight: '700' }]}>
                        ALL BEDS ↗
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.discoveredScroll}
                  >
                    {filteredHospitals.map((item) => {
                      const isSelected = selectedHospital?._id === item._id;
                      const match = getActiveBedMatch(item);
                      return (
                        <TouchableOpacity
                          key={item._id}
                          style={[
                            styles.hospitalChip,
                            SHADOWS.sm,
                            {
                              backgroundColor: isSelected ? theme.surface : '#FFFFFF',
                              borderColor: isSelected ? theme.primary : theme.border,
                              borderWidth: isSelected ? 2 : 1,
                            }
                          ]}
                          onPress={() => handleSelectHospital(item)}
                          activeOpacity={0.7}
                        >
                          <View style={[
                            styles.chipIconBox, 
                            { backgroundColor: isSelected ? theme.primaryLight : theme.surfaceSubtle }
                          ]}>
                            <HospitalFacilitySvg 
                              size={15} 
                              color={isSelected ? theme.primary : theme.textMuted} 
                            />
                          </View>
                          <View style={styles.chipContent}>
                            <Text 
                              style={[
                                TYPOGRAPHY.captionBold, 
                                styles.chipName,
                                { color: isSelected ? theme.primary : theme.text }
                              ]} 
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {item.name || 'Hospital'}
                            </Text>
                            <View style={styles.chipMetaRow}>
                              <Text style={[TYPOGRAPHY.micro, { color: theme.primary, fontWeight: '700' }]}>
                                {item.distance} km
                              </Text>
                              <Text style={[TYPOGRAPHY.micro, { color: theme.textMuted }]}> • </Text>
                              <Text style={[TYPOGRAPHY.micro, { color: item.totalAvailable > 0 ? theme.success : '#EF4444', fontWeight: '700' }]}>
                                {match ? match.label : `${item.totalAvailable} free`}
                              </Text>
                            </View>
                          </View>
                          {isSelected && (
                            <View style={[styles.activeDot, { backgroundColor: theme.primary }]} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* 2. Selected Hospital Detailed Bed Dashboard Card */}
              <MotiView
                from={{ opacity: 0, translateY: 40 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', damping: 18 }}
                style={[styles.bottomCard, SHADOWS.large, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: height * 0.44 }} bounces={false}>
                  {/* Header with Distance Pill */}
                  <View style={styles.cardHeaderRow}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <View style={styles.verifiedRow}>
                        <Text style={[TYPOGRAPHY.h2, { color: theme.text, fontSize: 17 }]} numberOfLines={1}>
                          {selectedHospital.name}
                        </Text>
                        <CheckmarkSvg size={17} color={theme.success} circled={true} style={{ marginLeft: 5 }} />
                      </View>
                      <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary, marginTop: 2 }]} numberOfLines={1}>
                        {selectedHospital.address}
                      </Text>
                    </View>

                    {/* Real-Time Distance Badge */}
                    <View style={[styles.distancePill, { backgroundColor: theme.primaryLight, borderColor: theme.primaryBorder }]}>
                      <NavigationArrowSvg size={12} color={theme.primary} style={{ marginRight: 3 }} />
                      <Text style={[TYPOGRAPHY.captionBold, { color: theme.primary, fontSize: 12 }]}>
                        {selectedHospital.distance} km
                      </Text>
                    </View>
                  </View>

                  {/* All Available Beds Breakdown */}
                  {renderBedBreakdown(selectedHospital)}

                  {/* Hospital Contact Bar with Direct Call Button */}
                  <View style={[styles.contactStrip, { backgroundColor: theme.surfaceSubtle }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 }}>
                      <PhoneCallSvg size={14} color={theme.primary} style={{ marginRight: 6 }} />
                      <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]} numberOfLines={1}>
                        {selectedHospital.contactNumber || '+91 231 264 1125'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.callBtnPill, { backgroundColor: theme.success }]}
                      onPress={() => Linking.openURL(`tel:${selectedHospital.contactNumber || '+91 231 264 1125'}`)}
                      activeOpacity={0.8}
                    >
                      <PhoneCallSvg size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={[TYPOGRAPHY.micro, { color: '#FFFFFF', fontWeight: '700' }]}>CALL</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Google Maps Directions Trigger Button */}
                  <View style={styles.actionRow}>
                    <View style={{ flex: 1 }}>
                      <AnimatedButton
                        title={`Navigate in Google Maps (${selectedHospital.distance} km)`}
                        onPress={() => handleOpenGoogleMapsDirections(selectedHospital)}
                        theme={theme}
                        icon={<NavigationArrowSvg size={18} color="#FFFFFF" />}
                      />
                    </View>
                    <TouchableOpacity
                      style={[styles.externalMapsBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
                      onPress={() => handleStartInAppNavigation(selectedHospital)}
                      activeOpacity={0.7}
                    >
                      <LocationPinSvg size={18} color={theme.text} />
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </MotiView>
            </>
          ) : null}
        </View>
      )}

      {/* 4. COMPREHENSIVE BED BREAKDOWN MODAL */}
      <Modal
        visible={!!bedDetailModalHospital}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBedDetailModalHospital(null)}
      >
        <View style={styles.bedModalOverlay}>
          <View style={[styles.bedModalSheet, { backgroundColor: theme.surface }]}>
            {bedDetailModalHospital && (
              <>
                <View style={styles.bedModalHeader}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <HospitalFacilitySvg size={20} color={theme.primary} crossColor="#EF4444" style={{ marginRight: 8 }} />
                      <Text style={[TYPOGRAPHY.h2, { color: theme.text, fontSize: 18 }]} numberOfLines={1}>
                        {bedDetailModalHospital.name}
                      </Text>
                    </View>
                    <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary, marginTop: 4 }]} numberOfLines={1}>
                      {bedDetailModalHospital.address} • {bedDetailModalHospital.distance} km away
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.modalCloseBtn, { backgroundColor: theme.surfaceSubtle }]}
                    onPress={() => setBedDetailModalHospital(null)}
                  >
                    <CloseCrossSvg size={20} color={theme.text} />
                  </TouchableOpacity>
                </View>

                {/* Overall Availability Strip */}
                <View style={[styles.bedModalSummaryStrip, { backgroundColor: theme.primaryLight, borderColor: theme.primaryBorder }]}>
                  <View>
                    <Text style={[TYPOGRAPHY.micro, { color: theme.primary, letterSpacing: 0.5 }]}>TOTAL LIVE CAPACITY</Text>
                    <Text style={[TYPOGRAPHY.h2, { color: theme.primary, marginTop: 2 }]}>
                      {bedDetailModalHospital.totalAvailable}
                      <Text style={{ fontSize: 14, color: theme.textSecondary }}> / {bedDetailModalHospital.totalCapacity} Beds Free</Text>
                    </Text>
                  </View>
                  <View style={[styles.statusIndicatorBadge, { backgroundColor: bedDetailModalHospital.totalAvailable > 0 ? theme.success : '#EF4444' }]}>
                    <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 11 }}>
                      {bedDetailModalHospital.totalAvailable > 0 ? 'ADMITTING' : 'FULL'}
                    </Text>
                  </View>
                </View>

                <ScrollView style={{ maxHeight: 360, marginVertical: 12 }} showsVerticalScrollIndicator={false}>
                  <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, marginBottom: 8, letterSpacing: 0.5 }]}>
                    INDIVIDUAL WARD AVAILABILITIES & SPECS
                  </Text>

                  {/* Ward list */}
                  {[
                    {
                      name: 'Intensive Care Unit (ICU)',
                      desc: 'Advanced vital monitoring, 1:1 nursing protocol',
                      avail: bedDetailModalHospital.icuAvailable ?? 0,
                      total: bedDetailModalHospital.icuTotal ?? 20,
                      icon: <IcuBedSvg size={18} color="#EF4444" />,
                      color: '#EF4444',
                      bg: '#FEE2E2',
                    },
                    {
                      name: 'Emergency & Trauma Care (ER)',
                      desc: '24x7 triage, resuscitation & critical stabilization',
                      avail: bedDetailModalHospital.emergencyAvailable ?? 0,
                      total: bedDetailModalHospital.emergencyTotal ?? 25,
                      icon: <EmergencyCrossSvg size={18} color="#F59E0B" />,
                      color: '#F59E0B',
                      bg: '#FEF3C7',
                    },
                    {
                      name: 'General Inpatient Ward',
                      desc: 'Standard recovery rooms, continuous ward care',
                      avail: bedDetailModalHospital.generalAvailable ?? 0,
                      total: bedDetailModalHospital.generalTotal ?? 50,
                      icon: <GeneralWardBedSvg size={18} color="#3B82F6" />,
                      color: '#3B82F6',
                      bg: '#DBEAFE',
                    },
                    {
                      name: 'Ventilator & Life Support',
                      desc: 'Invasive/non-invasive mechanical pulmonary support',
                      avail: bedDetailModalHospital.ventilatorAvailable ?? 0,
                      total: bedDetailModalHospital.ventilatorTotal ?? 10,
                      icon: <VentilatorSvg size={18} color="#6366F1" />,
                      color: '#6366F1',
                      bg: '#E0E7FF',
                    },
                    ...(Array.isArray(bedDetailModalHospital.beds) ? bedDetailModalHospital.beds.filter(b => !['ICU', 'General', 'Emergency', 'Ventilator'].includes(b.category)).map(b => ({
                      name: `${b.category} Specialty Ward`,
                      desc: 'Specialized department unit bed roster',
                      avail: b.available ?? 0,
                      total: b.total ?? 0,
                      icon: <BedRosterGridSvg size={18} color={theme.primary} />,
                      color: theme.primary,
                      bg: theme.primaryLight,
                    })) : [])
                  ].map((w, idx) => {
                    const ratio = w.total > 0 ? Math.min(1, Math.max(0, w.avail / w.total)) : 0;
                    const isAvailable = w.avail > 0;
                    const statusColor = isAvailable ? '#10B981' : '#EF4444';
                    return (
                      <View 
                        key={idx}
                        style={[styles.modalWardCard, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View style={[styles.modalWardIconBox, { backgroundColor: w.bg }]}>
                            {w.icon}
                          </View>
                          <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={[TYPOGRAPHY.h3, { color: theme.text, fontSize: 14 }]}>
                              {w.name}
                            </Text>
                            <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary, fontSize: 11 }]}>
                              {w.desc}
                            </Text>
                          </View>
                          <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
                            <Text style={[TYPOGRAPHY.h3, { color: theme.text, fontSize: 16 }]}>
                              {w.avail} <Text style={{ fontSize: 11, color: theme.textMuted }}>/ {w.total}</Text>
                            </Text>
                            <View style={[styles.microStatusBadge, { backgroundColor: isAvailable ? '#DCFCE7' : '#FEE2E2' }]}>
                              <Text style={{ fontSize: 9.5, fontWeight: '800', color: statusColor }}>
                                {isAvailable ? `${w.avail} READY` : 'OCCUPIED'}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Visual Occupancy Bar */}
                        <View style={styles.modalBarTrack}>
                          <View style={[styles.modalBarFill, { width: `${Math.round(ratio * 100)}%`, backgroundColor: statusColor }]} />
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>

                {/* Direct Actions from Modal */}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                  <TouchableOpacity
                    style={[styles.modalCallBtn, { backgroundColor: theme.success }]}
                    onPress={() => Linking.openURL(`tel:${bedDetailModalHospital.contactNumber || '+91 231 264 1125'}`)}
                    activeOpacity={0.8}
                  >
                    <PhoneCallSvg size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={[TYPOGRAPHY.captionBold, { color: '#FFFFFF' }]}>CALL</Text>
                  </TouchableOpacity>

                  <View style={{ flex: 1 }}>
                    <AnimatedButton
                      title="Navigate Here"
                      onPress={() => {
                        const h = bedDetailModalHospital;
                        setBedDetailModalHospital(null);
                        handleOpenGoogleMapsDirections(h);
                      }}
                      theme={theme}
                      icon={<NavigationArrowSvg size={16} color="#FFFFFF" />}
                    />
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  map: { 
    width: '100%', 
    height: '100%' 
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionCard: {
    width: '100%',
    maxWidth: 380,
    padding: 28,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    alignItems: 'center',
  },
  permissionIconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionNoticePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginTop: 16,
  },
  markerContainer: {
    alignItems: 'center',
  },
  customMarker: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hospitalSignWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospitalSignText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 18,
  },
  hospitalSignCross: {
    marginLeft: 1.5,
  },
  hospitalHeaderBadge: {
    backgroundColor: '#2563EB',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospitalHeaderBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  markerPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    alignSelf: 'center',
    marginTop: -1,
  },
  markerBedBadge: {
    marginTop: 2,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  markerBedBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  osmBadge: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 76,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    zIndex: 5,
  },
  osmBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  topControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 36,
    left: 16,
    right: 16,
    gap: 8,
    zIndex: 10,
  },
  proximityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  proximityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radarDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  modeSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modeTab: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  refreshChip: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
  },
  bedFilterChipsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  bedFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  navigationHUD: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 36,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  navHUDCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  navIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitNavBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  recenterBtn: {
    position: 'absolute',
    right: 18,
    bottom: 350,
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 6,
  },
  listOverlay: {
    position: 'absolute',
    top: 155,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 8,
  },
  listScroll: {
    padding: 16,
    gap: 14,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  hospitalListCard: {
    padding: 16,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  bottomDockContainer: {
    position: 'absolute',
    bottom: 16,
    left: 14,
    right: 14,
    zIndex: 6,
    gap: 10,
  },
  discoveredRowContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: RADIUS.lg,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  discoveredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginBottom: 6,
  },
  discoveredScroll: {
    gap: 8,
    paddingRight: 8,
  },
  hospitalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.lg,
    minWidth: 175,
    maxWidth: 240,
  },
  chipIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },
  chipContent: {
    flex: 1,
    minWidth: 110,
    justifyContent: 'center',
  },
  chipName: {
    fontSize: 12,
    fontWeight: '700',
  },
  chipMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginLeft: 6,
  },
  bottomCard: {
    padding: 16,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  bedSectionWrapper: {
    marginTop: 10,
    marginBottom: 8,
  },
  bedSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  searchedBedMatchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginBottom: 8,
  },
  liveBedStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radarDotPulse: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  totalBedPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  bedGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  bedCard: {
    flex: 1,
    padding: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  bedCardTop: {
    alignItems: 'center',
    gap: 2,
  },
  bedIconBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    marginTop: 6,
    marginBottom: 8,
  },
  callBtnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  externalMapsBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 28,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginTop: 20,
  },
  resetSearchBtn: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: RADIUS.full,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniBarTrack: {
    width: '100%',
    height: 3.5,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  viewBedDetailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    marginTop: 4,
  },
  bedModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  bedModalSheet: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'android' ? 24 : 34,
    maxHeight: '90%',
  },
  bedModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bedModalSummaryStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  statusIndicatorBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  modalWardCard: {
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: 8,
  },
  modalWardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  microStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  modalBarTrack: {
    width: '100%',
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  modalBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  modalCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    height: 48,
  },
});
