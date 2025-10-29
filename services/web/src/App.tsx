import { useState, lazy, Suspense } from 'react';
import { Toaster } from './components/ui/sonner';
import { SplashScreen } from './components/SplashScreen';
import { mockUser, mockPlaces, mockBookings, mockUserSettings } from './data/mockData';
import { Screen, StudyPlace, TimeSlot, User, UserSettings } from './types';

// Lazy load components to improve initial bundle size
const AuthForm = lazy(() => import('./components/AuthForm').then(module => ({ default: module.AuthForm })));
const HomeScreen = lazy(() => import('./components/HomeScreen').then(module => ({ default: module.HomeScreen })));
const PlaceDetails = lazy(() => import('./components/PlaceDetails').then(module => ({ default: module.PlaceDetails })));
const BookingScreen = lazy(() => import('./components/BookingScreen').then(module => ({ default: module.BookingScreen })));
const ConfirmationScreen = lazy(() => import('./components/ConfirmationScreen').then(module => ({ default: module.ConfirmationScreen })));
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

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [user, setUser] = useState<User | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings>(mockUserSettings);
  const [selectedPlace, setSelectedPlace] = useState<StudyPlace | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [ticketId, setTicketId] = useState<string>('');

  const handleAuth = async (email: string, password: string, name?: string): Promise<void> => {
    
    const newUser = {
      ...mockUser,
      name: name || mockUser.name,
      email: email
    };
    setUser(newUser);
    setCurrentScreen('home');
  };

  const handleThirdPartyAuth = (provider: 'google' | 'apple'): void => {
    const newUser = {
      ...mockUser,
      name: `${provider === 'google' ? 'Google' : 'Apple'} User`,
      email: `user@${provider}.com`,
      avatar: '',
      provider: provider,
      dateJoined: mockUser.createdAt
    };
    setUser(newUser);
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

  const handleConfirmBooking = (place: StudyPlace, slot: TimeSlot) => {
    setSelectedPlace(place);
    setSelectedSlot(slot);
    // Generate a ticket ID
    const newTicketId = `SPOT2GO-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    setTicketId(newTicketId);
    setCurrentScreen('confirmation');
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
    // Map the navigation screens to our Screen type
    switch (screen) {
      case "account":
        setCurrentScreen("account");
        break;
      case "owner/dashboard":
      case "admin/dashboard":
        // For now, these dashboard screens aren't implemented, so we'll stay on home
        // In a real app, you'd add these to your Screen type and implement them
        console.log(`Navigation to ${screen} not yet implemented`);
        break;
      default:
        break;
    }
  };

  const renderScreen = () => {
    const commonProps = { key: currentScreen }; // Force remount on screen change

    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onNavigate={setCurrentScreen} {...commonProps} />;
      
      case 'login':
        return (
          <AuthForm 
            type="login" 
            onSubmit={handleAuth}
            onThirdPartyAuth={handleThirdPartyAuth}
            onBack={() => setCurrentScreen('splash')}
            {...commonProps}
          />
        );
      
      case 'signup':
        return (
          <AuthForm 
            type="signup" 
            onSubmit={handleAuth}
            onThirdPartyAuth={handleThirdPartyAuth}
            onBack={() => setCurrentScreen('splash')}
            {...commonProps}
          />
        );
      
      case 'home':
        return (
          <HomeScreen 
            userName={user?.name || 'User'}
            places={mockPlaces}
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
            onConfirmBooking={handleConfirmBooking}
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
            {...commonProps}
          />
        ) : null;
      
      case 'account':
        return user ? (
          <AccountScreen 
            user={user}
            bookings={mockBookings}
            onBack={() => setCurrentScreen('home')}
            onNavigateToSettings={() => setCurrentScreen('settings')}
            onLogout={() => {
              setUser(null);
              setCurrentScreen('splash');
            }}
            {...commonProps}
          />
        ) : null;
      
      case 'settings':
        return user ? (
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
        ) : null;
      
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