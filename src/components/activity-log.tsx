"use client";

import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Activity } from "@/lib/types";
import { Trash2, ListChecks } from 'lucide-react';

interface ActivityLogProps {
  activities: Activity[];
  onDelete: (id: string) => void;
}

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s > 0 ? `${s}s` : ''}`.trim();
};

export default function ActivityLog({ activities, onDelete }: ActivityLogProps) {
  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center gap-2">
            <ListChecks className="h-5 w-5"/>
            Activity Log
        </CardTitle>
        <CardDescription>A chronological record of your tracked time.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity) => {
                const CategoryIcon = activity.category.icon;
                return (
                  <div key={activity.id} className="flex items-center gap-4 p-3 bg-card rounded-lg border transition-all hover:bg-muted/50">
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
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0" onClick={() => onDelete(activity.id)} aria-label={`Delete ${activity.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
    </Card>
  );
}
