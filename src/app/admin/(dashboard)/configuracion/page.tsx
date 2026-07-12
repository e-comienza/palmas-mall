import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import { getSiteSettings } from "@/lib/settings";
import { AdminPageHeader } from "@/components/admin/ui";
import { SettingsForm } from "./settings-form";
import { SedeForm } from "./sede-form";

export const metadata = { title: "Configuración" };

export default async function AdminConfiguracionPage() {
  await requireUser("SUPER_ADMIN");
  const [settings, sedes] = await Promise.all([
    getSiteSettings(),
    prisma.sede.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Configuración del sitio"
        description="Identidad, contacto, redes, SEO global y sedes. Solo Super Admin."
      />
      <SettingsForm settings={settings} />
      <div className="mt-8">
        <h2 className="mb-4 font-display text-lg font-bold text-palm-950">Sedes</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {sedes.map((sede) => (
            <SedeForm key={sede.id} sede={sede} />
          ))}
        </div>
      </div>
    </div>
  );
}
