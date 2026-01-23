import { useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { TechniqueCard } from '@/components/TechniqueCard';
import { Button } from '@/components/ui/button';
import { getBreathingTechniques } from '@/data/techniques';
import { useLanguage } from '@/i18n';
import { Globe } from 'lucide-react';

interface LocationState {
  recommendedTechnique?: string;
  moodScore?: number;
}

export default function Techniques() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  // Get recommendation from mood check
  const { recommendedTechnique } = (location.state as LocationState) || {};

  const techniques = getBreathingTechniques(language);

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

  return (
    <MainLayout>
      <PageTransition className="px-4 sm:px-6 py-6 sm:py-8 pb-24">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-fade-in">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
              {t.techniques.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t.techniques.subtitle}
            </p>
          </div>
          
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Globe className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">{language}</span>
          </Button>
        </header>

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
              />
            );
          })}
        </div>
      </PageTransition>
    </MainLayout>
  );
}
