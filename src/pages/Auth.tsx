import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BreathingOrb } from '@/components/ui/BreathingOrb';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/i18n';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success(t.auth.resetEmailSent);
        setMode('login');
      } else if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success(t.auth.welcomeBackToast);
        navigate('/techniques');
      } else {
        const { error } = await signUp(email, password, name);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success(t.auth.accountCreatedToast);
        navigate('/techniques');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout withBottomNav={false}>
      <PageTransition className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="mb-8">
          <BreathingOrb size="sm" />
        </div>

        <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {mode === 'login' && t.auth.welcomeBack}
              {mode === 'signup' && t.auth.createAccount}
              {mode === 'forgot' && t.auth.resetPassword}
            </CardTitle>
            <CardDescription>
              {mode === 'login' && t.auth.loginSubtitle}
              {mode === 'signup' && t.auth.signupSubtitle}
              {mode === 'forgot' && t.auth.resetSubtitle}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name">{t.auth.name}</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t.auth.namePlaceholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t.auth.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.auth.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {mode !== 'forgot' && (
                <div className="space-y-2">
                  <Label htmlFor="password">{t.auth.password}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'login' && t.auth.signInButton}
                {mode === 'signup' && t.auth.signUpButton}
                {mode === 'forgot' && t.auth.sendLink}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm space-y-2">
              {mode === 'login' && (
                <>
                  <p className="text-muted-foreground">
                    {t.auth.noAccount}{' '}
                    <button
                      onClick={() => setMode('signup')}
                      className="text-primary hover:underline font-medium"
                    >
                      {t.auth.register}
                    </button>
                  </p>
                  <p>
                    <button
                      onClick={() => setMode('forgot')}
                      className="text-muted-foreground hover:text-primary hover:underline text-sm"
                    >
                      {t.auth.forgotPassword}
                    </button>
                  </p>
                </>
              )}
              {mode === 'signup' && (
                <p className="text-muted-foreground">
                  {t.auth.hasAccount}{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="text-primary hover:underline font-medium"
                  >
                    {t.auth.loginLink}
                  </button>
                </p>
              )}
              {mode === 'forgot' && (
                <p className="text-muted-foreground">
                  <button
                    onClick={() => setMode('login')}
                    className="text-primary hover:underline font-medium"
                  >
                    {t.auth.backToLogin}
                  </button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </PageTransition>
    </MainLayout>
  );
}
