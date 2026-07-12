import type { Metadata } from "next";
import { PageHeader } from "@/components/public/page-header";
import { Container } from "@/components/public/container";
import { PostCard } from "@/components/public/cards";
import { getPublishedPosts } from "@/lib/queries";
import { pageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("blog", "/blog");
}

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <PageHeader
        title="Blog y noticias"
        intro="Guías, novedades y todo lo que está pasando en Palmas Mall."
        crumbs={[{ name: "Blog", path: "/blog" }]}
      />
      <Container className="py-10 sm:py-14">
        {posts.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-mist-300 bg-white p-12 text-center">
            <p className="font-display text-xl font-bold text-palm-950">
              Aún no hay publicaciones
            </p>
            <p className="mt-2 text-sm text-mist-600">
              Muy pronto compartiremos noticias y novedades del mall.
            </p>
          </div>
        )}
      </Container>
    </>
  );
}
