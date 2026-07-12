import Link from "next/link";
import Image from "next/image";
import { getNavigation, getSedes } from "@/lib/queries";
import { getSiteSettings } from "@/lib/settings";
import { SocialIcons } from "./social-icons";

export async function Footer() {
  const [settings, footerNav, sedes] = await Promise.all([
    getSiteSettings(),
    getNavigation("footer"),
    getSedes(),
  ]);

  const year = new Date().getFullYear();

  return (
    <footer className="bg-palm-950 text-mist-100">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr]">
          {/* Marca */}
          <div>
            <Image
              src={settings.logoAltUrl || settings.logoUrl}
              alt={`Logo de ${settings.mallName}`}
              width={200}
              height={60}
              className="h-12 w-auto brightness-0 invert"
            />
            <p className="mt-5 max-w-[42ch] text-[15px] leading-relaxed text-mist-300">
              El Lifestyle Mall que trajo a Colombia una nueva forma de vivir la
              ciudad: gastronomía, compras, eventos y arquitectura a cielo
              abierto para tus mejores momentos.
            </p>
            <div className="mt-6">
              <SocialIcons
                instagramUrl={settings.instagramUrl}
                tiktokUrl={settings.tiktokUrl}
                facebookUrl={settings.facebookUrl}
                twitterUrl={settings.twitterUrl}
                onDark
              />
            </div>
          </div>

          {/* Navegación */}
          <nav aria-label="Navegación del pie de página">
            <p className="font-display text-sm font-bold uppercase tracking-wide text-mist-400">
              Explora
            </p>
            <ul className="mt-4 grid grid-cols-1 gap-2.5">
              {footerNav.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.url}
                    className="text-[15px] text-mist-200 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sedes y contacto */}
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-wide text-mist-400">
              Visítanos
            </p>
            <ul className="mt-4 space-y-5">
              {sedes.map((sede) => (
                <li key={sede.id} className="text-[15px] leading-relaxed">
                  <p className="font-semibold text-white">{sede.city}</p>
                  <p className="text-mist-300">{sede.address}</p>
                  {sede.phone ? (
                    <a href={`tel:${sede.phone.replace(/\s/g, "")}`} className="text-mist-300 transition-colors hover:text-white">
                      {sede.phone}
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
            <a
              href={`mailto:${settings.email}`}
              className="mt-5 inline-block text-[15px] text-mist-300 transition-colors hover:text-white"
            >
              {settings.email}
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-mist-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.mallName}®. Todos los derechos reservados.
          </p>
          <Link
            href="/politica-tratamiento-datos"
            className="transition-colors hover:text-white"
          >
            Política de tratamiento de datos
          </Link>
        </div>
      </div>
    </footer>
  );
}
