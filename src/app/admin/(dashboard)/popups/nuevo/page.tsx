import { requireUser } from "@/lib/permissions";
import { AdminPageHeader } from "@/components/admin/ui";
import { PopupForm } from "../popup-form";

export const metadata = { title: "Nuevo popup" };

export default async function NuevoPopupPage() {
  await requireUser("ADMIN");
  return (
    <div>
      <AdminPageHeader title="Nuevo popup" />
      <PopupForm />
    </div>
  );
}
