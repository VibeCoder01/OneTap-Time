
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
  MoreHorizontal,
} from "lucide-react";
import type { Activity, Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { iconMap } from "@/lib/types";

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

interface TimerCardProps {
  onLogActivity: (activity: Omit<Activity, 'id'>) => void;
  categories: Category[];
}

export default function TimerCard({ onLogActivity, categories }: TimerCardProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activityName, setActivityName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Effect for restoring state from localStorage on initial load
  useEffect(() => {
    try {
      const savedIsRunning = localStorage.getItem("timerIsRunning") === "true";
      const savedStartTime = localStorage.getItem("timerStartTime");
      const savedActivityName = localStorage.getItem("timerActivityName");
      const savedSelectedCategoryId = localStorage.getItem("timerSelectedCategoryId");

      if (savedIsRunning && savedStartTime) {
        const startTime = parseInt(savedStartTime, 10);
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        
        startTimeRef.current = startTime;
        setElapsedTime(elapsed);
        setActivityName(savedActivityName || "");
        
        const categoryExists = categories.some(c => c.id === savedSelectedCategoryId);
        setSelectedCategoryId(savedSelectedCategoryId && categoryExists ? savedSelectedCategoryId : categories[0]?.id || "");
        setIsRunning(true);
      } else {
        // If not running, ensure a default category is selected if available
        if (categories.length > 0 && !selectedCategoryId) {
            setSelectedCategoryId(categories[0].id);
        }
      }
    } catch (error) {
        console.error("Could not read from localStorage", error);
        // Fallback for environments where localStorage is not available
        if (categories.length > 0 && !selectedCategoryId) {
            setSelectedCategoryId(categories[0].id);
        }
    }
  // This effect should only run once on mount, with categories as a dependency to set initial category.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  // Effect for managing the interval and saving state to localStorage
  useEffect(() => {
    if (isRunning) {
      // If running, set up the interval to update the elapsed time
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const now = Date.now();
          setElapsedTime(Math.floor((now - startTimeRef.current) / 1000));
        }
      }, 1000);

      // Save the current running state to localStorage
      try {
        localStorage.setItem("timerIsRunning", "true");
        localStorage.setItem("timerStartTime", String(startTimeRef.current));
        localStorage.setItem("timerActivityName", activityName);
        localStorage.setItem("timerSelectedCategoryId", selectedCategoryId);
      } catch (error) {
        console.error("Could not write to localStorage", error);
      }
    } else {
      // If not running, clear the interval and remove items from localStorage
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      try {
        localStorage.removeItem("timerIsRunning");
        localStorage.removeItem("timerStartTime");
        localStorage.removeItem("timerActivityName");
        localStorage.removeItem("timerSelectedCategoryId");
      } catch (error) {
         console.error("Could not clear localStorage", error);
      }
    }

    // Cleanup function to clear the interval when the component unmounts or dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, activityName, selectedCategoryId]);

  const handleStartStop = () => {
    if (isRunning) {
      // --- STOPPING THE TIMER ---
      if(startTimeRef.current && elapsedTime > 0) {
        const selectedCategory = categories.find(c => c.id === selectedCategoryId);
        // If category was deleted while timer was running, default to first available
        const categoryToLog = selectedCategory || categories[0];

        if (categoryToLog) {
            onLogActivity({
                name: activityName || "Untitled Activity",
                category: categoryToLog,
                startTime: startTimeRef.current,
                endTime: Date.now(),
                duration: elapsedTime,
            });
        }
      }
      
      // Reset state for next activity
      setIsRunning(false);
      setActivityName("");
      setElapsedTime(0);
      startTimeRef.current = null;
      if (categories.length > 0) {
        setSelectedCategoryId(categories[0].id)
      }

    } else {
      // --- STARTING THE TIMER ---
      if (categories.length === 0) {
        alert("Please add a category before starting the timer.");
        return;
      }
      
      // Set the start time relative to any existing elapsed time (which should be 0 unless there's a bug)
      startTimeRef.current = Date.now() - elapsedTime * 1000;
      
      // If no category is selected, default to the first one
      if (!selectedCategoryId && categories.length > 0) {
        setSelectedCategoryId(categories[0].id)
      }
      setIsRunning(true);
    }
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const Icon = selectedCategory ? iconMap[selectedCategory.iconName] : MoreHorizontal;

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
          <div className="overflow-hidden p-1">
             <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Activity name"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                className="flex-grow text-base"
                aria-label="Activity Name"
                disabled={!isRunning}
              />
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId} disabled={!isRunning || categories.length === 0}>
                <SelectTrigger className="w-full sm:w-[180px]" aria-label="Category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => {
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
