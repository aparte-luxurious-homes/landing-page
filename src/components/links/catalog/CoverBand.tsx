import SmartImage from "./SmartImage";

interface CoverBandProps {
  displayName: string;
  coverImage: string | null;
  mosaic: string[];
  profileImage: string | null;
}

/**
 * The banner a host's page opens on, with their avatar breaking its bottom
 * edge.
 *
 * Three states, in order of preference: an uploaded cover; a strip of their
 * own listings' photos (every page has photos, so no page opens blank); a
 * flat teal. The strip is a row of equal tiles rather than a collage with a
 * hero — a collage needs a fixed count to fill its grid, and a host with
 * three listings would get two empty cells.
 *
 * Mobile shows up to three tiles, desktop up to six with the first doubled;
 * the class lookups are literal so Tailwind keeps them.
 */

const MOBILE_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
};

const DESKTOP_COLS: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
};

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function CoverBand({
  displayName,
  coverImage,
  mosaic,
  profileImage,
}: CoverBandProps) {
  const tiles = coverImage ? [] : mosaic.slice(0, 6);
  const mobileCount = Math.min(tiles.length, 3);
  // Six photos become five desktop tiles with the first spanning two
  // columns; fewer than six are one column each.
  const doubleFirst = tiles.length >= 6;
  const desktopCount = doubleFirst ? 6 : tiles.length;

  return (
    <div className="relative">
      <div className="relative -mx-4 h-44 overflow-hidden bg-[#01515f] sm:mx-0 sm:h-64 sm:rounded-3xl md:h-80">
        {coverImage ? (
          <SmartImage
            src={coverImage}
            alt=""
            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 100vw, 1024px"
            priority
          />
        ) : tiles.length > 0 ? (
          <div
            className={`grid h-full ${MOBILE_COLS[mobileCount]} ${DESKTOP_COLS[desktopCount]} gap-0.5`}
          >
            {tiles.map((src, i) => (
              <div
                key={src}
                className={[
                  "relative",
                  i >= 3 ? "hidden md:block" : "",
                  i === 0 && doubleFirst ? "md:col-span-2" : "",
                  // The sixth photo only exists to let the first span two
                  // columns; it is never shown.
                  i === 5 ? "md:hidden" : "",
                ].join(" ")}
              >
                <SmartImage
                  src={src}
                  alt=""
                  sizes={
                    i === 0
                      ? "(max-width: 900px) 34vw, 340px"
                      : "(max-width: 900px) 34vw, 200px"
                  }
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full bg-gradient-to-br from-[#01515f] via-teal to-[#05a3b5]" />
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent"
        />
      </div>

      <div className="-mt-12 pl-1 sm:pl-8 md:-mt-16">
        <span className="relative block h-24 w-24 overflow-hidden rounded-full bg-teal-soft ring-4 ring-white shadow-md md:h-32 md:w-32">
          {profileImage ? (
            <SmartImage
              src={profileImage}
              alt={displayName}
              sizes="(max-width: 900px) 96px, 128px"
              priority
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-serif text-3xl font-semibold text-teal md:text-4xl">
              {initialsOf(displayName) || "A"}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
