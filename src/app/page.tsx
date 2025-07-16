"use client";

import React, { useState, useMemo } from 'react';
import Header from '@/components/header';
import TimerCard from '@/components/timer-card';
import ActivityLog from '@/components/activity-log';
import SummaryCard from '@/components/summary-card';
import type { Activity } from '@/lib/types';

export default function Home() {
  const [activities, setActivities] = useState<Activity[]>([]);

  const handleLogActivity = (activity: Omit<Activity, 'id'>) => {
    setActivities(prev => [{ ...activity, id: crypto.randomUUID() }, ...prev]);
  };

  const handleDeleteActivity = (id: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== id));
  }

  const dailyActivities = useMemo(() => {
    const today = new Date();
    return activities.filter(activity => {
      const activityDate = new Date(activity.startTime);
      return (
        activityDate.getDate() === today.getDate() &&
        activityDate.getMonth() === today.getMonth() &&
        activityDate.getFullYear() === today.getFullYear()
      );
    });
  }, [activities]);

  return (
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-6 lg:p-8 space-y-8">
      <Header />
      <main className="w-full max-w-4xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TimerCard onLogActivity={handleLogActivity} />
          </div>
          <SummaryCard activities={dailyActivities} />
        </div>
        <ActivityLog activities={activities} onDelete={handleDeleteActivity} />
      </main>
    </div>
  );
}
