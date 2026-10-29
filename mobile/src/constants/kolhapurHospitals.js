import { getDistance } from '../utils/distance';

export const DEFAULT_COORDS = { latitude: 16.7050, longitude: 74.2433 }; // Kolhapur central medical district (Dasara Chowk / CPR Hub)

export const NEARBY_OFFSETS = [
  { dLat: 0.012, dLng: 0.010 },   // ~1.6 km North-East
  { dLat: -0.018, dLng: 0.019 },  // ~2.8 km South-East
  { dLat: 0.026, dLng: -0.022 },  // ~3.8 km North-West
  { dLat: -0.035, dLng: -0.020 }, // ~4.9 km South-West
  { dLat: 0.045, dLng: 0.035 },   // ~6.3 km North-East
  { dLat: -0.055, dLng: 0.040 },  // ~7.5 km South-East
  { dLat: 0.020, dLng: -0.065 },  // ~7.2 km West
  { dLat: -0.075, dLng: -0.050 }, // ~10.0 km South-West
];

export const DEFAULT_KOLHAPUR_HOSPITALS = [
  {
    _id: 'default_kolhapur_cpr',
    name: 'CPR General Hospital & Trauma Centre',
    address: 'Dasara Chowk, Bhavani Mandap Road, Kolhapur',
    status: 'approved',
    adminEmail: 'city@hospital.com',
    category: 'Government Tertiary Care & Trauma Center',
    city: 'Kolhapur',
    licenseNumber: 'MH-KOP-MED-2026-001',
    documentName: 'CPR_Hospital_Establishment_License.pdf',
    documentType: 'Govt Clinical Establishment License (Class A)',
    isOtpVerified: true,
    contactNumber: '+91 231 264 1125',
    emergencyContact: '+91 231 264 1911',
    lat: 16.6956,
    lng: 74.2274,
    totalCapacity: 150,
    totalAvailable: 58,
    icuAvailable: 10,
    icuTotal: 25,
    generalAvailable: 28,
    generalTotal: 75,
    emergencyAvailable: 14,
    emergencyTotal: 30,
    ventilatorAvailable: 6,
    ventilatorTotal: 20,
  },
  {
    _id: 'default_kolhapur_dypatil',
    name: 'D. Y. Patil Medical College Hospital',
    address: 'Line Bazaar, Kasaba Bawada Road, Kolhapur',
    status: 'approved',
    adminEmail: 'dypatil@hospital.com',
    category: 'Medical College & Multi-Specialty Hospital',
    city: 'Kolhapur',
    licenseNumber: 'MH-KOP-MED-2026-002',
    documentName: 'DY_Patil_Hospital_Establishment_License.pdf',
    documentType: 'Govt Clinical Establishment License (Class A)',
    isOtpVerified: true,
    contactNumber: '+91 231 260 1234',
    emergencyContact: '+91 231 260 1911',
    lat: 16.7185,
    lng: 74.2541,
    totalCapacity: 140,
    totalAvailable: 52,
    icuAvailable: 12,
    icuTotal: 30,
    generalAvailable: 25,
    generalTotal: 65,
    emergencyAvailable: 10,
    emergencyTotal: 25,
    ventilatorAvailable: 5,
    ventilatorTotal: 20,
  },
  {
    _id: 'default_kolhapur_aster',
    name: 'Aster Aadhar Hospital',
    address: 'Near Kadamwadi Phata, Shastri Nagar, Kolhapur',
    status: 'approved',
    adminEmail: 'metro@hospital.com',
    category: 'Multi-Specialty & Cardiac Care',
    city: 'Kolhapur',
    licenseNumber: 'MH-KOP-MED-2026-003',
    documentName: 'Aster_Aadhar_Establishment_License.pdf',
    documentType: 'Govt Clinical Establishment License (Class A)',
    isOtpVerified: true,
    contactNumber: '+91 231 662 2555',
    emergencyContact: '+91 231 662 2911',
    lat: 16.7112,
    lng: 74.2480,
    totalCapacity: 110,
    totalAvailable: 43,
    icuAvailable: 9,
    icuTotal: 25,
    generalAvailable: 22,
    generalTotal: 50,
    emergencyAvailable: 8,
    emergencyTotal: 20,
    ventilatorAvailable: 4,
    ventilatorTotal: 15,
  },
  {
    _id: 'default_kolhapur_apple',
    name: 'Apple Saraswati Multispeciality Hospital',
    address: 'Station Road, Near Central Bus Stand (CBS), Kolhapur',
    status: 'approved',
    adminEmail: 'apple@hospital.com',
    category: 'Advanced Surgery & Critical Care',
    city: 'Kolhapur',
    licenseNumber: 'MH-KOP-MED-2026-004',
    documentName: 'Apple_Saraswati_Establishment_License.pdf',
    documentType: 'Govt Clinical Establishment License (Class A)',
    isOtpVerified: true,
    contactNumber: '+91 231 265 8900',
    emergencyContact: '+91 231 265 8911',
    lat: 16.7042,
    lng: 74.2389,
    totalCapacity: 95,
    totalAvailable: 38,
    icuAvailable: 7,
    icuTotal: 20,
    generalAvailable: 19,
    generalTotal: 45,
    emergencyAvailable: 8,
    emergencyTotal: 18,
    ventilatorAvailable: 4,
    ventilatorTotal: 12,
  },
  {
    _id: 'default_kolhapur_swastik',
    name: 'Swastik Hospital & Critical Care Centre',
    address: '2nd Lane, Tarabai Park, Kolhapur',
    status: 'approved',
    adminEmail: 'apex@hospital.com',
    category: 'Critical Care & Emergency Operations',
    city: 'Kolhapur',
    licenseNumber: 'MH-KOP-MED-2026-005',
    documentName: 'Swastik_Hospital_Establishment_License.pdf',
    documentType: 'Govt Clinical Establishment License (Class A)',
    isOtpVerified: true,
    contactNumber: '+91 231 266 7788',
    emergencyContact: '+91 231 266 7911',
    lat: 16.7140,
    lng: 74.2325,
    totalCapacity: 80,
    totalAvailable: 31,
    icuAvailable: 6,
    icuTotal: 18,
    generalAvailable: 16,
    generalTotal: 40,
    emergencyAvailable: 6,
    emergencyTotal: 14,
    ventilatorAvailable: 3,
    ventilatorTotal: 8,
  },
  {
    _id: 'default_kolhapur_sahyadri',
    name: 'Sahyadri Hospital',
    address: 'Cyber Chowk, CSIBER Colony, Rajarampuri, Kolhapur',
    status: 'approved',
    adminEmail: 'sahyadri@hospital.com',
    category: 'Tertiary Care & Super Specialty',
    city: 'Kolhapur',
    licenseNumber: 'MH-KOP-MED-2026-006',
    documentName: 'Sahyadri_Hospital_Establishment_License.pdf',
    documentType: 'Govt Clinical Establishment License (Class A)',
    isOtpVerified: true,
    contactNumber: '+91 231 253 9999',
    emergencyContact: '+91 231 253 9911',
    lat: 16.6908,
    lng: 74.2415,
    totalCapacity: 100,
    totalAvailable: 39,
    icuAvailable: 8,
    icuTotal: 22,
    generalAvailable: 20,
    generalTotal: 48,
    emergencyAvailable: 7,
    emergencyTotal: 18,
    ventilatorAvailable: 4,
    ventilatorTotal: 12,
  },
  {
    _id: 'default_kolhapur_surya',
    name: 'Surya Multispeciality Hospital',
    address: '1st Lane, Poorna Nagar, Rajarampuri, Kolhapur',
    status: 'approved',
    adminEmail: 'surya@hospital.com',
    category: 'Pediatric, General & Trauma Care',
    city: 'Kolhapur',
    licenseNumber: 'MH-KOP-MED-2026-007',
    documentName: 'Surya_Hospital_Establishment_License.pdf',
    documentType: 'Govt Clinical Establishment License (Class A)',
    isOtpVerified: true,
    contactNumber: '+91 231 252 8800',
    emergencyContact: '+91 231 252 8911',
    lat: 16.6985,
    lng: 74.2440,
    totalCapacity: 85,
    totalAvailable: 35,
    icuAvailable: 7,
    icuTotal: 18,
    generalAvailable: 18,
    generalTotal: 42,
    emergencyAvailable: 6,
    emergencyTotal: 15,
    ventilatorAvailable: 4,
    ventilatorTotal: 10,
  },
  {
    _id: 'default_kolhapur_vasantprabha',
    name: 'Vasantprabha Hospital & Research Institute',
    address: 'Station Road, Near Kawala Naka, Shahupuri, Kolhapur',
    status: 'approved',
    adminEmail: 'vasantprabha@hospital.com',
    category: 'Research Institute & Critical Care',
    city: 'Kolhapur',
    licenseNumber: 'MH-KOP-MED-2026-008',
    documentName: 'Vasantprabha_Hospital_Establishment_License.pdf',
    documentType: 'Govt Clinical Establishment License (Class A)',
    isOtpVerified: true,
    contactNumber: '+91 231 265 4422',
    emergencyContact: '+91 231 265 4911',
    lat: 16.7031,
    lng: 74.2465,
    totalCapacity: 75,
    totalAvailable: 30,
    icuAvailable: 6,
    icuTotal: 16,
    generalAvailable: 16,
    generalTotal: 39,
    emergencyAvailable: 5,
    emergencyTotal: 12,
    ventilatorAvailable: 3,
    ventilatorTotal: 8,
  }
];

export const processHospitals = (rawHospitals, userLat, userLng) => {
  const isNearKolhapur = getDistance(userLat, userLng, DEFAULT_COORDS.latitude, DEFAULT_COORDS.longitude) <= 50;
  const calcLat = isNearKolhapur ? userLat : DEFAULT_COORDS.latitude;
  const calcLng = isNearKolhapur ? userLng : DEFAULT_COORDS.longitude;

  const seenPositions = new Set();

  return (rawHospitals || [])
    .map((hospital, index) => {
      let hLat = typeof hospital.lat === 'number' ? hospital.lat : parseFloat(hospital.lat);
      let hLng = typeof hospital.lng === 'number' ? hospital.lng : parseFloat(hospital.lng);
      let dist = (hLat && hLng) ? getDistance(calcLat, calcLng, hLat, hLng) : 1.2;

      const posKey = (hLat && hLng) ? `${hLat.toFixed(3)},${hLng.toFixed(3)}` : null;

      if (!hLat || !hLng || (posKey && seenPositions.has(posKey))) {
        const offset = NEARBY_OFFSETS[index % NEARBY_OFFSETS.length];
        hLat = calcLat + offset.dLat;
        hLng = calcLng + offset.dLng;
        dist = getDistance(calcLat, calcLng, hLat, hLng);
      }

      seenPositions.add(`${hLat.toFixed(3)},${hLng.toFixed(3)}`);

      const totalAvail = hospital.totalAvailable ?? hospital.totalBeds ?? 40;
      const totalCap = hospital.totalCapacity ?? (hospital.totalBeds || 100);
      const icuAvail = hospital.icuAvailable ?? (hospital.icuBeds || 8);
      const icuTot = hospital.icuTotal ?? 25;
      const generalAvail = hospital.generalAvailable ?? 22;
      const generalTot = hospital.generalTotal ?? 60;
      const emergencyAvail = hospital.emergencyAvailable ?? 10;
      const emergencyTot = hospital.emergencyTotal ?? 25;
      const ventilatorAvail = hospital.ventilatorAvailable ?? 5;
      const ventilatorTot = hospital.ventilatorTotal ?? 15;

      return {
        ...hospital,
        lat: hLat,
        lng: hLng,
        distance: parseFloat(dist.toFixed(2)),
        totalAvailable: totalAvail,
        totalCapacity: totalCap,
        icuAvailable: icuAvail,
        icuTotal: icuTot,
        generalAvailable: generalAvail,
        generalTotal: generalTot,
        emergencyAvailable: emergencyAvail,
        emergencyTotal: emergencyTot,
        ventilatorAvailable: ventilatorAvail,
        ventilatorTotal: ventilatorTot,
        contactNumber: hospital.contactNumber || (index % 2 === 0 ? '+91 231 264 1125' : '+91 231 260 1234'),
        emergencyContact: hospital.emergencyContact || '+91 231 264 1911'
      };
    })
    .sort((a, b) => a.distance - b.distance);
};
