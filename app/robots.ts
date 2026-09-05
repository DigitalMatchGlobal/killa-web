import type { MetadataRoute } from "next";

import { publicSiteUrl } from "@/lib/public-url";

export default function robots(): MetadataRoute.Robots {
  const origin = publicSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/tv/panel", "/tv/panel/"],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
