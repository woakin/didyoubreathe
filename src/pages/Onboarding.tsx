import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showUnmutePrompt, setShowUnmutePrompt] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const attemptAutoplay = async () => {
      try {
        // Intento inicial con sonido
        await video.play();
      } catch (error) {
        // Autoplay bloqueado por el navegador - silenciar y reintentar
        video.muted = true;
        setIsMuted(true);
        try {
          await video.play();
          // Mostrar indicador visual para que el usuario active el sonido
          setShowUnmutePrompt(true);
        } catch (retryError) {
          console.error("Autoplay fallido incluso en silencio", retryError);
        }
      }
    };

    attemptAutoplay();
  }, []);

  const handleVideoEnd = () => {
    navigate('/techniques');
  };

  const handleSkip = () => {
    navigate('/techniques');
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
      setShowUnmutePrompt(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        src="/videos/onboarding-intro.mp4"
        className="w-full h-full object-cover"
        playsInline
        preload="auto"
        onEnded={handleVideoEnd}
      />
      
      {/* Botón para saltar */}
      <Button 
        variant="ghost"
        onClick={handleSkip}
        className="absolute top-6 right-6 px-4 py-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-colors"
      >
        Saltar intro
      </Button>

      {/* Indicador de sonido si está silenciado por autoplay */}
      {showUnmutePrompt && (
        <button 
          onClick={toggleMute}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 bg-primary text-primary-foreground rounded-full shadow-lg animate-bounce flex items-center gap-2"
        >
          <Volume2 className="h-5 w-5" />
          Activar sonido
        </button>
      )}

      {/* Control de sonido discreto (siempre visible después de interacción) */}
      {!showUnmutePrompt && (
        <button
          onClick={toggleMute}
          className="absolute bottom-6 right-6 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-colors"
          aria-label={isMuted ? "Activar sonido" : "Silenciar"}
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      )}
    </div>
  );
}
