
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import type { Activity, Category } from '@/lib/types';
import { iconMap, initialCategories, OTHER_CATEGORY_ID } from '@/lib/types';
import { MoreHorizontal } from 'lucide-react';

interface AppContextType {
    activities: Activity[];
    categories: Category[];
    dailyActivities: Activity[];
    categoryUsage: (Category & { isUsed: boolean })[];
    isLoaded: boolean;
    logActivity: (activity: Omit<Activity, 'id'>) => void;
    updateActivity: (updatedActivity: Activity) => void;
    deleteActivity: (id: string) => void;
    addCategory: (category: Omit<Category, 'id' | 'icon'>) => void;
    updateCategory: (updatedCategory: Category) => void;
    deleteCategory: (id: string) => void;
    restoreDefaultCategories: () => void;
    importData: (data: { activities: Activity[], categories: Category[] }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getInitialData = () => {
    if (typeof window === 'undefined') {
        return { activities: [], categories: initialCategories };
    }
    try {
        const savedData = localStorage.getItem('oneTapData');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            if (Array.isArray(parsed.activities) && Array.isArray(parsed.categories)) {
                 const activitiesWithIcons = parsed.activities.map((a: Activity) => ({
                    ...a,
                    category: {
                        ...a.category,
                        icon: iconMap[a.category.iconName] || MoreHorizontal
                    }
                }));
                return { ...parsed, activities: activitiesWithIcons };
            }
        }
    } catch (error) {
        console.error("Failed to load data from localStorage", error);
    }
    return { activities: [], categories: initialCategories };
};


export function AppProvider({ children }: { children: ReactNode }) {
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
                categories: categories.map(({ isUsed, icon, ...c }: any) => c),
            };
            localStorage.setItem('oneTapData', JSON.stringify(dataToSave));
        } catch (error) {
            console.error("Failed to save data to localStorage", error);
        }
    }, [activities, categories, isLoaded]);

    const logActivity = (activity: Omit<Activity, 'id'>) => {
        const categoryWithIcon = {
            ...activity.category,
            icon: iconMap[activity.category.iconName]
        }
        setActivities(prev => [{ ...activity, id: crypto.randomUUID(), category: categoryWithIcon }, ...prev]);
    };

    const updateActivity = (updatedActivity: Activity) => {
        setActivities(prev => prev.map(a => a.id === updatedActivity.id ? { ...updatedActivity, category: { ...updatedActivity.category, icon: iconMap[updatedActivity.category.iconName] }} : a));
    };

    const deleteActivity = (id: string) => {
        setActivities(prev => prev.filter(activity => activity.id !== id));
    };

    const addCategory = (category: Omit<Category, 'id'>) => {
        setCategories(prev => [...prev, { ...category, id: crypto.randomUUID() }]);
    };

    const updateCategory = (updatedCategory: Category) => {
        setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
        setActivities(prev => prev.map(a => a.category.id === updatedCategory.id ? { ...a, category: { ...updatedCategory, icon: iconMap[updatedCategory.iconName] } } : a));
    };

    const deleteCategory = (id: string) => {
        const otherCategory = categories.find(c => c.id === OTHER_CATEGORY_ID) || categories[0];
        if (!otherCategory) return;

        setActivities(prevActivities => 
            prevActivities.map(activity => 
                activity.category.id === id ? { ...activity, category: { ...otherCategory, icon: iconMap[otherCategory.iconName] } } : activity
            )
        );
        setCategories(prev => prev.filter(category => category.id !== id));
    };
    
    const restoreDefaultCategories = () => {
        setCategories(currentCategories => {
            const defaultCategoryMap = new Map(initialCategories.map(c => [c.id, c]));

            const customOrModifiedCategories = currentCategories.filter(cat => {
                const defaultCat = defaultCategoryMap.get(cat.id);
                // Keep if it's not a default category, or if it is a default but has been modified
                return !defaultCat || (defaultCat.name !== cat.name || defaultCat.color !== cat.color || defaultCat.iconName !== cat.iconName);
            }).map(cat => {
                const defaultCat = defaultCategoryMap.get(cat.id);
                // If it was a modified default, give it a new ID to make it a true custom category
                if (defaultCat) {
                    return { ...cat, id: crypto.randomUUID() };
                }
                return cat;
            });

            // Combine the now-safe custom categories with the original, pristine default set.
            const newCategories = [...customOrModifiedCategories, ...initialCategories];
            
            // Deduplicate to be absolutely safe, preferring items from the new custom list
            const finalCategoriesMap = new Map(newCategories.map(c => [c.id, c]));
            
            return Array.from(finalCategoriesMap.values());
        });
    };
    
    const importData = (data: { activities: Activity[], categories: Category[] }) => {
        if (data && Array.isArray(data.activities) && Array.isArray(data.categories)) {
            setActivities(data.activities.map(a => ({ ...a, category: { ...a.category, icon: iconMap[a.category.iconName] } })));
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

    const categoryUsage = useMemo(() => {
        return categories.map(c => ({
            ...c,
            isUsed: activities.some(a => a.category.id === c.id)
        }));
    }, [categories, activities]);

    const value = {
        activities,
        categories,
        dailyActivities,
        categoryUsage,
        isLoaded,
        logActivity,
        updateActivity,
        deleteActivity,
        addCategory,
        updateCategory,
        deleteCategory,
        restoreDefaultCategories,
        importData,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}
