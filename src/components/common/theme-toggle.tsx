'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const [theme, setThemeState] = React.useState<'light' | 'dark'>('dark');

  React.useEffect(() => {
    setMounted(true);
    // Initial theme check on mount
    const savedTheme = localStorage.getItem('nexushub-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      const isDark = document.documentElement.classList.contains('dark');
      setThemeState(isDark ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    
    // Update DOM
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Persist to localStorage
    localStorage.setItem('nexushub-theme', newTheme);
    
    // Persist to Firestore if logged in
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          'preferences.theme': newTheme
        });
      } catch (error) {
        // Silently fail if firestore update fails (e.g. connectivity)
        console.error("Error updating theme preference in Firestore:", error);
      }
    }
  };

  const buttonContent = (
    <>
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Changer le thème</span>
    </>
  );

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="text-foreground/90" disabled>
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="icon" className="text-foreground/90" onClick={toggleTheme}>
      {buttonContent}
    </Button>
  );
}
