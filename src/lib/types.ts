import type { LucideIcon } from "lucide-react";

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: LucideIcon;
}

export interface Activity {
  id: string;
  name: string;
  category: Category;
  startTime: number;
  endTime: number;
  duration: number; // in seconds
}
