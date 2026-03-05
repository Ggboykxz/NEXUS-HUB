'use client';

import * as React from 'react';
import { Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Bouton de thème désactivé car le mode sombre est forcé sur toute l'application.
 */
export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="text-foreground/90" disabled>
        <Moon className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="icon" className="text-foreground/90 cursor-default" disabled>
      <Moon className="h-5 w-5" />
      <span className="sr-only">Mode sombre actif</span>
    </Button>
  );
}