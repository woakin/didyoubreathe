import { BreathingTechnique } from '@/types/breathing';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n';

interface TechniqueCardProps {
  technique: BreathingTechnique;
  onClick: () => void;
  index: number;
}

export function TechniqueCard({ technique, onClick, index }: TechniqueCardProps) {
  const { t } = useLanguage();

  return (
    <Card
      onClick={onClick}
      className={cn(
        'cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
        'bg-card/80 backdrop-blur-sm border-border/50',
        'animate-fade-in-up'
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader className="pb-2 sm:pb-3">
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
      
      <CardContent className="space-y-3 pt-0">
        {/* Full description - no truncation on mobile */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {technique.description}
        </p>
        
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
        
        <div className="flex flex-wrap gap-1.5">
          {technique.benefits.slice(0, 2).map((benefit) => (
            <span
              key={benefit}
              className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground"
            >
              {benefit}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
