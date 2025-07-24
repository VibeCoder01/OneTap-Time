
import React, { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { AppProvider, useAppContext } from '@/context/app-context';
import { describe, it } from '@/lib/test-runner';
import { initialCategories, OTHER_CATEGORY_ID } from '@/lib/data';

declare const expect: (actual: any) => any;

// Helper component to extract context values
let testContext: any = {};
const TestConsumer = () => {
  testContext = useAppContext();
  return null;
};

// Wrapper to provide the context to our test consumer
const renderWithProvider = () => {
  return render(
    <AppProvider>
      <TestConsumer />
    </AppProvider>
  );
};

// Because we can't use `act` from react-dom/test-utils in this environment,
// we'll simulate it with a function that re-renders. This is a simplification.
const act = (callback: () => void) => {
    callback();
};

export function runAppContextTests() {

  describe('App Context Data Management', () => {

    it('should initialize with default categories and no activities', () => {
      renderWithProvider();
      expect(testContext.activities).toHaveLength(0);
      const defaultNames = initialCategories.map(c => c.name);
      const hookNames = testContext.categories.map((c: any) => c.name);
      expect(hookNames.sort()).toEqual(defaultNames.sort());
    });
    
    it('should add a new activity', () => {
        renderWithProvider();
        const category = testContext.categories[0];
        expect(category).toBeDefined();

        act(() => {
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
    });

    it('should update an existing activity', () => {
        renderWithProvider();
        const category = testContext.categories[0];
        act(() => {
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

        act(() => {
            testContext.updateActivity({
                ...activityToUpdate,
                name: 'Updated Name'
            });
        });
        
        expect(testContext.activities[0].name).toBe('Updated Name');
    });

    it('should delete an activity', () => {
        renderWithProvider();
        act(() => {
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
        
        act(() => {
            testContext.deleteActivity(activityId);
        });

        expect(testContext.activities).toHaveLength(0);
    });

    it('should add a custom category', () => {
        renderWithProvider();
        const initialCount = testContext.categories.length;

        act(() => {
            testContext.addCategory({
                name: 'Custom Test Category',
                color: 'text-pink-500',
                iconName: 'Heart'
            });
        });

        expect(testContext.categories).toHaveLength(initialCount + 1);
        expect(testContext.categories.some((c: any) => c.name === 'Custom Test Category')).toBeTruthy();
    });

    it('should update a custom category and reflect changes in activities', () => {
        renderWithProvider();
        
        act(() => {
            testContext.addCategory({ name: 'Old Category Name', color: 'text-red-500', iconName: 'Car' });
        });

        const newCategory = testContext.categories.find((c: any) => c.name === 'Old Category Name');
        expect(newCategory).toBeDefined();

        act(() => {
            testContext.logActivity({ name: 'Activity with old category', category: newCategory!, startTime: 1, endTime: 2, duration: 1 });
        });
        
        expect(testContext.activities[0].category.name).toBe('Old Category Name');

        act(() => {
            testContext.updateCategory({ ...newCategory!, name: 'New Category Name' });
        });
        
        const updatedCategory = testContext.categories.find((c: any) => c.id === newCategory!.id);
        expect(updatedCategory?.name).toBe('New Category Name');
        expect(testContext.activities[0].category.name).toBe('New Category Name');
    });

    it('should delete a category and reassign its activities to "Other"', () => {
        renderWithProvider();
        
        act(() => {
            testContext.addCategory({ name: 'Category To Delete', color: 'text-yellow-500', iconName: 'Sun' });
        });

        const categoryToDelete = testContext.categories.find((c: any) => c.name === 'Category To Delete');
        expect(categoryToDelete).toBeDefined();

        act(() => {
            testContext.logActivity({ name: 'Test Activity', category: categoryToDelete!, startTime: 1, endTime: 2, duration: 1 });
        });

        expect(testContext.activities[0].category.name).toBe('Category To Delete');
        const initialCategoryCount = testContext.categories.length;
        
        act(() => {
            testContext.deleteCategory(categoryToDelete!.id);
        });

        expect(testContext.categories).toHaveLength(initialCategoryCount - 1);
        expect(testContext.categories.some((c: any) => c.id === categoryToDelete!.id)).toBeFalsy();
        expect(testContext.activities[0].category.id).toBe(OTHER_CATEGORY_ID);
        expect(testContext.activities[0].category.name).toBe('Other');
    });

    it('should restore default categories without duplicating existing ones by name', () => {
        renderWithProvider();
        
        const workCategory = testContext.categories.find((c: any) => c.name === 'Work');
        expect(workCategory).toBeDefined();
        act(() => {
            testContext.deleteCategory(workCategory!.id);
        });
        expect(testContext.categories.some((c: any) => c.name === 'Work')).toBeFalsy();

        act(() => {
            testContext.restoreDefaultCategories();
        });

        expect(testContext.categories.some((c: any) => c.name === 'Work')).toBeTruthy();
        
        const learningCategories = testContext.categories.filter((c: any) => c.name === 'Learning');
        expect(learningCategories).toHaveLength(1);
    });

  });

}
