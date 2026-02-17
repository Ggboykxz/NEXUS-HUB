'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // On mount, set the theme based on localStorage or system preference
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    try {
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      }
    } catch (e) {
      // localStorage is not available
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
        {buttonContent}
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="icon" className="text-foreground/90" onClick={toggleTheme}>
      {buttonContent}
    </Button>
  );
}
