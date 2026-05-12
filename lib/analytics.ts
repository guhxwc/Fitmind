/**
 * Fitmind Analytics — PostHog integration
 * ---------------------------------------
 * This module is the single entry-point for ALL analytics in the app.
 * Every component should import from here instead of touching `posthog-js`
 * directly. That way:
 *
 *   1. We have one place to disable/swap analytics if needed.
 *   2. Event names are typed and discoverable (see `AnalyticsEvent` below).
 *   3. If PostHog isn't configured (no env vars), the app still works —
 *      every function becomes a silent no-op.
 *
 * To enable, set these env vars in your `.env.local` / Vercel project:
 *   VITE_POSTHOG_KEY=phc_XXXXXXXXXXXXXXXXXXXXXXXXX
 *   VITE_POSTHOG_HOST=https://us.i.posthog.com   (or https://eu.i.posthog.com)
 */

import posthog from 'posthog-js';

const POSTHOG_KEY =
  (import.meta as any).env?.VITE_POSTHOG_KEY ||
  (typeof process !== 'undefined' ? (process as any).env?.VITE_POSTHOG_KEY : undefined) ||
  '';

const POSTHOG_HOST =
  (import.meta as any).env?.VITE_POSTHOG_HOST ||
  (typeof process !== 'undefined' ? (process as any).env?.VITE_POSTHOG_HOST : undefined) ||
  'https://us.i.posthog.com';

let initialized = false;

// =====================================================================
// EVENT CATALOG — every custom event tracked in the app lives here so
// you can grep for any name and find exactly where it's fired. Edit the
// catalog when you add a new event, not when you fire one.
// =====================================================================
export const AnalyticsEvent = {
  // --- AUTH ---
  authViewed: 'auth_viewed',
  signupStarted: 'signup_started',
  signupCompleted: 'signup_completed',
  signupFailed: 'signup_failed',
  loginAttempted: 'login_attempted',
  loginCompleted: 'login_completed',
  loginFailed: 'login_failed',
  oauthStarted: 'oauth_started',
  passwordResetRequested: 'password_reset_requested',
  logoutClicked: 'logout_clicked',

  // --- ONBOARDING FUNNEL ---
  onboardingStarted: 'onboarding_started',
  onboardingStepViewed: 'onboarding_step_viewed',
  onboardingStepCompleted: 'onboarding_step_completed',
  onboardingAbandoned: 'onboarding_abandoned',
  onboardingCompleted: 'onboarding_completed',

  // --- SUBSCRIPTION / MONETIZATION ---
  subscriptionPageViewed: 'subscription_page_viewed',
  subscriptionPlanSelected: 'subscription_plan_selected',
  checkoutStarted: 'checkout_started',
  checkoutFailed: 'checkout_failed',
  paymentSuccessViewed: 'payment_success_viewed',
  trialEndedScreenViewed: 'trial_ended_screen_viewed',
  upsellViewed: 'upsell_viewed',
  upsellDismissed: 'upsell_dismissed',
  upsellClicked: 'upsell_clicked',
  proFeatureBlocked: 'pro_feature_blocked', // user tried a PRO-only feature

  // --- MEALS / DIET (core engagement) ---
  mealLogStarted: 'meal_log_started', // opened the SmartLog modal
  mealLogModeSelected: 'meal_log_mode_selected', // text, voice, photo, manual, favorites
  mealLogged: 'meal_logged',
  mealDeleted: 'meal_deleted',
  mealEdited: 'meal_edited',
  mealLogCancelled: 'meal_log_cancelled',
  mealLogFailed: 'meal_log_failed',
  favoriteMealAdded: 'favorite_meal_added',
  aiFoodSearchUsed: 'ai_food_search_used',

  // --- WATER & QUICK ADD ---
  waterLogged: 'water_logged',
  quickProteinAdded: 'quick_protein_added',

  // --- WEIGHT & PROGRESS ---
  weightLogged: 'weight_logged',
  weightMilestoneHit: 'weight_milestone_hit',
  progressPhotoAdded: 'progress_photo_added',

  // --- WORKOUTS ---
  workoutPlanGenerated: 'workout_plan_generated',
  workoutCompleted: 'workout_completed',
  workoutSkipped: 'workout_skipped',

  // --- APPLICATIONS (GLP-1 injections) ---
  applicationLogged: 'application_logged',
  applicationReminderSet: 'application_reminder_set',
  doseChanged: 'dose_changed',

  // --- SIDE EFFECTS ---
  sideEffectLogged: 'side_effect_logged',

  // --- NUTRITIONIST / CONSULTATION ---
  consultationViewed: 'consultation_viewed',
  anamnesisStarted: 'anamnesis_started',
  anamnesisCompleted: 'anamnesis_completed',
  nutriPanelOpened: 'nutri_panel_opened',
  dietPlanReceived: 'diet_plan_received',

  // --- REFERRAL ---
  referralCodeCaptured: 'referral_code_captured',
  referralDashboardViewed: 'referral_dashboard_viewed',
  referralShareClicked: 'referral_share_clicked',

  // --- NAVIGATION / GENERAL ---
  tabSwitched: 'tab_switched',
  calendarDateChanged: 'calendar_date_changed',
  reportGenerated: 'report_generated',
  notificationPermissionRequested: 'notification_permission_requested',
  notificationPermissionGranted: 'notification_permission_granted',
  notificationPermissionDenied: 'notification_permission_denied',
  themeToggled: 'theme_toggled',

  // --- ERRORS ---
  errorBoundaryTriggered: 'error_boundary_triggered',
  saveFailed: 'save_failed',
} as const;

export type AnalyticsEventName = typeof AnalyticsEvent[keyof typeof AnalyticsEvent];

// =====================================================================
// INIT — call once at app boot. Safe to call multiple times.
// =====================================================================
export function initAnalytics(): void {
  if (initialized) return;
  if (typeof window === 'undefined') return;
  if (!POSTHOG_KEY) {
    // No key? Silently disable. Local dev / preview builds work as normal.
    console.info('[analytics] PostHog key not set; analytics disabled.');
    return;
  }

  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      // 'identified_only' = only create person profiles for logged-in users.
      // Saves cost (anonymous events are 4x cheaper) but still tracks
      // pageviews/clicks for everyone.
      person_profiles: 'identified_only',

      // Autocapture clicks, inputs, etc. so we get rich data without
      // having to instrument every button. Custom events on top of this
      // give us the funnel-specific stuff.
      autocapture: true,
      capture_pageview: false,          // we drive pageviews manually (SPA)
      capture_pageleave: true,
      capture_performance: true,
      disable_session_recording: false, // session replay ON
      session_recording: {
        maskAllInputs: true,            // mask all <input> by default — privacy
        maskTextSelector: '[data-private], [data-ph-private]',
      },

      // Don't capture in localhost or preview unless explicitly opted in.
      // Set VITE_POSTHOG_DEBUG=1 to enable in dev.
      loaded: (ph) => {
        const isLocalhost = /localhost|127\.0\.0\.1/.test(window.location.hostname);
        const debug =
          (import.meta as any).env?.VITE_POSTHOG_DEBUG === '1' ||
          (import.meta as any).env?.VITE_POSTHOG_DEBUG === 'true';
        if (isLocalhost && !debug) {
          ph.opt_out_capturing();
          console.info('[analytics] PostHog opted out on localhost (set VITE_POSTHOG_DEBUG=1 to enable).');
        }
      },
    });
    initialized = true;
  } catch (err) {
    console.error('[analytics] failed to init PostHog:', err);
  }
}

function isReady(): boolean {
  return initialized && !!POSTHOG_KEY && typeof window !== 'undefined';
}

// =====================================================================
// CORE API
// =====================================================================

export function track(event: AnalyticsEventName | string, properties?: Record<string, any>): void {
  if (!isReady()) return;
  try {
    posthog.capture(event, properties);
  } catch (err) {
    console.warn('[analytics] track failed', event, err);
  }
}

export function identifyUser(
  distinctId: string,
  properties?: Record<string, any>,
): void {
  if (!isReady()) return;
  if (!distinctId) return;
  try {
    posthog.identify(distinctId, properties);
  } catch (err) {
    console.warn('[analytics] identify failed', err);
  }
}

/**
 * Update properties on the currently-identified person without re-identifying.
 * Useful when user data changes mid-session (weight, plan, etc).
 */
export function setUserProperties(properties: Record<string, any>): void {
  if (!isReady()) return;
  try {
    posthog.setPersonProperties(properties);
  } catch (err) {
    console.warn('[analytics] setPersonProperties failed', err);
  }
}

/**
 * Set "set-once" properties — first-touch data like signup_source.
 * Won't overwrite if already set.
 */
export function setUserPropertiesOnce(properties: Record<string, any>): void {
  if (!isReady()) return;
  try {
    // PostHog signature: setPersonProperties(setProps, setOnceProps).
    // Empty object for `set` and the actual map for `setOnce`.
    posthog.setPersonProperties({}, properties);
  } catch (err) {
    console.warn('[analytics] setPersonPropertiesOnce failed', err);
  }
}

/**
 * Call on logout. Clears the distinct ID and starts a fresh anonymous
 * session. CRITICAL for shared computers.
 */
export function resetAnalytics(): void {
  if (!isReady()) return;
  try {
    posthog.reset();
  } catch (err) {
    console.warn('[analytics] reset failed', err);
  }
}

/**
 * Track an SPA pageview. Call this whenever the route changes.
 * We send the path + search but never the hash (which may contain
 * sensitive tokens like supabase password reset).
 */
export function trackPageview(path: string, extra?: Record<string, any>): void {
  if (!isReady()) return;
  try {
    posthog.capture('$pageview', {
      $current_url: window.location.origin + path,
      path,
      ...extra,
    });
  } catch (err) {
    console.warn('[analytics] pageview failed', err);
  }
}

/**
 * Register "super properties" that get attached to EVERY event from now
 * on. Use for things like app_version, plan tier, etc.
 */
export function registerSuperProperties(properties: Record<string, any>): void {
  if (!isReady()) return;
  try {
    posthog.register(properties);
  } catch (err) {
    console.warn('[analytics] register failed', err);
  }
}

export function getDistinctId(): string | null {
  if (!isReady()) return null;
  try {
    return posthog.get_distinct_id();
  } catch {
    return null;
  }
}

// Re-export the raw client for power users who need feature flags etc.
// Prefer the wrappers above for normal use.
export { posthog as posthogClient };
