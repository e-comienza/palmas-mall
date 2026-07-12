import { requireUser, can } from "@/lib/permissions";
import { AdminPageHeader } from "@/components/admin/ui";
import { PageForm } from "../page-form";

export const metadata = { title: "Nueva página" };

export default async function NuevaPaginaPage() {
  const user = await requireUser("EDITOR");
  return (
    <div>
      <AdminPageHeader
        title="Nueva página"
        description="Las páginas nuevas se publican en /<slug> y se arman con bloques."
      />
      <PageForm canPublish={can.publish(user)} />
    </div>
  );
}
