import { Helmet } from 'react-helmet-async';

/**
 * SEO Component to manage page titles and meta descriptions dynamically.
 * Helps with browser tab identification and search engine indexing.
 */
const SEO = ({
    title,
    description,
    keywords,
    ogImage = '/logo1.png',
    ogType = 'website',
    canonicalUrl,
    children
}) => {
    const siteName = 'Elite Boost';
    const defaultDescription = 'Boostez votre présence sur les réseaux sociaux avec les meilleurs services de SMM en Afrique.';
    const fullTitle = title ? `${title} | ${siteName}` : `${siteName} - #1 SMM Portal`;
    const metaDescription = description || defaultDescription;

    const currentUrl = canonicalUrl || window.location.href;

    const schemaOrgJSONLD = [
        {
            '@context': 'http://schema.org',
            '@type': 'WebSite',
            url: window.location.origin,
            name: siteName,
            alternateName: 'Elite Boost Africa',
        }
    ];

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            {keywords && <meta name="keywords" content={keywords} />}
            <link rel="canonical" href={currentUrl} />

            {/* Open Graph Tags */}
            <meta property="og:type" content={ogType} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter Card Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={ogImage} />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(schemaOrgJSONLD)}
            </script>

            {children}
        </Helmet>
    );
};

export default SEO;
