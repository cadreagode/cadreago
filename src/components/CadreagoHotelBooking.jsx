import React, { useState, useRef, useEffect } from 'react';
import { Search, Calendar, Users, Star, MapPin, Wifi, Car, Utensils, Waves, ThumbsUp, ThumbsDown, Heart, Menu, X, ChevronDown, Filter, CheckCircle, Shield, Coffee, Wind, Dumbbell, Sparkles, Share2, ChevronLeft, ChevronRight, User, Mail, Phone, CreditCard, FileText, Download } from 'lucide-react';
import brandLogo from '../assets/logo.png';
import brandIcon from '../assets/logo_icon.png';
import brandLogoDark from '../assets/logo_non-transperant.png';
import { fetchHotels, fetchHotelsByHost } from '../services/hotelService';
import { createBooking, fetchUserBookings, fetchHostBookings, updateBookingStatus } from '../services/bookingService';
import { signIn, signUp, signOut, getCurrentUser } from '../services/authService';
import { fetchUserPayments } from '../services/paymentService';
import { addToFavorites, removeFromFavorites, fetchUserFavorites } from '../services/favoriteService';

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

const CadreagoApp = () => {
  const [currentView, setCurrentView] = useState('search');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 360);
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const [showDestinations, setShowDestinations] = useState(false);
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
  const [hostOnboardingCompleted, setHostOnboardingCompleted] = useState(true);
  const [showAddAddonModal, setShowAddAddonModal] = useState(false);
  const [addonForm, setAddonForm] = useState({ propertyId: '', name: '', description: '', price: '' });
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutForm, setPayoutForm] = useState({ amount: '', notes: '' });
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [mapSelectedHotel, setMapSelectedHotel] = useState(null);
  const [mapZoom, setMapZoom] = useState(6);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState('');
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const searchInputRef = useRef(null);
  const searchInputRefDesktop = useRef(null);
  const autocompleteRef = useRef(null);
  const autocompleteRefDesktop = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
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

  const popularDestinations = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
    'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Goa',
    'Kerala', 'Udaipur', 'Agra', 'Varanasi', 'Rishikesh',
    'Darjeeling', 'Shimla', 'Manali', 'Ooty', 'Coorg'
  ];

  const filteredDestinations = popularDestinations.filter(dest =>
    dest.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  // Mock host properties
  const hostProperties = [
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
      setIsMobile(window.innerWidth < 360);
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
      const userName = data.user.user_metadata?.full_name || data.user.email.split('@')[0];
      setUser({
        id: data.user.id,
        name: userName,
        email: data.user.email,
        avatar: userName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
      });
      setIsLoggedIn(true);
      setUserType(type);
      setShowAuthModal(false);
      const destination = type === 'host'
        ? (hostOnboardingCompleted ? 'host-dashboard' : 'host-onboarding')
        : 'dashboard';
      setCurrentView(destination);

      // Load user-specific data
      await loadUserData(data.user.id);
    }
  };

  const handleSignup = async (name, email, password, type = 'guest') => {
    const { data, error } = await signUp(email, password, { full_name: name, user_type: type });
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
    priceRange: [0, 500],
    rating: 'all',
    type: 'all',
    amenities: []
  });

  // Load Google Maps API dynamically with proper API key
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) return; // Already loaded

      const script = document.createElement('script');
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY;

      // Use the new async loader pattern with stable weekly version
      script.innerHTML = `
        (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=\`https://maps.googleapis.com/maps/api/js?\`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
          key: "${apiKey}",
          v: "weekly"
        });
      `;

      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Check for existing user session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await getCurrentUser();
      if (data?.user) {
        const userName = data.user.user_metadata?.full_name || data.user.email.split('@')[0];
        setUser({
          id: data.user.id,
          name: userName,
          email: data.user.email,
          avatar: userName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
        });
        setIsLoggedIn(true);
        setUserType(data.user.user_metadata?.user_type || 'guest');

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

  // Load all properties on initial mount
  useEffect(() => {
    const loadAllHotels = async () => {
      setHotelsLoading(true);
      console.log('Loading all properties...');

      // Fetch all hotels without filters
      const { data, error } = await fetchHotels({});
      if (!error && data) {
        setHotels(data);
        console.log(`Loaded ${data.length} properties total`, data);
      } else {
        console.error('Error loading properties:', error);
        setHotels([]);
      }
      setHotelsLoading(false);
    };

    loadAllHotels();
  }, []); // Only run once on mount

  // Handle zoom changes programmatically
  useEffect(() => {
    if (mapRef.current && mapRef.current.innerMap) {
      mapRef.current.innerMap.setZoom(mapZoom);
    }
  }, [mapZoom]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Filter hotels based on selected location from Google Places
  const filteredHotels = React.useMemo(() => {
    // If no search query, show all hotels
    if (!searchParams.destination || searchParams.destination.trim() === '') {
      console.log('No search query - showing all', hotels.length, 'properties');
      return hotels;
    }

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

      // Use larger radius for India (500km to cover entire states)
      // Check if place is in India from address components OR formatted address
      const isInIndia = placeComponents.country === 'india' ||
                        placeComponents.formattedAddress.includes('india') ||
                        placeComponents.formattedAddress.includes('kerala') ||
                        placeComponents.formattedAddress.includes('karnataka') ||
                        placeComponents.formattedAddress.includes('tamil nadu');
      const radiusKm = isInIndia ? 500 : 100;
      console.log('Search radius:', radiusKm, 'km', '- Is in India:', isInIndia);

      const filtered = hotels.filter(hotel => {
        // First try coordinate-based distance matching
        if (hotel.coordinates) {
          const distance = calculateDistance(
            searchLat,
            searchLng,
            hotel.coordinates.lat,
            hotel.coordinates.lng
          );
          console.log('Checking hotel:', hotel.name, '- Distance:', distance.toFixed(0), 'km', '- Radius:', radiusKm, 'km');
          if (distance <= radiusKm) {
            console.log('✓ Match by distance:', hotel.name, '-', distance.toFixed(0), 'km');
            return true;
          }
        } else {
          console.log('Checking hotel:', hotel.name, '- No coordinates');
        }

        // Fallback: Match by state/city/location text
        const hotelLocation = hotel.location?.toLowerCase() || '';
        const hotelCity = hotel.city?.toLowerCase() || '';
        const hotelCountry = hotel.country?.toLowerCase() || '';
        const hotelName = hotel.name?.toLowerCase() || '';

        console.log('Hotel text fields:', {
          name: hotel.name,
          location: hotelLocation,
          city: hotelCity,
          country: hotelCountry
        });

        // Check if hotel matches place name or formatted address
        const matchesPlaceName = placeComponents.placeName && (
          hotelLocation.includes(placeComponents.placeName) ||
          hotelCity.includes(placeComponents.placeName) ||
          hotelName.includes(placeComponents.placeName)
        );

        // Check if hotel is in the same state or city
        const matchesState = placeComponents.state && (
          hotelLocation.includes(placeComponents.state) ||
          placeComponents.formattedAddress.split(',').some(part =>
            hotelLocation.includes(part.trim().toLowerCase())
          )
        );

        const matchesCity = placeComponents.city && (
          hotelCity.includes(placeComponents.city) ||
          hotelLocation.includes(placeComponents.city)
        );

        const matchesCountry = placeComponents.country && hotelCountry.includes(placeComponents.country);

        // For India, be more lenient - match if same country or state appears in location
        if (isInIndia) {
          // Extract state name from formatted address (e.g., "Kerala" from the address)
          const addressParts = placeComponents.formattedAddress.split(',').map(p => p.trim());
          const stateMatch = addressParts.some(part =>
            hotelLocation.includes(part) || hotelCity.includes(part)
          );

          if (stateMatch) {
            console.log('✓ Match by India state/location:', hotel.name, '- Location:', hotel.location);
            return true;
          }
        }

        if (matchesPlaceName || (matchesCountry && (matchesState || matchesCity))) {
          console.log('✓ Match by location text:', hotel.name, '- Location:', hotel.location, 'City:', hotel.city);
          return true;
        }

        return false;
      });

      console.log('Filtered', filtered.length, 'properties for', selectedPlace.name);
      return filtered;
    }

    // Fallback: Text-based search (when Google Places hasn't loaded or user typed manually)
    const searchTerm = searchParams.destination.toLowerCase().trim();
    console.log('Filtering by text search:', searchTerm);

    const filtered = hotels.filter(hotel => {
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
    return filtered;
  }, [hotels, selectedPlace, searchParams.destination]);

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
    if (filteredHotels.length > 0) {
      return filteredHotels;
    }
    // If no search results, show hotels in current map view
    if (mapViewHotels.length > 0 && showMapViewHotels) {
      return mapViewHotels;
    }
    return filteredHotels; // Empty array
  }, [filteredHotels, mapViewHotels, showMapViewHotels]);

  // Reset showMapViewHotels when we have filtered results
  useEffect(() => {
    if (filteredHotels.length > 0 && showMapViewHotels) {
      setShowMapViewHotels(false);
    }
  }, [filteredHotels.length, showMapViewHotels]);

  // Update map center and zoom when filtered hotels change
  useEffect(() => {
    if (!mapRef.current?.innerMap || !displayedHotels.length) return;

    const hotelsWithCoords = displayedHotels.filter(h => h.coordinates);
    if (hotelsWithCoords.length === 0) return;

    // If there's a selected place, center on it
    if (selectedPlace && selectedPlace.geometry) {
      const center = {
        lat: selectedPlace.geometry.location.lat(),
        lng: selectedPlace.geometry.location.lng()
      };
      mapRef.current.innerMap.setCenter(center);

      // Adjust zoom based on number of properties
      if (hotelsWithCoords.length === 1) {
        mapRef.current.innerMap.setZoom(12);
      } else if (hotelsWithCoords.length <= 3) {
        mapRef.current.innerMap.setZoom(9);
      } else {
        mapRef.current.innerMap.setZoom(7);
      }
      return;
    }

    // Otherwise, fit bounds to show all displayed hotels
    const bounds = new window.google.maps.LatLngBounds();
    hotelsWithCoords.forEach(hotel => {
      bounds.extend({
        lat: hotel.coordinates.lat,
        lng: hotel.coordinates.lng
      });
    });

    mapRef.current.innerMap.fitBounds(bounds, 50); // 50px padding
  }, [displayedHotels, selectedPlace]);

  // Update map bounds when map is moved or zoomed
  useEffect(() => {
    const updateMapBounds = () => {
      if (mapRef.current && mapRef.current.innerMap) {
        const bounds = mapRef.current.innerMap.getBounds();
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
      }
    };

    if (mapRef.current && mapRef.current.innerMap) {
      // Update bounds initially
      updateMapBounds();

      // Listen for map movements
      const map = mapRef.current.innerMap;
      const boundsListener = map.addListener('bounds_changed', updateMapBounds);

      return () => {
        if (boundsListener) {
          window.google.maps.event.removeListener(boundsListener);
        }
      };
    }
  }, [mapLoaded]);

  // Get user's current location on mount
  useEffect(() => {
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

          // Reverse geocode to get city name
          if (window.google?.maps?.importLibrary) {
            try {
              const { Geocoder } = await window.google.maps.importLibrary("geocoding");
              const geocoder = new Geocoder();
              const result = await geocoder.geocode({
                location: { lat: latitude, lng: longitude }
              });

              if (result.results[0]) {
                // Find city from address components
                const addressComponents = result.results[0].address_components;
                const city = addressComponents.find(c =>
                  c.types.includes('locality') || c.types.includes('administrative_area_level_2')
                );

                if (city) {
                  const cityName = city.long_name;
                  setSearchQuery(cityName);
                  setSearchParams(prev => ({ ...prev, destination: cityName }));
                  setSelectedPlace({
                    name: cityName,
                    geometry: {
                      location: {
                        lat: () => latitude,
                        lng: () => longitude
                      }
                    },
                    formatted_address: result.results[0].formatted_address,
                    address_components: addressComponents // Include address components!
                  });
                }
              }
            } catch (error) {
              console.log('Geocoding failed:', error.message);
            }
          }
          setLocationLoading(false);
        },
        (error) => {
          console.log('Location access denied or failed:', error.message);
          setLocationLoading(false);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    };

    // Only get location once on mount
    getCurrentLocation();
  }, []);

  // Initialize Google Places Autocomplete with new async loading
  useEffect(() => {
    const initAutocomplete = async () => {
      try {
        // Use the new importLibrary API for proper async loading
        const { Autocomplete } = await window.google.maps.importLibrary("places");

        const autocompleteOptions = {
          types: ['(cities)'],
          fields: ['name', 'geometry', 'formatted_address', 'address_components'],
          componentRestrictions: { country: 'in' }
        };

        // Initialize mobile autocomplete
        if (searchInputRef.current && !autocompleteRef.current) {
          // Set initial value before Autocomplete takes over
          searchInputRef.current.value = searchQuery;

          const mobileAc = new Autocomplete(searchInputRef.current, autocompleteOptions);
          autocompleteRef.current = mobileAc;

          mobileAc.addListener('place_changed', () => {
            const place = mobileAc.getPlace();
            console.log('Mobile autocomplete place selected:', place);
            if (place.geometry) {
              const cityName = place.name || place.formatted_address;
              setSearchQuery(cityName);
              setSearchParams(prev => ({...prev, destination: cityName}));
              setSelectedPlace(place);
              setShowDestinations(false);
            }
          });
        }

        // Initialize desktop autocomplete
        if (searchInputRefDesktop.current && !autocompleteRefDesktop.current) {
          // Set initial value before Autocomplete takes over
          searchInputRefDesktop.current.value = searchQuery;

          const desktopAc = new Autocomplete(searchInputRefDesktop.current, autocompleteOptions);
          autocompleteRefDesktop.current = desktopAc;

          desktopAc.addListener('place_changed', () => {
            const place = desktopAc.getPlace();
            console.log('Desktop autocomplete place selected:', place);
            if (place.geometry) {
              const cityName = place.name || place.formatted_address;
              setSearchQuery(cityName);
              setSearchParams(prev => ({...prev, destination: cityName}));
              setSelectedPlace(place);
              setShowDestinations(false);
            }
          });
        }
      } catch (error) {
        // Handle autocomplete errors (e.g., API key issues)
        console.debug('Places Autocomplete not available:', error.message);
      }
    };

    // Initialize when Google Maps is available
    if (window.google?.maps?.importLibrary) {
      initAutocomplete();
    } else {
      // Wait for Google Maps to load
      const checkGoogle = setInterval(() => {
        if (window.google?.maps?.importLibrary) {
          initAutocomplete();
          clearInterval(checkGoogle);
        }
      }, 100);

      return () => clearInterval(checkGoogle);
    }
  }, []);

  const initialMapCenter = React.useMemo(() => {
    // Use selected place location if available
    if (selectedPlace && selectedPlace.geometry) {
      return {
        lat: selectedPlace.geometry.location.lat(),
        lng: selectedPlace.geometry.location.lng()
      };
    }
    // Otherwise use first hotel with coordinates
    const withCoordinates = displayedHotels.find(hotel => hotel.coordinates);
    return withCoordinates?.coordinates || { lat: 20.5937, lng: 78.9629 };
  }, [selectedPlace, displayedHotels]);

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

  const getRatingBarWidth = (score) => `${(score / 10) * 100}%`;

  // Initialize Google Maps JavaScript API
  useEffect(() => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY;

    if (!apiKey) {
      setMapError('Add REACT_APP_GOOGLE_MAPS_KEY to your .env.local file to enable Google Maps.');
      return;
    }

    // Wait for the API to be ready
    const checkGoogleMapsReady = () => {
      if (window.google?.maps) {
        setMapLoaded(true);
        setMapError('');
      } else {
        // Check again in 100ms
        setTimeout(checkGoogleMapsReady, 100);
      }
    };

    checkGoogleMapsReady();
  }, []);

  // Initialize the map instance
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      try {
        // Import the maps library
        const { Map } = await window.google.maps.importLibrary("maps");

        const mapId = process.env.REACT_APP_GOOGLE_MAPS_MAP_ID;

        // Create the map with a default center (India's center)
        const map = new Map(mapRef.current, {
          center: { lat: 20.5937, lng: 78.9629 },
          zoom: mapZoom,
          mapId: mapId,
          disableDefaultUI: false,
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        mapInstanceRef.current = map;

        // Add click listener to deselect hotel
        map.addListener('click', () => {
          setMapSelectedHotel(null);
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to initialize map');
      }
    };

    initMap();
  }, [mapLoaded]);

  // Update map center when initialMapCenter changes (without reinitializing the map)
  useEffect(() => {
    if (mapInstanceRef.current && initialMapCenter) {
      mapInstanceRef.current.setCenter(initialMapCenter);
    }
  }, [initialMapCenter]);

  // Create hotel IDs string to detect actual hotel list changes
  const displayedHotelIds = React.useMemo(() =>
    displayedHotels.map(h => h.id).join(','),
    [displayedHotels]
  );

  // Create and update markers - only when hotel list changes
  useEffect(() => {
    if (!mapInstanceRef.current || displayedHotels.length === 0) return;

    const createMarkers = async () => {
      try {
        // Import the marker library
        const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker");

        // Clear existing markers
        markersRef.current.forEach((item) => {
          // Handle both old format (direct marker) and new format (object with marker)
          const marker = item.marker || item;
          if (marker && marker.map !== undefined) {
            marker.map = null;
          }
        });
        markersRef.current = [];

        console.log(`Creating ${displayedHotels.length} markers`);

        // Create new markers for displayed hotels
        displayedHotels.forEach((hotel) => {
          if (!hotel.coordinates) {
            return;
          }

          const priceLabel = formatCurrency(hotel.price, hotel.currency);

          // Create price tag element
          const priceTag = document.createElement('div');
          priceTag.className = 'price-marker';
          priceTag.innerHTML = priceLabel;
          priceTag.dataset.hotelId = hotel.id; // Store hotel ID for later reference

          // Apply base styles
          Object.assign(priceTag.style, {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 16px',
            borderRadius: '999px',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: '700',
            fontSize: '15px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
            border: '2px solid #e5e7eb',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            lineHeight: '1.2',
            letterSpacing: '-0.01em',
          });

          // Add hover effects
          priceTag.addEventListener('mouseenter', () => {
            if (priceTag.style.backgroundColor === 'rgb(255, 255, 255)') {
              priceTag.style.backgroundColor = '#f3f4f6';
              priceTag.style.transform = 'scale(1.05)';
            }
          });

          priceTag.addEventListener('mouseleave', () => {
            if (priceTag.style.backgroundColor === 'rgb(243, 244, 246)') {
              priceTag.style.backgroundColor = '#ffffff';
              priceTag.style.transform = 'scale(1)';
            }
          });

          // Create the advanced marker
          const marker = new AdvancedMarkerElement({
            map: mapInstanceRef.current,
            position: { lat: hotel.coordinates.lat, lng: hotel.coordinates.lng },
            content: priceTag,
            title: hotel.name,
          });

          // Add click listener
          marker.addListener('click', () => {
            setMapSelectedHotel(hotel);
          });

          // Store marker with hotel reference
          markersRef.current.push({ marker, hotel, priceTag });
        });
      } catch (error) {
        console.error('Error creating markers:', error);
      }
    };

    createMarkers();
  }, [displayedHotelIds]); // Only recreate when hotel IDs change

  // Update marker styles when selection changes (without recreating markers)
  useEffect(() => {
    if (markersRef.current.length === 0) return;

    markersRef.current.forEach(({ priceTag, hotel }) => {
      const isActive = mapSelectedHotel?.id === hotel.id;

      if (isActive) {
        priceTag.style.backgroundColor = '#2563eb';
        priceTag.style.color = '#ffffff';
        priceTag.style.border = '2px solid #1d4ed8';
      } else {
        priceTag.style.backgroundColor = '#ffffff';
        priceTag.style.color = '#0f172a';
        priceTag.style.border = '2px solid #e5e7eb';
      }
    });
  }, [mapSelectedHotel]);

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
              Property Owner
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
              {authMode === 'login' ? 'Login' : 'Sign Up'} as {formData.userType === 'guest' ? 'Guest' : 'Property Owner'}
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
                      <span className="text-xs text-gray-500">{userType === 'host' ? 'Property Owner' : 'Guest'}</span>
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
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    ref={searchInputRefDesktop}
                    type="text"
                    defaultValue={searchQuery}
                    onChange={(e) => {
                      // Only show manual dropdown if autocomplete hasn't loaded
                      if (!autocompleteRefDesktop.current) {
                        const value = e.target.value;
                        setSearchQuery(value);
                        setSearchParams(prev => ({...prev, destination: value}));
                        setShowDestinations(true);
                      }
                    }}
                    onFocus={() => {
                      // Only show manual dropdown if autocomplete hasn't loaded
                      if (!autocompleteRefDesktop.current) {
                        setShowDestinations(true);
                      }
                    }}
                    onBlur={() => setTimeout(() => setShowDestinations(false), 200)}
                    placeholder="Where are you going?"
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                  {showDestinations && filteredDestinations.length > 0 && !autocompleteRefDesktop.current && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredDestinations.map((dest, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSearchQuery(dest);
                            setSearchParams({...searchParams, destination: dest});
                            setShowDestinations(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors flex items-center space-x-2"
                        >
                          <MapPin size={16} className="text-gray-400" />
                          <span>{dest}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
  const FilterBar = () => (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 overflow-x-auto">
      <div className="flex items-center space-x-3">
        <Filter size={18} className="text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-800">Filters</h3>
      </div>
      <div className="flex flex-wrap items-center gap-4 flex-1">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Min</span>
          <input 
            type="number" 
            value={filters.priceRange[0]}
            className="w-20 px-2 py-1 border rounded text-sm"
            onChange={(e) => setFilters({...filters, priceRange: [Number(e.target.value) || 0, filters.priceRange[1]]})}
          />
          <span className="text-xs text-gray-500">Max</span>
          <input 
            type="number" 
            value={filters.priceRange[1]}
            className="w-20 px-2 py-1 border rounded text-sm"
            onChange={(e) => setFilters({...filters, priceRange: [filters.priceRange[0], Number(e.target.value) || 0]})}
          />
        </div>
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

  // Hotel Card matching exact design from image 2
  const HotelCard = ({ hotel }) => (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
      onClick={() => {
        setSelectedHotel(hotel);
        setCurrentView('details');
      }}
      onMouseEnter={() => setMapSelectedHotel(hotel)}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="md:w-2/5 relative">
          <img 
            src={hotel.image} 
            alt={hotel.name}
            className="w-full h-48 md:h-full object-cover"
          />
          {hotel.ecoFriendly && (
            <div className="absolute bottom-3 left-3 bg-green-500 text-white px-3 py-1.5 rounded text-xs flex items-center space-x-1.5">
              <Sparkles size={14} />
              <span className="font-medium">Eco-friendly stay</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="md:w-3/5 p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start mb-3">
            <div className="flex-1 mb-4 md:mb-0">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{hotel.name}</h3>
              <div className="flex items-center space-x-1 mb-2">
                {[...Array(hotel.stars)].map((_, i) => (
                  <Star key={i} size={16} fill="#000" color="#000" />
                ))}
              </div>
              <div className="flex items-center text-gray-500 text-sm mb-3">
                <span>{hotel.location}</span>
              </div>

              {/* Limited Deal Badge */}
              {hotel.limitedDeal && (
                <div className="mb-3">
                  <span className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-green-500 text-white rounded-lg text-xs md:text-sm font-semibold">
                    Limited time deal
                  </span>
                </div>
              )}

              {/* Amenities */}
              <div className="flex flex-wrap gap-2 mb-3">
                {hotel.amenities.map((amenity, idx) => (
                  <span key={idx} className="px-2 md:px-4 py-1 md:py-2 bg-gray-100 text-gray-700 rounded-lg text-xs md:text-sm font-medium">
                    {amenity}
                  </span>
                ))}
              </div>

              {/* Free Cancellation Box */}
              {hotel.freeCancellation && (
                <div className="border-2 border-blue-500 rounded-lg p-3 md:p-4 mb-3">
                  <div className="text-blue-600 font-semibold text-sm md:text-base mb-1">Free cancellation</div>
                  <div className="text-red-600 font-semibold text-xs md:text-sm">
                    Only {hotel.roomsLeft} room at this price on our site
                  </div>
                </div>
              )}
            </div>

            {/* Rating and Price Section */}
            <div className="w-full md:w-auto text-right md:ml-4 flex md:flex-col justify-between md:justify-start items-end">
              <div className="mb-0 md:mb-4">
                <div className="text-xs md:text-sm text-gray-600 mb-1">{hotel.ratingText}</div>
                <div className="text-xs text-gray-500 mb-1 md:mb-2">{hotel.reviews} ratings</div>
                <div className={`inline-flex items-center px-2 md:px-3 py-1 md:py-2 ${getRatingColor(hotel.rating)} text-white rounded-lg font-bold text-base md:text-lg`}>
                  {hotel.rating}
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-1">{formatCurrency(hotel.price, hotel.currency)}</div>
                <div className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">
                  {getGuestText()}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedHotel(hotel);
                    setCurrentView('details');
                  }}
                  className="w-full md:w-auto px-4 md:px-8 py-2 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm md:text-lg shadow-md"
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

  // Search Results matching image 1
  const SearchResults = () => {
    const activeMapHotel = mapSelectedHotel;
    const handleZoom = (delta) => {
      setMapZoom(prev => Math.min(13, Math.max(4, prev + delta)));
    };

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
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  ref={searchInputRef}
                  type="text"
                  defaultValue={searchQuery}
                  onChange={(e) => {
                    // Only show manual dropdown if autocomplete hasn't loaded
                    if (!autocompleteRef.current) {
                      const value = e.target.value;
                      setSearchQuery(value);
                      setSearchParams(prev => ({...prev, destination: value}));
                      setShowDestinations(true);
                    }
                  }}
                  onFocus={() => {
                    // Only show manual dropdown if autocomplete hasn't loaded
                    if (!autocompleteRef.current) {
                      setShowDestinations(true);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowDestinations(false), 200)}
                  placeholder="Where are you going?"
                  className="w-full pl-10 pr-3 md:pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                />
                {showDestinations && filteredDestinations.length > 0 && !autocompleteRef.current && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredDestinations.map((dest, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSearchQuery(dest);
                          setSearchParams({...searchParams, destination: dest});
                          setShowDestinations(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors flex items-center space-x-2"
                      >
                        <MapPin size={16} className="text-gray-400" />
                        <span className="text-sm md:text-base">{dest}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
                  min={searchParams.checkIn || new Date().toISOString().split('T')[0]}
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
                <select className="flex-1 sm:flex-initial px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs md:text-sm">
                  <option>Choose an option</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Rating</option>
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
                <div className="flex items-center space-x-2">
                  <div className="flex bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleZoom(1)}
                      disabled={mapZoom >= 13}
                      className={`px-3 py-1 text-lg font-semibold text-gray-700 hover:bg-gray-50 ${mapZoom >= 13 ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => handleZoom(-1)}
                      disabled={mapZoom <= 4}
                      className={`px-3 py-1 text-lg font-semibold text-gray-700 border-l border-gray-200 hover:bg-gray-50 ${mapZoom <= 4 ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      −
                    </button>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700" onClick={() => setMapSelectedHotel(null)}>
                    Reset
                  </button>
                </div>
              </div>

              {/* Map container - floats with scroll */}
              <div
                className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300"
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

                {/* Google Maps JavaScript API */}
                <div
                  ref={mapRef}
                  style={{ width: '100%', height: '100%' }}
                  className="rounded-2xl"
                />

                {/* Property card overlay - positioned absolutely so it doesn't affect map height */}
                {activeMapHotel && (
                  <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-2xl p-4 flex flex-col sm:flex-row gap-4 z-30 pointer-events-auto">
                    <button
                      type="button"
                      aria-label="Close map preview"
                      className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors z-40"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMapSelectedHotel(null);
                      }}
                    >
                      <X size={18} />
                    </button>
                    <img
                      src={activeMapHotel.image}
                      alt={activeMapHotel.name}
                      className="w-full sm:w-32 h-32 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-lg font-semibold text-gray-900 truncate pr-2">{activeMapHotel.name}</h4>
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
    const [aadhaar, setAadhaar] = React.useState({ number: '', status: 'pending' });
    const [gstRegistered, setGstRegistered] = React.useState(false);
    const [gst, setGst] = React.useState({ number: '', status: 'pending' });
    const [bank, setBank] = React.useState({ account: '', ifsc: '', status: 'pending' });

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

    const handleVerification = (type) => {
      if (type === 'aadhaar' && aadhaar.number.length >= 10) {
        setAadhaar({ ...aadhaar, status: 'verified' });
        alert('Aadhaar verification simulated via Cashfree API.');
      } else if (type === 'gst' && gst.number.length >= 5) {
        setGst({ ...gst, status: 'verified' });
        alert('GST verification simulated via Cashfree API.');
      } else if (type === 'bank' && bank.account && bank.ifsc) {
        setBank({ ...bank, status: 'verified' });
        alert('Bank account verification simulated via Cashfree API.');
      } else {
        alert('Please enter valid information before verification.');
      }
    };

    const canComplete =
      aadhaar.status === 'verified' &&
      bank.status === 'verified' &&
      (!gstRegistered || gst.status === 'verified') &&
      personalInfo.firstName &&
      personalInfo.phone;

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
              {statusBadge(aadhaar.status)}
            </div>
            <p className="text-sm text-gray-600">We’ll use Cashfree KYC APIs to verify your identity securely.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={aadhaar.number}
                onChange={(e) => setAadhaar({ ...aadhaar, number: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Aadhaar Number"
              />
              <button
                type="button"
                onClick={() => handleVerification('aadhaar')}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Verify via Cashfree
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">GST Details</h2>
              {gstRegistered ? statusBadge(gst.status) : <span className="text-sm text-gray-500">Optional</span>}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={gstRegistered}
                onChange={(e) => {
                  setGstRegistered(e.target.checked);
                  if (!e.target.checked) {
                    setGst({ number: '', status: 'pending' });
                  }
                }}
                className="accent-blue-600"
              />
              <span>My business is registered under GST</span>
            </div>
            {gstRegistered && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={gst.number}
                  onChange={(e) => setGst({ ...gst, number: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="GSTIN"
                />
                <button
                  type="button"
                  onClick={() => handleVerification('gst')}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Verify via Cashfree
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Bank Account</h2>
              {statusBadge(bank.status)}
            </div>
            <p className="text-sm text-gray-600">
              Provide an INR bank account for payouts. We’ll verify account holder name using Cashfree Payout APIs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={bank.account}
                  onChange={(e) => setBank({ ...bank, account: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="XXXXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={bank.ifsc}
                  onChange={(e) => setBank({ ...bank, ifsc: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                  placeholder="SBIN0000000"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleVerification('bank')}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Verify Bank via Cashfree
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-sm text-gray-600">
            Cashfree will notify you once verifications are complete. You can edit these details anytime from your host dashboard.
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={!canComplete}
              onClick={() => {
                setHostOnboardingCompleted(true);
                setCurrentView('host-dashboard');
              }}
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

    const totalRevenue = hostProperties.reduce((sum, p) => sum + p.monthlyRevenue, 0);
    const totalBookings = hostProperties.reduce((sum, p) => sum + p.totalBookings, 0);
    const avgOccupancy = Math.round(hostProperties.reduce((sum, p) => sum + p.occupancyRate, 0) / hostProperties.length);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Host Dashboard</h1>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setShowAddPropertyModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center space-x-2"
              >
                <span>+ Add Property</span>
              </button>
              <button 
                onClick={() => {
                  setAddonForm({ propertyId: hostProperties[0]?.id || '', name: '', description: '', price: '' });
                  setShowAddAddonModal(true);
                }}
                className="px-6 py-3 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-semibold flex items-center space-x-2"
              >
                <span>+ Create Add-on</span>
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Properties</p>
                  <p className="text-3xl font-bold text-gray-900">{hostProperties.length}</p>
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
                  <p className="text-3xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
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
                { id: 'reviews', label: 'Reviews', icon: '⭐' }
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
                              property.status === 'active' ? 'bg-green-100 text-green-800' :
                              'bg-yellow-100 text-yellow-800'
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
                              <p className="font-semibold text-green-600">${property.basePrice}/night</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Occupancy</p>
                              <p className="font-semibold">{property.occupancyRate}%</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Revenue</p>
                              <p className="font-semibold text-green-600">${property.monthlyRevenue}/mo</p>
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
                                setAddonForm({ ...addonForm, propertyId: property.id });
                                setShowAddAddonModal(true);
                              }}
                            >
                              Add Add-on
                            </button>
                            <button className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-semibold">
                              Deactivate
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
                    <p className="text-3xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
                    <p className="text-sm text-green-600 mt-2">↑ 12% from last month</p>
                  </div>
                  <div className="border rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">Last Month</p>
                    <p className="text-3xl font-bold text-gray-900">${Math.round(totalRevenue * 0.88).toLocaleString()}</p>
                  </div>
                  <div className="border rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">Year to Date</p>
                    <p className="text-3xl font-bold text-gray-900">${Math.round(totalRevenue * 3.2).toLocaleString()}</p>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4">Revenue by Property</h3>
                <div className="space-y-4">
                  {hostProperties.map(property => (
                    <div key={property.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-900">{property.name}</h4>
                        <span className="text-lg font-bold text-green-600">${property.monthlyRevenue}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{width: `${(property.monthlyRevenue / totalRevenue) * 100}%`}}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {Math.round((property.monthlyRevenue / totalRevenue) * 100)}% of total revenue
                      </p>
                    </div>
                  ))}
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
                  setAddonForm({ propertyId: hostProperties[0]?.id || '', name: '', description: '', price: '' });
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

  // Mobile UI Component (for screens < 360px)
  const MobileUI = () => {
    const [activePage, setActivePage] = useState('home');

    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 py-6">
        {/* App Shell with Navigation Pages */}
        <div className="w-[380px] h-[800px] max-w-full bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
          {/* Top Status Padding */}
          <div className="h-4" />

          {/* Simple top app bar for current page label */}
          <div className="px-6 pb-3 flex items-center justify-between text-xs text-slate-500">
            <span>Cadreago Mobile</span>
            <span className="capitalize">{activePage}</span>
          </div>

          {/* PAGES WRAPPER */}
          <div className="flex-1 overflow-hidden">
            {/* HOME PAGE */}
            {activePage === 'home' && (
              <div className="h-full flex flex-col">
                {/* Header / Location / Profile */}
                <header className="px-6 pb-4 pt-1 flex items-center justify-between">
                  <div className="flex flex-col text-xs">
                    <span className="text-slate-400 font-medium">Current location</span>
                    <span className="flex items-center gap-1 text-slate-700 font-semibold text-[13px]">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-500" />
                      {searchParams.destination || 'Kochi, India'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xl font-semibold">
                      <Menu size={20} />
                    </button>
                    <button
                      onClick={() => {
                        if (isLoggedIn) {
                          setActivePage('profile');
                        } else {
                          setShowAuthModal(true);
                        }
                      }}
                      className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700"
                    >
                      {user ? user.full_name?.charAt(0).toUpperCase() : 'G'}
                    </button>
                  </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto px-6 pb-4 space-y-6">
                  {/* Greeting + Search */}
                  <section className="space-y-4 pt-1">
                    <div>
                      <p className="text-[13px] text-slate-500">
                        Hello {user?.full_name?.split(' ')[0] || 'Guest'},
                      </p>
                      <h1 className="text-xl font-semibold text-slate-900 leading-snug">
                        Explore beautiful stays with Cadreago
                      </h1>
                    </div>

                    {/* Search Bar */}
                    <div
                      onClick={() => setCurrentView('search')}
                      className="flex items-center gap-2 bg-slate-100 rounded-2xl px-4 py-2.5 cursor-pointer"
                    >
                      <div className="flex-1">
                        <p className="text-[11px] text-slate-400">Search stays</p>
                        <p className="text-[13px] text-slate-700 truncate">
                          {searchParams.destination || 'Destination, city, homestay name'}
                        </p>
                      </div>
                      <button className="h-9 w-9 rounded-2xl bg-sky-500 flex items-center justify-center text-white text-lg">
                        <Search size={18} />
                      </button>
                    </div>
                  </section>

                  {/* City Pills */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-slate-900">Explore city</h2>
                      <button className="text-[11px] text-sky-500 font-medium">Change</button>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                      {["Kochi", "Kasaragod", "Bengaluru", "Munnar"].map((city, idx) => (
                        <button
                          key={city}
                          onClick={() => {
                            setSearchParams(prev => ({ ...prev, destination: city }));
                          }}
                          className={`px-4 py-1.5 rounded-full text-[13px] whitespace-nowrap border transition-colors ${
                            searchParams.destination === city
                              ? "bg-sky-500 text-white border-sky-500 shadow-sm"
                              : "bg-white text-slate-600 border-slate-200"
                          }`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Experience 360 Section (horizontal cards) */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-slate-900">Featured Stays</h2>
                      <button
                        onClick={() => setCurrentView('search')}
                        className="text-[11px] text-sky-500 font-medium"
                      >
                        View all
                      </button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-1 hide-scrollbar">
                      {hotels.slice(0, 3).map((hotel) => (
                        <article
                          key={hotel.id}
                          onClick={() => {
                            setSelectedHotel(hotel);
                            setCurrentView('details');
                          }}
                          className="min-w-[250px] max-w-[250px] bg-white rounded-3xl shadow-md overflow-hidden flex-shrink-0 border border-slate-100 cursor-pointer"
                        >
                          {/* Image */}
                          <div className="h-36 bg-slate-200 relative">
                            {hotel.images && hotel.images.length > 0 && (
                              <img
                                src={hotel.images[0]}
                                alt={hotel.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="p-3.5 space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="text-sm font-semibold text-slate-900 truncate">
                                {hotel.name}
                              </h3>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFavoriteToggle(hotel.id);
                                }}
                                className="h-7 w-7 rounded-full bg-white/80 flex items-center justify-center shadow text-[15px]"
                              >
                                <Heart
                                  size={14}
                                  className={favorites.includes(hotel.id) ? "fill-red-500 text-red-500" : "text-slate-400"}
                                />
                              </button>
                            </div>
                            <p className="text-[11px] text-slate-500">{hotel.location}</p>
                            <div className="flex items-center justify-between pt-1.5">
                              <div className="flex flex-col">
                                <span className="text-[13px] font-semibold text-slate-900">
                                  {formatCurrency(hotel.price_per_night)}
                                  <span className="text-[11px] text-slate-500 font-normal">
                                    /night
                                  </span>
                                </span>
                                <span className="text-[11px] text-slate-400">Free cancellation</span>
                              </div>
                              <div className="text-right text-[11px] text-slate-500">
                                <p className="font-medium text-slate-800 flex items-center gap-0.5">
                                  <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                  {hotel.rating || '4.5'}
                                </p>
                                <p>{hotel.reviews_count || 0} reviews</p>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>

                  {/* Other Hotels (vertical list cards) */}
                  <section className="space-y-3 pb-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-slate-900">Other stays</h2>
                      <button
                        onClick={() => setCurrentView('search')}
                        className="text-[11px] text-sky-500 font-medium"
                      >
                        View all
                      </button>
                    </div>

                    <div className="space-y-3">
                      {hotels.slice(3, 5).map((hotel) => (
                        <article
                          key={hotel.id}
                          onClick={() => {
                            setSelectedHotel(hotel);
                            setCurrentView('details');
                          }}
                          className="flex gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-2.5 shadow-sm cursor-pointer"
                        >
                          <div className="w-24 h-24 rounded-2xl bg-slate-200 flex-shrink-0 overflow-hidden">
                            {hotel.images && hotel.images.length > 0 && (
                              <img
                                src={hotel.images[0]}
                                alt={hotel.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-between text-[12px]">
                            <div>
                              <h3 className="text-[13px] font-semibold text-slate-900 line-clamp-2">
                                {hotel.name}
                              </h3>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {hotel.location} • {hotel.max_guests} guests • {hotel.bedrooms} bedroom{hotel.bedrooms > 1 ? 's' : ''}
                              </p>
                            </div>
                            <div className="flex items-end justify-between mt-2">
                              <div className="flex flex-col">
                                <span className="text-[13px] font-semibold text-slate-900">
                                  {formatCurrency(hotel.price_per_night)}
                                  <span className="text-[11px] text-slate-500 font-normal">
                                    /night
                                  </span>
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  Includes taxes & fees
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-slate-600">
                                <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                <span>{hotel.rating || '4.5'}</span>
                                <span className="text-slate-400">({hotel.reviews_count || 0})</span>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                </main>
              </div>
            )}

            {/* FAVORITES PAGE */}
            {activePage === 'favorites' && (
              <div className="h-full flex flex-col bg-slate-50 px-6 pb-4 pt-2 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Your Favorites</h2>
                  <p className="text-[12px] text-slate-500">
                    Properties you've saved for later
                  </p>
                </div>
                {favorites.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-[13px] text-slate-500 space-y-3">
                      <div className="mx-auto h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center">
                        <Heart size={32} className="text-slate-400" />
                      </div>
                      <p>No favorites yet.</p>
                      <p className="text-slate-400">
                        Start exploring and save your favorite stays.
                      </p>
                      <button
                        onClick={() => setActivePage('home')}
                        className="mt-2 px-4 py-2 rounded-full bg-sky-500 text-white text-[12px] font-medium"
                      >
                        Explore stays
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto">
                    {hotels.filter(h => favorites.includes(h.id)).map((hotel) => (
                      <article
                        key={hotel.id}
                        onClick={() => {
                          setSelectedHotel(hotel);
                          setCurrentView('details');
                        }}
                        className="flex gap-3 rounded-3xl border border-slate-100 bg-white p-2.5 shadow-sm cursor-pointer"
                      >
                        <div className="w-24 h-24 rounded-2xl bg-slate-200 flex-shrink-0 overflow-hidden">
                          {hotel.images && hotel.images.length > 0 && (
                            <img
                              src={hotel.images[0]}
                              alt={hotel.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between text-[12px]">
                          <div>
                            <h3 className="text-[13px] font-semibold text-slate-900 line-clamp-2">
                              {hotel.name}
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {hotel.location}
                            </p>
                          </div>
                          <div className="flex items-end justify-between mt-2">
                            <span className="text-[13px] font-semibold text-slate-900">
                              {formatCurrency(hotel.price_per_night)}
                              <span className="text-[11px] text-slate-500 font-normal">/night</span>
                            </span>
                            <div className="flex items-center gap-1 text-[11px] text-slate-600">
                              <Star size={10} className="fill-yellow-400 text-yellow-400" />
                              <span>{hotel.rating || '4.5'}</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TRIPS PAGE */}
            {activePage === 'trips' && (
              <div className="h-full flex flex-col bg-slate-50 px-6 pb-4 pt-2 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Your trips</h2>
                  <p className="text-[12px] text-slate-500">
                    {isLoggedIn
                      ? "Your upcoming and past bookings"
                      : "Sign in to view your trips"}
                  </p>
                </div>
                {!isLoggedIn ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-[13px] text-slate-500 space-y-3">
                      <div className="mx-auto h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center">
                        <User size={32} className="text-slate-400" />
                      </div>
                      <p>Sign in to view your trips.</p>
                      <button
                        onClick={() => setShowAuthModal(true)}
                        className="mt-2 px-4 py-2 rounded-full bg-sky-500 text-white text-[12px] font-medium"
                      >
                        Sign in
                      </button>
                    </div>
                  </div>
                ) : userBookingsData.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-[13px] text-slate-500 space-y-3">
                      <div className="mx-auto h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center">
                        <Calendar size={32} className="text-slate-400" />
                      </div>
                      <p>No trips yet.</p>
                      <p className="text-slate-400">
                        Start exploring to plan your first Cadreago trip.
                      </p>
                      <button
                        onClick={() => setActivePage('home')}
                        className="mt-2 px-4 py-2 rounded-full bg-sky-500 text-white text-[12px] font-medium"
                      >
                        Search stays
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto">
                    {userBookingsData.map((booking) => (
                      <div key={booking.id} className="rounded-2xl bg-white border border-slate-100 p-3 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 rounded-xl bg-slate-200 flex-shrink-0"></div>
                          <div className="flex-1">
                            <h3 className="text-[13px] font-semibold text-slate-900">
                              {booking.hotel?.name}
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                            </p>
                            <p className="text-[12px] font-medium text-slate-900 mt-1">
                              {formatCurrency(booking.total_amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PROFILE PAGE */}
            {activePage === 'profile' && (
              <div className="h-full flex flex-col bg-slate-50 px-6 pb-4 pt-2 space-y-4">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="h-12 w-12 rounded-full bg-slate-300 flex items-center justify-center text-lg font-semibold text-white">
                        {user?.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{user?.full_name}</p>
                        <p className="text-[12px] text-slate-500">{user?.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-[13px]">
                      <button
                        onClick={() => setCurrentView('dashboard')}
                        className="w-full rounded-2xl bg-white border border-slate-100 p-3 flex items-center justify-between text-left"
                      >
                        <span>Account settings</span>
                        <span className="text-slate-400 text-xs">›</span>
                      </button>
                      <button className="w-full rounded-2xl bg-white border border-slate-100 p-3 flex items-center justify-between text-left">
                        <span>Payment methods</span>
                        <span className="text-slate-400 text-xs">›</span>
                      </button>
                      <button
                        onClick={() => {
                          if (userType === 'guest') {
                            setUserType('host');
                            setCurrentView('host-dashboard');
                          } else {
                            setCurrentView('host-dashboard');
                          }
                        }}
                        className="w-full rounded-2xl bg-white border border-slate-100 p-3 flex items-center justify-between text-left"
                      >
                        <span>Host with Cadreago</span>
                        <span className="text-slate-400 text-xs">›</span>
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full rounded-2xl bg-red-50 border border-red-200 p-3 flex items-center justify-center text-red-600 font-medium"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-[13px] text-slate-500 space-y-3">
                      <div className="mx-auto h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center">
                        <User size={32} className="text-slate-400" />
                      </div>
                      <p>Sign in to access your profile.</p>
                      <button
                        onClick={() => setShowAuthModal(true)}
                        className="mt-2 px-4 py-2 rounded-full bg-sky-500 text-white text-[12px] font-medium"
                      >
                        Sign in
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Navigation */}
          <nav className="h-16 bg-white border-t border-slate-200 flex items-center justify-around px-4">
            {[
              { label: "Home", icon: MapPin },
              { label: "Favorites", icon: Heart },
              { label: "Trips", icon: Calendar },
              { label: "Profile", icon: User },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => setActivePage(item.label.toLowerCase())}
                  className={`flex flex-col items-center justify-center gap-0.5 text-[11px] flex-1 ${
                    activePage === item.label.toLowerCase()
                      ? "text-sky-500 font-semibold"
                      : "text-slate-400"
                  }`}
                >
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center mb-0.5 text-[12px] border ${
                      activePage === item.label.toLowerCase()
                        ? "bg-sky-50 border-sky-500"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <Icon size={14} />
                  </div>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    );
  };

  // Conditional rendering based on screen size
  if (isMobile) {
    return (
      <>
        <MobileUI />
        {/* Keep modals accessible */}
        <AuthModal />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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