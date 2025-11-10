// services/web/src/pages/account.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { getUserBookings, getBoookmarkedPlaces, getUserReviews } from '../lib/api'; // <-- IMPORTED getUserReviews
import { AccountScreen } from '../components/AccountScreen';
import { toast } from 'sonner';
import { Booking, StudyPlace, Review, User } from '../types';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogCancel,
  AlertDialogDescription,
} from '../components/ui/alert-dialog';
import { ReviewForm } from '../components/ReviewForm'; 
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Star, MapPin } from 'lucide-react';

// --- NEW: Review Card Component ---
// A small component to render the reviews in the new tab
const ReviewItemCard = ({ review, onNavigateToPlace }: { review: Review, onNavigateToPlace: (placeId: string) => void }) => {
  const userName = review.user?.name || 'A User';
  const userInitial = userName ? userName.charAt(0).toUpperCase() : '?';

  return (
    <Card className="bg-white border-brand-yellow w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-brand-burgundy text-brand-cream rounded-full h-8 w-8 flex items-center justify-center font-semibold">
                    {userInitial}
                </div>
                <div>
                    <CardTitle className="text-sm font-semibold text-brand-burgundy">
                        Review for {review.place?.name || 'a place'}
                    </CardTitle>
                    <p className="text-xs text-brand-orange">{new Date(review.date || review.created_at!).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : ''}`} />)}
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-700">{review.comment}</p>
        <Button 
          variant="outline" 
          size="sm"
          className="border-brand-orange text-brand-orange hover:bg-brand-yellow/50"
          onClick={() => onNavigateToPlace(review.place!.id)}
        >
          <MapPin className="h-4 w-4 mr-2" />
          View Place
        </Button>
      </CardContent>
    </Card>
  );
};
// --- END NEW COMPONENT ---


export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookmarkedPlaces, setBookmarkedPlaces] = useState<StudyPlace[]>([]); 
  const [reviews, setReviews] = useState<Review[]>([]); // <-- NEW
  const [loadingData, setLoadingData] = useState(true);
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null); 

  // --- NEW: State for lazy loading ---
  const [activeTab, setActiveTab] = useState('bookings');
  const [hasFetchedBookmarks, setHasFetchedBookmarks] = useState(false);
  const [hasFetchedReviews, setHasFetchedReviews] = useState(false);
  // --- END NEW STATE ---

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

  // --- NEW: Callback for fetching reviews ---
  const fetchUserReviews = useCallback(async () => {
    try {
      const response = await getUserReviews();
      setReviews(response.data);
    } catch (error) {
      toast.error('Could not fetch your reviews.');
      console.error('Failed to fetch reviews:', error);
    }
  }, []);
  // --- END NEW CALLBACK ---

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (user?.role && user.role !== 'customer') {
      toast.error("Access denied.");
      const destination = user.role === 'owner' ? '/owner/dashboard' : '/admin/dashboard';
      router.replace(destination);
      return; 
    }

    // --- MODIFIED: Fetch *only* initial data (bookings) ---
    const fetchInitialData = async () => {
      setLoadingData(true);
      await fetchUserBookings(); // Only fetch bookings on load
      setLoadingData(false);
    };

    fetchInitialData();
    // --- END MODIFICATION ---
  }, [isAuthenticated, authLoading, router, fetchUserBookings, user]);

  // --- NEW: useEffect to handle lazy-loading tabs ---
  useEffect(() => {
    // This runs when the activeTab state changes
    if (activeTab === 'bookmarks' && !hasFetchedBookmarks) {
      fetchBookmarkedPlaces();
      setHasFetchedBookmarks(true);
    }
    
    if (activeTab === 'reviews' && !hasFetchedReviews) {
      fetchUserReviews();
      setHasFetchedReviews(true);
    }
  }, [activeTab, hasFetchedBookmarks, hasFetchedReviews, fetchBookmarkedPlaces, fetchUserReviews]);
  // --- END NEW EFFECT ---

  const handleReviewSubmitted = (newReview: Review) => {
    fetchUserBookings(); 
    setReviewingBooking(null);
    // Add the new review to the state to avoid a full refetch
    setReviews(prev => [newReview, ...prev]);
    setHasFetchedReviews(true); // Mark as fetched
  };

  const handleNavigateToPlace = (placeId: string) => {
    router.push(`/places/${placeId}`);
  };

  // --- THIS IS THE FIX ---
  const handleNavigateToTicket = (ticketId: string) => {
    router.push(`/confirmation?ticketId=${ticketId}`);
  };
  // --- END FIX ---

  if (authLoading || (isAuthenticated && (loadingData || user?.role !== 'customer'))) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF8DC' }}>
        <p className="font-semibold" style={{ color: '#6C0345' }}>Loading Your Account...</p>
      </div>
    );
  }
  
  if (!isAuthenticated || !user) {
      return null;
  }
  
  const userForScreen: User = {
    ...user,
    createdAt: user.createdAt || user.created_at || new Date().toISOString(),
    dateJoined: user.dateJoined || user.createdAt || user.created_at || new Date().toISOString()
  };

  return (
    <>
      <AccountScreen
        user={userForScreen}
        bookings={bookings}
        bookmarkedPlaces={bookmarkedPlaces} 
        onBack={() => router.push('/')}
        onNavigateToSettings={() => router.push('/settings')}
        onLogout={logout}
        onReview={(booking) => setReviewingBooking(booking)} 
        onNavigateToPlace={handleNavigateToPlace}
        onNavigateToTicket={handleNavigateToTicket} // <-- PASS THE NEW PROP
        // --- PASS NEW PROPS ---
        reviews={reviews} // Pass reviews down
        activeTab={activeTab}
        onTabChange={setActiveTab} // Pass the state setter down
        // --- END NEW PROPS ---
      />

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
              user={userForScreen} 
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