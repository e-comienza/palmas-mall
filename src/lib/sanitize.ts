import sanitizeHtmlLib from "sanitize-html";

/**
 * Saneado del HTML rich text que se guarda desde el admin.
 *
 * El contenido se renderiza con `dangerouslySetInnerHTML` en las páginas
 * públicas, así que un EDITOR que hiciera POST directo a la server action
 * (saltándose el editor Tiptap del navegador) podría inyectar `<script>` o
 * `onerror=` y ejecutar código en el origen del sitio — con la sesión de
 * cualquier admin que visitara esa página.
 *
 * Se aplica en dos sitios a propósito:
 *   - al guardar (server actions), para no dejar payloads en la DB;
 *   - al renderizar, para que las filas ya guardadas también queden limpias.
 *
 * La allowlist cubre lo que produce Tiptap (StarterKit con headings 2-3 +
 * extension-link) más algunas etiquetas de contenido pegado.
 */
const OPTIONS: sanitizeHtmlLib.IOptions = {
  allowedTags: [
    "p", "br", "hr",
    "h2", "h3", "h4", "h5", "h6",
    "strong", "b", "em", "i", "u", "s", "sub", "sup", "mark", "small",
    "ul", "ol", "li",
    "blockquote", "pre", "code",
    "a", "img",
    "table", "thead", "tbody", "tr", "th", "td",
    "span", "div", "figure", "figcaption",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    "*": ["class"],
  },
  // Sin `javascript:`, `data:` ni `vbscript:`.
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  // Los enlaces externos no deben poder tocar `window.opener`.
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        ...(attribs.target === "_blank" ? { rel: "noopener noreferrer" } : {}),
      },
    }),
  },
  // `style` fuera: habilita exfiltración por CSS y no lo usa el editor.
  allowedStyles: {},
  disallowedTagsMode: "discard",
};

/** Limpia HTML rich text dejando solo etiquetas y URLs seguras. */
export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtmlLib(html, OPTIONS);
}
