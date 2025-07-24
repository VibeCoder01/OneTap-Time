
import { renderHook, act } from '@testing-library/react';
import { AppProvider, useAppContext } from '@/context/app-context';
import { describe, it } from '@/lib/test-runner';
import React, { ReactNode } from 'react';
import { initialCategories, OTHER_CATEGORY_ID } from '@/lib/data';

// Because we're not in a real test environment, we have to mock some things manually.
// This sets up a global `expect` function like Jest or Vitest would.
declare const expect: (actual: any) => any;

const wrapper = ({ children }: { children: ReactNode }) => <AppProvider>{children}</AppProvider>;

export function runAppContextTests() {

  describe('App Context Data Management', () => {

    it('should initialize with default categories and no activities', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });
      expect(result.current.activities).toHaveLength(0);
      // We check if the default category names are present.
      const defaultNames = initialCategories.map(c => c.name);
      const hookNames = result.current.categories.map(c => c.name);
      expect(hookNames.sort()).toEqual(defaultNames.sort());
    });
    
    it('should add a new activity', () => {
        const { result } = renderHook(() => useAppContext(), { wrapper });
        const category = result.current.categories[0];
        expect(category).toBeDefined();

        act(() => {
            result.current.logActivity({
                name: 'Test Activity',
                category: category,
                startTime: Date.now(),
                endTime: Date.now() + 1000,
                duration: 1
            });
        });

        expect(result.current.activities).toHaveLength(1);
        expect(result.current.activities[0].name).toBe('Test Activity');
    });

    it('should update an existing activity', () => {
        const { result } = renderHook(() => useAppContext(), { wrapper });
        const category = result.current.categories[0];
        act(() => {
            result.current.logActivity({
                name: 'Initial Name',
                category: category,
                startTime: Date.now(),
                endTime: Date.now() + 1000,
                duration: 1
            });
        });
        
        const activityToUpdate = result.current.activities[0];
        expect(activityToUpdate).toBeDefined();

        act(() => {
            result.current.updateActivity({
                ...activityToUpdate,
                name: 'Updated Name'
            });
        });
        
        expect(result.current.activities[0].name).toBe('Updated Name');
    });

    it('should delete an activity', () => {
        const { result } = renderHook(() => useAppContext(), { wrapper });
        act(() => {
            result.current.logActivity({
                name: 'To Be Deleted',
                category: result.current.categories[0],
                startTime: Date.now(),
                endTime: Date.now() + 1000,
                duration: 1
            });
        });

        expect(result.current.activities).toHaveLength(1);
        const activityId = result.current.activities[0].id;
        
        act(() => {
            result.current.deleteActivity(activityId);
        });

        expect(result.current.activities).toHaveLength(0);
    });

    it('should add a custom category', () => {
        const { result } = renderHook(() => useAppContext(), { wrapper });
        const initialCount = result.current.categories.length;

        act(() => {
            result.current.addCategory({
                name: 'Custom Test Category',
                color: 'text-pink-500',
                iconName: 'Heart'
            });
        });

        expect(result.current.categories).toHaveLength(initialCount + 1);
        expect(result.current.categories.some(c => c.name === 'Custom Test Category')).toBeTruthy();
    });

    it('should update a custom category and reflect changes in activities', () => {
        const { result } = renderHook(() => useAppContext(), { wrapper });
        
        act(() => {
            result.current.addCategory({ name: 'Old Category Name', color: 'text-red-500', iconName: 'Car' });
        });

        const newCategory = result.current.categories.find(c => c.name === 'Old Category Name');
        expect(newCategory).toBeDefined();

        act(() => {
            result.current.logActivity({ name: 'Activity with old category', category: newCategory!, startTime: 1, endTime: 2, duration: 1 });
        });
        
        expect(result.current.activities[0].category.name).toBe('Old Category Name');

        act(() => {
            result.current.updateCategory({ ...newCategory!, name: 'New Category Name' });
        });
        
        const updatedCategory = result.current.categories.find(c => c.id === newCategory!.id);
        expect(updatedCategory?.name).toBe('New Category Name');
        expect(result.current.activities[0].category.name).toBe('New Category Name');
    });

    it('should delete a category and reassign its activities to "Other"', () => {
        const { result } = renderHook(() => useAppContext(), { wrapper });
        
        act(() => {
            result.current.addCategory({ name: 'Category To Delete', color: 'text-yellow-500', iconName: 'Sun' });
        });

        const categoryToDelete = result.current.categories.find(c => c.name === 'Category To Delete');
        expect(categoryToDelete).toBeDefined();

        act(() => {
            result.current.logActivity({ name: 'Test Activity', category: categoryToDelete!, startTime: 1, endTime: 2, duration: 1 });
        });

        expect(result.current.activities[0].category.name).toBe('Category To Delete');
        const initialCategoryCount = result.current.categories.length;
        
        act(() => {
            result.current.deleteCategory(categoryToDelete!.id);
        });

        expect(result.current.categories).toHaveLength(initialCategoryCount - 1);
        expect(result.current.categories.some(c => c.id === categoryToDelete!.id)).toBeFalsy();
        expect(result.current.activities[0].category.id).toBe(OTHER_CATEGORY_ID);
        expect(result.current.activities[0].category.name).toBe('Other');
    });

    it('should restore default categories without duplicating existing ones by name', () => {
        const { result } = renderHook(() => useAppContext(), { wrapper });
        
        // First, delete a default category ('Work')
        const workCategory = result.current.categories.find(c => c.name === 'Work');
        expect(workCategory).toBeDefined();
        act(() => {
            result.current.deleteCategory(workCategory!.id);
        });
        expect(result.current.categories.some(c => c.name === 'Work')).toBeFalsy();

        // Now, restore defaults
        act(() => {
            result.current.restoreDefaultCategories();
        });

        // 'Work' should be back
        expect(result.current.categories.some(c => c.name === 'Work')).toBeTruthy();
        
        // There should be only one of each default category
        const learningCategories = result.current.categories.filter(c => c.name === 'Learning');
        expect(learningCategories).toHaveLength(1);
    });

  });

}
