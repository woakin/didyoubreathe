import { BreathingTechnique } from '@/types/breathing';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TechniqueCardProps {
  technique: BreathingTechnique;
  onClick: () => void;
  index: number;
}

const difficultyLabels = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

export function TechniqueCard({ technique, onClick, index }: TechniqueCardProps) {
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
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg text-foreground">{technique.name}</h3>
            <p className="text-sm text-primary italic">{technique.tagline}</p>
          </div>
          <Badge 
            variant="secondary" 
            className="text-xs"
          >
            {difficultyLabels[technique.difficulty]}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {technique.description}
        </p>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{technique.durationMinutes} min</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart2 className="h-3.5 w-3.5" />
            <span>{technique.pattern.cycles} ciclos</span>
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
