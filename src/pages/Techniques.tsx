import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { TechniqueCard } from '@/components/TechniqueCard';
import { Button } from '@/components/ui/button';
import { breathingTechniques } from '@/data/techniques';
import { useAuth } from '@/hooks/useAuth';
import { User, LogOut, Flame } from 'lucide-react';

export default function Techniques() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleTechniqueSelect = (techniqueId: string) => {
    navigate(`/breathe/${techniqueId}`);
  };

  return (
    <MainLayout>
      <PageTransition className="px-6 py-8 pb-24">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Elige tu práctica
            </h1>
            <p className="text-sm text-muted-foreground">
              Selecciona una técnica para comenzar
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate('/progress')}
                  className="relative"
                >
                  <Flame className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={signOut}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/auth')}
              >
                <User className="h-4 w-4 mr-2" />
                Iniciar sesión
              </Button>
            )}
          </div>
        </header>

        {/* Techniques Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {breathingTechniques.map((technique, index) => (
            <TechniqueCard
              key={technique.id}
              technique={technique}
              onClick={() => handleTechniqueSelect(technique.id)}
              index={index}
            />
          ))}
        </div>
      </PageTransition>
    </MainLayout>
  );
}
