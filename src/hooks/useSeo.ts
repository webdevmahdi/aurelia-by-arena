import { useEffect } from 'react';

type SeoOptions = {
  title: string;
  description: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  structuredData?: Record<string, unknown>;
};

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'http://localhost:5173').replace(
  /\/+$/,
  ''
);

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export function useSeo({
  title,
  description,
  canonicalPath = '/',
  ogImage = '/media/hero-sanctuary.jpg',
  ogType = 'website',
  structuredData,
}: SeoOptions) {
  useEffect(() => {
    const fullTitle = title.includes('Aurelia')
      ? title
      : `${title} — Aurelia Developments`;
    document.title = fullTitle;

    const canonicalUrl = `${SITE_URL}${
      canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`
    }`;
    const absoluteImage = ogImage.startsWith('http')
      ? ogImage
      : `${SITE_URL}${ogImage.startsWith('/') ? ogImage : `/${ogImage}`}`;

    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:image', absoluteImage);
    upsertMeta('property', 'og:type', ogType);

    let canonicalLink = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]'
    );
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    let ldScript = document.head.querySelector<HTMLScriptElement>(
      'script[data-aurelia-ld="true"]'
    );
    if (structuredData) {
      if (!ldScript) {
        ldScript = document.createElement('script');
        ldScript.type = 'application/ld+json';
        ldScript.setAttribute('data-aurelia-ld', 'true');
        document.head.appendChild(ldScript);
      }
      ldScript.textContent = JSON.stringify(structuredData);
    } else if (ldScript) {
      ldScript.remove();
    }
  }, [title, description, canonicalPath, ogImage, ogType, structuredData]);
}
