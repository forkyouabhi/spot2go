// services/web/src/pages/account.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { getUserBookings, getBoookmarkedPlaces } from '../lib/api'; 
import { AccountScreen } from '../components/AccountScreen';
import { toast } from 'sonner';
import { Booking, StudyPlace, Review, User } from '../types'; // <-- User is imported
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogCancel,
  AlertDialogDescription,
} from '../components/ui/alert-dialog';
import { ReviewForm } from '../components/ReviewForm'; 

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookmarkedPlaces, setBookmarkedPlaces] = useState<StudyPlace[]>([]); 
  const [loadingData, setLoadingData] = useState(true);
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null); 

  const fetchUserBookings = useCallback(async () => {
    try {
      const response = await getUserBookings();
      setBookings(response.data);
    } catch (error) {
      toast.error('Could not fetch your bookings.');
      console.error('Failed to fetch bookings:', error);
    }
  }, []);

  const fetchBookmarkedPlaces = useCallback(async () => {
    try {
      const response = await getBoookmarkedPlaces();
      setBookmarkedPlaces(response.data);
    } catch (error) {
      toast.error('Could not fetch your bookmarks.');
      console.error('Failed to fetch bookmarks:', error);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    const fetchAllData = async () => {
      setLoadingData(true);
      await Promise.all([
        fetchUserBookings(),
        fetchBookmarkedPlaces()
      ]);
      setLoadingData(false);
    };

    fetchAllData();
  }, [isAuthenticated, authLoading, router, fetchUserBookings, fetchBookmarkedPlaces]);

  const handleReviewSubmitted = (newReview: Review) => {
    // Refetch bookings to update the 'reviewed' status
    fetchUserBookings(); 
    setReviewingBooking(null);
  };

  if (authLoading || (isAuthenticated && loadingData)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF8DC' }}>
        <p className="font-semibold" style={{ color: '#6C0345' }}>Loading Your Account...</p>
      </div>
    );
  }
  
  if (!isAuthenticated || !user) {
      return null;
  }
  
  // --- FIX: Handle legacy 'created_at' from token vs 'createdAt' from API/type ---
  // This ensures the user object prop matches the component's expectation
  const userForScreen: User = {
    ...user,
    createdAt: user.createdAt || user.created_at || new Date().toISOString(),
    dateJoined: user.dateJoined || user.createdAt || user.created_at || new Date().toISOString()
  };
  // --- END FIX ---

  return (
    <>
      <AccountScreen
        user={userForScreen} // <-- Pass the correct user object
        bookings={bookings}
        bookmarkedPlaces={bookmarkedPlaces} 
        onBack={() => router.push('/')}
        onNavigateToSettings={() => router.push('/settings')}
        onLogout={logout}
        onReview={(booking) => setReviewingBooking(booking)} 
        onNavigateToPlace={(placeId) => router.push(`/places/${placeId}`)} 
      />

      {/* --- Review Modal --- */}
      <AlertDialog open={!!reviewingBooking} onOpenChange={(open) => !open && setReviewingBooking(null)}>
        <AlertDialogContent className="bg-brand-cream border-brand-orange border-2">
          <AlertDialogHeader>
            <AlertDialogTitle>Leave a Review</AlertDialogTitle>
            <AlertDialogDescription>
              Share your experience for this visit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {reviewingBooking && (
            <ReviewForm
              booking={reviewingBooking}
              user={userForScreen} // <-- FIX: Pass the corrected user object, remove 'as User'
              onReviewSubmitted={handleReviewSubmitted}
            />
          )}
          <AlertDialogCancel className="bg-brand-burgundy/10 border-brand-burgundy/20 text-brand-burgundy">
            Cancel
          </AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}