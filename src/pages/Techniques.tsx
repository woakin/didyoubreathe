import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
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
const INCOMPLETE_SESSION_KEY = 'breathe-incomplete-session';

export default function Techniques() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();

  const [weeklyCount, setWeeklyCount] = useState(0);
  const [completedTodaySet, setCompletedTodaySet] = useState<Set<string>>(new Set());
  const [techniqueCountsMap, setTechniqueCountsMap] = useState<Record<string, number>>({});
  const [favoriteTechnique, setFavoriteTechnique] = useState<string | null>(null);

  // Zeigarnik: read incomplete session from localStorage
  const incompleteSession = useMemo(() => {
    try {
      const stored = localStorage.getItem(INCOMPLETE_SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only show if less than 24 hours old
        if (Date.now() - parsed.startedAt < 24 * 60 * 60 * 1000) {
          return parsed.techniqueId as string;
        }
        localStorage.removeItem(INCOMPLETE_SESSION_KEY);
      }
    } catch { /* ignore */ }
    return null;
  }, []);

  // Get recommendation from mood check
  const { recommendedTechnique } = (location.state as LocationState) || {};

  const techniques = getBreathingTechniques(language);

  // Fetch sessions data: weekly count, today's completions, all-time technique counts
  useEffect(() => {
    if (!user) return;

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Fetch weekly sessions
    const weeklyPromise = supabase
      .from('breathing_sessions')
      .select('technique, completed_at')
      .eq('user_id', user.id)
      .gte('completed_at', startOfWeek.toISOString());

    // Fetch all-time technique counts
    const allTimePromise = supabase
      .from('breathing_sessions')
      .select('technique')
      .eq('user_id', user.id);

    Promise.all([weeklyPromise, allTimePromise]).then(([weeklyRes, allTimeRes]) => {
      // Weekly data
      if (weeklyRes.data) {
        setWeeklyCount(weeklyRes.data.length);
        const todayTechniques = new Set<string>();
        weeklyRes.data.forEach((s) => {
          if (new Date(s.completed_at) >= todayStart) {
            todayTechniques.add(s.technique);
          }
        });
        setCompletedTodaySet(todayTechniques);
      }

      // All-time technique counts + find favorite
      if (allTimeRes.data) {
        const counts: Record<string, number> = {};
        allTimeRes.data.forEach((s) => {
          counts[s.technique] = (counts[s.technique] || 0) + 1;
        });
        setTechniqueCountsMap(counts);

        // Smart Default: find most practiced technique
        let maxCount = 0;
        let maxTechnique: string | null = null;
        Object.entries(counts).forEach(([tech, count]) => {
          if (count > maxCount) {
            maxCount = count;
            maxTechnique = tech;
          }
        });
        if (maxCount >= 2) {
          setFavoriteTechnique(maxTechnique);
        }
      }
    });
  }, [user]);

  // Sort: recommended first, then incomplete session, then favorite
  const sortedTechniques = useMemo(() => {
    let sorted = [...techniques];
    if (recommendedTechnique) {
      sorted.sort((a, b) => {
        if (a.id === recommendedTechnique) return -1;
        if (b.id === recommendedTechnique) return 1;
        return 0;
      });
    } else if (incompleteSession) {
      sorted.sort((a, b) => {
        if (a.id === incompleteSession) return -1;
        if (b.id === incompleteSession) return 1;
        return 0;
      });
    }
    return sorted;
  }, [techniques, recommendedTechnique, incompleteSession]);

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  const handleTechniqueSelect = (techniqueId: string, customCycles?: number) => {
    navigate(`/breathe/${techniqueId}`, {
      state: customCycles ? { customCycles } : undefined,
    });
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
            const isFeatured = index === 0 || technique.id === recommendedTechnique;
            const isIncomplete = technique.id === incompleteSession;
            // Smart Default: auto-expand favorite if no recommendation and not featured
            const shouldAutoExpand = !recommendedTechnique && !isFeatured && technique.id === favoriteTechnique;
            
            return (
              <TechniqueCard
                key={technique.id}
                technique={technique}
                onClick={(customCycles) => handleTechniqueSelect(technique.id, customCycles)}
                index={index}
                isRecommended={technique.id === recommendedTechnique}
                isFeatured={isFeatured}
                isCompletedToday={completedTodaySet.has(technique.id)}
                hasIncompleteSession={isIncomplete}
                practiceCount={techniqueCountsMap[technique.id] || 0}
                defaultExpanded={shouldAutoExpand}
              />
            );
          })}
        </div>
      </PageTransition>
    </MainLayout>
  );
}
