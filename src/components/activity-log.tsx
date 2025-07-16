
"use client";

import { useState } from "react";
import { format } from "date-fns";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Activity, Category } from "@/lib/types";
import { iconMap } from "@/lib/types";
import { Trash2, ListChecks, ChevronsUpDown, MoreVertical, Edit, MoreHorizontal } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ActivityLogProps {
  activities: Activity[];
  categories: Category[];
  onUpdate: (activity: Activity) => void;
  onDelete: (id: string) => void;
}

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s > 0 ? `${s}s` : ''}`.trim();
};

function EditActivityForm({ 
  activity,
  categories,
  onSave,
  onClose,
}: {
  activity: Activity,
  categories: Category[],
  onSave: (data: Activity) => void,
  onClose: () => void,
}) {
  const [name, setName] = useState(activity.name);
  const [selectedCategoryId, setSelectedCategoryId] = useState(activity.category.id);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !selectedCategoryId) return;
    
    const selectedCategory = categories.find(c => c.id === selectedCategoryId);
    if (!selectedCategory) return;

    onSave({
      ...activity,
      name,
      category: selectedCategory,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="activity-name">Activity Name</Label>
        <Input 
          id="activity-name" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          placeholder="Untitled Activity"
          required
        />
      </div>
      <div>
        <Label htmlFor="activity-category">Category</Label>
        <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
          <SelectTrigger id="activity-category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => {
              const CategoryIcon = iconMap[category.iconName] || MoreHorizontal;
              return (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <CategoryIcon className={cn("h-4 w-4", category.color)} />
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="ghost">Cancel</Button>
        </DialogClose>
        <Button type="submit">Save Changes</Button>
      </DialogFooter>
    </form>
  )
}

export default function ActivityLog({ activities, categories, onUpdate, onDelete }: ActivityLogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
  };
  
  const handleSaveEdit = (updatedActivity: Activity) => {
    onUpdate(updatedActivity);
    setEditingActivity(null);
  }

  const handleCloseDialog = () => {
    setEditingActivity(null);
  }

  return (
    <>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <Card className="shadow-lg w-full">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 rounded-t-lg transition-colors">
              <div className="flex justify-between items-center">
                  <div className="flex-grow">
                      <CardTitle className="text-xl font-headline flex items-center gap-2">
                          <ListChecks className="h-5 w-5"/>
                          Activity Log
                      </CardTitle>
                      <CardDescription>A chronological record of your tracked time.</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    <ChevronsUpDown className="h-4 w-4" />
                    <span className="sr-only">Toggle</span>
                  </Button>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-6">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {activities.length > 0 ? (
                    activities.map((activity) => {
                      const CategoryIcon = activity.category.icon;
                      if (!CategoryIcon) return null; // Should not happen if data is consistent
                      return (
                        <DropdownMenu key={activity.id}>
                           <DropdownMenuTrigger asChild>
                              <div className="flex items-center gap-4 p-3 bg-card rounded-lg border transition-all hover:bg-muted/50 cursor-pointer">
                                <div className={`p-2 rounded-full bg-muted`}>
                                  <CategoryIcon className={`h-5 w-5 ${activity.category.color}`} />
                                </div>
                                <div className="flex-grow">
                                  <p className="font-semibold text-foreground">{activity.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {format(new Date(activity.startTime), "HH:mm")} - {format(new Date(activity.endTime), "HH:mm")}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-foreground">{formatDuration(activity.duration)}</p>
                                  <p className="text-sm text-muted-foreground">{activity.category.name}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0 h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </div>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => handleEdit(activity)}>
                                <Edit className="mr-2 h-4 w-4"/>
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => onDelete(activity.id)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4"/>
                                <span>Delete</span>
                              </DropdownMenuItem>
                           </DropdownMenuContent>
                        </DropdownMenu>
                      );
                    })
                  ) : (
                    <div className="text-center py-16 text-muted-foreground">
                      <p>No activities logged yet.</p>
                      <p className="text-sm">Completed timers will appear here.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
      {editingActivity && (
        <Dialog open={!!editingActivity} onOpenChange={(isOpen) => !isOpen && setEditingActivity(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Activity</DialogTitle>
            </DialogHeader>
            <EditActivityForm 
              activity={editingActivity}
              categories={categories}
              onSave={handleSaveEdit}
              onClose={handleCloseDialog}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
