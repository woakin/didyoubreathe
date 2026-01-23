import { useLocation, useNavigate } from 'react-router-dom';
import { Wind, Flame, Settings, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/i18n';
import { cn } from '@/lib/utils';

const HIDDEN_ROUTES = ['/', '/mood-check', '/auth', '/update-password'];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Hide on onboarding, breathing sessions, and auth pages
  const shouldHide = 
    HIDDEN_ROUTES.includes(location.pathname) || 
    location.pathname.startsWith('/breathe');

  if (shouldHide) return null;

  const navItems = [
    {
      icon: Wind,
      label: t.navigation.practice,
      path: '/techniques',
      isActive: location.pathname === '/techniques',
    },
    {
      icon: Flame,
      label: t.navigation.progress,
      path: '/progress',
      isActive: location.pathname === '/progress',
      requiresAuth: true,
    },
    {
      icon: Settings,
      label: t.navigation.settings,
      path: '/settings',
      isActive: location.pathname === '/settings',
    },
    {
      icon: User,
      label: t.navigation.profile,
      path: '/profile',
      isActive: location.pathname === '/profile',
      requiresAuth: true,
    },
  ];

  const handleNavClick = (path: string, requiresAuth?: boolean) => {
    if (requiresAuth && !user) {
      navigate('/auth');
    } else {
      navigate(path);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div 
        className="flex items-center justify-around h-16 
                   bg-background/80 backdrop-blur-lg border-t border-border/50
                   pb-[env(safe-area-inset-bottom)]"
      >
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavClick(item.path, item.requiresAuth)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-4 py-2 min-w-[64px]",
              "transition-colors duration-200",
              item.isActive 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
