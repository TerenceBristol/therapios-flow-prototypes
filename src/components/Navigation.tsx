import React from 'react';
import Link from 'next/link';
import Logo from './Logo';

export const Navigation: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo size="lg" />
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
            <div className="text-sm text-muted-foreground">
              Flow Healthcare Prototypes
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
