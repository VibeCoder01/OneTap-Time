
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
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
const renderWithProvider = (container: HTMLElement): Root => {
  const root = createRoot(container);
  root.render(
    <AppProvider>
      <TestConsumer />
    </AppProvider>,
  );
  return root;
};


// A simple way to wrap state updates for this test environment
const act = async (callback: () => void, root: Root) => {
    callback();
    // No need to re-render, context provider handles it.
    // A small delay allows React to process the update.
    await new Promise(resolve => setTimeout(resolve, 0));
};

export function runAppContextTests() {

  describe('App Context Data Management', () => {

    const runTest = (testFn: () => Promise<void>) => {
        return async () => {
            const container = document.createElement('div');
            document.body.appendChild(container);
            let root: Root | null = null;
            try {
                root = renderWithProvider(container);
                await testFn();
            } finally {
                if (root) {
                    root.unmount();
                }
                document.body.removeChild(container);
            }
        }
    }

    it('should initialize with default categories and no activities', runTest(async () => {
      expect(testContext.activities).toHaveLength(0);
      const defaultNames = initialCategories.map(c => c.name).sort();
      const hookNames = testContext.categories.map((c: any) => c.name).sort();
      expect(hookNames).toEqual(defaultNames);
    }));
    
    it('should add a new activity', runTest(async () => {
        const category = testContext.categories[0];
        expect(category).toBeDefined();

        const container = document.createElement('div');
        const root = createRoot(container);
        await act(() => {
            testContext.logActivity({
                name: 'Test Activity',
                category: category,
                startTime: Date.now(),
                endTime: Date.now() + 1000,
                duration: 1
            });
        }, root);
        
        expect(testContext.activities).toHaveLength(1);
        expect(testContext.activities[0].name).toBe('Test Activity');
    }));

    it('should update an existing activity', runTest(async () => {
        const category = testContext.categories[0];
        const container = document.createElement('div');
        const root = createRoot(container);

        await act(() => {
            testContext.logActivity({
                name: 'Initial Name',
                category: category,
                startTime: Date.now(),
                endTime: Date.now() + 1000,
                duration: 1
            });
        }, root);
        
        const activityToUpdate = testContext.activities[0];
        expect(activityToUpdate).toBeDefined();

        await act(() => {
            testContext.updateActivity({
                ...activityToUpdate,
                name: 'Updated Name'
            });
        }, root);
        
        expect(testContext.activities[0].name).toBe('Updated Name');
    }));

    it('should delete an activity', runTest(async () => {
        const container = document.createElement('div');
        const root = createRoot(container);
        await act(() => {
            testContext.logActivity({
                name: 'To Be Deleted',
                category: testContext.categories[0],
                startTime: Date.now(),
                endTime: Date.now() + 1000,
                duration: 1
            });
        }, root);

        expect(testContext.activities).toHaveLength(1);
        const activityId = testContext.activities[0].id;
        
        await act(() => {
            testContext.deleteActivity(activityId);
        }, root);

        expect(testContext.activities).toHaveLength(0);
    }));

    it('should add a custom category', runTest(async () => {
        const initialCount = testContext.categories.length;
        const container = document.createElement('div');
        const root = createRoot(container);

        await act(() => {
            testContext.addCategory({
                name: 'Custom Test Category',
                color: 'text-pink-500',
                iconName: 'Heart'
            });
        }, root);

        expect(testContext.categories).toHaveLength(initialCount + 1);
        expect(testContext.categories.some((c: any) => c.name === 'Custom Test Category')).toBeTruthy();
    }));

    it('should update a custom category and reflect changes in activities', runTest(async () => {
        const container = document.createElement('div');
        const root = createRoot(container);
        await act(() => {
            testContext.addCategory({ name: 'Old Category Name', color: 'text-red-500', iconName: 'Car' });
        }, root);

        const newCategory = testContext.categories.find((c: any) => c.name === 'Old Category Name');
        expect(newCategory).toBeDefined();

        await act(() => {
            testContext.logActivity({ name: 'Activity with old category', category: newCategory!, startTime: 1, endTime: 2, duration: 1 });
        }, root);
        
        expect(testContext.activities[0].category.name).toBe('Old Category Name');

        await act(() => {
            testContext.updateCategory({ ...newCategory!, name: 'New Category Name' });
        }, root);
        
        const updatedCategory = testContext.categories.find((c: any) => c.id === newCategory!.id);
        expect(updatedCategory?.name).toBe('New Category Name');
        expect(testContext.activities[0].category.name).toBe('New Category Name');
    }));

    it('should delete a category and reassign its activities to "Other"', runTest(async () => {
        const container = document.createElement('div');
        const root = createRoot(container);

        await act(() => {
            testContext.addCategory({ name: 'Category To Delete', color: 'text-yellow-500', iconName: 'Sun' });
        }, root);

        const categoryToDelete = testContext.categories.find((c: any) => c.name === 'Category To Delete');
        expect(categoryToDelete).toBeDefined();

        await act(() => {
            testContext.logActivity({ name: 'Test Activity', category: categoryToDelete!, startTime: 1, endTime: 2, duration: 1 });
        }, root);

        expect(testContext.activities[0].category.name).toBe('Category To Delete');
        const initialCategoryCount = testContext.categories.length;
        
        await act(() => {
            testContext.deleteCategory(categoryToDelete!.id);
        }, root);

        expect(testContext.categories).toHaveLength(initialCategoryCount - 1);
        expect(testContext.categories.some((c: any) => c.id === categoryToDelete!.id)).toBeFalsy();
        expect(testContext.activities[0].category.id).toBe(OTHER_CATEGORY_ID);
        expect(testContext.activities[0].category.name).toBe('Other');
    }));

    it('should restore default categories without duplicating existing ones by name', runTest(async () => {
        const workCategory = testContext.categories.find((c: any) => c.name === 'Work');
        expect(workCategory).toBeDefined();
        const container = document.createElement('div');
        const root = createRoot(container);

        await act(() => {
            testContext.deleteCategory(workCategory!.id);
        }, root);
        expect(testContext.categories.some((c: any) => c.name === 'Work')).toBeFalsy();

        await act(() => {
            testContext.restoreDefaultCategories();
        }, root);

        expect(testContext.categories.some((c: any) => c.name === 'Work')).toBeTruthy();
        
        const learningCategories = testContext.categories.filter((c: any) => c.name === 'Learning');
        expect(learningCategories).toHaveLength(1);
    }));

  });

}
