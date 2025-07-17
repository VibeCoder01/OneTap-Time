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
  Film,
  Heart,
  Car,
  Plane,
  GraduationCap,
  Sprout,
  Pencil,
  Lightbulb,
  Headphones,
  Coffee,
  MessageSquare,
  Phone,
  Calendar,
  Wrench,
  Globe,
  Brush,
  PoundSterling,
  TrendingUp,
  Bike,
  Bed,
  Tv,
  Castle,
  Crown,
  Ship,
  Anchor,
  Umbrella,
  TrainFront,
  Bus,
  Landmark,
  Church,
  Beer,
  Drama,
  Library,
  Footprints,
  Cloudy,
  Tractor
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
  Heart,
  Car,
  Plane,
  GraduationCap,
  Sprout,
  Pencil,
  Lightbulb,
  Headphones,
  Coffee,
  MessageSquare,
  Phone,
  Calendar,
  Wrench,
  Globe,
  Brush,
  PoundSterling,
  TrendingUp,
  Bike,
  Bed,
  Tv,
  Castle,
  Crown,
  Ship,
  Anchor,
  Umbrella,
  TrainFront,
  Bus,
  Landmark,
  Church,
  Beer,
  Drama,
  Library,
  Footprints,
  Cloudy,
  Tractor,
  MoreHorizontal,
};

export const initialCategories: Category[] = [
  { id: 'work', name: 'Work', color: 'text-blue-500', iconName: 'Briefcase' },
  { id: 'learning', name: 'Learning', color: 'text-green-500', iconName: 'BookOpen' },
  { id: 'exercise', name: 'Exercise', color: 'text-red-500', iconName: 'Dumbbell' },
  { id: 'personal', name: 'Personal', color: 'text-purple-500', iconName: 'User' },
  { id: 'other', name: 'Other', color: 'text-gray-500', iconName: 'MoreHorizontal' },
];
