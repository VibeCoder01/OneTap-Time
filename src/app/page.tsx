
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Header from '@/components/header';
import TimerCard from '@/components/timer-card';
import ActivityLog from '@/components/activity-log';
import SummaryCard from '@/components/summary-card';
import CategoryManager from '@/components/category-manager';
import DataManager from '@/components/data-manager';
import type { Activity, Category } from '@/lib/types';
import { iconMap } from '@/lib/types';


const initialCategories: Category[] = [
  { id: 'work', name: 'Work', color: 'text-blue-500', iconName: 'Briefcase' },
  { id: 'learning', name: 'Learning', color: 'text-green-500', iconName: 'BookOpen' },
  { id: 'exercise', name: 'Exercise', color: 'text-red-500', iconName: 'Dumbbell' },
  { id: 'personal', name: 'Personal', color: 'text-purple-500', iconName: 'User' },
  { id: 'other', name: 'Other', color: 'text-gray-500', iconName: 'MoreHorizontal' },
];

const getInitialData = () => {
  if (typeof window === 'undefined') {
    return { activities: [], categories: initialCategories };
  }
  try {
    const savedData = localStorage.getItem('oneTapData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      // Basic validation
      if (Array.isArray(parsed.activities) && Array.isArray(parsed.categories)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Failed to load data from localStorage", error);
  }
  return { activities: [], categories: initialCategories };
};


export default function Home() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initialData = getInitialData();
    setActivities(initialData.activities);
    setCategories(initialData.categories);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      const dataToSave = {
        activities: activities.map(({ category, ...rest }) => ({
            ...rest,
            category: {
                id: category.id,
                name: category.name,
                color: category.color,
                iconName: category.iconName,
            }
        })),
        categories: categories.map(({ isUsed, icon, ...c }) => c),
      };
      localStorage.setItem('oneTapData', JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [activities, categories, isLoaded]);

  const handleLogActivity = (activity: Omit<Activity, 'id'>) => {
    const categoryWithIcon = {
      ...activity.category,
      icon: iconMap[activity.category.iconName]
    }
    setActivities(prev => [{ ...activity, id: crypto.randomUUID(), category: categoryWithIcon }, ...prev]);
  };

  const handleUpdateActivity = (updatedActivity: Activity) => {
    setActivities(prev => prev.map(a => a.id === updatedActivity.id ? { ...updatedActivity, category: { ...updatedActivity.category, icon: iconMap[updatedActivity.category.iconName] }} : a));
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
  };
  
  const handleImportData = (data: { activities: Activity[], categories: Category[] }) => {
    if (data && Array.isArray(data.activities) && Array.isArray(data.categories)) {
      setActivities(data.activities.map(a => ({...a, category: {...a.category, icon: iconMap[a.category.iconName]}})));
      setCategories(data.categories);
    } else {
      alert("Invalid data file format.");
    }
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
  
  const activitiesWithIcons = useMemo(() => {
      return activities.map(a => ({
        ...a,
        category: {
          ...a.category,
          icon: iconMap[a.category.iconName] || MoreHorizontal,
        }
      }))
  }, [activities]);

  const categoryUsage = useMemo(() => {
    return categories.map(c => ({
      ...c,
      isUsed: activities.some(a => a.category.id === c.id)
    }));
  }, [categories, activities]);

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
            <TimerCard onLogActivity={handleLogActivity} categories={categories} />
          </div>
          <SummaryCard activities={dailyActivities} />
        </div>
        
        <ActivityLog 
          activities={activitiesWithIcons} 
          categories={categories}
          onUpdate={handleUpdateActivity}
          onDelete={handleDeleteActivity} 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CategoryManager 
              categories={categoryUsage} 
              onAdd={handleAddCategory} 
              onUpdate={handleUpdateCategory} 
              onDelete={handleDeleteCategory}
            />
            <DataManager 
                activities={activities}
                categories={categories.map(({isUsed, ...c}) => c)}
                onImport={handleImportData}
            />
        </div>

      </main>
    </div>
  );
}
