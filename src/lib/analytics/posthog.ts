import posthog from 'posthog-js';

export function initAnalytics() {
  const apiKey = import.meta.env.VITE_POSTHOG_KEY;

  if (!apiKey || import.meta.env.DEV) {
    console.log('[PostHog] disabled (no key or in dev mode)');
    return;
  }

  posthog.init(apiKey, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    disable_session_recording: false,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '[data-private]',
    },
    loaded: (ph) => {
      if (import.meta.env.DEV) ph.opt_out_capturing();
    },
  });
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  posthog.identify(userId, traits);
}

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  posthog.capture(name, properties);
}

export function resetAnalytics() {
  posthog.reset();
}
