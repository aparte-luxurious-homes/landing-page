import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "You're offline",
  robots: { index: false, follow: false },
};

/** Served by the service worker when a page load fails with no connection. */
export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 24,
        textAlign: "center",
        background: "#F3EFE7",
        color: "#191919",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <img src="/icons/icon-192.png" alt="" width={72} height={72} style={{ borderRadius: 18 }} />
      <h1 style={{ margin: 0, fontFamily: "Fraunces, ui-serif, Georgia, serif", fontSize: "2rem" }}>
        You&apos;re offline
      </h1>
      <p style={{ margin: 0, maxWidth: 360, color: "rgba(25,25,25,0.7)" }}>
        Aparte needs a connection to show live availability and prices. Check your network and try again.
      </p>
      <a
        href="/"
        style={{ marginTop: 8, padding: "12px 24px", borderRadius: 999, background: "#028090", color: "#fff", fontWeight: 700, textDecoration: "none" }}
      >
        Try again
      </a>
    </main>
  );
}
