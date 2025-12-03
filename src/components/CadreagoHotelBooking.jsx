import React, { useState, useRef, useEffect } from 'react';
import { Search, Calendar, Users, Star, MapPin, Wifi, Car, Utensils, Waves, ThumbsUp, ThumbsDown, Heart, Menu, X, ChevronDown, Filter, CheckCircle, Shield, Coffee, Wind, Dumbbell, Sparkles, Share2, ChevronLeft, ChevronRight, User, Mail, Phone, CreditCard, FileText, Download } from 'lucide-react';
import brandLogo from '../assets/logo.png';
import brandIcon from '../assets/logo_icon.png';
import brandLogoDark from '../assets/logo_non-transperant.png';
import { fetchHotels, fetchHotelsByHost } from '../services/hotelService';
import { createBooking, fetchUserBookings, fetchHostBookings, updateBookingStatus } from '../services/bookingService';
import { signIn, signUp, signOut, getCurrentUser, updateProfile, fetchProfileById, updateHostInfo } from '../services/authService';
import { fetchUserPayments } from '../services/paymentService';
import { addToFavorites, removeFromFavorites, fetchUserFavorites } from '../services/favoriteService';
import CadreagoMobileApp from './cadreagoHotelBookingMobileView';
import GoogleMap from './GoogleMap';

const GST_RATE = 0.12; // 12% Goods and Services Tax applied on bookings
const formatCurrency = (amount, currency = 'INR') => {
  const currencyConfig = {
    'INR': { locale: 'en-IN', minFractionDigits: 0, maxFractionDigits: 0 },
    'USD': { locale: 'en-US', minFractionDigits: 0, maxFractionDigits: 0 },
    'EUR': { locale: 'de-DE', minFractionDigits: 0, maxFractionDigits: 0 },
    'GBP': { locale: 'en-GB', minFractionDigits: 0, maxFractionDigits: 0 }
  };

  const config = currencyConfig[currency] || currencyConfig['INR'];

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: config.minFractionDigits,
    maximumFractionDigits: config.maxFractionDigits
  }).format(Math.round(amount));
};
const addonIconMap = {
  Coffee,
  Car,
  Sparkles,
  Calendar,
  MapPin,
  Wind,
  Dumbbell,
  Shield,
  Utensils,
  Waves,
  CreditCard,
  Wifi
};
const ADDON_ICON_KEYS = Object.keys(addonIconMap);
const DEFAULT_ADDON_ICON = ADDON_ICON_KEYS[0] || 'Coffee';
const PUBLIC_ASSET_BASE = process.env.PUBLIC_URL || '';
const getAssetUrl = (path = '') => `${PUBLIC_ASSET_BASE}${path}`;
const INLINE_HEART_PIN_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56" fill="none"><rect width="56" height="56" rx="28" fill="#7837FF"></rect><path d="M46.0675 22.1319L44.0601 22.7843" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M11.9402 33.2201L9.93262 33.8723" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M27.9999 47.0046V44.8933" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M27.9999 9V11.1113" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M39.1583 43.3597L37.9186 41.6532" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16.8419 12.6442L18.0816 14.3506" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9.93262 22.1319L11.9402 22.7843" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M46.0676 33.8724L44.0601 33.2201" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M39.1583 12.6442L37.9186 14.3506" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16.8419 43.3597L18.0816 41.6532" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M28 39L26.8725 37.9904C24.9292 36.226 23.325 34.7026 22.06 33.4202C20.795 32.1378 19.7867 30.9918 19.035 29.9823C18.2833 28.9727 17.7562 28.0587 17.4537 27.2401C17.1512 26.4216 17 25.5939 17 24.7572C17 23.1201 17.5546 21.7513 18.6638 20.6508C19.7729 19.5502 21.1433 19 22.775 19C23.82 19 24.7871 19.2456 25.6762 19.7367C26.5654 20.2278 27.34 20.9372 28 21.8649C28.77 20.8827 29.5858 20.1596 30.4475 19.6958C31.3092 19.2319 32.235 19 33.225 19C34.8567 19 36.2271 19.5502 37.3362 20.6508C38.4454 21.7513 39 23.1201 39 24.7572C39 25.5939 38.8488 26.4216 38.5463 27.2401C38.2438 28.0587 37.7167 28.9727 36.965 29.9823C36.2133 30.9918 35.205 32.1378 33.94 33.4202C32.675 34.7026 31.0708 36.226 29.1275 37.9904L28 39Z" fill="#FF7878"></path></svg>';
const SAMPLE_PLACE_ID = 'ChIJN5Nz71W3j4ARhx5bwpTQEGg';
const DEFAULT_MAP_CENTER = { lat: 20.5937, lng: 78.9629 };

const initialHostProperties = [
  {
    id: 1,
    name: 'Bella Vista Resort',
    location: 'Miami, Florida',
    stars: 3,
    type: 'Resort',
    rooms: 45,
    status: 'active',
    rating: 7.5,
    reviews: 174,
    basePrice: 56,
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop',
    amenities: ['Pool', 'Spa', 'Parking', 'WiFi'],
    totalBookings: 234,
    monthlyRevenue: 12500,
    occupancyRate: 78
  },
  {
    id: 2,
    name: 'Sunset Beach Villa',
    location: 'Ibiza, Spain',
    stars: 5,
    type: 'Villa',
    rooms: 12,
    status: 'active',
    rating: 9.2,
    reviews: 89,
    basePrice: 280,
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop',
    amenities: ['Pool', 'Beach Access', 'WiFi', 'Kitchen'],
    totalBookings: 156,
    monthlyRevenue: 35400,
    occupancyRate: 92
  },
  {
    id: 3,
    name: 'Mountain View Lodge',
    location: 'Aspen, Colorado',
    stars: 4,
    type: 'Lodge',
    rooms: 28,
    status: 'pending',
    rating: 8.8,
    reviews: 45,
    basePrice: 150,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop',
    amenities: ['Ski Access', 'Fireplace', 'Parking', 'Restaurant'],
    totalBookings: 67,
    monthlyRevenue: 8900,
    occupancyRate: 65
  }
];

const PRICE_MARKER_BASE_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 16px',
  borderRadius: '999px',
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontWeight: '700',
  fontSize: '14px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap',
  lineHeight: '1',
  minWidth: '60px',
  textAlign: 'center',
};

const getPriceMarkerStyle = (active) => ({
  ...PRICE_MARKER_BASE_STYLE,
  backgroundColor: active ? '#2563eb' : '#ffffff',
  border: `2px solid ${active ? '#1d4ed8' : '#e5e7eb'}`,
  color: active ? '#ffffff' : '#111827',
  transform: active ? 'scale(1.1)' : 'scale(1)',
});

// Distance helpers for radius-based hotel filtering
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const AUTO_RADIUS_STEPS_KM = [5, 10, 25, 50];

function getHotelsForSearchLocation(searchLocation, hotels, radiusFilterKmRaw) {
  const radiusFilterKm =
    radiusFilterKmRaw === null || radiusFilterKmRaw === undefined
      ? null
      : Number(radiusFilterKmRaw);

  if (!searchLocation) {
    return { hotels, radiusKm: null, mode: 'no-location' };
  }

  // CASE 1: user chose a specific radius (STRICT)
  if (radiusFilterKm !== null && !Number.isNaN(radiusFilterKm)) {
    const radiusKm = radiusFilterKm;

    const hotelsInRadius = hotels.filter((hotel) => {
      if (!hotel.coordinates) return false;
      const { lat, lng } = hotel.coordinates;
      const d = haversineDistanceKm(
        searchLocation.lat,
        searchLocation.lng,
        lat,
        lng
      );
      return d <= radiusKm;
    });

    // No expanding or nearest fallback in fixed mode
    return { hotels: hotelsInRadius, radiusKm, mode: 'fixed' };
  }

  // CASE 2: AUTO MODE – smart expanding radius
  for (const radiusKm of AUTO_RADIUS_STEPS_KM) {
    const hotelsInRadius = hotels.filter((hotel) => {
      if (!hotel.coordinates) return false;
      const { lat, lng } = hotel.coordinates;
      const d = haversineDistanceKm(
        searchLocation.lat,
        searchLocation.lng,
        lat,
        lng
      );
      return d <= radiusKm;
    });

    if (hotelsInRadius.length >= 5) {
      return { hotels: hotelsInRadius, radiusKm, mode: 'auto-radius' };
    }
  }

  // Fallback: within max radius
  const maxRadius = AUTO_RADIUS_STEPS_KM[AUTO_RADIUS_STEPS_KM.length - 1];
  let hotelsInRadius = hotels.filter((hotel) => {
    if (!hotel.coordinates) return false;
    const { lat, lng } = hotel.coordinates;
    const d = haversineDistanceKm(
      searchLocation.lat,
      searchLocation.lng,
      lat,
      lng
    );
    return d <= maxRadius;
  });

  if (hotelsInRadius.length > 0) {
    return { hotels: hotelsInRadius, radiusKm: maxRadius, mode: 'auto-max' };
  }

  // Ultimate fallback: nearest anywhere (ONLY in auto mode)
  if (hotels.length === 0) {
    return { hotels: [], radiusKm: null, mode: 'auto-empty' };
  }

  let nearest = null;
  let nearestDistance = Infinity;

  for (const hotel of hotels) {
    if (!hotel.coordinates) continue;
    const { lat, lng } = hotel.coordinates;
    const d = haversineDistanceKm(
      searchLocation.lat,
      searchLocation.lng,
      lat,
      lng
    );
    if (d < nearestDistance) {
      nearestDistance = d;
      nearest = hotel;
    }
  }

  return {
    hotels: nearest ? [nearest] : [],
    radiusKm: nearestDistance,
    mode: 'auto-nearest',
  };
}

const DestinationSearchInput = ({
  value,
  onChange,
  onFocus,
  onBlur,
  suggestions = [],
  showSuggestions,
  onSuggestionSelect,
  loading,
  inputRef,
  className = ''
}) => (
  <div className="relative">
    <MapPin className="absolute left-3 top-3 text-gray-400 pointer-events-none" size={18} />
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={loading ? 'Detecting location...' : 'Where are you going?'}
      autoComplete="off"
      className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 ${className}`}
    />

    {loading && (
      <div className="absolute right-3 top-3 text-xs text-slate-400">
        Detecting…
      </div>
    )}

    {showSuggestions && suggestions.length > 0 && (
      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.place_id}
            type="button"
            onMouseDown={(e) => {
              // Prevent losing focus before click handler runs
              e.preventDefault();
            }}
            onClick={() => onSuggestionSelect(suggestion)}
            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-start space-x-3 border-b border-gray-100 last:border-b-0"
          >
            <MapPin size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {suggestion.structured_formatting?.main_text || suggestion.description.split(',')[0]}
              </div>
              <div className="text-sm text-gray-500 truncate">
                {suggestion.structured_formatting?.secondary_text || suggestion.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    )}
  </div>
);

const CadreagoApp = () => {
  const [currentView, setCurrentView] = useState('search');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState('guest'); // 'guest' or 'host'
  const [dashboardTab, setDashboardTab] = useState('bookings');
  const [hostDashboardTab, setHostDashboardTab] = useState('properties');
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showMessageHostModal, setShowMessageHostModal] = useState(false);
  const hostMessageRef = useRef(null);
  const [preferredUserType, setPreferredUserType] = useState('guest');
  const [hostOnboardingCompleted, setHostOnboardingCompleted] = useState(false);
  const [aadhaar, setAadhaar] = useState({ number: '', status: 'pending' });
  const [gstRegistered, setGstRegistered] = useState(false);
  const [gst, setGst] = useState({ number: '', status: 'pending' });
  const [bank, setBank] = useState({ account: '', ifsc: '', status: 'pending' });
  const [hostProperties, setHostProperties] = useState(initialHostProperties);
  const togglePropertyStatus = (propertyId) => {
    setHostProperties((prev) =>
      prev.map((property) =>
        property.id === propertyId
          ? { ...property, status: property.status === 'active' ? 'inactive' : 'active' }
          : property
      )
    );
  };
  const [showAddAddonModal, setShowAddAddonModal] = useState(false);
  const [addonForm, setAddonForm] = useState({
    propertyId: initialHostProperties[0]?.id || '',
    name: '',
    description: '',
    price: '',
    icon: DEFAULT_ADDON_ICON
  });
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutForm, setPayoutForm] = useState({ amount: '', notes: '' });
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [mapSelectedHotel, setMapSelectedHotel] = useState(null);
  const [hoveredHotelId, setHoveredHotelId] = useState(null);
  const [zoomToHotelId, setZoomToHotelId] = useState(null);
  const [mapZoom, setMapZoom] = useState(6);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState('');
  const [mapUserInteracted, setMapUserInteracted] = useState(false);
  const [stableMapCenter, setStableMapCenter] = useState(DEFAULT_MAP_CENTER);
  const mapInstanceRef = useRef(null);
  const googleMapRef = useRef(null); // Ref for new GoogleMap component
  const userInteractedWithMap = useRef(false); // Track if user manually moved/zoomed map
  const mapLoadedRef = useRef(false);

  const handleHotelMarkerClick = React.useCallback((hotel) => {
    if (!hotel) return;
    console.log('Hotel marker clicked:', hotel.name);
    setMapSelectedHotel(hotel);
    setSelectedHotel(hotel);
  }, []);

  const handleHotelMarkerHover = React.useCallback((hotelId) => {
    setHoveredHotelId(hotelId);
  }, []);

  const handleMapReady = React.useCallback((map) => {
    console.log('✓ GoogleMap component ready!');
    mapInstanceRef.current = map;

    // REMOVED: clearSavedView call (view persistence feature disabled in GoogleMap.jsx)
    // Map now always uses props center/zoom, allowing auto-fit to work correctly

    const markUserInteraction = () => {
      userInteractedWithMap.current = true;
      setMapUserInteracted(true);
    };

    map.addListener('click', () => {
      setMapSelectedHotel(null);
      setHoveredHotelId(null);
    });

    // Track user interactions with map (drag, zoom)
    map.addListener('dragstart', markUserInteraction);
    map.addListener('zoom_changed', () => {
      if (mapLoadedRef.current) {
        markUserInteraction();
      }
    });

    setMapLoaded(true);
    mapLoadedRef.current = true;
    setMapError('');
  }, []);
  const searchInputRef = useRef(null);
  const searchInputRefDesktop = useRef(null);
  const destinationInputFocusedRef = useRef(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null); // { lat, lng } for radius filtering
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [searchParams, setSearchParams] = useState({
    destination: '',
    checkIn: '2025-03-12',
    checkOut: '2025-03-28',
    adults: 2,
    children: 0
  });
  const [hotels, setHotels] = useState([]);
  const [hotelsLoading, setHotelsLoading] = useState(true);
  const [userBookingsData, setUserBookingsData] = useState([]);
  const [hostBookingsData, setHostBookingsData] = useState([]);
  const [paymentsData, setPaymentsData] = useState([]);
  const [favoritesData, setFavoritesData] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapBounds, setMapBounds] = useState(null);
  const [showMapViewHotels, setShowMapViewHotels] = useState(false);
  const [mapDirty, setMapDirty] = useState(false);
  const [notification, setNotification] = useState(null);
  const [radiusFilterKm, setRadiusFilterKm] = useState(null); // null = auto

  // NEW: Improved search state
  const [destinationInput, setDestinationInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [placesLoaded, setPlacesLoaded] = useState(false);
  
  // NEW: Refs for Places API services
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const initialLocationFetched = useRef(false);

  // Ref to store current map bounds without triggering re-renders
  const mapBoundsRef = useRef(null);
  const boundsUpdateTimeoutRef = useRef(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleBoundsChanged = React.useCallback((bounds) => {
    // Store bounds in ref immediately without triggering re-render
    mapBoundsRef.current = bounds;

    // Debounce the state update to prevent infinite loop
    if (boundsUpdateTimeoutRef.current) {
      clearTimeout(boundsUpdateTimeoutRef.current);
    }

    boundsUpdateTimeoutRef.current = setTimeout(() => {
      setMapBounds(bounds);
      // Only show "Search this area" when a destination is set
      if (searchParams.destination && searchParams.destination.trim() !== '') {
        setMapDirty(true);
      }
    }, 300); // 300ms debounce
  }, [searchParams.destination]);

  // Use Supabase data for user bookings (loaded in loadUserData function)
  const userBookings = userBookingsData;

  // Mock messages
  const userMessages = [
    {
      id: 1,
      hotelName: 'Bella Vista Resort',
      subject: 'Booking Confirmation',
      message: 'Your booking has been confirmed. Check-in: April 15, 2025',
      date: '2025-03-20',
      read: false
    },
    {
      id: 2,
      hotelName: 'Cadreago Support',
      subject: 'Welcome to Cadreago!',
      message: 'Thank you for joining Cadreago. Explore our premium stays.',
      date: '2025-03-15',
      read: true
    }
  ];

  // Use Supabase data for payment history (loaded in loadUserData function)
  const paymentHistory = paymentsData;

  // Available add-ons
  const availableAddons = [
    {
      id: 'breakfast',
      name: 'Daily Breakfast',
      description: 'Full American breakfast for all guests',
      price: 25,
      icon: '🍳',
      perPerson: true
    },
    {
      id: 'airport',
      name: 'Airport Pickup',
      description: 'Complimentary airport transfer service',
      price: 45,
      icon: '✈️',
      perPerson: false
    },
    {
      id: 'spa',
      name: 'Spa Access',
      description: 'Full day access to spa and wellness center',
      price: 60,
      icon: '💆',
      perPerson: true
    },
    {
      id: 'parking',
      name: 'Valet Parking',
      description: 'Premium valet parking service',
      price: 30,
      icon: '🚗',
      perPerson: false
    },
    {
      id: 'lateCheckout',
      name: 'Late Checkout',
      description: 'Checkout at 3 PM instead of 11 AM',
      price: 50,
      icon: '🕐',
      perPerson: false
    },
    {
      id: 'minibar',
      name: 'Premium Minibar',
      description: 'Complimentary premium drinks and snacks',
      price: 35,
      icon: '🥂',
      perPerson: false
    }
  ];

  // Mock property bookings (for host)
  const propertyBookings = [
    {
      id: 1,
      propertyName: 'Bella Vista Resort',
      guestName: 'John Smith',
      guestEmail: 'john@example.com',
      checkIn: '2025-04-15',
      checkOut: '2025-04-20',
      guests: '2 Adults',
      roomType: 'Deluxe Ocean View',
      totalPrice: 280,
      status: 'confirmed',
      bookingRef: 'CAD001234',
      bookingDate: '2025-03-10'
    },
    {
      id: 2,
      propertyName: 'Sunset Beach Villa',
      guestName: 'Sarah Johnson',
      guestEmail: 'sarah@example.com',
      checkIn: '2025-05-01',
      checkOut: '2025-05-07',
      guests: '4 Adults, 2 Children',
      roomType: 'Premium Villa',
      totalPrice: 1960,
      status: 'confirmed',
      bookingRef: 'CAD001240',
      bookingDate: '2025-03-15'
    },
    {
      id: 3,
      propertyName: 'Bella Vista Resort',
      guestName: 'Mike Davis',
      guestEmail: 'mike@example.com',
      checkIn: '2025-04-25',
      checkOut: '2025-04-28',
      guests: '2 Adults, 1 Child',
      roomType: 'Family Suite',
      totalPrice: 180,
      status: 'pending',
      bookingRef: 'CAD001242',
      bookingDate: '2025-03-20'
    }
  ];

  const hostRefunds = [
    {
      id: 1,
      bookingRef: 'CAD001230',
      guestName: 'Emily Clark',
      amount: 320,
      method: 'UPI',
      status: 'processed',
      date: '2025-03-28'
    },
    {
      id: 2,
      bookingRef: 'CAD001225',
      guestName: 'Rahul Mehta',
      amount: 180,
      method: 'Credit Card',
      status: 'pending',
      date: '2025-03-26'
    }
  ];

  const hostPayouts = [
    {
      id: 1,
      reference: 'PAYOUT001',
      amount: 1450,
      date: '2025-03-25',
      status: 'completed',
      method: 'Bank Transfer'
    },
    {
      id: 2,
      reference: 'PAYOUT002',
      amount: 980,
      date: '2025-03-29',
      status: 'processing',
      method: 'UPI'
    }
  ];

  // Detect screen size
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (showMessageHostModal && hostMessageRef.current) {
      const currentValue = hostMessageRef.current.value || '';
      const cursorPos = currentValue.length;
      hostMessageRef.current.focus();
      hostMessageRef.current.setSelectionRange(cursorPos, cursorPos);
    }
  }, [showMessageHostModal]);

  // Cleanup bounds update timeout on unmount
  React.useEffect(() => {
    return () => {
      if (boundsUpdateTimeoutRef.current) {
        clearTimeout(boundsUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Helper functions
  const incrementGuests = (type) => {
    setSearchParams(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
  };

  const decrementGuests = (type) => {
    setSearchParams(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] - 1)
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const renderAddonIcon = (icon, size = 20) => {
    if (!icon) return '✦';
    if (typeof icon === 'string' && addonIconMap[icon]) {
      const IconComponent = addonIconMap[icon];
      return <IconComponent size={size} />;
    }
    if (typeof icon === 'string' && icon.length <= 3) {
      return <span className="text-xl">{icon}</span>;
    }
    return <Sparkles size={size} />;
  };

  const getGuestText = () => {
    const parts = [];
    if (searchParams.adults > 0) parts.push(`${searchParams.adults} Adult${searchParams.adults !== 1 ? 's' : ''}`);
    if (searchParams.children > 0) parts.push(`${searchParams.children} Child${searchParams.children !== 1 ? 'ren' : ''}`);
    return parts.join(', ') || 'Select guests';
  };

  // Add-ons functions
  const toggleAddon = (addonId) => {
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(selectedAddons.filter(id => id !== addonId));
    } else {
      setSelectedAddons([...selectedAddons, addonId]);
    }
  };

  const calculateAddonsTotal = () => {
    return selectedAddons.reduce((total, addonId) => {
      const addon = availableAddons.find(a => a.id === addonId);
      if (!addon) return total;
      const multiplier = addon.perPerson ? searchParams.adults : 1;
      return total + (addon.price * multiplier);
    }, 0);
  };

  // Share property function
  const shareProperty = (hotel) => {
    const url = `${window.location.origin}${window.location.pathname}?property=${hotel.id}&checkIn=${searchParams.checkIn}&checkOut=${searchParams.checkOut}&adults=${searchParams.adults}&children=${searchParams.children}`;
    
    if (navigator.share) {
      navigator.share({
        title: hotel.name,
        text: `Check out ${hotel.name} in ${hotel.location}`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Property link copied to clipboard!');
    }
  };

  // Image gallery navigation
  const nextImage = () => {
    if (selectedHotel && selectedHotel.images) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedHotel.images.length);
    }
  };

  const prevImage = () => {
    if (selectedHotel && selectedHotel.images) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedHotel.images.length) % selectedHotel.images.length);
    }
  };

  // Initialize host-related state from Supabase profile + host_info
  const initializeHostFromProfile = (profile) => {
    if (!profile) return false;

    // Prefer user_role from profile if present
    if (profile.user_role === 'host') {
      setUserType('host');
    }

    const rawHostInfo = profile.host_info;
    const hostInfo = Array.isArray(rawHostInfo) ? rawHostInfo[0] : rawHostInfo;
    if (!hostInfo) return false;

    const aadhaarStatus = hostInfo.aadhaar_status || (hostInfo.verified ? 'verified' : 'pending');
    const gstRegisteredValue = !!hostInfo.gst_registered;
    const gstStatus = hostInfo.gst_status || 'pending';
    const bankStatus = hostInfo.bank_status || (hostInfo.verified ? 'verified' : 'pending');

    // Hydrate global KYC state from existing host_info so
    // onboarding/profile screens are pre-filled from the database.
    setAadhaar({
      number: hostInfo.aadhaar_number || '',
      status: aadhaarStatus
    });
    setGstRegistered(gstRegisteredValue);
    setGst({
      number: hostInfo.gst_number || '',
      status: gstRegisteredValue ? gstStatus : 'pending'
    });
    setBank({
      account: hostInfo.bank_account_number || '',
      ifsc: hostInfo.bank_ifsc || '',
      status: bankStatus
    });

    const onboardingCompleted = !!hostInfo.onboarding_completed || hostInfo.verified === true;
    setHostOnboardingCompleted(onboardingCompleted);

    return onboardingCompleted;
  };

  const ensureHostInfoRecord = async (userId, profile) => {
    if (!userId || !profile) return;
    const rawHostInfo = profile.host_info;
    const hasHostInfo = Array.isArray(rawHostInfo) ? rawHostInfo.length > 0 : !!rawHostInfo;
    if (hasHostInfo) return;

    try {
      await updateHostInfo(userId, {
        onboarding_completed: false,
        verified: false,
        member_since: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error ensuring host_info record:', err);
    }
  };

  // Load user-specific data after login
  const loadUserData = async (userId) => {
    // Load bookings
    const { data: bookings } = await fetchUserBookings(userId);
    if (bookings) setUserBookingsData(bookings);

    // Load favorites
    const { data: favs } = await fetchUserFavorites(userId);
    if (favs) setFavoritesData(favs.map(f => f.hotel_id));

    // Load payments
    const { data: payments } = await fetchUserPayments(userId);
    if (payments) setPaymentsData(payments);
  };

  // Authentication functions
  const handleLogin = async (email, password, type = 'guest') => {
    const { data, error } = await signIn(email, password);
    if (error) {
      alert('Login failed: ' + error);
      return;
    }

    if (data?.user) {
      // Prefer profile.full_name, then auth metadata, then email prefix
      const profileName = data.profile?.full_name;
      const metaName = data.user.user_metadata?.full_name;
      const fallbackName = data.user.email.split('@')[0];
      const userName = profileName || metaName || fallbackName;

      setUser({
        id: data.user.id,
        name: userName,
        email: data.user.email,
        avatar: userName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
      });
      setIsLoggedIn(true);

      // Resolve user type based on profile role if available
      const profileRole = data.profile?.user_role;
      const resolvedType = profileRole === 'host' ? 'host' : type;
      setUserType(resolvedType);

      // Load full profile with host_info so host onboarding state can be restored
      let profileForHost = data.profile;
      if (!profileForHost || !profileForHost.host_info) {
        const { data: fullProfile } = await fetchProfileById(data.user.id);
        if (fullProfile) {
          profileForHost = fullProfile;
        }
      }

      if (resolvedType === 'host' && profileForHost) {
        await ensureHostInfoRecord(data.user.id, profileForHost);
      }

      let onboardingCompleted = hostOnboardingCompleted;
      if (profileForHost) {
        onboardingCompleted = initializeHostFromProfile(profileForHost);
      }

      setShowAuthModal(false);
      const destination = resolvedType === 'host'
        ? (onboardingCompleted ? 'host-dashboard' : 'host-onboarding')
        : 'dashboard';
      setCurrentView(destination);

      // Load user-specific data
      await loadUserData(data.user.id);
    }
  };

  const handleSignup = async (name, email, password, type = 'guest') => {
    const { data, error } = await signUp(email, password, { full_name: name, user_role: type });
    if (error) {
      alert('Signup failed: ' + error);
      return;
    }

    if (data?.user) {
      setUser({
        id: data.user.id,
        name: name,
        email: email,
        avatar: name.split(' ').map(n => n[0]).join('').toUpperCase()
      });
      setIsLoggedIn(true);
      setUserType(type);
      setShowAuthModal(false);
      if (type === 'host') {
        try {
          await updateHostInfo(data.user.id, {
            onboarding_completed: false,
            verified: false,
            member_since: new Date().toISOString()
          });
        } catch (err) {
          console.error('Error creating initial host_info for new host:', err);
          showNotification('error', 'Host account was created, but we could not save initial host details. You can try again from the onboarding form.');
        }
        setHostOnboardingCompleted(false);
        setCurrentView('host-onboarding');
      } else {
        setCurrentView('dashboard');
      }
    }
  };

  const handleLogout = async () => {
    await signOut();
    setIsLoggedIn(false);
    setUser(null);
    setUserType('guest');
    setUserBookingsData([]);
    setFavoritesData([]);
    setPaymentsData([]);
    setCurrentView('search');
  };
  const [filters, setFilters] = useState({
    priceRange: [0, 100000],
    rating: 'all',
    type: 'all',
    amenities: []
  });

  // Check for existing user session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await getCurrentUser();
      if (data?.user) {
        const profileName = data.profile?.full_name;
        const metaName = data.user.user_metadata?.full_name;
        const fallbackName = data.user.email.split('@')[0];
        const userName = profileName || metaName || fallbackName;

        setUser({
          id: data.user.id,
          name: userName,
          email: data.user.email,
          avatar: userName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
        });
        setIsLoggedIn(true);

        // Prefer profile.user_role over metadata
        const profileRole = data.profile?.user_role;
        if (profileRole === 'host') {
          setUserType('host');
          await ensureHostInfoRecord(data.user.id, data.profile);
        } else {
          setUserType('guest');
        }

        if (data.profile) {
          initializeHostFromProfile(data.profile);
        }

        // Load user data
        await loadUserData(data.user.id);
      }
    };

    checkSession();
  }, []);

  // Handle search button click - sync input values with search params
  const handleSearch = () => {
    // Get current input values from refs (since they're uncontrolled when autocomplete is loaded)
    const mobileValue = searchInputRef.current?.value || searchQuery;
    const desktopValue = searchInputRefDesktop.current?.value || searchQuery;
    const destination = mobileValue || desktopValue;

    // Update search params to trigger hotel fetch
    setSearchParams(prev => ({
      ...prev,
      destination: destination
    }));
    setSearchQuery(destination);
  };

  // Keep focus on destination input across re-mounts while typing
  useEffect(() => {
    if (!destinationInputFocusedRef.current) return;
    if (isMobile) return;

    const activeRef = currentView === 'search' ? searchInputRef : searchInputRefDesktop;
    if (activeRef.current && document.activeElement !== activeRef.current) {
      activeRef.current.focus();
    }
  }, [destinationInput, currentView, isMobile]);

  // Ensure input keeps focus when suggestions appear
  useEffect(() => {
    if (!showSuggestions) return;
    if (isMobile) return;

    const activeRef = currentView === 'search' ? searchInputRef : searchInputRefDesktop;
    if (activeRef.current && document.activeElement !== activeRef.current) {
      activeRef.current.focus();
    }
  }, [showSuggestions, currentView, isMobile]);

  // Load all properties on initial mount
  useEffect(() => {
    const loadAllHotels = async () => {
      setHotelsLoading(true);
      console.log('Loading all properties...');

      // Fetch all hotels without filters
      const { data, error } = await fetchHotels({});
      if (!error && data) {
        setHotels(data);
        console.log(`Loaded ${data.length} properties total`);

        // Sanity check: log coordinates of all properties
        console.log('Property coordinates:', data.map(h => ({
          id: h.id,
          name: h.name,
          coords: h.coordinates || { lat: h.latitude, lng: h.longitude }
        })));
      } else {
        console.error('Error loading properties:', error);
        setHotels([]);
      }
      setHotelsLoading(false);
    };

    loadAllHotels();
  }, []); // Only run once on mount

  // Calculate distance between two coordinates (Haversine formula)
  // Add state for sorting
  const [sortBy, setSortBy] = useState('');

  // Filter hotels based on selected location from Google Places
  const filteredHotels = React.useMemo(() => {
    let filtered = hotels;

    // If no search query, show all hotels
    if (!searchParams.destination || searchParams.destination.trim() === '') {
      console.log('No search query - showing all', hotels.length, 'properties');
      filtered = hotels;
    } else {

      // If Google Place was selected, use its location data
      if (selectedPlace && selectedPlace.geometry) {
        console.log('Filtering by Google Place:', selectedPlace);
        console.log('Address components:', selectedPlace.address_components);

        const searchLat = selectedPlace.geometry.location.lat();
        const searchLng = selectedPlace.geometry.location.lng();

        // Extract location components from Google Places
        const placeComponents = {
          city: selectedPlace.address_components?.find(c =>
            c.types.includes('locality') || c.types.includes('administrative_area_level_2')
          )?.long_name?.toLowerCase() || '',
          state: selectedPlace.address_components?.find(c =>
            c.types.includes('administrative_area_level_1')
          )?.long_name?.toLowerCase() || '',
          country: selectedPlace.address_components?.find(c =>
            c.types.includes('country')
          )?.long_name?.toLowerCase() || '',
          // Also extract from formatted_address as fallback
          placeName: selectedPlace.name?.toLowerCase() || '',
          formattedAddress: selectedPlace.formatted_address?.toLowerCase() || ''
        };

        console.log('Place components:', placeComponents);

        const searchCenter = searchLocation || { lat: searchLat, lng: searchLng };
        const { hotels: radiusHotels, radiusKm, mode: radiusMode } =
          getHotelsForSearchLocation(searchCenter, hotels, radiusFilterKm);

        console.log('Radius-based filtering:', {
          center: searchCenter,
          radiusKm,
          mode: radiusMode,
          total: hotels.length,
          inRadius: radiusHotels.length
        });

        // Use only the radius-based subset when a place is selected
        filtered = radiusHotels;
        console.log('Filtered', filtered.length, 'properties for', selectedPlace.name);
      } else {
        // Fallback: Text-based search (when Google Places hasn't loaded or user typed manually)
        const searchTerm = searchParams.destination.toLowerCase().trim();
        console.log('Filtering by text search:', searchTerm);

        filtered = hotels.filter(hotel => {
          const location = hotel.location?.toLowerCase() || '';
          const city = hotel.city?.toLowerCase() || '';
          const country = hotel.country?.toLowerCase() || '';
          const name = hotel.name?.toLowerCase() || '';

          const matches = location.includes(searchTerm) ||
                 city.includes(searchTerm) ||
                 country.includes(searchTerm) ||
                 name.includes(searchTerm);

          if (matches) {
            console.log('✓ Text match:', hotel.name, '- Location:', hotel.location, 'City:', hotel.city);
          }

          return matches;
        });

        console.log('Filtered', filtered.length, 'properties by text search');
      }
    }

    // Apply price range filter
    filtered = filtered.filter(hotel => {
      const price = hotel.price || hotel.price_per_night || 0;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Apply rating filter
    if (filters.rating !== 'all') {
      const minRating = Number(filters.rating);
      filtered = filtered.filter(hotel => (hotel.rating || 0) >= minRating);
    }

    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(hotel => {
        const hotelType = (hotel.type || '').toLowerCase();
        const filterType = filters.type.toLowerCase();

        // Handle plural forms
        if (filterType === 'hotels') return hotelType === 'hotel';
        if (filterType === 'resorts') return hotelType === 'resort';
        if (filterType === 'guesthouses') return hotelType === 'guesthouse' || hotelType === 'guest house';
        if (filterType === 'farmstays') return hotelType === 'farmstay' || hotelType === 'farm stay';
        if (filterType === 'apartments') return hotelType === 'apartment';

        return hotelType === filterType;
      });
    }

    // Apply amenities filter
    if (filters.amenities && filters.amenities.length > 0) {
      filtered = filtered.filter(hotel => {
        const hotelAmenities = (hotel.amenities || []).map(a => a.toLowerCase());
        return filters.amenities.every(filterAmenity =>
          hotelAmenities.some(ha => ha.includes(filterAmenity.toLowerCase()))
        );
      });
    }

    // Apply sorting
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        const priceA = a.price || a.price_per_night || 0;
        const priceB = b.price || b.price_per_night || 0;
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;

        switch (sortBy) {
          case 'price-low':
            return priceA - priceB;
          case 'price-high':
            return priceB - priceA;
          case 'rating':
            return ratingB - ratingA;
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [hotels, selectedPlace, searchParams.destination, filters, sortBy, searchLocation, radiusFilterKm]);

  // Check if a coordinate is within map bounds
  const isWithinBounds = (lat, lng, bounds) => {
    if (!bounds) return false;
    return lat >= bounds.south && lat <= bounds.north &&
           lng >= bounds.west && lng <= bounds.east;
  };

  // Get hotels within current map view
  const mapViewHotels = React.useMemo(() => {
    if (!mapBounds || !showMapViewHotels) return [];

    return hotels.filter(hotel => {
      if (!hotel.coordinates) return false;
      return isWithinBounds(hotel.coordinates.lat, hotel.coordinates.lng, mapBounds);
    });
  }, [hotels, mapBounds, showMapViewHotels]);

  // Combined hotels list: show search results, or map view if no results
  const displayedHotels = React.useMemo(() => {
    const hasDestination =
      !!searchParams.destination && searchParams.destination.trim() !== '';

    // 🗺 Map-driven mode: no destination typed → show hotels in current map view
    if (!hasDestination) {
      if (mapBounds && hotels.some(h => h.coordinates)) {
        // If we have bounds and properties with coordinates,
        // prefer only hotels inside the visible area
        const inBounds = hotels.filter(h =>
          h.coordinates &&
          isWithinBounds(h.coordinates.lat, h.coordinates.lng, mapBounds)
        );
        return inBounds.length > 0 ? inBounds : hotels;
      }
      // No bounds yet → show all
      return hotels;
    }

    // 🔍 Destination-based mode: use the full filtered logic first
    if (filteredHotels.length > 0) {
      return filteredHotels;
    }

    // Destination given but zero results:
    // allow a manual "Show properties in current map view" fallback
    if (mapViewHotels.length > 0 && showMapViewHotels) {
      return mapViewHotels;
    }

    // Truly nothing found
    return [];
  }, [
    hotels,
    filteredHotels,
    mapBounds,
    mapViewHotels,
    showMapViewHotels,
    searchParams.destination,
  ]);

  // Reset showMapViewHotels when we have filtered results
  useEffect(() => {
    if (filteredHotels.length > 0 && showMapViewHotels) {
      setShowMapViewHotels(false);
    }
  }, [filteredHotels.length, showMapViewHotels]);

  const fitMapToHotels = React.useCallback((hotelsToFit) => {
    if (!googleMapRef.current || !hotelsToFit?.length || !window.google?.maps) return;

    // Don't auto-fit if user has manually moved/zoomed the map
    if (userInteractedWithMap.current) {
      console.log('Skipping auto-fit: user has interacted with map');
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    let hasValidCoordinates = false;

    hotelsToFit.forEach(hotel => {
      const lat = Number(hotel.latitude || hotel.coordinates?.lat);
      const lng = Number(hotel.longitude || hotel.coordinates?.lng);

      if (!isNaN(lat) && !isNaN(lng)) {
        bounds.extend({ lat, lng });
        hasValidCoordinates = true;
      }
    });

    if (hasValidCoordinates) {
      console.log(`Auto-fitting map to ${hotelsToFit.length} hotels`);
      googleMapRef.current.fitBounds(bounds, { padding: 50 });
    }
  }, []);

  // Auto-fit map to displayed hotels when they change and user hasn't moved the map
  useEffect(() => {
    if (!mapLoadedRef.current) {
      console.log('Skipping auto-fit: map not ready yet');
      return;
    }
    if (!displayedHotels || displayedHotels.length === 0) {
      console.log('Skipping auto-fit: no hotels to display');
      return;
    }

    // Only if at least one hotel has valid coordinates
    const hasCoords = displayedHotels.some(h =>
      (h.coordinates && !isNaN(Number(h.coordinates.lat)) && !isNaN(Number(h.coordinates.lng))) ||
      (!isNaN(Number(h.latitude)) && !isNaN(Number(h.longitude)))
    );
    if (!hasCoords) {
      console.log('Skipping auto-fit: no hotels with valid coordinates');
      return;
    }

    console.log(`Auto-fitting map to ${displayedHotels.length} displayed hotels`);
    fitMapToHotels(displayedHotels);
  }, [displayedHotels, fitMapToHotels]);

  // Reset map to show all displayed hotels and clear interaction state
  const resetMapView = React.useCallback(() => {
    userInteractedWithMap.current = false;
    setMapUserInteracted(false);
    setMapSelectedHotel(null);
    setHoveredHotelId(null);

    if (googleMapRef.current && displayedHotels.length > 0 && window.google?.maps) {
      const bounds = new window.google.maps.LatLngBounds();
      let hasValidCoordinates = false;

      displayedHotels.forEach(hotel => {
        const lat = Number(hotel.latitude || hotel.coordinates?.lat);
        const lng = Number(hotel.longitude || hotel.coordinates?.lng);

        if (!isNaN(lat) && !isNaN(lng)) {
          bounds.extend({ lat, lng });
          hasValidCoordinates = true;
        }
      });

      if (hasValidCoordinates) {
        googleMapRef.current.fitBounds(bounds, { padding: 50 });
      }
    }
  }, [displayedHotels]);

  // NEW: Fetch place suggestions from Google Places API
  const fetchPlaceSuggestions = React.useCallback((input) => {
    if (!autocompleteServiceRef.current || !input || input.length < 2) {
      setSuggestions([]);
      return;
    }

    // Clear previous debounce
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input,
          types: ['(cities)'],
          componentRestrictions: { country: 'in' } // Remove for worldwide search
        },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
          }
        }
      );
    }, 300); // Debounce 300ms
  }, []);

  // NEW: Handle selecting a suggestion
  const handleSelectSuggestion = React.useCallback((suggestion) => {
    if (!placesServiceRef.current || !suggestion?.place_id) return;

    placesServiceRef.current.getDetails(
      {
        placeId: suggestion.place_id,
        fields: ['name', 'geometry', 'formatted_address', 'address_components']
      },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const cityName = place.name || suggestion.description;

          // Canonical search center for radius-based filtering
          if (place.geometry?.location) {
            setSearchLocation({
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            });
          }

          setDestinationInput(cityName);
          setSearchQuery(cityName);
          setSearchParams(prev => ({ ...prev, destination: cityName }));
          setSelectedPlace(place);
          setSuggestions([]);
          setShowSuggestions(false);

          // Update input refs
          if (searchInputRef.current) searchInputRef.current.value = cityName;
          if (searchInputRefDesktop.current) searchInputRefDesktop.current.value = cityName;

          // Mark as user search and reset map interaction
          selectedPlaceSourceRef.current = 'user-search';
          userInteractedWithMap.current = false;
          setMapUserInteracted(false);

          // Clear saved view so map can auto-fit to new destination's hotels
          if (googleMapRef.current?.clearSavedView) {
            console.log('Clearing saved map view for new destination');
            googleMapRef.current.clearSavedView();
          }

          console.log('Selected place:', cityName);
        }
      }
    );
  }, []);

  // NEW: Handle destination input change
  const handleDestinationInputChange = React.useCallback((e) => {
    const value = e.target.value;
    setDestinationInput(value);
    setSearchQuery(value);
    fetchPlaceSuggestions(value);
  }, [fetchPlaceSuggestions]);

  const handleDestinationInputFocus = React.useCallback(() => {
    destinationInputFocusedRef.current = true;
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [suggestions.length]);

  // NEW: Handle suggestions blur
  const handleSuggestionsBlur = React.useCallback(() => {
    destinationInputFocusedRef.current = false;
    // Delay to allow click on suggestion
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  }, []);

  // Track if selectedPlace was set by user search vs automatic geolocation
  const selectedPlaceSourceRef = useRef('');

  useEffect(() => {
    if (!selectedPlace?.geometry) return;

    // Only center map if user hasn't interacted with it AND this is from user search
    if (!userInteractedWithMap.current && selectedPlaceSourceRef.current === 'user-search') {
      const newCenter = {
        lat: selectedPlace.geometry.location.lat(),
        lng: selectedPlace.geometry.location.lng()
      };

      if (googleMapRef.current) {
        googleMapRef.current.setCenter(newCenter);
        googleMapRef.current.setZoom(10);
        console.log('Map centered to user-selected place');
      }
    } else if (selectedPlaceSourceRef.current === 'geolocation') {
      console.log('Skipping map center for geolocation');
    }
  }, [selectedPlace]);

  // Dynamically load the Google Maps script
  useEffect(() => {
    const scriptId = 'google-maps-script';

    // Prevent script from being added multiple times
    if (document.getElementById(scriptId)) {
      console.log('Google Maps script already loaded.');
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    // Standard Maps JavaScript API (no v=beta needed)
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}&libraries=marker,places&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('Google Maps script loaded successfully.');
    };

    script.onerror = () => {
      console.error('Error loading Google Maps script.');
      setMapError('The map could not be loaded. Please check the API key and network connection.');
    };

    document.body.appendChild(script);
  }, []);

  // Update map bounds when map is moved or zoomed
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    const updateMapBounds = () => {
      const bounds = map.getBounds();
      if (bounds) {
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        setMapBounds({
          north: ne.lat(),
          south: sw.lat(),
          east: ne.lng(),
          west: sw.lng()
        });
      }
    };

    updateMapBounds();

    const boundsListener = map.addListener('bounds_changed', updateMapBounds);

    return () => {
      if (boundsListener?.remove) {
        boundsListener.remove();
      } else if (window.google?.maps?.event && boundsListener) {
        window.google.maps.event.removeListener(boundsListener);
      }
    };
  }, [mapLoaded]);

  // Get user's current location ONLY on first mount
  useEffect(() => {
    // Skip if already fetched
    if (initialLocationFetched.current) return;

    const getCurrentLocation = async () => {
      if (!navigator.geolocation) {
        console.log('Geolocation not supported');
        return;
      }

      setLocationLoading(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          initialLocationFetched.current = true;

          // Wait for Google Maps to load
          if (!window.google?.maps?.importLibrary) {
            setLocationLoading(false);
            return;
          }

          try {
            const { Geocoder } = await window.google.maps.importLibrary("geocoding");
            const geocoder = new Geocoder();
            const result = await geocoder.geocode({
              location: { lat: latitude, lng: longitude }
            });

            if (result.results[0]) {
              const addressComponents = result.results[0].address_components;
              const city = addressComponents.find(c =>
                c.types.includes('locality') || c.types.includes('administrative_area_level_2')
              );

              if (city) {
                const cityName = city.long_name;

                // Only set if user hasn't typed anything yet
                if (!destinationInput && !searchQuery) {
                  // Canonical search center from geolocation
                  setSearchLocation({ lat: latitude, lng: longitude });

                  setDestinationInput(cityName);
                  setSearchQuery(cityName);
                  setSearchParams(prev => ({ ...prev, destination: cityName }));

                  // Update input refs
                  if (searchInputRef.current) searchInputRef.current.value = cityName;
                  if (searchInputRefDesktop.current) searchInputRefDesktop.current.value = cityName;

                  // Mark as geolocation source
                  selectedPlaceSourceRef.current = 'geolocation';

                  // Clear saved view so map can auto-fit to current location's hotels
                  if (googleMapRef.current?.clearSavedView) {
                    console.log('Clearing saved map view for current location');
                    googleMapRef.current.clearSavedView();
                  }

                  setSelectedPlace({
                    name: cityName,
                    geometry: {
                      location: {
                        lat: () => latitude,
                        lng: () => longitude
                      }
                    },
                    formatted_address: result.results[0].formatted_address,
                    address_components: addressComponents
                  });
                }
              }
            }
          } catch (error) {
            console.log('Geocoding failed:', error.message);
          }

          setLocationLoading(false);
        },
        (error) => {
          console.log('Location access denied or failed:', error.message);
          setLocationLoading(false);
          initialLocationFetched.current = true;
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    };

    getCurrentLocation();
  }, []); // Empty deps - only run once

  // Initialize Google Places Services (NOT Autocomplete widget)
  useEffect(() => {
    const initPlacesServices = async () => {
      try {
        if (!window.google?.maps?.importLibrary) return;

        const { AutocompleteService, PlacesService } = await window.google.maps.importLibrary("places");

        // PlacesService requires a div element (can be hidden)
        const dummyDiv = document.createElement('div');

        autocompleteServiceRef.current = new AutocompleteService();
        placesServiceRef.current = new PlacesService(dummyDiv);

        setPlacesLoaded(true);
        console.log('✓ Google Places services initialized');
      } catch (error) {
        console.debug('Places services not available:', error.message);
      }
    };

    if (window.google?.maps?.importLibrary) {
      initPlacesServices();
    } else {
      const checkGoogle = setInterval(() => {
        if (window.google?.maps?.importLibrary) {
          initPlacesServices();
          clearInterval(checkGoogle);
        }
      }, 100);

      return () => clearInterval(checkGoogle);
    }
  }, []); // Empty deps - only run once

  const toggleFavorite = async (hotelId) => {
    if (!isLoggedIn || !user?.id) {
      alert('Please log in to add favorites');
      return;
    }

    const isFavorited = favoritesData.includes(hotelId);

    if (isFavorited) {
      // Remove from favorites
      const { error } = await removeFromFavorites(user.id, hotelId);
      if (!error) {
        setFavoritesData(prev => prev.filter(id => id !== hotelId));
        setFavorites(prev => prev.filter(id => id !== hotelId));
      }
    } else {
      // Add to favorites
      const { error } = await addToFavorites(user.id, hotelId);
      if (!error) {
        setFavoritesData(prev => [...prev, hotelId]);
        setFavorites(prev => [...prev, hotelId]);
      }
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 9) return 'bg-emerald-500';
    if (rating >= 8) return 'bg-blue-500';
    if (rating >= 7) return 'bg-cyan-500';
    if (rating >= 6) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const statusBadge = (status) => (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${
        status === 'verified'
          ? 'bg-green-100 text-green-700'
          : status === 'pending'
          ? 'bg-yellow-100 text-yellow-700'
          : 'bg-gray-100 text-gray-700'
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  const getRatingBarWidth = (score) => `${(score / 10) * 100}%`;

  // Update map zoom
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapZoom);
    }
  }, [mapZoom]);

  // Guest Selector Component
  const GuestSelector = ({ show, onClose }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Select Guests</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Adults */}
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <div className="font-semibold text-gray-900">Adults</div>
                <div className="text-sm text-gray-500">Ages 13 or above</div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => decrementGuests('adults')}
                  disabled={searchParams.adults === 0}
                  className="w-10 h-10 rounded-full border-2 border-blue-600 text-blue-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors"
                >
                  <span className="text-xl font-bold">-</span>
                </button>
                <span className="text-lg font-semibold w-8 text-center">{searchParams.adults}</span>
                <button
                  onClick={() => incrementGuests('adults')}
                  className="w-10 h-10 rounded-full border-2 border-blue-600 text-blue-600 flex items-center justify-center hover:bg-blue-50 transition-colors"
                >
                  <span className="text-xl font-bold">+</span>
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <div className="font-semibold text-gray-900">Children</div>
                <div className="text-sm text-gray-500">Ages 0-12</div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => decrementGuests('children')}
                  disabled={searchParams.children === 0}
                  className="w-10 h-10 rounded-full border-2 border-blue-600 text-blue-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors"
                >
                  <span className="text-xl font-bold">-</span>
                </button>
                <span className="text-lg font-semibold w-8 text-center">{searchParams.children}</span>
                <button
                  onClick={() => incrementGuests('children')}
                  className="w-10 h-10 rounded-full border-2 border-blue-600 text-blue-600 flex items-center justify-center hover:bg-blue-50 transition-colors"
                >
                  <span className="text-xl font-bold">+</span>
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    );
  };

  // Login/Signup Modal Component
  const AuthModal = () => {
    const [formData, setFormData] = React.useState({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      userType: preferredUserType // guest or host
    });

    React.useEffect(() => {
      if (showAuthModal) {
        setFormData(prev => ({ ...prev, userType: preferredUserType }));
      }
    }, [preferredUserType, showAuthModal]);

    if (!showAuthModal) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      if (authMode === 'login') {
        handleLogin(formData.email, formData.password, formData.userType);
      } else {
        if (formData.password === formData.confirmPassword) {
          handleSignup(formData.name, formData.email, formData.password, formData.userType);
        } else {
          alert('Passwords do not match');
        }
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowAuthModal(false)}>
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {authMode === 'login' ? 'Login' : 'Sign Up'}
            </h2>
            <button onClick={() => setShowAuthModal(false)} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          {/* User Type Selector */}
          <div className="mb-6 bg-gray-100 p-1 rounded-lg flex">
            <button
              type="button"
              onClick={() => {
                setFormData({...formData, userType: 'guest'});
                setPreferredUserType('guest');
              }}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${
                formData.userType === 'guest' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Guest
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({...formData, userType: 'host'});
                setPreferredUserType('host');
              }}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${
                formData.userType === 'host' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Host
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              {authMode === 'login' ? 'Login' : 'Sign Up'} as {formData.userType === 'guest' ? 'Guest' : 'Host'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {authMode === 'login' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Login"}
            </button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-500">
            Demo: Use any email/password to {authMode === 'login' ? 'login' : 'sign up'}
          </div>
        </div>
      </div>
    );
  };

  // Share Modal Component
  const ShareModal = () => {
    if (!showShareModal) return null;

    const copyToClipboard = () => {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Share Property</h2>
            <button onClick={() => setShowShareModal(false)} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Share this link</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Share this property with friends and family. The link includes your search dates and guest count.
          </div>
        </div>
      </div>
    );
  };

  // Image Gallery Modal Component
  const ImageGalleryModal = () => {
    if (!showImageGallery || !selectedHotel) return null;

    const nextImage = () => {
      setCurrentImageIndex((prev) => (prev + 1) % selectedHotel.images.length);
    };

    const prevImage = () => {
      setCurrentImageIndex((prev) => (prev - 1 + selectedHotel.images.length) % selectedHotel.images.length);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
        <button
          onClick={() => setShowImageGallery(false)}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <X size={32} />
        </button>

        <button
          onClick={prevImage}
          className="absolute left-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-3 z-10"
        >
          <ChevronLeft size={32} />
        </button>

        <div className="max-w-5xl w-full">
          <img
            src={selectedHotel.images[currentImageIndex]}
            alt={`${selectedHotel.name} ${currentImageIndex + 1}`}
            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
          />
          <div className="text-center text-white mt-4 text-lg">
            {currentImageIndex + 1} / {selectedHotel.images.length}
          </div>
        </div>

        <button
          onClick={nextImage}
          className="absolute right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-3 z-10"
        >
          <ChevronRight size={32} />
        </button>
      </div>
    );
  };

  // Header Component
  const Header = () => (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center cursor-pointer space-x-2" onClick={() => setCurrentView('search')}>
            <img
              src={brandIcon}
              alt="Cadreago icon"
              className={`h-8 w-8 ${isMobile ? 'block' : 'hidden'} object-contain`}
            />
            <img
              src={brandLogo}
              alt="Cadreago logo"
              className={`${isMobile ? 'hidden' : 'block'} h-10 object-contain`}
            />
          </div>
          
          {/* Desktop Navigation (>= 360px) */}
          {!isMobile && (
            <nav className="hidden md:flex items-center space-x-8">
              <button onClick={() => setCurrentView('search')} className="text-blue-600 hover:text-blue-700 font-medium">Hotels</button>
              
              {isLoggedIn ? (
                <>
                  <button 
                    onClick={() => setCurrentView(userType === 'host' ? 'host-dashboard' : 'dashboard')} 
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {userType === 'host' ? 'Host Dashboard' : 'Dashboard'}
                  </button>
                  {userType === 'guest' && (
                    <button className="text-blue-600 hover:text-blue-700 font-medium">Favorites</button>
                  )}
                  {userType === 'host' && (
                    <button 
                      onClick={() => setShowAddPropertyModal(true)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Add Property
                    </button>
                  )}
                  <button className="text-blue-600 hover:text-blue-700 font-medium">Help</button>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-700 text-sm">{user?.name}</span>
                    <div 
                      className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer" 
                      onClick={() => setCurrentView(userType === 'host' ? 'host-dashboard' : 'dashboard')}
                    >
                      {user?.avatar}
                    </div>
                    <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-gray-800">Logout</button>
                  </div>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      setPreferredUserType('host');
                      setAuthMode('signup');
                      setShowAuthModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    I am a Host
                  </button>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">Help</button>
                  <button
                    onClick={() => {
                      setPreferredUserType('guest');
                      setAuthMode('login');
                      setShowAuthModal(true);
                    }}
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => {
                      setPreferredUserType('guest');
                      setAuthMode('signup');
                      setShowAuthModal(true);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </nav>
          )}

          {/* Mobile Menu Button */}
          <button 
            className={isMobile ? '' : 'md:hidden'}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="bg-white border-t shadow-lg">
          <div className="px-4 py-3 space-y-3">
            <button 
              onClick={() => {
                setCurrentView('search');
                setMobileMenuOpen(false);
              }} 
              className="block w-full text-left px-4 py-3 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
            >
              🏨 Hotels
            </button>
            
            {isLoggedIn ? (
              <>
                <button 
                  onClick={() => {
                    setCurrentView(userType === 'host' ? 'host-dashboard' : 'dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                >
                  📊 {userType === 'host' ? 'Host Dashboard' : 'Dashboard'}
                </button>
                {userType === 'guest' && (
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left px-4 py-3 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    ❤️ Favorites
                  </button>
                )}
                {userType === 'host' && (
                  <button 
                    onClick={() => {
                      setShowAddPropertyModal(true);
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    ➕ Add Property
                  </button>
                )}
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-4 py-3 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                >
                  ❓ Help
                </button>
                <div className="pt-3 border-t flex items-center justify-between px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user?.avatar}
                    </div>
                    <div>
                      <span className="text-gray-700 font-medium block">{user?.name}</span>
                      <span className="text-xs text-gray-500">{userType === 'host' ? 'Host' : 'Guest'}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={() => {
                    setPreferredUserType('host');
                    setAuthMode('signup');
                    setShowAuthModal(true);
                    setMobileMenuOpen(false);
                  }}
                    className="block w-full text-left px-4 py-3 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    ➕ I am a Host
                  </button>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-4 py-3 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                >
                  ❓ Help
                </button>
                <div className="pt-3 border-t space-y-2">
                  <button 
                    onClick={() => {
                      setPreferredUserType('guest');
                      setAuthMode('login');
                      setShowAuthModal(true);
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full px-4 py-3 text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => {
                      setPreferredUserType('guest');
                      setAuthMode('signup');
                      setShowAuthModal(true);
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );

  // Banner Component - Only shows on web/desktop
  const Banner = () => (
    showBanner && (
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 md:opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&h=400&fit=crop')] bg-cover bg-center"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
            <div className="text-center md:text-left mb-3 md:mb-0 w-full">
              <h1 className={`${isMobile ? 'text-xl' : 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl'} font-bold mb-1 md:mb-2 lg:mb-3`}>
                Premium Stays Smart Booking
              </h1>
              <p className={`${isMobile ? 'text-xs' : 'text-sm sm:text-base md:text-lg lg:text-xl'} text-blue-100 mb-1 md:mb-2`}>
                Discover luxury hotels at unbeatable prices
              </p>
              <p className={`${isMobile ? 'text-[10px]' : 'text-xs sm:text-sm md:text-base'} text-blue-200`}>
                {isMobile ? '🎉 Deals • ✨ Offers • 🌟 Best price' : '🎉 Limited time deals • ✨ Exclusive offers • 🌟 Best price guarantee'}
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className={`bg-white text-blue-600 ${isMobile ? 'px-3 py-1.5 text-sm' : 'px-4 md:px-6 py-2 md:py-3 text-base md:text-lg'} rounded-full font-bold shadow-xl whitespace-nowrap`}>
                Up to 50% OFF
              </div>
              <button 
                onClick={() => setShowBanner(false)}
                className={`text-white hover:text-blue-200 ${isMobile ? 'text-[10px]' : 'text-xs md:text-sm'} underline`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  // Home Page
  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Welcome to Cadreago</h1>
          <p className="text-xl md:text-2xl mb-12 text-blue-100">Premium stays smart booking</p>
          
          {/* Search Box */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Destination */}
              <div>
                <label className="block text-left text-sm font-medium text-gray-700 mb-2">Destination</label>
                <DestinationSearchInput
                  inputRef={searchInputRefDesktop}
                  value={destinationInput}
                  onChange={handleDestinationInputChange}
                  onFocus={handleDestinationInputFocus}
                  onBlur={handleSuggestionsBlur}
                  suggestions={suggestions}
                  showSuggestions={showSuggestions}
                  onSuggestionSelect={handleSelectSuggestion}
                  loading={locationLoading}
                />
              </div>

              {/* Check-in */}
              <div>
                <label className="block text-left text-sm font-medium text-gray-700 mb-2">Check in</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 text-gray-400 pointer-events-none" size={20} />
                  <input 
                    type="date"
                    value={searchParams.checkIn}
                    onChange={(e) => setSearchParams({...searchParams, checkIn: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>
              </div>

              {/* Check-out */}
              <div>
                <label className="block text-left text-sm font-medium text-gray-700 mb-2">Check out</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 text-gray-400 pointer-events-none" size={20} />
                  <input 
                    type="date"
                    value={searchParams.checkOut}
                    onChange={(e) => setSearchParams({...searchParams, checkOut: e.target.value})}
                    min={searchParams.checkIn}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>
              </div>

              {/* Guests */}
              <div>
                <label className="block text-left text-sm font-medium text-gray-700 mb-2">Guests</label>
                <div className="relative">
                  <Users className="absolute left-3 top-3.5 text-gray-400 pointer-events-none" size={20} />
                  <button
                    type="button"
                    onClick={() => setShowGuestSelector(true)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-left text-gray-700 hover:border-blue-400 transition-colors"
                  >
                    {getGuestText()}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                handleSearch();
                setCurrentView('search');
              }}
              className="w-full md:w-auto px-12 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="text-blue-600" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Premium Properties</h3>
            <p className="text-gray-600">Curated selection of the finest hotels and resorts</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-blue-600" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Smart Booking</h3>
            <p className="text-gray-600">Best prices guaranteed with instant confirmation</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-blue-600" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Verified Reviews</h3>
            <p className="text-gray-600">Real ratings from genuine guests</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Filter row
  const RADIUS_OPTIONS = [
    { label: 'Auto (recommended)', value: null },
    { label: '5 km', value: 5 },
    { label: '10 km', value: 10 },
    { label: '15 km', value: 15 },
    { label: '20 km', value: 20 },
    { label: '25 km', value: 25 },
  ];

  const FilterBar = () => (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col gap-4 overflow-x-auto">
      <div className="flex items-center space-x-3">
        <Filter size={18} className="text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-800">Filters</h3>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
        {/* Price Range Slider */}
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700">Price Range</span>
            <span className="text-xs text-gray-600">
              {formatCurrency(filters.priceRange[0])} - {formatCurrency(filters.priceRange[1])}
            </span>
          </div>
          <div className="space-y-2">
            <div className="relative h-4 flex items-center">
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={filters.priceRange[0]}
                onChange={(e) => {
                  const raw = Number(e.target.value);
                  const max = filters.priceRange[1];
                  const nextMin = Math.min(raw, max - 1000);
                  setFilters({ ...filters, priceRange: [nextMin, max] });
                }}
                className="absolute inset-0 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={filters.priceRange[1]}
                onChange={(e) => {
                  const raw = Number(e.target.value);
                  const min = filters.priceRange[0];
                  const nextMax = Math.max(raw, min + 1000);
                  setFilters({ ...filters, priceRange: [min, nextMax] });
                }}
                className="absolute inset-0 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange[0]}
                onChange={(e) => setFilters({...filters, priceRange: [Math.min(Number(e.target.value) || 0, filters.priceRange[1] - 1000), filters.priceRange[1]]})}
                className="w-24 px-2 py-1 border border-gray-300 rounded text-xs"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange[1]}
                onChange={(e) => setFilters({...filters, priceRange: [filters.priceRange[0], Math.max(Number(e.target.value) || 100000, filters.priceRange[0] + 1000)]})}
                className="w-24 px-2 py-1 border border-gray-300 rounded text-xs"
              />
            </div>
          </div>
        </div>

        {/* Rating filter */}
        <select
          value={filters.rating}
          onChange={(e) => setFilters({...filters, rating: e.target.value})}
          className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Any rating</option>
          <option value="9">9+ Wonderful</option>
          <option value="8">8+ Very good</option>
          <option value="7">7+ Good</option>
          <option value="6">6+ Pleasant</option>
        </select>

        {/* Type filter */}
        <select
          value={filters.type}
          onChange={(e) => setFilters({...filters, type: e.target.value})}
          className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All stays</option>
          <option value="hotels">Hotels</option>
          <option value="resorts">Resorts</option>
          <option value="guesthouses">Guesthouses</option>
          <option value="farmstays">Farm stays</option>
          <option value="apartments">Apartments</option>
        </select>

        {/* Radius filter */}
        <div className="flex-1 md:flex-none">
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-600">Search radius</div>
            <div className="flex flex-wrap gap-2">
              {RADIUS_OPTIONS.map((opt) => {
                const isActive = radiusFilterKm === opt.value;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setRadiusFilterKm(opt.value)}
                    className={
                      'rounded-full px-3 py-1 text-xs border ' +
                      (isActive
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-white text-slate-700 border-slate-300')
                    }
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowMoreFilters(!showMoreFilters)}
          className="px-4 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
        >
          {showMoreFilters ? 'Hide filters' : 'More filters'}
        </button>
      </div>
    </div>
  );

  // Handle hovering over hotel card in the list (does not move map)
  const handleHotelCardHover = React.useCallback((hotelId) => {
    setHoveredHotelId(hotelId);
    // If you want zoom-on-hover, you can also set a zoomToHotelId state here.
  }, []);

  const handleHotelCardLeave = React.useCallback(() => {
    setHoveredHotelId(null);
  }, []);

  // Hotel Card matching exact design from image 2
  const HotelCard = ({ hotel }) => {
    // Calculate stars based on rating (0-10 scale converted to 0-5 stars)
    const starCount = hotel.stars || Math.min(5, Math.round((hotel.rating || 0) / 2));

    return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
      onClick={() => {
        setSelectedHotel(hotel);
        setCurrentView('details');
      }}
      onMouseEnter={() => setHoveredHotelId(hotel.id)}
      onMouseLeave={() => setHoveredHotelId(null)}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="md:w-2/5 relative">
          <img
            src={hotel.image}
            alt={hotel.name}
            className="w-full h-40 md:h-48 object-cover"
          />
          {hotel.ecoFriendly && (
            <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
              <Sparkles size={12} />
              <span className="font-medium">Eco-friendly</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="md:w-3/5 p-3 md:p-4">
          <div className="flex flex-col md:flex-row justify-between items-start mb-2">
            <div className="flex-1 mb-3 md:mb-0">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">{hotel.name}</h3>
              <div className="flex items-center space-x-1 mb-1">
                {starCount > 0 ? (
                  [...Array(starCount)].map((_, i) => (
                    <Star key={i} size={14} fill="#000" color="#000" />
                  ))
                ) : (
                  <span className="text-xs text-gray-400">No rating</span>
                )}
              </div>
              <div className="flex items-center text-gray-500 text-xs mb-2">
                <span>{hotel.location}</span>
              </div>

              {/* Limited Deal Badge */}
              {hotel.limitedDeal && (
                <div className="mb-2">
                  <span className="inline-block px-2 py-1 bg-green-500 text-white rounded text-xs font-semibold">
                    Limited time deal
                  </span>
                </div>
              )}

              {/* Amenities - Show first 3 with icons */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(hotel.amenities || []).slice(0, 3).map((amenity, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium flex items-center gap-1">
                    {amenity === 'WiFi' && <Wifi size={12} />}
                    {amenity === 'Pool' && <Waves size={12} />}
                    {amenity === 'Parking' && <Car size={12} />}
                    {amenity === 'Spa' && <Sparkles size={12} />}
                    {amenity}
                  </span>
                ))}
                {(hotel.amenities || []).length > 3 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                    +{hotel.amenities.length - 3} more
                  </span>
                )}
              </div>

              {/* View on map button */}
              {hotel.coordinates && (
                <button
                  type="button"
                  className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline gap-1 mb-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomToHotelId(hotel.id);
                    // Optional: scroll to the map section
                    const el = document.getElementById('cadreago-map-section');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                >
                  <MapPin className="w-3 h-3" />
                  View on map
                </button>
              )}

              {/* Free Cancellation Box - Compact */}
              {hotel.freeCancellation && (
                <div className="border border-blue-400 rounded-lg p-2 mb-2 bg-blue-50">
                  <div className="text-blue-700 font-semibold text-xs flex items-center gap-1">
                    <CheckCircle size={12} />
                    Free cancellation
                  </div>
                  {hotel.roomsLeft && (
                    <div className="text-red-600 font-medium text-xs mt-0.5">
                      Only {hotel.roomsLeft} room left
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Rating and Price Section */}
            <div className="w-full md:w-auto text-right md:ml-3 flex md:flex-col justify-between md:justify-start items-end">
              <div className="mb-0 md:mb-3">
                <div className="text-xs text-gray-600 mb-0.5">{hotel.ratingText}</div>
                <div className="text-xs text-gray-500 mb-1">{hotel.reviews} ratings</div>
                <div className={`inline-flex items-center px-2 py-1 ${getRatingColor(hotel.rating)} text-white rounded font-bold text-sm`}>
                  {hotel.rating}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl md:text-2xl font-bold text-gray-900 mb-0.5">{formatCurrency(hotel.price, hotel.currency)}</div>
                <div className="text-xs text-gray-600 mb-2">
                  {getGuestText()}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedHotel(hotel);
                    setCurrentView('details');
                  }}
                  className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm shadow-md"
                >
                  Book
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  };

  // Search Results matching image 1
  const SearchResults = () => {
    const activeMapHotel = mapSelectedHotel;

    return (
    <div className="bg-gray-50 min-h-screen">
      {/* Banner - Only visible on initial load */}
      <Banner />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button onClick={() => setCurrentView('search')} className="hover:text-blue-600">Home</button>
          <span>›</span>
          <span className="text-gray-800 font-semibold">Search results</span>
        </div>

        {/* Search Bar */}
        <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
            {/* Destination Input */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Destination</label>
              <DestinationSearchInput
                inputRef={searchInputRef}
                value={destinationInput}
                onChange={handleDestinationInputChange}
                onFocus={handleDestinationInputFocus}
                onBlur={handleSuggestionsBlur}
                suggestions={suggestions}
                showSuggestions={showSuggestions}
                onSuggestionSelect={handleSelectSuggestion}
                loading={locationLoading}
                className="text-sm md:text-base py-2.5 md:py-3"
              />
            </div>

            {/* Check-in Date */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Check in</label>
              <div className="relative">
                <input 
                  type="date"
                  value={searchParams.checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSearchParams({...searchParams, checkIn: e.target.value})}
                  className="w-full pl-3 pr-3 md:pl-4 md:pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                />
              </div>
            </div>

            {/* Check-out Date */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Check out</label>
              <div className="relative">
                <input
                  type="date"
                  value={searchParams.checkOut}
                  min={searchParams.checkIn ? new Date(new Date(searchParams.checkIn).setDate(new Date(searchParams.checkIn).getDate() + 1)).toISOString().split('T')[0] : new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}
                  onChange={(e) => setSearchParams({...searchParams, checkOut: e.target.value})}
                  className="w-full pl-3 pr-3 md:pl-4 md:pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                />
              </div>
            </div>

            {/* Guests Selector */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Guests</label>
              <div className="relative">
                <Users className="absolute left-2 md:left-3 top-2.5 md:top-3.5 text-gray-400 pointer-events-none" size={18} />
                <button
                  type="button"
                  onClick={() => setShowGuestSelector(true)}
                  className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-left text-sm md:text-base hover:border-blue-400 transition-colors"
                >
                  {getGuestText()}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="w-full md:w-auto px-8 md:px-10 py-2.5 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm md:text-base"
          >
            Search
          </button>
        </div>

        <div className="mb-6 space-y-4">
          <FilterBar />
          {showMoreFilters && (
            <div className="bg-white rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
              <div>
                <p className="font-semibold mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {['Pool', 'Spa', 'WiFi', 'Parking', 'Gym'].map(item => (
                    <button
                      key={item}
                      type="button"
                      className="px-3 py-1 border border-gray-300 rounded-full hover:bg-blue-50"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-semibold mb-2">Distance to city</p>
                <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>Any distance</option>
                  <option>&lt; 5 km</option>
                  <option>&lt; 10 km</option>
                  <option>&lt; 20 km</option>
                </select>
              </div>
              <div>
                <p className="font-semibold mb-2">Payment options</p>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="accent-blue-600" />
                  <span>Pay at hotel</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="accent-blue-600" />
                  <span>No prepayment</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Hotel List */}
          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 space-y-3 sm:space-y-0">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Properties found</h2>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <label className="text-xs md:text-sm text-gray-600 whitespace-nowrap">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 sm:flex-initial px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs md:text-sm"
                >
                  <option value="">Choose an option</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 md:space-y-6">
              {displayedHotels.length > 0 ? (
                <>
                  {showMapViewHotels && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-blue-800 text-sm font-medium">
                        Showing {mapViewHotels.length} {mapViewHotels.length === 1 ? 'property' : 'properties'} in the current map view
                      </p>
                      <button
                        onClick={() => setShowMapViewHotels(false)}
                        className="text-blue-600 text-sm underline mt-1 hover:text-blue-800"
                      >
                        Clear and search again
                      </button>
                    </div>
                  )}
                  {displayedHotels.map(hotel => (
                    <HotelCard key={hotel.id} hotel={hotel} />
                  ))}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-3">No hotels found in this location</p>
                  <p className="text-gray-400 text-sm mb-4">Try searching for a different destination</p>
                  {mapBounds && hotels.some(h => h.coordinates) && (
                    <button
                      onClick={() => setShowMapViewHotels(true)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
                    >
                      Show properties in current map view
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Map */}
              <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-4 lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Map view</h3>
                  <p className="text-xs text-gray-500">Tap price to preview the property</p>
                </div>
              </div>

              {/* Map container - floats with scroll */}
              <div
                id="cadreago-map-section"
                className="relative rounded-2xl overflow-hidden"
                style={{ height: '560px' }}
              >
                {/* Loading overlay */}
                {!mapLoaded && !mapError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-sm text-gray-600 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 pointer-events-none z-10">
                    <span className="font-medium">Loading Google Maps…</span>
                  </div>
                )}

                {/* Error overlay */}
                {mapError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-white/80 backdrop-blur z-10">
                    <p className="font-semibold text-gray-900 mb-1">Map unavailable</p>
                    <p className="text-sm text-gray-600">{mapError}</p>
                  </div>
                )}

                {/* Search this area button - Airbnb style */}
                {mapDirty && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                    <button
                      onClick={() => {
                        setShowMapViewHotels(true);
                        setMapDirty(false);
                      }}
                      className="px-4 py-2 rounded-full bg-white/90 shadow-md text-sm font-semibold text-gray-800 hover:bg-white hover:shadow-lg transition-all"
                    >
                      Search this area
                    </button>
                  </div>
                )}

                <GoogleMap
                  ref={googleMapRef}
                  height="560px"
                  mapId={process.env.REACT_APP_GOOGLE_MAPS_MAP_ID}
                  hotels={displayedHotels}
                  onHotelClick={handleHotelMarkerClick}
                  onHotelHover={handleHotelMarkerHover}
                  hoveredHotelId={hoveredHotelId}
                  selectedHotelId={mapSelectedHotel?.id}
                  zoomToHotelId={zoomToHotelId}
                  onMapReady={handleMapReady}
                  onBoundsChanged={handleBoundsChanged}
                />

                {/* Property card overlay - positioned absolutely so it doesn't affect map height */}
                {activeMapHotel && (
                  <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-2xl p-4 flex flex-col sm:flex-row gap-4 z-30 pointer-events-auto">
                    <button
                      type="button"
                      aria-label="Close map preview"
                      className="absolute top-2 right-2 h-7 w-7 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors z-40 shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMapSelectedHotel(null);
                        setHoveredHotelId(null);
                      }}
                    >
                      <X size={16} />
                    </button>
                    <img
                      src={activeMapHotel.image}
                      alt={activeMapHotel.name}
                      className="w-full sm:w-32 h-32 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-start justify-between mb-1 gap-2">
                        <h4 className="text-lg font-semibold text-gray-900 truncate flex-1">{activeMapHotel.name}</h4>
                        <div className={`px-2 py-1 rounded text-white text-sm flex-shrink-0 ${getRatingColor(activeMapHotel.rating)}`}>
                          {activeMapHotel.rating}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-2 flex items-center">
                        <MapPin size={14} className="mr-1 flex-shrink-0" />
                        <span className="truncate">{activeMapHotel.location}</span>
                      </p>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{activeMapHotel.description}</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xl font-bold text-gray-900 flex-shrink-0">{formatCurrency(activeMapHotel.price, activeMapHotel.currency)}</span>
                        <button
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedHotel(activeMapHotel);
                            setCurrentView('details');
                          }}
                        >
                          View & Book
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  };

  // Hotel Details
  const HotelDetails = () => {
    if (!selectedHotel) return null;
    const nightlyRate = selectedHotel.price;
    const currency = selectedHotel.currency || 'INR';
    const addonOptions = (selectedHotel.addons && selectedHotel.addons.length > 0 ? selectedHotel.addons : availableAddons).map(addon => ({
      ...addon,
      addonPrice: addon.price || 0,
      addonCurrency: addon.currency || currency
    }));
    const policyDetails = selectedHotel.policyDetails || [
      { title: 'Check-in', description: '3:00 PM onwards with express digital check-in' },
      { title: 'Check-out', description: '11:00 AM - late checkout available on request' },
      { title: 'Cancellation', description: selectedHotel.freeCancellation ? 'Free cancellation up to 72 hours before arrival' : 'Cancellation charges may apply' },
      { title: 'Security deposit', description: 'A refundable security deposit of $150 is collected at check-in' },
      { title: 'ID verification', description: 'Government issued ID is required during check-in for all adult guests' }
    ];

    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <button onClick={() => setCurrentView('search')} className="hover:text-blue-600">Home</button>
            <span>›</span>
            <button onClick={() => setCurrentView('search')} className="hover:text-blue-600">Search results</button>
            <span>›</span>
            <span className="text-gray-800 font-semibold">{selectedHotel.name}</span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start mb-4 md:mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{selectedHotel.name}</h1>
              <div className="flex items-center space-x-1 mb-2">
                {[...Array(selectedHotel.stars)].map((_, i) => (
                  <Star key={i} size={16} fill="#000" color="#000" />
                ))}
              </div>
              <p className="text-sm md:text-base text-gray-600">{selectedHotel.address}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const url = `${window.location.origin}${window.location.pathname}?property=${selectedHotel.id}&checkIn=${searchParams.checkIn}&checkOut=${searchParams.checkOut}&guests=${searchParams.adults + searchParams.children}`;
                  setShareUrl(url);
                  setShowShareModal(true);
                }}
                className="p-2 md:p-3 rounded-full hover:bg-gray-100 transition-colors"
                title="Share property"
              >
                <Share2 size={24} color="#6b7280" />
              </button>
              <button
                onClick={() => toggleFavorite(selectedHotel.id)}
                className="p-2 md:p-3 rounded-full hover:bg-gray-100 transition-colors"
                title="Add to favorites"
              >
                <Heart
                  size={24}
                  fill={favorites.includes(selectedHotel.id) ? '#ef4444' : 'none'}
                  color={favorites.includes(selectedHotel.id) ? '#ef4444' : '#6b7280'}
                />
              </button>
            </div>
          </div>

          {/* Image Gallery */}
          {selectedHotel.images && selectedHotel.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
              {selectedHotel.images.map((img, idx) => (
                <div
                  key={idx}
                  className={`${idx === 0 ? 'col-span-2 row-span-2' : ''} cursor-pointer overflow-hidden rounded-lg group`}
                  onClick={() => {
                    setCurrentImageIndex(idx);
                    setShowImageGallery(true);
                  }}
                >
                  <img
                    src={img}
                    alt={`${selectedHotel.name} ${idx + 1}`}
                    className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 bg-white rounded-lg p-4 md:p-6 lg:p-8 space-y-10">
              <section>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Description</h2>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-4 md:mb-6">
                  {selectedHotel.description}
                </p>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  Discover curated experiences and thoughtful touches designed to make every stay memorable. Enjoy premium linens, 24/7 concierge support, and seamless digital check-in for stress-free arrivals.
                </p>
              </section>

              {selectedHotel.services && Object.keys(selectedHotel.services).length > 0 && (
                <section>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Services</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {Object.entries(selectedHotel.services).map(([key, value]) =>
                      value && (
                        <div key={key} className="flex items-center space-x-2 md:space-x-3">
                          <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                          <span className="text-sm md:text-base text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                      )
                    )}
                  </div>
                </section>
              )}

              <section>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Add-ons & Services</h2>
                  <span className="text-sm text-blue-600">Customize your stay with host curated extras</span>
                </div>
                <div className="space-y-4">
                  {addonOptions.map(addon => (
                    <div key={addon.id} className="border rounded-xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xl">
                          {renderAddonIcon(addon.icon)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{addon.name}</h3>
                          <p className="text-sm text-gray-600">{addon.description}</p>
                        </div>
                      </div>
                      <div className="text-right sm:text-right w-full sm:w-auto">
                        {addon.addonPrice > 0 ? (
                          <>
                            <p className="text-xl font-bold text-gray-900">{formatCurrency(addon.addonPrice, addon.addonCurrency)}</p>
                            <p className="text-xs text-gray-500">
                              {addon.perPerson ? 'per guest' : 'per stay'}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">Included</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Comments and ratings</h2>
                  <div className={`px-3 md:px-4 py-1.5 md:py-2 ${getRatingColor(selectedHotel.rating)} text-white rounded-lg font-bold text-lg md:text-xl`}>
                    {selectedHotel.rating}
                  </div>
                </div>

                <div className="mb-4 md:mb-6">
                  <div className="text-base md:text-lg font-semibold mb-2">{selectedHotel.ratingText}</div>
                  <div className="text-xs md:text-sm text-gray-600">{selectedHotel.reviews || 0} ratings</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                  {selectedHotel.reviewScores && Object.entries(selectedHotel.reviewScores).map(([key, score]) => (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs md:text-sm text-gray-700 capitalize font-medium">{key}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 md:h-2.5">
                        <div
                          className="bg-blue-600 h-2 md:h-2.5 rounded-full transition-all"
                          style={{ width: getRatingBarWidth(score) }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {selectedHotel.userReviews && selectedHotel.userReviews.length > 0 && (
                  <div className="space-y-4 md:space-y-6">
                    {selectedHotel.userReviews.map(review => (
                      <div key={review.id} className="border-b pb-4 md:pb-6">
                        <div className="flex items-start space-x-3 md:space-x-4 mb-3 md:mb-4">
                          <img 
                            src={review.avatar} 
                            alt={review.name}
                            className="w-10 h-10 md:w-14 md:h-14 rounded-full flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <h4 className="font-semibold text-gray-900 text-sm md:text-lg truncate">{review.name}</h4>
                              <div className={`px-2 md:px-3 py-1 ${getRatingColor(review.rating)} text-white rounded-lg font-bold text-sm shrink-0`}>
                                {review.rating}
                              </div>
                            </div>
                            <div className="text-xs md:text-sm text-gray-500">{review.date}</div>
                          </div>
                        </div>

                        <div className="space-y-2 md:space-y-3 ml-0 sm:ml-14 md:ml-18">
                          <div className="flex items-start space-x-2 md:space-x-3">
                            <ThumbsUp size={16} className="text-green-600 mt-0.5 md:mt-1 flex-shrink-0" />
                            <p className="text-xs md:text-sm text-gray-700">{review.positive}</p>
                          </div>
                          <div className="flex items-start space-x-2 md:space-x-3">
                            <ThumbsDown size={16} className="text-red-600 mt-0.5 md:mt-1 flex-shrink-0" />
                            <p className="text-xs md:text-sm text-gray-700">{review.negative}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Property policy</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {policyDetails.map((policy, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">{policy.title}</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{policy.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 order-first lg:order-last">
              <div className="space-y-4 lg:sticky lg:top-24">
                {/* Price Card */}
                <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                  <div className="border-t pt-4 md:pt-6">
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                      {formatCurrency(nightlyRate, currency)}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600 mb-4">per night (approx.)</div>
                  </div>

                  <button
                    onClick={() => {
                      setShowPaymentForm(false);
                      setCurrentView('booking');
                    }}
                    className="w-full px-4 md:px-6 py-3 md:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-base md:text-lg shadow-md"
                  >
                    Book Now
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">Secure checkout • Taxes calculated at payment</p>
                  </div>

                {/* Host Card */}
                {selectedHotel.host && (
                  <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Hosted by</h3>
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {selectedHotel.host.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-gray-900">{selectedHotel.host.name}</h4>
                          {selectedHotel.host.verified && (
                            <CheckCircle size={16} className="text-blue-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">Member since {selectedHotel.host.memberSince}</p>
                        <p className="text-sm text-gray-600">{selectedHotel.host.properties} {selectedHotel.host.properties === 1 ? 'property' : 'properties'}</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{selectedHotel.host.bio || 'Trusted superhost on Cadreago'}</p>

                    <div className="space-y-3">
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-900">
                        <p className="font-semibold mb-1">Contact host</p>
                        <p>
                          {isLoggedIn
                            ? 'Have a question before booking? Send a quick message and we will connect you with the host.'
                            : 'Login to ask questions or send a message to the host before booking.'}
                        </p>
                      </div>
                      {isLoggedIn ? (
                        <button
                          type="button"
                          onClick={() => setShowMessageHostModal(true)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                          Message Host
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setPreferredUserType('guest');
                            setAuthMode('login');
                            setShowAuthModal(true);
                          }}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                          Login to Contact Host
                        </button>
                      )}
                    </div>
                  </div>
                )}
                </div>
              </div>
            </div>
        </div>
      </div>
    );
  };

  // Booking View
  const BookingView = () => {
    if (!selectedHotel) return null;
    const nightlyRate = selectedHotel.price;
    const currency = selectedHotel.currency || 'INR';
    const addonsTotal = calculateAddonsTotal();
    const subtotal = nightlyRate + addonsTotal;
    const gstAmount = Math.round(subtotal * GST_RATE);
    const bookingTotal = subtotal + gstAmount;
    const selectedAddonDetails = availableAddons.filter(addon => selectedAddons.includes(addon.id));
    const handleBookingSubmit = (e) => {
      e.preventDefault();
      setShowPaymentForm(true);
      setTimeout(() => {
        const section = document.getElementById('payment-section');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    };
    const handlePaymentSubmit = (e) => {
      e.preventDefault();
      alert('Redirecting to the secure payment gateway to complete your booking.');
    };

    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedHotel.name}</h3>
                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(selectedHotel.stars)].map((_, i) => (
                    <Star key={i} size={16} fill="#000" color="#000" />
                  ))}
                </div>
                <div className="text-gray-600 text-sm mb-4">{selectedHotel.location}</div>
                
                <div className="flex flex-wrap gap-2">
                  {selectedHotel.amenities.map((amenity, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="font-bold text-gray-900 mb-4">Reserve data</h4>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Check-in:</div>
                    <div className="text-gray-900">{formatDate(searchParams.checkIn)}</div>
                    <div className="text-sm text-gray-500">12:00 PM</div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Check-out:</div>
                    <div className="text-gray-900">{formatDate(searchParams.checkOut)}</div>
                    <div className="text-sm text-gray-500">11:00 AM</div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Guests:</div>
                    <div className="text-gray-900">{getGuestText()}</div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Room:</div>
                    <div className="text-gray-900">Premium room with views</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Fill in your details</h2>

                <form className="space-y-6" onSubmit={handleBookingSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input 
                        type="text"
                        placeholder="Name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last name</label>
                      <input 
                        type="text"
                        placeholder="Last name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input 
                      type="email"
                      placeholder="Email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Indicate who the reservation is for</h3>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="radio" name="reservationFor" className="accent-blue-600" defaultChecked />
                          <span className="text-gray-700">The reservation is for me</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="radio" name="reservationFor" className="accent-blue-600" />
                          <span className="text-gray-700">The reservation is for another person</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Work or pleasure</h3>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="radio" name="tripType" className="accent-blue-600" />
                          <span className="text-gray-700">I travel for work</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="radio" name="tripType" className="accent-blue-600" defaultChecked />
                          <span className="text-gray-700">I travel for leisure</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Check in time</h3>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>Check in time</option>
                      <option>12:00 AM - 1:00 PM</option>
                      <option>1:00 PM - 3:00 PM</option>
                      <option>3:00 PM - 6:00 PM</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Enhance your stay</h3>
                      <span className="text-sm text-gray-500">
                        {selectedAddonDetails.length} selected
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableAddons.map(addon => {
                        const isSelected = selectedAddons.includes(addon.id);
                        const multiplier = addon.perPerson ? Math.max(searchParams.adults, 1) : 1;
                        const addonUnitPrice = addon.price;
                        return (
                          <label
                            key={addon.id}
                            className={`flex items-start space-x-3 cursor-pointer p-4 border rounded-lg transition-colors ${
                              isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="mt-1 accent-blue-600"
                              checked={isSelected}
                              onChange={() => toggleAddon(addon.id)}
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                    {renderAddonIcon(addon.icon, 18)}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900 text-base">{addon.name}</div>
                                    <p className="text-sm text-gray-600">{addon.description}</p>
                                  </div>
                                </div>
                                <div className="text-blue-600 font-semibold text-right">
                                  {formatCurrency(addonUnitPrice, currency)}
                                  {addon.perPerson ? <span className="text-xs text-gray-500"> / guest</span> : ''}
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {addon.perPerson ? `Charged per adult (${multiplier})` : 'Charged once per stay'}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {selectedAddonDetails.length > 0 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Selected add-ons</h4>
                      <div className="space-y-2">
                        {selectedAddonDetails.map(addon => {
                          const multiplier = addon.perPerson ? Math.max(searchParams.adults, 1) : 1;
                          const addonUnitPrice = addon.price;
                          const addonPrice = addonUnitPrice * multiplier;
                          return (
                            <div key={addon.id} className="flex items-center justify-between text-sm text-blue-900">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center">
                                  {renderAddonIcon(addon.icon, 16)}
                                </div>
                                <span>{addon.name}{addon.perPerson ? ` x${multiplier}` : ''}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">+{formatCurrency(addonPrice, currency)}</span>
                                <button
                                  type="button"
                                  onClick={() => toggleAddon(addon.id)}
                                  className="text-xs text-blue-700 hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Room rate</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(nightlyRate, currency)}</span>
                    </div>
                    {addonsTotal > 0 && (
                      <div className="flex justify-between text-sm text-blue-700">
                        <span>Add-ons</span>
                        <span className="font-semibold">+{formatCurrency(addonsTotal, currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(subtotal, currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>GST ({(GST_RATE * 100).toFixed(0)}%)</span>
                      <span className="font-semibold text-gray-900">+{formatCurrency(gstAmount, currency)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div>
                        <span className="text-xl font-semibold">Total:</span>
                        <p className="text-sm text-gray-500">
                          Includes taxes and {selectedAddonDetails.length > 0 ? 'selected add-ons' : 'standard inclusions'}
                        </p>
                      </div>
                      <span className="text-4xl font-bold text-blue-600">{formatCurrency(bookingTotal, currency)}</span>
                    </div>

                    <button 
                      type="submit"
                      className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
                    >
                      Complete Booking
                    </button>
                  </div>
                </form>

                {showPaymentForm && (
                  <div id="payment-section" className="mt-10 border-t pt-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Payment Details</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Your total payable amount is <span className="font-semibold text-gray-900">{formatCurrency(bookingTotal, currency)}</span>.
                      Enter your payment details to confirm and navigate to the payment gateway.
                    </p>
                    <form className="space-y-5" onSubmit={handlePaymentSubmit}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Name on card"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          maxLength={19}
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Month</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            required
                            maxLength={2}
                            placeholder="MM"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Year</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            required
                            maxLength={4}
                            placeholder="YYYY"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                          <input
                            type="password"
                            inputMode="numeric"
                            required
                            maxLength={4}
                            placeholder="123"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-900">
                        <p className="font-semibold mb-1">Secure payment</p>
                        <p>We will redirect you to your bank's secure payment gateway to complete your booking.</p>
                      </div>
                      <button
                        type="submit"
                        className="w-full px-6 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-lg shadow-lg"
                      >
                        Pay &amp; Confirm Booking
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const HostMessageModal = () => {
    if (!showMessageHostModal || !selectedHotel?.host) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Message {selectedHotel.host.name}</h3>
              <p className="text-sm text-gray-600">Ask anything about the stay before you confirm.</p>
            </div>
            <button onClick={() => setShowMessageHostModal(false)} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <textarea
            ref={hostMessageRef}
            className="w-full h-32 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Hi, I would like to know more about..."
          />
         <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                if (hostMessageRef.current) {
                  hostMessageRef.current.value = '';
                }
                setShowMessageHostModal(false);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                const message = hostMessageRef.current?.value?.trim();
                if (!message) {
                  alert('Please enter a message before sending.');
                  if (hostMessageRef.current) hostMessageRef.current.focus();
                  return;
                }
                alert('Message sent to host!');
                hostMessageRef.current.value = '';
                setShowMessageHostModal(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Send Message
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Footer Component
  const Footer = () => (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img src={brandLogoDark} alt="Cadreago" className="h-10 object-contain mb-4" />
            <p className="text-gray-400 text-sm">Premium stays smart booking</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
              <li><a href="#" className="hover:text-white">Press</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Help Center</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Partners</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setPreferredUserType('host');
                    setAuthMode('signup');
                    setShowAuthModal(true);
                  }}
                  className="hover:text-white"
                >
                  I am a Host
                </button>
              </li>
              <li><a href="#" className="hover:text-white">Affiliate Program</a></li>
              <li><a href="#" className="hover:text-white">Partner Portal</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 Cadreago. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );

  // Dashboard Component
  const Dashboard = () => {
    if (!isLoggedIn) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Please login to access your dashboard</h2>
          <button 
            onClick={() => {
              setAuthMode('login');
              setShowAuthModal(true);
            }}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Login Now
          </button>
        </div>
      );
    }

    const completedPayments = paymentHistory.filter(payment => payment.status === 'completed' && payment.amount > 0);
    const pendingPayments = paymentHistory.filter(payment => payment.status === 'pending' && payment.amount > 0);
    const refundedPayments = paymentHistory.filter(payment => payment.status === 'refunded');
    const totalSpent = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const pendingAmount = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const refundsTotal = refundedPayments.reduce((sum, payment) => sum + Math.abs(payment.amount), 0);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Dashboard</h1>

          {/* Dashboard Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6 overflow-x-auto">
            <div className="flex border-b min-w-max">
              {[
                { id: 'bookings', label: 'My Bookings', icon: '📋', count: userBookings.filter(b => b.status !== 'completed').length },
                { id: 'messages', label: 'Messages', icon: '💬', count: userMessages.filter(m => !m.read).length },
                { id: 'payments', label: 'Payment History', icon: '💳' },
                { id: 'profile', label: 'Profile', icon: '👤' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDashboardTab(tab.id)}
                  className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap relative ${
                    dashboardTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Bookings Tab */}
            {dashboardTab === 'bookings' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h2>
                <div className="space-y-4">
                  {userBookings.map(booking => (
                    <div key={booking.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row gap-4">
                        <img 
                          src={booking.image} 
                          alt={booking.hotelName}
                          className="w-full md:w-48 h-32 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{booking.hotelName}</h3>
                              <p className="text-sm text-gray-600">{booking.location}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                            <div>
                              <p className="text-gray-500">Check-in</p>
                              <p className="font-semibold">{formatDate(booking.checkIn)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Check-out</p>
                              <p className="font-semibold">{formatDate(booking.checkOut)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Guests</p>
                              <p className="font-semibold">{booking.guests}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Total</p>
                              <p className="font-semibold text-blue-600">${booking.totalPrice}</p>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
                              View Details
                            </button>
                            {booking.status === 'confirmed' && (
                              <button className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-semibold">
                                Cancel Booking
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {dashboardTab === 'messages' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Messages</h2>
                <div className="space-y-4">
                  {userMessages.map(message => (
                    <div key={message.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${!message.read ? 'bg-blue-50 border-blue-200' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-gray-900">{message.hotelName}</h3>
                          {!message.read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(message.date)}</span>
                      </div>
                      <p className="font-semibold text-gray-800 mb-2">{message.subject}</p>
                      <p className="text-gray-600">{message.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment History & Invoices Tab */}
            {dashboardTab === 'payments' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment History & Invoices</h2>

                {paymentHistory.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <p className="text-xs font-semibold uppercase text-gray-500 tracking-wide">Spent This Year</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">${totalSpent.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{completedPayments.length} completed payments</p>
                      </div>
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <p className="text-xs font-semibold uppercase text-gray-500 tracking-wide">Upcoming Charges</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">${pendingAmount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">
                          {pendingPayments.length > 0 ? `${pendingPayments.length} pending` : 'No pending payments'}
                        </p>
                      </div>
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <p className="text-xs font-semibold uppercase text-gray-500 tracking-wide">Refunded</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">-${refundsTotal.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">
                          {refundedPayments.length > 0 ? `${refundedPayments.length} refunds issued` : 'No refunds'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                      <p className="text-sm text-gray-600">
                        Track every transaction, view the payment method used, and download invoices for reimbursement.
                      </p>
                      <button
                        type="button"
                        onClick={() => alert('A consolidated invoice download is coming soon!')}
                        className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-semibold hover:bg-blue-100 transition-colors"
                      >
                        <Download size={16} />
                        <span>Download all invoices</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {paymentHistory.map(payment => (
                        <div key={payment.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-start space-x-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  payment.status === 'completed' ? 'bg-green-100' :
                                  payment.status === 'refunded' ? 'bg-orange-100' :
                                  'bg-gray-100'
                                }`}>
                                  {payment.status === 'completed' ? (
                                    <CheckCircle size={24} className="text-green-600" />
                                  ) : payment.status === 'refunded' ? (
                                    <CreditCard size={24} className="text-orange-600" />
                                  ) : (
                                    <FileText size={24} className="text-gray-600" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-bold text-gray-900 mb-1">{payment.description}</h3>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                                    <span>{formatDate(payment.date)}</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span>{payment.method}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
                              <div className="text-right">
                                <div className={`text-2xl font-bold ${
                                  payment.amount >= 0 ? 'text-gray-900' : 'text-green-600'
                                }`}>
                                  {payment.amount >= 0 ? '$' : '+$'}{Math.abs(payment.amount)}
                                </div>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                  payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  payment.status === 'refunded' ? 'bg-orange-100 text-orange-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                </span>
                              </div>

                              <a
                                href={payment.invoiceUrl}
                                className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700"
                              >
                                <Download size={16} />
                                <span>Invoice</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No payment history</h3>
                    <p className="text-gray-600">Your payment transactions will appear here</p>
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {dashboardTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {user?.avatar}
                    </div>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
                      Change Photo
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={user?.name || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option>United States</option>
                        <option>United Kingdom</option>
                        <option>Canada</option>
                        <option>Australia</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex space-x-4">
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                      Save Changes
                    </button>
                    <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const HostOnboarding = () => {
    const [personalInfo, setPersonalInfo] = React.useState({
      firstName: user?.name?.split(' ')[0] || '',
      lastName: user?.name?.split(' ')[1] || '',
      phone: '',
      address: ''
    });

    // Local copies of verification fields to avoid resetting the form
    // whenever parent state (aadhaar/gst/bank) changes.
    const [aadhaarLocal, setAadhaarLocal] = React.useState(aadhaar);
    const [gstRegisteredLocal, setGstRegisteredLocal] = React.useState(gstRegistered);
    const [gstLocal, setGstLocal] = React.useState(gst);
    const [bankLocal, setBankLocal] = React.useState(bank);

    // Placeholder – verification will be performed later via a separate flow.
    const handleVerification = () => {
      alert('We will verify these details after you save them. For now, please fill in all required information and complete onboarding.');
    };

    const handleCompleteOnboarding = async () => {
      if (!user?.id) return;

      const fullNameParts = [personalInfo.firstName, personalInfo.lastName].filter(Boolean);
      const fullName = fullNameParts.join(' ').trim();

      try {
        // Persist basic profile details
        const profileUpdates = {};
        if (fullName) profileUpdates.full_name = fullName;
        if (personalInfo.phone) profileUpdates.phone = personalInfo.phone;

        if (Object.keys(profileUpdates).length > 0) {
          await updateProfile(user.id, profileUpdates);
        }

        const isHostVerified = false; // Initial onboarding only collects data; verification happens later

        const hostInfoPayload = {
          aadhaar_number: aadhaarLocal.number || null,
          aadhaar_status: 'pending',
          gst_registered: gstRegisteredLocal,
          gst_number: gstRegisteredLocal ? (gstLocal.number || null) : null,
          gst_status: gstRegisteredLocal ? 'pending' : 'pending',
          bank_account_number: bankLocal.account || null,
          bank_ifsc: bankLocal.ifsc || null,
          bank_status: 'pending',
          onboarding_completed: true,
          verified: isHostVerified
        };

        const { error } = await updateHostInfo(user.id, hostInfoPayload);
        if (error) {
          showNotification('error', 'We could not save your host details. Please try again.');
          return;
        }

        // Sync local state back to global so other parts of the app
        // see the latest values (still marked as pending).
        setAadhaar({ ...aadhaarLocal, status: 'pending' });
        setGstRegistered(gstRegisteredLocal);
        setGst({ ...gstLocal, status: 'pending' });
        setBank({ ...bankLocal, status: 'pending' });

        setHostOnboardingCompleted(true);
        setCurrentView('host-dashboard');
        showNotification('success', 'Your host account has been created. We will verify your details soon.');
      } catch (err) {
        console.error('Error completing host onboarding:', err);
        showNotification('error', 'We could not complete your host onboarding. Please try again.');
      }
    };

    const canComplete =
      personalInfo.firstName &&
      personalInfo.phone &&
      aadhaarLocal.number &&
      bankLocal.account &&
      bankLocal.ifsc &&
      (!gstRegisteredLocal || gstLocal.number);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Host Onboarding</h1>
            <p className="text-gray-600">Complete the steps below so we can verify your identity and enable payouts.</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Personal Details</h2>
              <span className="text-xs text-gray-500 uppercase">Step 1</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={personalInfo.firstName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={personalInfo.lastName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 90000 00000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={personalInfo.address}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="City, State"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Aadhaar KYC</h2>
              {statusBadge('pending')}
            </div>
            <p className="text-sm text-gray-600">We’ll use Cashfree KYC APIs to verify your identity securely.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={aadhaarLocal.number}
                onChange={(e) => setAadhaarLocal({ ...aadhaarLocal, number: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Aadhaar Number"
              />
              <button
                type="button"
                onClick={handleVerification}
                className="px-4 py-3 bg-gray-200 text-gray-600 rounded-lg cursor-not-allowed font-semibold"
                disabled
              >
                Verification will be done later
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">GST Details</h2>
              {gstRegisteredLocal ? statusBadge('pending') : <span className="text-sm text-gray-500">Optional</span>}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={gstRegisteredLocal}
                onChange={(e) => {
                  setGstRegisteredLocal(e.target.checked);
                  if (!e.target.checked) {
                    setGstLocal({ number: '', status: 'pending' });
                  }
                }}
                className="accent-blue-600"
              />
              <span>My business is registered under GST</span>
            </div>
            {gstRegisteredLocal && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={gstLocal.number}
                  onChange={(e) => setGstLocal({ ...gstLocal, number: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="GSTIN"
                />
                <button
                  type="button"
                  onClick={handleVerification}
                  className="px-4 py-3 bg-gray-200 text-gray-600 rounded-lg cursor-not-allowed font-semibold"
                  disabled
                >
                  Verification will be done later
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Bank Account</h2>
              {statusBadge('pending')}
            </div>
            <p className="text-sm text-gray-600">
              Provide an INR bank account for payouts. We’ll verify account holder name using Cashfree Payout APIs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={bankLocal.account}
                  onChange={(e) => setBankLocal({ ...bankLocal, account: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="XXXXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={bankLocal.ifsc}
                  onChange={(e) => setBankLocal({ ...bankLocal, ifsc: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                  placeholder="SBIN0000000"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleVerification}
              className="px-4 py-3 bg-gray-200 text-gray-600 rounded-lg cursor-not-allowed font-semibold"
              disabled
            >
              Verification will be done later
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-sm text-gray-600">
            Cashfree will notify you once verifications are complete. You can edit these details anytime from your host dashboard.
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={!canComplete}
              onClick={handleCompleteOnboarding}
              className={`px-6 py-3 rounded-lg font-semibold ${
                canComplete ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {canComplete ? 'Complete & Go to Dashboard' : 'Complete pending verifications'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const HostDashboard = () => {
    if (!isLoggedIn || userType !== 'host' || !hostOnboardingCompleted) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Please complete host onboarding</h2>
          <button 
            onClick={() => {
              if (!isLoggedIn) {
                setPreferredUserType('host');
                setAuthMode('login');
                setShowAuthModal(true);
              } else {
                setCurrentView('host-onboarding');
              }
            }}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            {isLoggedIn ? 'Resume Onboarding' : 'Login as Host'}
          </button>
        </div>
      );
    }

    const totalProperties = hostProperties.length;
    const totalRevenue = hostProperties.reduce((sum, p) => sum + p.monthlyRevenue, 0);
    const totalBookings = hostProperties.reduce((sum, p) => sum + p.totalBookings, 0);
    const avgOccupancy =
      totalProperties > 0
        ? Math.round(hostProperties.reduce((sum, p) => sum + p.occupancyRate, 0) / totalProperties)
        : 0;
    const hostIsVerified = aadhaar.status === 'verified' && bank.status === 'verified';
    const revenueLastMonth = Math.round(totalRevenue * 0.88);
    const revenueYtd = Math.round(totalRevenue * 3.2);

    const HostProfileKycForm = () => {
      const [formState, setFormState] = React.useState({
        fullName: user?.name || '',
        phone: '',
        address: '',
        aadhaarNumber: aadhaar.number || '',
        gstRegistered: gstRegistered,
        gstNumber: gst.number || '',
        bankAccount: bank.account || '',
        bankIfsc: bank.ifsc || ''
      });

      const handleChange = (field, value) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
      };

      const handleSave = async (e) => {
        e.preventDefault();
        if (!user?.id) return;

        const profileUpdates = {};
        if (formState.fullName) profileUpdates.full_name = formState.fullName;
        if (formState.phone) profileUpdates.phone = formState.phone;

        try {
          if (Object.keys(profileUpdates).length > 0) {
            await updateProfile(user.id, profileUpdates);
          }

          const hostInfoPayload = {
            aadhaar_number: formState.aadhaarNumber || null,
            gst_registered: formState.gstRegistered,
            gst_number: formState.gstRegistered ? (formState.gstNumber || null) : null,
            bank_account_number: formState.bankAccount || null,
            bank_ifsc: formState.bankIfsc || null
          };

          const { error } = await updateHostInfo(user.id, hostInfoPayload);
          if (error) {
            showNotification('error', 'We could not save your host profile details. Please try again.');
            return;
          }

          // Sync global state so the rest of the app sees updated values
          setAadhaar((prev) => ({ ...prev, number: formState.aadhaarNumber || '' }));
          setGstRegistered(formState.gstRegistered);
          setGst((prev) => ({ ...prev, number: formState.gstNumber || '' }));
          setBank((prev) => ({ ...prev, account: formState.bankAccount || '', ifsc: formState.bankIfsc || '' }));

          showNotification('success', 'Host profile and KYC details saved.');
        } catch (err) {
          console.error('Error saving host profile/KYC:', err);
          showNotification('error', 'We could not save your host profile details. Please try again.');
        }
      };

      return (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Personal Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formState.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formState.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 90000 00000"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formState.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="City, State"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Aadhaar KYC</h3>
              {statusBadge(aadhaar.status || 'pending')}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={formState.aadhaarNumber}
                onChange={(e) => handleChange('aadhaarNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Aadhaar Number"
              />
              <button
                type="button"
                onClick={() => showNotification('info', 'Aadhaar verification will be enabled in a later step.')}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold"
              >
                Manage Verification (coming soon)
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">GST Details</h3>
              {gstRegistered ? statusBadge(gst.status || 'pending') : <span className="text-sm text-gray-500">Optional</span>}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={formState.gstRegistered}
                onChange={(e) => handleChange('gstRegistered', e.target.checked)}
                className="accent-blue-600"
              />
              <span>My business is registered under GST</span>
            </div>
            {formState.gstRegistered && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={formState.gstNumber}
                  onChange={(e) => handleChange('gstNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="GSTIN"
                />
                <button
                  type="button"
                  onClick={() => showNotification('info', 'GST verification will be enabled in a later step.')}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold"
                >
                  Manage Verification (coming soon)
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Bank Account</h3>
              {statusBadge(bank.status || 'pending')}
            </div>
            <p className="text-sm text-gray-600">
              Provide an INR bank account for payouts. We’ll verify account holder name using Cashfree Payout APIs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={formState.bankAccount}
                  onChange={(e) => handleChange('bankAccount', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="XXXXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={formState.bankIfsc}
                  onChange={(e) => handleChange('bankIfsc', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                  placeholder="SBIN0000000"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => showNotification('info', 'Bank verification will be enabled in a later step.')}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold"
            >
              Manage Verification (coming soon)
            </button>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Save Profile & KYC
            </button>
          </div>
        </form>
      );
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Host Dashboard</h1>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setShowAddPropertyModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center space-x-2"
              >
                <span>+ Add Property</span>
              </button>
            </div>
          </div>

          {!hostIsVerified && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-start space-x-3">
              <div className="mt-0.5">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-100 text-xs font-bold">
                  !
                </span>
              </div>
              <div className="text-sm">
                <p className="font-semibold">Verification required before listing properties</p>
                <p className="mt-1">
                  Your Aadhaar KYC and bank account details are saved but not verified yet. 
                  We’ll verify these details and then enable property listings and payouts.
                </p>
              </div>
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Properties</p>
                  <p className="text-3xl font-bold text-gray-900">{totalProperties}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏨</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">{totalBookings}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Occupancy</p>
                  <p className="text-3xl font-bold text-gray-900">{avgOccupancy}%</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6 overflow-x-auto">
            <div className="flex border-b min-w-max">
              {[
                { id: 'properties', label: 'My Properties', icon: '🏨' },
                { id: 'bookings', label: 'Guest Bookings', icon: '📋', count: propertyBookings.filter(b => b.status === 'pending').length },
                { id: 'revenue', label: 'Revenue', icon: '💰' },
                { id: 'refunds', label: 'Refunds', icon: '↩️', count: hostRefunds.filter(r => r.status === 'pending').length },
                { id: 'payouts', label: 'Payouts', icon: '💳' },
                { id: 'reviews', label: 'Reviews', icon: '⭐' },
                { id: 'profile', label: 'Profile & KYC', icon: '🛡️' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setHostDashboardTab(tab.id)}
                  className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap relative ${
                    hostDashboardTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Properties Tab */}
            {hostDashboardTab === 'properties' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Properties</h2>
                <div className="space-y-4">
                  {hostProperties.map(property => (
                    <div key={property.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row gap-4">
                        <img 
                          src={property.image} 
                          alt={property.name}
                          className="w-full md:w-64 h-48 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{property.name}</h3>
                              <p className="text-sm text-gray-600 flex items-center mt-1">
                                <MapPin size={16} className="mr-1" />
                                {property.location}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <div className="flex">
                                  {[...Array(property.stars)].map((_, i) => (
                                    <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600">• {property.type}</span>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              property.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : property.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-3 mb-4">
                            {property.amenities.map((amenity, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                                {amenity}
                              </span>
                            ))}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4">
                            <div>
                              <p className="text-gray-500">Rooms</p>
                              <p className="font-semibold">{property.rooms}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Rating</p>
                              <p className="font-semibold">{property.rating} ({property.reviews})</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Base Price</p>
                              <p className="font-semibold text-green-600">{formatCurrency(property.basePrice)}/night</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Occupancy</p>
                              <p className="font-semibold">{property.occupancyRate}%</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Revenue</p>
                              <p className="font-semibold text-green-600">{formatCurrency(property.monthlyRevenue)}/mo</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
                              Edit Property
                            </button>
                            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold">
                              View Property
                            </button>
                            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold">
                              Manage Gallery
                            </button>
                            <button
                              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold"
                              onClick={() => {
                                setAddonForm({
                                  propertyId: property.id,
                                  name: '',
                                  description: '',
                                  price: '',
                                  icon: DEFAULT_ADDON_ICON
                                });
                                setShowAddAddonModal(true);
                              }}
                            >
                              Add Add-on
                            </button>
                            <button
                              disabled={!hostIsVerified}
                              title={
                                hostIsVerified
                                  ? `${property.status === 'active' ? 'Deactivate' : 'Activate'} listing`
                                  : 'Complete KYC and bank verification to activate this listing.'
                              }
                              onClick={() => {
                                if (hostIsVerified) {
                                  togglePropertyStatus(property.id);
                                }
                              }}
                              className={`px-4 py-2 border rounded-lg transition-colors text-sm font-semibold ${
                                !hostIsVerified
                                  ? 'border-gray-200 text-gray-400 opacity-60 cursor-not-allowed hover:bg-transparent'
                                  : property.status === 'active'
                                  ? 'border-red-200 text-red-600 hover:bg-red-50'
                                  : 'border-green-200 text-green-600 hover:bg-green-50'
                              }`}
                            >
                              {property.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guest Bookings Tab */}
            {hostDashboardTab === 'bookings' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Guest Bookings</h2>
                <div className="space-y-4">
                  {propertyBookings.map(booking => (
                    <div key={booking.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{booking.propertyName}</h3>
                          <p className="text-sm text-gray-600">Ref: {booking.bookingRef}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Guest Information</p>
                          <p className="font-semibold">{booking.guestName}</p>
                          <p className="text-sm text-gray-600">{booking.guestEmail}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Room Type</p>
                          <p className="font-semibold">{booking.roomType}</p>
                          <p className="text-sm text-gray-600">{booking.guests}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Check-in</p>
                          <p className="font-semibold">{formatDate(booking.checkIn)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Check-out</p>
                          <p className="font-semibold">{formatDate(booking.checkOut)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Booking Date</p>
                          <p className="font-semibold">{formatDate(booking.bookingDate)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Revenue</p>
                          <p className="font-semibold text-green-600">${booking.totalPrice}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        {booking.status === 'pending' && (
                          <>
                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold">
                              Confirm Booking
                            </button>
                            <button className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-semibold">
                              Decline
                            </button>
                          </>
                        )}
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold">
                          Contact Guest
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revenue Tab */}
            {hostDashboardTab === 'revenue' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Revenue Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="border rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">This Month</p>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                    <p className="text-sm text-green-600 mt-2">↑ 12% from last month</p>
                  </div>
                  <div className="border rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">Last Month</p>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(revenueLastMonth)}</p>
                  </div>
                  <div className="border rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">Year to Date</p>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(revenueYtd)}</p>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4">Revenue by Property</h3>
                <div className="space-y-4">
                  {hostProperties.map(property => {
                    const revenueShare = totalRevenue > 0 ? property.monthlyRevenue / totalRevenue : 0;
                    const revenueSharePercent = Math.round(revenueShare * 100);
                    return (
                      <div key={property.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-gray-900">{property.name}</h4>
                          <span className="text-lg font-bold text-green-600">{formatCurrency(property.monthlyRevenue)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${revenueShare * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {revenueSharePercent}% of total revenue
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Refunds Tab */}
            {hostDashboardTab === 'refunds' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Refund Requests</h2>
                <div className="space-y-4">
                  {hostRefunds.map(refund => (
                    <div key={refund.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">Booking {refund.bookingRef}</h3>
                        <p className="text-sm text-gray-600">{refund.guestName}</p>
                        <p className="text-xs text-gray-500">{formatDate(refund.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(refund.amount, refund.currency || 'INR')}</p>
                        <p className="text-sm text-gray-500">{refund.method}</p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          refund.status === 'processed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payouts Tab */}
            {hostDashboardTab === 'payouts' && (
              <div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Payouts</h2>
                    <p className="text-sm text-gray-600">Track your payout history and request new transfers.</p>
                  </div>
                  <button
                    onClick={() => setShowPayoutModal(true)}
                    className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Request Payout
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-500">Total Paid Out</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(hostPayouts.reduce((sum, p) => sum + p.amount, 0), 'INR')}
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-500">Pending Payouts</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {formatCurrency(hostPayouts.filter(p => p.status !== 'completed').reduce((sum, p) => sum + p.amount, 0), 'INR')}
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-500">Last Payout</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(hostPayouts[0]?.amount || 0, hostPayouts[0]?.currency || 'INR')}
                    </p>
                    <p className="text-sm text-gray-500">{hostPayouts[0]?.date}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {hostPayouts.map(payout => (
                    <div key={payout.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">Reference {payout.reference}</p>
                        <p className="text-sm text-gray-600">{payout.method}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(payout.amount, payout.currency || 'INR')}</p>
                        <p className="text-sm text-gray-500">{formatDate(payout.date)}</p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          payout.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : payout.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {hostDashboardTab === 'reviews' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Reviews</h2>
                <div className="space-y-4">
                  {hostProperties.slice(0, 2).map(property => (
                    <div key={property.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900">{property.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={16} fill={i < Math.floor(property.rating / 2) ? "#fbbf24" : "none"} color="#fbbf24" />
                              ))}
                            </div>
                            <span className="text-sm font-semibold">{property.rating}/10</span>
                            <span className="text-sm text-gray-500">({property.reviews} reviews)</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 italic">
                        "Excellent property with amazing amenities. The staff was very helpful and the location was perfect!"
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        <p className="text-sm text-gray-500">- Guest Review</p>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          View All Reviews →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Profile & KYC Tab */}
            {hostDashboardTab === 'profile' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Host Profile & KYC</h2>
                  <p className="text-sm text-gray-600">
                    Update your personal details and financial information. We’ll verify these details before enabling listings and payouts.
                  </p>
                </div>

                <HostProfileKycForm />
              </div>
            )}
          </div>
        </div>

        {/* Add Property Modal */}
        {showAddPropertyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddPropertyModal(false)}>
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Property</h2>
                <button onClick={() => setShowAddPropertyModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Sunset Beach Resort"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>Hotel</option>
                      <option>Resort</option>
                      <option>Villa</option>
                      <option>Guesthouse</option>
                      <option>Apartment</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="City, Country"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Pin on Map</label>
                    <span className="text-xs text-gray-500">Google Maps search</span>
                  </div>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Search property address"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Latitude"
                    />
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Longitude"
                    />
                  </div>
                  <button type="button" className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-semibold">
                    Use Map Picker (Coming Soon)
                  </button>
                  <p className="text-xs text-gray-500">We’ll use Google Maps APIs to reverse geocode the exact coordinates so your property appears in the map view.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Rooms</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 25"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Star Rating</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>2 Stars</option>
                      <option>3 Stars</option>
                      <option>4 Stars</option>
                      <option>5 Stars</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Base Price (per night)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="$"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your property..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['WiFi', 'Pool', 'Parking', 'Spa', 'Gym', 'Restaurant', 'Room Service', 'Beach Access', 'Pet Friendly'].map(amenity => (
                      <label key={amenity} className="flex items-center space-x-2">
                        <input type="checkbox" className="accent-blue-600" />
                        <span className="text-sm">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <p className="text-gray-600">Drag and drop images here or click to browse</p>
                    <button type="button" className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                      Choose Files
                    </button>
                  </div>
                </div>

                <div className="pt-6 flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Add Property
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPropertyModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {showAddAddonModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddAddonModal(false)}>
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Create Add-on</h2>
                <button onClick={() => setShowAddAddonModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Add-on saved for host property!');
                  setAddonForm({
                    propertyId: hostProperties[0]?.id || '',
                    name: '',
                    description: '',
                    price: '',
                    icon: DEFAULT_ADDON_ICON
                  });
                  setShowAddAddonModal(false);
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                  <select
                    required
                    value={addonForm.propertyId}
                    onChange={(e) => setAddonForm({ ...addonForm, propertyId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select property</option>
                    {hostProperties.map(property => (
                      <option key={property.id} value={property.id}>{property.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Add-on Name</label>
                  <input
                    type="text"
                    required
                    value={addonForm.name}
                    onChange={(e) => setAddonForm({ ...addonForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Candlelight Dinner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows="3"
                    value={addonForm.description}
                    onChange={(e) => setAddonForm({ ...addonForm, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe what is included"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (INR)</label>
                  <input
                    type="number"
                    min="0"
                    value={addonForm.price}
                    onChange={(e) => setAddonForm({ ...addonForm, price: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 1200"
                  />
                </div>
                <div>
                  <p className="block text-sm font-medium text-gray-700 mb-1">Icon</p>
                  <div className="grid grid-cols-4 gap-2">
                    {ADDON_ICON_KEYS.map((iconKey) => {
                      const isSelected = addonForm.icon === iconKey;
                      return (
                        <button
                          key={iconKey}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => setAddonForm({ ...addonForm, icon: iconKey })}
                          className={`flex flex-col items-center justify-center border rounded-lg p-3 text-center focus:outline-none transition ${
                            isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-200'
                          }`}
                        >
                          <div className="text-2xl text-gray-700">{renderAddonIcon(iconKey, 22)}</div>
                          <span className="text-xs text-gray-600 mt-1">{iconKey}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAddonModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                  >
                    Save Add-on
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {showPayoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowPayoutModal(false)}>
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Request Payout</h2>
                <button onClick={() => setShowPayoutModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert(`Payout request of ₹${payoutForm.amount || 0} submitted!`);
                  setPayoutForm({ amount: '', notes: '' });
                  setShowPayoutModal(false);
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (INR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={payoutForm.amount}
                    onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    rows="3"
                    value={payoutForm.notes}
                    onChange={(e) => setPayoutForm({ ...payoutForm, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional message for finance team"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPayoutModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Conditional rendering based on screen size
  if (isMobile) {
    return (
      <CadreagoMobileApp
        hotels={hotels}
        favorites={favorites}
        user={user}
        isLoggedIn={isLoggedIn}
        searchParams={searchParams}
        userBookingsData={userBookingsData}
        formatCurrency={formatCurrency}
        setSearchParams={setSearchParams}
        setSelectedHotel={setSelectedHotel}
        setCurrentView={setCurrentView}
        handleFavoriteToggle={toggleFavorite}
        setShowAuthModal={setShowAuthModal}
        handleSignOut={handleLogout}
        setUserType={setUserType}
        userType={userType}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`flex items-start space-x-3 px-4 py-3 rounded-lg shadow-md border text-sm ${
              notification.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="mt-0.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white bg-opacity-70 text-xs font-bold">
                {notification.type === 'success' ? '✓' : '!'}
              </span>
            </div>
            <div className="flex-1">{notification.message}</div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <Header />
      
      <div className="flex-grow">
        {currentView === 'home' && <HomePage />}
        {currentView === 'search' && <SearchResults />}
        {currentView === 'details' && <HotelDetails />}
        {currentView === 'booking' && <BookingView />}
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'host-onboarding' && <HostOnboarding />}
        {currentView === 'host-dashboard' && <HostDashboard />}
      </div>

      <Footer />
      
      {/* Modals */}
      <GuestSelector show={showGuestSelector} onClose={() => setShowGuestSelector(false)} />
      <AuthModal />
      <ShareModal />
      <ImageGalleryModal />
      <HostMessageModal />
    </div>
  );
};

export default CadreagoApp;
