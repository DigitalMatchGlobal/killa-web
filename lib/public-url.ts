import { site } from "@/lib/site";

/** URL pública canónica del deployment actual o, en producción, del dominio final. */
export function publicSiteUrl() {
  const deploymentUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL;

  if (!deploymentUrl) return site.url;
  return deploymentUrl.startsWith("http") ? deploymentUrl : `https://${deploymentUrl}`;
}
