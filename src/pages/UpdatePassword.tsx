import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BreathingOrb } from '@/components/ui/BreathingOrb';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, CheckCircle } from 'lucide-react';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionReady(true);
      }
    };

    // Listen for auth state changes (recovery link creates a session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY' || session) {
          setSessionReady(true);
        }
      }
    );

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        toast.error(error.message);
        return;
      }

      setSuccess(true);
      toast.success('¡Contraseña actualizada correctamente!');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/techniques');
      }, 2000);
    } catch (error: any) {
      toast.error('Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!sessionReady) {
    return (
      <MainLayout>
        <PageTransition className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
          <div className="mb-8">
            <BreathingOrb size="sm" />
          </div>
          <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="pt-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Verificando enlace de recuperación...</p>
            </CardContent>
          </Card>
        </PageTransition>
      </MainLayout>
    );
  }

  if (success) {
    return (
      <MainLayout>
        <PageTransition className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
          <div className="mb-8">
            <BreathingOrb size="sm" />
          </div>
          <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="pt-6 text-center">
              <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">¡Listo!</h2>
              <p className="text-muted-foreground">Tu contraseña ha sido actualizada.</p>
              <p className="text-sm text-muted-foreground mt-2">Redirigiendo...</p>
            </CardContent>
          </Card>
        </PageTransition>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageTransition className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
        <div className="mb-8">
          <BreathingOrb size="sm" />
        </div>

        <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Nueva contraseña</CardTitle>
            <CardDescription>
              Ingresa tu nueva contraseña
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nueva contraseña</Label>
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Actualizar contraseña
              </Button>
            </form>
          </CardContent>
        </Card>
      </PageTransition>
    </MainLayout>
  );
}
