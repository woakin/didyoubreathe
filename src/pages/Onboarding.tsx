import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Play, SkipForward } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoEnd = () => {
    navigate('/techniques');
  };

  const handleSkip = () => {
    navigate('/techniques');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between px-6 py-10 animate-fade-in">
      {/* Logo / Título */}
      <header className="text-center space-y-2">
        <h1 className="text-2xl font-light tracking-wide text-foreground/90">
          Did You Breathe?
        </h1>
        <p className="text-muted-foreground text-sm">
          Respira conscientemente, vive plenamente
        </p>
      </header>

      {/* Contenedor de Video */}
      <div className="flex-1 w-full max-w-sm flex flex-col items-center justify-center gap-6 py-8">
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
                Toca para comenzar
              </p>
            </div>
          )}
        </div>

      </div>

      {/* CTAs */}
      <footer className="w-full max-w-sm flex flex-col items-center gap-4">
        {!isPlaying ? (
          <Button 
            onClick={handlePlay} 
            className="w-full h-14 text-base font-medium rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <Play className="w-5 h-5 mr-2 fill-current" />
            Empezar ahora
          </Button>
        ) : (
          <Button 
            variant="secondary" 
            onClick={handleSkip} 
            className="w-full h-14 text-base font-medium rounded-xl"
          >
            Continuar a la App
          </Button>
        )}
        
        <button 
          onClick={handleSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 py-2"
        >
          Saltar introducción 
          <SkipForward className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
}
