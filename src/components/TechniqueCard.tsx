import { useState } from 'react';
import { BreathingTechnique } from '@/types/breathing';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Clock, BarChart2, Sparkles, ChevronDown, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n';
import { BreathRhythmVisual } from './BreathRhythmVisual';

interface TechniqueCardProps {
  technique: BreathingTechnique;
  onClick: () => void;
  index: number;
  isRecommended?: boolean;
  isFeatured?: boolean;
}

export function TechniqueCard({ 
  technique, 
  onClick, 
  index, 
  isRecommended = false,
  isFeatured = false 
}: TechniqueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
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
    onClick();
  };

  const showExpanded = isExpanded || isFeatured;

  return (
    <Card
      onClick={handleCardClick}
      className={cn(
        'cursor-pointer transition-all duration-300 hover:shadow-lg relative overflow-hidden group',
        'bg-card/70 backdrop-blur-sm border-border/40',
        'animate-fade-in-up',
        isFeatured && 'sm:row-span-2',
        isRecommended && 'ring-2 ring-primary/50 shadow-lg shadow-primary/10'
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Breath Rhythm Visual - Background */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center transition-opacity duration-500",
        "opacity-15 group-hover:opacity-25",
        isFeatured ? "opacity-20" : ""
      )}>
        <BreathRhythmVisual
          techniqueId={technique.id}
          pattern={technique.pattern}
          className="scale-150"
        />
      </div>

      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge 
            variant="default" 
            className="bg-primary text-primary-foreground text-xs px-2 py-0.5 flex items-center gap-1 shadow-md"
          >
            <Sparkles className="h-3 w-3" />
            {t.moodCheck.recommended}
          </Badge>
        </div>
      )}

      <CardHeader className="pb-2 sm:pb-3 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 sm:gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg text-foreground leading-tight">
              {technique.name}
            </h3>
            <p className="text-sm text-primary italic mt-0.5">{technique.tagline}</p>
          </div>
          <Badge 
            variant="secondary" 
            className="text-xs w-fit shrink-0"
          >
            {t.techniques.difficulty[technique.difficulty]}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 pt-0 relative z-10">
        {/* Always visible: Primary benefit only */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
            {technique.benefits[0]}
          </span>
        </div>

        {/* Expandable content */}
        <Collapsible open={showExpanded}>
          <CollapsibleContent className="space-y-3 pt-2 animate-accordion-down">
            {/* Full description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {technique.description}
            </p>
            
            {/* Duration & Cycles */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{technique.durationMinutes} {t.techniques.minutes}</span>
              </div>
              <div className="flex items-center gap-1">
                <BarChart2 className="h-3.5 w-3.5" />
                <span>{technique.pattern.cycles} {t.techniques.cycles}</span>
              </div>
            </div>
            
            {/* Additional benefits */}
            {technique.benefits.length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                {technique.benefits.slice(1).map((benefit) => (
                  <span
                    key={benefit}
                    className="text-xs px-2 py-1 rounded-full bg-secondary/50 text-secondary-foreground"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            )}

            {/* Start Practice CTA */}
            <Button 
              onClick={handleStartClick} 
              className="w-full mt-2" 
              size="sm"
            >
              <Play className="h-4 w-4 mr-2" />
              {t.techniques.startPractice}
            </Button>
          </CollapsibleContent>
        </Collapsible>

        {/* Expand hint for non-featured, non-expanded cards */}
        {!isFeatured && !isExpanded && (
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground/60 pt-1">
            <ChevronDown className="h-3 w-3 transition-transform group-hover:translate-y-0.5" />
            <span>{t.techniques.tapToLearnMore}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
