import ShareButton from "./ShareButton";
import WhatsAppLink from "./WhatsAppLink";

interface MobileActionBarProps {
  displayName: string;
  whatsappUrl: string | null;
  pageUrl: string;
}

/**
 * The two actions a guest takes on a phone, kept under the thumb.
 *
 * Shorter than the page's bottom padding (pb-32), so the closing footnote is
 * never hidden behind it and the Footer's pull-up contract is untouched.
 * `pb-[env(safe-area-inset-bottom)]` clears the home indicator on iOS.
 */
export default function MobileActionBar({
  displayName,
  whatsappUrl,
  pageUrl,
}: MobileActionBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <div className="flex gap-3">
        {whatsappUrl && (
          <WhatsAppLink href={whatsappUrl} className="flex-1" label="WhatsApp" />
        )}
        <ShareButton
          title={`${displayName} on Aparte`}
          url={pageUrl}
          className="flex-1"
        />
      </div>
    </div>
  );
}
