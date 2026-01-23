import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, Play, Check, Loader2, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage, Language } from '@/i18n';
import { getVoicesForLanguage, getDefaultVoiceForLanguage, Voice } from '@/data/voicesByLanguage';

const VOICE_STORAGE_KEY = 'breathe-voice-preference';

export default function Settings() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  
  const availableVoices = getVoicesForLanguage(language);
  const defaultVoice = getDefaultVoiceForLanguage(language);
  
  const [selectedVoice, setSelectedVoice] = useState<string>(defaultVoice);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(VOICE_STORAGE_KEY);
    const validVoiceIds = availableVoices.map(v => v.id);
    
    if (saved && validVoiceIds.includes(saved)) {
      setSelectedVoice(saved);
    } else {
      // Reset to default for current language if saved voice doesn't exist
      const newDefault = getDefaultVoiceForLanguage(language);
      setSelectedVoice(newDefault);
      localStorage.setItem(VOICE_STORAGE_KEY, newDefault);
    }
  }, [language]);

  const handleSelectVoice = (voiceId: string) => {
    setSelectedVoice(voiceId);
    localStorage.setItem(VOICE_STORAGE_KEY, voiceId);
    toast.success(t.settings.voiceSaved);
  };

  const handlePreview = async (voice: Voice) => {
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    setPreviewLoading(voice.id);

    try {
      const previewText = language === 'es' 
        ? 'Inhala profundamente y siente la calma.'
        : 'Breathe in deeply and feel the calm.';

      const response = await supabase.functions.invoke('generate-breath-guide', {
        body: {
          text: previewText,
          phraseKey: `preview_${voice.id}_${language}`,
          voiceId: voice.id,
        },
      });

      if (response.error || !response.data?.audioUrl) {
        throw new Error('Error generating preview');
      }

      const audio = new Audio(response.data.audioUrl);
      audio.onended = () => setCurrentAudio(null);
      setCurrentAudio(audio);
      await audio.play();
    } catch (error) {
      console.error('Preview error:', error);
      toast.error(t.settings.previewError);
    } finally {
      setPreviewLoading(null);
    }
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    // Reset voice to default for new language
    const newDefault = getDefaultVoiceForLanguage(newLang);
    setSelectedVoice(newDefault);
    localStorage.setItem(VOICE_STORAGE_KEY, newDefault);
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
          <h1 className="text-xl font-semibold text-foreground">{t.settings.title}</h1>
        </header>

        {/* Language Section */}
        <section className="space-y-6 mb-8">
          <div>
            <h2 className="text-lg font-medium text-foreground mb-2">{t.settings.language}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {t.settings.languageDescription}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(['es', 'en'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-xl border transition-all",
                  language === lang
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <Globe className="h-5 w-5" />
                <span className="font-medium">
                  {lang === 'es' ? 'Español' : 'English'}
                </span>
                {language === lang && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Voice Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-foreground mb-2">{t.settings.voiceGuide}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {t.settings.voiceDescription}
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
                      <p className="text-sm text-muted-foreground">{voice.description[language]}</p>
                    </div>
                  </div>
                </button>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePreview(voice)}
                      disabled={previewLoading !== null}
                      className="shrink-0 border-primary/30 hover:border-primary hover:bg-primary/10"
                    >
                      {previewLoading === voice.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {t.settings.previewVoice}
                  </TooltipContent>
                </Tooltip>
              </div>
            ))}
          </div>
        </section>
      </PageTransition>
    </MainLayout>
  );
}
