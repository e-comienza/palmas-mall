import { requireUser, can } from "@/lib/permissions";
import { AdminPageHeader } from "@/components/admin/ui";
import { PostForm } from "../post-form";

export const metadata = { title: "Nuevo post" };

export default async function NuevoPostPage() {
  const user = await requireUser("EDITOR");
  return (
    <div>
      <AdminPageHeader title="Nuevo artículo" />
      <PostForm canPublish={can.publish(user)} />
    </div>
  );
}
