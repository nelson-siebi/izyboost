import { useEffect } from 'react';

/**
 * SEO Component to manage page titles and meta descriptions dynamically.
 * Helps with browser tab identification and search engine indexing.
 */
const SEO = ({
    title,
    description,
    keywords,
    ogImage,
    ogType = 'website'
}) => {
    const siteName = 'IzyBoost';
    const defaultDescription = 'Boostez votre présence sur les réseaux sociaux avec les meilleurs services de SMM au Cameroun et en Afrique.';

    useEffect(() => {
        // Update Title
        const fullTitle = title ? `${title} | ${siteName}` : `${siteName} - Boostez vos Réseaux Sociaux`;
        document.title = fullTitle;

        // Update Meta Description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.name = 'description';
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', description || defaultDescription);

        // Update Open Graph Tags
        const updateOG = (property, content) => {
            if (!content) return;
            let meta = document.querySelector(`meta[property="${property}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('property', property);
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
        };

        updateOG('og:title', fullTitle);
        updateOG('og:description', description || defaultDescription);
        updateOG('og:type', ogType);
        if (ogImage) updateOG('og:image', ogImage);

        // Update Keywords
        if (keywords) {
            let metaKeywords = document.querySelector('meta[name="keywords"]');
            if (!metaKeywords) {
                metaKeywords = document.createElement('meta');
                metaKeywords.name = 'keywords';
                document.head.appendChild(metaKeywords);
            }
            metaKeywords.setAttribute('content', keywords);
        }

    }, [title, description, keywords, ogImage, ogType]);

    return null; // This component doesn't render anything
};

export default SEO;
