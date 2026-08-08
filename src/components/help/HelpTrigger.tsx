"use client";

import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useHelpStore } from "@/lib/help/store";
import { trackHelpEvent } from "@/lib/help/analytics";
import { hasWhatsappSupport, whatsappUrl } from "@/lib/help/support";

export function HelpTrigger() {
  const pathname = useLocation().pathname;
  const open = useHelpStore((s) => s.open);
  const isOpen = useHelpStore((s) => s.isOpen);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const whatsappEnabled = hasWhatsappSupport();

  // Outside-click + Escape dismissal — only attach while menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        menuRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) return;
      setMenuOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  // Drawer opened via keyboard `?` shortcut — collapse the menu if it was open.
  useEffect(() => {
    if (isOpen) setMenuOpen(false);
  }, [isOpen]);

  // Hide while the drawer is open or while we're already on /help/*.
  //
  // Also hide on property pages: MobileBookingSummary pins a fixed booking bar
  // to `bottom: 0` with `zIndex: 1000` there, which this FAB (bottom-4, z-50)
  // sits on top of — and that bar now carries its own, better-targeted
  // WhatsApp action with the guest's booking context attached. Two competing
  // WhatsApp entry points stacked on each other is worse than one.
  const isPropertyPage = pathname.startsWith("/property-details");
  if (isOpen || pathname.startsWith("/help") || isPropertyPage) return null;

  function handleFabClick() {
    if (!whatsappEnabled) {
      // Single-action fallback — straight to drawer.
      open();
      trackHelpEvent("help_opened", { surface: "drawer", source: "fab" });
      return;
    }
    setMenuOpen((v) => !v);
  }

  function handleBrowseHelp() {
    trackHelpEvent("help_opened", { surface: "drawer", source: "fab_menu" });
    // Defer the drawer open past the current pointer event. Without this,
    // Vaul mounts the drawer mid-click and can register the in-flight
    // pointer-up as a backdrop dismiss, closing the drawer immediately.
    // `setMenuOpen(false)` isn't needed — HelpTrigger unmounts when isOpen flips.
    requestAnimationFrame(() => open());
  }

  function handleWhatsApp() {
    trackHelpEvent("help_contact_clicked", {
      surface: "fab",
      channel: "whatsapp",
    });
    setMenuOpen(false);
    window.open(whatsappUrl(), "_blank", "noopener,noreferrer");
  }

  return (
    <>
      {menuOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Help options"
          className="fixed bottom-20 right-4 z-50 w-60 rounded-xl bg-white shadow-xl border border-gray-200 overflow-hidden"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleWhatsApp}
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-left"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white shrink-0"
              aria-hidden
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.030-.967-.273-.099-.471-.148-.670.150-.197.297-.767.966-.940 1.164-.173.199-.347.223-.644.075-.297-.150-1.255-.463-2.39-1.475-.883-.788-1.480-1.761-1.653-2.059-.173-.297-.018-.458.130-.606.134-.133.298-.347.446-.520.149-.174.198-.298.298-.497.099-.198.050-.371-.025-.520-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.500-.669-.510-.173-.008-.371-.010-.570-.010-.198 0-.520.074-.792.371-.272.297-1.040 1.016-1.040 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.200 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.360.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.570-.347m-5.421 7.403h-.004a9.870 9.870 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.860 9.860 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.640 0 5.122 1.030 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.450-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.050 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488" />
              </svg>
            </span>
            <span>
              <span className="block font-semibold text-ink text-sm">Chat on WhatsApp</span>
              <span className="block text-xs text-gray-500">Fastest reply</span>
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleBrowseHelp}
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-left border-t border-gray-100"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-soft text-teal shrink-0"
              aria-hidden
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
            </span>
            <span>
              <span className="block font-semibold text-ink text-sm">Browse help</span>
              <span className="block text-xs text-gray-500">Guides &amp; FAQ</span>
            </span>
          </button>
        </div>
      )}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleFabClick}
        aria-label={menuOpen ? "Close help menu" : "Open help"}
        aria-expanded={menuOpen}
        aria-haspopup={whatsappEnabled ? "menu" : undefined}
        className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full bg-teal text-white text-2xl font-bold shadow-lg hover:bg-teal/90 focus:outline-none focus:ring-4 focus:ring-teal/40 transition"
      >
        ?
      </button>
    </>
  );
}
