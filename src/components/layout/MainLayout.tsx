import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
  showBackground?: boolean;
}

export function MainLayout({ children, className, showBackground = true }: MainLayoutProps) {
  return (
    <div className={cn('relative min-h-screen', className)}>
      {/* Subtle background pattern */}
      {showBackground && (
        <div className="fixed inset-0 -z-10 overflow-hidden">
          {/* Warm gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 via-background to-accent/20" />
          
          {/* Organic shapes */}
          <div className="absolute top-20 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-20 -right-32 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-breath-glow/5 blur-3xl" />
        </div>
      )}
      
      {children}
    </div>
  );
}
