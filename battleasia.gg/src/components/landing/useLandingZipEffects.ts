import { useEffect, useRef, type RefObject } from 'react';

/** Scroll progress, sticky header, reveal + hero-seq (zip app.js parity). */
export function useLandingZipEffects(rootRef: RefObject<HTMLElement | null>) {
  const lastScroll = useRef(0);
  const headerHidden = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const header = root.querySelector<HTMLElement>('.site-header');
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (header) {
          header.classList.toggle('is-scrolled', y > 40);
          if (y > 120) {
            if (y > lastScroll.current && !headerHidden.current) {
              header.classList.add('is-hidden');
              headerHidden.current = true;
            } else if (y < lastScroll.current && headerHidden.current) {
              header.classList.remove('is-hidden');
              headerHidden.current = false;
            }
          } else {
            header.classList.remove('is-hidden');
            headerHidden.current = false;
          }
        }
        lastScroll.current = y;
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const revealOne = (el: Element, delay = 0) => {
      if (el.classList.contains('is-visible')) return;
      const run = () => el.classList.add('is-visible');
      if (delay) window.setTimeout(run, delay);
      else run();
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          if (el.classList.contains('reveal-group')) return;
          revealOne(el);
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    root.querySelectorAll('.reveal-group').forEach((group) => {
      if (group.getAttribute('data-reveal-bound')) return;
      group.setAttribute('data-reveal-bound', '1');
      const items = group.classList.contains('reveal-group-direct')
        ? [...group.children].filter((el) => el.classList.contains('reveal'))
        : group.querySelectorAll('.reveal');
      items.forEach((el, i) => {
        const node = el;
        const obs = new IntersectionObserver(
          (entries) => {
            if (!entries.some((e) => e.isIntersecting)) return;
            revealOne(node, i * 70);
            obs.disconnect();
          },
          { threshold: 0.08 },
        );
        obs.observe(node);
      });
    });

    root.querySelectorAll('.reveal').forEach((el) => {
      if (el.closest('.reveal-group')) return;
      io.observe(el);
    });

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const words = root.querySelectorAll<HTMLElement>('.hero-title .word-inner');
    const seq = root.querySelectorAll<HTMLElement>('.hero-content .hero-seq');
    const side = root.querySelector<HTMLElement>('.hero-side.hero-seq');
    if (reduced) {
      seq.forEach((el) => el.classList.add('is-in'));
      side?.classList.add('is-in');
      words.forEach((w) => {
        w.style.transform = 'none';
      });
    } else {
      const ease = 'cubic-bezier(.22,1,.36,1)';
      const t0 = 180;
      const gap = 95;
      seq.forEach((el, i) => {
        window.setTimeout(() => el.classList.add('is-in'), t0 + gap * (i === 0 ? 0 : i + 1));
      });
      words.forEach((w, i) => {
        window.setTimeout(() => {
          w.style.transition = `transform 0.7s ${ease}`;
          w.style.transform = 'translateY(0)';
        }, t0 + gap + i * 85);
      });
      if (side) window.setTimeout(() => side.classList.add('is-in'), t0 + gap * 5);
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;

    const bindMotion = () => {
      root.querySelectorAll<HTMLElement>('.game-tile:not(.is-disabled):not([data-zip-tilt])').forEach((tile) => {
        tile.dataset.zipTilt = '1';
        if (coarse || reducedMotion) return;
        tile.addEventListener('mousemove', (e) => {
          const r = tile.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width) * 100;
          const y = ((e.clientY - r.top) / r.height) * 100;
          tile.style.setProperty('--mx', `${x}%`);
          tile.style.setProperty('--my', `${y}%`);
          const rx = ((y - 50) / 50) * -8;
          const ry = ((x - 50) / 50) * 8;
          tile.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        });
        tile.addEventListener('mouseleave', () => {
          tile.style.transform = '';
        });
      });

      root.querySelectorAll<HTMLElement>('.btn-magnetic:not([data-zip-mag])').forEach((btn) => {
        btn.dataset.zipMag = '1';
        if (reducedMotion) return;
        btn.addEventListener('mousemove', (e) => {
          const r = btn.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) * 0.08;
          const dy = (e.clientY - (r.top + r.height / 2)) * 0.08;
          btn.style.transform = `translate(${Math.max(-8, Math.min(8, dx))}px, ${Math.max(-8, Math.min(8, dy))}px)`;
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = '';
        });
      });

      root.querySelectorAll<HTMLElement>('.match-bar:not([data-bar-bound])').forEach((bar) => {
        bar.dataset.barBound = '1';
        const span = bar.querySelector('span');
        const pct = bar.dataset.pct || '0';
        if (!span) return;
        span.style.width = '0%';
        const run = () => {
          span.style.width = `${pct}%`;
        };
        if (reducedMotion) {
          run();
          return;
        }
        const obs = new IntersectionObserver(
          (entries) => {
            if (!entries.some((e) => e.isIntersecting)) return;
            run();
            obs.disconnect();
          },
          { threshold: 0.2 },
        );
        obs.observe(bar);
      });

      const tabs = [...root.querySelectorAll<HTMLElement>('.match-tab')];
      const underline = root.querySelector<HTMLElement>('.tab-underline');
      const active = tabs.find((tab) => tab.classList.contains('is-active')) || tabs[0];
      if (underline && active) {
        underline.style.width = `${active.offsetWidth}px`;
        underline.style.left = `${active.offsetLeft}px`;
      }
    };

    bindMotion();
    const mo = new MutationObserver(() => bindMotion());
    mo.observe(root, { childList: true, subtree: true });

    const onScrollParallax = () => {
      if (reducedMotion) return;
      const hero = root.querySelector<HTMLElement>('.hero');
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(rect.height, 1)));
      root.querySelectorAll<HTMLElement>('.hero-bg .hero-media').forEach((media) => {
        media.style.transform = `translateY(${progress * 14}%) scale(1.06)`;
      });
      const mesh = root.querySelector<HTMLElement>('.hero-mesh');
      if (mesh) {
        mesh.style.transform = `translateY(${progress * 40}px)`;
        mesh.style.opacity = String(1 - progress * 0.65);
      }
    };
    window.addEventListener('scroll', onScrollParallax, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onScrollParallax);
      io.disconnect();
      mo.disconnect();
    };
  }, [rootRef]);
}
