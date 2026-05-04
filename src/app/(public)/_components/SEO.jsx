import { Helmet } from "react-helmet-async";

const SITE_URL = "https://crystalaura.lovable.app";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

/**
 * Per-page SEO component. Drop near the top of any page.
 */
const SEO = ({
  title,
  description,
  path = "",
  image = DEFAULT_IMAGE,
  type = "website",
  jsonLd,
  noindex = false,
}) => {
  const fullTitle = title ? `${title} | CrystalAura` : "CrystalAura — Authentic Healing Crystals & Gemstones";
  const url = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEO;
