
"use client"

import React, { useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, Database } from 'lucide-react';
import type { Category, Activity } from '@/lib/types';

interface DataManagerProps {
  categories: Category[];
  activities: Activity[];
  onImport: (data: { activities: Activity[], categories: Category[] }) => void;
}

export default function DataManager({ activities, categories, onImport }: DataManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataToExport = {
        categories: categories.map(({ icon, ...rest }) => rest),
        activities: activities.map(({ category, ...rest }) => ({
            ...rest,
            category: {
                id: category.id,
                name: category.name,
                color: category.color,
                iconName: category.iconName,
            }
        })),
    };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'onetap-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text === 'string') {
            const data = JSON.parse(text);
            onImport(data);
          }
        } catch (error) {
          console.error("Failed to parse JSON file", error);
          alert("Failed to read the data file. It may be corrupted or in the wrong format.");
        }
      };
      reader.readAsText(file);
    }
    if(event.target) {
        event.target.value = "";
    }
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center gap-2">
            <Database className="h-5 w-5"/>
            Data Management
        </CardTitle>
        <CardDescription>Save or load your app data from a file.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">Save your activities and categories to a file, or load them from a backup.</p>
        <div className="flex gap-4">
            <Button variant="outline" onClick={handleImportClick}>
                <Upload className="mr-2 h-4 w-4" /> Import Data
            </Button>
            <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="application/json"
            />
            <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" /> Export Data
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
