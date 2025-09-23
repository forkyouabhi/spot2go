import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { MapPin, Coffee, BookOpen, Users, Sparkles, Star, Clock, Wifi } from "lucide-react";

interface SplashScreenProps {
  onNavigate: (screen: 'login' | 'signup') => void;
}

export function SplashScreen({ onNavigate }: SplashScreenProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Clean Background with Brand Colors */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #6C0345 0%, #DC6B19 100%)'
        }}
      />
      
      {/* Subtle Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 left-8 w-20 h-20 rounded-full opacity-20 animate-pulse" 
             style={{ backgroundColor: '#F7C566', animationDelay: '0s' }} />
        <div className="absolute top-32 right-12 w-24 h-24 rounded-full opacity-15 animate-pulse" 
             style={{ backgroundColor: '#FFF8DC', animationDelay: '2s' }} />
        <div className="absolute bottom-32 left-16 w-20 h-20 rounded-full opacity-20 animate-pulse" 
             style={{ backgroundColor: '#F7C566', animationDelay: '4s' }} />
        <div className="absolute bottom-16 right-8 w-16 h-16 rounded-full opacity-25 animate-pulse" 
             style={{ backgroundColor: '#FFF8DC', animationDelay: '6s' }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8 text-center">
          
          {/* Hero Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-4">
              <div 
                className="p-4 rounded-3xl border-2 shadow-xl"
                style={{
                  backgroundColor: '#FFF8DC',
                  borderColor: '#F7C566'
                }}
              >
                <Sparkles className="h-10 w-10" style={{ color: '#6C0345' }} />
              </div>
              <div>
                <h1 className="text-5xl font-bold tracking-tight" style={{ color: '#FFF8DC' }}>
                  Spot2Go
                </h1>
                <div className="flex items-center justify-center space-x-1 mt-1">
                  <MapPin className="h-4 w-4" style={{ color: '#F7C566' }} />
                  <span className="text-sm font-medium" style={{ color: '#FFF8DC' }}>
                    Thunder Bay
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-xl leading-relaxed" style={{ color: '#FFF8DC' }}>
              Discover & book the perfect study spaces across Thunder Bay
            </p>
          </div>

          {/* Features Preview Card */}
          <Card 
            className="shadow-2xl p-6 border-2 rounded-2xl"
            style={{
              backgroundColor: '#FFF8DC',
              borderColor: '#F7C566'
            }}
          >
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#6C0345' }}>
                What You'll Find
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3 text-center">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border-2"
                    style={{
                      backgroundColor: '#F7C566',
                      borderColor: '#DC6B19'
                    }}
                  >
                    <Coffee className="h-7 w-7" style={{ color: '#6C0345' }} />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: '#6C0345' }}>Cozy Cafés</p>
                    <p className="text-xs" style={{ color: '#6C0345', opacity: 0.7 }}>
                      Perfect for casual study
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3 text-center">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border-2"
                    style={{
                      backgroundColor: '#F7C566',
                      borderColor: '#DC6B19'
                    }}
                  >
                    <BookOpen className="h-7 w-7" style={{ color: '#6C0345' }} />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: '#6C0345' }}>Libraries</p>
                    <p className="text-xs" style={{ color: '#6C0345', opacity: 0.7 }}>
                      Quiet & focused
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3 text-center">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border-2"
                    style={{
                      backgroundColor: '#F7C566',
                      borderColor: '#DC6B19'
                    }}
                  >
                    <Users className="h-7 w-7" style={{ color: '#6C0345' }} />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: '#6C0345' }}>Co-working</p>
                    <p className="text-xs" style={{ color: '#6C0345', opacity: 0.7 }}>
                      Collaborative spaces
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3 text-center">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border-2"
                    style={{
                      backgroundColor: '#F7C566',
                      borderColor: '#DC6B19'
                    }}
                  >
                    <Wifi className="h-7 w-7" style={{ color: '#6C0345' }} />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: '#6C0345' }}>Study Hubs</p>
                    <p className="text-xs" style={{ color: '#6C0345', opacity: 0.7 }}>
                      High-speed internet
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button 
              onClick={() => onNavigate('signup')} 
              className="w-full h-14 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
              style={{ 
                backgroundColor: '#F7C566',
                color: '#6C0345'
              }}
              size="lg"
            >
              🚀 Start Your Journey
            </Button>
            
            <Button 
              onClick={() => onNavigate('login')} 
              className="w-full h-14 text-lg font-semibold rounded-2xl border-2 transition-all duration-300"
              style={{
                backgroundColor: 'transparent',
                borderColor: '#F7C566',
                color: '#FFF8DC'
              }}
              size="lg"
            >
              👋 Welcome Back
            </Button>
          </div>

          {/* Social Proof & Trust Indicators */}
          <div className="space-y-4">
            <div 
              className="flex items-center justify-center space-x-4"
              style={{ color: '#FFF8DC' }}
            >
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-current" style={{ color: '#F7C566' }} />
                <span className="text-sm font-medium">4.9 Rating</span>
              </div>
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#F7C566' }} />
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" style={{ color: '#F7C566' }} />
                <span className="text-sm font-medium">Instant Booking</span>
              </div>
            </div>
            
            <p className="text-sm leading-relaxed" style={{ color: '#FFF8DC', opacity: 0.8 }}>
              Join hundreds of students and professionals finding their perfect study environment in Thunder Bay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}