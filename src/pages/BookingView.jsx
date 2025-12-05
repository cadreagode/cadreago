import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import { Coffee, Plus, Check, Utensils, Wifi, Car, Dumbbell, MapPin, Star, Minus, X, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { DateRangePicker } from '../components/DateRangePicker';
import { GuestPicker } from '../components/GuestPicker';
import { createPayment } from '../services/paymentService';
import { supabase } from '../lib/supabaseClient';

const BookingViewPage = React.memo(({
  selectedHotel,
  searchParams,
  setSearchParams,
  todayIso,
  getNextDayIso,
  getGuestText,
  calculateNights,
  calculateAddonsTotal,
  getAddonBreakdown,
  GST_RATE,
  availableAddons,
  selectedAddons,
  toggleAddon,
  updateAddonQuantity,
  updateAddonPersonCount,
  bookingDateError,
  bookingAvailability,
  showNotification,
  showPaymentForm,
  setShowPaymentForm,
  formatDate,
  handleBookingCheckInChange,
  handleBookingCheckOutChange,
  isLoggedIn,
  setShowAuthModal,
  setAuthMode
}) => {
  const paymentSectionRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [reservationFor, setReservationFor] = React.useState('me');
  const [tripType, setTripType] = React.useState('leisure');
  const [checkInTime, setCheckInTime] = React.useState('');

  // Restore form data after login
  useEffect(() => {
    if (isLoggedIn) {
      const savedData = localStorage.getItem('bookingFormData');
      if (savedData) {
        try {
          const formData = JSON.parse(savedData);

          // Restore form fields
          if (formData.firstName && document.getElementById('first-name')) {
            document.getElementById('first-name').value = formData.firstName;
          }
          if (formData.lastName && document.getElementById('last-name')) {
            document.getElementById('last-name').value = formData.lastName;
          }
          if (formData.email && document.getElementById('email')) {
            document.getElementById('email').value = formData.email;
          }
          if (formData.reservationFor) setReservationFor(formData.reservationFor);
          if (formData.tripType) setTripType(formData.tripType);
          if (formData.checkInTime) setCheckInTime(formData.checkInTime);

          // Clear saved data
          localStorage.removeItem('bookingFormData');

          // Show success notification
          showNotification('success', 'Welcome back! Your booking details have been restored.');
        } catch (error) {
          console.error('Error restoring form data:', error);
        }
      }
    }
  }, [isLoggedIn, showNotification]);

  // Guest change handlers
  const handleAdultsChange = useCallback((newAdults) => {
    setSearchParams(prev => ({ ...prev, adults: newAdults }));
  }, [setSearchParams]);

  const handleChildrenChange = useCallback((newChildren) => {
    setSearchParams(prev => ({ ...prev, children: newChildren }));
  }, [setSearchParams]);

  // Date change wrapper handlers - DateRangePicker passes strings, parent expects event objects
  const handleCheckInChangeWrapper = useCallback((dateString) => {
    console.log('Check-in wrapper called with:', dateString);
    const fakeEvent = { target: { value: dateString || '' } };
    handleBookingCheckInChange(fakeEvent);
  }, [handleBookingCheckInChange]);

  const handleCheckOutChangeWrapper = useCallback((dateString) => {
    console.log('Check-out wrapper called with:', dateString);
    const fakeEvent = { target: { value: dateString || '' } };
    handleBookingCheckOutChange(fakeEvent);
  }, [handleBookingCheckOutChange]);

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

  // Calculate GST based on Indian hotel GST rules
  const { cgst, sgst, totalGst, gstRate } = useMemo(() => {
    const perNightRate = nightlyRate;
    let rate = 0;

    if (perNightRate < 1000) {
      rate = 0; // No GST for rooms below ₹1,000
    } else if (perNightRate >= 1000 && perNightRate <= 7500) {
      rate = 0.12; // 12% GST (6% CGST + 6% SGST)
    } else {
      rate = 0.18; // 18% GST (9% CGST + 9% SGST)
    }

    const totalGstAmount = Math.round(subtotal * rate);
    const halfGst = Math.round(totalGstAmount / 2);

    return {
      cgst: halfGst,
      sgst: halfGst,
      totalGst: totalGstAmount,
      gstRate: rate
    };
  }, [nightlyRate, subtotal]);

  const bookingTotal = subtotal + totalGst;

  const selectedAddonDetails = Object.keys(selectedAddons);
  const addonBreakdown = getAddonBreakdown ? getAddonBreakdown(safeNights) : [];

  const bookingDisabled =
    !!bookingDateError || bookingAvailability.status === 'unavailable';

  // Icon mapping for add-ons
  const getAddonIcon = (addonId) => {
    const iconMap = {
      breakfast: Utensils,
      wifi: Wifi,
      parking: Car,
      spa: Coffee,
      gym: Dumbbell,
    };
    return iconMap[addonId] || Coffee;
  };

  const handleBookingSubmit = useCallback((e) => {
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

    // Check if user is logged in before proceeding to payment
    if (!isLoggedIn) {
      // Save form data to localStorage
      const formData = {
        firstName: document.getElementById('first-name')?.value,
        lastName: document.getElementById('last-name')?.value,
        email: document.getElementById('email')?.value,
        reservationFor,
        tripType,
        checkInTime,
      };
      localStorage.setItem('bookingFormData', JSON.stringify(formData));

      showNotification('error', 'Please login to continue with booking');
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }

    setShowPaymentForm(true);
    setTimeout(() => {
      paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [bookingDisabled, bookingDateError, bookingAvailability.status, showNotification, setShowPaymentForm, isLoggedIn, setAuthMode, setShowAuthModal, reservationFor, tripType, checkInTime]);

  const handlePaymentSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Get guest details from form
      const firstName = document.getElementById('first-name')?.value;
      const lastName = document.getElementById('last-name')?.value;
      const email = document.getElementById('email')?.value;

      // Create payment record in database first
      const paymentData = {
        booking_id: null, // Will be updated after booking is created
        guest_id: user.id,
        amount: bookingTotal,
        currency: currency,
        status: 'pending',
        payment_method: null,
        payment_gateway: 'razorpay',
        transaction_id: null,
      };

      const { data: paymentRecord, error: paymentError } = await createPayment(paymentData);

      if (paymentError) {
        showNotification('error', 'Failed to initialize payment. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Configure Razorpay options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: bookingTotal * 100, // Razorpay expects amount in paise
        currency: currency,
        name: 'Cadreago Hotel Booking',
        description: `Booking at ${selectedHotel.name}`,
        image: selectedHotel.image,
        order_id: '', // You can create order from backend if needed
        handler: async function (response) {
          // Payment successful
          try {
            // Update payment record with transaction ID
            const { error: updateError } = await supabase
              .from('payments')
              .update({
                transaction_id: response.razorpay_payment_id,
                status: 'completed',
                payment_method: 'card', // Razorpay will update this via webhook
              })
              .eq('id', paymentRecord.id);

            if (updateError) throw updateError;

            showNotification('success', 'Payment successful! Your booking is confirmed.');
            // Redirect or show success page
          } catch (error) {
            console.error('Error updating payment:', error);
            showNotification('error', 'Payment completed but failed to update records.');
          }
        },
        prefill: {
          name: `${firstName} ${lastName}`,
          email: email,
          contact: '' // Add phone number field if available
        },
        notes: {
          hotel_id: selectedHotel.id,
          check_in: searchParams.checkIn,
          check_out: searchParams.checkOut,
          guests: totalGuests,
        },
        theme: {
          color: '#3b82f6'
        },
        modal: {
          ondismiss: function() {
            setIsSubmitting(false);
          }
        }
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        // Update payment status to failed
        supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('id', paymentRecord.id);

        showNotification('error', 'Payment failed. Please try again.');
        setIsSubmitting(false);
      });

      razorpay.open();
      setIsSubmitting(false);

    } catch (error) {
      console.error('Payment error:', error);
      showNotification('error', 'Payment initiation failed. Please try again.');
      setIsSubmitting(false);
    }
  }, [showNotification, bookingTotal, currency, selectedHotel, searchParams, totalGuests]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6 shadow-lg border-0">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Complete your booking
                </h2>
                <p className="text-sm text-gray-600">
                  Review your dates and guests, then fill in your details
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 text-sm font-medium">Check-in & Check-out</Label>
                  <DateRangePicker
                    checkIn={searchParams.checkIn}
                    checkOut={searchParams.checkOut}
                    onCheckInChange={handleCheckInChangeWrapper}
                    onCheckOutChange={handleCheckOutChangeWrapper}
                  />
                </div>
                <div>
                  <Label className="mb-2 text-sm font-medium">Guests</Label>
                  <GuestPicker
                    adults={searchParams.adults || 1}
                    children={searchParams.children || 0}
                    onAdultsChange={handleAdultsChange}
                    onChildrenChange={handleChildrenChange}
                  />
                </div>
              </div>

              {bookingDateError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">!</div>
                  <p className="text-sm text-red-700 font-medium">{bookingDateError}</p>
                </div>
              )}
              {!bookingDateError && bookingAvailability.status === 'unavailable' && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">!</div>
                  <p className="text-sm text-red-700 font-medium">
                    Not available for these dates. Please try different dates.
                  </p>
                </div>
              )}
              {!bookingDateError && bookingAvailability.status === 'available' && (
                <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg" role="status">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">✓</div>
                  <p className="text-sm text-emerald-700 font-medium">
                    {bookingAvailability.message}
                  </p>
                </div>
              )}
              {bookingAvailability.status === 'checking' && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg" role="status" aria-live="polite">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  <p className="text-sm text-blue-700">Checking availability…</p>
                </div>
              )}
              {bookingAvailability.status === 'error' && !bookingDateError && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg" role="alert">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">!</div>
                  <p className="text-sm text-amber-700 font-medium">
                    We could not verify availability right now. Please try again.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="space-y-4">
            <Card className="shadow-lg border-0 overflow-hidden">
              {selectedHotel.image && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={selectedHotel.image}
                    alt={selectedHotel.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {selectedHotel.name}
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1" aria-label={`${selectedHotel.stars} star hotel`}>
                    {[...Array(selectedHotel.stars)].map((_, i) => (
                      <Star key={i} size={16} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                    ))}
                  </div>
                  {selectedHotel.rating && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedHotel.rating} / 5
                    </Badge>
                  )}
                </div>
                <div className="flex items-start gap-2 text-gray-600 text-sm mb-4">
                  <MapPin size={16} className="mt-0.5 flex-shrink-0 text-gray-400" />
                  <span>{selectedHotel.location}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedHotel.amenities.slice(0, 6).map((amenity, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-xs"
                    >
                      {amenity}
                    </Badge>
                  ))}
                  {selectedHotel.amenities.length > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{selectedHotel.amenities.length - 6} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl">Guest Information</CardTitle>
                <CardDescription>Please provide your contact details</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleBookingSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">Name</Label>
                      <Input
                        id="first-name"
                        type="text"
                        placeholder="Name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last name</Label>
                      <Input
                        id="last-name"
                        type="text"
                        placeholder="Last name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label>Indicate who the reservation is for</Label>
                      <RadioGroup value={reservationFor} onValueChange={setReservationFor}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="me" id="for-me" />
                          <Label htmlFor="for-me" className="font-normal cursor-pointer">
                            The reservation is for me
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="other" id="for-other" />
                          <Label htmlFor="for-other" className="font-normal cursor-pointer">
                            The reservation is for another person
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <Label>Work or pleasure</Label>
                      <RadioGroup value={tripType} onValueChange={setTripType}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="work" id="trip-work" />
                          <Label htmlFor="trip-work" className="font-normal cursor-pointer">
                            I travel for work
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="leisure" id="trip-leisure" />
                          <Label htmlFor="trip-leisure" className="font-normal cursor-pointer">
                            I travel for leisure
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="check-in-time">Check in time</Label>
                    <Select value={checkInTime} onValueChange={setCheckInTime}>
                      <SelectTrigger id="check-in-time">
                        <SelectValue placeholder="Check in time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12-1">12:00 AM - 1:00 PM</SelectItem>
                        <SelectItem value="1-3">1:00 PM - 3:00 PM</SelectItem>
                        <SelectItem value="3-6">3:00 PM - 6:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableAddons.map((addon) => {
                        const addonData = selectedAddons[addon.id];
                        const quantity = addonData?.quantity || 0;
                        const personCount = addonData?.personCount || Math.max(searchParams.adults, 1);
                        const isSelected = quantity > 0;
                        const IconComponent = getAddonIcon(addon.id);
                        const totalGuests = (searchParams.adults || 1) + (searchParams.children || 0);

                        return (
                          <div
                            key={addon.id}
                            className={`relative border-2 rounded-lg p-4 transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  <IconComponent size={20} aria-hidden="true" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 text-sm">
                                    {addon.name}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {addon.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-sm font-semibold text-gray-900">
                                      {addon.price > 0
                                        ? `₹${addon.price.toLocaleString('en-IN')}${addon.perPerson ? '/person' : ''}`
                                        : 'Included'}
                                    </p>
                                    <Badge variant="secondary" className="text-xs">
                                      {addon.perDay ? 'Per day' : 'One-time'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Person Count Selector for perPerson add-ons */}
                            {isSelected && addon.perPerson && (
                              <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                                <Users size={14} className="text-gray-400" />
                                <span>For:</span>
                                <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-md">
                                  <button
                                    type="button"
                                    onClick={() => updateAddonPersonCount(addon.id, Math.max(1, personCount - 1))}
                                    className="p-1 hover:bg-gray-50 transition-colors"
                                    aria-label="Decrease person count"
                                    disabled={personCount <= 1}
                                  >
                                    <Minus size={12} className="text-gray-600" />
                                  </button>
                                  <span className="text-xs font-medium text-gray-900 min-w-[30px] text-center">
                                    {personCount} {personCount === 1 ? 'person' : 'people'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => updateAddonPersonCount(addon.id, Math.min(totalGuests, personCount + 1))}
                                    className="p-1 hover:bg-gray-50 transition-colors"
                                    aria-label="Increase person count"
                                    disabled={personCount >= totalGuests}
                                  >
                                    <Plus size={12} className="text-gray-600" />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Quantity Controls or Add Button */}
                            <div className="mt-3 flex items-center justify-end gap-2">
                              {!isSelected ? (
                                <button
                                  type="button"
                                  onClick={() => toggleAddon(addon.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                                >
                                  <Plus size={16} />
                                  Add
                                </button>
                              ) : addon.perDay ? (
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-sm font-medium">
                                    <Check size={16} />
                                    Added
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => toggleAddon(addon.id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    aria-label="Remove add-on"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-2 bg-white border-2 border-blue-500 rounded-md">
                                    <button
                                      type="button"
                                      onClick={() => updateAddonQuantity(addon.id, quantity - 1)}
                                      className="p-1.5 hover:bg-blue-50 transition-colors rounded-l-md"
                                      aria-label="Decrease quantity"
                                    >
                                      <Minus size={16} className="text-blue-600" />
                                    </button>
                                    <span className="text-sm font-semibold text-gray-900 min-w-[24px] text-center">
                                      {quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => updateAddonQuantity(addon.id, quantity + 1)}
                                      className="p-1.5 hover:bg-blue-50 transition-colors rounded-r-md"
                                      aria-label="Increase quantity"
                                    >
                                      <Plus size={16} className="text-blue-600" />
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => updateAddonQuantity(addon.id, 0)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    aria-label="Remove add-on"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {selectedAddonDetails.length > 0 && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">
                          {selectedAddonDetails.length} add-on{selectedAddonDetails.length > 1 ? 's' : ''} selected
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-6 mt-4">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Room base price ({safeNights} night(s))</span>
                        <span className="font-semibold text-gray-900">
                          {nightlyRate.toLocaleString('en-IN', {
                            style: 'currency',
                            currency
                          })}{' '}
                          x {safeNights}
                        </span>
                      </div>
                      {addonBreakdown.length > 0 && (
                        <div className="space-y-1.5 pb-2 border-b">
                          <div className="text-sm font-semibold text-gray-700 mb-2">Selected Add-ons:</div>
                          {addonBreakdown.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm text-gray-600 pl-2">
                              <span className="text-xs">{item.displayText}</span>
                              <span className="font-semibold text-gray-900 text-xs">
                                {item.itemTotal.toLocaleString('en-IN', {
                                  style: 'currency',
                                  currency
                                })}
                              </span>
                            </div>
                          ))}
                          <div className="flex justify-between text-sm text-gray-700 font-medium pt-1.5 mt-1.5 border-t">
                            <span>Add-ons Total</span>
                            <span className="font-semibold text-gray-900">
                              {addonsTotal.toLocaleString('en-IN', {
                                style: 'currency',
                                currency
                              })}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Guests</span>
                        <span className="font-semibold text-gray-900">
                          {totalGuests} guest{totalGuests !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 pt-2 border-t">
                        <span>Subtotal (before taxes)</span>
                        <span className="font-semibold text-gray-900">
                          {subtotal.toLocaleString('en-IN', {
                            style: 'currency',
                            currency
                          })}
                        </span>
                      </div>
                      {gstRate > 0 ? (
                        <>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>CGST ({(gstRate * 100 / 2).toFixed(1)}%)</span>
                            <span className="font-semibold text-gray-900">
                              +{cgst.toLocaleString('en-IN', {
                                style: 'currency',
                                currency
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>SGST ({(gstRate * 100 / 2).toFixed(1)}%)</span>
                            <span className="font-semibold text-gray-900">
                              +{sgst.toLocaleString('en-IN', {
                                style: 'currency',
                                currency
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-blue-600 bg-blue-50 p-2 rounded">
                            <span className="font-medium">Total GST ({(gstRate * 100).toFixed(0)}%)</span>
                            <span className="font-semibold">
                              +{totalGst.toLocaleString('en-IN', {
                                style: 'currency',
                                currency
                              })}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between text-sm text-green-600 bg-green-50 p-2 rounded">
                          <span className="font-medium">GST</span>
                          <span className="font-semibold">No GST (Room below ₹1,000)</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t mb-6">
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

                    <Button
                      type="submit"
                      disabled={bookingDisabled}
                      className="w-full"
                      size="lg"
                    >
                      Complete Booking
                    </Button>
                  </div>
                </form>

                {showPaymentForm && (
                  <div
                    ref={paymentSectionRef}
                    className="mt-10 border-t pt-8"
                  >
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Payment
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Your total payable amount is{' '}
                      <span className="font-semibold text-gray-900">
                        {bookingTotal.toLocaleString('en-IN', {
                          style: 'currency',
                          currency
                        })}
                      </span>
                      . Click the button below to proceed with secure payment via Razorpay.
                    </p>
                    <form className="space-y-5" onSubmit={handlePaymentSubmit}>
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-900">
                        <p className="font-semibold mb-1">Secure Payment Gateway</p>
                        <p>
                          You will be redirected to Razorpay&apos;s secure payment gateway.
                          You can pay using Credit/Debit Card, UPI, Net Banking, or Wallets.
                        </p>
                      </div>
                      <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-sm">
                        <ul className="space-y-1 text-green-800">
                          <li>✓ 100% secure and encrypted payment</li>
                          <li>✓ Multiple payment options available</li>
                          <li>✓ Instant booking confirmation</li>
                        </ul>
                      </div>
                      <Button
                        type="submit"
                        variant="success"
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        size="lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
                      </Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
});

BookingViewPage.displayName = 'BookingViewPage';

export default BookingViewPage;
