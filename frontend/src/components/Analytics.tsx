"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const STORAGE_KEY = "bridgestone_cookies_consent";

export default function Analytics() {
  const [consent, setConsent] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const ga4Id = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const bannerEnabled = process.env.NEXT_PUBLIC_COOKIES_BANNER_ENABLED !== "false";

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setConsent(stored);
    setIsLoaded(true);

    // Listen for consent changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setConsent(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);

    // Also check periodically for same-tab changes
    const interval = setInterval(() => {
      const current = localStorage.getItem(STORAGE_KEY);
      if (current !== consent) {
        setConsent(current);
      }
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [consent]);

  // Don't render if not loaded yet
  if (!isLoaded) {
    return null;
  }

  // If banner is disabled, always load analytics
  // If banner is enabled, only load if consent is accepted
  const shouldLoadAnalytics = !bannerEnabled || consent === "accepted";

  if (!shouldLoadAnalytics) {
    return null;
  }

  return (
    <>
      {/* Google Analytics 4 */}
      {ga4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga4Id}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      {/* Meta Pixel */}
      {metaPixelId && (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}
