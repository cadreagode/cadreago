import React, { useState } from "react";
import { Search, Calendar, Star, MapPin, Heart, Menu, User, ArrowLeft, Wifi, Car, Coffee, Dumbbell } from 'lucide-react';

// Property Details Page Component
const PropertyDetailsPage = ({ property, onBack, favorites = [], handleFavoriteToggle, formatCurrency, isLoggedIn, setShowAuthModal, setSelectedHotel, setCurrentView }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const images = property?.images || [];
  const isFavorite = favorites.includes(property?.id);

  // Calculate distance (placeholder - would come from actual calculation)
  const distance = property?.distance || "2.5 km";

  // Map amenities to icons
  const amenityIcons = {
    'WiFi': Wifi,
    'Parking': Car,
    'Breakfast': Coffee,
    'Gym': Dumbbell,
  };

  const displayAmenities = property?.amenities?.slice(0, 4) || ['WiFi', 'Parking', 'Breakfast', 'Gym'];

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero image with overlay */}
        <div className="relative h-72 bg-slate-200">
          {images.length > 0 && (
            <img
              src={images[imageIndex]}
              alt={property?.name}
              className="w-full h-full object-cover"
            />
          )}

          {/* Back button */}
          <button
            onClick={onBack}
            className="absolute left-4 top-6 h-9 w-9 rounded-full bg-white/90 flex items-center justify-center shadow text-slate-700 backdrop-blur-sm"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Favourite */}
          <button
            onClick={() => {
              if (!isLoggedIn) {
                setShowAuthModal(true);
              } else {
                handleFavoriteToggle(property?.id);
              }
            }}
            className="absolute right-4 top-6 h-9 w-9 rounded-full bg-white/90 flex items-center justify-center shadow backdrop-blur-sm"
          >
            <Heart
              size={18}
              className={isFavorite ? "fill-red-500 text-red-500" : "text-slate-700"}
            />
          </button>

          {/* Small stacked thumbnails */}
          {images.length > 1 && (
            <div className="absolute right-4 bottom-6 flex flex-col gap-2">
              {images.slice(0, 2).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setImageIndex(idx)}
                  className={`h-12 w-12 rounded-2xl shadow overflow-hidden ${
                    imageIndex === idx ? 'ring-2 ring-white' : ''
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
              {images.length > 3 && (
                <div className="h-12 w-12 rounded-2xl bg-white/90 shadow flex items-center justify-center text-[11px] text-slate-600 font-semibold backdrop-blur-sm">
                  {images.length - 2}+
                </div>
              )}
            </div>
          )}

          {/* Title + price overlay */}
          <div className="absolute left-6 bottom-6 text-white drop-shadow-lg">
            <h1 className="text-2xl font-semibold leading-snug">{property?.name}</h1>
            <p className="text-sm mt-1 font-medium">
              {formatCurrency(property?.price_per_night)}/night
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pt-4 pb-24 space-y-6 bg-white">
          {/* Distance + rating cards */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-[13px]">
                <MapPin size={16} className="text-blue-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400">Distance</span>
                <span className="text-sm font-semibold text-slate-900">
                  {distance}
                </span>
              </div>
            </div>
            <div className="flex-1 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400">Rating</span>
                <span className="text-sm font-semibold text-slate-900">
                  {property?.rating || '4.5'}
                </span>
              </div>
            </div>
          </div>

          {/* Location */}
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-900">Location</h2>
            <p className="text-[12px] text-slate-600 flex items-start gap-2">
              <MapPin size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
              {property?.location}
            </p>
          </section>

          {/* What this place offers */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">What this place offers</h2>
            </div>
            <div className="grid grid-cols-4 gap-3 text-center text-[11px] text-slate-600">
              {displayAmenities.map((amenity, idx) => {
                const IconComponent = amenityIcons[amenity] || Wifi;
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center gap-1.5"
                  >
                    <div className="h-11 w-11 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                      <IconComponent size={18} className="text-slate-600" />
                    </div>
                    <span className="text-xs">{amenity}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Property Details */}
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-900">Property details</h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                <p className="text-slate-400 text-[11px]">Type</p>
                <p className="font-semibold text-slate-900 mt-0.5">{property?.type || 'Hotel'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                <p className="text-slate-400 text-[11px]">Guests</p>
                <p className="font-semibold text-slate-900 mt-0.5">{property?.max_guests || 2} guests</p>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-900">Description</h2>
            <p className="text-[12px] leading-relaxed text-slate-600">
              {property?.description ||
                `Experience comfort and luxury at ${property?.name}. Located in ${property?.location}, this beautiful property offers the perfect blend of modern amenities and warm hospitality. Enjoy your stay in our well-appointed rooms with stunning views and excellent service.`
              }
            </p>
          </section>
        </div>
      </div>

      {/* Sticky Book Now button */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center px-6">
        <button
          onClick={() => {
            if (!isLoggedIn) {
              setShowAuthModal(true);
            } else {
              // Pass the selected hotel to the main component and switch to details view
              setSelectedHotel(property);
              setCurrentView('details');
            }
          }}
          className="w-full max-w-xs py-3.5 rounded-full bg-sky-500 text-white text-sm font-semibold shadow-lg active:bg-sky-600"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

// Cadreago Mobile Booking App - Fully Functional
const CadreagoMobileApp = ({
  hotels = [],
  favorites = [],
  user = null,
  isLoggedIn = false,
  searchParams = { destination: '', checkIn: '', checkOut: '', adults: 2, children: 0 },
  userBookingsData = [],
  formatCurrency = (amount) => `₹${amount}`,
  setSearchParams = () => {},
  setSelectedHotel = () => {},
  setCurrentView = () => {},
  handleFavoriteToggle = () => {},
  setShowAuthModal = () => {},
  handleSignOut = () => {},
  setUserType = () => {},
  userType = 'guest'
}) => {
  const [activePage, setActivePage] = useState('home');
  const [selectedProperty, setSelectedProperty] = useState(null);

  // If a property is selected, show the details page
  if (selectedProperty) {
    return (
      <PropertyDetailsPage
        property={selectedProperty}
        onBack={() => setSelectedProperty(null)}
        favorites={favorites}
        handleFavoriteToggle={handleFavoriteToggle}
        formatCurrency={formatCurrency}
        isLoggedIn={isLoggedIn}
        setShowAuthModal={setShowAuthModal}
        setSelectedHotel={setSelectedHotel}
        setCurrentView={setCurrentView}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      {/* PAGES WRAPPER */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* HOME PAGE */}
        {activePage === 'home' && (
          <div className="h-full flex flex-col">
            {/* Header / Location / Profile */}
            <header className="px-4 py-3 flex items-center justify-between bg-white border-b border-slate-200">
              <div className="flex flex-col text-xs">
                <span className="text-slate-400 font-medium">Current location</span>
                <span className="flex items-center gap-1 text-slate-700 font-semibold text-sm">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-500" />
                  {searchParams.destination || 'Kochi, India'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
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
            <main className="flex-1 overflow-y-auto px-4 pb-20 space-y-6">
              {/* Greeting + Search */}
              <section className="space-y-4 pt-4">
                <div>
                  <p className="text-sm text-slate-500">
                    Hello {user?.full_name?.split(' ')[0] || 'Guest'},
                  </p>
                  <h1 className="text-xl font-semibold text-slate-900 leading-snug">
                    Explore beautiful stays with Cadreago
                  </h1>
                </div>

                {/* Search Bar */}
                <div
                  onClick={() => setCurrentView('search')}
                  className="flex items-center gap-2 bg-slate-100 rounded-2xl px-4 py-3 cursor-pointer active:bg-slate-200"
                >
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">Search stays</p>
                    <p className="text-sm text-slate-700 truncate">
                      {searchParams.destination || 'Destination, city, homestay name'}
                    </p>
                  </div>
                  <button className="h-9 w-9 rounded-xl bg-sky-500 flex items-center justify-center text-white">
                    <Search size={18} />
                  </button>
                </div>
              </section>

              {/* City Pills */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900">Explore city</h2>
                  <button className="text-xs text-sky-500 font-medium">Change</button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                  {["Kochi", "Kasaragod", "Bengaluru", "Munnar"].map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSearchParams(prev => ({ ...prev, destination: city }));
                      }}
                      className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap border transition-colors ${
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

              {/* Featured Stays Section (horizontal cards) */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900">Featured Stays</h2>
                  <button
                    onClick={() => setCurrentView('search')}
                    className="text-xs text-sky-500 font-medium"
                  >
                    View all
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar -mx-4 px-4">
                  {hotels.slice(0, 5).map((hotel) => (
                    <article
                      key={hotel.id}
                      onClick={() => {
                        setSelectedProperty(hotel);
                      }}
                      className="min-w-[280px] max-w-[280px] bg-white rounded-2xl shadow-md overflow-hidden flex-shrink-0 border border-slate-100 cursor-pointer"
                    >
                      {/* Image */}
                      <div className="h-40 bg-slate-200 relative">
                        {hotel.images && hotel.images.length > 0 && (
                          <img
                            src={hotel.images[0]}
                            alt={hotel.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-3 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 flex-1">
                            {hotel.name}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavoriteToggle(hotel.id);
                            }}
                            className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm flex-shrink-0"
                          >
                            <Heart
                              size={16}
                              className={favorites.includes(hotel.id) ? "fill-red-500 text-red-500" : "text-slate-400"}
                            />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500">{hotel.location}</p>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-900">
                              {formatCurrency(hotel.price_per_night)}
                              <span className="text-xs text-slate-500 font-normal">
                                /night
                              </span>
                            </span>
                          </div>
                          <div className="text-right text-xs text-slate-500">
                            <p className="font-medium text-slate-800 flex items-center gap-0.5">
                              <Star size={12} className="fill-yellow-400 text-yellow-400" />
                              {hotel.rating || '4.5'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              {/* Other Hotels (vertical list cards) */}
              {hotels.length > 5 && (
                <section className="space-y-3 pb-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-900">Other stays</h2>
                    <button
                      onClick={() => setCurrentView('search')}
                      className="text-xs text-sky-500 font-medium"
                    >
                      View all
                    </button>
                  </div>

                  <div className="space-y-3">
                    {hotels.slice(5, 10).map((hotel) => (
                      <article
                        key={hotel.id}
                        onClick={() => {
                          setSelectedProperty(hotel);
                        }}
                        className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-2.5 shadow-sm cursor-pointer active:bg-slate-100"
                      >
                        <div className="w-20 h-20 rounded-xl bg-slate-200 flex-shrink-0 overflow-hidden">
                          {hotel.images && hotel.images.length > 0 && (
                            <img
                              src={hotel.images[0]}
                              alt={hotel.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between text-xs">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">
                              {hotel.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {hotel.location} • {hotel.max_guests} guests
                            </p>
                          </div>
                          <div className="flex items-end justify-between mt-1">
                            <span className="text-sm font-semibold text-slate-900">
                              {formatCurrency(hotel.price_per_night)}
                              <span className="text-xs text-slate-500 font-normal">
                                /night
                              </span>
                            </span>
                            <div className="flex items-center gap-1 text-xs text-slate-600">
                              <Star size={11} className="fill-yellow-400 text-yellow-400" />
                              <span>{hotel.rating || '4.5'}</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </main>
          </div>
        )}

        {/* FAVORITES PAGE */}
        {activePage === 'favorites' && (
          <div className="h-full flex flex-col bg-slate-50">
            <header className="px-4 py-4 bg-white border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Your Favorites</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Properties you've saved for later
              </p>
            </header>
            {favorites.length === 0 ? (
              <div className="flex-1 flex items-center justify-center px-4">
                <div className="text-center text-sm text-slate-500 space-y-3 max-w-xs">
                  <div className="mx-auto h-20 w-20 rounded-full bg-slate-200 flex items-center justify-center">
                    <Heart size={32} className="text-slate-400" />
                  </div>
                  <p className="font-medium text-slate-700">No favorites yet</p>
                  <p className="text-xs text-slate-400">
                    Start exploring and save your favorite stays.
                  </p>
                  <button
                    onClick={() => setActivePage('home')}
                    className="mt-2 px-6 py-2.5 rounded-full bg-sky-500 text-white text-sm font-medium"
                  >
                    Explore stays
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
                {hotels.filter(h => favorites.includes(h.id)).map((hotel) => (
                  <article
                    key={hotel.id}
                    onClick={() => {
                      setSelectedProperty(hotel);
                    }}
                    className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm cursor-pointer active:bg-slate-50"
                  >
                    <div className="w-24 h-24 rounded-xl bg-slate-200 flex-shrink-0 overflow-hidden">
                      {hotel.images && hotel.images.length > 0 && (
                        <img
                          src={hotel.images[0]}
                          alt={hotel.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between text-xs">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">
                          {hotel.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {hotel.location}
                        </p>
                      </div>
                      <div className="flex items-end justify-between mt-1">
                        <span className="text-sm font-semibold text-slate-900">
                          {formatCurrency(hotel.price_per_night)}
                          <span className="text-xs text-slate-500 font-normal">/night</span>
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <Star size={11} className="fill-yellow-400 text-yellow-400" />
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
          <div className="h-full flex flex-col bg-slate-50">
            <header className="px-4 py-4 bg-white border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Your trips</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isLoggedIn
                  ? "Your upcoming and past bookings"
                  : "Sign in to view your trips"}
              </p>
            </header>
            {!isLoggedIn ? (
              <div className="flex-1 flex items-center justify-center px-4">
                <div className="text-center text-sm text-slate-500 space-y-3 max-w-xs">
                  <div className="mx-auto h-20 w-20 rounded-full bg-slate-200 flex items-center justify-center">
                    <User size={32} className="text-slate-400" />
                  </div>
                  <p className="font-medium text-slate-700">Sign in to view your trips</p>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="mt-2 px-6 py-2.5 rounded-full bg-sky-500 text-white text-sm font-medium"
                  >
                    Sign in
                  </button>
                </div>
              </div>
            ) : userBookingsData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center px-4">
                <div className="text-center text-sm text-slate-500 space-y-3 max-w-xs">
                  <div className="mx-auto h-20 w-20 rounded-full bg-slate-200 flex items-center justify-center">
                    <Calendar size={32} className="text-slate-400" />
                  </div>
                  <p className="font-medium text-slate-700">No trips yet</p>
                  <p className="text-xs text-slate-400">
                    Start exploring to plan your first Cadreago trip.
                  </p>
                  <button
                    onClick={() => setActivePage('home')}
                    className="mt-2 px-6 py-2.5 rounded-full bg-sky-500 text-white text-sm font-medium"
                  >
                    Search stays
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
                {userBookingsData.map((booking) => (
                  <div key={booking.id} className="rounded-2xl bg-white border border-slate-100 p-3 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-xl bg-slate-200 flex-shrink-0 overflow-hidden">
                        {booking.hotel?.images && booking.hotel.images.length > 0 && (
                          <img
                            src={booking.hotel.images[0]}
                            alt={booking.hotel?.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-slate-900">
                          {booking.hotel?.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-medium text-slate-900 mt-1">
                          {formatCurrency(booking.total_amount)}
                        </p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {booking.status}
                        </span>
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
          <div className="h-full flex flex-col bg-slate-50">
            <header className="px-4 py-4 bg-white border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
            </header>
            {isLoggedIn ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
                <div className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-slate-100">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-xl font-semibold text-white">
                    {user?.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">{user?.full_name}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="w-full rounded-xl bg-white border border-slate-100 p-3.5 flex items-center justify-between text-left active:bg-slate-50"
                  >
                    <span className="font-medium text-slate-900">Account settings</span>
                    <span className="text-slate-400 text-lg">›</span>
                  </button>
                  <button className="w-full rounded-xl bg-white border border-slate-100 p-3.5 flex items-center justify-between text-left active:bg-slate-50">
                    <span className="font-medium text-slate-900">Payment methods</span>
                    <span className="text-slate-400 text-lg">›</span>
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
                    className="w-full rounded-xl bg-white border border-slate-100 p-3.5 flex items-center justify-between text-left active:bg-slate-50"
                  >
                    <span className="font-medium text-slate-900">Host with Cadreago</span>
                    <span className="text-slate-400 text-lg">›</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-center justify-center text-red-600 font-semibold active:bg-red-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center px-4">
                <div className="text-center text-sm text-slate-500 space-y-3 max-w-xs">
                  <div className="mx-auto h-20 w-20 rounded-full bg-slate-200 flex items-center justify-center">
                    <User size={32} className="text-slate-400" />
                  </div>
                  <p className="font-medium text-slate-700">Sign in to access your profile</p>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="mt-2 px-6 py-2.5 rounded-full bg-sky-500 text-white text-sm font-medium"
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
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 safe-area-inset-bottom z-50">
        {[
          { label: "Home", icon: MapPin },
          { label: "Favorites", icon: Heart },
          { label: "Trips", icon: Calendar },
          { label: "Profile", icon: User },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.label.toLowerCase();
          return (
            <button
              key={item.label}
              onClick={() => setActivePage(item.label.toLowerCase())}
              className={`flex flex-col items-center justify-center gap-0.5 text-xs flex-1 py-1 ${
                isActive
                  ? "text-sky-500 font-semibold"
                  : "text-slate-400"
              }`}
            >
              <div
                className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                  isActive
                    ? "bg-sky-50"
                    : ""
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default CadreagoMobileApp;
