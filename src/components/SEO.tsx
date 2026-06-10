import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  noindex?: boolean;
}

const SITE_NAME = "Sandal";
const DEFAULT_TITLE = "Sandal — Discover Egypt. Slowly.";
const DEFAULT_DESCRIPTION =
  "Explore authentic rural Egypt through local experiences, audio tours, stays, and trips — all curated by community ambassadors.";
const DEFAULT_IMAGE = "https://sandaler-egypt-slowly.lovable.app/og-image.png";
const BASE_URL = "https://sandaler-egypt-slowly.lovable.app";

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = "website",
  noindex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const canonical = url ? `${BASE_URL}${url}` : BASE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonical} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* hreflang alternates */}
      <link rel="alternate" hrefLang="en" href={canonical} />
      <link rel="alternate" hrefLang="ar" href={`${canonical}?lang=ar`} />
      <link rel="alternate" hrefLang="x-default" href={canonical} />
    </Helmet>
  );
}
