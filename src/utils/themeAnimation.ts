/**
 * Theme Animation Engine for Audio Grabber
 * Handles View Transitions API (circular expand/shrink with feathering)
 * and Canvas-based Donut Ring effect when theme doesn't change.
 */

export const THEME_ANIM = {
  durationExpand: 750,
  durationShrink: 750,
  durationDonut: 800,
  featherRatio: 0.14,
  minFeather: 80,
  maxFeather: 220,
  donutRingRatio: 0.16,
  minDonutRing: 100,
  maxDonutRing: 260,
  donutColorLight: 'rgba(100, 116, 139, 0.28)',
  donutColorDark: 'rgba(255, 255, 255, 0.18)',
};

export type ThemeMode = 'light' | 'dark' | 'system';

interface ActiveTransition {
  skipTransition: () => void;
}

let activeTransition: ActiveTransition | null = null;
let currentDonutCleanup: (() => void) | null = null;

export function cancelActiveAnimations() {
  if (activeTransition) {
    try {
      activeTransition.skipTransition();
    } catch {}
    activeTransition = null;
  }
  if (currentDonutCleanup) {
    try {
      currentDonutCleanup();
    } catch {}
    currentDonutCleanup = null;
  }
  delete document.documentElement.dataset.themeAnim;
}

/**
 * Runs the feathered donut ring animation from the center of origin element
 */
export function runDonutAnimation(
  x: number,
  y: number,
  isDark: boolean,
  onComplete?: () => void
): () => void {
  // Respect prefers-reduced-motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    onComplete?.();
    return () => {};
  }

  cancelActiveAnimations();

  const maxDimension = Math.max(window.innerWidth, window.innerHeight);
  const ringThickness = Math.min(
    THEME_ANIM.maxDonutRing,
    Math.max(THEME_ANIM.minDonutRing, maxDimension * THEME_ANIM.donutRingRatio)
  );

  const maxR =
    Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    ) + ringThickness;

  const canvas = document.createElement('canvas');
  canvas.id = 'theme-donut-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = '9998';
  canvas.style.pointerEvents = 'none';
  if (isDark) {
    canvas.style.mixBlendMode = 'screen';
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    onComplete?.();
    return () => {};
  }

  document.body.appendChild(canvas);

  let animationFrameId: number;
  const startTime = performance.now();
  const duration = THEME_ANIM.durationDonut;
  const rgb = isDark ? '255, 255, 255' : '100, 116, 139';

  const render = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);

    // Ease-out cubic
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentR = maxR * easeProgress;

    // Fade out towards the end (in the last 25%)
    let opacity = 1;
    if (progress > 0.75) {
      opacity = (1 - progress) / 0.25;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentR > 0) {
      const innerR = Math.max(0, currentR - ringThickness);

      const gradient = ctx.createRadialGradient(x, y, innerR, x, y, currentR);
      const peakAlpha = isDark ? 0.18 * opacity : 0.28 * opacity;

      gradient.addColorStop(0, `rgba(${rgb}, 0)`);
      gradient.addColorStop(0.5, `rgba(${rgb}, ${peakAlpha})`);
      gradient.addColorStop(1, `rgba(${rgb}, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, currentR, 0, Math.PI * 2);
      ctx.fill();
    }

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(render);
    } else {
      if (canvas.parentNode) canvas.remove();
      if (currentDonutCleanup === cleanup) currentDonutCleanup = null;
      onComplete?.();
    }
  };

  animationFrameId = requestAnimationFrame(render);

  const cleanup = () => {
    cancelAnimationFrame(animationFrameId);
    if (canvas.parentNode) {
      canvas.remove();
    }
    if (currentDonutCleanup === cleanup) {
      currentDonutCleanup = null;
    }
  };

  currentDonutCleanup = cleanup;
  return cleanup;
}

/**
 * Runs the circular feathered View Transition between Light and Dark
 * - Expand (Tối -> Sáng): Light layer expands from origin with feather
 * - Shrink (Sáng -> Tối): Light layer shrinks into origin with feather, revealing Dark
 */
export function runThemeTransition(
  nextIsDark: boolean,
  originEl: HTMLElement | null,
  applyThemeSync: () => void
): Promise<void> {
  const root = document.documentElement;
  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reduced motion: Apply instantly without effects
  if (prefersReducedMotion) {
    applyThemeSync();
    return Promise.resolve();
  }

  // Calculate center of origin element
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  if (originEl) {
    const b = originEl.getBoundingClientRect();
    x = b.left + b.width / 2;
    y = b.top + b.height / 2;
  }

  const maxDim = Math.max(window.innerWidth, window.innerHeight);
  const feather = Math.min(
    THEME_ANIM.maxFeather,
    Math.max(THEME_ANIM.minFeather, maxDim * THEME_ANIM.featherRatio)
  );

  const maxR = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );
  const endRadius = maxR + feather;

  // Fallback if View Transitions API is not available
  if (!('startViewTransition' in document)) {
    root.classList.add('theme-transitioning');
    applyThemeSync();
    // Run donut ring on fallback as visual feedback
    runDonutAnimation(x, y, nextIsDark);
    setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, 300);
    return Promise.resolve();
  }

  // Cancel any running transition
  cancelActiveAnimations();

  // Set animation direction:
  // - result is light (nextIsDark = false) => 'expand'
  // - result is dark (nextIsDark = true) => 'shrink'
  const expand = !nextIsDark;
  root.dataset.themeAnim = expand ? 'expand' : 'shrink';
  root.style.setProperty('--cx', `${x}px`);
  root.style.setProperty('--cy', `${y}px`);
  root.style.setProperty('--feather', `${feather}px`);
  root.style.setProperty('--r-max', `${endRadius}px`);

  try {
    const vt = (document as any).startViewTransition(() => {
      // Synchronously apply theme class and theme-color
      applyThemeSync();
    });

    activeTransition = vt;

    vt.ready
      ?.then(() => {
        // Double security: drive Web Animations API in tandem with CSS animation
        try {
          root.animate(
            {
              '--r': expand ? ['0px', `${endRadius}px`] : [`${endRadius}px`, '0px'],
            },
            {
              duration: expand ? THEME_ANIM.durationExpand : THEME_ANIM.durationShrink,
              fill: 'forwards',
              easing: expand ? 'cubic-bezier(.22, 1, .36, 1)' : 'cubic-bezier(.65, 0, .35, 1)',
              pseudoElement: expand ? '::view-transition-new(root)' : '::view-transition-old(root)',
            }
          );
        } catch {}
      })
      ?.catch(() => {});

    return vt.finished
      ?.then(() => {})
      ?.catch(() => {})
      ?.finally(() => {
        delete root.dataset.themeAnim;
        if (activeTransition === vt) {
          activeTransition = null;
        }
      });
  } catch {
    applyThemeSync();
    delete root.dataset.themeAnim;
    return Promise.resolve();
  }
}
