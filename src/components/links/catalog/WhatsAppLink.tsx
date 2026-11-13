interface WhatsAppLinkProps {
  href: string;
  className?: string;
  /** Wider button label for the header; the action bar uses the short one. */
  label?: string;
}

/** The one off-platform contact a host may offer, in WhatsApp's own green so
 * it reads as WhatsApp and not as a second Aparte button. */
export default function WhatsAppLink({
  href,
  className = "",
  label = "Chat on WhatsApp",
}: WhatsAppLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1fb955] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] ${className}`}
    >
      <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2m0 1.67c4.54 0 8.24 3.7 8.24 8.24s-3.7 8.24-8.24 8.24c-1.52 0-3.01-.42-4.31-1.2l-.31-.18-3.12.82.83-3.04-.2-.32a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23m-3.4 4.36c-.16 0-.43.06-.65.3-.23.24-.87.85-.87 2.07s.89 2.4 1.01 2.57c.13.17 1.77 2.7 4.29 3.79 2.09.83 2.52.66 2.97.62.46-.04 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.29s-1.47-.73-1.7-.81c-.23-.08-.4-.13-.56.12-.17.25-.65.81-.8.98-.14.17-.29.19-.54.06-.25-.13-1.05-.39-2-1.24-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.42h-.5" />
      </svg>
      {label}
    </a>
  );
}
