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

export const OTHER_CATEGORY_ID = 'e9c2e3a3-4956-4b2a-a3d8-e8a32d184a7e';

export const initialCategories: Category[] = [
  { id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', name: 'Work', color: 'text-blue-500', iconName: 'Briefcase' },
  { id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1', name: 'Learning', color: 'text-green-500', iconName: 'BookOpen' },
  { id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef23', name: 'Exercise', color: 'text-red-500', iconName: 'Dumbbell' },
  { id: 'd4e5f6a7-b8c9-0123-4567-890abcdef345', name: 'Personal', color: 'text-purple-500', iconName: 'User' },
  { id: OTHER_CATEGORY_ID, name: 'Other', color: 'text-gray-500', iconName: 'MoreHorizontal' },
];
