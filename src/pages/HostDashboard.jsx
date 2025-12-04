import React from 'react';
import {
  MapPin,
  Star,
  Hotel,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  CreditCard,
  RefreshCw,
  Shield,
  Mail
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Sidebar, SidebarContent } from '../components/ui/sidebar';

const HostDashboardPage = ({
  isLoggedIn,
  userType,
  hostOnboardingCompleted,
  onRequireOnboarding,
  user,
  hostProperties,
  aadhaar,
  bank,
  gstRegistered,
  gst,
  updateProfile,
  updateHostInfo,
  showNotification,
  setAadhaar,
  setGstRegistered,
  setGst,
  setBank,
  hostDashboardTab,
  setHostDashboardTab,
  propertyBookings,
  formatDate,
  hostRefunds,
  hostMessages,
  hostPayouts,
  setEditPropertyForm,
  setShowEditPropertyModal,
  setViewPropertyData,
  setShowViewPropertyModal,
  setGalleryPropertyId,
  setShowManageGalleryModal,
  setAddonForm,
  DEFAULT_ADDON_ICON,
  togglePropertyStatus,
  formatCurrency,
  setShowAddPropertyModal,
  setShowAddAddonModal,
  setShowPayoutModal,
  statusBadge,
  onOpenMessages
}) => {
  if (!isLoggedIn || userType !== 'host' || !hostOnboardingCompleted) {
    return onRequireOnboarding();
  }

  const totalProperties = hostProperties.length;
  const totalRevenue = hostProperties.reduce(
    (sum, p) => sum + (p.monthlyRevenue || 0),
    0
  );
  const totalBookings = hostProperties.reduce(
    (sum, p) => sum + (p.totalBookings || 0),
    0
  );
  const avgOccupancy =
    totalProperties > 0
      ? Math.round(
          hostProperties.reduce(
            (sum, p) => sum + (p.occupancyRate || 0),
            0
          ) / totalProperties
        )
      : 0;

  const hostIsVerified =
    (aadhaar?.status || 'pending') === 'verified' &&
    (bank?.status || 'pending') === 'verified';

  const revenueLastMonth = Math.round(totalRevenue * 0.88);
  const revenueYtd = Math.round(totalRevenue * 3.2);

  const getStatusBadge = (status) => {
    const variants = {
      verified: 'success',
      pending: 'warning',
      rejected: 'destructive',
      active: 'success',
      inactive: 'secondary'
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const HostProfileKycForm = () => {
    const [formState, setFormState] = React.useState({
      fullName: user?.name || '',
      phone: '',
      address: '',
      aadhaarNumber: aadhaar?.number || '',
      gstRegistered: gstRegistered,
      gstNumber: gst?.number || '',
      bankAccount: bank?.account || '',
      bankIfsc: bank?.ifsc || ''
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
          gst_number: formState.gstRegistered
            ? formState.gstNumber || null
            : null,
          bank_account_number: formState.bankAccount || null,
          bank_ifsc: formState.bankIfsc || null
        };

        const { error } = await updateHostInfo(user.id, hostInfoPayload);
        if (error) {
          showNotification(
            'error',
            'We could not save your host profile details. Please try again.'
          );
          return;
        }

        setAadhaar((prev) => ({
          ...prev,
          number: formState.aadhaarNumber || ''
        }));
        setGstRegistered(formState.gstRegistered);
        setGst((prev) => ({ ...prev, number: formState.gstNumber || '' }));
        setBank((prev) => ({
          ...prev,
          account: formState.bankAccount || '',
          ifsc: formState.bankIfsc || ''
        }));

        showNotification(
          'success',
          'Host profile and KYC details saved.'
        );
      } catch (err) {
        console.error('Error saving host profile/KYC:', err);
        showNotification(
          'error',
          'We could not save your host profile details. Please try again.'
        );
      }
    };

    return (
      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formState.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formState.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+91 90000 00000"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formState.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="City, State"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Aadhaar KYC</CardTitle>
              {getStatusBadge(aadhaar?.status || 'pending')}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                value={formState.aadhaarNumber}
                onChange={(e) => handleChange('aadhaarNumber', e.target.value)}
                placeholder="Aadhaar Number"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  showNotification(
                    'info',
                    'Aadhaar verification will be enabled in a later step.'
                  )
                }
              >
                Manage Verification (coming soon)
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>GST Details</CardTitle>
              {formState.gstRegistered ? (
                getStatusBadge(gst?.status || 'pending')
              ) : (
                <Badge variant="secondary">Optional</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="gstRegistered"
                checked={formState.gstRegistered}
                onChange={(e) => handleChange('gstRegistered', e.target.checked)}
                className="accent-blue-600"
              />
              <Label htmlFor="gstRegistered">My business is registered under GST</Label>
            </div>
            {formState.gstRegistered && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  value={formState.gstNumber}
                  onChange={(e) => handleChange('gstNumber', e.target.value)}
                  placeholder="GSTIN"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    showNotification(
                      'info',
                      'GST verification will be enabled in a later step.'
                    )
                  }
                >
                  Manage Verification (coming soon)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Bank Account</CardTitle>
              {getStatusBadge(bank?.status || 'pending')}
            </div>
            <CardDescription>
              Provide an INR bank account for payouts. We'll verify account holder
              name using Cashfree Payout APIs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankAccount">Account Number</Label>
                <Input
                  id="bankAccount"
                  value={formState.bankAccount}
                  onChange={(e) => handleChange('bankAccount', e.target.value)}
                  placeholder="XXXXXXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankIfsc">IFSC Code</Label>
                <Input
                  id="bankIfsc"
                  value={formState.bankIfsc}
                  onChange={(e) => handleChange('bankIfsc', e.target.value)}
                  className="uppercase"
                  placeholder="SBIN0000000"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                showNotification(
                  'info',
                  'Bank verification will be enabled in a later step.'
                )
              }
            >
              Manage Verification (coming soon)
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">
            Save Profile &amp; KYC
          </Button>
        </div>
      </form>
    );
  };

  const [activeMessageId, setActiveMessageId] = React.useState(null);
  const [replyText, setReplyText] = React.useState('');

  const unreadHostMessages = hostMessages.filter(
    (m) => m.status === 'unread'
  ).length;

  const pendingBookingsCount = propertyBookings.filter((b) => b.status === 'pending').length;
  const pendingRefundsCount = hostRefunds.filter((r) => r.status === 'pending').length;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Fixed Left Sidebar - Full Height */}
      <div className="w-72 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-gray-900">Host Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your stays</p>
        </div>

        {/* Sidebar Navigation - Scrollable if needed */}
        <div className="flex-1 overflow-y-auto">
          <Tabs
            value={hostDashboardTab}
            onValueChange={(value) => {
              setHostDashboardTab(value);
            }}
            className="w-full h-full"
          >
            <TabsList className="w-full justify-start bg-transparent h-auto px-3 py-4 gap-1 flex flex-col items-stretch">
              {/* Stays section */}
              <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Stays
              </div>
              <TabsTrigger
                value="properties"
                currentValue={hostDashboardTab}
                className="justify-start w-full"
              >
                <Hotel className="mr-2 h-4 w-4" />
                <span>My Properties</span>
              </TabsTrigger>
              <TabsTrigger
                value="bookings"
                currentValue={hostDashboardTab}
                badge={pendingBookingsCount}
                className="justify-start w-full"
              >
                <Calendar className="mr-2 h-4 w-4" />
                <span>Guest Bookings</span>
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                currentValue={hostDashboardTab}
                badge={unreadHostMessages}
                className="justify-start w-full"
              >
                <Mail className="mr-2 h-4 w-4" />
                <span>Messages</span>
              </TabsTrigger>

              {/* Money section */}
              <div className="mt-4 px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Money
              </div>
              <TabsTrigger
                value="revenue"
                currentValue={hostDashboardTab}
                className="justify-start w-full"
              >
                <DollarSign className="mr-2 h-4 w-4" />
                <span>Revenue</span>
              </TabsTrigger>
              <TabsTrigger
                value="refunds"
                currentValue={hostDashboardTab}
                badge={pendingRefundsCount}
                className="justify-start w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                <span>Refunds</span>
              </TabsTrigger>
              <TabsTrigger
                value="payouts"
                currentValue={hostDashboardTab}
                className="justify-start w-full"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Payouts</span>
              </TabsTrigger>

              {/* Account section */}
              <div className="mt-4 px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Account
              </div>
              <TabsTrigger
                value="reviews"
                currentValue={hostDashboardTab}
                className="justify-start w-full"
              >
                <Star className="mr-2 h-4 w-4" />
                <span>Reviews</span>
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                currentValue={hostDashboardTab}
                className="justify-start w-full"
              >
                <Shield className="mr-2 h-4 w-4" />
                <span>Profile &amp; KYC</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Right Content Area - Scrollable */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar with Stats and Actions */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {hostDashboardTab === 'properties' && 'My Properties'}
                {hostDashboardTab === 'bookings' && 'Guest Bookings'}
                {hostDashboardTab === 'messages' && 'Messages'}
                {hostDashboardTab === 'revenue' && 'Revenue Overview'}
                {hostDashboardTab === 'refunds' && 'Refund Requests'}
                {hostDashboardTab === 'payouts' && 'Payouts'}
                {hostDashboardTab === 'reviews' && 'Recent Reviews'}
                {hostDashboardTab === 'profile' && 'Host Profile & KYC'}
              </h2>
            </div>
            {hostDashboardTab === 'properties' && (
              <div className="flex gap-3">
                <Button onClick={() => setShowAddPropertyModal(true)}>
                  + Add Property
                </Button>
              </div>
            )}
            {(hostDashboardTab === 'payouts' || hostDashboardTab === 'properties') && (
              <Button variant="success" onClick={() => setShowPayoutModal(true)}>
                Request Payout
              </Button>
            )}
          </div>

          {/* Stats Cards - Only show on Properties tab */}
          {hostDashboardTab === 'properties' && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Properties</p>
                      <p className="text-2xl font-bold">{totalProperties}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Hotel className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Bookings</p>
                      <p className="text-2xl font-bold">{totalBookings}</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Occupancy</p>
                      <p className="text-2xl font-bold">{avgOccupancy}%</p>
                    </div>
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Alerts */}
        {!hostIsVerified && (
          <div className="px-6 pt-4">
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Verification required before listing properties</AlertTitle>
              <AlertDescription>
                Your Aadhaar KYC and bank account details are saved but not
                verified yet. We'll verify these details and then enable
                property listings and payouts.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {unreadHostMessages > 0 && (
          <div className="px-6 pt-4">
            <div className="px-4 py-2 border rounded-lg bg-blue-50 flex items-center justify-between text-sm text-blue-800">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>
                  You have {unreadHostMessages} new message
                  {unreadHostMessages > 1 ? 's' : ''} from guests.
                </span>
              </div>
              {onOpenMessages && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  onClick={() => onOpenMessages()}
                >
                  View
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className={`flex-1 overflow-y-auto p-6 ${hostDashboardTab === 'messages' ? 'bg-slate-50' : 'bg-gray-50'}`}>
              <TabsContent value="properties" currentValue={hostDashboardTab}>
                <div className="space-y-4">
                    {hostProperties.map((property) => (
                      <Card key={property.id}>
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row gap-4">
                            <img
                              src={property.image}
                              alt={property.name}
                              className="w-full md:w-64 h-48 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900">
                                    {property.name}
                                  </h3>
                                  <p className="text-sm text-gray-600 flex items-center mt-1">
                                    <MapPin size={16} className="mr-1" />
                                    {property.location}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <div className="flex">
                                      {Array.from(
                                        { length: property.stars || 0 },
                                        (_, i) => (
                                          <Star
                                            key={i}
                                            size={16}
                                            fill="#fbbf24"
                                            color="#fbbf24"
                                          />
                                        )
                                      )}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                      • {property.type}
                                    </span>
                                  </div>
                                </div>
                                {getStatusBadge(property.status)}
                              </div>

                              <div className="flex flex-wrap gap-2 mt-3 mb-4">
                                {property.amenities?.map((amenity, idx) => (
                                  <Badge key={idx} variant="secondary">
                                    {amenity}
                                  </Badge>
                                ))}
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4">
                                <div>
                                  <p className="text-gray-500">Rooms</p>
                                  <p className="font-semibold">{property.rooms}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Rating</p>
                                  <p className="font-semibold">
                                    {property.rating} ({property.reviews})
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Base Price</p>
                                  <p className="font-semibold text-green-600">
                                    {formatCurrency(property.basePrice)}/night
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Occupancy</p>
                                  <p className="font-semibold">
                                    {property.occupancyRate}%
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Revenue</p>
                                  <p className="font-semibold text-green-600">
                                    {formatCurrency(property.monthlyRevenue)}/mo
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Button
                                  onClick={() => {
                                    setEditPropertyForm(property);
                                    setShowEditPropertyModal(true);
                                  }}
                                  size="sm"
                                >
                                  Edit Property
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setViewPropertyData(property);
                                    setShowViewPropertyModal(true);
                                  }}
                                >
                                  View Property
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setGalleryPropertyId(property.id);
                                    setShowManageGalleryModal(true);
                                  }}
                                >
                                  Manage Gallery
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
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
                                </Button>
                                <Button
                                  variant={property.status === 'active' ? 'destructive' : 'success'}
                                  size="sm"
                                  onClick={() => {
                                    if (hostIsVerified) {
                                      togglePropertyStatus(property.id);
                                      showNotification(
                                        'success',
                                        `Property ${
                                          property.status === 'active'
                                            ? 'deactivated'
                                            : 'activated'
                                        } successfully!`
                                      );
                                    } else {
                                      showNotification(
                                        'error',
                                        'Please complete KYC and bank verification to activate this listing.'
                                      );
                                    }
                                  }}
                                  disabled={!hostIsVerified}
                                >
                                  {property.status === 'active' ? 'Deactivate' : 'Activate'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
              </TabsContent>

              <TabsContent value="bookings" currentValue={hostDashboardTab}>
                <div className="space-y-4">
                    {propertyBookings.map((booking) => (
                      <Card key={booking.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">
                                {booking.propertyName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Ref: {booking.bookingRef}
                              </p>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                Guest Information
                              </p>
                              <p className="font-semibold">{booking.guestName}</p>
                              <p className="text-sm text-gray-600">
                                {booking.guestEmail}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Room Type</p>
                              <p className="font-semibold">{booking.roomType}</p>
                              <p className="text-sm text-gray-600">
                                {booking.guests}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                            <div>
                              <p className="text-gray-500">Check-in</p>
                              <p className="font-semibold">
                                {formatDate(booking.checkIn)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Check-out</p>
                              <p className="font-semibold">
                                {formatDate(booking.checkOut)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Booking Date</p>
                              <p className="font-semibold">
                                {formatDate(booking.bookingDate)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Total Revenue</p>
                              <p className="font-semibold text-green-600">
                                {formatCurrency(booking.totalPrice || 0)}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {booking.status === 'pending' && (
                              <>
                                <Button size="sm" variant="success">
                                  Confirm Booking
                                </Button>
                                <Button size="sm" variant="outline">
                                  Decline
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline">
                              Contact Guest
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
              </TabsContent>

              <TabsContent value="messages" currentValue={hostDashboardTab}>
                {hostMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">
                      You don&apos;t have any guest messages yet.
                    </p>
                  </div>
                ) : !activeMessageId ? (
                  // Message List View - Like WhatsApp/Messenger
                  <div className="space-y-3">
                    {hostMessages.map((message) => (
                      <Card
                        key={message.id}
                        className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.01] border border-slate-200 bg-white"
                        onClick={() => {
                          setActiveMessageId(message.id);
                          setReplyText('');
                        }}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            {/* Avatar Circle */}
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-600 font-semibold text-lg">
                                {message.guestName.charAt(0).toUpperCase()}
                              </span>
                            </div>

                            {/* Message Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-gray-900 truncate">
                                    {message.guestName}
                                  </h3>
                                  {message.status === 'unread' && (
                                    <Badge variant="destructive" className="text-xs">
                                      New
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {formatDate(message.date)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                {message.propertyName}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {message.preview}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  // Conversation View - Full Thread
                  (() => {
                    const active = hostMessages.find(
                      (m) => m.id === activeMessageId
                    );
                    if (!active) return null;
                    return (
                      <div className="flex flex-col h-full">
                        {/* Conversation Header */}
                        <Card className="mb-4">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setActiveMessageId(null);
                                  setReplyText('');
                                }}
                                className="flex items-center gap-2"
                              >
                                <span className="text-lg">←</span> Back
                              </Button>
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-semibold">
                                  {active.guestName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">
                                  {active.guestName}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {active.propertyName}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Messages Thread */}
                        <Card className="flex-1 flex flex-col">
                          <CardContent className="p-4 flex flex-col h-full">
                            {/* Messages Container */}
                            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                              {(active.messages || []).map((msg) => {
                                const isHost = msg.sender === 'host';
                                return (
                                  <div
                                    key={msg.id}
                                    className={`flex ${
                                      isHost ? 'justify-end' : 'justify-start'
                                    }`}
                                  >
                                    <div
                                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                                        isHost
                                          ? 'bg-blue-600 text-white rounded-br-sm'
                                          : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                                      }`}
                                    >
                                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                      <p className={`mt-1 text-[10px] ${isHost ? 'text-blue-100' : 'text-gray-500'}`}>
                                        {formatDate(msg.timestamp)}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Reply Input */}
                            <div className="border-t pt-4">
                              <div className="space-y-3">
                                <textarea
                                  id="host-reply"
                                  rows={3}
                                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                  placeholder="Type your message..."
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                />
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      if (!replyText.trim()) {
                                        alert('Please enter a message before sending.');
                                        return;
                                      }
                                      alert(
                                        'Message sent to guest (demo only – wire to backend later).'
                                      );
                                      setReplyText('');
                                    }}
                                    className="px-6"
                                  >
                                    Send
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })()
                )}
              </TabsContent>

              <TabsContent value="revenue" currentValue={hostDashboardTab}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground mb-2">This Month</p>
                        <p className="text-3xl font-bold text-green-600">
                          {formatCurrency(totalRevenue)}
                        </p>
                        <p className="text-sm text-green-600 mt-2">
                          ↑ 12% from last month
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground mb-2">Last Month</p>
                        <p className="text-3xl font-bold">
                          {formatCurrency(revenueLastMonth)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground mb-2">Year to Date</p>
                        <p className="text-3xl font-bold">
                          {formatCurrency(revenueYtd)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4 mt-8">
                    Revenue by Property
                  </h3>
                  <div className="space-y-4">
                    {hostProperties.map((property) => {
                      const revenueShare =
                        totalRevenue > 0
                          ? (property.monthlyRevenue || 0) / totalRevenue
                          : 0;
                      const revenueSharePercent = Math.round(revenueShare * 100);
                      return (
                        <Card key={property.id}>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {property.name}
                              </h4>
                              <span className="text-lg font-bold text-green-600">
                                {formatCurrency(property.monthlyRevenue)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${revenueShare * 100}%` }}
                              />
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              {revenueSharePercent}% of total revenue
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
              </TabsContent>

              <TabsContent value="refunds" currentValue={hostDashboardTab}>
                <div className="space-y-4">
                    {hostRefunds.map((refund) => (
                      <Card key={refund.id}>
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                Booking {refund.bookingRef}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {refund.guestName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(refund.date)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-gray-900">
                                {formatCurrency(
                                  refund.amount,
                                  refund.currency || 'INR'
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {refund.method}
                              </p>
                              <div className="mt-2">
                                {getStatusBadge(refund.status)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
              </TabsContent>

              <TabsContent value="payouts" currentValue={hostDashboardTab}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <p className="text-sm text-muted-foreground">
                      Track your payout history and request new transfers.
                    </p>
                    <Button onClick={() => setShowPayoutModal(true)}>
                      Request Payout
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">Total Paid Out</p>
                        <p className="text-3xl font-bold">
                          {formatCurrency(
                            hostPayouts.reduce(
                              (sum, p) => sum + p.amount,
                              0
                            ),
                            'INR'
                          )}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">Pending Payouts</p>
                        <p className="text-3xl font-bold text-yellow-600">
                          {formatCurrency(
                            hostPayouts
                              .filter((p) => p.status !== 'completed')
                              .reduce((sum, p) => sum + p.amount, 0),
                            'INR'
                          )}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">Last Payout</p>
                        <p className="text-3xl font-bold">
                          {formatCurrency(
                            hostPayouts[0]?.amount || 0,
                            hostPayouts[0]?.currency || 'INR'
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {hostPayouts[0]?.date}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="space-y-3">
                    {hostPayouts.map((payout) => (
                      <Card key={payout.id}>
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                              <p className="font-semibold text-gray-900">
                                Reference {payout.reference}
                              </p>
                              <p className="text-sm text-gray-600">{payout.method}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold">
                                {formatCurrency(
                                  payout.amount,
                                  payout.currency || 'INR'
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(payout.date)}
                              </p>
                              <div className="mt-2">
                                {getStatusBadge(payout.status)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
              </TabsContent>

              <TabsContent value="reviews" currentValue={hostDashboardTab}>
                <div className="space-y-4">
                    {hostProperties.slice(0, 2).map((property) => (
                      <Card key={property.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-gray-900">
                                {property.name}
                              </h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="flex">
                                  {Array.from({ length: 5 }, (_, i) => (
                                    <Star
                                      key={i}
                                      size={16}
                                      fill={
                                        i <
                                        Math.floor((property.rating || 0) / 2)
                                          ? '#fbbf24'
                                          : 'none'
                                      }
                                      color="#fbbf24"
                                    />
                                  ))}
                                </div>
                                <span className="text-sm font-semibold">
                                  {property.rating}/10
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  ({property.reviews} reviews)
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 italic">
                            "Excellent property with amazing amenities. The staff was
                            very helpful and the location was perfect!"
                          </p>
                          <div className="flex justify-between items-center mt-3">
                            <p className="text-sm text-muted-foreground">- Guest Review</p>
                            <Button variant="link" size="sm">
                              View All Reviews →
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
              </TabsContent>

              <TabsContent value="profile" currentValue={hostDashboardTab}>
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    Update your personal details and financial information. We'll
                    verify these details before enabling listings and payouts.
                  </p>

                  <HostProfileKycForm />
                </div>
              </TabsContent>
        </div>
      </div>
    </div>
  );
};

export default HostDashboardPage;
