import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/i18n';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Flame, Clock, Calendar, TrendingUp, Mail } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_session_date: string | null;
}

interface SessionStats {
  totalSessions: number;
  totalMinutes: number;
  thisWeekSessions: number;
}

export default function Progress() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [stats, setStats] = useState<SessionStats>({
    totalSessions: 0,
    totalMinutes: 0,
    thisWeekSessions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [weeklyEmailEnabled, setWeeklyEmailEnabled] = useState(true);
  const [savingPreference, setSavingPreference] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchProgress();
    }
  }, [user, authLoading, navigate]);

  const fetchProgress = async () => {
    if (!user) return;

    try {
      const [streakResult, profileResult] = await Promise.all([
        supabase
          .from('daily_streaks')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('weekly_email_enabled')
          .eq('user_id', user.id)
          .maybeSingle()
      ]);

      if (streakResult.data) {
        setStreak(streakResult.data);
      }

      if (profileResult.data) {
        setWeeklyEmailEnabled(profileResult.data.weekly_email_enabled ?? true);
      }

      const { data: sessions } = await supabase
        .from('breathing_sessions')
        .select('*')
        .eq('user_id', user.id);

      if (sessions) {
        const totalMinutes = sessions.reduce(
          (acc, s) => acc + Math.floor(s.duration_seconds / 60),
          0
        );

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const thisWeekSessions = sessions.filter(
          (s) => new Date(s.completed_at) >= weekAgo
        ).length;

        setStats({
          totalSessions: sessions.length,
          totalMinutes,
          thisWeekSessions,
        });
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWeeklyEmail = async () => {
    if (!user) return;
    
    setSavingPreference(true);
    const newValue = !weeklyEmailEnabled;
    
    const { error } = await supabase
      .from('profiles')
      .update({ weekly_email_enabled: newValue })
      .eq('user_id', user.id);
    
    if (error) {
      toast.error(t.common.loading);
    } else {
      setWeeklyEmailEnabled(newValue);
      toast.success(newValue ? t.progress.emailEnabled : t.progress.emailDisabled);
    }
    setSavingPreference(false);
  };

  if (authLoading || loading) {
    return (
      <MainLayout>
        <PageTransition className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-muted-foreground">{t.common.loading}</div>
        </PageTransition>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageTransition className="px-6 py-8">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8 animate-fade-in">
          <Button variant="ghost" size="icon" onClick={() => navigate('/techniques')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{t.progress.title}</h1>
            <p className="text-sm text-muted-foreground">{t.progress.subtitle}</p>
          </div>
        </header>

        {/* Streak Card - Hero */}
        <Card className="mb-6 bg-gradient-to-br from-primary/20 via-card to-accent/10 border-primary/20 animate-fade-in-up">
          <CardContent className="pt-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4">
              <Flame className="h-10 w-10 text-primary" />
            </div>
            <div className="text-5xl font-bold text-foreground mb-2">
              {streak?.current_streak || 0}
            </div>
            <p className="text-muted-foreground">
              {t.progress.currentStreak}
            </p>
            {streak && streak.longest_streak > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {t.progress.personalRecord}: {streak.longest_streak} {t.progress.days}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="animate-fade-in-up delay-100">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <CardTitle className="text-sm font-medium">{t.progress.thisWeek}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.thisWeekSessions}
              </div>
              <p className="text-xs text-muted-foreground">{t.progress.sessions}</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up delay-200">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <CardTitle className="text-sm font-medium">{t.progress.total}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.totalSessions}
              </div>
              <p className="text-xs text-muted-foreground">{t.progress.sessions}</p>
            </CardContent>
          </Card>

          <Card className="col-span-2 animate-fade-in-up delay-300">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <CardTitle className="text-sm font-medium">{t.progress.totalPracticeTime}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats.totalMinutes} <span className="text-lg font-normal text-muted-foreground">{t.progress.minutes}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Preferences */}
        <Card className="mb-6 animate-fade-in-up delay-350">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t.progress.weeklySummary}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.progress.receiveProgress}
                  </p>
                </div>
              </div>
              <Switch
                checked={weeklyEmailEnabled}
                onCheckedChange={toggleWeeklyEmail}
                disabled={savingPreference}
              />
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Button
          onClick={() => navigate('/techniques')}
          className="w-full animate-fade-in-up delay-400"
          size="lg"
        >
          {t.progress.continuePracticing}
        </Button>
      </PageTransition>
    </MainLayout>
  );
}
