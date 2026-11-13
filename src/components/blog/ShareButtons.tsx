import CopyLinkButton from "./CopyLinkButton";

/**
 * Plain share links (no third-party scripts, nothing tracking the reader):
 * each network's own "share this URL" address. The preview card they show
 * comes from the article's Open Graph tags.
 */
export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { name: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
    { name: "X", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
  ];
  const btn =
    "inline-flex items-center rounded-full border border-gray-200 px-3 py-1.5 text-sm font-semibold text-ink hover:border-teal hover:text-teal transition";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-500 mr-1">Share</span>
      {links.map((l) => (
        <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer" className={btn}>
          {l.name}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ))}
      <CopyLinkButton url={url} className={btn} />
    </div>
  );
}
