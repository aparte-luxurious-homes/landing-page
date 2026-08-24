/**
 * JSON-LD serialisation, hardened against script-breakout XSS.
 *
 * JSON.stringify does NOT escape `<`, `>` or `&`, so owner/guest-controlled
 * content (property name/description, review comments) could otherwise break
 * out of the script with a literal `</script>` sequence and inject markup
 * (stored XSS). Escaping these characters — plus the U+2028/U+2029 line
 * separators that are invalid in JS string literals — neutralises any
 * breakout regardless of upstream content.
 *
 * Shared by the server-rendered layout and the client <Seo> component so the
 * two can never drift. Originally added in the A1 security audit fix.
 *
 * The line/paragraph separators are matched via fromCharCode-built RegExp
 * objects so this source file stays ASCII — embedding those code points
 * literally inside a /regex/ breaks the parser (they are line terminators).
 */

export type JsonLd = Record<string, unknown>;

const LINE_SEPARATOR = new RegExp(String.fromCharCode(0x2028), 'g');
const PARAGRAPH_SEPARATOR = new RegExp(String.fromCharCode(0x2029), 'g');

export const toJsonLd = (obj: JsonLd): string =>
  JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(LINE_SEPARATOR, '\\u2028')
    .replace(PARAGRAPH_SEPARATOR, '\\u2029');
