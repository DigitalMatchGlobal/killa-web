import type { MetadataRoute } from "next";

import { getCategories, getPublishedSlugs } from "@/lib/editorial/queries";
import { publicSiteUrl } from "@/lib/public-url";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = publicSiteUrl();
  const [slugs, categories] = await Promise.all([getPublishedSlugs(), getCategories()]);

  return [
    { url: origin, changeFrequency: "monthly", priority: 1 },
    { url: `${origin}/tv`, changeFrequency: "daily", priority: 0.9 },
    ...categories.map((category) => ({
      url: `${origin}/tv/categoria/${category.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...slugs.map((slug) => ({
      url: `${origin}/tv/noticias/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
