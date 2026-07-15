import type { Metadata } from "next";
import { Media } from "@/components/public/media";
import { notFound } from "next/navigation";
import { Container } from "@/components/public/container";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { PostCard } from "@/components/public/cards";
import { Badge } from "@/components/ui/badge";
import { getPostBySlug, getPublishedPosts } from "@/lib/queries";
import { getSiteSettings } from "@/lib/settings";
import { blogPostJsonLd, JsonLdScript } from "@/lib/jsonld";
import { formatDateEs, siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Artículo no encontrado" };
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: siteUrl(`/blog/${post.slug}`) },
    openGraph: {
      title,
      description,
      type: "article",
      url: siteUrl(`/blog/${post.slug}`),
      images: post.coverUrl ? [{ url: post.coverUrl }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [settings, others] = await Promise.all([getSiteSettings(), getPublishedPosts(4)]);
  const related = others.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <>
      <JsonLdScript data={blogPostJsonLd(post, settings)} />

      <div className="bg-white pb-10 pt-10 sm:pt-14">
        <Container className="max-w-3xl">
          <Breadcrumbs
            items={[
              { name: "Blog", path: "/blog" },
              { name: post.title, path: `/blog/${post.slug}` },
            ]}
          />
          <div className="mt-5 flex items-center gap-3">
            <Badge>{post.category}</Badge>
            <span className="text-sm text-mist-500">{formatDateEs(post.publishedAt)}</span>
          </div>
          <h1 className="mt-3 font-display text-[2rem] font-bold leading-[1.1] tracking-[-0.02em] text-palm-950 sm:text-4xl">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-4 text-[15px] leading-relaxed text-mist-600 sm:text-lg">
              {post.excerpt}
            </p>
          ) : null}
          <p className="mt-4 text-sm font-semibold text-mist-700">Por {post.author}</p>
        </Container>
      </div>

      <Container className="max-w-3xl py-10">
        {post.coverUrl ? (
          <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl">
            <Media
              src={post.coverUrl}
              alt={post.title}
              fill
              mode="inline"
              priority
              sizes="(max-width: 768px) 100vw, 720px"
              className="object-cover"
            />
          </div>
        ) : null}
        <article
          className="prose-pm text-mist-700"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </Container>

      {related.length ? (
        <Container className="pb-16 sm:pb-24">
          <h2 className="mb-6 font-display text-2xl font-bold tracking-[-0.02em] text-palm-950">
            Sigue leyendo
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </Container>
      ) : null}
    </>
  );
}
