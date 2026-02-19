import { useState } from 'react';
import { BreathingTechnique } from '@/types/breathing';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Clock, Sparkles, ChevronDown, Play, CheckCircle, RotateCcw, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n';
import { BreathRhythmVisual } from './BreathRhythmVisual';

interface TechniqueCardProps {
  technique: BreathingTechnique;
  onClick: (customCycles?: number) => void;
  index: number;
  isRecommended?: boolean;
  isFeatured?: boolean;
  isCompletedToday?: boolean;
  hasIncompleteSession?: boolean;
  practiceCount?: number;
  defaultExpanded?: boolean;
}

export function TechniqueCard({ 
  technique, 
  onClick, 
  index, 
  isRecommended = false,
  isFeatured = false,
  isCompletedToday = false,
  hasIncompleteSession = false,
  practiceCount = 0,
  defaultExpanded = false,
}: TechniqueCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [customCycles, setCustomCycles] = useState(technique.pattern.cycles);
  const { t } = useLanguage();

  const handleCardClick = (e: React.MouseEvent) => {
    if (isFeatured) {
      onClick();
    } else {
      e.stopPropagation();
      setIsExpanded(!isExpanded);
    }
  };

  const handleStartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(customCycles !== technique.pattern.cycles ? customCycles : undefined);
  };

  const handleCycleChange = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    setCustomCycles(prev => Math.max(1, Math.min(20, prev + delta)));
  };

  const showExpanded = isExpanded || isFeatured;

  // Estimated duration based on custom cycles
  const cycleDuration = technique.pattern.inhale + technique.pattern.holdIn + technique.pattern.exhale + technique.pattern.holdOut;
  const estimatedMinutes = Math.round((cycleDuration * customCycles) / 60);

  return (
    <Card
      onClick={handleCardClick}
      className={cn(
        'cursor-pointer relative overflow-hidden group',
        'bg-card/70 backdrop-blur-sm border-border/40',
        'animate-fade-in-up',
        'transition-all duration-300 hover:shadow-lg active:scale-[0.98]',
        isFeatured && 'sm:row-span-2',
        isRecommended && 'ring-2 ring-primary/60 shadow-xl shadow-primary/20 animate-recommended-glow',
        isCompletedToday && !isRecommended && 'ring-1 ring-primary/30',
        hasIncompleteSession && !isRecommended && 'ring-1 ring-accent/60'
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Breath Rhythm Visual - Background */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center transition-opacity duration-500",
        "opacity-25 group-hover:opacity-35",
        isFeatured && "opacity-30",
        isRecommended && "opacity-40 group-hover:opacity-50"
      )}>
        <BreathRhythmVisual
          techniqueId={technique.id}
          pattern={technique.pattern}
          className={cn("scale-150", isRecommended && "scale-[2]")}
        />
      </div>

      {/* Top badges */}
      <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-start">
        <div className="flex flex-col gap-1">
          {/* Zeigarnik: Incomplete session badge */}
          {hasIncompleteSession && (
            <Badge 
              variant="secondary" 
              className="bg-accent/20 text-accent-foreground text-xs px-2 py-0.5 flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              {t.techniques.continueSession}
            </Badge>
          )}
          {/* Completed Today Badge */}
          {isCompletedToday && !hasIncompleteSession && (
            <Badge 
              variant="secondary" 
              className="bg-primary/15 text-primary text-xs px-2 py-0.5 flex items-center gap-1"
            >
              <CheckCircle className="h-3 w-3" />
              {t.techniques.completedToday}
            </Badge>
          )}
        </div>

        {/* Recommended Badge - right side */}
        {isRecommended && (
          <Badge 
            variant="default" 
            className="bg-primary text-primary-foreground text-xs px-2 py-0.5 flex items-center gap-1 shadow-md animate-pulse-subtle"
          >
            <Sparkles className="h-3 w-3" />
            {t.moodCheck.recommended}
          </Badge>
        )}
      </div>

      <CardHeader className={cn("pb-2 sm:pb-3 relative z-10", (hasIncompleteSession || isCompletedToday || isRecommended) && "pt-10")}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 sm:gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg text-foreground leading-tight">
              {technique.name}
            </h3>
            <p className="text-sm text-primary italic mt-0.5">{technique.tagline}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 pt-0 relative z-10">
        {/* Always visible: Primary benefit + practice count */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
            {technique.benefits[0]}
          </span>
          {practiceCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {practiceCount === 1
                ? t.techniques.practicedOnce
                : t.techniques.practicedTimes.replace('{count}', String(practiceCount))}
            </span>
          )}
        </div>

        {/* Expandable content */}
        <Collapsible open={showExpanded}>
          <CollapsibleContent className="space-y-3 pt-2 animate-accordion-down">
            {/* Full description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {technique.description}
            </p>

            {/* All benefits grouped together (no Skittles effect) */}
            {technique.benefits.length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                {technique.benefits.slice(1).map((benefit, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-full bg-secondary/50 text-secondary-foreground">
                    {benefit}
                  </span>
                ))}
              </div>
            )}

            {/* Duration & Cycles with IKEA Effect adjuster */}
            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              {/* Row 1: Read-only info */}
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                <span>{estimatedMinutes || '<1'} {t.techniques.minutes}</span>
                <span className="text-muted-foreground/40">·</span>
                <span>{customCycles} {t.techniques.cycles}</span>
              </div>
              {/* Row 2: Label + Interactive cycle controls */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{t.techniques.adjustCycles}</span>
                <button
                  onClick={(e) => handleCycleChange(e, -1)}
                  className="h-9 w-9 min-w-[44px] min-h-[44px] rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                  aria-label="Decrease cycles"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-sm font-semibold text-foreground min-w-[2rem] text-center">
                  {customCycles}
                </span>
                <button
                  onClick={(e) => handleCycleChange(e, 1)}
                  className="h-9 w-9 min-w-[44px] min-h-[44px] rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                  aria-label="Increase cycles"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Start Practice CTA */}
            <Button 
              onClick={handleStartClick} 
              className="w-full mt-2" 
              size="sm"
            >
              <Play className="h-4 w-4 mr-2" />
              {hasIncompleteSession ? t.techniques.continueSession : t.techniques.startPractice}
            </Button>
          </CollapsibleContent>
        </Collapsible>

        {/* Collapsed state: always-visible Play + expand hint */}
        {!isFeatured && !isExpanded && (
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
              <ChevronDown className="h-3 w-3 transition-transform duration-300 group-hover:translate-y-0.5" />
              <span>{t.techniques.tapToLearnMore}</span>
            </div>
            <Button
              variant="default"
              size="icon"
              className="h-8 w-8 rounded-full shrink-0"
              onClick={handleStartClick}
              aria-label={t.techniques.startPractice}
            >
              <Play className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Expanded state: chevron up hint */}
        {!isFeatured && isExpanded && (
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground/60 pt-1">
            <ChevronDown className="h-3 w-3 rotate-180 transition-transform duration-300" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
