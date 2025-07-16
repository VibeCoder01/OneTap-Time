
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Square,
  Briefcase,
  BookOpen,
  Dumbbell,
  User,
  MoreHorizontal,
} from "lucide-react";
import type { Activity, Category } from "@/lib/types";
import { cn } from "@/lib/utils";

const categories: Category[] = [
  { id: "work", name: "Work", color: "text-blue-500", icon: Briefcase },
  { id: "learning", name: "Learning", color: "text-green-500", icon: BookOpen },
  { id: "exercise", name: "Exercise", color: "text-red-500", icon: Dumbbell },
  { id: "personal", name: "Personal", color: "text-purple-500", icon: User },
  { id: "other", name: "Other", color: "text-gray-500", icon: MoreHorizontal },
];

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

interface TimerCardProps {
  onLogActivity: (activity: Omit<Activity, 'id'>) => void;
}

export default function TimerCard({ onLogActivity }: TimerCardProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activityName, setActivityName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0].id);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - elapsedTime * 1000;
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const now = Date.now();
          const elapsed = Math.floor((now - startTimeRef.current) / 1000);
          setElapsedTime(elapsed);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, elapsedTime]);

  const handleStartStop = () => {
    if (isRunning) {
      // Stopping the timer
      setIsRunning(false);
      
      if(startTimeRef.current && elapsedTime > 0) {
        const selectedCategory = categories.find(c => c.id === selectedCategoryId)!;
        onLogActivity({
          name: activityName || "Untitled Activity",
          category: selectedCategory,
          startTime: startTimeRef.current,
          endTime: Date.now(),
          duration: elapsedTime,
        });
      }
      
      // Reset for next activity
      setActivityName("");
      setElapsedTime(0);
      startTimeRef.current = null;
    } else {
      // Starting the timer
      setIsRunning(true);
    }
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const Icon = selectedCategory?.icon || MoreHorizontal;

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline">
          {isRunning ? "Activity in Progress..." : "Press Start to begin."}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className={cn(
            "grid transition-all duration-700 ease-in-out",
            isRunning ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}>
          <div className="overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-4 pt-1">
              <Input
                placeholder="Activity name"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                className="flex-grow text-base"
                aria-label="Activity Name"
              />
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger className="w-full sm:w-[180px]" aria-label="Category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <category.icon className={`h-4 w-4 ${category.color}`} />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="text-center bg-muted/50 rounded-lg p-4">
          <p className="text-6xl font-mono font-bold tracking-tighter text-foreground">
            {formatTime(elapsedTime)}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleStartStop}
          className={`w-full transition-all duration-300 ${isRunning ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"}`}
          size="lg"
        >
          {isRunning ? (
            <>
              <Square className="mr-2 h-5 w-5" /> Stop Timer
            </>
          ) : (
            <>
              <Play className="mr-2 h-5 w-5" /> Start Timer
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
