import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BreathingOrb } from '@/components/ui/BreathingOrb';
import { toast } from 'sonner';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setTokenError('No se encontró el enlace de recuperación. Solicita uno nuevo.');
    }
  }, [token]);

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

    if (!token) {
      toast.error('Token de recuperación no válido');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-reset-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            token,
            newPassword: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar la contraseña');
      }

      setSuccess(true);
      toast.success('¡Contraseña actualizada correctamente!');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/auth');
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar la contraseña');
      if (error.message.includes('expired') || error.message.includes('Invalid')) {
        setTokenError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (tokenError) {
    return (
      <MainLayout withBottomNav={false}>
        <PageTransition className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
          <div className="mb-8">
            <BreathingOrb size="sm" />
          </div>
          <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Enlace no válido</h2>
              <p className="text-muted-foreground mb-4">{tokenError}</p>
              <Button onClick={() => navigate('/auth')} className="w-full">
                Volver a iniciar sesión
              </Button>
            </CardContent>
          </Card>
        </PageTransition>
      </MainLayout>
    );
  }

  if (success) {
    return (
      <MainLayout withBottomNav={false}>
        <PageTransition className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
          <div className="mb-8">
            <BreathingOrb size="sm" />
          </div>
          <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">¡Listo!</h2>
              <p className="text-muted-foreground">Tu contraseña ha sido actualizada.</p>
              <p className="text-sm text-muted-foreground mt-2">Redirigiendo al inicio de sesión...</p>
            </CardContent>
          </Card>
        </PageTransition>
      </MainLayout>
    );
  }

  return (
    <MainLayout withBottomNav={false}>
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
