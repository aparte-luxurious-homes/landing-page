import * as Sentry from "@sentry/react";

export const initSentry = () => {
    const dsn = import.meta.env.VITE_SENTRY_DSN;

    if (!dsn || dsn.includes("project-id")) {
        console.warn("Sentry DSN not found or placeholder. Skipping initialization.");
        return;
    }

    Sentry.init({
        dsn,
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration(),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0, //  Capture 100% of the transactions
        // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
        tracePropagationTargets: ["localhost", /^https:\/\/api\.aparteng\.com/],
        // Session Replay
        replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
        replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
        environment: import.meta.env.MODE,
    });
};
