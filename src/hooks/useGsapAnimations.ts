import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, type RefObject } from 'react';

gsap.registerPlugin(ScrollTrigger);

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Restrained architectural hero entrance sequence.
 * Cleans up completely via gsap.context() on unmount.
 */
export function useHeroTimeline(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
      });

      tl.fromTo(
        '[data-hero-media]',
        { scale: 1.06, opacity: 0.72 },
        { scale: 1, opacity: 1, duration: 1.6, ease: 'power2.out' },
        0
      )
        .fromTo(
          '[data-hero-kicker]',
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75 },
          0.18
        )
        .fromTo(
          '[data-hero-title]',
          { y: 26, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.95 },
          0.3
        )
        .fromTo(
          '[data-hero-copy]',
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          0.48
        )
        .fromTo(
          '[data-hero-actions]',
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75 },
          0.62
        );
    }, el);

    return () => ctx.revert();
  }, [containerRef]);
}

/**
 * Progressive reveal for editorial blocks and project plates once content exists.
 */
export function useProjectReveal(
  containerRef: RefObject<HTMLElement | null>,
  ready = true
) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !ready || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>('[data-reveal]');
      items.forEach((item) => {
        gsap.fromTo(
          item,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 88%',
              once: true,
            },
          }
        );
      });
    }, el);

    return () => ctx.revert();
  }, [containerRef, ready]);
}

/**
 * Subtle architectural parallax for full-bleed / editorial study imagery.
 */
export function useParallaxSection(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const plates = gsap.utils.toArray<HTMLElement>('[data-parallax-media]');
      plates.forEach((plate) => {
        gsap.fromTo(
          plate,
          { yPercent: -5 },
          {
            yPercent: 5,
            ease: 'none',
            scrollTrigger: {
              trigger: plate.parentElement ?? plate,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      });
    }, el);

    return () => ctx.revert();
  }, [containerRef]);
}
