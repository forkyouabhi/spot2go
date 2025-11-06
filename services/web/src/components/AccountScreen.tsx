// services/web/src/components/AccountScreen.tsx
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Star,
  Bookmark,
  Settings,
  Edit,
  LogOut,
  Image as ImageIcon,
} from "lucide-react";
import { User, Booking, StudyPlace } from "../types"; // <-- IMPORT StudyPlace
import { ImageWithFallback } from "./figma/ImageWithFallback"; // <-- IMPORT ImageWithFallback

interface AccountScreenProps {
  user: User;
  bookings: Booking[];
  bookmarkedPlaces: StudyPlace[]; // <-- PROP for bookmarks
  onBack: () => void;
  onNavigateToSettings: () => void;
  onLogout: () => void;
  onReview: (booking: Booking) => void; // <-- PROP for review
  onNavigateToPlace: (placeId: string) => void; // <-- PROP for place navigation
}

export function AccountScreen({
  user,
  bookings,
  bookmarkedPlaces,
  onBack,
  onNavigateToSettings,
  onLogout,
  onReview,
  onNavigateToPlace,
}: AccountScreenProps) {
  const upcomingBookings = bookings.filter(
    (booking) =>
      booking.status === "confirmed" && new Date(booking.date) >= new Date()
  );

  const pastBookings = bookings.filter(
    (booking) => new Date(booking.date) < new Date() || booking.status === 'completed' || booking.status === 'no-show'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return {
          bg: "#F7C566",
          text: "#6C0345",
          border: "#DC6B19",
        };
      case "pending":
        return {
          bg: "#FFF8DC",
          text: "#DC6B19",
          border: "#F7C566",
        };
      case "cancelled":
      case "no-show":
        return {
          bg: "#DC6B19",
          text: "#FFF8DC",
          border: "#6C0345",
        };
      case "completed":
         return {
          bg: "#d1fae5", // green-100
          text: "#065f46", // green-800
          border: "#6ee7b7", // green-300
        };
      default:
        return {
          bg: "#FFF8DC",
          text: "#6C0345",
          border: "#F7C566",
        };
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF8DC" }}>
      {/* Header */}
      <div
        className="shadow-sm p-4 flex items-center justify-between sticky top-0 z-20"
        style={{ backgroundColor: "#6C0345" }}
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="rounded-xl border-2 transition-button"
            style={{
              color: "#FFF8DC",
              borderColor: "#DC6B19",
              backgroundColor: "transparent",
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-semibold" style={{ color: "#FFF8DC" }}>
            My Account
          </h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNavigateToSettings}
          className="rounded-xl border-2 transition-button"
          style={{
            color: "#F7C566",
            borderColor: "#DC6B19",
            backgroundColor: "transparent",
          }}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* --- MODIFICATION START: Reverted to single column with max-width --- */}
      <main className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        
        {/* --- Profile Card --- */}
        <Card
          className="w-full border-2 rounded-2xl shadow-lg animate-fade-in-up"
          style={{ borderColor: "#DC6B19", backgroundColor: "#FFF8DC" }}
        >
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between mb-6 gap-4 sm:gap-0">
              <div className="flex items-center space-x-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border-2"
                  style={{
                    backgroundColor: "#6C0345",
                    borderColor: "#DC6B19",
                  }}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <span
                      className="text-xl font-semibold"
                      style={{ color: "#FFF8DC" }}
                    >
                      {user.name[0]}
                    </span>
                  )}
                </div>
                <div>
                  <h3
                    className="text-xl font-bold"
                    style={{ color: "#6C0345" }}
                  >
                    {user.name}
                  </h3>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "#DC6B19" }}
                  >
                    {user.email}
                  </p>
                  {user.phone && (
                    <p className="text-sm" style={{ color: "#DC6B19" }}>
                      {user.phone}
                    </p>
                  )}
                  {user.provider && (
                    <div className="flex items-center mt-1">
                      <Badge
                        className="text-xs px-2 py-1 rounded-full border"
                        style={{
                          backgroundColor: "#F7C566",
                          color: "#6C0345",
                          borderColor: "#DC6B19",
                        }}
                      >
                        {user.provider === "google"
                          ? "🔗 Google"
                          : user.provider === "apple"
                          ? "🍎 Apple"
                          : "📧 Email"}
                      </Badge>
                    </div>
                  )}
                  <div
                    className="flex items-center mt-2 text-xs"
                    style={{ color: "#DC6B19" }}
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Member since{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateToSettings}
                className="rounded-xl border-2 transition-button w-full sm:w-auto"
                style={{
                  backgroundColor: "#F7C566",
                  borderColor: "#DC6B19",
                  color: "#6C0345",
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            <div
              className="grid grid-cols-3 gap-4 pt-6 border-t-2"
              style={{ borderColor: "#F7C566" }}
            >
              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color: "#6C0345" }}
                >
                  {bookings.length}
                </div>
                <div className="text-sm" style={{ color: "#DC6B19" }}>
                  Total Bookings
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color: "#6C0345" }}
                >
                  {bookmarkedPlaces.length}
                </div>
                <div className="text-sm" style={{ color: "#DC6B19" }}>
                  Bookmarks
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color: "#6C0345" }}
                >
                  0
                </div>
                <div className="text-sm" style={{ color: "#DC6B19" }}>
                  Reviews
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- Quick Actions (Restored to 2-col grid) --- */}
        <div className="w-full grid grid-cols-2 gap-4 animate-slide-in-right">
          <Card
            className="border-2 rounded-2xl shadow-lg cursor-pointer transition-button hover:shadow-xl transform hover:scale-[1.02]"
            style={{ borderColor: "#DC6B19", backgroundColor: "#F7C566" }}
            onClick={onNavigateToSettings}
          >
            <CardContent className="p-4 text-center">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 border-2"
                style={{
                  backgroundColor: "#6C0345",
                  borderColor: "#DC6B19",
                }}
              >
                <Settings className="h-5 w-5" style={{ color: "#FFF8DC" }} />
              </div>
              <h4 className="font-semibold" style={{ color: "#6C0345" }}>
                Settings
              </h4>
              <p className="text-sm mt-1" style={{ color: "#6C0345" }}>
                Manage preferences
              </p>
            </CardContent>
          </Card>

          <Card
            className="border-2 rounded-2xl shadow-lg cursor-pointer transition-button hover:shadow-xl transform hover:scale-[1.02]"
            style={{ borderColor: "#DC6B19", backgroundColor: "#F7C566" }}
            onClick={onLogout}
          >
            <CardContent className="p-4 text-center">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 border-2"
                style={{
                  backgroundColor: "#6C0345",
                  borderColor: "#DC6B19",
                }}
              >
                <LogOut className="h-5 w-5" style={{ color: "#FFF8DC" }} />
              </div>
              <h4 className="font-semibold" style={{ color: "#6C0345" }}>
                Logout
              </h4>
              <p className="text-sm mt-1" style={{ color: "#6C0345" }}>
                Sign out of your account
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* --- END MODIFICATION --- */}


        {/* Enhanced Tabs */}
        <Tabs defaultValue="bookings" className="w-full animate-scale-in">
          <TabsList
            className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-12 rounded-2xl border-2 shadow-lg"
            style={{
              backgroundColor: "#FFF8DC",
              borderColor: "#DC6B19",
            }}
          >
            <TabsTrigger
              value="bookings"
              className="rounded-xl transition-button data-[state=active]:shadow-lg py-2 sm:py-0" // Added padding for mobile
              style={{
                color: "#6C0345",
              }}
              data-active-style={{
                backgroundColor: "#DC6B19",
                color: "#FFF8DC",
              }}
            >
              📅 Bookings
            </TabsTrigger>
            <TabsTrigger
              value="bookmarks"
              className="rounded-xl transition-button data-[state=active]:shadow-lg py-2 sm:py-0"
              style={{
                color: "#6C0345",
              }}
              data-active-style={{
                backgroundColor: "#DC6B19",
                color: "#FFF8DC",
              }}
            >
              🔖 Bookmarks
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-xl transition-button data-[state=active]:shadow-lg py-2 sm:py-0"
              style={{
                color: "#6C0345",
              }}
              data-active-style={{
                backgroundColor: "#DC6B19",
                color: "#FFF8DC",
              }}
            >
              ⭐ Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6 mt-6">
            <Card
              className="border-2 rounded-2xl shadow-lg"
              style={{ borderColor: "#DC6B19", backgroundColor: "#FFF8DC" }}
            >
              <CardHeader className="pb-4">
                <CardTitle
                  className="flex items-center gap-3"
                  style={{ color: "#6C0345" }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center border-2"
                    style={{
                      backgroundColor: "#F7C566",
                      borderColor: "#DC6B19",
                    }}
                  >
                    <Calendar
                      className="h-4 w-4"
                      style={{ color: "#6C0345" }}
                    />
                  </div>
                  Upcoming Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking, index) => (
                      <div
                        key={booking.id}
                        className="p-4 rounded-2xl border-2 transition-smooth hover:shadow-md animate-fade-in-up"
                        style={{
                          backgroundColor: "#F7C566",
                          borderColor: "#DC6B19",
                          animationDelay: `${index * 0.1}s`,
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4
                              className="font-semibold"
                              style={{ color: "#6C0345" }}
                            >
                              {booking.placeName}
                            </h4>
                            <Badge
                              className="mt-1 px-3 py-1 rounded-full border-2"
                              style={{
                                backgroundColor: getStatusColor(booking.status)
                                  .bg,
                                color: getStatusColor(booking.status).text,
                                borderColor: getStatusColor(booking.status)
                                  .border,
                              }}
                            >
                              ✅ {booking.status}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <span
                              className="text-xs px-2 py-1 rounded-full border-2"
                              style={{
                                backgroundColor: "#6C0345",
                                color: "#FFF8DC",
                                borderColor: "#DC6B19",
                              }}
                            >
                              {booking.ticketId}
                            </span>
                          </div>
                        </div>

                        <div
                          className="flex items-center justify-between text-sm"
                          style={{ color: "#6C0345" }}
                        >
                          <div className="flex items-center space-x-2">
                            <Calendar
                              className="h-4 w-4"
                              style={{ color: "#DC6B19" }}
                            />
                            <span className="font-medium">{booking.date}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock
                              className="h-4 w-4"
                              style={{ color: "#DC6B19" }}
                            />
                            <span className="font-medium">
                              {booking.startTime} - {booking.endTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div
                      className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center border-2"
                      style={{
                        backgroundColor: "#F7C566",
                        borderColor: "#DC6B19",
                      }}
                    >
                      <Calendar
                        className="h-8 w-8"
                        style={{ color: "#6C0345" }}
                      />
                    </div>
                    <p
                      className="font-semibold"
                      style={{ color: "#6C0345" }}
                    >
                      No upcoming bookings
                    </p>
                    <p className="text-sm mt-1" style={{ color: "#DC6B19" }}>
                      Your future reservations will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card
              className="border-2 rounded-2xl shadow-lg"
              style={{ borderColor: "#DC6B19", backgroundColor: "#FFF8DC" }}
            >
              <CardHeader className="pb-4">
                <CardTitle
                  className="flex items-center gap-3"
                  style={{ color: "#6C0345" }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center border-2"
                    style={{
                      backgroundColor: "#F7C566",
                      borderColor: "#DC6B19",
                    }}
                  >
                    <Clock className="h-4 w-4" style={{ color: "#6C0345" }} />
                  </div>
                  Past Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pastBookings.length > 0 ? (
                  <div className="space-y-3">
                    {pastBookings.map((booking, index) => (
                      <div
                        key={booking.id}
                        className="border-2 rounded-xl p-3 opacity-80 transition-smooth hover:opacity-100 animate-fade-in-up"
                        style={{
                          borderColor: "#F7C566",
                          backgroundColor: "rgba(247, 197, 102, 0.3)",
                          animationDelay: `${index * 0.1}s`,
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4
                              className="font-medium"
                              style={{ color: "#6C0345" }}
                            >
                              {booking.placeName}
                            </h4>
                            <Badge
                              className="mt-1 px-2 py-1 rounded-full border"
                              style={{
                                backgroundColor: getStatusColor(booking.status).bg,
                                color: getStatusColor(booking.status).text,
                                borderColor: getStatusColor(booking.status).border,
                              }}
                            >
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-2 transition-button"
                            style={{
                              backgroundColor: "#DC6B19",
                              borderColor: "#6C0345",
                              color: "#FFF8DC",
                            }}
                            disabled={booking.reviewed}
                            onClick={() => onReview(booking)}
                          >
                            {booking.reviewed ? 'Reviewed' : '⭐ Review'}
                          </Button>
                        </div>

                        <div
                          className="flex items-center space-x-4 text-sm"
                          style={{ color: "#6C0345" }}
                        >
                          <div className="flex items-center space-x-1">
                            <Calendar
                              className="h-4 w-4"
                              style={{ color: "#DC6B19" }}
                            />
                            <span>{booking.date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock
                              className="h-4 w-4"
                              style={{ color: "#DC6B19" }}
                            />
                            <span>
                              {booking.startTime} - {booking.endTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div
                      className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center border-2"
                      style={{
                        backgroundColor: "#F7C566",
                        borderColor: "#DC6B19",
                      }}
                    >
                      <Clock className="h-6 w-6" style={{ color: "#6C0345" }} />
                    </div>
                    <p style={{ color: "#6C0345" }}>No past bookings</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookmarks" className="space-y-4 mt-6">
            <Card
              className="border-2 rounded-2xl shadow-lg"
              style={{ borderColor: "#DC6B19", backgroundColor: "#FFF8DC" }}
            >
              <CardContent className={bookmarkedPlaces.length > 0 ? "p-4 space-y-3" : "p-8"}>
                {bookmarkedPlaces.length > 0 ? (
                  bookmarkedPlaces.map(place => (
                    <div 
                      key={place.id}
                      className="flex items-center space-x-4 p-3 rounded-xl border-2 bg-white border-brand-yellow cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onNavigateToPlace(place.id)}
                    >
                      <ImageWithFallback
                        src={place.images?.[0] || ''}
                        alt={place.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-brand-burgundy truncate">{place.name}</h4>
                        <p className="text-sm text-brand-orange flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {place.location.address}
                        </p>
                      </div>
                      <Badge className="bg-brand-yellow text-brand-burgundy capitalize shadow-md border border-brand-orange/50">
                        {place.type}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div
                      className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center border-2"
                      style={{
                        backgroundColor: "#F7C566",
                        borderColor: "#DC6B19",
                      }}
                    >
                      <Bookmark
                        className="h-8 w-8"
                        style={{ color: "#6C0345" }}
                      />
                    </div>
                    <p
                      className="font-semibold"
                      style={{ color: "#6C0345" }}
                    >
                      No bookmarked places yet
                    </p>
                    <p className="text-sm mt-1" style={{ color: "#DC6B19" }}>
                      Bookmark places to find them easily later
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4 mt-6">
            <Card
              className="border-2 rounded-2xl shadow-lg"
              style={{ borderColor: "#DC6B19", backgroundColor: "#FFF8DC" }}
            >
              <CardContent className="p-8">
                <div className="text-center py-12">
                  <div
                    className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center border-2"
                    style={{
                      backgroundColor: "#F7C566",
                      borderColor: "#DC6B19",
                    }}
                  >
                    <Star className="h-8 w-8" style={{ color: "#6C0345" }} />
                  </div>
                  <p
                    className="font-semibold"
                    style={{ color: "#6C0345" }}
                  >
                    No reviews written yet
                  </p>
                  <p className="text-sm mt-1" style={{ color: "#DC6B19" }}>
                    Share your experience after visiting places
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}