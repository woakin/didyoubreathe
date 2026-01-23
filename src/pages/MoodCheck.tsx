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

// Get mood color as HSL for smooth interpolation (terracotta → sage)
const getMoodColorHSL = (score: number): string => {
  // Interpolate from terracotta (hue 20) to sage green (hue 160)
  const hue = 20 + (score / 100) * 140;
  const saturation = 50 - (score / 100) * 25;
  const lightness = 68 + (score / 100) * 5;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Get orb animation based on mood
const getMoodAnimation = (score: number): string => {
  if (score <= 25) return 'animate-pulse';
  if (score <= 50) return 'animate-breathe-pulse';
  return 'animate-float';
};

// Get dynamic CTA text based on mood score
const getCtaText = (score: number, t: any): string => {
  if (score <= 25) return t.moodCheck.ctaAnxious;
  if (score <= 50) return t.moodCheck.ctaStressed;
  if (score <= 75) return t.moodCheck.ctaNeutral;
  return t.moodCheck.ctaCalm;
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
        "min-h-screen flex flex-col items-center justify-center px-6 py-10 transition-all duration-700",
        isExiting ? "opacity-0" : "opacity-100 animate-fade-in"
      )}
      style={{
        background: `radial-gradient(circle at 50% 30%, 
          ${getMoodColorHSL(mood)}15 0%, 
          hsl(var(--background)) 70%)`
      }}
    >
      {/* Mood Orb - Visual feedback with synesthesia colors */}
      <div 
        className={cn(
          "w-32 h-32 sm:w-40 sm:h-40 rounded-full mb-10 transition-all duration-500 shadow-lg",
          getMoodAnimation(mood)
        )}
        style={{
          backgroundColor: getMoodColorHSL(mood),
          boxShadow: `0 0 ${30 + (100 - mood) * 0.5}px ${getMoodColorHSL(mood)}50`
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
          <span className="transition-opacity duration-300">
            {getCtaText(mood, t)}
          </span>
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
