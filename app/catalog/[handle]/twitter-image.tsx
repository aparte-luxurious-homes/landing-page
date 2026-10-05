/**
 * Same card as the Open Graph image — X reads twitter:image first.
 *
 * The segment config is restated rather than re-exported: Next reads these
 * statically from the file and does not follow `export ... from`.
 */
export { default } from "./opengraph-image";

export const runtime = "edge";
export const alt = "Host on Aparte";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
