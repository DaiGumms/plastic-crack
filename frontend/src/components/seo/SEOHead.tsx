import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
  structuredData?: object;
}

const defaultProps: Required<Omit<SEOProps, 'structuredData'>> = {
  title: 'Plastic Crack - Ultimate Warhammer Collection Manager',
  description:
    'Manage your Warhammer miniatures collection with AI-powered features, price tracking, painting guides, and community features. Join the closed beta!',
  keywords:
    'warhammer, miniatures, collection, manager, 40k, age of sigmar, painting, hobby',
  image: '/images/og-image.jpg',
  url: 'https://plasticcrack.app',
  type: 'website',
  twitterCard: 'summary_large_image',
  noIndex: false,
};

// Helper function to update meta tags
const updateMetaTag = (name: string, content: string, isProperty = false) => {
  const selector = isProperty
    ? `meta[property="${name}"]`
    : `meta[name="${name}"]`;
  let meta = document.querySelector(selector) as HTMLMetaElement;

  if (!meta) {
    meta = document.createElement('meta');
    if (isProperty) {
      meta.setAttribute('property', name);
    } else {
      meta.setAttribute('name', name);
    }
    document.head.appendChild(meta);
  }

  meta.setAttribute('content', content);
};

export const SEOHead: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  twitterCard = 'summary_large_image',
  noIndex = false,
  structuredData,
}) => {
  const fullTitle = title ? `${title} | Plastic Crack` : defaultProps.title;

  const seoProps = {
    title: fullTitle,
    description: description || defaultProps.description,
    keywords: keywords || defaultProps.keywords,
    image: image || defaultProps.image,
    url: url || defaultProps.url,
    type,
    twitterCard,
    noIndex,
  };

  useEffect(() => {
    // Update document title
    document.title = seoProps.title;

    // Update meta tags
    updateMetaTag('description', seoProps.description);
    updateMetaTag('keywords', seoProps.keywords);

    if (noIndex) {
      updateMetaTag('robots', 'noindex,nofollow');
    }

    // Open Graph tags
    updateMetaTag('og:type', seoProps.type, true);
    updateMetaTag('og:url', seoProps.url, true);
    updateMetaTag('og:title', seoProps.title, true);
    updateMetaTag('og:description', seoProps.description, true);
    updateMetaTag('og:image', seoProps.image, true);
    updateMetaTag('og:site_name', 'Plastic Crack', true);

    // Twitter tags
    updateMetaTag('twitter:card', seoProps.twitterCard);
    updateMetaTag('twitter:url', seoProps.url);
    updateMetaTag('twitter:title', seoProps.title);
    updateMetaTag('twitter:description', seoProps.description);
    updateMetaTag('twitter:image', seoProps.image);

    // Structured data
    if (structuredData) {
      let script = document.querySelector(
        'script[type="application/ld+json"]'
      ) as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

    // Canonical URL
    let canonical = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = seoProps.url;
  }, [
    seoProps.title,
    seoProps.description,
    seoProps.keywords,
    seoProps.image,
    seoProps.url,
    seoProps.type,
    seoProps.twitterCard,
    noIndex,
    structuredData,
  ]);

  return null; // This component doesn't render anything visible
};

// Predefined SEO configurations for common pages
export const SEOConfigs = {
  home: {
    title: 'Ultimate Warhammer Collection Manager',
    description:
      'Manage your Warhammer miniatures collection with AI-powered features, price tracking, painting guides, and community features. Join the closed beta!',
    keywords:
      'warhammer, miniatures, collection, manager, 40k, age of sigmar, painting, hobby, beta',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Plastic Crack',
      description: 'Ultimate Warhammer collection management platform',
      url: 'https://plasticcrack.app',
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web, iOS, Android',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  },

  betaInterest: {
    title: 'Join the Closed Beta',
    description:
      'Get early access to Plastic Crack and be among the first to experience the future of Warhammer collection management.',
    keywords:
      'beta, early access, warhammer, collection manager, closed beta, signup',
  },

  login: {
    title: 'Sign In',
    description:
      'Sign in to your Plastic Crack account to manage your Warhammer collection.',
    noIndex: true,
  },

  register: {
    title: 'Create Account',
    description:
      'Create your free Plastic Crack account and start managing your Warhammer collection today.',
    keywords: 'signup, register, create account, warhammer, collection manager',
  },

  profile: {
    title: 'My Profile',
    description: 'Manage your Plastic Crack profile settings and preferences.',
    noIndex: true,
  },

  dashboard: {
    title: 'Dashboard',
    description:
      'Your Plastic Crack dashboard - overview of your collection, recent activity, and quick actions.',
    noIndex: true,
  },
} as const;
