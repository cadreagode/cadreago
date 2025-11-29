import React, { useState } from 'react';
import { Search, Calendar, Users, Star, MapPin, Wifi, Car, Utensils, Waves, ThumbsUp, ThumbsDown, Heart, Menu, X, ChevronDown, Filter, CheckCircle, Shield, Coffee, Wind, Dumbbell, Sparkles, Share2, ChevronLeft, ChevronRight, User, Mail, Phone, CreditCard, FileText, Download } from 'lucide-react';

const GST_RATE = 0.12; // 12% Goods and Services Tax applied on bookings

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
  const [searchParams, setSearchParams] = useState({
    destination: 'Miami',
    checkIn: '2025-03-12',
    checkOut: '2025-03-28',
    adults: 2,
    children: 0
  });

  const popularDestinations = [
    'Miami', 'Ibiza', 'New York', 'Paris', 'London', 
    'Tokyo', 'Dubai', 'Barcelona', 'Rome', 'Maldives',
    'Bali', 'Los Angeles', 'Singapore', 'Amsterdam'
  ];

  const filteredDestinations = popularDestinations.filter(dest => 
    dest.toLowerCase().includes(searchParams.destination.toLowerCase())
  );

  // Mock user bookings
  const userBookings = [
    {
      id: 1,
      hotelName: 'Bella Vista Resort',
      location: 'Miami',
      checkIn: '2025-04-15',
      checkOut: '2025-04-20',
      guests: '2 Adults',
      totalPrice: 280,
      status: 'confirmed',
      bookingRef: 'CAD001234',
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      hotelName: 'Island Palace Hotel',
      location: 'Ibiza',
      checkIn: '2025-05-10',
      checkOut: '2025-05-15',
      guests: '2 Adults, 1 Child',
      totalPrice: 900,
      status: 'pending',
      bookingRef: 'CAD001235',
      image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      hotelName: 'Pandora Guesthouse',
      location: 'Miami',
      checkIn: '2025-03-01',
      checkOut: '2025-03-05',
      guests: '2 Adults',
      totalPrice: 480,
      status: 'completed',
      bookingRef: 'CAD001230',
      image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop'
    }
  ];

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

  // Mock payment history
  const paymentHistory = [
    {
      id: 1,
      date: '2025-03-01',
      description: 'Bella Vista Resort - Booking #CAD001234',
      amount: 280,
      status: 'completed',
      method: 'Visa •••• 4242',
      invoiceUrl: '#'
    },
    {
      id: 2,
      date: '2025-02-15',
      description: 'Pandora Guesthouse - Booking #CAD001230',
      amount: 480,
      status: 'completed',
      method: 'Mastercard •••• 8888',
      invoiceUrl: '#'
    },
    {
      id: 3,
      date: '2025-01-20',
      description: 'Island Palace Hotel - Refund',
      amount: -150,
      status: 'refunded',
      method: 'Visa •••• 4242',
      invoiceUrl: '#'
    }
  ];

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

  // Detect screen size
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 360);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  // Authentication functions
  const handleLogin = (email, password, type = 'guest') => {
    // Mock login - in real app, this would call an API
    setUser({
      name: type === 'host' ? 'Hotel Owner' : 'Jane Marie Doe',
      email: email,
      avatar: type === 'host' ? 'HO' : 'JD'
    });
    setIsLoggedIn(true);
    setUserType(type);
    setShowAuthModal(false);
    setCurrentView(type === 'host' ? 'host-dashboard' : 'dashboard'); // Navigate based on user type
  };

  const handleSignup = (name, email, password, type = 'guest') => {
    // Mock signup - in real app, this would call an API
    setUser({
      name: name,
      email: email,
      avatar: name.split(' ').map(n => n[0]).join('')
    });
    setIsLoggedIn(true);
    setUserType(type);
    setShowAuthModal(false);
    setCurrentView(type === 'host' ? 'host-dashboard' : 'dashboard'); // Navigate based on user type
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setUserType('guest');
    setCurrentView('search');
  };
  const [filters, setFilters] = useState({
    priceRange: [0, 500],
    rating: 'all',
    type: 'all',
    amenities: [],
    showMobile: false
  });

  const hotels = [
    {
      id: 1,
      name: 'Bella Vista Resort',
      stars: 3,
      location: 'Miami',
      rating: 7.5,
      ratingText: 'Good',
      reviews: 174,
      price: 56,
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop'
      ],
      amenities: ['Pool', 'Spa', 'Parking', 'WiFi'],
      address: '142, Lorem ipsum dolor sit, MD 02203 - Miami',
      description: 'Experience luxury and comfort at Bella Vista Resort. Our resort offers stunning ocean views, world-class amenities, and exceptional service.',
      services: {
        reception: true,
        tv: true,
        luggage: true,
        restaurant: true,
        bath: true,
        accessibility: true,
        laundry: true,
        cafeBar: true,
        safe: true,
        garden: true
      },
      reviewScores: {
        cleanliness: 8.2,
        location: 8.5,
        transfers: 7.8,
        facilities: 8.0,
        staff: 7.5,
        accessibility: 9.2,
        comfort: 8.3,
        wifi: 8.7,
        foodDrinks: 7.9
      },
      userReviews: [
        {
          id: 1,
          name: 'Lorem ipsum dolor sit',
          date: 'August 9, 2023',
          rating: 9.2,
          avatar: 'https://i.pravatar.cc/150?img=1',
          positive: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi, ratione debitis quis est labore voluptatibus! Eaque cupiditate minima, at placeat totam, magni doloremque veniam neque...',
          negative: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi, ratione debitis quis est labore voluptatibus! Eaque cupiditate minima, at placeat totam, magni doloremque veniam neque...'
        }
      ],
      host: {
        name: 'Maria Rodriguez',
        avatar: 'MR',
        properties: 3,
        memberSince: '2020',
        responseRate: 98,
        responseTime: '1 hour',
        verified: true,
        languages: ['English', 'Spanish'],
        email: 'maria@bellavista.com',
        phone: '+1 (305) 555-0123'
      },
      addons: [
        { id: 'breakfast', name: 'Breakfast', description: 'Continental breakfast for 2', price: 25, icon: 'Coffee' },
        { id: 'airport', name: 'Airport Transfer', description: 'Round trip airport pickup', price: 50, icon: 'Car' },
        { id: 'spa', name: 'Spa Package', description: 'Couples massage & spa access', price: 120, icon: 'Sparkles' },
        { id: 'late-checkout', name: 'Late Checkout', description: 'Checkout until 6 PM', price: 30, icon: 'Calendar' }
      ]
    },
    {
      id: 2,
      name: 'Bambu Indah',
      stars: 3,
      location: 'Miami',
      rating: 6.2,
      ratingText: 'Pleasant',
      reviews: 147,
      price: 170,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop'],
      amenities: ['Pool', 'Parking', 'Elevator', 'WiFi'],
      ecoFriendly: true,
      address: 'Eco resort in Miami',
      description: 'Sustainable luxury at Bambu Indah.',
      services: { reception: true, tv: true },
      reviewScores: { cleanliness: 7.5, location: 8.0 },
      userReviews: [],
      host: {
        name: 'John Smith',
        avatar: 'JS',
        properties: 1,
        memberSince: '2022',
        responseRate: 95,
        responseTime: '2 hours',
        verified: true,
        languages: ['English'],
        email: 'john@bambuindah.com',
        phone: '+1 (305) 555-0456'
      },
      addons: [
        { id: 'breakfast', name: 'Organic Breakfast', description: 'Farm-to-table breakfast', price: 30, icon: 'Coffee' },
        { id: 'bike', name: 'Bike Rental', description: 'Mountain bike for the day', price: 20, icon: 'Wind' },
        { id: 'yoga', name: 'Yoga Session', description: 'Private yoga class', price: 45, icon: 'Dumbbell' }
      ]
    },
    {
      id: 3,
      name: 'Pandora Guesthouse',
      stars: 5,
      location: 'Miami',
      rating: 9.6,
      ratingText: 'Wonderful',
      reviews: 241,
      price: 120,
      image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop'],
      amenities: ['Parking', 'Elevator'],
      ecoFriendly: true,
      address: 'Boutique guesthouse',
      description: 'Charming guesthouse.',
      services: { reception: true },
      reviewScores: { cleanliness: 9.5 },
      userReviews: [],
      host: {
        name: 'Sarah Johnson',
        avatar: 'SJ',
        properties: 5,
        memberSince: '2019',
        responseRate: 100,
        responseTime: '30 minutes',
        verified: true,
        languages: ['English', 'French'],
        email: 'sarah@pandoraguesthouse.com',
        phone: '+1 (305) 555-0789'
      },
      addons: [
        { id: 'breakfast', name: 'Gourmet Breakfast', description: 'Chef-prepared breakfast', price: 35, icon: 'Coffee' },
        { id: 'wine-tasting', name: 'Wine Tasting', description: 'Premium wine selection', price: 60, icon: 'Utensils' },
        { id: 'tour', name: 'City Tour', description: 'Guided city tour', price: 40, icon: 'MapPin' }
      ]
    },
    {
      id: 5,
      name: 'Island Palace Hotel',
      stars: 4,
      location: 'Ibiza',
      rating: 9.2,
      ratingText: 'Wonderful',
      reviews: 241,
      price: 180,
      image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop'],
      amenities: ['Pool', 'Spa', 'Parking', 'Elevator', 'WiFi'],
      limitedDeal: true,
      freeCancellation: true,
      roomsLeft: 1,
      address: 'Beachfront hotel in Ibiza',
      description: 'Stunning island views.',
      services: { reception: true, tv: true },
      reviewScores: { cleanliness: 9.0 },
      userReviews: [],
      host: {
        name: 'Carlos Martinez',
        avatar: 'CM',
        properties: 2,
        memberSince: '2021',
        responseRate: 97,
        responseTime: '1 hour',
        verified: true,
        languages: ['English', 'Spanish', 'Catalan'],
        email: 'carlos@islandpalace.com',
        phone: '+34 555 123 456'
      },
      addons: [
        { id: 'breakfast', name: 'Beachfront Breakfast', description: 'Breakfast with ocean view', price: 28, icon: 'Coffee' },
        { id: 'boat', name: 'Boat Trip', description: 'Private boat excursion', price: 150, icon: 'Waves' },
        { id: 'spa', name: 'Luxury Spa', description: 'Full spa treatment', price: 180, icon: 'Sparkles' },
        { id: 'champagne', name: 'Champagne Package', description: 'Premium champagne on arrival', price: 75, icon: 'Utensils' }
      ]
    }
  ];

  const toggleFavorite = (hotelId) => {
    setFavorites(prev => 
      prev.includes(hotelId) ? prev.filter(id => id !== hotelId) : [...prev, hotelId]
    );
  };

  const getRatingColor = (rating) => {
    if (rating >= 9) return 'bg-emerald-500';
    if (rating >= 8) return 'bg-blue-500';
    if (rating >= 7) return 'bg-cyan-500';
    if (rating >= 6) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getRatingBarWidth = (score) => `${(score / 10) * 100}%`;

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
      userType: 'guest' // guest or host
    });

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
              onClick={() => setFormData({...formData, userType: 'guest'})}
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
              onClick={() => setFormData({...formData, userType: 'host'})}
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
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentView('search')}>
            <span className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`} style={{color: '#2563eb'}}>CADRE</span>
            <Waves className="text-blue-600" size={isMobile ? 20 : 24} />
            <span className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>AGO</span>
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
                  <button className="text-blue-600 hover:text-blue-700 font-medium">List your hotel</button>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">Help</button>
                  <button 
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuthModal(true);
                    }}
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => {
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
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-4 py-3 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                >
                  ➕ List your hotel
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
                    type="text"
                    value={searchParams.destination}
                    onChange={(e) => {
                      setSearchParams({...searchParams, destination: e.target.value});
                      setShowDestinations(true);
                    }}
                    onFocus={() => setShowDestinations(true)}
                    onBlur={() => setTimeout(() => setShowDestinations(false), 200)}
                    placeholder="Where are you going?"
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                  {showDestinations && filteredDestinations.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredDestinations.map((dest, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
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
              onClick={() => setCurrentView('search')}
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

  // Filter Sidebar
  const FilterSidebar = () => (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <h3 className="text-lg font-bold text-gray-800">Filter by:</h3>

      {/* Price */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-3">Price</h4>
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-sm">$</span>
          <input 
            type="number" 
            value={filters.priceRange[0]}
            className="w-20 px-2 py-1 border rounded text-sm"
            onChange={(e) => setFilters({...filters, priceRange: [parseInt(e.target.value), filters.priceRange[1]]})}
          />
        </div>
        <input 
          type="range" 
          min="0" 
          max="500" 
          value={filters.priceRange[1]}
          onChange={(e) => setFilters({...filters, priceRange: [filters.priceRange[0], parseInt(e.target.value)]})}
          className="w-full accent-blue-600"
        />
        <div className="flex space-x-2 mt-3">
          <button className="px-3 py-1.5 text-sm border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors">
            Filter by price
          </button>
          <button className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
            All prices
          </button>
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-3">Rating</h4>
        <div className="space-y-2">
          {[
            { value: '9', label: '9 or more - Wonderful' },
            { value: '8', label: '8 Very good' },
            { value: '7', label: '7 Good' },
            { value: '6', label: '6 Pleasant' },
            { value: 'all', label: 'All' }
          ].map(option => (
            <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="radio" 
                name="rating"
                value={option.value}
                checked={filters.rating === option.value}
                onChange={(e) => setFilters({...filters, rating: e.target.value})}
                className="accent-blue-600"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Type of Stay */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-3">Type of stay</h4>
        <div className="space-y-2">
          {[
            { value: 'hotels', label: 'Hotels' },
            { value: 'resorts', label: 'Resorts' },
            { value: 'guesthouses', label: 'Guesthouses' },
            { value: 'farmstays', label: 'Farm stays' },
            { value: 'apartments', label: 'Apartments' },
            { value: 'all', label: 'All' }
          ].map(option => (
            <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="radio" 
                name="type"
                value={option.value}
                checked={filters.type === option.value}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="accent-blue-600"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
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
                <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-1">${hotel.price}</div>
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
  const SearchResults = () => (
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
                  type="text"
                  value={searchParams.destination}
                  onChange={(e) => {
                    setSearchParams({...searchParams, destination: e.target.value});
                    setShowDestinations(true);
                  }}
                  onFocus={() => setShowDestinations(true)}
                  onBlur={() => setTimeout(() => setShowDestinations(false), 200)}
                  placeholder="Where are you going?"
                  className="w-full pl-10 pr-3 md:pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                />
                {showDestinations && filteredDestinations.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredDestinations.map((dest, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
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
                <Calendar className="absolute left-2 md:left-3 top-2.5 md:top-3.5 text-gray-400 pointer-events-none" size={18} />
                <input 
                  type="date"
                  value={searchParams.checkIn}
                  onChange={(e) => setSearchParams({...searchParams, checkIn: e.target.value})}
                  className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                />
              </div>
            </div>

            {/* Check-out Date */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Check out</label>
              <div className="relative">
                <Calendar className="absolute left-2 md:left-3 top-2.5 md:top-3.5 text-gray-400 pointer-events-none" size={18} />
                <input 
                  type="date"
                  value={searchParams.checkOut}
                  onChange={(e) => setSearchParams({...searchParams, checkOut: e.target.value})}
                  min={searchParams.checkIn}
                  className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
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

          <button className="w-full md:w-auto px-8 md:px-10 py-2.5 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm md:text-base">
            Search
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Filters Sidebar - Hidden on mobile by default, can be toggled */}
          <div className="lg:col-span-1">
            <div className="lg:hidden mb-4">
              <button 
                onClick={() => setFilters({...filters, showMobile: !filters.showMobile})}
                className={`w-full flex items-center justify-center space-x-2 ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'} bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors`}
              >
                <Filter size={isMobile ? 16 : 20} />
                <span>Filters & Sort</span>
              </button>
            </div>
            
            <div className={`${filters.showMobile ? 'block' : 'hidden'} lg:block`}>
              <FilterSidebar />
            </div>
          </div>

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
              {hotels.map(hotel => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Hotel Details
  const HotelDetails = () => {
    if (!selectedHotel) return null;
    const roomOptions = selectedHotel.roomOptions || [
      {
        id: 'standard',
        name: 'Standard Room',
        size: '280 sq ft',
        bed: 'Queen Bed',
        sleeps: 'Sleeps 2',
        perks: ['City view', 'Complimentary WiFi'],
        price: selectedHotel.price
      },
      {
        id: 'deluxe',
        name: 'Deluxe Ocean View',
        size: '360 sq ft',
        bed: 'King Bed',
        sleeps: 'Sleeps 3',
        perks: ['Ocean view', 'Balcony', 'Breakfast included'],
        price: selectedHotel.price + 48
      },
      {
        id: 'suite',
        name: 'Executive Suite',
        size: '520 sq ft',
        bed: 'King Bed + Sofa',
        sleeps: 'Sleeps 4',
        perks: ['Living area', 'Butler service', 'Premium minibar'],
        price: selectedHotel.price + 95
      }
    ];
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

              <section>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Rooms</h2>
                  {selectedHotel.roomsLeft && (
                    <span className="text-sm font-semibold text-red-600">Only {selectedHotel.roomsLeft} room{selectedHotel.roomsLeft > 1 ? 's' : ''} left at this price</span>
                  )}
                </div>
                <div className="space-y-4">
                  {roomOptions.map(room => (
                    <div key={room.id} className="border rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                        <div className="text-sm text-gray-600 mt-1">{room.size} • {room.bed} • {room.sleeps}</div>
                        <ul className="flex flex-wrap gap-2 mt-3 text-xs md:text-sm text-gray-600">
                          {room.perks.map(perk => (
                            <li key={perk} className="px-3 py-1 bg-gray-100 rounded-full">{perk}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">${room.price}</p>
                        <p className="text-xs text-gray-500">per night + taxes</p>
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
                  <div className="text-xs md:text-sm text-gray-600">{selectedHotel.reviews} ratings</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                  {Object.entries(selectedHotel.reviewScores).map(([key, score]) => (
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

                {selectedHotel.userReviews.length > 0 && (
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

                    <div className="space-y-3 mb-4 pb-4 border-b">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Response rate:</span>
                        <span className="font-semibold text-gray-900">{selectedHotel.host.responseRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Response time:</span>
                        <span className="font-semibold text-gray-900">{selectedHotel.host.responseTime}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Languages:</span>
                        <span className="font-semibold text-gray-900">{selectedHotel.host.languages.join(', ')}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <a href={`mailto:${selectedHotel.host.email}`} className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                        <Mail size={16} />
                        <span>{selectedHotel.host.email}</span>
                      </a>
                      <a href={`tel:${selectedHotel.host.phone}`} className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                        <Phone size={16} />
                        <span>{selectedHotel.host.phone}</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Price Card */}
                <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                  <div className="border-t pt-4 md:pt-6">
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">${selectedHotel.price}</div>
                    <div className="text-xs md:text-sm text-gray-600 mb-4">per night</div>
                  </div>

                  <button
                    onClick={() => setCurrentView('booking')}
                    className="w-full px-4 md:px-6 py-3 md:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-base md:text-lg shadow-md"
                  >
                    Book Now
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">Secure checkout • Taxes calculated at payment</p>
                </div>
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
    const addonsTotal = calculateAddonsTotal();
    const subtotal = selectedHotel.price + addonsTotal;
    const gstAmount = +(subtotal * GST_RATE).toFixed(2);
    const bookingTotal = +(subtotal + gstAmount).toFixed(2);
    const selectedAddonDetails = availableAddons.filter(addon => selectedAddons.includes(addon.id));

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

                <form className="space-y-6">
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
                                <div className="font-semibold text-gray-900 text-base flex items-center gap-2">
                                  <span className="text-xl">{addon.icon}</span>
                                  {addon.name}
                                </div>
                                <div className="text-blue-600 font-semibold">
                                  ${addon.price}{addon.perPerson ? ' / guest' : ''}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">{addon.description}</p>
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
                          const addonPrice = addon.price * multiplier;
                          return (
                            <div key={addon.id} className="flex items-center justify-between text-sm text-blue-900">
                              <span>{addon.name}{addon.perPerson ? ` x${multiplier}` : ''}</span>
                              <span className="font-semibold">+${addonPrice}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Room rate</span>
                      <span className="font-semibold text-gray-900">${selectedHotel.price.toFixed(2)}</span>
                    </div>
                    {addonsTotal > 0 && (
                      <div className="flex justify-between text-sm text-blue-700">
                        <span>Add-ons</span>
                        <span className="font-semibold">+${addonsTotal.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>GST ({(GST_RATE * 100).toFixed(0)}%)</span>
                      <span className="font-semibold text-gray-900">+${gstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div>
                        <span className="text-xl font-semibold">Total:</span>
                        <p className="text-sm text-gray-500">
                          Includes taxes and {selectedAddonDetails.length > 0 ? 'selected add-ons' : 'standard inclusions'}
                        </p>
                      </div>
                      <span className="text-4xl font-bold text-blue-600">${bookingTotal.toFixed(2)}</span>
                    </div>

                    <button 
                      type="submit"
                      className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
                    >
                      Complete Booking
                    </button>
                  </div>
                </form>
              </div>
            </div>
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
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl font-bold text-blue-400">CADRE</span>
              <Waves className="text-blue-400" size={24} />
              <span className="text-2xl font-bold">AGO</span>
            </div>
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
              <li><a href="#" className="hover:text-white">List Your Property</a></li>
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

  // Host Dashboard Component
  const HostDashboard = () => {
    if (!isLoggedIn || userType !== 'host') {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Please login as a property owner</h2>
          <button 
            onClick={() => {
              setAuthMode('login');
              setShowAuthModal(true);
            }}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Login as Host
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Host Dashboard</h1>
            <button 
              onClick={() => setShowAddPropertyModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center space-x-2"
            >
              <span>+ Add Property</span>
            </button>
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

                          <div className="flex gap-2">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
                              Edit Property
                            </button>
                            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold">
                              View Stats
                            </button>
                            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold">
                              Manage Rooms
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
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-grow">
        {currentView === 'home' && <HomePage />}
        {currentView === 'search' && <SearchResults />}
        {currentView === 'details' && <HotelDetails />}
        {currentView === 'booking' && <BookingView />}
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'host-dashboard' && <HostDashboard />}
      </div>

      <Footer />
      
      {/* Modals */}
      <GuestSelector show={showGuestSelector} onClose={() => setShowGuestSelector(false)} />
      <AuthModal />
      <ShareModal />
      <ImageGalleryModal />
    </div>
  );
};

export default CadreagoApp;
