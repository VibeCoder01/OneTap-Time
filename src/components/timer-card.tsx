
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
import { cn } from "@/lib/utils";
import { iconMap } from "@/lib/data";
import { useAppContext } from "@/context/app-context";

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

interface TimerState {
  isRunning: boolean;
  startTime: number | null;
  activityName: string;
  selectedCategoryId: string;
}

const getInitialState = (): TimerState => {
  if (typeof window === "undefined") {
    return { isRunning: false, startTime: null, activityName: "", selectedCategoryId: "" };
  }
  try {
    const savedState = localStorage.getItem("timerState");
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      if (parsedState.isRunning && parsedState.startTime) {
        return parsedState;
      }
    }
  } catch (error) {
    console.error("Failed to read timer state from localStorage", error);
  }
  return { isRunning: false, startTime: null, activityName: "", selectedCategoryId: "" };
};

export default function TimerCard() {
  const { categories, logActivity } = useAppContext();
  const [timerState, setTimerState] = useState<TimerState>(getInitialState);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { isRunning, startTime, activityName, selectedCategoryId } = timerState;

  useEffect(() => {
    if (isRunning && startTime) {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      intervalRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setElapsedTime(0);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, startTime]);
  
  useEffect(() => {
    try {
      if(isRunning) {
        localStorage.setItem("timerState", JSON.stringify(timerState));
      } else {
        localStorage.removeItem("timerState");
      }
    } catch (error) {
      console.error("Failed to write timer state to localStorage", error);
    }
  }, [timerState, isRunning]);

  useEffect(() => {
    if (!isRunning && categories.length > 0 && !categories.some(c => c.id === selectedCategoryId)) {
       setTimerState(prevState => ({ ...prevState, selectedCategoryId: categories[0].id }));
    }
  }, [categories, isRunning, selectedCategoryId]);
  
  const handleStartStop = () => {
    if (isRunning) {
      if(startTime && elapsedTime > 0) {
        const selectedCategory = categories.find(c => c.id === selectedCategoryId);
        const categoryToLog = selectedCategory || categories[0];

        if (categoryToLog) {
            logActivity({
                name: activityName || "Untitled Activity",
                category: categoryToLog,
                startTime: startTime,
                endTime: Date.now(),
                duration: elapsedTime,
            });
        }
      }
      
      setTimerState({
        isRunning: false,
        startTime: null,
        activityName: "",
        selectedCategoryId: categories[0]?.id || "",
      });

    } else {
      if (categories.length === 0) {
        alert("Please add a category before starting the timer.");
        return;
      }
      
      setTimerState(prevState => ({
        ...prevState,
        isRunning: true,
        startTime: Date.now(),
        selectedCategoryId: prevState.selectedCategoryId || categories[0]?.id,
      }));
    }
  };
  
  const setActivityName = (name: string) => {
    setTimerState(prevState => ({...prevState, activityName: name}));
  }

  const setSelectedCategoryId = (id: string) => {
    setTimerState(prevState => ({...prevState, selectedCategoryId: id}));
  }

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
