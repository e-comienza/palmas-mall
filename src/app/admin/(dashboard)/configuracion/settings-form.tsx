"use client";

import { useActionState, useState } from "react";
import type { SiteSettings } from "@prisma/client";
import { updateSettings } from "@/app/admin/_actions/misc";
import {
  Field,
  FormStateHandler,
  SubmitButton,
  initialFormState,
} from "@/components/admin/form-helpers";
import { AdminCard } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/image-upload";
import { BrochurePreview } from "./brochure-preview";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action] = useActionState(updateSettings, initialFormState);
  // Se rellenan solos al subir el PDF (Cloudinary devuelve el nº de páginas).
  const [pdfPages, setPdfPages] = useState(settings.sponsorPdfPages);
  const [pdfUrl, setPdfUrl] = useState(settings.sponsorPdfUrl);

  return (
    <form action={action} className="space-y-6">
      <FormStateHandler state={state} />

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard title="Identidad">
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nombre del mall" htmlFor="mallName">
                <Input id="mallName" name="mallName" defaultValue={settings.mallName} />
              </Field>
              <Field label="Slogan" htmlFor="tagline">
                <Input id="tagline" name="tagline" defaultValue={settings.tagline} />
              </Field>
            </div>
            <ImageUpload name="logoUrl" label="Logo principal" defaultValue={settings.logoUrl} folder="brand" aspect="aspect-video max-w-[240px]" />
            <ImageUpload name="logoAltUrl" label="Logo alternativo (footer / fondos oscuros)" defaultValue={settings.logoAltUrl} folder="brand" aspect="aspect-video max-w-[240px]" />
            <ImageUpload name="sloganImageUrl" label="Imagen del slogan (se muestra en el home, no en el navbar)" defaultValue={settings.sloganImageUrl} folder="brand" aspect="aspect-[8/1] max-w-[360px]" />
            <ImageUpload name="faviconUrl" label="Favicon" defaultValue={settings.faviconUrl} folder="brand" aspect="aspect-square max-w-[100px]" />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Color principal" htmlFor="primaryColor">
                <div className="flex items-center gap-2">
                  <input type="color" name="primaryColor" id="primaryColor" defaultValue={settings.primaryColor} className="h-11 w-14 cursor-pointer rounded-lg border border-mist-300 bg-white" />
                  <span className="text-sm text-mist-600">{settings.primaryColor}</span>
                </div>
              </Field>
              <Field label="Color acento" htmlFor="accentColor">
                <div className="flex items-center gap-2">
                  <input type="color" name="accentColor" id="accentColor" defaultValue={settings.accentColor} className="h-11 w-14 cursor-pointer rounded-lg border border-mist-300 bg-white" />
                  <span className="text-sm text-mist-600">{settings.accentColor}</span>
                </div>
              </Field>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Contacto y redes">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Teléfono" htmlFor="phone">
              <Input id="phone" name="phone" defaultValue={settings.phone} />
            </Field>
            <Field label="WhatsApp (dígitos con país)" htmlFor="whatsapp">
              <Input id="whatsapp" name="whatsapp" defaultValue={settings.whatsapp} />
            </Field>
            <Field label="Email" htmlFor="email">
              <Input id="email" name="email" type="email" defaultValue={settings.email} />
            </Field>
            <Field label="Dirección" htmlFor="address">
              <Input id="address" name="address" defaultValue={settings.address} />
            </Field>
            <Field label="Horario general" htmlFor="openingHours" className="sm:col-span-2">
              <Input id="openingHours" name="openingHours" defaultValue={settings.openingHours} />
            </Field>
            <Field label="Instagram" htmlFor="instagramUrl">
              <Input id="instagramUrl" name="instagramUrl" defaultValue={settings.instagramUrl} />
            </Field>
            <Field label="Facebook" htmlFor="facebookUrl">
              <Input id="facebookUrl" name="facebookUrl" defaultValue={settings.facebookUrl} />
            </Field>
            <Field label="TikTok" htmlFor="tiktokUrl">
              <Input id="tiktokUrl" name="tiktokUrl" defaultValue={settings.tiktokUrl} />
            </Field>
            <Field label="X / Twitter" htmlFor="twitterUrl">
              <Input id="twitterUrl" name="twitterUrl" defaultValue={settings.twitterUrl} />
            </Field>
            <Field label="Waze" htmlFor="wazeUrl">
              <Input id="wazeUrl" name="wazeUrl" defaultValue={settings.wazeUrl} />
            </Field>
            <Field label="Google Maps" htmlFor="googleMapsUrl">
              <Input id="googleMapsUrl" name="googleMapsUrl" defaultValue={settings.googleMapsUrl} />
            </Field>
          </div>
        </AdminCard>

        <AdminCard title="SEO global">
          <div className="space-y-5">
            <Field label="Plantilla de títulos" htmlFor="seoTitleTemplate" hint="%s se reemplaza por el título de cada página">
              <Input id="seoTitleTemplate" name="seoTitleTemplate" defaultValue={settings.seoTitleTemplate} />
            </Field>
            <Field label="Título por defecto" htmlFor="seoDefaultTitle">
              <Input id="seoDefaultTitle" name="seoDefaultTitle" defaultValue={settings.seoDefaultTitle} />
            </Field>
            <Field label="Descripción por defecto" htmlFor="seoDefaultDesc">
              <Textarea id="seoDefaultDesc" name="seoDefaultDesc" defaultValue={settings.seoDefaultDesc} className="min-h-[70px]" />
            </Field>
            <ImageUpload name="ogImageUrl" label="Imagen OG por defecto" defaultValue={settings.ogImageUrl} folder="brand" />
          </div>
        </AdminCard>

        <AdminCard title="Molly, la mascota">
          <div className="space-y-5">
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-mist-800">Mostrar a Molly en el sitio</span>
              <Switch name="mollyEnabled" defaultChecked={settings.mollyEnabled} />
            </label>
            <ImageUpload
              name="mollyImageUrl"
              label="Imagen o GIF de Molly"
              defaultValue={settings.mollyImageUrl}
              folder="brand"
              aspect="aspect-square max-w-[140px]"
              allowUrl
            />
            <p className="-mt-3 text-[12px] text-mist-500">
              Acepta PNG/WebP, GIF animado o un link de Giphy (se convierte solo a .gif).
            </p>
            <Field label="Mensaje de bienvenida" htmlFor="mollyMessage">
              <Textarea id="mollyMessage" name="mollyMessage" defaultValue={settings.mollyMessage} className="min-h-[60px]" maxLength={180} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Texto del botón" htmlFor="mollyCtaLabel">
                <Input id="mollyCtaLabel" name="mollyCtaLabel" defaultValue={settings.mollyCtaLabel} />
              </Field>
              <Field label="Enlace del botón" htmlFor="mollyCtaUrl">
                <Input id="mollyCtaUrl" name="mollyCtaUrl" defaultValue={settings.mollyCtaUrl} placeholder="/play-zone" />
              </Field>
            </div>
            <div className="flex items-center gap-8">
              <label className="flex items-center gap-3">
                <span className="text-sm font-semibold text-mist-800">En móvil</span>
                <Switch name="mollyShowMobile" defaultChecked={settings.mollyShowMobile} />
              </label>
              <label className="flex items-center gap-3">
                <span className="text-sm font-semibold text-mist-800">En desktop</span>
                <Switch name="mollyShowDesktop" defaultChecked={settings.mollyShowDesktop} />
              </label>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Avanzado">
          <div className="space-y-5">
            <Field label="Banner global" htmlFor="globalBannerText" hint="Mensaje que aparece arriba de todo el sitio">
              <Input id="globalBannerText" name="globalBannerText" defaultValue={settings.globalBannerText} />
            </Field>
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-mist-800">Banner activo</span>
              <Switch name="globalBannerActive" defaultChecked={settings.globalBannerActive} />
            </label>
            <Field label="Scripts externos permitidos" htmlFor="externalScripts" hint="Uno por línea (ej. Google Analytics). Se documentan; requieren implementación técnica.">
              <Textarea id="externalScripts" name="externalScripts" defaultValue={settings.externalScripts} className="min-h-[70px] font-mono text-[13px]" />
            </Field>
          </div>
        </AdminCard>

        <AdminCard title="WhatsApp y Be Our Sponsors">
          <div className="space-y-5">
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-mist-800">Mostrar burbuja flotante de WhatsApp</span>
              <Switch name="whatsappBubbleEnabled" defaultChecked={settings.whatsappBubbleEnabled} />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="WhatsApp alquiler de local" htmlFor="rentalWhatsapp" hint="Dígitos con país (página Contacto)">
                <Input id="rentalWhatsapp" name="rentalWhatsapp" defaultValue={settings.rentalWhatsapp} />
              </Field>
              <Field label="WhatsApp Be Our Sponsors" htmlFor="sponsorWhatsapp" hint="Dígitos con país">
                <Input id="sponsorWhatsapp" name="sponsorWhatsapp" defaultValue={settings.sponsorWhatsapp} />
              </Field>
            </div>
            <ImageUpload
              name="sponsorPdfUrl"
              label="Brochure de sponsors (PDF)"
              defaultValue={settings.sponsorPdfUrl}
              folder="sponsors"
              aspect="aspect-[4/3] max-w-[240px]"
              allowPdf
              allowUrl
              onChange={(url, meta) => {
                setPdfUrl(url);
                if (!url) setPdfPages(0);
                else if (meta?.pages) setPdfPages(meta.pages);
              }}
            />
            <p className="-mt-3 text-[13px] text-mist-500">
              Sube el PDF (máx. 20 MB) y la página Be Our Sponsors lo muestra hoja por hoja, con
              enlace para descargarlo. Las hojas se cuentan solas al guardar. Si pegas una URL
              externa (no subida aquí) solo queda el enlace de descarga.
            </p>
            <div className="grid gap-5 sm:grid-cols-[140px_1fr]">
              <Field label="Hojas del PDF" htmlFor="sponsorPdfPages" hint="0 = se detecta al guardar">
                <Input
                  id="sponsorPdfPages"
                  name="sponsorPdfPages"
                  type="number"
                  min={0}
                  max={200}
                  value={pdfPages}
                  onChange={(e) => setPdfPages(Number(e.target.value) || 0)}
                />
              </Field>
              <Field label="Título de la sección" htmlFor="sponsorPdfHeading">
                <Input id="sponsorPdfHeading" name="sponsorPdfHeading" defaultValue={settings.sponsorPdfHeading} />
              </Field>
            </div>
            <Field label="Texto de la sección" htmlFor="sponsorPdfIntro">
              <Textarea id="sponsorPdfIntro" name="sponsorPdfIntro" defaultValue={settings.sponsorPdfIntro} className="min-h-[70px]" />
            </Field>
            <BrochurePreview url={pdfUrl} pages={pdfPages} />
            <ImageUpload
              name="sponsorVideoUrl"
              label="Video Be Our Sponsors (vertical)"
              defaultValue={settings.sponsorVideoUrl}
              folder="sponsors"
              aspect="aspect-[9/16] max-w-[200px]"
              allowUrl
            />
            <p className="-mt-3 text-[13px] text-mist-500">
              Se ve en la página Be Our Sponsors. Sube un MP4 o WebM vertical (máx. 100 MB) o pega
              la URL del video. Con la X quitas el actual y la sección desaparece del sitio.
            </p>
          </div>
        </AdminCard>

        <AdminCard title="Bloque “Quieres tu marca en Palmas Mall”">
          <div className="space-y-5">
            <p className="text-[13px] text-mist-500">
              Sale en Contacto y en Plano del mall, con el WhatsApp de alquiler de local. Deja el
              título y el texto vacíos para quitar el bloque del sitio.
            </p>
            <Field label="Título" htmlFor="rentalCtaTitle">
              <Input id="rentalCtaTitle" name="rentalCtaTitle" defaultValue={settings.rentalCtaTitle} />
            </Field>
            <Field label="Texto" htmlFor="rentalCtaText">
              <Textarea id="rentalCtaText" name="rentalCtaText" defaultValue={settings.rentalCtaText} className="min-h-[80px]" />
            </Field>
            <Field label="Texto del botón" htmlFor="rentalCtaLabel" hint="Vacío = sin botón">
              <Input id="rentalCtaLabel" name="rentalCtaLabel" defaultValue={settings.rentalCtaLabel} />
            </Field>
          </div>
        </AdminCard>

        <AdminCard title="Plano del mall">
          <div className="space-y-3">
            <ImageUpload
              name="planoImageUrl"
              label="Plano (imagen o PDF)"
              defaultValue={settings.planoImageUrl}
              folder="plano"
              aspect="aspect-[4/3] max-w-[360px]"
              allowPdf
              allowUrl
            />
            <p className="text-[13px] text-mist-500">
              Sube el plano como imagen (PNG/WebP) o PDF. Si subes un PDF, se muestra la primera página. Se ve en el Directorio y en la página Plano del mall.
            </p>
          </div>
        </AdminCard>
      </div>

      <div className="flex justify-end">
        <SubmitButton>Guardar configuración</SubmitButton>
      </div>
    </form>
  );
}
