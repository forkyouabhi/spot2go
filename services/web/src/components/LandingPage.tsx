// services/web/src/components/LandingPage.tsx
import React from 'react';
import { useRouter } from 'next/router';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { MapPin, Coffee, BookOpen, Users, CheckCircle, Store } from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image'; // Import the Next.js Image component

export function LandingPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Spot2Go - Find Your Perfect Study Spot in Thunder Bay</title>
        <meta
          name="description"
          content="Discover and book the best cafés, libraries, and co-working spaces in Thunder Bay. Focus on what matters—we'll handle the spot."
        />
      </Head>
      <div className="min-h-screen w-full" style={{ backgroundColor: '#FFF8DC' }}>
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-10 p-4 md:p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* --- MODIFIED: Use Logo Image --- */}
            <div className="flex items-center gap-2">
              <Image 
                src="/logo-full.png" // Assumes you saved the transparent logo here
                alt="Spot2Go Logo"
                width={150} // Adjust width as needed
                height={40}
                className="object-contain"
              />
            </div>
            {/* --- END MODIFICATION --- */}
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => router.push('/login')}
                className="font-semibold transition-all hover:bg-brand-burgundy/5"
                style={{
                  backgroundColor: '#FFF8DC',
                  borderColor: '#DC6B19',
                  color: '#DC6B19',
                }}
              >
                Login
              </Button>
              <Button
                onClick={() => router.push('/signup')}
                className="font-semibold transition-all shadow-md hover:shadow-lg"
                style={{
                  backgroundColor: '#6C0345',
                  color: '#FFF8DC',
                }}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="relative pt-32 pb-16 md:pt-48 md:pb-24 overflow-hidden">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundColor: '#F7C566',
              opacity: 0.1,
              clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0% 100%)'
            }}
          />
          <div className="relative max-w-7xl mx-auto px-4 text-center space-y-6">
            <h1 
              className="text-5xl md:text-7xl font-bold tracking-tight"
              style={{ color: '#6C0345' }}
            >
              Find Your Perfect <span style={{ color: '#DC6B19' }}>Study Spot</span>
            </h1>
            <p 
              className="max-w-2xl mx-auto text-lg md:text-xl"
              style={{ color: '#6C0345', opacity: 0.9 }}
            >
              Discover and book the best cafés, libraries, and co-working spaces in Thunder Bay.
              Focus on what matters—we'll handle the spot.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                onClick={() => router.push('/signup')}
                className="h-12 text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                style={{
                  backgroundColor: '#DC6B19',
                  color: '#FFF8DC',
                }}
              >
                Get Started
              </Button>
            </div>
          </div>
        </main>

        {/* Features Section */}
        <section className="py-16 md:py-24 px-4" style={{ backgroundColor: '#FFF8DC' }}>
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center">
              <h2 className="text-4xl font-bold" style={{ color: '#6C0345' }}>
                How It Works
              </h2>
              <p className="text-lg mt-2" style={{ color: '#DC6B19' }}>
                Simple, fast, and reliable.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-2 rounded-2xl shadow-lg" style={{ borderColor: '#F7C566', backgroundColor: 'white' }}>
                <CardContent className="p-8 text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{backgroundColor: '#6C03451A'}}>
                    <MapPin className="h-8 w-8" style={{ color: '#6C0345' }} />
                  </div>
                  <h3 className="text-2xl font-semibold" style={{ color: '#6C0345' }}>1. Discover</h3>
                  <p style={{ color: '#6C0345', opacity: 0.8 }}>
                    Browse a curated list of verified study and work locations all over the city.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 rounded-2xl shadow-lg" style={{ borderColor: '#F7C566', backgroundColor: 'white' }}>
                <CardContent className="p-8 text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{backgroundColor: '#6C03451A'}}>
                    <CheckCircle className="h-8 w-8" style={{ color: '#6C0345' }} />
                  </div>
                  <h3 className="text-2xl font-semibold" style={{ color: '#6C0345' }}>2. Book</h3>
                  <p style={{ color: '#6C0345', opacity: 0.8 }}>
                    Reserve your spot instantly. No more guesswork or searching for an open seat.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 rounded-2xl shadow-lg" style={{ borderColor: '#F7C566', backgroundColor: 'white' }}>
                <CardContent className="p-8 text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{backgroundColor: '#6C03451A'}}>
                    <Coffee className="h-8 w-8" style={{ color: '#6C0345' }} />
                  </div>
                  <h3 className="text-2xl font-semibold" style={{ color: '#6C0345' }}>3. Study</h3>
                  <p style={{ color: '#6C0345', opacity: 0.8 }}>
                    Show up, grab a coffee, and get your work done in a productive environment.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Business Owner CTA */}
        <section className="py-24" style={{ backgroundColor: '#F7C566' }}>
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <Store className="h-16 w-16 mx-auto" style={{ color: '#6C0345' }} />
            <h2 className="text-4xl font-bold" style={{ color: '#6C0345' }}>
              Are You a Business Owner?
            </h2>
            <p className="text-xl" style={{ color: '#6C0345', opacity: 0.9 }}>
              List your space on Spot2Go to attract new customers, fill empty seats, and
              become a go-to spot for students and professionals.
            </p>
            <Button
              size="lg"
              onClick={() => router.push('/business')}
              className="h-12 text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              style={{
                backgroundColor: '#6C0345',
                color: '#FFF8DC',
              }}
            >
              Partner With Us
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8" style={{ backgroundColor: '#6C0345' }}>
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p style={{ color: '#F7C566' }}>
              © {new Date().getFullYear()} Spot2Go. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}