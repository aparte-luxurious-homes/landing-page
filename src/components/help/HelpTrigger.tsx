"use client";

import { useLocation } from "react-router-dom";
import { useHelpStore } from "@/lib/help/store";
import { trackHelpEvent } from "@/lib/help/analytics";

export function HelpTrigger() {
  const pathname = useLocation().pathname;
  const open = useHelpStore((s) => s.open);
  const isOpen = useHelpStore((s) => s.isOpen);

  // Hide while the drawer is open or while we're already on /help/*.
  if (isOpen || pathname.startsWith("/help")) return null;

  return (
    <button
      type="button"
      onClick={() => {
        open();
        trackHelpEvent("help_opened", { surface: "drawer", source: "fab" });
      }}
      aria-label="Open help"
      className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full bg-teal text-white text-2xl font-bold shadow-lg hover:bg-teal/90 focus:outline-none focus:ring-4 focus:ring-teal/40 transition"
    >
      ?
    </button>
  );
}
