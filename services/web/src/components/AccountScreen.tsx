import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { 
  User, Calendar, Star, Settings, LogOut, 
  Bell, Shield, ArrowLeft, Utensils, Clock, Edit3, Ticket, 
  Loader2, Users, DollarSign, ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { getUserBookings, getUserReviews, createReview } from '../lib/api';
import { Booking, Review, StudyPlace } from '../types';

// Extended Booking type to handle amount safely
interface ExtendedBooking extends Booking {
  amount?: string | number;
}

// --- HELPER: Fix broken/JSON image strings ---
const getPlaceImage = (place: StudyPlace | undefined) => {
  if (!place) return null;
  let imageSrc = '';

  // 1. Handle JSON string from DB (e.g., "['uploads/img.jpg']")
  if (typeof place.images === 'string') {
      try {
          const parsed = JSON.parse(place.images);
          if (Array.isArray(parsed) && parsed.length > 0) {
             imageSrc = parsed[0];
          } else {
             imageSrc = place.images; 
          }
      } catch (e) {
          // If parse fails, assume it is a raw string URL
          imageSrc = place.images; 
      }
  } 
  // 2. Handle Standard Array
  else if (Array.isArray(place.images) && place.images.length > 0) {
      imageSrc = place.images[0];
  }

  // 3. Fallback if empty
  if (!imageSrc) return null;

  // 4. Fix Relative URLs (prepend API URL for local uploads)
  if (!imageSrc.startsWith('http') && !imageSrc.startsWith('data:')) {
       const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
       // Ensure we don't double slash
       const cleanPath = imageSrc.startsWith('/') ? imageSrc : `/${imageSrc}`;
       return `${apiUrl}${cleanPath}`;
  }
  
  return imageSrc;
};

export default function AccountScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [bookings, setBookings] = useState<ExtendedBooking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<ExtendedBooking | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchData = async () => {
    try {
      const [bookingsRes, reviewsRes] = await Promise.all([
        getUserBookings(),
        getUserReviews()
      ]);
      setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
      setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
    } catch (error) {
      console.error("Failed to fetch account data:", error);
      toast.error("Could not load your profile data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedBooking) return;
    setSubmittingReview(true);
    try {
        await createReview({
            placeId: selectedBooking.placeId,
            bookingId: selectedBooking.id,
            rating,
            comment
        });
        toast.success("Review submitted successfully!");
        setReviewModalOpen(false);
        fetchData(); // Refresh list
    } catch (error: any) {
        toast.error(error.response?.data?.error || "Failed to submit review.");
    } finally {
        setSubmittingReview(false);
    }
  };

  const openReviewModal = (booking: ExtendedBooking) => {
      setSelectedBooking(booking);
      setRating(5);
      setComment('');
      setReviewModalOpen(true);
  };

  if (!user) return null;

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFF8DC]">
            <Loader2 className="h-8 w-8 animate-spin text-[#DC6B19]" />
        </div>
    )
  }

  const activeBookings = bookings.filter(b => 
    ['confirmed', 'pending'].includes(b.status) && 
    new Date(`${b.date}T${b.endTime}`) > new Date()
  );
  
  const pastBookings = bookings.filter(b => 
    ['completed', 'cancelled', 'no-show'].includes(b.status) ||
    (b.status === 'confirmed' && new Date(`${b.date}T${b.endTime}`) <= new Date())
  );

  return (
    <div className="min-h-screen bg-[#FFF8DC] pb-24 animate-in fade-in duration-500">
      {/* --- Header --- */}
      <div className="sticky top-0 z-40 bg-[#6C0345] text-[#FFF8DC] px-4 py-3 shadow-md flex justify-between items-center">
         <div className="flex items-center gap-2">
             <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.push('/')} 
                className="text-[#FFF8DC] hover:bg-white/10 rounded-full"
             >
                 <ArrowLeft className="h-5 w-5" />
             </Button>
             <h1 className="font-bold text-lg">My Profile</h1>
         </div>
         <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/settings')}
            className="text-[#F7C566] hover:bg-white/10 hover:text-[#F7C566] rounded-full"
         >
             <Settings className="h-5 w-5" />
         </Button>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-6">
        
        {/* --- Profile Card --- */}
        <Card className="border-none shadow-lg bg-white overflow-hidden relative">
            <div className="h-24 bg-gradient-to-r from-[#DC6B19] to-[#F7C566]"></div>
            <CardContent className="pt-0 relative px-6">
                <div className="flex justify-between items-end -mt-12 mb-4">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-md bg-white">
                        <AvatarImage 
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}&backgroundColor=DC6B19&textColor=FFF8DC&fontWeight=bold`} 
                        />
                        <AvatarFallback className="bg-[#DC6B19] text-[#FFF8DC] text-2xl font-bold">
                        {user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => router.push('/settings')} 
                        className="rounded-full border-[#DC6B19] text-[#DC6B19] hover:bg-[#DC6B19] hover:text-white transition-colors"
                    >
                        <Edit3 className="h-4 w-4 mr-2" /> Edit Profile
                    </Button>
                </div>
                
                <div>
                    <h2 className="text-2xl font-bold text-[#6C0345]">{user.name}</h2>
                    <p className="text-gray-500 text-sm flex items-center gap-1 mb-1">
                        <User className="h-3 w-3" /> {user.role === 'owner' ? 'Business Owner' : 'Spot2Go Member'}
                    </p>
                    <p className="text-gray-400 text-xs">{user.email}</p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-[#DC6B19]">{bookings.length}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Bookings</p>
                    </div>
                    <div className="text-center border-l border-gray-100">
                        <p className="text-2xl font-bold text-[#DC6B19]">{reviews.length}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Reviews</p>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* --- Main Tabs --- */}
        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white p-1 rounded-xl shadow-sm border border-[#DC6B19]/10">
            <TabsTrigger 
              value="bookings"
              className="data-[state=active]:bg-[#DC6B19] data-[state=active]:text-white rounded-lg transition-all font-medium text-gray-600"
            >
              Bookings
            </TabsTrigger>
            <TabsTrigger 
              value="reviews"
              className="data-[state=active]:bg-[#DC6B19] data-[state=active]:text-white rounded-lg transition-all font-medium text-gray-600"
            >
              Reviews
            </TabsTrigger>
            <TabsTrigger 
              value="account"
              className="data-[state=active]:bg-[#DC6B19] data-[state=active]:text-white rounded-lg transition-all font-medium text-gray-600"
            >
              Menu
            </TabsTrigger>
          </TabsList>

          {/* --- Bookings Content --- */}
          <TabsContent value="bookings" className="space-y-6 mt-6">
            <section>
              <h3 className="text-lg font-bold text-[#6C0345] flex items-center gap-2 mb-4">
                 Active & Upcoming
              </h3>
              
              {activeBookings.length > 0 ? (
                <div className="space-y-4">
                  {activeBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} isPast={false} onReview={() => openReviewModal(booking)} />
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={Calendar} 
                  message="No upcoming plans." 
                  actionLabel="Find a Spot" 
                  onAction={() => router.push('/')} 
                />
              )}
            </section>

            <Separator className="bg-[#DC6B19]/20" />

            <section>
              <h3 className="text-lg font-bold text-[#6C0345] mb-4 flex items-center gap-2">
                 History
              </h3>
              <div className="space-y-4">
                {pastBookings.length > 0 ? (
                   pastBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} isPast={true} onReview={() => openReviewModal(booking)} />
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic text-center py-4">No booking history yet.</p>
                )}
              </div>
            </section>
          </TabsContent>

          {/* --- Reviews Content --- */}
          <TabsContent value="reviews" className="mt-6 space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review.id} className="border-none shadow-sm bg-white">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-base font-bold text-[#6C0345]">
                        {review.place?.name || 'Unknown Place'}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {review.created_at ? format(parseISO(review.created_at), 'MMMM d, yyyy') : 'Recently'}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-[#FFF8DC] text-[#DC6B19] border-[#DC6B19] flex gap-1">
                      <Star className="h-3 w-3 fill-current" /> {review.rating}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm leading-relaxed">"{review.comment}"</p>
                  </CardContent>
                </Card>
              ))
            ) : (
               <EmptyState 
                  icon={Star} 
                  message="You haven't reviewed any spots yet." 
                />
            )}
          </TabsContent>

           {/* --- Account Menu --- */}
           <TabsContent value="account" className="mt-6 space-y-3">
             <MenuButton icon={User} label="Personal Information" onClick={() => router.push('/settings')} />
             <MenuButton icon={Bell} label="Notification Preferences" onClick={() => router.push('/settings')} />
             <MenuButton icon={Shield} label="Privacy & Security" onClick={() => router.push('/settings')} />
             
             <div className="pt-6">
                <Button 
                  variant="outline" 
                  className="w-full border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 h-12 rounded-xl font-medium"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Log Out
                </Button>
             </div>
           </TabsContent>
        </Tabs>
      </div>

      {/* --- Review Modal --- */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#FFF8DC] border-2 border-[#DC6B19]">
            <DialogHeader>
                <DialogTitle className="text-[#6C0345]">Write a Review</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                            key={star} 
                            onClick={() => setRating(star)}
                            className="transition-transform hover:scale-110 focus:outline-none"
                        >
                            <Star 
                                className={`h-8 w-8 ${star <= rating ? 'fill-[#DC6B19] text-[#DC6B19]' : 'text-gray-300'}`} 
                            />
                        </button>
                    ))}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="comment" className="text-[#6C0345] font-medium">Your Experience</Label>
                    <Textarea 
                        id="comment" 
                        placeholder="Tell us what you liked or what could be better..." 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="bg-white border-[#DC6B19]/30 min-h-[100px]"
                    />
                </div>
            </div>
            <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setReviewModalOpen(false)} className="text-gray-500">Cancel</Button>
                <Button 
                    onClick={handleSubmitReview} 
                    disabled={submittingReview || !comment}
                    className="bg-[#DC6B19] hover:bg-[#c25e15] text-white"
                >
                    {submittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Review'}
                </Button>
            </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

// --- Sub-Components ---

function BookingCard({ booking, isPast, onReview }: { booking: ExtendedBooking, isPast: boolean, onReview: () => void }) {
  const router = useRouter();
  
  const statusColors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    completed: 'bg-blue-50 text-blue-800 border-blue-200',
    cancelled: 'bg-red-50 text-red-800 border-red-200',
    pending: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    'no-show': 'bg-gray-100 text-gray-600 border-gray-200'
  };

  // FIX: Use the helper function to resolve the image
  const placeImage = getPlaceImage(booking.place);

  const formattedAmount = booking.amount && Number(booking.amount) > 0
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'CAD' }).format(Number(booking.amount))
      : null;

  return (
    <Card className={`border shadow-sm transition-all overflow-hidden group ${isPast ? 'bg-gray-50/50' : 'border-[#DC6B19]/30 bg-white hover:shadow-md'}`}>
      <div className="flex">
          {/* Left Image Strip */}
          <div className="w-28 bg-gray-200 relative flex-shrink-0 min-h-[120px]">
             {placeImage ? (
               <Image 
                  src={placeImage} 
                  alt={booking.place?.name || "Place"} 
                  fill 
                  className={`object-cover ${isPast ? 'grayscale' : ''}`}
                  unoptimized={true} // CRITICAL: Fixes crash on external/local images
               />
             ) : (
               <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <Utensils className="h-8 w-8 opacity-50" />
               </div>
             )}
          </div>

          {/* Content */}
          <div className="flex-1 p-3 md:p-4 min-w-0 flex flex-col justify-between">
             <div>
                <div className="flex justify-between items-start mb-1 gap-2">
                    <h4 className="font-bold text-[#6C0345] truncate text-base leading-tight">
                        {booking.place?.name || 'Unknown Spot'}
                    </h4>
                    <Badge variant="outline" className={`${statusColors[booking.status] || 'bg-gray-100'} border text-[10px] px-2 py-0.5 uppercase tracking-wide font-bold shrink-0`}>
                        {booking.status}
                    </Badge>
                </div>

                {/* Ticket ID Display */}
                <div className="flex items-center gap-2 mb-3">
                     <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-mono text-[10px] px-1.5 py-0 tracking-wider rounded-md border border-gray-200">
                        <Ticket className="h-3 w-3 mr-1" />
                        {booking.ticketId}
                     </Badge>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[#DC6B19]" /> 
                        <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[#DC6B19]" /> 
                        <span>{booking.startTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                         <Users className="h-3.5 w-3.5 text-[#DC6B19]" />
                         <span>{booking.partySize || 1} {booking.partySize === 1 ? 'Person' : 'People'}</span>
                    </div>
                    {formattedAmount && (
                         <div className="flex items-center gap-1.5 font-medium text-[#6C0345]">
                            <DollarSign className="h-3.5 w-3.5" />
                            <span>{formattedAmount}</span>
                         </div>
                    )}
                </div>
             </div>

             {/* Actions */}
             <div className="flex gap-2 mt-auto">
                 {['confirmed', 'pending'].includes(booking.status) && (
                     <Button 
                        size="sm" 
                        className="h-8 text-xs flex-1 bg-[#FFF8DC] text-[#DC6B19] border border-[#DC6B19] hover:bg-[#DC6B19] hover:text-white shadow-none"
                        onClick={() => router.push(`/confirmation?ticketId=${booking.ticketId}`)}
                     >
                         View Ticket
                     </Button>
                 )}

                 {booking.status === 'completed' && !booking.reviewed && (
                     <Button 
                        size="sm" 
                        className="h-8 text-xs flex-1 bg-[#6C0345] text-white hover:bg-[#500234] shadow-none"
                        onClick={onReview}
                     >
                         <Star className="h-3 w-3 mr-1.5" /> Rate
                     </Button>
                 )}
                 
                 {/* Book Again */}
                 {['cancelled', 'no-show', 'completed'].includes(booking.status) && booking.reviewed && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-8 text-xs flex-1 border-gray-200 hover:bg-gray-50 hover:text-[#DC6B19]"
                        onClick={() => router.push(`/places/${booking.placeId}`)}
                     >
                         Book Again
                     </Button>
                 )}
             </div>
          </div>
      </div>
    </Card>
  );
}

function MenuButton({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
  return (
    <Button 
      variant="ghost" 
      onClick={onClick}
      className="w-full justify-between bg-white hover:bg-gray-50 border border-gray-100 hover:border-[#DC6B19]/30 h-14 rounded-xl shadow-sm px-4 group transition-all"
    >
      <div className="flex items-center text-gray-700 group-hover:text-[#6C0345]">
        <div className="bg-[#FFF8DC] p-2 rounded-full mr-3 group-hover:bg-[#DC6B19] group-hover:text-white transition-colors">
           <Icon className="h-5 w-5" />
        </div>
        <span className="font-medium">{label}</span>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-[#DC6B19]" />
    </Button>
  );
}

function EmptyState({ icon: Icon, message, actionLabel, onAction }: { icon: any, message: string, actionLabel?: string, onAction?: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
            <div className="bg-[#FFF8DC] p-4 rounded-full mb-3">
                <Icon className="h-8 w-8 text-[#DC6B19]/50" />
            </div>
            <p className="text-gray-500 mb-4 font-medium">{message}</p>
            {actionLabel && (
                <Button onClick={onAction} variant="outline" className="border-[#DC6B19] text-[#DC6B19] hover:bg-[#DC6B19] hover:text-white">
                    {actionLabel}
                </Button>
            )}
        </div>
    )
}