
"use client"
import type { LucideIcon } from "lucide-react";

export interface Category {
  id: string;
  name: string;
  color: string;
  iconName: string; // Store icon name instead of component
  icon?: LucideIcon; // Optional icon component for rendering
}

export interface Activity {
  id:string;
  name: string;
  category: Category;
  startTime: number;
  endTime: number;
  duration: number; // in seconds
}
