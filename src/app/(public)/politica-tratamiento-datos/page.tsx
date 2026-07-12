import type { Metadata } from "next";
import { PageHeader } from "@/components/public/page-header";
import { Container } from "@/components/public/container";
import { getPage } from "@/lib/queries";
import { getSiteSettings } from "@/lib/settings";
import { pageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("politica-tratamiento-datos", "/politica-tratamiento-datos");
}

export default async function PoliticaPage() {
  const [page, settings] = await Promise.all([
    getPage("politica-tratamiento-datos"),
    getSiteSettings(),
  ]);

  const richText = page?.blocks.find((b) => b.type === "RICH_TEXT");
  const customBody = (richText?.data as { body?: string } | undefined)?.body;

  return (
    <>
      <PageHeader
        title="Política de tratamiento de datos"
        crumbs={[{ name: "Política de datos", path: "/politica-tratamiento-datos" }]}
      />
      <Container className="max-w-3xl py-10 sm:py-14">
        {customBody ? (
          <div className="prose-pm text-mist-700" dangerouslySetInnerHTML={{ __html: customBody }} />
        ) : (
          <div className="prose-pm text-mist-700">
            <p>
              En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013,
              {" "}{settings.mallName}® informa a sus visitantes, clientes y
              proveedores la política aplicable al tratamiento de sus datos
              personales.
            </p>
            <h2>Responsable del tratamiento</h2>
            <p>
              {settings.mallName}®, {settings.address}. Correo electrónico:{" "}
              {settings.email}. Teléfono: {settings.phone}.
            </p>
            <h2>Finalidades</h2>
            <ul>
              <li>Atender peticiones, quejas, reclamos y sugerencias (PQRS).</li>
              <li>Enviar información sobre eventos, promociones y novedades del mall.</li>
              <li>Gestionar relaciones comerciales con marcas, locatarios y patrocinadores.</li>
              <li>Cumplir obligaciones legales y contractuales.</li>
            </ul>
            <h2>Derechos del titular</h2>
            <p>
              Como titular de los datos puedes conocer, actualizar, rectificar y
              solicitar la supresión de tus datos personales, así como revocar
              la autorización otorgada, escribiendo a {settings.email}.
            </p>
            <h2>Vigencia</h2>
            <p>
              Los datos serán tratados durante el tiempo necesario para cumplir
              las finalidades descritas o mientras exista una relación con el
              titular.
            </p>
            <p>
              <em>
                [Contenido de ejemplo: reemplaza este texto por la política
                oficial de Palmas Mall desde el panel de administración.]
              </em>
            </p>
          </div>
        )}
      </Container>
    </>
  );
}
