import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/i18n';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

// Maps mood score to recommended technique
const getRecommendedTechnique = (score: number): string => {
  if (score <= 25) return 'box-breathing'; // Structure reduces anxiety
  if (score <= 50) return '4-7-8';          // Long exhale calms stress
  if (score <= 75) return 'diaphragmatic';  // Foundation practice
  return 'nadi-shodhana';                    // Deepen existing calm
};

// Get mood color based on score (anxious = warm, calm = cool)
const getMoodColor = (score: number): string => {
  if (score <= 25) return 'bg-accent';
  if (score <= 50) return 'bg-secondary';
  if (score <= 75) return 'bg-primary/40';
  return 'bg-primary/20';
};

// Get orb animation based on mood
const getMoodAnimation = (score: number): string => {
  if (score <= 25) return 'animate-pulse';
  if (score <= 50) return 'animate-breathe-pulse';
  return 'animate-float';
};

export default function MoodCheck() {
  const [mood, setMood] = useState(50);
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleContinue = () => {
    setIsExiting(true);
    const recommended = getRecommendedTechnique(mood);
    
    // Store mood for potential future analytics
    sessionStorage.setItem('lastMoodScore', mood.toString());
    
    setTimeout(() => {
      navigate('/techniques', { 
        state: { 
          recommendedTechnique: recommended, 
          moodScore: mood 
        }
      });
    }, 400);
  };

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate('/techniques');
    }, 300);
  };

  return (
    <div 
      className={cn(
        "min-h-screen bg-background flex flex-col items-center justify-center px-6 py-10 transition-opacity duration-500",
        isExiting ? "opacity-0" : "opacity-100 animate-fade-in"
      )}
    >
      {/* Mood Orb - Visual feedback */}
      <div 
        className={cn(
          "w-32 h-32 sm:w-40 sm:h-40 rounded-full mb-10 transition-all duration-700 shadow-lg",
          getMoodColor(mood),
          getMoodAnimation(mood)
        )}
        style={{
          boxShadow: `0 0 ${30 + (100 - mood) * 0.5}px hsl(var(--primary) / ${0.2 + (100 - mood) * 0.003})`
        }}
      />

      {/* Question */}
      <h1 className="text-xl sm:text-2xl font-light text-foreground text-center mb-2">
        {t.moodCheck.title}
      </h1>
      <p className="text-sm text-muted-foreground text-center mb-10 max-w-xs">
        {t.moodCheck.subtitle}
      </p>

      {/* Slider Section */}
      <div className="w-full max-w-xs space-y-4">
        {/* Mood labels */}
        <div className="flex justify-between text-sm">
          <span className={cn(
            "transition-colors duration-300",
            mood <= 30 ? "text-foreground font-medium" : "text-muted-foreground"
          )}>
            {t.moodCheck.anxious}
          </span>
          <span className={cn(
            "transition-colors duration-300",
            mood >= 70 ? "text-foreground font-medium" : "text-muted-foreground"
          )}>
            {t.moodCheck.calm}
          </span>
        </div>
        
        {/* Custom styled slider */}
        <Slider
          value={[mood]}
          onValueChange={([v]) => setMood(v)}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* CTA Buttons */}
      <div className="mt-12 w-full max-w-xs flex flex-col items-center gap-4">
        <Button 
          onClick={handleContinue}
          className="w-full h-14 text-base font-medium rounded-xl gap-2"
        >
          {t.moodCheck.findPractice}
          <ChevronRight className="w-5 h-5" />
        </Button>
        
        <button 
          onClick={handleSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
        >
          {t.moodCheck.skip}
        </button>
      </div>
    </div>
  );
}
