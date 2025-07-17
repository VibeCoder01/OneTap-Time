
"use client";

import React from 'react';
import Header from '@/components/header';
import TimerCard from '@/components/timer-card';
import ActivityLog from '@/components/activity-log';
import SummaryCard from '@/components/summary-card';
import CategoryManager from '@/components/category-manager';
import DataManager from '@/components/data-manager';
import { AppProvider, useAppContext } from '@/context/app-context';

function AppContent() {
  const { isLoaded } = useAppContext();

  if (!isLoaded) {
    return (
       <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 space-y-8">
        <Header />
        <p>Loading your session...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-6 lg:p-8 space-y-8">
      <Header />
      <main className="w-full max-w-4xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TimerCard />
          </div>
          <SummaryCard />
        </div>
        
        <ActivityLog />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CategoryManager />
            <DataManager />
        </div>
      </main>
    </div>
  );
}


export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
