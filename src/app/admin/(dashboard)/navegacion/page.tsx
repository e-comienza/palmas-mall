import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import { AdminPageHeader } from "@/components/admin/ui";
import { MenuEditor } from "./menu-editor";

export const metadata = { title: "Navegación" };

export default async function AdminNavegacionPage() {
  await requireUser("ADMIN");
  const menus = await prisma.navigationMenu.findMany({
    include: {
      items: { where: { parentId: null }, orderBy: { order: "asc" } },
    },
  });

  return (
    <div>
      <AdminPageHeader
        title="Menús y navegación"
        description="Edita los ítems del menú principal y del footer: etiquetas, URLs y orden."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {menus.map((menu) => (
          <MenuEditor
            key={menu.id}
            menuId={menu.id}
            menuName={menu.name}
            defaultItems={menu.items.map((i) => ({
              label: i.label,
              url: i.url,
              visible: i.visible,
            }))}
          />
        ))}
      </div>
    </div>
  );
}
