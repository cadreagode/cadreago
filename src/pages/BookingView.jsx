import React from 'react';
import { Calendar, Users, CheckCircle, Coffee } from 'lucide-react';

const BookingViewPage = ({
  selectedHotel,
  searchParams,
  todayIso,
  getNextDayIso,
  getGuestText,
  calculateNights,
  calculateAddonsTotal,
  GST_RATE,
  availableAddons,
  selectedAddons,
  bookingDateError,
  bookingAvailability,
  showNotification,
  setShowPaymentForm,
  formatDate,
  handleBookingCheckInChange,
  handleBookingCheckOutChange
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
  const nights = calculateNights(searchParams.checkIn, searchParams.checkOut);
  const safeNights = nights > 0 ? nights : 1;
  const totalGuests = (searchParams.adults || 0) + (searchParams.children || 0);
  const roomBaseAmount = nightlyRate * safeNights;
  const addonsTotal = calculateAddonsTotal(safeNights);
  const subtotal = roomBaseAmount + addonsTotal;
  const gstAmount = Math.round(subtotal * GST_RATE);
  const bookingTotal = subtotal + gstAmount;
  const selectedAddonDetails = availableAddons.filter((addon) =>
    selectedAddons.includes(addon.id)
  );
  const bookingDisabled =
    !!bookingDateError || bookingAvailability.status === 'unavailable';

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (bookingDisabled) {
      if (bookingDateError) {
        showNotification('error', bookingDateError);
      } else if (bookingAvailability.status === 'unavailable') {
        showNotification(
          'error',
          'This stay is not available for the selected dates.'
        );
      }
      return;
    }

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
    alert(
      'Redirecting to the secure payment gateway to complete your booking.'
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Your stay details
              </h2>
              <p className="text-sm text-gray-500">
                Charges may vary based on dates and add-ons.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Check-in
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-3.5 text-gray-400 pointer-events-none"
                    size={18}
                  />
                  <input
                    type="date"
                    value={searchParams.checkIn}
                    onChange={handleBookingCheckInChange}
                    min={todayIso}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Check-out
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-3.5 text-gray-400 pointer-events-none"
                    size={18}
                  />
                  <input
                    type="date"
                    value={searchParams.checkOut}
                    onChange={handleBookingCheckOutChange}
                    min={
                      searchParams.checkIn
                        ? getNextDayIso(searchParams.checkIn)
                        : getNextDayIso(todayIso)
                    }
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Guests
                </label>
                <div className="relative">
                  <Users
                    className="absolute left-3 top-3.5 text-gray-400 pointer-events-none"
                    size={18}
                  />
                  <button
                    type="button"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-left text-gray-700 hover:border-blue-400 transition-colors"
                  >
                    {getGuestText()}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {bookingDateError && (
            <p className="mt-3 text-sm text-red-600">{bookingDateError}</p>
          )}
          {!bookingDateError && bookingAvailability.status === 'unavailable' && (
            <p className="mt-3 text-sm text-red-600">
              Not available for these dates. Please try different dates.
            </p>
          )}
          {!bookingDateError && bookingAvailability.status === 'available' && (
            <p className="mt-3 text-sm text-emerald-700">
              {bookingAvailability.message}
            </p>
          )}
          {bookingAvailability.status === 'checking' && (
            <p className="mt-3 text-sm text-gray-500">Checking availability…</p>
          )}
          {bookingAvailability.status === 'error' && !bookingDateError && (
            <p className="mt-3 text-sm text-amber-600">
              We could not verify availability right now. Please try again.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {selectedHotel.name}
              </h3>
              <div className="flex items-center space-x-1 mb-3">
                {[...Array(selectedHotel.stars)].map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <div className="text-gray-600 text-sm mb-4">
                {selectedHotel.location}
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedHotel.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="font-bold text-gray-900 mb-4">Reserve data</h4>

              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-1">
                    Check-in:
                  </div>
                  <div className="text-gray-900">
                    {formatDate(searchParams.checkIn)}
                  </div>
                  <div className="text-sm text-gray-500">12:00 PM</div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-1">
                    Check-out:
                  </div>
                  <div className="text-gray-900">
                    {formatDate(searchParams.checkOut)}
                  </div>
                  <div className="text-sm text-gray-500">11:00 AM</div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-1">
                    Guests:
                  </div>
                  <div className="text-gray-900">{getGuestText()}</div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-1">
                    Nights:
                  </div>
                  <div className="text-gray-900">
                    {nights > 0
                      ? `${nights} night${nights > 1 ? 's' : ''}`
                      : 'Select valid dates'}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-1">
                    Room:
                  </div>
                  <div className="text-gray-900">
                    {selectedHotel.roomType || 'Premium room with views'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Fill in your details
              </h2>

              <form className="space-y-6" onSubmit={handleBookingSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="Name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last name
                    </label>
                    <input
                      type="text"
                      placeholder="Last name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Indicate who the reservation is for
                    </h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="reservationFor"
                          className="accent-blue-600"
                          defaultChecked
                        />
                        <span className="text-gray-700">
                          The reservation is for me
                        </span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="reservationFor"
                          className="accent-blue-600"
                        />
                        <span className="text-gray-700">
                          The reservation is for another person
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Work or pleasure
                    </h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="tripType"
                          className="accent-blue-600"
                        />
                        <span className="text-gray-700">
                          I travel for work
                        </span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="tripType"
                          className="accent-blue-600"
                          defaultChecked
                        />
                        <span className="text-gray-700">
                          I travel for leisure
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Check in time
                  </h3>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Check in time</option>
                    <option>12:00 AM - 1:00 PM</option>
                    <option>1:00 PM - 3:00 PM</option>
                    <option>3:00 PM - 6:00 PM</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                      Enhance your stay
                    </h3>
                    <span className="text-xs text-gray-500">
                      Choose optional add-ons
                    </span>
                  </div>

                  <div className="space-y-3">
                    {selectedAddonDetails.map((addon) => (
                      <div
                        key={addon.id}
                        className="flex items-center justify-between border rounded-lg p-3"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <Coffee size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {addon.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {addon.description}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {addon.price > 0
                            ? `${addon.price.toLocaleString('en-IN')} ${
                                addon.currency || 'INR'
                              }`
                            : 'Included'}
                        </p>
                      </div>
                    ))}
                    {selectedAddonDetails.length === 0 && (
                      <p className="text-sm text-gray-500">
                        No extra add-ons selected. You can still enjoy our
                        standard inclusions.
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-6 mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Room base price ({safeNights} night(s))</span>
                    <span className="font-semibold text-gray-900">
                      {nightlyRate.toLocaleString('en-IN', {
                        style: 'currency',
                        currency
                      })}{' '}
                      x {safeNights}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Selected add-ons</span>
                    <span className="font-semibold text-gray-900">
                      {addonsTotal.toLocaleString('en-IN', {
                        style: 'currency',
                        currency
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Guests</span>
                    <span className="font-semibold text-gray-900">
                      {totalGuests} guest{totalGuests !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      {subtotal.toLocaleString('en-IN', {
                        style: 'currency',
                        currency
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>GST ({(GST_RATE * 100).toFixed(0)}%)</span>
                    <span className="font-semibold text-gray-900">
                      +
                      {gstAmount.toLocaleString('en-IN', {
                        style: 'currency',
                        currency
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <span className="text-xl font-semibold">Total:</span>
                      <p className="text-sm text-gray-500">
                        Includes taxes and{' '}
                        {selectedAddonDetails.length > 0
                          ? 'selected add-ons'
                          : 'standard inclusions'}
                        . Different dates may show different prices.
                      </p>
                    </div>
                    <span className="text-4xl font-bold text-blue-600">
                      {bookingTotal.toLocaleString('en-IN', {
                        style: 'currency',
                        currency
                      })}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={bookingDisabled}
                    className={`w-full px-6 py-4 rounded-lg transition-colors font-semibold text-lg shadow-lg ${
                      bookingDisabled
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Complete Booking
                  </button>
                </div>
              </form>

              <div
                id="payment-section"
                className="mt-10 border-t pt-8"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Payment Details
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Your total payable amount is{' '}
                  <span className="font-semibold text-gray-900">
                    {bookingTotal.toLocaleString('en-IN', {
                      style: 'currency',
                      currency
                    })}
                  </span>
                  . Enter your payment details to confirm and navigate to the
                  payment gateway.
                </p>
                <form className="space-y-5" onSubmit={handlePaymentSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Name on card"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Month
                      </label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Year
                      </label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
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
                    <p>
                      We will redirect you to your bank&apos;s secure payment
                      gateway to complete your booking.
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="w-full px-6 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-lg shadow-lg"
                  >
                    Pay &amp; Confirm Booking
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingViewPage;

