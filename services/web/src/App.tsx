// services/web/src/App.tsx
import { useState, lazy, Suspense } from 'react';
import { Toaster } from './components/ui/sonner';
import { SplashScreen } from './components/SplashScreen';
import { Screen, StudyPlace, TimeSlot, User, UserSettings, Booking, Review } from './types';

// Lazy load components
const AuthForm = lazy(() => import('./components/AuthForm').then(module => ({ default: module.AuthForm })));
const HomeScreen = lazy(() => import('./components/HomeScreen').then(module => ({ default: module.HomeScreen })));
const PlaceDetails = lazy(() => import('./components/PlaceDetails').then(module => ({ default: module.PlaceDetails })));
const BookingScreen = lazy(() => import('./components/BookingScreen').then(module => ({ default: module.BookingScreen })));
const ConfirmationScreen = lazy(() => import('./components/ConfirmationScreen').then(module => ({ default: module.ConfirmationScreen})));
const AccountScreen = lazy(() => import('./components/AccountScreen').then(module => ({ default: module.AccountScreen })));
const SettingsScreen = lazy(() => import('./components/SettingsScreen').then(module => ({ default: module.SettingsScreen })));

// Loading component
const LoadingScreen = () => (
  <div 
    className="min-h-screen flex items-center justify-center"
    style={{ backgroundColor: '#FFF8DC' }}
  >
    <div className="text-center space-y-4">
      <div 
        className="w-16 h-16 rounded-2xl mx-auto animate-spin border-4 border-t-transparent"
        style={{ 
          borderColor: '#DC6B19',
          borderTopColor: 'transparent'
        }}
      />
      <p className="font-semibold" style={{ color: '#6C0345' }}>
        Loading...
      </p>
    </div>
  </div>
);

// --- Default settings object ---
const defaultUserSettings: UserSettings = {
  notifications: {
    pushNotifications: true,
    emailNotifications: true,
    bookingReminders: true,
    promotionalEmails: false,
  },
  privacy: {
    profileVisibility: "public",
    showBookingHistory: true,
    allowLocationTracking: true,
  },
  preferences: {
    theme: "system",
    language: "en",
    currency: "CAD",
    distanceUnit: "km",
  },
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [user, setUser] = useState<User | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(defaultUserSettings); // Use default
  const [selectedPlace, setSelectedPlace] = useState<StudyPlace | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [ticketId, setTicketId] = useState<string>('');
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState('bookings');

  const handleAuth = async (email: string, password: string, name?: string): Promise<void> => {
    // This is a mock login, replace with real API call
    const newUser: User = {
      id: "1",
      name: name || "Test User",
      email: email,
      role: 'customer',
      status: 'active',
      createdAt: new Date().toISOString(),
      dateJoined: new Date().toISOString(),
      settings: defaultUserSettings, // <-- Give new user default settings
    };
    setUser(newUser);
    
    setUserSettings(newUser.settings || defaultUserSettings);
    
    setCurrentScreen('home');
  };

  const handleThirdPartyAuth = (provider: 'google' | 'apple'): void => {
    // This is a mock login, replace with real API call
    const newUser: User = {
      id: "2",
      name: `${provider === 'google' ? 'Google' : 'Apple'} User`,
      email: `user@${provider}.com`,
      avatar: '',
      provider: provider,
      role: 'customer',
      status: 'active',
      createdAt: new Date().toISOString(),
      dateJoined: new Date().toISOString(),
      settings: defaultUserSettings, // <-- Give new user default settings
    };
    setUser(newUser);

    setUserSettings(newUser.settings || defaultUserSettings);
    
    setCurrentScreen('home');
  };

  const handlePlaceSelect = (place: StudyPlace) => {
    setSelectedPlace(place);
    setCurrentScreen('place-details');
  };

  const handleBookNow = (place: StudyPlace) => {
    setSelectedPlace(place);
    setCurrentScreen('booking');
  };

  const handleGoHome = () => {
    setCurrentScreen('home');
    setSelectedPlace(null);
    setSelectedSlot(null);
    setTicketId('');
  };

  const handleUpdateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setUserSettings(newSettings);
  };

  const handleNavigate = (screen: "account" | "owner/dashboard" | "admin/dashboard") => {
    switch (screen) {
      case "account":
        setCurrentScreen("account");
        break;
      case "owner/dashboard":
      case "admin/dashboard":
        console.log(`Navigation to ${screen} not yet implemented`);
        break;
      default:
        break;
    }
  };

  const handleReview = (booking: Booking) => {
    console.log("Reviewing booking:", booking.id);
    alert("Review modal not implemented in mock App.tsx");
  };

  const handleNavigateToPlace = (placeId: string) => {
    console.log("Navigating to place:", placeId);
  };


  const renderScreen = () => {
    const commonProps = { key: currentScreen }; 

    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onNavigate={setCurrentScreen} {...commonProps} />;
      
      case 'login':
        return (
          <AuthForm 
            type="login" 
            onSubmit={handleAuth}
            onThirdPartyAuth={handleThirdPartyAuth}
            {...commonProps}
          />
        );
      
      case 'signup':
        return (
          <AuthForm 
            type="signup" 
            onSubmit={handleAuth}
            onThirdPartyAuth={handleThirdPartyAuth}
            {...commonProps}
          />
        );
      
      case 'home':
        return (
          <HomeScreen 
            userName={user?.name || 'User'}
            places={[]} // <-- Pass empty array
            onPlaceSelect={handlePlaceSelect}
            onNavigate={handleNavigate}
            {...commonProps}
          />
        );
      
      case 'place-details':
        return selectedPlace ? (
          <PlaceDetails 
            place={selectedPlace}
            onBack={() => setCurrentScreen('home')}
            onBookNow={handleBookNow}
            {...commonProps}
          />
        ) : null;
      
      case 'booking':
        return selectedPlace ? (
          <BookingScreen 
            place={selectedPlace}
            onBack={() => setCurrentScreen('place-details')}
            
            {...commonProps}
          />
        ) : null;
      
      case 'confirmation':
      return selectedPlace && selectedSlot ? (
        <ConfirmationScreen 
          place={selectedPlace}
          slot={selectedSlot}
          ticketId={ticketId}
          onGoHome={handleGoHome}
          partySize={1} // Add this - get it from your booking data
          {...commonProps}
        />
      ) : null;
      case 'account':
        return user ? (
          <AccountScreen 
            onNavigateToTicket={function (ticketId: string): void {
              throw new Error('Function not implemented.');
            } } user={user}
            bookings={[]} // <-- Pass empty array
            bookmarkedPlaces={[]}
            onBack={() => setCurrentScreen('home')}
            onNavigateToSettings={() => setCurrentScreen('settings')}
            onLogout={() => {
              setUser(null);
              setCurrentScreen('splash');
            } }
            onReview={handleReview}
            onNavigateToPlace={handleNavigateToPlace}
            {...commonProps}
            reviews={reviews}
            activeTab={activeTab}
            onTabChange={setActiveTab}/>
        ) : null;
      
      case 'settings':
        // SettingsScreen needs a non-null settings object
        return user && userSettings ? (
          <SettingsScreen 
            user={user}
            settings={userSettings}
            onBack={() => setCurrentScreen('account')}
            onUpdateUser={handleUpdateUser}
            onUpdateSettings={handleUpdateSettings}
            onLogout={() => {
              setUser(null);
              setCurrentScreen('splash');
            }}
            {...commonProps}
          />
        ) : null; // Or render loading/error
      
      default:
        return <SplashScreen onNavigate={setCurrentScreen} {...commonProps} />;
    }
  };

  return (
    <div className="size-full">
      <Suspense fallback={<LoadingScreen />}>
        {renderScreen()}
      </Suspense>
      <Toaster />
    </div>
  );
}