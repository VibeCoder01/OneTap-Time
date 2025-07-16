import { Timer } from 'lucide-react';

export default function Header() {
  return (
    <header className="w-full max-w-4xl mx-auto">
      <div className="flex items-center space-x-2">
        <Timer className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold font-headline text-foreground">
          OneTap Time
        </h1>
      </div>
    </header>
  );
}
