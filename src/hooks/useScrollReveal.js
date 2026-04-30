import { useState, useEffect, useRef } from "react";

/**
 * useScrollReveal — IntersectionObserver-based scroll reveal hook.
 * Returns { ref, isVisible }.
 * Once triggered (element 20% into viewport), stays visible permanently.
 */
export default function useScrollReveal(threshold = 0.2) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}
