import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser, can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui";
import { PostForm } from "../post-form";

export const metadata = { title: "Editar post" };

export default async function EditarPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser("EDITOR");
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post || post.deletedAt) notFound();

  return (
    <div>
      <AdminPageHeader title={`Editar: ${post.title}`}>
        <Link
          href={`/blog/${post.slug}`}
          target="_blank"
          className="pressable inline-flex h-10 items-center rounded-full border border-mist-300 bg-white px-5 text-sm font-semibold text-mist-700 hover:bg-mist-100"
        >
          Ver en el sitio ↗
        </Link>
      </AdminPageHeader>
      <PostForm post={post} canPublish={can.publish(user)} />
    </div>
  );
}
