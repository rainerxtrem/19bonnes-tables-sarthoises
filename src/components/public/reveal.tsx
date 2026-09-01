"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Fait apparaître son contenu (fondu + léger décalage) quand il entre dans
 * le viewport — voir le CSS `[data-reveal]` dans globals.css.
 * Volontairement minimal (IntersectionObserver natif) pour ne pas ajouter de
 * dépendance juste pour une animation de scroll.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
}: {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          node.setAttribute("data-reveal", "in");
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} data-reveal="" style={delay ? { transitionDelay: `${delay}ms` } : undefined} className={className}>
      {children}
    </Tag>
  );
}
