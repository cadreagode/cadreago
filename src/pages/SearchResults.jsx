import React from 'react';
import { Users, X, MapPin, ChevronLeft, ChevronRight, Info, Wifi, Car, Utensils, Waves, Dumbbell, Coffee, Wind, Sparkles, BellRing, Beer } from 'lucide-react';
import GoogleMap from '../components/GoogleMap';
import { Button } from '../components/ui/button';
import { DateRangePicker } from '../components/DateRangePicker';

// Helper function to format distance
const formatDistance = (distanceKm) => {
  if (distanceKm === null || distanceKm === undefined) return null;
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
};

// Helper function to get amenity icon
const getAmenityIcon = (amenityName, size = 16) => {
  const name = amenityName?.toLowerCase() || '';
  const iconProps = { size, className: "flex-shrink-0" };

  if (name.includes('wifi') || name.includes('internet')) return <Wifi {...iconProps} />;
  if (name.includes('parking') || name.includes('car')) return <Car {...iconProps} />;
  if (name.includes('pool') || name.includes('swimming')) return <Waves {...iconProps} />;
  if (name.includes('gym') || name.includes('fitness')) return <Dumbbell {...iconProps} />;
  if (name.includes('breakfast') || name.includes('coffee')) return <Coffee {...iconProps} />;
  if (name.includes('restaurant') || name.includes('dining')) return <Utensils {...iconProps} />;
  if (name.includes('spa') || name.includes('wellness')) return <Sparkles {...iconProps} />;
  if (name.includes('air') || name.includes('ac')) return <Wind {...iconProps} />;
  if (name.includes('room service') || name.includes('service')) return <BellRing {...iconProps} />;
  if (name.includes('bar') || name.includes('drink')) return <Beer {...iconProps} />;

  return null;
};

const SearchResultsPage = ({
  Banner,
  DestinationSearchInput,
  FilterBar,
  filters,
  setFilters,
  searchInputRef,
  destinationInput,
  handleDestinationInputChange,
  handleDestinationInputFocus,
  handleSuggestionsBlur,
  suggestions,
  showSuggestions,
  handleSelectSuggestion,
  locationLoading,
  searchParams,
  setSearchParams,
  todayIso,
  getNextDayIso,
  getGuestText,
  setShowGuestSelector,
  handleSearch,
  showMoreFilters,
  setShowMoreFilters,
  displayedHotels,
  hotelsLoading,
  formatCurrency,
  getRatingColor,
  handleOpenProperty,
  hoveredHotelId,
  setHoveredHotelId,
  mapSelectedHotel,
  setMapSelectedHotel,
  zoomToHotelId,
  setZoomToHotelId,
  mapError,
  mapDirty,
  setMapDirty,
  showMapViewHotels,
  setShowMapViewHotels,
  handleHotelMarkerClick,
  handleHotelMarkerHover,
  handleMapReady,
  handleBoundsChanged,
  radiusFilterKm,
  setRadiusFilterKm,
  searchMetadata = { radiusKm: null, mode: null, searchDestination: null }
}) => {
  const activeMapHotel = mapSelectedHotel;
  const [showFilters, setShowFilters] = React.useState(true);
  const [showDesktopMap, setShowDesktopMap] = React.useState(false);
  const searchBarRef = React.useRef(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      if (window.innerWidth < 1024) return; // Tailwind lg breakpoint

      const header = document.querySelector('header');
      const searchBarEl = searchBarRef.current;
      if (!header || !searchBarEl) return;

      const headerRect = header.getBoundingClientRect();
      const searchRect = searchBarEl.getBoundingClientRect();
      const headerBottom = headerRect.bottom || 0;

      const shouldShow = searchRect.top <= headerBottom + 8;

      if (shouldShow && !showDesktopMap) {
        setShowDesktopMap(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showDesktopMap]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Filter toggle arrow (desktop) */}
      <button
        type="button"
        onClick={() => setShowFilters((prev) => !prev)}
        className="hidden lg:flex fixed left-2 top-24 z-50 w-8 h-12 bg-white border shadow-md rounded-full items-center justify-center"
      >
        {showFilters ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>

      <Banner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <span className="hover:text-blue-600 cursor-default">Home</span>
          <span>›</span>
          <span className="text-gray-800 font-semibold">Search results</span>
        </div>

        {/* Search Bar (sticky on desktop) - Optimized Design */}
        <div
          ref={searchBarRef}
          className="bg-white shadow-lg rounded-xl p-3 md:p-4 mb-4 lg:sticky lg:top-4 lg:z-30 lg:mr-[calc(22rem+0.5rem)] border border-gray-100"
        >
          <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-3">
            {/* Destination Input */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Where</label>
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
                className="text-sm py-2.5 h-[42px] border-gray-300 hover:border-blue-400 transition-colors"
              />
            </div>

            {/* Dates (unified date range picker) */}
            <div className="w-full md:w-auto md:flex-1 md:min-w-[280px] md:max-w-sm">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">When</label>
              <DateRangePicker
                checkIn={searchParams.checkIn}
                checkOut={searchParams.checkOut}
                onCheckInChange={(value) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    checkIn: value
                  }))
                }
                onCheckOutChange={(value) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    checkOut: value
                  }))
                }
              />
            </div>

            {/* Guests Selector */}
            <div className="w-full md:w-44 md:min-w-[176px]">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Who</label>
              <div className="relative">
                <Users
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={16}
                />
                <button
                  type="button"
                  onClick={() => setShowGuestSelector(true)}
                  className="w-full h-[42px] pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left text-sm hover:border-blue-400 transition-colors bg-white overflow-hidden"
                >
                  <span className="text-sm truncate block">{getGuestText()}</span>
                </button>
              </div>
            </div>

            {/* Search button */}
            <div className="w-full md:w-auto md:min-w-[100px]">
              <label className="block text-xs font-medium text-transparent mb-1.5 select-none">.</label>
              <Button
                type="button"
                onClick={handleSearch}
                className="w-full h-[42px] px-5 bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Search Info Banner */}
        {searchMetadata.radiusKm && searchMetadata.searchDestination && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 text-sm text-gray-700">
              {searchMetadata.mode === 'auto-nearest' ? (
                <p>
                  <span className="font-semibold">No properties found within 50 km of {searchMetadata.searchDestination}.</span>
                  {' '}Showing the nearest available property, which is approximately <span className="font-semibold">{searchMetadata.radiusKm.toFixed(1)} km</span> away.
                </p>
              ) : searchMetadata.mode === 'auto-max' && displayedHotels.length > 0 ? (
                (() => {
                  const actualMaxDistance = Math.max(...displayedHotels.map(h => h.distanceKm || 0));
                  return (
                    <p>
                      {actualMaxDistance <= searchMetadata.radiusKm ? (
                        <>
                          Showing properties within <span className="font-semibold">{searchMetadata.radiusKm} km</span> of {searchMetadata.searchDestination}.
                          {' '}Limited properties available in this area.
                        </>
                      ) : (
                        <>
                          <span className="font-semibold">Limited properties near {searchMetadata.searchDestination}.</span>
                          {' '}Showing available properties up to <span className="font-semibold">{actualMaxDistance.toFixed(1)} km</span> away.
                        </>
                      )}
                    </p>
                  );
                })()
              ) : searchMetadata.mode === 'auto-radius' ? (
                <p>
                  Showing properties within <span className="font-semibold">{searchMetadata.radiusKm} km</span> of {searchMetadata.searchDestination}.
                </p>
              ) : null}
            </div>
          </div>
        )}

        {/* Filters + Results layout */}
        <div className="mt-4 flex flex-col lg:flex-row gap-3 lg:gap-2 items-start">
          {/* Vertical filter panel (desktop) */}
          <div
            className={`hidden lg:block transition-all duration-300 ${
              showFilters ? 'w-56 opacity-100' : 'w-10 opacity-0 pointer-events-none'
            }`}
          >
            <div className="sticky top-28 space-y-4">
              <FilterBar />
              {showMoreFilters && (
                <div className="bg-white rounded-lg shadow p-4 grid grid-cols-1 gap-4 text-sm text-gray-700">
                  <div>
                    <p className="font-semibold mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {['Pool', 'Spa', 'WiFi', 'Parking', 'Gym'].map((item) => (
                        <Button
                          key={item}
                          type="button"
                          variant={
                            filters.amenities?.includes(item) ? 'default' : 'outline'
                          }
                          size="sm"
                          className="px-3 py-1 rounded-full border-gray-300 hover:bg-blue-50"
                          onClick={() => {
                            setFilters((prev) => {
                              const current = prev.amenities || [];
                              const exists = current.includes(item);
                              const nextAmenities = exists
                                ? current.filter((a) => a !== item)
                                : [...current, item];
                              return { ...prev, amenities: nextAmenities };
                            });
                          }}
                        >
                          {item}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Distance to city</p>
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
                      value={
                        radiusFilterKm === null || radiusFilterKm === undefined
                          ? 'any'
                          : String(radiusFilterKm)
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === 'any') {
                          setRadiusFilterKm(null);
                        } else {
                          const numeric = Number(value);
                          setRadiusFilterKm(Number.isNaN(numeric) ? null : numeric);
                        }
                      }}
                    >
                      <option value="any">Any distance</option>
                      <option value="1">Within 1 km</option>
                      <option value="3">Within 3 km</option>
                      <option value="5">Within 5 km</option>
                    </select>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Guest rating</p>
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
                      value={filters.rating}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, rating: e.target.value }))
                      }
                    >
                      <option value="all">Any</option>
                      <option value="9">Wonderful: 9+</option>
                      <option value="8">Very good: 8+</option>
                      <option value="7">Good: 7+</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Horizontal filters for mobile / tablet */}
          <div className="w-full lg:hidden mb-6 space-y-4">
            <FilterBar />
            {showMoreFilters && (
              <div className="bg-white rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                <div>
                  <p className="font-semibold mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {['Pool', 'Spa', 'WiFi', 'Parking', 'Gym'].map((item) => (
                      <Button
                        key={item}
                        type="button"
                        variant={
                          filters.amenities?.includes(item) ? 'default' : 'outline'
                        }
                        size="sm"
                        className="px-3 py-1 rounded-full border-gray-300 hover:bg-blue-50"
                        onClick={() => {
                          setFilters((prev) => {
                            const current = prev.amenities || [];
                            const exists = current.includes(item);
                            const nextAmenities = exists
                              ? current.filter((a) => a !== item)
                              : [...current, item];
                            return { ...prev, amenities: nextAmenities };
                          });
                        }}
                      >
                        {item}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-semibold mb-2">Distance to city</p>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={
                      radiusFilterKm === null || radiusFilterKm === undefined
                        ? 'any'
                        : String(radiusFilterKm)
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === 'any') {
                        setRadiusFilterKm(null);
                      } else {
                        const numeric = Number(value);
                        setRadiusFilterKm(Number.isNaN(numeric) ? null : numeric);
                      }
                    }}
                  >
                    <option value="any">Any distance</option>
                    <option value="1">Within 1 km</option>
                    <option value="3">Within 3 km</option>
                    <option value="5">Within 5 km</option>
                  </select>
                </div>
                <div>
                  <p className="font-semibold mb-2">Guest rating</p>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={filters.rating}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, rating: e.target.value }))
                    }
                  >
                    <option value="all">Any</option>
                    <option value="9">Wonderful: 9+</option>
                    <option value="8">Very good: 8+</option>
                    <option value="7">Good: 7+</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Hotel List */}
          <div className="flex-1 space-y-3">
            {hotelsLoading ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                Loading stays...
              </div>
            ) : displayedHotels.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                No stays found for this search.
              </div>
            ) : (
              displayedHotels.map((hotel) => {
                const starCount =
                  hotel.stars ||
                  Math.min(5, Math.round((hotel.rating || 0) / 2));
                const showOffer =
                  hotel.hasOffer &&
                  hotel.basePrice &&
                  hotel.price &&
                  hotel.price < hotel.basePrice;

                return (
                  <div
                    key={hotel.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl hover:scale-[1.01] transition-all duration-200 cursor-pointer border border-transparent hover:border-blue-200"
                    onClick={() => handleOpenProperty(hotel)}
                    onMouseEnter={() => setHoveredHotelId(hotel.id)}
                    onMouseLeave={() => setHoveredHotelId(null)}
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-2/5 relative">
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="w-full h-40 md:h-48 object-cover"
                        />
                        {hotel.ecoFriendly && (
                          <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                            <span className="font-medium">Eco-friendly</span>
                          </div>
                        )}
                      </div>

                      <div className="md:w-3/5 p-3 md:p-4">
                        <div className="flex flex-col md:flex-row justify-between items-start mb-2">
                          <div className="flex-1 mb-3 md:mb-0">
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                              {hotel.name}
                            </h3>
                            <div className="flex items-center space-x-1 mb-1">
                              {starCount > 0 ? (
                                [...Array(starCount)].map((_, i) => (
                                  <span key={i}>★</span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-400">No rating</span>
                              )}
                            </div>
                            <div className="flex items-center text-gray-500 text-xs mb-2">
                              <span>{hotel.location}</span>
                              {hotel.distanceKm && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span className="text-blue-600 font-medium">{formatDistance(hotel.distanceKm)}</span>
                                </>
                              )}
                            </div>
                            {/* Amenities icons */}
                            {hotel.amenities && hotel.amenities.length > 0 && (
                              <div className="flex items-center gap-3 text-gray-600 mt-1">
                                {hotel.amenities.slice(0, 4).map((amenity, idx) => {
                                  const amenityName = typeof amenity === 'string' ? amenity : amenity?.name;
                                  const icon = getAmenityIcon(amenityName, 18);
                                  if (!icon) return null;
                                  return (
                                    <span key={idx} className="flex items-center" title={amenityName}>
                                      {icon}
                                    </span>
                                  );
                                }).filter(Boolean)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-end">
                          <div>
                            {showOffer && (
                              <div className="text-xs text-gray-400 line-through">
                                {formatCurrency(hotel.basePrice, hotel.currency)}
                              </div>
                            )}
                            <div
                              className={`text-xl md:text-2xl font-bold ${
                                showOffer ? 'text-green-600' : 'text-gray-900'
                              }`}
                            >
                              {formatCurrency(hotel.price, hotel.currency)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-600 mb-1">
                              {hotel.ratingText}
                            </div>
                            <div className="text-xs text-gray-500 mb-1">
                              {hotel.reviews} ratings
                            </div>
                            <div
                              className={`inline-flex items-center px-2 py-1 ${getRatingColor(
                                hotel.rating
                              )} text-white rounded font-bold text-sm`}
                            >
                              {hotel.rating}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Map Section – floating on desktop, inline below list on mobile */}
          <div className="mt-4 lg:mt-0 w-full lg:w-[22rem] lg:shrink-0">
            <div
              className={
                `bg-white rounded-lg shadow-md p-2.5 relative lg:fixed lg:right-6 lg:top-20 lg:bottom-6 lg:w-[22rem] lg:z-10 lg:rounded-2xl lg:overflow-hidden lg:bg-slate-100 lg:transition-opacity lg:duration-300` +
                (showDesktopMap ? ' lg:opacity-100 lg:pointer-events-auto' : ' lg:opacity-0 lg:pointer-events-none')
              }
            >
              <div className="flex items-center justify-between mb-2.5 px-0.5">
                <h3 className="text-sm font-semibold text-gray-800">
                  Stays on map
                </h3>
                {mapDirty && (
                  <button
                    onClick={() => {
                      setShowMapViewHotels(true);
                      setMapDirty(false);
                    }}
                    className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                  >
                    Search this area
                  </button>
                )}
              </div>

              <div
                id="cadreago-map-section"
                className="relative rounded-lg overflow-hidden h-[360px] lg:h-full"
              >
              {mapError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-white/80 backdrop-blur z-10">
                  <p className="font-semibold text-gray-900 mb-1">Map unavailable</p>
                  <p className="text-sm text-gray-600">{mapError}</p>
                </div>
              )}

              <GoogleMap
                height="100%"
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

              {/* Property card overlay */}
              {activeMapHotel && (
                <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-2xl overflow-hidden z-30 pointer-events-auto">
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

                  <div className="flex flex-col sm:flex-row">
                    {/* Image Section */}
                    <div className="relative w-full sm:w-36 h-36 flex-shrink-0">
                      <img
                        src={activeMapHotel.image}
                        alt={activeMapHotel.name}
                        className="w-full h-full object-cover"
                      />
                      {activeMapHotel.ecoFriendly && (
                        <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-0.5 rounded text-xs font-medium">
                          Eco-friendly
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-3 pr-8 min-w-0">
                      {/* Header with title and rating */}
                      <div className="flex items-start justify-between mb-1.5 gap-2">
                        <h4 className="text-base font-bold text-gray-900 truncate flex-1 leading-tight">
                          {activeMapHotel.name}
                        </h4>
                        <div
                          className={`px-2 py-0.5 rounded text-white text-sm font-bold flex-shrink-0 ${getRatingColor(
                            activeMapHotel.rating
                          )}`}
                        >
                          {activeMapHotel.rating}
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-center text-xs text-gray-500 mb-1.5">
                        <MapPin size={12} className="mr-1 flex-shrink-0" />
                        <span className="truncate">{activeMapHotel.location}</span>
                        {activeMapHotel.distanceKm && (
                          <span className="ml-1.5 text-blue-600 font-medium flex-shrink-0">
                            • {formatDistance(activeMapHotel.distanceKm)}
                          </span>
                        )}
                      </div>

                      {/* Amenities icons */}
                      {activeMapHotel.amenities && activeMapHotel.amenities.length > 0 && (
                        <div className="flex items-center gap-2.5 text-gray-600 mb-2">
                          {activeMapHotel.amenities.slice(0, 5).map((amenity, idx) => {
                            const amenityName = typeof amenity === 'string' ? amenity : amenity?.name;
                            const icon = getAmenityIcon(amenityName, 16);
                            if (!icon) return null;
                            return (
                              <span key={idx} className="flex items-center" title={amenityName}>
                                {icon}
                              </span>
                            );
                          }).filter(Boolean)}
                        </div>
                      )}

                      {/* Price and CTA */}
                      <div className="flex items-end justify-between gap-3 mt-2">
                        <div className="flex flex-col items-start">
                          {activeMapHotel.hasOffer &&
                            activeMapHotel.basePrice &&
                            activeMapHotel.price < activeMapHotel.basePrice && (
                              <span className="text-xs text-gray-400 line-through leading-tight">
                                {formatCurrency(
                                  activeMapHotel.basePrice,
                                  activeMapHotel.currency
                                )}
                              </span>
                            )}
                          <span
                            className={`text-lg font-bold flex-shrink-0 leading-tight ${
                              activeMapHotel.hasOffer ? 'text-green-600' : 'text-gray-900'
                            }`}
                          >
                            {formatCurrency(
                              activeMapHotel.price,
                              activeMapHotel.currency
                            )}
                          </span>
                        </div>
                        <button
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-semibold flex-shrink-0 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenProperty(activeMapHotel);
                          }}
                        >
                          View & Book
                        </button>
                      </div>
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

export default SearchResultsPage;
