import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { TechniqueCard } from '@/components/TechniqueCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getBreathingTechniques } from '@/data/techniques';
import { useLanguage } from '@/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Globe, Trophy } from 'lucide-react';

interface LocationState {
  recommendedTechnique?: string;
  moodScore?: number;
}

const WEEKLY_GOAL = 3;

export default function Techniques() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();

  const [weeklyCount, setWeeklyCount] = useState(0);
  const [completedTodaySet, setCompletedTodaySet] = useState<Set<string>>(new Set());

  // Get recommendation from mood check
  const { recommendedTechnique } = (location.state as LocationState) || {};

  const techniques = getBreathingTechniques(language);

  // Fetch weekly sessions + today's completions
  useEffect(() => {
    if (!user) return;

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    supabase
      .from('breathing_sessions')
      .select('technique, completed_at')
      .eq('user_id', user.id)
      .gte('completed_at', startOfWeek.toISOString())
      .then(({ data }) => {
        if (!data) return;
        setWeeklyCount(data.length);

        const todayTechniques = new Set<string>();
        data.forEach((s) => {
          if (new Date(s.completed_at) >= todayStart) {
            todayTechniques.add(s.technique);
          }
        });
        setCompletedTodaySet(todayTechniques);
      });
  }, [user]);

  // Sort techniques to show recommended first if available
  const sortedTechniques = recommendedTechnique
    ? [...techniques].sort((a, b) => {
        if (a.id === recommendedTechnique) return -1;
        if (b.id === recommendedTechnique) return 1;
        return 0;
      })
    : techniques;

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  const handleTechniqueSelect = (techniqueId: string) => {
    navigate(`/breathe/${techniqueId}`);
  };

  const goalReached = weeklyCount >= WEEKLY_GOAL;
  const progressPercent = Math.min((weeklyCount / WEEKLY_GOAL) * 100, 100);

  return (
    <MainLayout>
      <PageTransition className="px-4 sm:px-6 py-6 sm:py-8 pb-24">
        {/* Header */}
        <header className="flex items-start justify-between mb-6 animate-fade-in">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
              {t.techniques.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t.techniques.subtitle}
            </p>
          </div>
          
          {/* Language Toggle - Icon only */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
            aria-label={`Switch to ${language === 'es' ? 'English' : 'Spanish'}`}
          >
            <Globe className="h-4 w-4" />
          </Button>
        </header>

        {/* Weekly Progress Indicator - Endowed Progress */}
        {user && (
          <div className="mb-6 p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-border/40 animate-fade-in-up">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                {goalReached
                  ? t.techniques.weeklyGoalReached
                  : t.techniques.weeklyProgress
                      .replace('{completed}', String(weeklyCount))
                      .replace('{goal}', String(WEEKLY_GOAL))}
              </span>
              {goalReached && <Trophy className="h-4 w-4 text-primary" />}
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {/* Techniques Bento Grid */}
        <div className="grid gap-4 sm:grid-cols-2 auto-rows-[minmax(200px,auto)]">
          {sortedTechniques.map((technique, index) => {
            // First card or recommended gets featured treatment
            const isFeatured = index === 0 || technique.id === recommendedTechnique;
            
            return (
              <TechniqueCard
                key={technique.id}
                technique={technique}
                onClick={() => handleTechniqueSelect(technique.id)}
                index={index}
                isRecommended={technique.id === recommendedTechnique}
                isFeatured={isFeatured}
                isCompletedToday={completedTodaySet.has(technique.id)}
              />
            );
          })}
        </div>
      </PageTransition>
    </MainLayout>
  );
}
