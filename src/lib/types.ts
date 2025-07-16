"use client"
import type { LucideIcon } from "lucide-react";
import { 
  Briefcase, 
  BookOpen, 
  Dumbbell, 
  User, 
  MoreHorizontal, 
  Sun, 
  Moon,
  Code,
  Palette,
  Music,
  Home,
  Utensils,
  Gamepad2,
  ShoppingBag,
  Film
} from 'lucide-react';

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

export const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Briefcase,
  BookOpen,
  Dumbbell,
  User,
  Code,
  Palette,
  Music,
  Home,
  Utensils,
  Gamepad2,
  ShoppingBag,
  Film,
  Sun,
  Moon,
  MoreHorizontal,
};
