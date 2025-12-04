import React from 'react';
import { Users, X, MapPin, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import GoogleMap from '../components/GoogleMap';
import { Button } from '../components/ui/button';

const SearchResultsPage = ({
  Banner,
  DestinationSearchInput,
  FilterBar,
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
  handleBoundsChanged
}) => {
  const activeMapHotel = mapSelectedHotel;
  const [showFilters, setShowFilters] = React.useState(true);

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

        {/* Search Bar (sticky on desktop) */}
        <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mb-8 lg:sticky lg:top-4 lg:z-30">
          <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-4">
            {/* Destination Input */}
            <div className="flex-1 min-w-[200px]">
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

            {/* Dates (check-in & check-out combined) */}
            <div className="w-full md:w-64">
              <label className="block text-sm text-gray-600 mb-1">Dates</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none" size={18} />
                  <input
                    type="date"
                    value={searchParams.checkIn}
                    min={todayIso}
                    onChange={(e) =>
                      setSearchParams({
                        ...searchParams,
                        checkIn: e.target.value
                      })
                    }
                    className="w-full pl-8 pr-2 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs md:text-sm"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none" size={18} />
                  <input
                    type="date"
                    value={searchParams.checkOut}
                    min={
                      searchParams.checkIn
                        ? getNextDayIso(searchParams.checkIn)
                        : getNextDayIso(todayIso)
                    }
                    onChange={(e) =>
                      setSearchParams({
                        ...searchParams,
                        checkOut: e.target.value
                      })
                    }
                    className="w-full pl-8 pr-2 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs md:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Guests Selector */}
            <div className="w-full md:w-40">
              <label className="block text-sm text-gray-600 mb-1">Guests</label>
              <div className="relative">
                <Users
                  className="absolute left-2 md:left-3 top-2.5 md:top-3 text-gray-400 pointer-events-none"
                  size={18}
                />
                <button
                  type="button"
                  onClick={() => setShowGuestSelector(true)}
                  className="w-full pl-8 md:pl-9 pr-3 md:pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-left text-sm md:text-base hover:border-blue-400 transition-colors"
                >
                  {getGuestText()}
                </button>
              </div>
            </div>

            {/* Search button */}
            <div className="w-full md:w-auto">
              <Button
                type="button"
                onClick={handleSearch}
                className="w-full md:h-[42px] px-6 bg-blue-600 text-white hover:bg-blue-700 text-sm md:text-base font-semibold"
              >
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Filters + Results layout */}
        <div className="mt-4 flex flex-col lg:flex-row gap-4 items-start">
          {/* Vertical filter panel (desktop) */}
          <div
            className={`hidden lg:block transition-all duration-300 ${
              showFilters ? 'w-64 opacity-100' : 'w-10 opacity-0 pointer-events-none'
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
                          variant="outline"
                          size="sm"
                          className="px-3 py-1 rounded-full border-gray-300 hover:bg-blue-50"
                        >
                          {item}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Distance to city</p>
                    <select className="w-full px-3 py-2 border rounded-lg">
                      <option>Any distance</option>
                      <option>Within 1 km</option>
                      <option>Within 3 km</option>
                      <option>Within 5 km</option>
                    </select>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Guest rating</p>
                    <select className="w-full px-3 py-2 border rounded-lg">
                      <option>Any</option>
                      <option>Wonderful: 9+</option>
                      <option>Very good: 8+</option>
                      <option>Good: 7+</option>
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
                        variant="outline"
                        size="sm"
                        className="px-3 py-1 rounded-full border-gray-300 hover:bg-blue-50"
                      >
                        {item}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-semibold mb-2">Distance to city</p>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option>Any distance</option>
                    <option>Within 1 km</option>
                    <option>Within 3 km</option>
                    <option>Within 5 km</option>
                  </select>
                </div>
                <div>
                  <p className="font-semibold mb-2">Guest rating</p>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option>Any</option>
                    <option>Wonderful: 9+</option>
                    <option>Very good: 8+</option>
                    <option>Good: 7+</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Hotel List */}
          <div className="flex-1 space-y-4">
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
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
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
                            </div>
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
          
          {/* Map Section – sticky on desktop, inline below list on mobile */}
          <div className="mt-6 lg:mt-0 w-full lg:w-[32vw] lg:shrink-0">
            <div className="bg-white rounded-lg shadow-md p-4 relative lg:rounded-2xl lg:overflow-hidden lg:bg-slate-100 lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-3">
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
              className="relative rounded-lg overflow-hidden h-[360px] lg:h-[420px]"
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
                      <h4 className="text-lg font-semibold text-gray-900 truncate flex-1">
                        {activeMapHotel.name}
                      </h4>
                      <div
                        className={`px-2 py-1 rounded text-white text-sm flex-shrink-0 ${getRatingColor(
                          activeMapHotel.rating
                        )}`}
                      >
                        {activeMapHotel.rating}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-2 flex items-center">
                      <MapPin size={14} className="mr-1 flex-shrink-0" />
                      <span className="truncate">{activeMapHotel.location}</span>
                    </p>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {activeMapHotel.description}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col items-start">
                        {activeMapHotel.hasOffer &&
                          activeMapHotel.basePrice &&
                          activeMapHotel.price <
                            activeMapHotel.basePrice && (
                            <span className="text-xs text-gray-400 line-through">
                              {formatCurrency(
                                activeMapHotel.basePrice,
                                activeMapHotel.currency
                              )}
                            </span>
                          )}
                        <span
                          className={`text-xl font-bold flex-shrink-0 ${
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
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenProperty(activeMapHotel);
                        }}
                      >
                        View &amp; Book
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

export default SearchResultsPage;
