import { requireUser } from "@/lib/permissions";
import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata = {
  title: { default: "Admin | Palmas Mall", template: "%s | Admin Palmas Mall" },
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser("EDITOR");

  return (
    <div className="flex min-h-[100dvh] bg-mist-100">
      <AdminSidebar user={{ name: user.name, email: user.email, role: user.role }} />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-4 pb-16 pt-20 sm:px-8 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}
