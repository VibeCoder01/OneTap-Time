
"use client"

import React, { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
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
import { Edit, Trash2, PlusCircle, Tag, Upload, Download } from 'lucide-react';
import type { Category, Activity } from '@/lib/types';
import { cn } from '@/lib/utils';
import { iconMap } from '@/lib/types';
import { Separator } from './ui/separator';

interface CategoryManagerProps {
  categories: (Category & { isUsed: boolean })[];
  allActivities: Activity[];
  onAdd: (category: Omit<Category, 'id' | 'icon'>) => void;
  onUpdate: (category: Category) => void;
  onDelete: (id: string) => void;
  onImport: (data: { activities: Activity[], categories: Category[] }) => void;
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

export default function CategoryManager({ categories, allActivities, onAdd, onUpdate, onDelete, onImport }: CategoryManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleExport = () => {
    const dataToExport = {
        // Strip out the icon component before export
        categories: categories.map(({ icon, isUsed, ...rest }) => rest),
        activities: allActivities.map(({ category, ...rest }) => ({
            ...rest,
            category: {
                id: category.id,
                name: category.name,
                color: category.color,
                iconName: category.iconName,
            }
        })),
    };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'onetap-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text === 'string') {
            const data = JSON.parse(text);
            onImport(data);
          }
        } catch (error) {
          console.error("Failed to parse JSON file", error);
          alert("Failed to read the data file. It may be corrupted or in the wrong format.");
        }
      };
      reader.readAsText(file);
    }
    // Reset file input to allow re-uploading the same file
    if(event.target) {
        event.target.value = "";
    }
  };


  return (
    <Card className="shadow-lg w-full">
      <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="p-6">
              <div className="flex flex-row items-center justify-between w-full">
                <div>
                  <CardTitle className="text-xl font-headline flex items-center gap-2">
                      <Tag className="h-5 w-5"/>
                      Manage Categories
                  </CardTitle>
                  <CardDescription>Add, edit, or remove activity categories.</CardDescription>
                </div>
              </div>
          </AccordionTrigger>
          <AccordionContent>
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
                <Separator className="my-6" />
                <div>
                  <h3 className="text-lg font-medium mb-2">Import / Export</h3>
                  <p className="text-sm text-muted-foreground mb-4">Save your activities and categories to a file, or load them from a backup.</p>
                  <div className="flex gap-4">
                      <Button variant="outline" onClick={handleImportClick}>
                          <Upload className="mr-2 h-4 w-4" /> Import Data
                      </Button>
                      <input 
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          accept="application/json"
                      />
                      <Button variant="outline" onClick={handleExport}>
                          <Download className="mr-2 h-4 w-4" /> Export Data
                      </Button>
                  </div>
                </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
