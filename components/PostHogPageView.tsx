import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageview } from '../lib/analytics';

/**
 * Listens for React Router location changes and fires a $pageview to
 * PostHog every time the route actually changes. We auto-disable PostHog's
 * built-in pageview capture (capture_pageview: false) because in an SPA
 * the URL change isn't tied to a real page load and we want to control
 * exactly when an event fires.
 *
 * Mount this once, inside <BrowserRouter>, near the top of the tree.
 */
export const PostHogPageView: React.FC = () => {
  const { pathname, search } = useLocation();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    const fullPath = pathname + (search || '');
    // Avoid firing pageview twice for the same path (StrictMode double-render
    // and a few edge cases where search params change but the path doesn't).
    if (lastPathRef.current === fullPath) return;
    lastPathRef.current = fullPath;

    trackPageview(fullPath, {
      // Map the path to a friendly section name so funnels are easier to read
      // in the PostHog dashboard.
      section: classifySection(pathname),
    });
  }, [pathname, search]);

  return null;
};

function classifySection(path: string): string {
  if (path === '/') return 'summary';
  if (path.startsWith('/auth')) return 'auth';
  if (path.startsWith('/meals')) return 'meals';
  if (path.startsWith('/dieta')) return 'diet';
  if (path.startsWith('/workouts')) return 'workouts';
  if (path.startsWith('/progress')) return 'progress';
  if (path.startsWith('/applications')) return 'applications';
  if (path.startsWith('/consultation') || path.startsWith('/consultoria') || path.startsWith('/anamnese')) return 'consultation';
  if (path.startsWith('/settings')) return 'settings';
  if (path.startsWith('/referrals')) return 'referrals';
  if (path.startsWith('/painel-nutri')) return 'nutri-panel';
  if (path.startsWith('/success')) return 'payment-success';
  if (path.startsWith('/reset-password')) return 'reset-password';
  if (path.startsWith('/terms') || path.startsWith('/privacy')) return 'legal';
  if (path.startsWith('/assinaturas')) return 'subscription';
  return 'other';
}
