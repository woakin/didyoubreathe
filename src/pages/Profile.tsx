import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Calendar, Flame, Clock, Hash, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/i18n';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ProfileStats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const [stats, setStats] = useState<ProfileStats>({ totalSessions: 0, totalMinutes: 0, currentStreak: 0 });
  const [memberSince, setMemberSince] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchProfileData();
    }
  }, [user, authLoading]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      // Fetch sessions
      const { data: sessions } = await supabase
        .from('breathing_sessions')
        .select('duration_seconds')
        .eq('user_id', user.id);

      // Fetch streak
      const { data: streakData } = await supabase
        .from('daily_streaks')
        .select('current_streak')
        .eq('user_id', user.id)
        .single();

      const totalSessions = sessions?.length || 0;
      const totalMinutes = Math.round(
        (sessions?.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) || 0) / 60
      );
      const currentStreak = streakData?.current_streak || 0;

      setStats({ totalSessions, totalMinutes, currentStreak });

      // Format member since date
      if (user.created_at) {
        const date = new Date(user.created_at);
        const formatted = date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
          month: 'long',
          year: 'numeric',
        });
        setMemberSince(formatted);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/techniques');
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} ${t.progress.minutes}`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (authLoading || loading) {
    return (
      <MainLayout>
        <PageTransition className="flex flex-col items-center justify-center min-h-screen">
          <div className="w-12 h-12 rounded-full bg-primary/20 animate-pulse" />
        </PageTransition>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageTransition className="flex flex-col min-h-screen px-6 py-8 pb-24">
        <header className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">{t.profile.title}</h1>
        </header>

        {/* User Info Card */}
        <section className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{user?.email}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                <Calendar className="h-3.5 w-3.5" />
                {t.profile.memberSince} {memberSince}
              </p>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-6">
          <h2 className="text-lg font-medium text-foreground mb-4">{t.profile.statistics}</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Hash className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.totalSessions}</p>
              <p className="text-xs text-muted-foreground">{t.profile.totalSessions}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Clock className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{formatTime(stats.totalMinutes)}</p>
              <p className="text-xs text-muted-foreground">{t.profile.totalTime}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Flame className="h-5 w-5 text-destructive mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.currentStreak}</p>
              <p className="text-xs text-muted-foreground">{t.profile.currentStreak}</p>
            </div>
          </div>
        </section>

        {/* Account Actions */}
        <section className="mt-auto">
          <h2 className="text-lg font-medium text-foreground mb-4">{t.profile.account}</h2>
          <div className="space-y-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                  {t.common.signOut}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.profile.signOutConfirm}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.profile.signOutDescription}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.common.back}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSignOut}>
                    {t.common.signOut}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      </PageTransition>
    </MainLayout>
  );
}
