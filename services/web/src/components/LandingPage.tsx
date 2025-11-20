// services/web/src/components/LandingPage.tsx
import React from 'react';
import Link from 'next/link'; // Use Link for instant prefetching
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { MapPin, Coffee, CheckCircle, Store } from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';

export function LandingPage() {
  return (
    <>
      <Head>
        <title>Spot2Go - Find Your Perfect Study Spot in Thunder Bay</title>
        <meta
          name="description"
          content="Discover and book the best cafés, libraries, and co-working spaces in Thunder Bay."
        />
      </Head>
      <div className="min-h-screen w-full bg-brand-cream flex flex-col">
        
        {/* --- FIXED HEADER --- 
            1. Changed to 'sticky' so it stays accessible but doesn't float awkwardly.
            2. Added z-50 and solid background to prevent content overlap on mobile.
        */}
        <header className="sticky top-0 z-50 w-full border-b border-brand-orange/10 bg-brand-cream/95 backdrop-blur supports-[backdrop-filter]:bg-brand-cream/60">
          <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2">
              <Image 
                src="/logo-full.png"
                alt="Spot2Go Logo"
                width={120} // Slightly smaller for better mobile fit
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex gap-3">
              {/* FIX: Use Link + passHref for instant navigation */}
              <Link href="/login" passHref className="w-full sm:w-auto">
                <Button 
                  variant="outline"
                  className="font-semibold transition-all border-brand-orange text-brand-orange hover:bg-brand-burgundy/5 active:scale-95"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup" passHref className="w-full sm:w-auto">
                <Button
                  className="font-semibold transition-all shadow-md hover:shadow-lg bg-brand-burgundy text-brand-cream hover:bg-brand-burgundy/90 active:scale-95"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="relative flex-1 pt-12 pb-16 md:pt-24 md:pb-24 overflow-hidden">
          {/* Background shape */}
          <div 
            className="absolute inset-0 pointer-events-none" 
            style={{
              backgroundColor: '#F7C566',
              opacity: 0.1,
              clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0% 100%)'
            }}
          />
          
          <div className="relative max-w-7xl mx-auto px-4 text-center space-y-6 z-0">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-brand-burgundy">
              Find Your Perfect <span className="text-brand-orange">Study Spot</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-brand-burgundy/90">
              Discover and book the best cafés, libraries, and co-working spaces in Thunder Bay.
              Focus on what matters—we'll handle the spot.
            </p>
            <div className="flex justify-center pt-4">
              <Link href="/signup" passHref>
                <Button
                  size="lg"
                  className="h-12 px-8 text-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all bg-brand-orange text-brand-cream hover:bg-brand-orange/90"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </main>

        {/* Features Section */}
        <section className="py-16 md:py-24 px-4 bg-brand-cream">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-burgundy">
                How It Works
              </h2>
              <p className="text-lg mt-2 text-brand-orange">
                Simple, fast, and reliable.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard 
                icon={<MapPin className="h-8 w-8 text-brand-burgundy" />}
                title="1. Discover"
                description="Browse a curated list of verified study and work locations all over the city."
              />
              <FeatureCard 
                icon={<CheckCircle className="h-8 w-8 text-brand-burgundy" />}
                title="2. Book"
                description="Reserve your spot instantly. No more guesswork or searching for an open seat."
              />
              <FeatureCard 
                icon={<Coffee className="h-8 w-8 text-brand-burgundy" />}
                title="3. Study"
                description="Show up, grab a coffee, and get your work done in a productive environment."
              />
            </div>
          </div>
        </section>

        {/* Business Owner CTA */}
        <section className="py-20 bg-brand-yellow/90">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <Store className="h-16 w-16 mx-auto text-brand-burgundy" />
            <h2 className="text-3xl md:text-4xl font-bold text-brand-burgundy">
              Are You a Business Owner?
            </h2>
            <p className="text-lg md:text-xl text-brand-burgundy/90">
              List your space on Spot2Go to attract new customers and fill empty seats.
            </p>
            <Link href="/business" passHref>
              <Button
                size="lg"
                className="h-12 px-8 text-lg font-semibold shadow-lg transition-all bg-brand-burgundy text-brand-cream hover:bg-brand-burgundy/90"
              >
                Partner With Us
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-brand-burgundy text-brand-yellow text-center">
          <p>© {new Date().getFullYear()} Spot2Go. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}

// Extracted sub-component for cleaner code
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border-2 border-brand-yellow bg-white rounded-2xl shadow-lg">
      <CardContent className="p-6 text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-brand-burgundy/10 flex items-center justify-center mx-auto">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-brand-burgundy">{title}</h3>
        <p className="text-brand-burgundy/80">{description}</p>
      </CardContent>
    </Card>
  );
}