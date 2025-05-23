'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface AnimatedBackgroundProps {
  // Couleurs du dégradé
  gradientColors?: {
    start: string;
    middle: string;
    end: string;
  };
  // Couleur des particules
  particleColor?: string;
  // Opacité des particules
  particleOpacity?: number;
  // Vitesse de l'animation du dégradé
  gradientSpeed?: number;
  // Vitesse de l'animation des particules
  particleSpeed?: number;
  // Nombre de particules
  particleCount?: number;
  // Taille des particules
  particleSize?: number;
  // Classe CSS personnalisée
  className?: string;
  // Position du background (fixed ou absolute)
  position?: 'fixed' | 'absolute';
}

const AnimatedBackground = ({
  gradientColors = {
    start: '#0a0a0a',
    middle: '#2a0a00',
    end: '#0a0a0a',
  },
  particleColor = 'rgba(255, 140, 0, 0.12)',
  particleOpacity = 0.12,
  gradientSpeed = 30,
  particleSpeed = 20,
  particleCount = 7,
  particleSize = 25,
  className = '',
  position = 'absolute',
}: AnimatedBackgroundProps) => {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const [particlesBackground, setParticlesBackground] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  // Générer les particules dynamiquement
  const generateParticles = () => {
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const opacity = particleOpacity * (0.8 + Math.random() * 0.4); // Variation d'opacité

      particles.push(
        `radial-gradient(circle at ${x}% ${y}%, ${particleColor.replace(
          '0.12',
          opacity.toString()
        )} 0%, transparent ${particleSize}%)`
      );
    }
    return particles.join(', ');
  };

  // Effet pour marquer le composant comme monté (côté client uniquement)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Générer les particules une seule fois au montage
    setParticlesBackground(generateParticles());

    if (!backgroundRef.current || !particlesRef.current) return;

    // Animation du dégradé de fond
    gsap.to(backgroundRef.current, {
      backgroundPosition: '100% 100%',
      duration: gradientSpeed,
      ease: 'none',
      repeat: -1,
    });

    // Animation des particules
    const particles = particlesRef.current;

    // Animation aléatoire des particules
    const animateParticles = () => {
      // Positions aléatoires pour chaque particule
      const positions = Array.from({ length: particleCount }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
      }));

      // Durées aléatoires pour chaque particule
      const durations = positions.map(() => particleSpeed + Math.random() * 10);

      // Créer une timeline pour les animations
      const tl = gsap.timeline();

      // Animer chaque particule
      positions.forEach((pos, index) => {
        tl.to(
          particles,
          {
            backgroundPosition: `${pos.x}% ${pos.y}%`,
            duration: durations[index],
            ease: 'power1.inOut',
          },
          index * 0.5
        );
      });

      // Répéter l'animation
      tl.repeat(-1);
    };

    // Démarrer l'animation des particules
    animateParticles();

    // Nettoyage
    return () => {
      gsap.killTweensOf(backgroundRef.current);
      gsap.killTweensOf(particlesRef.current);
    };
  }, [
    gradientSpeed,
    particleSpeed,
    particleCount,
    particleColor,
    particleOpacity,
    particleSize,
  ]);

  const positionClass = position === 'fixed' ? 'fixed' : 'absolute';

  // Styles de base pour le rendu initial (côté serveur)
  const baseStyles = {
    backgroundImage: `linear-gradient(135deg, ${gradientColors.start} 0%, ${gradientColors.middle} 50%, ${gradientColors.end} 100%)`,
    backgroundSize: '400% 400%',
  };

  const particlesBaseStyles = {
    backgroundImage: '',
    backgroundSize: '300% 300%',
    pointerEvents: 'none' as const,
  };

  // Styles pour le rendu côté client
  const clientStyles = isMounted
    ? {
        backgroundImage: `linear-gradient(135deg, ${gradientColors.start} 0%, ${gradientColors.middle} 50%, ${gradientColors.end} 100%)`,
        backgroundSize: '400% 400%',
      }
    : baseStyles;

  const particlesClientStyles = isMounted
    ? {
        backgroundImage: particlesBackground,
        backgroundSize: '300% 300%',
        pointerEvents: 'none' as const,
      }
    : particlesBaseStyles;

  return (
    <>
      <div
        ref={backgroundRef}
        className={`${positionClass} inset-0 z-[-2] ${className}`}
        style={clientStyles}
      />
      <div
        ref={particlesRef}
        className={`${positionClass} inset-0 z-[-1] ${className}`}
        style={particlesClientStyles}
      />
    </>
  );
};

export default AnimatedBackground;
