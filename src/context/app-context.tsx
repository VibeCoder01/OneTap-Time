
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import type { Activity, Category } from '@/lib/types';
import { initialCategories, OTHER_CATEGORY_ID, iconMap } from '@/lib/data';
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
    importData: (data: { activities: Activity[], categories: Omit<Category, 'icon'>[] }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getInitialData = () => {
    if (typeof window === 'undefined') {
        const categoriesWithIcons = initialCategories.map(c => ({...c, icon: iconMap[c.iconName] || MoreHorizontal}));
        return { activities: [], categories: categoriesWithIcons };
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
                const categoriesWithIcons = parsed.categories.map((c: Category) => ({
                    ...c,
                    icon: iconMap[c.iconName] || MoreHorizontal
                }));
                return { activities: activitiesWithIcons, categories: categoriesWithIcons };
            }
        }
    } catch (error) {
        console.error("Failed to load data from localStorage", error);
    }
    const categoriesWithIcons = initialCategories.map(c => ({...c, icon: iconMap[c.iconName] || MoreHorizontal}));
    return { activities: [], categories: categoriesWithIcons };
};


export function AppProvider({ children }: { children: ReactNode }) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
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

    const addCategory = (category: Omit<Category, 'id' | 'icon'>) => {
        const newCategory = { ...category, id: crypto.randomUUID(), icon: iconMap[category.iconName] || MoreHorizontal };
        setCategories(prev => [...prev, newCategory]);
    };

    const updateCategory = (updatedCategory: Category) => {
        const categoryWithIcon = { ...updatedCategory, icon: iconMap[updatedCategory.iconName] || MoreHorizontal };
        setCategories(prev => prev.map(c => c.id === updatedCategory.id ? categoryWithIcon : c));
        setActivities(prev => prev.map(a => a.category.id === updatedCategory.id ? { ...a, category: categoryWithIcon } : a));
    };

    const deleteCategory = (id: string) => {
        const otherCategory = categories.find(c => c.id === OTHER_CATEGORY_ID) || categories[0];
        if (!otherCategory) return;

        setActivities(prevActivities =>
            prevActivities.map(activity =>
                activity.category.id === id ? { ...activity, category: otherCategory } : activity
            )
        );
        setCategories(prev => prev.filter(category => category.id !== id));
    };

    const restoreDefaultCategories = () => {
        setCategories(prevCategories => {
            const defaultCategoryIds = new Set(initialCategories.map(c => c.id));
            
            // Keep only the truly custom categories (those not in the original default set)
            const customCategories = prevCategories.filter(c => !defaultCategoryIds.has(c.id));
            
            // Combine the user's custom categories with the pristine default categories
            const finalCategories = [...initialCategories, ...customCategories].map(c => ({
                ...c,
                icon: iconMap[c.iconName] || MoreHorizontal
            }));

            return finalCategories;
        });
    };

    const importData = (data: { activities: Activity[], categories: Omit<Category, 'icon'>[] }) => {
        if (data && Array.isArray(data.activities) && Array.isArray(data.categories)) {
             const activitiesWithIcons = data.activities.map(a => ({
                ...a,
                category: {
                    ...a.category,
                    icon: iconMap[a.category.iconName] || MoreHorizontal,
                },
            }));
            const categoriesWithIcons = data.categories.map(c => ({
                ...c,
                icon: iconMap[c.iconName] || MoreHorizontal,
            }));
            setActivities(activitiesWithIcons);
            setCategories(categoriesWithIcons);
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
