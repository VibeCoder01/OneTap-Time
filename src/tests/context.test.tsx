
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { AppProvider, useAppContext } from '@/context/app-context';
import { describe, it } from '@/lib/test-runner';
import { initialCategories, OTHER_CATEGORY_ID } from '@/lib/data';

declare const expect: (actual: any) => any;

// Helper component to extract context values for testing.
// It uses a callback to pass the context value back to the test scope.
let testContext: any = {};
const TestConsumer = () => {
  testContext = useAppContext();
  return null;
};

// Simple async utility to wait for the next tick, allowing React to render.
const act = async (callback: () => void) => {
    callback();
    await new Promise(resolve => setTimeout(resolve, 0));
};

export function runAppContextTests() {

  describe('App Context Data Management', () => {

    it('should initialize with default categories and no activities', async () => {
        const container = document.createElement('div');
        const root = createRoot(container);
        await act(() => {
            root.render(<AppProvider><TestConsumer /></AppProvider>);
        });

        expect(testContext.activities).toHaveLength(0);
        const defaultNames = initialCategories.map(c => c.name).sort();
        const hookNames = testContext.categories.map((c: any) => c.name).sort();
        expect(hookNames).toEqual(defaultNames);

        root.unmount();
    });
    
    it('should add a new activity', async () => {
        const container = document.createElement('div');
        const root = createRoot(container);
        await act(() => {
            root.render(<AppProvider><TestConsumer /></AppProvider>);
        });
        
        const category = testContext.categories[0];
        expect(category).toBeDefined();

        await act(() => {
            testContext.logActivity({
                name: 'Test Activity',
                category: category,
                startTime: Date.now(),
                endTime: Date.now() + 1000,
                duration: 1
            });
        });
        
        expect(testContext.activities).toHaveLength(1);
        expect(testContext.activities[0].name).toBe('Test Activity');
        root.unmount();
    });

    it('should update an existing activity', async () => {
        const container = document.createElement('div');
        const root = createRoot(container);
        await act(() => {
            root.render(<AppProvider><TestConsumer /></AppProvider>);
        });
        
        const category = testContext.categories[0];
        await act(() => {
            testContext.logActivity({
                name: 'Initial Name',
                category: category,
                startTime: Date.now(),
                endTime: Date.now() + 1000,
                duration: 1
            });
        });
        
        const activityToUpdate = testContext.activities[0];
        expect(activityToUpdate).toBeDefined();

        await act(() => {
            testContext.updateActivity({
                ...activityToUpdate,
                name: 'Updated Name'
            });
        });
        
        expect(testContext.activities[0].name).toBe('Updated Name');
        root.unmount();
    });

    it('should delete an activity', async () => {
        const container = document.createElement('div');
        const root = createRoot(container);
        await act(() => {
            root.render(<AppProvider><TestConsumer /></AppProvider>);
        });

        await act(() => {
            testContext.logActivity({
                name: 'To Be Deleted',
                category: testContext.categories[0],
                startTime: Date.now(),
                endTime: Date.now() + 1000,
                duration: 1
            });
        });

        expect(testContext.activities).toHaveLength(1);
        const activityId = testContext.activities[0].id;
        
        await act(() => {
            testContext.deleteActivity(activityId);
        });

        expect(testContext.activities).toHaveLength(0);
        root.unmount();
    });

    it('should add a custom category', async () => {
        const container = document.createElement('div');
        const root = createRoot(container);
        await act(() => {
            root.render(<AppProvider><TestConsumer /></AppProvider>);
        });

        const initialCount = testContext.categories.length;

        await act(() => {
            testContext.addCategory({
                name: 'Custom Test Category',
                color: 'text-pink-500',
                iconName: 'Heart'
            });
        });

        expect(testContext.categories).toHaveLength(initialCount + 1);
        expect(testContext.categories.some((c: any) => c.name === 'Custom Test Category')).toBeTruthy();
        root.unmount();
    });

    it('should update a custom category and reflect changes in activities', async () => {
        const container = document.createElement('div');
        const root = createRoot(container);
        await act(() => {
            root.render(<AppProvider><TestConsumer /></AppProvider>);
        });

        await act(() => {
            testContext.addCategory({ name: 'Old Category Name', color: 'text-red-500', iconName: 'Car' });
        });

        const newCategory = testContext.categories.find((c: any) => c.name === 'Old Category Name');
        expect(newCategory).toBeDefined();

        await act(() => {
            testContext.logActivity({ name: 'Activity with old category', category: newCategory, startTime: 1, endTime: 2, duration: 1 });
        });
        
        expect(testContext.activities[0].category.name).toBe('Old Category Name');

        await act(() => {
            testContext.updateCategory({ ...newCategory, name: 'New Category Name' });
        });
        
        const updatedCategory = testContext.categories.find((c: any) => c.id === newCategory.id);
        expect(updatedCategory?.name).toBe('New Category Name');
        expect(testContext.activities[0].category.name).toBe('New Category Name');
        root.unmount();
    });

    it('should delete a category and reassign its activities to "Other"', async () => {
        const container = document.createElement('div');
        const root = createRoot(container);
        await act(() => {
            root.render(<AppProvider><TestConsumer /></AppProvider>);
        });

        await act(() => {
            testContext.addCategory({ name: 'Category To Delete', color: 'text-yellow-500', iconName: 'Sun' });
        });

        const categoryToDelete = testContext.categories.find((c: any) => c.name === 'Category To Delete');
        expect(categoryToDelete).toBeDefined();

        await act(() => {
            testContext.logActivity({ name: 'Test Activity', category: categoryToDelete, startTime: 1, endTime: 2, duration: 1 });
        });

        expect(testContext.activities[0].category.name).toBe('Category To Delete');
        const initialCategoryCount = testContext.categories.length;
        
        await act(() => {
            testContext.deleteCategory(categoryToDelete.id);
        });

        expect(testContext.categories).toHaveLength(initialCategoryCount - 1);
        expect(testContext.categories.some((c: any) => c.id === categoryToDelete.id)).toBeFalsy();
        expect(testContext.activities[0].category.id).toBe(OTHER_CATEGORY_ID);
        expect(testContext.activities[0].category.name).toBe('Other');
        root.unmount();
    });

    it('should restore default categories without duplicating existing ones by name', async () => {
        const container = document.createElement('div');
        const root = createRoot(container);
        await act(() => {
            root.render(<AppProvider><TestConsumer /></AppProvider>);
        });

        const workCategory = testContext.categories.find((c: any) => c.name === 'Work');
        expect(workCategory).toBeDefined();

        await act(() => {
            testContext.deleteCategory(workCategory.id);
        });
        expect(testContext.categories.some((c: any) => c.name === 'Work')).toBeFalsy();

        await act(() => {
            testContext.restoreDefaultCategories();
        });

        expect(testContext.categories.some((c: any) => c.name === 'Work')).toBeTruthy();
        
        const learningCategories = testContext.categories.filter((c: any) => c.name === 'Learning');
        expect(learningCategories).toHaveLength(1);
        root.unmount();
    });

  });

}
