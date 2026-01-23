import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Play, SkipForward } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { cn } from '@/lib/utils';

const ONBOARDING_COMPLETE_KEY = 'hasCompletedOnboarding';

export default function Onboarding() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { t } = useLanguage();

  // Check if returning user
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_COMPLETE_KEY);
    if (hasSeenOnboarding === 'true') {
      // Returning user - skip to mood check
      navigate('/mood-check', { replace: true });
    }
  }, [navigate]);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoEnd = () => {
    // Start glassmorphism transition
    setIsTransitioning(true);
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    
    // Navigate after transition completes
    setTimeout(() => {
      navigate('/mood-check');
    }, 800);
  };

  const handleSkip = () => {
    setIsTransitioning(true);
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    
    setTimeout(() => {
      navigate('/mood-check');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between px-6 py-10 animate-fade-in relative overflow-hidden">
      {/* Logo / Título */}
      <header className={cn(
        "text-center space-y-2 transition-all duration-500 z-10",
        isTransitioning && "opacity-0 translate-y-[-20px]"
      )}>
        <h1 className="text-2xl font-light tracking-wide text-foreground/90">
          {t.onboarding.title}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t.onboarding.subtitle}
        </p>
      </header>

      {/* Contenedor de Video */}
      <div className={cn(
        "flex-1 w-full max-w-sm flex flex-col items-center justify-center gap-6 py-8 transition-all duration-700 z-10",
        isTransitioning && "scale-95 opacity-0"
      )}>
        <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden shadow-xl bg-card border border-border">
          <video
            ref={videoRef}
            src="/videos/onboarding-intro.mp4"
            className="w-full h-full object-cover"
            playsInline
            preload="auto"
            onEnded={handleVideoEnd}
          />

          {/* Overlay con botón Play (solo cuando no está reproduciendo) */}
          {!isPlaying && (
            <div 
              onClick={handlePlay}
              className="absolute inset-0 flex flex-col items-center justify-center bg-foreground/30 backdrop-blur-[2px] cursor-pointer group"
            >
              {/* Indicador de duración integrado */}
              <span className="absolute bottom-4 right-4 text-xs text-white/80 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
                30s
              </span>
              
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-primary shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Play className="w-9 h-9 text-primary-foreground fill-primary-foreground ml-1" />
              </div>
              <p className="mt-5 text-primary-foreground font-medium text-sm bg-primary/90 px-4 py-2 rounded-full">
                {t.onboarding.tapToStart}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CTAs */}
      <footer className={cn(
        "w-full max-w-sm flex flex-col items-center gap-4 z-10 transition-all duration-500",
        isTransitioning && "opacity-0 translate-y-[20px]"
      )}>
        {isPlaying && (
          <Button 
            variant="secondary" 
            onClick={handleSkip} 
            className="w-full h-14 text-base font-medium rounded-xl"
          >
            {t.onboarding.continueToApp}
          </Button>
        )}
        
        <button 
          onClick={handleSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 py-2"
        >
          {t.onboarding.skipIntro}
          <SkipForward className="w-4 h-4" />
        </button>
      </footer>

      {/* Glassmorphism transition overlay */}
      <div 
        className={cn(
          "absolute inset-0 transition-all duration-700 pointer-events-none",
          isTransitioning 
            ? "backdrop-blur-xl bg-background/70" 
            : "backdrop-blur-0 bg-transparent"
        )}
      />
    </div>
  );
}
