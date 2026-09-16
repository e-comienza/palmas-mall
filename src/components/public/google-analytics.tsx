import Script from "next/script";

/** Measurement ID de GA4. Es público: viaja en el HTML de cada página. */
const GA_ID = "G-0KTL3C2694";

/**
 * Etiqueta de Google Analytics 4.
 *
 * Se monta solo en el layout público, no en /admin: medir el uso del panel
 * ensucia las métricas del sitio con la actividad del equipo.
 *
 * En desarrollo no se renderiza, para no mandar visitas de local a la
 * propiedad real.
 */
export function GoogleAnalytics() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
