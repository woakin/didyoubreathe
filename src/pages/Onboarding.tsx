import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { BreathingOrb } from '@/components/ui/BreathingOrb';
import { ArrowRight, Heart, Brain, Moon, Zap } from 'lucide-react';

const benefits = [
  {
    icon: Heart,
    title: 'Reduce el cortisol',
    description: 'La respiración consciente disminuye las hormonas del estrés en minutos.',
  },
  {
    icon: Brain,
    title: 'Activa el nervio vago',
    description: 'Conecta con tu sistema parasimpático para una calma profunda.',
  },
  {
    icon: Moon,
    title: 'Mejora tu sueño',
    description: 'Prepara tu cuerpo y mente para un descanso reparador.',
  },
  {
    icon: Zap,
    title: 'Aumenta tu energía',
    description: 'Oxigena cada célula y despierta tu vitalidad natural.',
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const handleContinue = () => {
    if (step < 1) {
      setStep(step + 1);
    } else {
      navigate('/techniques');
    }
  };

  return (
    <MainLayout>
      <PageTransition className="flex flex-col items-center justify-center px-6 py-12">
        {step === 0 ? (
          // Welcome screen
          <div className="flex flex-col items-center text-center max-w-md mx-auto">
            <div className="mb-8 animate-float">
              <BreathingOrb size="lg" />
            </div>
            
            <h1 className="text-4xl font-semibold text-foreground mb-4 animate-fade-in-up">
              Did You Breathe?
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 animate-fade-in-up delay-100">
              Tu compañero para cultivar la calma interior a través de la respiración consciente.
            </p>
            
            <p className="text-sm text-muted-foreground mb-12 animate-fade-in-up delay-200">
              Cada respiración es una oportunidad de reconectar contigo mismo.
            </p>
            
            <Button 
              onClick={handleContinue}
              size="lg"
              className="animate-fade-in-up delay-300 group"
            >
              Comenzar mi viaje
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        ) : (
          // Benefits screen
          <div className="w-full max-w-lg mx-auto">
            <h2 className="text-2xl font-semibold text-center mb-2 animate-fade-in-up">
              ¿Por qué respirar conscientemente?
            </h2>
            
            <p className="text-muted-foreground text-center mb-10 animate-fade-in-up delay-100">
              La ciencia respalda lo que las tradiciones antiguas ya sabían.
            </p>
            
            <div className="space-y-4 mb-10">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit.title}
                  className="flex items-start gap-4 p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 animate-fade-in-up"
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={handleContinue}
              size="lg"
              className="w-full animate-fade-in-up delay-400 group"
            >
              Explorar técnicas
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        )}
      </PageTransition>
    </MainLayout>
  );
}
