import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Volume2, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Voice {
  id: string;
  name: string;
  description: string;
  preview?: string;
}

// Voces optimizadas para meditación
const availableVoices: Voice[] = [
  { id: 'spPXlKT5a4JMfbhPRAzA', name: 'Camila', description: 'Voz suave y fluida para meditación' },
  { id: 'rixsIpPlTphvsJd2mI03', name: 'Isabel', description: 'Voz tranquila y serena' },
];

const VOICE_STORAGE_KEY = 'breathe-voice-preference';

export default function Settings() {
  const navigate = useNavigate();
  const [selectedVoice, setSelectedVoice] = useState<string>('spPXlKT5a4JMfbhPRAzA');
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(VOICE_STORAGE_KEY);
    const validVoiceIds = availableVoices.map(v => v.id);
    
    if (saved && validVoiceIds.includes(saved)) {
      setSelectedVoice(saved);
    } else {
      // Reset to default if saved voice no longer exists
      localStorage.setItem(VOICE_STORAGE_KEY, 'spPXlKT5a4JMfbhPRAzA');
    }
  }, []);

  const handleSelectVoice = (voiceId: string) => {
    setSelectedVoice(voiceId);
    localStorage.setItem(VOICE_STORAGE_KEY, voiceId);
    toast.success('Voz guardada');
  };

  const handlePreview = async (voice: Voice) => {
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    setPreviewLoading(voice.id);

    try {
      const response = await supabase.functions.invoke('generate-breath-guide', {
        body: {
          text: 'Inhala profundamente y siente la calma.',
          phraseKey: `preview_${voice.id}`,
          voiceId: voice.id,
        },
      });

      if (response.error || !response.data?.audioUrl) {
        throw new Error('Error al generar preview');
      }

      const audio = new Audio(response.data.audioUrl);
      audio.onended = () => setCurrentAudio(null);
      setCurrentAudio(audio);
      await audio.play();
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('No se pudo reproducir la vista previa');
    } finally {
      setPreviewLoading(null);
    }
  };

  return (
    <MainLayout>
      <PageTransition className="flex flex-col min-h-screen px-6 py-8">
        <header className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">Configuración</h1>
        </header>

        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-foreground mb-2">Voz de la guía</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Elige la voz que te acompañará en tus ejercicios de respiración
            </p>
          </div>

          <div className="space-y-3">
            {availableVoices.map((voice) => (
              <div
                key={voice.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-all",
                  selectedVoice === voice.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <button
                  className="flex-1 text-left"
                  onClick={() => handleSelectVoice(voice.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                      selectedVoice === voice.id
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    )}>
                      {selectedVoice === voice.id && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{voice.name}</p>
                      <p className="text-sm text-muted-foreground">{voice.description}</p>
                    </div>
                  </div>
                </button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePreview(voice)}
                  disabled={previewLoading !== null}
                  className="shrink-0"
                >
                  {previewLoading === voice.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </section>
      </PageTransition>
    </MainLayout>
  );
}
