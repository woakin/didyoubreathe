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
        toast.success('Revisa tu correo para restablecer tu contraseña');
        setMode('login');
      } else if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success('¡Bienvenido de vuelta!');
        navigate('/techniques');
      } else {
        const { error } = await signUp(email, password, name);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success('Cuenta creada. ¡Bienvenido!');
        navigate('/techniques');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
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
              {mode === 'login' && 'Bienvenido de vuelta'}
              {mode === 'signup' && 'Crea tu cuenta'}
              {mode === 'forgot' && 'Recuperar contraseña'}
            </CardTitle>
            <CardDescription>
              {mode === 'login' && 'Ingresa para continuar tu práctica'}
              {mode === 'signup' && 'Únete para guardar tu progreso'}
              {mode === 'forgot' && 'Te enviaremos un enlace para restablecer tu contraseña'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {mode !== 'forgot' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
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
                {mode === 'login' && 'Iniciar sesión'}
                {mode === 'signup' && 'Crear cuenta'}
                {mode === 'forgot' && 'Enviar enlace'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm space-y-2">
              {mode === 'login' && (
                <>
                  <p className="text-muted-foreground">
                    ¿No tienes cuenta?{' '}
                    <button
                      onClick={() => setMode('signup')}
                      className="text-primary hover:underline font-medium"
                    >
                      Regístrate
                    </button>
                  </p>
                  <p>
                    <button
                      onClick={() => setMode('forgot')}
                      className="text-muted-foreground hover:text-primary hover:underline text-sm"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </p>
                </>
              )}
              {mode === 'signup' && (
                <p className="text-muted-foreground">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="text-primary hover:underline font-medium"
                  >
                    Inicia sesión
                  </button>
                </p>
              )}
              {mode === 'forgot' && (
                <p className="text-muted-foreground">
                  <button
                    onClick={() => setMode('login')}
                    className="text-primary hover:underline font-medium"
                  >
                    Volver al inicio de sesión
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
