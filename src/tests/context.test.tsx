
"use client"

import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider, useAppContext } from '@/context/app-context';
import { describe, it } from '@/lib/test-runner';
import { initialCategories, OTHER_CATEGORY_ID } from '@/lib/data';

// react-dom/test-utils is not reliable in this browser-based test environment
// so we provide a very small replacement that simply awaits the callback and
// lets React process state updates on the next tick.
const act = async (fn: () => void | Promise<void>) => {
  await fn();
  await new Promise(resolve => setTimeout(resolve, 0));
};

declare const expect: (actual: any) => any;

// Helper component to extract context values for testing.
let testContext: any = {};
const TestConsumer = () => {
  testContext = useAppContext();
  return null;
};

const resetTestEnv = () => {
  testContext = {};
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.clear();
  }
};


export function runAppContextTests() {

  describe('App Context Data Management', () => {


    it('should update a custom category and reflect changes in activities', async () => {
        resetTestEnv();
        const container = document.createElement('div');
        const root = createRoot(container);
        await act(async () => {
            root.render(<AppProvider><TestConsumer /></AppProvider>);
        });

        await act(async () => {
            testContext.addCategory({ name: 'Old Category Name', color: 'text-red-500', iconName: 'Car' });
        });

        const newCategory = testContext.categories.find((c: any) => c.name === 'Old Category Name');
        expect(newCategory).toBeDefined();

        await act(async () => {
            testContext.logActivity({ name: 'Activity with old category', category: newCategory, startTime: 1, endTime: 2, duration: 1 });
        });
        
        expect(testContext.activities[0].category.name).toBe('Old Category Name');

        await act(async () => {
            testContext.updateCategory({ ...newCategory, name: 'New Category Name' });
        });
        
        const updatedCategory = testContext.categories.find((c: any) => c.id === newCategory.id);
        expect(updatedCategory?.name).toBe('New Category Name');
        expect(testContext.activities[0].category.name).toBe('New Category Name');
        root.unmount();
    });

    it('should delete a category and reassign its activities to "Other"', async () => {
        resetTestEnv();
        const container = document.createElement('div');
        const root = createRoot(container);
        await act(async () => {
            root.render(<AppProvider><TestConsumer /></AppProvider>);
        });

        await act(async () => {
            testContext.addCategory({ name: 'Category To Delete', color: 'text-yellow-500', iconName: 'Sun' });
        });

        const categoryToDelete = testContext.categories.find((c: any) => c.name === 'Category To Delete');
        expect(categoryToDelete).toBeDefined();

        await act(async () => {
            testContext.logActivity({ name: 'Test Activity', category: categoryToDelete, startTime: 1, endTime: 2, duration: 1 });
        });

        expect(testContext.activities[0].category.name).toBe('Category To Delete');
        const initialCategoryCount = testContext.categories.length;
        
        await act(async () => {
            testContext.deleteCategory(categoryToDelete.id);
        });

        expect(testContext.categories).toHaveLength(initialCategoryCount - 1);
        expect(testContext.categories.some((c: any) => c.id === categoryToDelete.id)).toBeFalsy();
        expect(testContext.activities[0].category.id).toBe(OTHER_CATEGORY_ID);
        expect(testContext.activities[0].category.name).toBe('Other');
        root.unmount();
    });

    it('should restore default categories without duplicating existing ones by name', async () => {
        resetTestEnv();
        const container = document.createElement('div');
        const root = createRoot(container);
        await act(async () => {
            root.render(<AppProvider><TestConsumer /></AppProvider>);
        });

        const workCategory = testContext.categories.find((c: any) => c.name === 'Work');
        expect(workCategory).toBeDefined();

        await act(async () => {
            testContext.deleteCategory(workCategory.id);
        });
        expect(testContext.categories.some((c: any) => c.name === 'Work')).toBeFalsy();

        await act(async () => {
            testContext.restoreDefaultCategories();
        });

        expect(testContext.categories.some((c: any) => c.name === 'Work')).toBeTruthy();
        
        const learningCategories = testContext.categories.filter((c: any) => c.name === 'Learning');
        expect(learningCategories).toHaveLength(1);
        root.unmount();
    });

  });
}
