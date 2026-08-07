import { useEffect, useState, type RefObject } from 'react';

type UseInViewOptions = {
  once?: boolean;
  rootMargin?: string;
  threshold?: number | number[];
};

/**
 * IntersectionObserver-based in-view — no framer-motion dependency.
 * Use this on the critical path instead of `useInView` from framer-motion.
 */
export function useInView(
  ref: RefObject<Element | null>,
  { once = true, rootMargin = '200px 0px', threshold = 0 }: UseInViewOptions = {}
) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, once, rootMargin, threshold]);

  return inView;
}
