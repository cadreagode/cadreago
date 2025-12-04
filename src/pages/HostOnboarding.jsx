import React from 'react';

const HostOnboardingPage = ({
  user,
  aadhaar,
  gstRegistered,
  gst,
  bank,
  updateProfile,
  updateHostInfo,
  showNotification,
  setAadhaar,
  setGstRegistered,
  setGst,
  setBank,
  setHostOnboardingCompleted,
  setCurrentView,
  statusBadge
}) => {
  const [personalInfo, setPersonalInfo] = React.useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    phone: '',
    address: ''
  });

  const [aadhaarLocal, setAadhaarLocal] = React.useState(aadhaar);
  const [gstRegisteredLocal, setGstRegisteredLocal] =
    React.useState(gstRegistered);
  const [gstLocal, setGstLocal] = React.useState(gst);
  const [bankLocal, setBankLocal] = React.useState(bank);

  const handleVerification = () => {
    alert(
      'We will verify these details after you save them. For now, please fill in all required information and complete onboarding.'
    );
  };

  const handleCompleteOnboarding = async () => {
    if (!user?.id) return;

    const fullNameParts = [
      personalInfo.firstName,
      personalInfo.lastName
    ].filter(Boolean);
    const fullName = fullNameParts.join(' ').trim();

    try {
      const profileUpdates = {};
      if (fullName) profileUpdates.full_name = fullName;
      if (personalInfo.phone) profileUpdates.phone = personalInfo.phone;

      if (Object.keys(profileUpdates).length > 0) {
        await updateProfile(user.id, profileUpdates);
      }

      const isHostVerified = false;

      const hostInfoPayload = {
        aadhaar_number: aadhaarLocal.number || null,
        aadhaar_status: 'pending',
        gst_registered: gstRegisteredLocal,
        gst_number: gstRegisteredLocal
          ? gstLocal.number || null
          : null,
        gst_status: gstRegisteredLocal ? 'pending' : 'pending',
        bank_account_number: bankLocal.account || null,
        bank_ifsc: bankLocal.ifsc || null,
        bank_status: 'pending',
        onboarding_completed: true,
        verified: isHostVerified
      };

      const { error } = await updateHostInfo(user.id, hostInfoPayload);
      if (error) {
        showNotification(
          'error',
          'We could not save your host details. Please try again.'
        );
        return;
      }

      setAadhaar({ ...aadhaarLocal, status: 'pending' });
      setGstRegistered(gstRegisteredLocal);
      setGst({ ...gstLocal, status: 'pending' });
      setBank({ ...bankLocal, status: 'pending' });

      setHostOnboardingCompleted(true);
      setCurrentView('host-dashboard');
      showNotification(
        'success',
        'Your host account has been created. We will verify your details soon.'
      );
    } catch (err) {
      console.error('Error completing host onboarding:', err);
      showNotification(
        'error',
        'We could not complete your host onboarding. Please try again.'
      );
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Host Onboarding
          </h1>
          <p className="text-gray-600">
            Complete the steps below so we can verify your identity and enable
            payouts.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Personal Details
            </h2>
            <span className="text-xs text-gray-500 uppercase">Step 1</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={personalInfo.firstName}
                onChange={(e) =>
                  setPersonalInfo({
                    ...personalInfo,
                    firstName: e.target.value
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="First name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={personalInfo.lastName}
                onChange={(e) =>
                  setPersonalInfo({
                    ...personalInfo,
                    lastName: e.target.value
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Last name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={personalInfo.phone}
                onChange={(e) =>
                  setPersonalInfo({
                    ...personalInfo,
                    phone: e.target.value
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+91 90000 00000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={personalInfo.address}
                onChange={(e) =>
                  setPersonalInfo({
                    ...personalInfo,
                    address: e.target.value
                  })
                }
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
          <p className="text-sm text-gray-600">
            We’ll use Cashfree KYC APIs to verify your identity securely.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={aadhaarLocal.number}
              onChange={(e) =>
                setAadhaarLocal({
                  ...aadhaarLocal,
                  number: e.target.value
                })
              }
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
            {gstRegisteredLocal ? (
              statusBadge('pending')
            ) : (
              <span className="text-sm text-gray-500">Optional</span>
            )}
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
                onChange={(e) =>
                  setGstLocal({ ...gstLocal, number: e.target.value })
                }
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
            Provide an INR bank account for payouts. We’ll verify account holder
            name using Cashfree Payout APIs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={bankLocal.account}
                onChange={(e) =>
                  setBankLocal({ ...bankLocal, account: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="XXXXXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                value={bankLocal.ifsc}
                onChange={(e) =>
                  setBankLocal({ ...bankLocal, ifsc: e.target.value })
                }
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
          Cashfree will notify you once verifications are complete. You can edit
          these details anytime from your host dashboard.
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            disabled={!canComplete}
            onClick={handleCompleteOnboarding}
            className={`px-6 py-3 rounded-lg font-semibold text-white ${
              canComplete
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Complete Onboarding
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostOnboardingPage;

