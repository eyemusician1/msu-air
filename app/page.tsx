"use client";

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { FlightSearch } from "@/components/flight-search";
import { Footer } from "@/components/footer";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect to login if user is NOT logged in
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't show anything while redirecting
  if (!user) {
    return null;
  }

  // User is authenticated, show the homepage
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FlightSearch />
      <Footer />
    </main>
  );
}