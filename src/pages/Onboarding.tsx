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
    <div className="min-h-screen bg-background flex flex-col items-center justify-between p-6 py-12">
      {/* Logo / Título */}
      <div className="text-center">
        <h1 className="text-3xl font-light tracking-wide text-foreground">
          Did You Breathe?
        </h1>
      </div>

      {/* Contenedor de Video */}
      <div className="flex-1 w-full max-w-md flex flex-col items-center justify-center gap-4">
        <div className="relative w-full aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl bg-black">
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
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 cursor-pointer transition-opacity"
            >
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 hover:scale-110 transition-transform">
                <Play className="w-10 h-10 text-white fill-white" />
              </div>
              <p className="mt-4 text-white/90 font-medium">
                Toca para comenzar
              </p>
            </div>
          )}
        </div>

        {/* Indicador de duración */}
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <span>•</span> 30 segundos <span>•</span>
        </p>
      </div>

      {/* CTAs */}
      <div className="w-full max-w-md flex flex-col items-center gap-4">
        {!isPlaying ? (
          <Button onClick={handlePlay} className="w-full h-14 text-lg rounded-full">
            Empezar ahora
          </Button>
        ) : (
          <Button variant="outline" onClick={handleSkip} className="w-full h-14 text-lg rounded-full border-dashed">
            Continuar a la App
          </Button>
        )}
        
        <button 
          onClick={handleSkip}
          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          Saltar introducción <SkipForward className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
