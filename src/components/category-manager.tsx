
"use client"

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, PlusCircle, Tag } from 'lucide-react';
import type { Category } from '@/lib/types';
import { cn } from '@/lib/utils';
import { iconMap } from '@/lib/types';

interface CategoryManagerProps {
  categories: (Category & { isUsed: boolean })[];
  onAdd: (category: Omit<Category, 'id' | 'icon'>) => void;
  onUpdate: (category: Category) => void;
  onDelete: (id: string) => void;
}

const availableIcons = Object.keys(iconMap);
const availableColors = [
  { name: 'Blue', value: 'text-blue-500' },
  { name: 'Green', value: 'text-green-500' },
  { name: 'Red', value: 'text-red-500' },
  { name: 'Purple', value: 'text-purple-500' },
  { name: 'Gray', value: 'text-gray-500' },
  { name: 'Yellow', value: 'text-yellow-500' },
  { name: 'Pink', value: 'text-pink-500' },
];

function CategoryForm({ 
  category,
  onSave,
}: {
  category?: Category,
  onSave: (data: Omit<Category, 'id' | 'icon'>) => void,
}) {
  const [name, setName] = useState(category?.name || "");
  const [color, setColor] = useState(category?.color || availableColors[0].value);
  const [iconName, setIconName] = useState(category?.iconName || availableIcons[0]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onSave({ name, color, iconName });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="category-name">Category Name</Label>
        <Input 
          id="category-name" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Project Phoenix"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category-icon">Icon</Label>
          <Select value={iconName} onValueChange={setIconName}>
            <SelectTrigger id="category-icon">
              <SelectValue placeholder="Select an icon" />
            </SelectTrigger>
            <SelectContent>
              {availableIcons.map(iconKey => {
                const IconComponent = iconMap[iconKey];
                return (
                  <SelectItem key={iconKey} value={iconKey}>
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      <span>{iconKey}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category-color">Color</Label>
           <Select value={color} onValueChange={setColor}>
            <SelectTrigger id="category-color">
              <SelectValue placeholder="Select a color" />
            </SelectTrigger>
            <SelectContent>
              {availableColors.map(c => {
                return (
                  <SelectItem key={c.value} value={c.value}>
                    <div className="flex items-center gap-2">
                      <div className={cn("h-4 w-4 rounded-full", c.value.replace('text-', 'bg-'))} />
                      <span>{c.name}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="submit">Save Category</Button>
        </DialogClose>
      </DialogFooter>
    </form>
  )
}

export default function CategoryManager({ categories, onAdd, onUpdate, onDelete }: CategoryManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);

  const handleSave = (data: Omit<Category, 'id' | 'icon'>) => {
    if (editingCategory) {
      onUpdate({ ...editingCategory, ...data });
    } else {
      onAdd(data);
    }
    setIsFormOpen(false);
    setEditingCategory(undefined);
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  }
  
  const openAddDialog = () => {
    setEditingCategory(undefined);
    setIsFormOpen(true);
  }

  return (
    <Card className="shadow-lg w-full">
        <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center gap-2">
                <Tag className="h-5 w-5"/>
                Manage Categories
            </CardTitle>
            <CardDescription>Add, edit, or remove activity categories.</CardDescription>
        </CardHeader>
        <CardContent>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                    <Button onClick={openAddDialog} className="mb-4">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Category
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                    </DialogHeader>
                    <CategoryForm category={editingCategory} onSave={handleSave} />
                </DialogContent>
            </Dialog>
            <div className="space-y-2">
            {categories.length > 0 ? (
                categories.map((category) => {
                const CategoryIcon = iconMap[category.iconName];
                return (
                    <div key={category.id} className="flex items-center gap-4 p-2 bg-card rounded-lg border">
                    <CategoryIcon className={cn("h-5 w-5", category.color)} />
                    <p className="flex-grow font-medium text-foreground">{category.name}</p>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => openEditDialog(category)}>
                        <Edit className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" disabled={category.isUsed}>
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the "{category.name}" category.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(category.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                        </AlertDialog>

                    </div>
                    </div>
                );
                })
            ) : (
                <div className="text-center py-10 text-muted-foreground">
                    <p>No categories found.</p>
                    <p className="text-sm">Click "Add Category" to get started.</p>
                </div>
            )}
            </div>
        </CardContent>
    </Card>
  );
}
