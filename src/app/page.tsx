"use client";

import React, { useState, useMemo } from 'react';
import Header from '@/components/header';
import TimerCard from '@/components/timer-card';
import ActivityLog from '@/components/activity-log';
import SummaryCard from '@/components/summary-card';
import CategoryManager from '@/components/category-manager';
import type { Activity, Category } from '@/lib/types';
import { iconMap } from '@/lib/types';


const initialCategories: Category[] = [
  { id: 'work', name: 'Work', color: 'text-blue-500', iconName: 'Briefcase' },
  { id: 'learning', name: 'Learning', color: 'text-green-500', iconName: 'BookOpen' },
  { id: 'exercise', name: 'Exercise', color: 'text-red-500', iconName: 'Dumbbell' },
  { id: 'personal', name: 'Personal', color: 'text-purple-500', iconName: 'User' },
  { id: 'other', name: 'Other', color: 'text-gray-500', iconName: 'MoreHorizontal' },
];

export default function Home() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const handleLogActivity = (activity: Omit<Activity, 'id'>) => {
    const categoryWithIcon = {
      ...activity.category,
      icon: iconMap[activity.category.iconName]
    }
    setActivities(prev => [{ ...activity, id: crypto.randomUUID(), category: categoryWithIcon }, ...prev]);
  };

  const handleDeleteActivity = (id: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== id));
  }
  
  const handleAddCategory = (category: Omit<Category, 'id'>) => {
    setCategories(prev => [...prev, { ...category, id: crypto.randomUUID() }]);
  };

  const handleUpdateCategory = (updatedCategory: Category) => {
    setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
    setActivities(prev => prev.map(a => a.category.id === updatedCategory.id ? { ...a, category: updatedCategory } : a));
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(prev => prev.filter(category => category.id !== id));
    // Optional: Decide what to do with activities that used this category.
    // For now, they will remain but might cause issues if not handled.
    // A better approach could be to set them to a default 'Other' category or delete them.
  };


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

  const categoryUsage = useMemo(() => {
    return categories.map(c => ({
      ...c,
      isUsed: activities.some(a => a.category.id === c.id)
    }));
  }, [categories, activities]);

  return (
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-6 lg:p-8 space-y-8">
      <Header />
      <main className="w-full max-w-4xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TimerCard onLogActivity={handleLogActivity} categories={categories} />
          </div>
          <SummaryCard activities={dailyActivities} />
        </div>
        <CategoryManager 
          categories={categoryUsage} 
          onAdd={handleAddCategory} 
          onUpdate={handleUpdateCategory} 
          onDelete={handleDeleteCategory}
        />
        <ActivityLog activities={activities} onDelete={handleDeleteActivity} />
      </main>
    </div>
  );
}
