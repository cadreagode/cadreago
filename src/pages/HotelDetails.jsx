import React from 'react';
import { Star, Share2, Heart, CheckCircle, ThumbsUp, ThumbsDown } from 'lucide-react';

const HotelDetailsPage = ({
  selectedHotel,
  searchParams,
  favorites,
  formatCurrency,
  getRatingColor,
  getRatingBarWidth,
  renderAddonIcon,
  availableAddons,
  onClose,
  onToggleFavorite,
  onShowShare,
  onOpenImageGallery,
  onStartBooking,
  isLoggedIn,
  onOpenHostMessage,
  onRequireLoginAsGuest
}) => {
  if (!selectedHotel) return null;

  const baseNightlyRate = selectedHotel.basePrice || selectedHotel.price || 0;
  const offerNightlyRate =
    selectedHotel.hasOffer &&
    selectedHotel.offerPrice &&
    selectedHotel.offerPrice < baseNightlyRate
      ? selectedHotel.offerPrice
      : null;
  const nightlyRate = offerNightlyRate || baseNightlyRate;
  const currency = selectedHotel.currency || 'INR';

  const addonOptions = (
    selectedHotel.addons && selectedHotel.addons.length > 0
      ? selectedHotel.addons
      : availableAddons || []
  ).map((addon) => ({
    ...addon,
    addonPrice: addon.price || 0,
    addonCurrency: addon.currency || currency
  }));

  const policyDetails = selectedHotel.policyDetails || [
    { title: 'Check-in', description: '3:00 PM onwards with express digital check-in' },
    { title: 'Check-out', description: '11:00 AM - late checkout available on request' },
    {
      title: 'Cancellation',
      description: selectedHotel.freeCancellation
        ? 'Free cancellation up to 72 hours before arrival'
        : 'Cancellation charges may apply'
    },
    {
      title: 'Security deposit',
      description: 'A refundable security deposit of $150 is collected at check-in'
    },
    {
      title: 'ID verification',
      description: 'Government issued ID is required during check-in for all adult guests'
    }
  ];

  const shareUrl = `${window.location.origin}${window.location.pathname}?propertyId=${selectedHotel.id}&checkIn=${searchParams.checkIn}&checkOut=${searchParams.checkOut}&guests=${(searchParams.adults || 0) + (searchParams.children || 0)}`;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button onClick={onClose} className="hover:text-blue-600">Home</button>
          <span>›</span>
          <button onClick={onClose} className="hover:text-blue-600">Search results</button>
          <span>›</span>
          <span className="text-gray-800 font-semibold">{selectedHotel.name}</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start mb-4 md:mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              {selectedHotel.name}
            </h1>
            <div className="flex items-center space-x-1 mb-2">
              {[...Array(selectedHotel.stars)].map((_, i) => (
                <Star key={i} size={16} fill="#000" color="#000" />
              ))}
            </div>
            <p className="text-sm md:text-base text-gray-600">{selectedHotel.address}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onShowShare(shareUrl)}
              className="p-2 md:p-3 rounded-full hover:bg-gray-100 transition-colors"
              title="Share property"
            >
              <Share2 size={24} color="#6b7280" />
            </button>
            <button
              onClick={() => onToggleFavorite(selectedHotel.id)}
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
                onClick={() => onOpenImageGallery(idx)}
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
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                Description
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-4 md:mb-6">
                {selectedHotel.description}
              </p>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Discover curated experiences and thoughtful touches designed to make every stay
                memorable. Enjoy premium linens, 24/7 concierge support, and seamless digital
                check-in for stress-free arrivals.
              </p>
            </section>

            {selectedHotel.services && Object.keys(selectedHotel.services).length > 0 && (
              <section>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                  Services
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {Object.entries(selectedHotel.services).map(([key, value]) =>
                    value && (
                      <div key={key} className="flex items-center space-x-2 md:space-x-3">
                        <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                        <span className="text-sm md:text-base text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

            <section>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  Add-ons &amp; Services
                </h2>
                <span className="text-sm text-blue-600">
                  Customize your stay with host curated extras
                </span>
              </div>
              <div className="space-y-4">
                {addonOptions.map((addon) => (
                  <div
                    key={addon.id}
                    className="border rounded-xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
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
                          <p className="text-xl font-bold text-gray-900">
                            {formatCurrency(addon.addonPrice, addon.addonCurrency)}
                          </p>
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
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  Comments and ratings
                </h2>
                <div
                  className={`px-3 md:px-4 py-1.5 md:py-2 ${getRatingColor(
                    selectedHotel.rating
                  )} text-white rounded-lg font-bold text-lg md:text-xl`}
                >
                  {selectedHotel.rating}
                </div>
              </div>

              <div className="mb-4 md:mb-6">
                <div className="text-base md:text-lg font-semibold mb-2">
                  {selectedHotel.ratingText}
                </div>
                <div className="text-xs md:text-sm text-gray-600">
                  {selectedHotel.reviews || 0} ratings
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                {selectedHotel.reviewScores &&
                  Object.entries(selectedHotel.reviewScores).map(([key, score]) => (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs md:text-sm text-gray-700 capitalize font-medium">
                          {key}
                        </span>
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
                  {selectedHotel.userReviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 md:pb-6">
                      <div className="flex items-start space-x-3 md:space-x-4 mb-3 md:mb-4">
                        <img
                          src={review.avatar}
                          alt={review.name}
                          className="w-10 h-10 md:w-14 md:h-14 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <h4 className="font-semibold text-gray-900 text-sm md:text-lg truncate">
                              {review.name}
                            </h4>
                            <div
                              className={`px-2 md:px-3 py-1 ${getRatingColor(
                                review.rating
                              )} text-white rounded-lg font-bold text-sm shrink-0`}
                            >
                              {review.rating}
                            </div>
                          </div>
                          <div className="text-xs md:text-sm text-gray-500">{review.date}</div>
                        </div>
                      </div>

                      <div className="space-y-2 md:space-y-3 ml-0 sm:ml-14 md:ml-18">
                        <div className="flex items-start space-x-2 md:space-x-3">
                          <ThumbsUp
                            size={16}
                            className="text-green-600 mt-0.5 md:mt-1 flex-shrink-0"
                          />
                          <p className="text-xs md:text-sm text-gray-700">{review.positive}</p>
                        </div>
                        <div className="flex items-start space-x-2 md:space-x-3">
                          <ThumbsDown
                            size={16}
                            className="text-red-600 mt-0.5 md:mt-1 flex-shrink-0"
                          />
                          <p className="text-xs md:text-sm text-gray-700">{review.negative}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                Property policy
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {policyDetails.map((policy, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
                      {policy.title}
                    </h3>
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
                  <div className="mb-2">
                    {offerNightlyRate && (
                      <div className="text-sm text-gray-400 line-through">
                        {formatCurrency(baseNightlyRate, currency)}
                      </div>
                    )}
                    <div
                      className={`text-2xl md:text-3xl lg:text-4xl font-bold ${
                        offerNightlyRate ? 'text-green-600' : 'text-gray-900'
                      }`}
                    >
                      {formatCurrency(nightlyRate, currency)}
                    </div>
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 mb-1">
                    per night (approx.)
                  </div>
                  {offerNightlyRate && (
                    <div className="text-[11px] md:text-xs text-red-600 font-semibold mb-3">
                      Special offer applied on this stay
                    </div>
                  )}
                </div>

                <button
                  onClick={onStartBooking}
                  className="w-full px-4 md:px-6 py-3 md:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-base md:text-lg shadow-md"
                >
                  Book Now
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Secure checkout • Taxes calculated at payment
                </p>
              </div>

              {/* Host Card */}
              {selectedHotel.host && (
                <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Hosted by</h3>
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {selectedHotel.host.full_name?.charAt(0).toUpperCase() || 'H'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-gray-900">{selectedHotel.host.full_name || 'Host'}</h4>
                        {selectedHotel.host.host_info?.verified && (
                          <CheckCircle size={16} className="text-blue-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Member since {selectedHotel.host.host_info?.member_since ? new Date(selectedHotel.host.host_info.member_since).getFullYear() : 'Recently'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedHotel.host.host_info?.total_properties || 1}{' '}
                        {(selectedHotel.host.host_info?.total_properties || 1) === 1 ? 'property' : 'properties'}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    Trusted superhost on Cadreago
                  </p>

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
                        onClick={onOpenHostMessage}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                      >
                        Message Host
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onRequireLoginAsGuest}
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

export default HotelDetailsPage;

