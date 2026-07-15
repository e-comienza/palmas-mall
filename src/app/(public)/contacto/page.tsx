import type { Metadata } from "next";
import { Phone, EnvelopeSimple, MapPin, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/public/page-header";
import { Container } from "@/components/public/container";
import { ContactForm } from "@/components/public/contact-form";
import { SocialIcons } from "@/components/public/social-icons";
import { getSiteSettings } from "@/lib/settings";
import { getSedes, getPage } from "@/lib/queries";
import { heroData } from "@/lib/blocks";
import { ExtraBlocks } from "@/components/public/block-renderer";
import { PageFaqs } from "@/components/public/page-faqs";
import { webPageJsonLd, JsonLdScript } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("contacto", "/contacto");
}

export default async function ContactoPage() {
  const [settings, sedes, page] = await Promise.all([
    getSiteSettings(),
    getSedes(),
    getPage("contacto"),
  ]);
  const hero = heroData(page);

  return (
    <>
      <JsonLdScript
        data={webPageJsonLd({
          path: "/contacto",
          name: hero.heading || "Contáctanos",
          description: page?.seoDescription,
        })}
      />
      <PageHeader
        title={hero.heading || "Contáctanos"}
        intro={hero.subheading || "En Palmas Mall estamos siempre dispuestos a escucharte: escríbenos si tienes dudas o inquietudes sobre nuestros locales y servicios."}
        crumbs={[{ name: "Contacto", path: "/contacto" }]}
      />
      <Container className="py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
            <h2 className="mb-6 font-display text-xl font-bold text-palm-950">
              Escríbenos
            </h2>
            <ContactForm whatsapp={settings.whatsapp} />
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl bg-white p-6 shadow-card">
              <h2 className="font-display text-lg font-bold text-palm-950">Datos de contacto</h2>
              <ul className="mt-4 space-y-4 text-[15px] text-mist-700">
                <li className="flex items-start gap-3">
                  <WhatsappLogo size={20} weight="fill" className="mt-0.5 shrink-0 text-palm-700" />
                  <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-palm-800">
                    {settings.phone}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Phone size={20} weight="bold" className="mt-0.5 shrink-0 text-palm-700" />
                  <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="transition-colors hover:text-palm-800">
                    {settings.phone}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <EnvelopeSimple size={20} weight="bold" className="mt-0.5 shrink-0 text-palm-700" />
                  <a href={`mailto:${settings.email}`} className="break-all transition-colors hover:text-palm-800">
                    {settings.email}
                  </a>
                </li>
              </ul>
              <div className="mt-6">
                <SocialIcons
                  instagramUrl={settings.instagramUrl}
                  tiktokUrl={settings.tiktokUrl}
                  facebookUrl={settings.facebookUrl}
                  twitterUrl={settings.twitterUrl}
                />
              </div>
            </div>

            {sedes.map((sede) => (
              <div key={sede.id} className="rounded-2xl bg-white p-6 shadow-card">
                <h3 className="font-display text-[16px] font-bold text-palm-950">{sede.name}</h3>
                <p className="mt-2 flex items-start gap-2 text-sm text-mist-600">
                  <MapPin size={17} weight="bold" className="mt-0.5 shrink-0 text-palm-700" />
                  {sede.address}
                </p>
                {sede.phone ? (
                  <p className="mt-1.5 pl-6 text-sm text-mist-600">{sede.phone}</p>
                ) : null}
              </div>
            ))}
          </aside>
        </div>
      </Container>
      <PageFaqs faqs={page?.faqs} className="bg-white py-14 sm:py-20" />
      <ExtraBlocks page={page} />
    </>
  );
}
